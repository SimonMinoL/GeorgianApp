const clean = s => String(s || '').normalize('NFC').toLowerCase().replace(/[.,!?'’"]/g, '').replace(/\s+/g, ' ').trim();

// Answers can list alternatives separated by "/" or ";" (e.g. "sorry / excuse me").
export const alternatives = text => String(text).split(/[\/;]/).map(s => s.trim()).filter(Boolean);

export function isCorrect(input, answerText) {
  const given = clean(input);
  if (!given) return false;
  return clean(answerText) === given || alternatives(answerText).some(a => clean(a) === given);
}
