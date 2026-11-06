import { state, categories } from './storage.js';
import { ALPHABET } from './data.js';
import { pickSmart, pickRandom, pickFrequency, record } from './leitner.js';
import { FREQ_WORDS, freqCategories } from './frequency.js';
import { isCorrect, alternatives } from './check.js';
import { esc, $, $$, shuffle } from './util.js';

const WORD_MODES = [
  ['ka-en-easy', 'Georgian → English (easy)', 'See Georgian + pronunciation, type the English'],
  ['ka-en-hard', 'Georgian → English (hard)', 'See only Georgian, type the English'],
  ['en-ka-easy', 'English → Georgian (medium)', 'See English + pronunciation, type in Georgian'],
  ['en-ka-hard', 'English → Georgian (hard)', 'See only English, type in Georgian'],
];
const ALPHA_MODES = [
  ['ch-sound', 'Letter → sound', 'See the letter, pick its sound'],
  ['sound-ch', 'Sound → letter', 'See the sound, pick the letter'],
  ['mixed', 'Mixed', 'Both directions'],
];

const METHOD_LABEL = { random: 'Random', smart: 'Smart', frequency: 'Frequency' };
const setup = { deck: 'words', mode: 'ka-en-easy', method: 'random', cats: new Set() };
let session = null;

export function render(root) {
  session ? renderQuestion(root) : renderSetup(root);
}

