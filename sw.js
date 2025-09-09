// ========= $ONETAP v5.2.3 – sw.js =========
// sw.js
const CACHE = 'onetap-v5-3'; 

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll([
    './','./index.html','./style.css','./script.js','./manifest.json',
    './assets/explosion.wav','./assets/music_welcome.wav','./assets/music_main.wav',
    './assets/music_epic.wav','./assets/roulette_sound.wav','./assets/drop_rare.wav'
  ])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=> e.waitUntil(
  (async ()=>{ 
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })()
));
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(res=>res || fetch(e.request)));
});


  // Network-first pour les navigations HTML (évite les écrans blancs quand index change)
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
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

  // Cache-first pour le reste (CSS/JS/Assets)
  e.respondWith((async () => {
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
