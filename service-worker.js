const CACHE_NAME = "maesra-cache-v2";

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
      .then(response => response || fetch(event.request))
  );
});