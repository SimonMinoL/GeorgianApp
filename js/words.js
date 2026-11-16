import { state, save, categories, setOverride, clearOverride } from './storage.js';
import { ALPHABET } from './data.js';
import { esc, $, $$, uid } from './util.js';
import { freqCategories, FREQ_WORDS } from './frequency.js';
import { NUMBER_WORDS } from './numbers.js';

let tab = 'words';
let editing = null; // null = list, 'new' or an id = form
let query = '';

const TABS = [['words', () => `My words (${state.words.length})`], ['frequency', () => 'Frequency'], ['numbers', () => 'Numbers'], ['alphabet', () => 'Alphabet']];
const sourceFor = t => ({ words: state.words, frequency: FREQ_WORDS, numbers: NUMBER_WORDS })[t];
const findWord = id => [...state.words, ...FREQ_WORDS, ...NUMBER_WORDS].find(x => x.id === id);
const isBuiltin = w => !state.words.includes(w);

export function render(root) {
  if (editing) return editing.startsWith('a:') ? renderAlphabetForm(root) : renderForm(root);
  root.innerHTML = `
    <h1>Words</h1>
    <div class="row wrap" style="margin-bottom:12px">
      ${TABS.map(([id, label]) => `<button class="chip ${tab === id ? 'on' : ''}" data-tab="${id}">${label()}</button>`).join('')}
    </div>
    <div id="body"></div>`;
  $$('[data-tab]', root).forEach(b => b.onclick = () => { tab = b.dataset.tab; render(root); });
  tab === 'alphabet' ? renderAlphabet(root) : renderList(root);
}

function renderList(root) {
  const body = $('#body', root);
  const mine = tab === 'words';
  body.innerHTML = `
    ${mine ? '<button class="btn block" id="add" style="margin-bottom:12px">+ Add word</button>' : '<p class="muted" style="margin-bottom:8px">Built-in list. Tap Edit to fix spellings or translations, even before you unlock them.</p>'}
    <input id="search" placeholder="Search…" value="${esc(query)}">
    <div class="card" id="list"></div>`;
  if (mine) $('#add', root).onclick = () => { editing = 'new'; render(root); };
  const draw = () => {
    const q = query.toLowerCase();
    const words = sourceFor(tab).filter(w => !q || [w.ka, w.roman, w.en, w.category].some(f => (f || '').toLowerCase().includes(q)));
    $('#list', root).innerHTML = words.map(w => `
      <div class="list-item row between" data-id="${w.id}">
        <div><span class="ka">${esc(w.ka)}</span> <span class="muted">${esc(w.roman)}</span>${w.fromFrequency ? ' <span class="muted">· from frequency list</span>' : ''}${state.overrides[w.id] ? ' <span class="muted">· edited</span>' : ''}
          <div>${esc(w.en)} ${w.category ? `<span class="muted">· ${esc(w.category)}</span>` : ''}</div></div>
        <button class="btn secondary small" data-edit="${w.id}">Edit</button>
      </div>`).join('') || '<span class="muted">Nothing here yet.</span>';
    $$('[data-edit]', root).forEach(b => b.onclick = () => { editing = b.dataset.edit; render(root); });
  };
  $('#search', root).oninput = e => { query = e.target.value; draw(); };
  draw();
}

