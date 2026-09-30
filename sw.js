const CACHE='abu-shreek-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./study.js','./books.json'];
const RELEASE_BASE='https://github.com/ahmadaljarad/abu-shreek/releases/download/books-v1/';

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.pathname.startsWith('/api/')) return;

  const marker='/Book/';
  const pos=u.pathname.indexOf(marker);
  if(pos!==-1){
    const file=decodeURIComponent(u.pathname.slice(pos+marker.length));
    if(file && !file.includes('/') && file.toLowerCase().endsWith('.pdf')){
      e.respondWith((async()=>{
        try{
          const r=await fetch(RELEASE_BASE+encodeURIComponent(file),{redirect:'follow',cache:'no-store'});
          if(!r.ok) throw new Error('PDF HTTP '+r.status);
          return r;
        }catch(err){
          return new Response('PDF unavailable',{status:502,headers:{'Content-Type':'text/plain; charset=utf-8'}});
        }
      })());
      return;
    }
  }

  e.respondWith((async()=>{
    try{
      const r=await fetch(e.request);
      if(r.ok && u.origin===self.location.origin){
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return r;
    }catch(err){
      const cached=await caches.match(e.request);
      if(cached) return cached;
      if(e.request.mode==='navigate'){
        const shell=await caches.match('./index.html');
        if(shell) return shell;
      }
      return new Response('Offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});