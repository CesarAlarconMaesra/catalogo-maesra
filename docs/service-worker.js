const CACHE_NAME = "maesra-cache-v17";

const urlsToCache = [
  "/catalogo-maesra/",
  "/catalogo-maesra/index.html",
  "/catalogo-maesra/style.css",
  "/catalogo-maesra/app.js",
  "/catalogo-maesra/manifest.json",
  "/catalogo-maesra/img/sin_imagen.jpg"
];

// INSTALACIÓN
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener("fetch", event => {

  // NO cachear productos.json (para que precios se actualicen)
  if (event.request.url.includes("productos.json")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;

        return fetch(event.request)
          .then(fetchResponse => {
            if (event.request.method === "GET") {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return fetchResponse;
          })
          .catch(() => {
            if (event.request.destination === "image") {
              return caches.match("/catalogo-maesra/img/sin_imagen.jpg");
            }
          });
      })
  );
});