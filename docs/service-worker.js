const CACHE_NAME = "maesra-cache-v9";

const urlsToCache = [
  "/catalogo-maesra/",
  "/catalogo-maesra/index.html",
  "/catalogo-maesra/style.css",
  "/catalogo-maesra/app.js",
  "/catalogo-maesra/productos.json",
  "/catalogo-maesra/manifest.json",
  "/catalogo-maesra/img/sin_imagen.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(fetchResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
          .catch(() => {
            // Si es imagen y falla, mostrar imagen por defecto
            if (event.request.destination === "image") {
              return caches.match("./img/sin_imagen.jpg");
            }
          });
      })
  );
});