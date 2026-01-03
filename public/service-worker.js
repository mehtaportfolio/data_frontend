const CACHE_NAME = 'secure-vault-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('fetch', event => {
  // Navigation fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => {
      return caches.match('/index.html');
    }));
    return;
  }

  // Cache first for static assets, Network first for API
  event.respondWith(caches.match(event.request).then(response => {
    if (response) {
      return response;
    }
    return fetch(event.request);
  }));
});
