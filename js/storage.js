import { STARTER_WORDS } from './data.js';
import { uid } from './util.js';

const KEY = 'georgian-cards.v1';

// words:    [{id, ka, roman, en, category, sentence, sentenceEn}]
// progress: { "<cardKey>": {c, w, box, due, last} }   (c = right, w = wrong)
// history:  { "YYYY-MM-DD": {c, w} }
// alphabetExamples: { "ა": "ახალი – new" }
function fresh() {
  return {
    version: 1,
    words: STARTER_WORDS.map(([ka, roman, en, category]) => ({ id: uid(), ka, roman, en, category, sentence: '', sentenceEn: '' })),
    progress: {},
    history: {},
    alphabetExamples: {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
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
  Object.assign(state, fresh(), data);
  save();
}

export const categories = () =>
  [...new Set(state.words.map(w => w.category).filter(Boolean))].sort();
