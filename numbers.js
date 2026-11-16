// Georgian numbers 1-100, generated from the number rules (Georgian counts in twenties).
// Words use id "n<number>" so progress keys stay stable.
const UNITS = [['', ''], ['ერთი', 'erti'], ['ორი', 'ori'], ['სამი', 'sami'], ['ოთხი', 'otkhi'], ['ხუთი', 'khuti'],
  ['ექვსი', 'eqvsi'], ['შვიდი', 'shvidi'], ['რვა', 'rva'], ['ცხრა', 'tskhra'], ['ათი', 'ati']];
const TEENS = [['თერთმეტი', 'tertmeti'], ['თორმეტი', 'tormeti'], ['ცამეტი', 'tsameti'], ['თოთხმეტი', 'totkhmeti'],
  ['თხუთმეტი', 'tkhutmeti'], ['თექვსმეტი', 'tekvsmeti'], ['ჩვიდმეტი', 'chvidmeti'], ['თვრამეტი', 'tvrameti'], ['ცხრამეტი', 'tskhrameti']];
const BASES = [null, ['ოც', 'ots'], ['ორმოც', 'ormots'], ['სამოც', 'samots'], ['ოთხმოც', 'otkhmots']];
const EN_UNITS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function georgian(n) {
  if (n === 100) return ['ასი', 'asi'];
  if (n <= 10) return UNITS[n];
  if (n < 20) return TEENS[n - 11];
  const base = BASES[Math.floor(n / 20)];
  const r = n % 20;
  if (r === 0) return [base[0] + 'ი', base[1] + 'i'];
  const tail = r <= 10 ? UNITS[r] : TEENS[r - 11];
  return [base[0] + 'და' + tail[0], base[1] + 'da' + tail[1]];
}

function english(n) {
  if (n === 100) return 'one hundred';
  if (n < 20) return EN_UNITS[n];
  const t = EN_TENS[Math.floor(n / 10)];
  return n % 10 ? `${t}-${EN_UNITS[n % 10]}` : t;
}

export const NUMBER_WORDS = Array.from({ length: 100 }, (_, i) => {
  const n = i + 1;
  const [ka, roman] = georgian(n);
  const en = english(n);
  // Accept the spelled-out English (with or without hyphen) or the digits.
  const accepted = [en, en.replace('-', ' '), String(n)].filter((v, j, a) => a.indexOf(v) === j).join(' / ');
  return { id: 'n' + n, num: n, ka, roman, en: accepted, enLabel: en, category: 'numbers', sentence: '', sentenceEn: '' };
});

export const BLOCK = 10;

// Numbers unlock ten at a time: the next block opens once every number in the previous
// blocks has reached box 4 in at least one direction.
export function unlockedMax(getProgress) {
  let max = BLOCK;
  while (max < NUMBER_WORDS.length) {
    const block = NUMBER_WORDS.slice(max - BLOCK, max);
    const done = block.every(w => ['ka-en', 'en-ka'].some(d => getProgress(`w:${w.id}:${d}`).box >= 4));
    if (!done) break;
    max += BLOCK;
  }
  return max;
}
