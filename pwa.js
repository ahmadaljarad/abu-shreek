// PWA bootstrap for Abu Shreek
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}

// Supabase authentication configuration.
// The publishable key is intentionally browser-safe. Never put a secret/service-role key here.
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
  loadStyleOnce('./home-redesign.css?v=20261002-2', 'data-abu-home-style');
  loadScriptOnce('./home-redesign.js?v=20261002-2', 'data-abu-home').catch(console.error);

  if (!document.querySelector('script[data-abu-future]')) {
    const s = document.createElement('script'); s.src = './future.js?v=1'; s.dataset.abuFuture = '1'; document.body.appendChild(s);
  }
  if (!document.querySelector('script[data-abu-calculator]')) {
    const c = document.createElement('script'); c.src = './calculator.js?v=1'; c.dataset.abuCalculator = '1'; document.body.appendChild(c);
  }
  if (!document.querySelector('script[data-abu-upload-study]')) {
    const u = document.createElement('script'); u.src = './upload-study.js?v=1'; u.dataset.abuUploadStudy = '1'; document.body.appendChild(u);
  }
  if (!document.querySelector('script[data-abu-grade9-card]')) {
    const g = document.createElement('script'); g.src = './grade9-card.js?v=20261001-2'; g.dataset.abuGrade9Card = '1'; document.body.appendChild(g);
  }

  try {
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'data-abu-supabase');
    await loadScriptOnce('./auth.js?v=20261002-2', 'data-abu-auth');
  } catch (err) {
    console.error('Could not load Abu Shreek authentication', err);
  }
});
