// PWA bootstrap for Abu Shreek
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}
// Load the post-baccalaureate Syrian university guide without changing existing study features.
window.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('script[data-abu-future]')) {
    const s = document.createElement('script');
    s.src = './future.js?v=1';
    s.dataset.abuFuture = '1';
    document.body.appendChild(s);
  }
});
