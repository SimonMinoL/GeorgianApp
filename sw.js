// Bump VERSION whenever you change files so phones pick up the update.
const VERSION = 'v3';
const FILES = [
  './', './index.html', './manifest.webmanifest', './icon.svg', './css/style.css',
  './js/app.js', './js/util.js', './js/data.js', './js/storage.js', './js/leitner.js', './js/frequency.js',
  './js/check.js', './js/study.js', './js/words.js', './js/stats.js', './js/settings.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
