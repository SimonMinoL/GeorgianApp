// Built-in numbers. Add more rows here as you learn them (id "n<number>" keeps progress keys stable).
// Numbers unlock ten at a time.
const ROWS = [
  ['ერთი', 'erti', 'one'], ['ორი', 'ori', 'two'], ['სამი', 'sami', 'three'], ['ოთხი', 'otkhi', 'four'],
  ['ხუთი', 'khuti', 'five'], ['ექვსი', 'eqvsi', 'six'], ['შვიდი', 'shvidi', 'seven'], ['რვა', 'rva', 'eight'],
  ['ცხრა', 'tskhra', 'nine'], ['ათი', 'ati', 'ten'], ['თერთმეტი', 'tertmeti', 'eleven'],
  ['თორმეტი', 'tormeti', 'twelve'], ['ცამეტი', 'tsameti', 'thirteen'], ['თოთხმეტი', 'totkhmeti', 'fourteen'],
  ['თხუთმეტი', 'tkhutmeti', 'fifteen'],
];

export const NUMBER_WORDS = ROWS.map(([ka, roman, en], i) => ({
  id: 'n' + (i + 1), num: i + 1, ka, roman, en: `${en} / ${i + 1}`, enLabel: en,
  category: 'numbers', sentence: '', sentenceEn: '',
}));

export const BLOCK = 10;

// The next block opens once every number in the earlier blocks has reached box 4 in at least one direction.
export function unlockedMax(getProgress) {
  let max = BLOCK;
  while (max < NUMBER_WORDS.length) {
    const block = NUMBER_WORDS.slice(max - BLOCK, max);
    const done = block.every(w => ['ka-en', 'en-ka'].some(d => getProgress(`w:${w.id}:${d}`).box >= 4));
    if (!done) break;
    max += BLOCK;
  }
  return Math.min(max, NUMBER_WORDS.length);
}