// ---------- Setup ----------
function renderSetup(root) {
  const cats = categories();
  const modes = setup.deck === 'words' ? WORD_MODES : ALPHA_MODES;
  if (!modes.some(m => m[0] === setup.mode)) setup.mode = modes[0][0];

  root.innerHTML = `
    <h1>Study</h1>
    <div class="row wrap" style="margin-bottom:12px">
      <button class="chip ${setup.deck === 'words' ? 'on' : ''}" data-deck="words">Words</button>
      <button class="chip ${setup.deck === 'alphabet' ? 'on' : ''}" data-deck="alphabet">Alphabet</button>
    </div>
    <h2>Mode</h2>
    ${modes.map(([id, name, desc]) => `<button class="option ${setup.mode === id ? 'on' : ''}" data-mode="${id}">${name}<small>${desc}</small></button>`).join('')}
    <h2>Method</h2>
    <div class="row">
      <button class="option ${setup.method === 'random' ? 'on' : ''}" data-method="random">Random</button>
      <button class="option ${setup.method === 'smart' ? 'on' : ''}" data-method="smart">Smart (Leitner)</button>
    </div>
    ${setup.deck === 'words' ? `<button class="option ${setup.method === 'frequency' ? 'on' : ''}" data-method="frequency" style="margin-top:8px">Frequency list<small>Most common spoken words first, unlocking as you learn (built-in list)</small></button>` : ''}
    ${setup.deck === 'words' ? `
      <h2>Categories <span class="muted" style="text-transform:none">(none selected = all)</span></h2>
      <div class="row wrap">${cats.map(c => `<button class="chip ${setup.cats.has(c) ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('') || '<span class="muted">No categories yet</span>'}</div>` : ''}
    <div style="margin-top:20px"><button class="btn block" id="start">Start</button></div>
    <p class="muted" id="err" style="margin-top:8px"></p>`;

  $$('[data-deck]', root).forEach(b => b.onclick = () => { setup.deck = b.dataset.deck; renderSetup(root); });
  $$('[data-mode]', root).forEach(b => b.onclick = () => { setup.mode = b.dataset.mode; renderSetup(root); });
  $$('[data-method]', root).forEach(b => b.onclick = () => { if ((b.dataset.method === 'frequency') !== (setup.method === 'frequency')) setup.cats.clear(); setup.method = b.dataset.method; renderSetup(root); });
  $$('[data-cat]', root).forEach(b => b.onclick = () => {
    setup.cats.has(b.dataset.cat) ? setup.cats.delete(b.dataset.cat) : setup.cats.add(b.dataset.cat);
    renderSetup(root);
  });
  $('#start', root).onclick = () => {
    const cards = buildCards();
    if (!cards.length) { $('#err', root).textContent = 'No cards match. Add words or change categories.'; return; }
    session = { cards, method: setup.deck === 'alphabet' && setup.method === 'frequency' ? 'random' : setup.method, deck: setup.deck, mode: setup.mode, right: 0, wrong: 0, last: null, current: null };
    next(root);
  };
}

// ---------- Cards ----------
function buildCards() {
  if (setup.deck === 'alphabet') {
    const dirs = setup.mode === 'mixed' ? ['ch-sound', 'sound-ch'] : [setup.mode];
    return ALPHABET.flatMap(l => dirs.map(dir => ({ key: `a:${l.char}:${dir}`, kind: 'alphabet', dir, letter: l })));
  }
  const source = setup.method === 'frequency' ? FREQ_WORDS : state.words;
  const words = source.filter(w => !setup.cats.size || setup.cats.has(w.category));
  const easy = setup.mode.endsWith('easy');
  const dir = setup.mode.startsWith('ka') ? 'ka-en' : 'en-ka';
  // Progress is tracked per direction (not per difficulty) so easy/hard share stats.
  return words.map(w => ({ key: `w:${w.id}:${dir}`, kind: 'word', dir, easy, word: w }));
}

function next(root) {
  const pick = { smart: pickSmart, frequency: pickFrequency }[session.method] || pickRandom;
  session.current = pick(session.cards, session.last);
  session.last = session.current.key;
  session.answered = false;
  renderQuestion(root);
}

// ---------- Question ----------
function renderQuestion(root) {
  const card = session.current;
  session.answered = false;
  root.innerHTML = `
    <div class="row between" style="margin-bottom:12px">
      <button class="btn secondary small" id="end">End</button>
      <span class="muted">${session.right} ✓ &nbsp; ${session.wrong} ✗ &nbsp; ${METHOD_LABEL[session.method]}</span>
    </div>
    <div class="card"><div class="prompt" id="prompt"></div></div>
    <div id="answer"></div>`;
  $('#end', root).onclick = () => endSession(root);

  card.kind === 'alphabet' ? questionAlphabet(root, card) : questionWord(root, card);
}

function questionWord(root, card) {
  const w = card.word;
  const toEnglish = card.dir === 'ka-en';
  const answer = toEnglish ? w.en : w.ka;
  $('#prompt', root).innerHTML = toEnglish
    ? `<div class="tag">Translate to English${w.hint ? ' · ' + esc(w.hint) : ''}</div><div class="big text">${esc(w.ka)}</div>${card.easy ? `<div class="hint">${esc(w.roman)}</div>` : ''}`
    : `<div class="tag">Type in Georgian${w.hint ? ' · ' + esc(w.hint) : ''}</div><div class="big text">${esc(w.en)}</div>${card.easy ? `<div class="hint">${esc(w.roman)}</div>` : ''}`;

  $('#answer', root).innerHTML = `
    <input id="input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${toEnglish ? '' : 'lang="ka"'} placeholder="${toEnglish ? 'English…' : 'ქართული…'}">
    <button class="btn block" id="check">Check</button>`;
  const input = $('#input', root);
  input.focus();

  const submit = () => {
    if (session.answered) return next(root);
    session.answered = true;
    const ok = isCorrect(input.value, answer);
    finish(root, card, ok);
    input.disabled = true;
    const extra = [
      w.roman && `<div class="muted">${esc(w.roman)}${w.category ? ' · ' + esc(w.category) : ''}</div>`,
      w.sentence && `<div style="margin-top:6px"><span class="ka">${esc(w.sentence)}</span>${w.sentenceEn ? `<div class="muted">${esc(w.sentenceEn)}</div>` : ''}</div>`,
    ].filter(Boolean).join('');
    $('#answer', root).insertAdjacentHTML('afterbegin', `
      <div class="feedback ${ok ? 'ok' : 'bad'}">
        <b>${ok ? 'Correct!' : 'Not quite'}</b>
        ${ok && alternatives(answer).length < 2 ? '' : `<div>Answer: <span class="ka">${esc(answer)}</span></div>`}
        ${extra}
      </div>`);
    $('#check', root).textContent = 'Next';
    $('#check', root).focus();
  };
  $('#check', root).onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
}

function questionAlphabet(root, card) {
  const l = card.letter;
  const toSound = card.dir === 'ch-sound';
  $('#prompt', root).innerHTML = toSound
    ? `<div class="tag">Which sound?</div><div class="big">${esc(l.char)}</div>`
    : `<div class="tag">Which letter?</div><div class="big text">${esc(l.sound)}</div>`;

  const others = shuffle(ALPHABET.filter(x => x.char !== l.char)).slice(0, 3);
  const options = shuffle([l, ...others]);
  $('#answer', root).innerHTML = options.map(o =>
    `<button class="option ${toSound ? '' : 'ka'}" data-char="${esc(o.char)}">${esc(toSound ? o.sound : o.char)}</button>`).join('');

  $$('#answer .option', root).forEach(btn => btn.onclick = () => {
    if (session.answered) return;
    session.answered = true;
    const ok = btn.dataset.char === l.char;
    finish(root, card, ok);
    $$('#answer .option', root).forEach(b => {
      if (b.dataset.char === l.char) b.classList.add('ok');
    });
    if (!ok) btn.classList.add('bad');
    const ex = state.alphabetExamples[l.char];
    $('#answer', root).insertAdjacentHTML('beforeend', `
      <div class="feedback ${ok ? 'ok' : 'bad'}">
        <b>${ok ? 'Correct!' : 'Not quite'}</b>
        <div><span class="ka">${esc(l.char)}</span> = ${esc(l.sound)} <span class="muted">(${esc(l.name)})</span></div>
        ${ex ? `<div class="muted">e.g. ${esc(ex)}</div>` : ''}
      </div>
      <button class="btn block" id="nextBtn">Next</button>`);
    $('#nextBtn', root).onclick = () => next(root);
  });
}

function finish(root, card, ok) {
  record(card.key, ok);
  ok ? session.right++ : session.wrong++;
  $('.row.between .muted', root).innerHTML =
    `${session.right} ✓ &nbsp; ${session.wrong} ✗ &nbsp; ${METHOD_LABEL[session.method]}`;
}

function endSession(root) {
  const { right, wrong } = session;
  const total = right + wrong;
  session = null;
  root.innerHTML = `
    <h1>Session done</h1>
    <div class="card stat-grid">
      <div><b>${total}</b><span class="muted">answered</span></div>
      <div><b>${right}</b><span class="muted">correct</span></div>
      <div><b>${total ? Math.round(100 * right / total) : 0}%</b><span class="muted">accuracy</span></div>
    </div>
    <button class="btn block" id="back">Back to study</button>`;
  $('#back', root).onclick = () => renderSetup(root);
}
