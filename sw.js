const CACHE = 'onetap-v2';
const CORE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/onetap_logo.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e=>{
  e.respondWith((async ()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    const fetchPromise = fetch(e.request).then(res=>{
      if(res && res.status===200 && e.request.method==='GET'){
        cache.put(e.request, res.clone());
      }
      return res;
    }).catch(()=>cached);
    return cached || fetchPromise;
  })());
});
