// Abu Shreek bootstrap.
// Remove old service workers/caches: Safari was retaining stale application code.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister())).catch(()=>{});
}
if ('caches' in window) {
  caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(()=>{});
}

window.ABU_AUTH_CONFIG = {
  url: 'https://yaykzzetgwwqhzaoikrz.supabase.co',
  anonKey: 'sb_publishable_g0dBkbaAksKoJRfarPyWIA_iHods3XE'
};

function loadScriptOnce(src, marker) {
  return new Promise((resolve, reject) => {
    const old = document.querySelector(`script[${marker}]`);
    if (old) {
      if (old.dataset.loaded === '1') return resolve();
      old.addEventListener('load', resolve, { once: true });
      old.addEventListener('error', reject, { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.setAttribute(marker, '1');
    s.onload = () => { s.dataset.loaded = '1'; resolve(); };
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

function loadStyleOnce(href, marker) {
  if (document.querySelector(`link[${marker}]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  l.setAttribute(marker, '1');
  document.head.appendChild(l);
}

window.addEventListener('DOMContentLoaded', async () => {
  loadStyleOnce('./home-redesign.css?v=20261002-6', 'data-abu-home-style');
  await loadScriptOnce('./home-redesign.js?v=20261002-6', 'data-abu-home').catch(console.error);

  const modules = [
    ['./future.js?v=2','data-abu-future'],
    ['./calculator.js?v=2','data-abu-calculator'],
    ['./upload-study.js?v=4','data-abu-upload-study'],
    ['./grade9-card.js?v=20261002-6','data-abu-grade9-card']
  ];
  modules.forEach(([src, marker]) => loadScriptOnce(src, marker).catch(console.error));
  await loadScriptOnce('./navigation-fix.js?v=20261002-1','data-abu-navigation-fix').catch(console.error);

  try {
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'data-abu-supabase');
    await loadScriptOnce('./auth.js?v=20261002-6', 'data-abu-auth');
  } catch (err) {
    console.error('Could not load Abu Shreek authentication', err);
  }
});
