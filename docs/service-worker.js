const CACHE_NAME = "maesra-cache-v21";

const urlsToCache = [
  "/catalogo-maesra/",
  "/catalogo-maesra/index.html",
  "/catalogo-maesra/style.css",
  "/catalogo-maesra/app.js",
  "/catalogo-maesra/manifest.json",
  "/catalogo-maesra/img/sin_imagen.jpg"
];

// ===============================
// INSTALACIÓN
// ===============================

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_ASSETS);
      })
  );

});

// ===============================
// ACTIVACIÓN
// ===============================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })

      );

    })

  );

  self.clients.claim();

});

// ===============================
// FETCH
// ===============================

self.addEventListener("fetch", event => {

  const request = event.request;

  // ===============================
  // IMÁGENES
  // ===============================

  if (request.destination === "image") {

    event.respondWith(

      caches.match(request).then(cached => {

        if (cached) return cached;

        return fetch(request).then(response => {

          return caches.open(CACHE_NAME).then(cache => {

            cache.put(request, response.clone());

            return response;

          });

        }).catch(() => cached);

      })

    );

    return;

  }

  // ===============================
  // OTROS ARCHIVOS
  // ===============================

  event.respondWith(

    caches.match(request).then(response => {

      return response || fetch(request);

    })

  );

});