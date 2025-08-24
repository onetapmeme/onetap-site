const CACHE = 'onetap-v4';
const ASSETS = [
  './','./index.html','./style.css','./script.js','./manifest.json',
  // ajoute quelques assets critiques (icônes/logo + premiers sons webp/ogg)
  './assets/onetap_logo.png',
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e=>{
  const {request} = e;
  if (request.method !== 'GET') return;
  e.respondWith((async ()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request).then(res=>{
      if (res && res.status===200) cache.put(request, res.clone());
      return res;
    }).catch(()=>cached);
    return cached || fetchPromise;
  })());
});
