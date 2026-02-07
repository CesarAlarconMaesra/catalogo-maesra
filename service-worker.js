const CACHE_NAME = "maesra-cache-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./productos.json",
  "./manifest.json",
  "./img/sin_imagen.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});