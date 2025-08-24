// v5.2 stale-while-revalidate + version purge
const CACHE = 'onetap-v5-2';
const PRECACHE = [
  './','./index.html','./style.css','./script.js','./manifest.json',
  // assets clés
  'assets/onetap_logo.png','assets/onetap_gold.png','assets/tap2enter_pc_static.png',
  'assets/roulette_tick.ogg','assets/explosion.ogg','assets/music_welcome.ogg','assets/music_main.ogg','assets/music_epic.ogg','assets/drop_rare.ogg'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async ()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then(res=>{
      // éviter de mettre en cache les iframes externes etc.
      const sameOrigin = new URL(req.url).origin === location.origin;
      if (sameOrigin && res && res.status===200) cache.put(req, res.clone());
      return res;
    }).catch(()=>cached);
    return cached || fetchPromise;
  })());
});
