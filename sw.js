// Service worker: lets the installed app open offline.
// Strategy: network-first (fresh files whenever online, 4 s timeout), cache as offline fallback.
// Bump CACHE_VERSION whenever any file changes.
const CACHE_VERSION = 'wre-attendance-v2.2.0';
const SHELL = [
  './', './index.html', './help.html', './admin.html', './publish-guide.html', './privacy.html', './manifest.webmanifest', './css/app.css',
  './js/config.js', './js/i18n.js', './js/department.js', './js/store.js', './js/names.js', './js/auth.js', './js/reports.js', './js/excel.js', './js/ui.js', './js/guide.js',
  './js/vendor/xlsx.full.min.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
  './logos/university.png', './logos/college.png', './logos/department.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION)
    .then((c) => Promise.allSettled(SHELL.map((u) => fetch(u, { cache: 'reload' }).then((r) => (r.ok ? c.put(u, r) : null)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const net = fetch(req.url, { cache: 'no-cache' }).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; });
    const timeout = new Promise((resolve) => setTimeout(resolve, 4000, null));
    try {
      const res = await Promise.race([net, timeout]);
      if (res) return res;
    } catch (err) { /* offline: fall through to cache */ }
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || net;
  })());
});
