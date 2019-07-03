const CACHE_KEY = 'v1';
const urlsToCache = ['/', '/main.js'];
const authUrls = ['/login'];
const protectedUrls = ['/protected'];

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

// Here is the main crux of the idea:
// store the auth token in the service worker
let authToken = null;

function interceptRequest(request) {
  const url = new URL(request.url);
  const isSameOrigin = self.location.origin === url.origin;
  const isProtectedUrl = isSameOrigin && protectedUrls.includes(url.pathname);
  const isAuthUrl = isSameOrigin && authUrls.includes(url.pathname);

  // Attach auth token to header only if required
  if (authToken && isProtectedUrl) {
    // Clone headers as request headers are readonly
    const headers = new Headers(Array.from(request.headers.entries()));
    // Attach auth token to header.
    headers.append('Authorization', authToken);
    // Make a new request because clones are readonly
    try {
      request = new Request(request.url, {
        method: request.method,
        headers: headers,
        mode: 'same-origin',
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        body: request.body,
        context: request.context,
      });
    } catch (e) {
      // This will fail for CORS requests. We just continue with the
      // fetch caching logic below and do not pass the ID token.
    }
    return fetch(request);
  } else if (isAuthUrl) {
    // Stash the auth token
    return fetch(request).then(response =>
      response.json().then(data => {
        // Capture the auth token here
        authToken = data.token;

        const newBody = JSON.stringify({
          success: data.success,
          message: data.message,
        });
        // Make a new reponse because clones are readonly
        return new Response(newBody, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(Array.from(response.headers.entries())),
        });
      })
    );
  }

  return fetch(request);
}

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { cacheName: CACHE_KEY }).then(
      response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Cache miss
        return interceptRequest(event.request);
      },
      () => {
        // Failed to open cache
        return interceptRequest(event.request);
      }
    )
  );
});
