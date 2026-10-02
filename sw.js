// Abu Shreek service worker — caching disabled intentionally.
// This clears old PWA caches and stops stale JavaScript from controlling Safari.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Do not intercept fetch requests. The browser always receives the current files.
self.addEventListener('fetch', () => {});
