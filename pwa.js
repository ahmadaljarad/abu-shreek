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

function applyLevelNavigationFixes() {
  const levelSection = document.getElementById('level');
  if (levelSection) {
    const topbar = levelSection.querySelector('.topbar');
    if (topbar && !topbar.querySelector('[data-back-levels]')) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'btn soft';
      back.setAttribute('data-back-levels', '1');
      back.textContent = '→ اختر مرحلة أخرى';
      back.addEventListener('click', () => {
        if (typeof window.abuShowLevels === 'function') {
          window.abuShowLevels();
          return;
        }
        const chooser = document.getElementById('abuLevelView');
        if (chooser) {
          document.querySelectorAll('main>section').forEach(x => x.classList.add('hidden'));
          document.querySelectorAll('#abuLandingView,#abuFutureView,#abuFitView,#abuInstitutesView').forEach(x => x && x.classList.add('abu-view-hidden'));
          chooser.classList.remove('abu-view-hidden');
          levelSection.classList.add('hidden');
          window.scrollTo({top:0,behavior:'smooth'});
        }
      });
      topbar.insertBefore(back, topbar.firstChild);
    }
  }

  // Force the exact repository SVG to be requested again instead of a cached copy.
  document.querySelectorAll('img[src*="attach.svg"]').forEach(img => {
    img.src = './attach.svg?v=20261002-5';
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  loadStyleOnce('./home-redesign.css?v=20261002-5', 'data-abu-home-style');
  await loadScriptOnce('./home-redesign.js?v=20261002-5', 'data-abu-home').catch(console.error);

  const modules = [
    ['./future.js?v=2','data-abu-future'],
    ['./calculator.js?v=2','data-abu-calculator'],
    ['./upload-study.js?v=3','data-abu-upload-study'],
    ['./grade9-card.js?v=20261002-5','data-abu-grade9-card']
  ];
  modules.forEach(([src, marker]) => loadScriptOnce(src, marker).catch(console.error));

  applyLevelNavigationFixes();
  setTimeout(applyLevelNavigationFixes, 400);

  try {
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'data-abu-supabase');
    await loadScriptOnce('./auth.js?v=20261002-5', 'data-abu-auth');
  } catch (err) {
    console.error('Could not load Abu Shreek authentication', err);
  }
});
