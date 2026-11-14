const CACHE="bank-codes-v27";
const SHELL=["./","index.html","config.js","demo-seed.js","supabase.js","manifest.webmanifest","icon-192.png","apple-touch-icon.png","leaflet.js","leaflet.css"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const u=new URL(e.request.url);
  const same=u.origin===self.location.origin;
  const fonts=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same && !fonts) return;
  const fresh = same && (e.request.mode==="navigate" || /\/(index\.html|config\.js)?$/.test(u.pathname) || u.pathname.endsWith("config.js"));
  e.respondWith(caches.open(CACHE).then(async c=>{
    if(fresh){
      try{ const r=await fetch(e.request); if(r.ok) c.put(e.request, r.clone()); return r; }
      catch(err){ return (await c.match(e.request,{ignoreSearch:true})) || (await c.match("index.html")); }
    }
    const hit=await c.match(e.request);
    const net=fetch(e.request).then(r=>{ if(r && (r.ok||r.type==="opaque")) c.put(e.request,r.clone()); return r; }).catch(()=>hit);
    return hit || net;
  }));
});
