import { state, save, categories } from './storage.js';
import { ALPHABET } from './data.js';
import { esc, $, $$, uid } from './util.js';

let tab = 'words';
let editing = null; // null = list, 'new' or word id = form
let query = '';

export function render(root) {
  if (editing) return renderForm(root);
  root.innerHTML = `
    <h1>Words</h1>
    <div class="row wrap" style="margin-bottom:12px">
      <button class="chip ${tab === 'words' ? 'on' : ''}" data-tab="words">Words (${state.words.length})</button>
      <button class="chip ${tab === 'alphabet' ? 'on' : ''}" data-tab="alphabet">Alphabet</button>
    </div>
    <div id="body"></div>`;
  $$('[data-tab]', root).forEach(b => b.onclick = () => { tab = b.dataset.tab; render(root); });
  tab === 'words' ? renderList(root) : renderAlphabet(root);
}

function renderList(root) {
  const body = $('#body', root);
  body.innerHTML = `
    <button class="btn block" id="add" style="margin-bottom:12px">+ Add word</button>
    <input id="search" placeholder="Search…" value="${esc(query)}">
    <div class="card" id="list"></div>`;
  $('#add', root).onclick = () => { editing = 'new'; render(root); };
  const draw = () => {
    const q = query.toLowerCase();
    const words = state.words.filter(w => !q || [w.ka, w.roman, w.en, w.category].some(f => (f || '').toLowerCase().includes(q)));
    $('#list', root).innerHTML = words.map(w => `
      <div class="list-item row between" data-id="${w.id}">
        <div><span class="ka">${esc(w.ka)}</span> <span class="muted">${esc(w.roman)}</span>
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
  const w = isNew ? { ka: '', roman: '', en: '', category: '', sentence: '', sentenceEn: '' } : state.words.find(x => x.id === editing);
  const f = (id, label, val, extra = '') => `<label>${label}</label><input id="${id}" value="${esc(val)}" autocomplete="off" ${extra}>`;
  root.innerHTML = `
    <h1>${isNew ? 'Add word' : 'Edit word'}</h1>
    <div class="card">
      ${f('ka', 'Georgian *', w.ka, 'lang="ka"')}
      ${f('roman', 'Pronunciation (English letters) *', w.roman, 'autocapitalize="off"')}
      ${f('en', 'English translation * (use / for alternatives)', w.en)}
      <label>Category</label>
      <input id="category" list="cats" value="${esc(w.category)}" autocomplete="off">
      <datalist id="cats">${categories().map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      ${f('sentence', 'Example sentence (Georgian)', w.sentence, 'lang="ka"')}
      ${f('sentenceEn', 'Sentence translation', w.sentenceEn)}
      <p class="muted" id="err"></p>
      <div class="row">
        <button class="btn" id="save" style="flex:1">Save</button>
        <button class="btn secondary" id="cancel">Cancel</button>
      </div>
      ${isNew ? '' : '<button class="btn danger block" id="del" style="margin-top:12px">Delete word</button>'}
    </div>`;
  const val = id => $('#' + id, root).value.trim();
  $('#cancel', root).onclick = () => { editing = null; render(root); };
  $('#save', root).onclick = () => {
    const data = { ka: val('ka'), roman: val('roman'), en: val('en'), category: val('category').toLowerCase(), sentence: val('sentence'), sentenceEn: val('sentenceEn') };
    if (!data.ka || !data.roman || !data.en) { $('#err', root).textContent = 'Georgian, pronunciation and English are required.'; return; }
    if (isNew) state.words.unshift({ id: uid(), ...data }); else Object.assign(w, data);
    save();
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
    <p class="muted" style="margin-bottom:8px">Add an example word per letter. It shows after you answer an alphabet card.</p>
    <div class="card">${ALPHABET.map(l => `
      <div class="list-item">
        <div class="row"><span class="ka" style="width:36px">${esc(l.char)}</span><b style="width:44px">${esc(l.sound)}</b>
        <input data-char="${esc(l.char)}" placeholder="e.g. ახალი – new" value="${esc(state.alphabetExamples[l.char] || '')}" lang="ka" style="margin:0"></div>
      </div>`).join('')}</div>`;
  $$('[data-char]', root).forEach(inp => inp.onchange = () => {
    const v = inp.value.trim();
    v ? state.alphabetExamples[inp.dataset.char] = v : delete state.alphabetExamples[inp.dataset.char];
    save();
  });
}
