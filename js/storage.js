import { STARTER_WORDS, DEFAULT_EXAMPLES } from './data.js';
import { NUMBER_WORDS } from './numbers.js';

const KEY = 'georgian-cards.v1';
const VERSION = 2;

// words:    [{id, ka, roman, en, category, sentence, sentenceEn}]
// progress: { "<cardKey>": {c, w, box, due, last} }   (c = right, w = wrong)
// history:  { "YYYY-MM-DD": {c, w} }
// alphabetExamples: { "ა": "ახალი – new" }
function fresh() {
  return {
    version: VERSION,
    words: STARTER_WORDS.map(([id, ka, roman, en, category]) => ({ id, ka, roman, en, category, sentence: '', sentenceEn: '' })),
    progress: {},
    history: {},
    alphabetExamples: { ...DEFAULT_EXAMPLES },
  };
}

// v2: numbers became a built-in deck. Move the user's own number words (and their progress) onto the built-in ids.
function migrate(s) {
  if ((s.version || 1) >= VERSION) return s;
  const byKa = Object.fromEntries(NUMBER_WORDS.map(n => [n.ka, n.id]));
  const moved = {};
  s.words = s.words.filter(w => {
    if (w.category === 'numbers' && byKa[w.ka]) { moved[w.id] = byKa[w.ka]; return false; }
    return true;
  });
  for (const [key, p] of Object.entries(s.progress || {})) {
    const m = key.match(/^w:([^:]+):(.+)$/);
    if (m && moved[m[1]]) {
      const nk = `w:${moved[m[1]]}:${m[2]}`;
      const old = s.progress[nk];
      s.progress[nk] = !old || p.c + p.w >= old.c + old.w ? p : old;
      delete s.progress[key];
    }
  }
  s.alphabetExamples = { ...DEFAULT_EXAMPLES, ...(s.alphabetExamples || {}) };
  s.version = VERSION;
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate({ ...fresh(), version: 1, ...JSON.parse(raw) });
  } catch (e) { console.error('Could not load data', e); }
  return fresh();
}

export const state = load();

export function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.words)) throw new Error('Not a valid backup file');
  Object.assign(state, migrate({ ...fresh(), version: 1, ...data }));
  save();
}

export const categories = () =>
  [...new Set(state.words.map(w => w.category).filter(Boolean))].sort();
