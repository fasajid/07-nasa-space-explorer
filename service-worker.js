const CACHE_NAME = "nasa-space-explorer-v3";
const NASA_API_CACHE_NAME = "nasa-space-explorer-api-v1";
const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./js/dateRange.js",
  "./js/script.js",
  "./img/NASA-Logo-Large.jpg",
  "./img/nasa-worm-logo.png"
];
const APP_SHELL_URLS = new Set(
  APP_SHELL_FILES.map((file) => new URL(file, self.registration.scope).href)
);

self.addEventListener("install", (event) => {
  // Save the files needed to display the app.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  // Remove older versions of this app's cache.
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) =>
            cacheName.startsWith("nasa-space-explorer-") &&
            cacheName !== CACHE_NAME &&
            cacheName !== NASA_API_CACHE_NAME
          )
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  // Try NASA first, save successful responses, and use saved data if the network fails.
  if (
    request.method === "GET" &&
    requestUrl.origin === "https://api.nasa.gov" &&
    requestUrl.pathname === "/planetary/apod"
  ) {
    event.respondWith(
      caches.open(NASA_API_CACHE_NAME)
        .then(async (cache) => {
          const cachedResponse = await cache.match(request);

          try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
              await cache.put(request, networkResponse.clone());
              return networkResponse;
            }

            return cachedResponse || networkResponse;
          } catch (error) {
            if (cachedResponse) {
              return cachedResponse;
            }

            throw error;
          }
        })
    );
    return;
  }

  // Use cache-first for app shell files; let other requests use the browser network.
  if (
    request.method !== "GET" ||
    requestUrl.origin !== self.location.origin ||
    !APP_SHELL_URLS.has(requestUrl.href)
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
          await cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      })
  );
});
