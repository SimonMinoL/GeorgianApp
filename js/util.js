export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const rand = arr => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const today = () => new Date().toISOString().slice(0, 10);
export const pct = (c, w) => (c + w ? Math.round((100 * c) / (c + w)) : null);
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
