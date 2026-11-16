import { state, save, categories } from './storage.js';
import { ALPHABET } from './data.js';
import { pickSmart, pickRandom, pickFrequency, record, getProgress } from './leitner.js';
import { FREQ_WORDS, freqCategories } from './frequency.js';
import { NUMBER_WORDS, unlockedMax } from './numbers.js';
import { isCorrect, alternatives } from './check.js';
import { esc, $, $$, shuffle } from './util.js';

const WORD_MODES = [
  ['ka-en-easy', 'Georgian → English (easy)', 'See Georgian + pronunciation, type the English'],
  ['ka-en-hard', 'Georgian → English (hard)', 'See only Georgian, type the English'],
  ['en-ka-easy', 'English → Georgian (medium)', 'See English + pronunciation, type in Georgian'],
  ['en-ka-hard', 'English → Georgian (hard)', 'See only English, type in Georgian'],
];
const ALPHA_MODES = [
  ['ch-sound', 'Letter → sound (easy)', 'See the letter, pick its sound'],
  ['sound-ch', 'Sound → letter (easy)', 'See the sound, pick the letter'],
  ['mixed', 'Mixed (easy)', 'Both directions, multiple choice'],
  ['sound-type', 'Sound → letter (hard)', 'See the sound, type the letter on your Georgian keyboard'],
];

const MATH_MODES = [
  ['math-add-easy', 'Addition (digits)', 'See 3 + 4, type the answer in Georgian'],
  ['math-sub-easy', 'Subtraction (digits)', 'See 7 − 2, type the answer in Georgian'],
  ['math-mix-easy', 'Mixed (digits)', 'Addition and subtraction'],
  ['math-add-hard', 'Addition (Georgian words)', 'Numbers shown in Georgian too'],
  ['math-sub-hard', 'Subtraction (Georgian words)', 'Numbers shown in Georgian too'],
  ['math-mix-hard', 'Mixed (Georgian words)', 'Addition and subtraction, all in Georgian'],
];
const MODES = { words: WORD_MODES, numbers: WORD_MODES, alphabet: ALPHA_MODES, math: MATH_MODES };
const DECKS = [['words', 'Words'], ['numbers', 'Numbers'], ['alphabet', 'Alphabet'], ['math', 'Math']];
const METHODS = {
  words: [['random', 'Random'], ['smart', 'Smart (Leitner)'], ['frequency', 'Frequency list', 'Most common spoken words first, unlocking as you learn (built-in list)']],
  numbers: [['order', 'In order', '1, 2, 3… as far as you have unlocked'], ['random', 'Random'], ['smart', 'Smart (Leitner)']],
  alphabet: [['order', 'In order', 'ა, ბ, გ… in alphabet order'], ['random', 'Random'], ['smart', 'Smart (Leitner)']],
  math: [],
};
const DECK_DEFAULT_METHOD = { words: 'random', numbers: 'order', alphabet: 'order', math: 'random' };
const CHOICES = 8;

const METHOD_LABEL = { random: 'Random', smart: 'Smart', frequency: 'Frequency', order: 'In order' };
const setup = { deck: 'words', mode: 'ka-en-easy', method: 'random', cats: new Set() };
let session = null;

export function render(root) {
  session ? renderQuestion(root) : renderSetup(root);
}

const unlocked = () => NUMBER_WORDS.slice(0, unlockedMax(getProgress));

