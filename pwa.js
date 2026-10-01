// PWA bootstrap for Abu Shreek
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}
// Load extra modules without changing existing study features.
window.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('script[data-abu-future]')) {
    const s = document.createElement('script');
    s.src = './future.js?v=1';
    s.dataset.abuFuture = '1';
    document.body.appendChild(s);
  }
  if (!document.querySelector('script[data-abu-calculator]')) {
    const c = document.createElement('script');
    c.src = './calculator.js?v=1';
    c.dataset.abuCalculator = '1';
    document.body.appendChild(c);
  }
  if (!document.querySelector('script[data-abu-upload-study]')) {
    const u = document.createElement('script');
    u.src = './upload-study.js?v=1';
    u.dataset.abuUploadStudy = '1';
    document.body.appendChild(u);
  }
});
