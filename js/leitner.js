import { state, save } from './storage.js';
import { rand, today } from './util.js';

// Leitner boxes 1-5. Wrong -> back to box 1. Right -> up a box.
// Hours before a card is due again, per box (index = box).
const INTERVAL_H = [0, 0.02, 24, 72, 168, 504];
const MAX_BOX = 5;

export const getProgress = key => state.progress[key] || { c: 0, w: 0, box: 1, due: 0, last: 0 };

export function record(key, correct) {
  const p = getProgress(key);
  const now = Date.now();
  if (correct) { p.c++; p.box = Math.min(MAX_BOX, p.box + 1); }
  else { p.w++; p.box = 1; }
  p.due = now + INTERVAL_H[p.box] * 3600_000;
  p.last = now;
  state.progress[key] = p;

  const day = (state.history[today()] ||= { c: 0, w: 0 });
  correct ? day.c++ : day.w++;
  save();
}

// Smart pick: overdue cards first (low box / weak accuracy first), otherwise the ones due soonest.
// Avoids repeating the previous card when possible.
export function pickSmart(cards, lastKey) {
  const pool = cards.length > 1 ? cards.filter(c => c.key !== lastKey) : cards;
  const now = Date.now();
  const scored = pool.map(card => {
    const p = getProgress(card.key);
    const total = p.c + p.w;
    const weakness = total ? p.w / total : 0.5;
    const overdue = p.due <= now;
    const base = overdue ? 0 : 100 + (p.due - now) / 3600_000;
    return { card, score: base + p.box * 10 - weakness * 8 + Math.random() * 6 };
  });
  scored.sort((a, b) => a.score - b.score);
  return rand(scored.slice(0, Math.min(3, scored.length))).card;
}

export function pickRandom(cards, lastKey) {
  const pool = cards.length > 1 ? cards.filter(c => c.key !== lastKey) : cards;
  return rand(pool);
}