// ---------- Setup ----------
function renderSetup(root) {
  const cats = setup.method === 'frequency' ? freqCategories() : categories();
  const modes = MODES[setup.deck];
  const methods = METHODS[setup.deck];
  if (!modes.some(m => m[0] === setup.mode)) setup.mode = modes[0][0];
  if (!methods.some(m => m[0] === setup.method)) setup.method = DECK_DEFAULT_METHOD[setup.deck];

  root.innerHTML = `
    <h1>Study</h1>
    <div class="row wrap" style="margin-bottom:12px">
      ${DECKS.map(([id, label]) => `<button class="chip ${setup.deck === id ? 'on' : ''}" data-deck="${id}">${label}</button>`).join('')}
    </div>
    ${setup.deck === 'numbers' || setup.deck === 'math' ? `<p class="muted" style="margin-bottom:8px">Unlocked: 1–${unlocked().length} (the next ten open when you master the current ones)</p>` : ''}
    <h2>Mode</h2>
    ${modes.map(([id, name, desc]) => `<button class="option ${setup.mode === id ? 'on' : ''}" data-mode="${id}">${name}<small>${desc}</small></button>`).join('')}
    ${methods.length ? `<h2>Method</h2>
    ${methods.map(([id, name, desc]) => `<button class="option ${setup.method === id ? 'on' : ''}" data-method="${id}">${name}${desc ? `<small>${desc}</small>` : ''}</button>`).join('')}` : ''}
    ${setup.deck === 'words' ? `
      <h2>Categories <span class="muted" style="text-transform:none">(none selected = all)</span></h2>
      <div class="row wrap">${cats.map(c => `<button class="chip ${setup.cats.has(c) ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('') || '<span class="muted">No categories yet</span>'}</div>` : ''}
    <div style="margin-top:20px"><button class="btn block" id="start">Start</button></div>
    <p class="muted" id="err" style="margin-top:8px"></p>`;

  $$('[data-deck]', root).forEach(b => b.onclick = () => { setup.deck = b.dataset.deck; setup.cats.clear(); renderSetup(root); });
  $$('[data-mode]', root).forEach(b => b.onclick = () => { setup.mode = b.dataset.mode; renderSetup(root); });
  $$('[data-method]', root).forEach(b => b.onclick = () => { if ((b.dataset.method === 'frequency') !== (setup.method === 'frequency')) setup.cats.clear(); setup.method = b.dataset.method; renderSetup(root); });
  $$('[data-cat]', root).forEach(b => b.onclick = () => {
    setup.cats.has(b.dataset.cat) ? setup.cats.delete(b.dataset.cat) : setup.cats.add(b.dataset.cat);
    renderSetup(root);
  });
  $('#start', root).onclick = () => {
    const cards = buildCards();
    if (!cards.length && setup.deck !== 'math') { $('#err', root).textContent = 'No cards match. Add words or change categories.'; return; }
    session = { cards, method: setup.deck === 'math' ? 'random' : setup.method, deck: setup.deck, mode: setup.mode, right: 0, wrong: 0, last: null, current: null, idx: 0 };
    next(root);
  };
}

// ---------- Cards ----------
function wordCards(words) {
  const easy = setup.mode.endsWith('easy');
  const dir = setup.mode.startsWith('ka') ? 'ka-en' : 'en-ka';
  // Progress is tracked per direction (not per difficulty) so easy/hard share stats.
  return words.map(w => ({ key: `w:${w.id}:${dir}`, kind: 'word', dir, easy, word: w }));
}

function buildCards() {
  if (setup.deck === 'alphabet') {
    const dirs = setup.mode === 'mixed' ? ['ch-sound', 'sound-ch'] : [setup.mode];
    return ALPHABET.flatMap(l => dirs.map(dir => ({ key: `a:${l.char}:${dir}`, kind: 'alphabet', dir, letter: l })));
  }
  if (setup.deck === 'numbers') return wordCards(unlocked());
  if (setup.deck === 'math') return [];
  const source = setup.method === 'frequency' ? FREQ_WORDS : state.words;
  return wordCards(source.filter(w => !setup.cats.size || setup.cats.has(w.category)));
}

function mathCard(mode) {
  const max = unlocked().length;
  const [, kind, level] = mode.split('-');
  const add = kind === 'add' || (kind === 'mix' && Math.random() < 0.5);
  let a, b, r;
  if (add) {
    r = 2 + Math.floor(Math.random() * (max - 1));
    a = 1 + Math.floor(Math.random() * (r - 1));
    b = r - a;
  } else {
    a = 2 + Math.floor(Math.random() * (max - 1));
    b = 1 + Math.floor(Math.random() * (a - 1));
    r = a - b;
  }
  return { key: `m:${a}${add ? '+' : '-'}${b}`, kind: 'math', a, b, add, answer: NUMBER_WORDS[r - 1], hard: level === 'hard' };
}

function next(root) {
  if (session.deck === 'math') session.current = mathCard(session.mode);
  else if (session.method === 'order') session.current = session.cards[session.idx++ % session.cards.length];
  else {
    const pick = { smart: pickSmart, frequency: pickFrequency }[session.method] || pickRandom;
    session.current = pick(session.cards, session.last);
  }
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

  if (card.kind === 'alphabet') (card.dir === 'sound-type' ? questionAlphabetTyped : questionAlphabet)(root, card);
  else if (card.kind === 'math') questionMath(root, card);
  else questionWord(root, card);
}

function questionMath(root, card) {
  const show = n => card.hard ? NUMBER_WORDS[n - 1].ka : n;
  $('#prompt', root).innerHTML = `<div class="tag">Answer in Georgian</div><div class="big text">${esc(show(card.a))} ${card.add ? '+' : '−'} ${esc(show(card.b))} = ?</div>`;
  $('#answer', root).innerHTML = `
    <input id="input" lang="ka" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="ქართული…">
    <button class="btn block" id="check">Check</button>`;
  const input = $('#input', root);
  input.focus();
  const submit = () => {
    if (session.answered) return next(root);
    session.answered = true;
    const ok = isCorrect(input.value, card.answer.ka);
    finish(root, card, ok);
    input.disabled = true;
    $('#answer', root).insertAdjacentHTML('afterbegin', `
      <div class="feedback ${ok ? 'ok' : 'bad'}">
        <b>${ok ? 'Correct!' : 'Not quite'}</b>
        <div><span class="ka">${esc(card.answer.ka)}</span> = ${card.answer.num}</div>
      </div>`);
    $('#check', root).textContent = 'Next';
    $('#check', root).focus();
  };
  $('#check', root).onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
}

function questionWord(root, card) {
  const w = card.word;
  const toEnglish = card.dir === 'ka-en';
  const answer = toEnglish ? w.en : w.ka;
  const showLatin = card.easy && state.showLatin !== false;
  $('#prompt', root).innerHTML = toEnglish
    ? `<div class="tag">Translate to English${w.hint ? ' · ' + esc(w.hint) : ''}</div><div class="big text">${esc(w.ka)}</div>${showLatin ? `<div class="hint">${esc(w.roman)}</div>` : ''}`
    : `<div class="tag">Type in Georgian${w.hint ? ' · ' + esc(w.hint) : ''}</div><div class="big text">${esc(w.en)}</div>${showLatin ? `<div class="hint">${esc(w.roman)}</div>` : ''}`;

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
  if (card.dir === 'sound-type') return questionAlphabetTyped(root, card);
  const toSound = card.dir === 'ch-sound';
  $('#prompt', root).innerHTML = toSound
    ? `<div class="tag">Which sound?</div><div class="big">${esc(l.char)}</div>`
    : `<div class="tag">Which letter?</div><div class="big text">${esc(l.sound)}</div>`;

  const others = shuffle(ALPHABET.filter(x => x.char !== l.char)).slice(0, CHOICES - 1);
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
        <div class="muted">Keyboard key: ${esc(l.key)}</div>
        ${ex ? `<div class="muted">e.g. ${esc(ex)}</div>` : ''}
      </div>
      <button class="btn block" id="nextBtn">Next</button>`);
    $('#nextBtn', root).onclick = () => next(root);
  });
}

