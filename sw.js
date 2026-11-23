const CACHE='dale-v1-20261123a';
const FILES=["./","./index.html","./styles.css","./data.js","./core.js","./app.js","./manifest.webmanifest","./assets/icon.svg","./assets/apple.svg","./assets/bread.svg","./assets/coffee.svg","./assets/water.svg","./assets/cheese.svg","./assets/fish.svg","./assets/house.svg","./assets/tree.svg","./assets/sun.svg","./assets/mountain.svg","./assets/bike.svg","./assets/train.svg","./assets/book.svg","./assets/key.svg","./assets/clock.svg","./assets/flower.svg","./assets/table.svg","./assets/chair.svg"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dale-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
  return response;
 }).catch(async()=>{const hit=await caches.match(event.request);if(hit)return hit;if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error();}));
});
