--- sw.js
+++ sw.js
@@
 const CACHE = 'onetap-v5-6-gh';
@@
 self.addEventListener('fetch', (event) => {
   const req = event.request;
 
+  // ➊ Bypass complet des requêtes "Range" (audio/vidéos demandent 206)
+  //   On ne les met pas en cache, on laisse le réseau répondre.
+  const isRange = req.headers && req.headers.has('range');
+  if (isRange) {
+    event.respondWith(fetch(req));
+    return;
+  }
+
   if (req.mode === 'navigate') {
     event.respondWith((async () => {
       try {
-        const fresh = await fetch(req);
-        const cache = await caches.open(CACHE);
-        cache.put(req, fresh.clone());
-        return fresh;
+        const fresh = await fetch(req);
+        // ➋ On ne met en cache la page que si c'est un vrai 200 OK de même origine
+        if (fresh && fresh.ok && fresh.status === 200 && fresh.type === 'basic') {
+          const cache = await caches.open(CACHE);
+          cache.put(req, fresh.clone());
+        }
+        return fresh;
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
-      const fresh = await fetch(req);
-      if (fresh && fresh.ok && req.method === 'GET') {
-        const cache = await caches.open(CACHE);
-        cache.put(req, fresh.clone());
-      }
-      return fresh;
+      const fresh = await fetch(req);
+      // ➌ Mise en cache uniquement si:
+      //    - méthode GET
+      //    - statut 200 (PAS 206)
+      //    - type "basic" (même origine)
+      if (
+        req.method === 'GET' &&
+        fresh && fresh.ok &&
+        fresh.status === 200 &&
+        fresh.type === 'basic'
+      ) {
+        const cache = await caches.open(CACHE);
+        cache.put(req, fresh.clone());
+      }
+      return fresh;
     } catch {
       return cached || Response.error();
     }
   })());
 });