function questionAlphabetTyped(root, card) {
  const l = card.letter;
  $('#prompt', root).innerHTML = `<div class="tag">Type the letter</div><div class="big text">${esc(l.sound)}</div>`;
  $('#answer', root).innerHTML = `
    <input id="input" lang="ka" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="ა" style="font-size:1.5rem;text-align:center">
    <button class="btn block" id="check">Check</button>`;
  const input = $('#input', root);
  input.focus();
  const submit = () => {
    if (session.answered) return next(root);
    session.answered = true;
    const ok = input.value.trim().normalize('NFC') === l.char;
    finish(root, card, ok);
    input.disabled = true;
    const ex = state.alphabetExamples[l.char];
    $('#answer', root).insertAdjacentHTML('afterbegin', `
      <div class="feedback ${ok ? 'ok' : 'bad'}">
        <b>${ok ? 'Correct!' : 'Not quite'}</b>
        <div><span class="ka">${esc(l.char)}</span> = ${esc(l.sound)} <span class="muted">(${esc(l.name)})</span></div>
        <div class="muted">Keyboard key: ${esc(l.key)}</div>
        ${ex ? `<div class="muted">e.g. ${esc(ex)}</div>` : ''}
      </div>`);
    $('#check', root).textContent = 'Next';
    $('#check', root).focus();
  };
  $('#check', root).onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
}

function finish(root, card, ok) {
  record(card.key, ok);
  const w = card.word;
  if (ok && w && w.frequency && getProgress(card.key).box >= 4 && !state.words.some(x => x.id === w.id)) {
    // Same id as the built-in word, so its progress carries over to the copy.
    state.words.unshift({ id: w.id, ka: w.ka, roman: w.roman, en: w.en, category: w.category, sentence: w.sentence, sentenceEn: w.sentenceEn, fromFrequency: true });
    save();
  }
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
