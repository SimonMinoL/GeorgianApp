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
  ['ფ', 'p', 'pari'], ['ქ', 'q', 'qari'], ['ღ', 'gh', 'ghani'], ['ყ', "k", "kava"],
  ['შ', 'sh', 'shini'], ['ჩ', 'ch', 'chini'], ['ც', 'ts', 'tsani'], ['ძ', 'dz', 'dzili'],
  ['წ', "ts'", "ts'ili"], ['ჭ', "tch", "tchari"], ['ხ', 'kh', 'khani'], ['ჯ', 'j', 'jani'],
  ['ჰ', 'h', 'hae'],
].map(([char, sound, name]) => ({ char, sound, name, key: KEYS[char] }));

// Base words (your own list). Ids come from your backup so existing progress keeps matching.
// New installs start with these; edit or delete them in the Words tab.
export const STARTER_WORDS = [
  ['mw59n7o061gc', 'გმადლობთ', 'gmadlobt', 'thank you', 'greetings'],
  ['mw59n7o0lksb', 'ბოდიში', 'bodishi', 'sorry / excuse me', 'greetings'],
  ['mw59n7o03pf7', 'დიახ', 'diakh', 'yes', 'basics'],
  ['mw59n7o0ldil', 'არა', 'ara', 'no', 'basics'],
  ['mw59n7o02u4q', 'კარგი', "k'argi", 'good', 'basics'],
  ['mw6ltd39xdxa', 'ვიცი', 'vitsi', 'I know', 'basics'],
  ['mw59n7o0kcrl', 'წყალი', "ts'q'ali", 'water', 'food'],
  ['mw59n7o0s48s', 'პური', "p'uri", 'bread', 'food'],
  ['mw59n7o00qpv', 'დედა', 'deda', 'mother', 'family'],
  ['mw59n7o0a8wq', 'მამა', 'mama', 'father', 'family'],
  ['mw59n7o0z9nc', 'გამარჯობა', 'gamarjoba', 'hello', 'greetings'],
];

// Example word per letter (shown after answering an alphabet card).
export const DEFAULT_EXAMPLES = {
  ა: 'ara', ბ: 'bali', გ: 'gemi', დ: 'deda', ე: 'ena (tongue/language)', ვ: 'var', ზ: 'zoma (size)',
  თ: 'tbili (soft t)', ი: 'iremi', კ: 'kata (hard k)', ლ: 'lomi', მ: 'marili (salt)', ნ: 'nikapi', ო: 'ori',
  პ: 'puri (normal p)', ჟ: 'zhirafi (jirafa / jirapi)', რ: 'rogor', ს: 'saati', ტ: 'torti (normal t)', უ: 'uto',
  ფ: 'piso', ქ: 'qari (wind/soft k)', ღ: 'Ghomi (French r)', ყ: "K'ava", შ: 'Shen (you)', ჩ: 'chai',
  ც: 'tsetskhli (fire)', ძ: 'dzneli (difficult)', წ: "ts'eli (year / spine)", ჭ: 'Tchama (eat)',
  ხ: 'khe (tree)', ჯ: 'jdoma (sit)', ჰ: 'haeri (air) h in hello',
};
