// Standard Georgian keyboard layout: the Latin key each letter sits on ("⇧" = shifted).
// If your phone keyboard differs, fix it here.
const KEYS = {
  ა: 'A', ბ: 'B', გ: 'G', დ: 'D', ე: 'E', ვ: 'V', ზ: 'Z', თ: '⇧T', ი: 'I', კ: 'K', ლ: 'L', მ: 'M',
  ნ: 'N', ო: 'O', პ: 'P', ჟ: '⇧J', რ: 'R', ს: 'S', ტ: 'T', უ: 'U', ფ: 'F', ქ: 'Q', ღ: '⇧R', ყ: 'Y',
  შ: '⇧S', ჩ: '⇧C', ც: 'C', ძ: '⇧Z', წ: 'W', ჭ: '⇧W', ხ: 'X', ჯ: 'J', ჰ: 'H',
};

// Georgian alphabet (Mkhedruli). `sound` is the romanisation used in quizzes.
export const ALPHABET = [
  ['ა', 'a', 'ani'], ['ბ', 'b', 'bani'], ['გ', 'g', 'gani'], ['დ', 'd', 'doni'],
  ['ე', 'e', 'eni'], ['ვ', 'v', 'vini'], ['ზ', 'z', 'zeni'], ['თ', 't', 'tani'],
  ['ი', 'i', 'ini'], ['კ', "k'", "k'ani"], ['ლ', 'l', 'lasi'], ['მ', 'm', 'mani'],
  ['ნ', 'n', 'nari'], ['ო', 'o', 'oni'], ['პ', "p'", "p'ari"], ['ჟ', 'zh', 'zhani'],
  ['რ', 'r', 'rae'], ['ს', 's', 'sani'], ['ტ', "t'", "t'ari"], ['უ', 'u', 'uni'],
  ['ფ', 'p', 'pari'], ['ქ', 'k', 'kani'], ['ღ', 'gh', 'ghani'], ['ყ', "q'", "q'ari"],
  ['შ', 'sh', 'shini'], ['ჩ', 'ch', 'chini'], ['ც', 'ts', 'tsani'], ['ძ', 'dz', 'dzili'],
  ['წ', "ts'", "ts'ili"], ['ჭ', "ch'", "ch'ari"], ['ხ', 'kh', 'khani'], ['ჯ', 'j', 'jani'],
  ['ჰ', 'h', 'hae'],
].map(([char, sound, name]) => ({ char, sound, name, key: KEYS[char] }));

// Starter words so the app isn't empty. Delete or edit them in the Words tab.
export const STARTER_WORDS = [
  ['გამარჯობა', 'gamarjoba', 'hello', 'greetings'],
  ['გმადლობთ', 'gmadlobt', 'thank you', 'greetings'],
  ['დიახ', 'diakh', 'yes', 'basics'],
  ['არა', 'ara', 'no', 'basics'],
  ['წყალი', "ts'q'ali", 'water', 'food'],
  ['პური', "p'uri", 'bread', 'food'],
  ['დედა', 'deda', 'mother', 'family'],
  ['მამა', 'mama', 'father', 'family'],
  ['კარგი', "k'argi", 'good', 'basics'],
  ['ბოდიში', 'bodishi', 'sorry / excuse me', 'greetings'],
];
