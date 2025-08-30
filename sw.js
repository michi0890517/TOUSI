const VERSION = 'mentor-v1';
const CACHE = `mentor-cache-${VERSION}`;
const ASSETS = ['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k===CACHE?null:caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    e.respondWith(fetch(req).then(res=>{caches.open(CACHE).then(c=>c.put('./index.html',res.clone())); return res;}).catch(()=>caches.match('./index.html')));
  }else{
    e.respondWith(caches.match(req).then(cached=> cached || fetch(req).then(res=>{ caches.open(CACHE).then(c=>c.put(req,res.clone())); return res; })));
  }
});
