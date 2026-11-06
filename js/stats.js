import { state } from './storage.js';
import { ALPHABET } from './data.js';
import { getProgress } from './leitner.js';
import { esc, pct, today } from './util.js';

export function render(root) {
  const entries = Object.entries(state.progress);
  const sum = list => list.reduce((a, [, p]) => ({ c: a.c + p.c, w: a.w + p.w }), { c: 0, w: 0 });
  const all = sum(entries);
  const day = state.history[today()] || { c: 0, w: 0 };

  const boxes = [1, 2, 3, 4, 5].map(b => entries.filter(([, p]) => p.box === b).length);
  const maxBox = Math.max(1, ...boxes);

  const wordRows = state.words.flatMap(w => ['ka-en', 'en-ka'].map(dir => {
    const p = getProgress(`w:${w.id}:${dir}`);
    return { label: dir === 'ka-en' ? `${w.ka} → ${w.en}` : `${w.en} → ${w.ka}`, ...p, acc: pct(p.c, p.w) };
  })).filter(r => r.c + r.w > 0);
  const weakest = [...wordRows].sort((a, b) => a.acc - b.acc || b.w - a.w).slice(0, 8);

  const letters = ALPHABET.flatMap(l => ['ch-sound', 'sound-ch'].map(dir => ({ l, ...getProgress(`a:${l.char}:${dir}`) })))
    .reduce((m, r) => { const e = (m[r.l.char] ||= { l: r.l, c: 0, w: 0 }); e.c += r.c; e.w += r.w; return m; }, {});
  const letterRows = Object.values(letters).filter(r => r.c + r.w > 0).sort((a, b) => pct(a.c, a.w) - pct(b.c, b.w)).slice(0, 8);

  const week = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    return { d: d.slice(5), ...(state.history[d] || { c: 0, w: 0 }) };
  });

  root.innerHTML = `
    <h1>Stats</h1>
    <div class="card stat-grid">
      <div><b>${all.c + all.w}</b><span class="muted">answers</span></div>
      <div><b>${pct(all.c, all.w) ?? '–'}${all.c + all.w ? '%' : ''}</b><span class="muted">accuracy</span></div>
      <div><b>${day.c + day.w}</b><span class="muted">today</span></div>
    </div>
    <h2>Leitner boxes</h2>
    <div class="card">
      <div class="boxes">${boxes.map(n => `<div style="height:${Math.max(4, (n / maxBox) * 100)}%">${n}</div>`).join('')}</div>
      <div class="row muted" style="justify-content:space-between;margin-top:4px"><span>Box 1 (new/weak)</span><span>Box 5 (mastered)</span></div>
    </div>
    <h2>Last 7 days</h2>
    <div class="card">${week.map(x => `<div class="row between list-item"><span>${x.d}</span><span class="muted">${x.c} ✓ ${x.w} ✗</span></div>`).join('')}</div>
    <h2>Weakest words</h2>
    <div class="card">${weakest.map(r => `<div class="row between list-item"><span>${esc(r.label)}</span><span class="muted">${r.acc}% (${r.c}/${r.c + r.w})</span></div>`).join('') || '<span class="muted">Study some words first.</span>'}</div>
    <h2>Weakest letters</h2>
    <div class="card">${letterRows.map(r => `<div class="row between list-item"><span><span class="ka">${esc(r.l.char)}</span> ${esc(r.l.sound)}</span><span class="muted">${pct(r.c, r.w)}% (${r.c}/${r.c + r.w})</span></div>`).join('') || '<span class="muted">Study the alphabet first.</span>'}</div>`;
}