function renderForm(root) {
  const isNew = editing === 'new';
  const w = isNew ? { ka: '', roman: '', en: '', category: '', sentence: '', sentenceEn: '' } : findWord(editing);
  const builtin = !isNew && isBuiltin(w);
  const f = (id, label, val, extra = '') => `<label>${label}</label><input id="${id}" value="${esc(val)}" autocomplete="off" ${extra}>`;
  const allCats = [...new Set([...categories(), ...freqCategories()])].sort();
  root.innerHTML = `
    <h1>${isNew ? 'Add word' : 'Edit word'}</h1>
    <div class="card">
      ${f('ka', 'Georgian *', w.ka, 'lang="ka"')}
      ${f('roman', 'Latin spelling (as Georgians type it) *', w.roman, 'autocapitalize="off"')}
      ${f('en', 'English translation * (use / for alternatives)', w.en)}
      <label>Category</label>
      <div class="row wrap" id="catpick" style="margin-bottom:10px">
        ${allCats.map(c => `<label class="chip ${c === w.category ? 'on' : ''}" style="margin:0"><input type="radio" name="cat" value="${esc(c)}" ${c === w.category ? 'checked' : ''} style="display:none">${esc(c)}</label>`).join('')}
      </div>
      <input id="newcat" placeholder="…or type a new category" autocomplete="off">
      <input type="hidden" id="category" value="${esc(w.category)}">
      ${f('sentence', 'Example sentence (Georgian)', w.sentence, 'lang="ka"')}
      ${f('sentenceEn', 'Sentence translation', w.sentenceEn)}
      <p class="muted" id="err"></p>
      <div class="row">
        <button class="btn" id="save" style="flex:1">Save</button>
        <button class="btn secondary" id="cancel">Cancel</button>
      </div>
      ${isNew || builtin ? '' : '<button class="btn danger block" id="del" style="margin-top:12px">Delete word</button>'}
      ${builtin && state.overrides[w.id] ? '<button class="btn secondary block" id="reset" style="margin-top:12px">Reset to original</button>' : ''}
    </div>`;
  const val = id => $('#' + id, root).value.trim();
  $$('#catpick input', root).forEach(r => r.onchange = () => {
    $('#category', root).value = r.value;
    $('#newcat', root).value = '';
    $$('#catpick .chip', root).forEach(c => c.classList.toggle('on', c.contains(r) && r.checked));
  });
  $('#newcat', root).oninput = () => {
    $$('#catpick input', root).forEach(r => { r.checked = false; r.parentElement.classList.remove('on'); });
    $('#category', root).value = $('#newcat', root).value;
  };
  $('#cancel', root).onclick = () => { editing = null; render(root); };
  $('#save', root).onclick = () => {
    const data = { ka: val('ka'), roman: val('roman'), en: val('en'), category: val('category').toLowerCase(), sentence: val('sentence'), sentenceEn: val('sentenceEn') };
    if (!data.ka || !data.roman || !data.en) { $('#err', root).textContent = 'Georgian, pronunciation and English are required.'; return; }
    if (builtin) setOverride(w.id, data);
    else {
      if (isNew) state.words.unshift({ id: uid(), ...data }); else Object.assign(w, data);
      save();
    }
    editing = null;
    render(root);
  };
  const reset = $('#reset', root);
  if (reset) reset.onclick = () => {
    clearOverride(w.id);
    editing = null;
    render(root);
  };
  const del = $('#del', root);
  if (del) del.onclick = () => {
    if (!confirm('Delete this word?')) return;
    state.words = state.words.filter(x => x.id !== w.id);
    save();
    editing = null;
    render(root);
  };
}

function renderAlphabet(root) {
  $('#body', root).innerHTML = `
    <p class="muted" style="margin-bottom:8px">Edit a letter's sound, name and example word. The example shows after you answer an alphabet card.</p>
    <div class="card">${ALPHABET.map(l => `
      <div class="list-item row between">
        <div><span class="ka">${esc(l.char)}</span> <b>${esc(l.sound)}</b> <span class="muted">${esc(l.name)}${state.overrides['a:' + l.char] ? ' · edited' : ''}</span>
          <div class="muted">${esc(state.alphabetExamples[l.char] || '')}</div></div>
        <button class="btn secondary small" data-edit="a:${esc(l.char)}">Edit</button>
      </div>`).join('')}</div>`;
  $$('[data-edit]', root).forEach(b => b.onclick = () => { editing = b.dataset.edit; render(root); });
}

function renderAlphabetForm(root) {
  const l = ALPHABET.find(x => 'a:' + x.char === editing);
  root.innerHTML = `
    <h1>Edit letter <span class="ka">${esc(l.char)}</span></h1>
    <div class="card">
      <label>Sound (shown in quizzes)</label><input id="sound" value="${esc(l.sound)}" autocomplete="off" autocapitalize="off">
      <label>Name</label><input id="name" value="${esc(l.name)}" autocomplete="off" autocapitalize="off">
      <label>Example word</label><input id="example" value="${esc(state.alphabetExamples[l.char] || '')}" lang="ka" autocomplete="off">
      <p class="muted" id="err"></p>
      <div class="row">
        <button class="btn" id="save" style="flex:1">Save</button>
        <button class="btn secondary" id="cancel">Cancel</button>
      </div>
      ${state.overrides[editing] ? '<button class="btn secondary block" id="reset" style="margin-top:12px">Reset sound and name to original</button>' : ''}
    </div>`;
  const done = () => { editing = null; render(root); };
  $('#cancel', root).onclick = done;
  $('#save', root).onclick = () => {
    const sound = $('#sound', root).value.trim(), name = $('#name', root).value.trim();
    if (!sound) { $('#err', root).textContent = 'Sound is required.'; return; }
    const ex = $('#example', root).value.trim();
    ex ? state.alphabetExamples[l.char] = ex : delete state.alphabetExamples[l.char];
    setOverride(editing, { sound, name });
    done();
  };
  const reset = $('#reset', root);
  if (reset) reset.onclick = () => { clearOverride(editing); done(); };
}
