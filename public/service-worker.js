const CACHE_KEY = 'v1';
const urlsToCache = ['/', '/main.js'];

self.addEventListener('install', event => {
  // Add files to cache
  event.waitUntil(
    caches.open(CACHE_KEY).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Skip waiting for next page load and immediately take over
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      // Continue with fetch
      return fetch(event.request);
    })
  );
});
