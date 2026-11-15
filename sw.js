// Page Quest service worker: always tries the network first so updates arrive,
// and falls back to the last saved copy when the iPad is offline.
const CACHE = 'page-quest-v50';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];
// Break Zone games: cached on install so they also work offline
const GAMES = ['bowling', 'golf', 'hoops', 'penalty', 'baseball', 'joust', 'hockey', 'fishing', 'stack', 'space', 'rings', 'rollball', 'balloons', 'draw', 'ttt', 'four', 'checkers', 'wordguess'].map(g => 'games/' + g + '.js?v=3').concat(['lib/jsQR.js?v=1', 'math/g3.js?v=1', 'math/g5.js?v=1']);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => Promise.all(GAMES.map(u => c.add(u).catch(() => {}))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheable = url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');
  if (!cacheable) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('index.html')))
  );
});
