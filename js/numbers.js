// Built-in numbers. Add more rows here as you learn them (id "n<number>" keeps progress keys stable).
// Numbers unlock ten at a time.
const ROWS = [
  ['ერთი', 'erti', 'one'], ['ორი', 'ori', 'two'], ['სამი', 'sami', 'three'], ['ოთხი', 'otkhi', 'four'],
  ['ხუთი', 'khuti', 'five'], ['ექვსი', 'eqvsi', 'six'], ['შვიდი', 'shvidi', 'seven'], ['რვა', 'rva', 'eight'],
  ['ცხრა', 'tskhra', 'nine'], ['ათი', 'ati', 'ten'], ['თერთმეტი', 'tertmeti', 'eleven'],
  ['თორმეტი', 'tormeti', 'twelve'], ['ცამეტი', 'tsameti', 'thirteen'], ['თოთხმეტი', 'totkhmeti', 'fourteen'],
  ['თხუთმეტი', 'tkhutmeti', 'fifteen'], ['თექვსმეტი', 'tekvsmeti', 'sixteen'], ['ჩვიდმეტი', 'chvidmeti', 'seventeen'],
  ['თვრამეტი', 'tvrameti', 'eighteen'], ['ცხრამეტი', 'tskhrameti', 'nineteen'],
  ['ოცი', 'otsi', 'twenty'], ['ოცდაერთი', 'otsdaerti', 'twenty-one'], ['ოცდაორი', 'otsdaori', 'twenty-two'],
  ['ოცდასამი', 'otsdasami', 'twenty-three'], ['ოცდაოთხი', 'otsdaotkhi', 'twenty-four'],
  ['ოცდახუთი', 'otsdakhuti', 'twenty-five'], ['ოცდაექვსი', 'otsdaeqvsi', 'twenty-six'],
  ['ოცდაშვიდი', 'otsdashvidi', 'twenty-seven'], ['ოცდარვა', 'otsdarva', 'twenty-eight'],
  ['ოცდაცხრა', 'otsdatskhra', 'twenty-nine'], ['ოცდაათი', 'otsdaati', 'thirty'],
  ['ოცდათერთმეტი', 'otsdatertmeti', 'thirty-one'], ['ოცდათორმეტი', 'otsdatormeti', 'thirty-two'],
  ['ოცდაცამეტი', 'otsdatsameti', 'thirty-three'], ['ოცდათოთხმეტი', 'otsdatotkhmeti', 'thirty-four'],
  ['ოცდათხუთმეტი', 'otsdatkhutmeti', 'thirty-five'], ['ოცდათექვსმეტი', 'otsdatekvsmeti', 'thirty-six'],
  ['ოცდაჩვიდმეტი', 'otsdachvidmeti', 'thirty-seven'], ['ოცდათვრამეტი', 'otsdatvrameti', 'thirty-eight'],
  ['ოცდაცხრამეტი', 'otsdatskhrameti', 'thirty-nine'],
  ['ორმოცი', 'ormotsi', 'forty'], ['ორმოცდაერთი', 'ormotsdaerti', 'forty-one'],
  ['ორმოცდაორი', 'ormotsdaori', 'forty-two'], ['ორმოცდასამი', 'ormotsdasami', 'forty-three'],
  ['ორმოცდაოთხი', 'ormotsdaotkhi', 'forty-four'], ['ორმოცდახუთი', 'ormotsdakhuti', 'forty-five'],
  ['ორმოცდაექვსი', 'ormotsdaeqvsi', 'forty-six'], ['ორმოცდაშვიდი', 'ormotsdashvidi', 'forty-seven'],
  ['ორმოცდარვა', 'ormotsdarva', 'forty-eight'], ['ორმოცდაცხრა', 'ormotsdatskhra', 'forty-nine'],
  ['ორმოცდაათი', 'ormotsdaati', 'fifty'],
];

export const NUMBER_WORDS = ROWS.map(([ka, roman, en], i) => {
  const n = i + 1;
  const accepted = [en, en.replace('-', ' '), String(n)].filter((v, j, a) => a.indexOf(v) === j).join(' / ');
  return { id: 'n' + n, num: n, ka, roman, en: accepted, enLabel: en, category: 'numbers', sentence: '', sentenceEn: '' };
});

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
