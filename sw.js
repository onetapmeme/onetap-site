const CACHE = 'onetap-v4.3';
const PRECACHE = [
  './','./index.html','./style.css','./script.js','./manifest.json',
  './assets/onetap_logo.png','./assets/tap2enter_pc_static.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  e.respondWith((async ()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then(res=>{
      if(res && res.status===200 && req.method==='GET'){ cache.put(req, res.clone()); }
      return res;
    }).catch(()=>cached);
    return cached || fetchPromise;
  })());
});
