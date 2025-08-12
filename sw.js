const CACHE = 'onetap-v1';
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll([
      './','./index.html','./style.css','./script.js','./manifest.json'
    ])).then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate', e=> e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
