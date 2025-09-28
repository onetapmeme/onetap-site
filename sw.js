// ========= $ONETAP — sw.js (clean) =========
const CACHE = 'onetap-v5-6-gh';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        './','./index.html','./style.css','./script.js','./manifest.json',
        // précache aussi les visuels de la 1ère scène (confort)
        './assets/onetap_logo.png','./assets/tap2enter_pc_static.png',
        './assets/case_blank.png','./assets/onetap_gold.png',
        // audio
        './assets/explosion.wav','./assets/music_welcome.wav','./assets/music_main.wav',
        './assets/music_epic.wav','./assets/roulette_sound.wav','./assets/drop_rare.wav'
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Un seul fetch listener :
// - navigations HTML → network-first (fallback cache/index)
// - assets (CSS/JS/img/audio) → cache-first
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && req.method === 'GET') {
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});
