import * as study from './study.js';
import * as words from './words.js';
import * as stats from './stats.js';
import * as settings from './settings.js';
import { $, $$ } from './util.js';

// To add a new screen: create js/<name>.js exporting render(root), register it here,
// add a button in index.html's <nav>, and add the file to sw.js.
const views = { study, words, stats, settings };
const root = $('#app');
let current = 'study';

function show(name) {
  current = name;
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  views[name].render(root);
  window.scrollTo(0, 0);
}

$$('#nav button').forEach(b => b.onclick = () => show(b.dataset.view));
show(current);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
// Ask the browser not to evict saved progress when storage is low.
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
