const CACHE_NAME = 'clearpath-shell-v1';
const SHELL_URLS = ['/', '/dispatch', '/about', '/how-it-works'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Remove old caches that don't match the current name
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept same-origin GET requests for shell pages
  const url = new URL(event.request.url);
  const isShell = SHELL_URLS.includes(url.pathname);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin || event.request.method !== 'GET' || !isShell) {
    // Pass through non-shell requests (API calls, SSE, etc.)
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
