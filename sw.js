// Service Worker de Mecánica Expert
// Habilita la instalación de la app (PWA) y el uso sin conexión.
// IMPORTANTE: sube este archivo junto a index.html, en la misma carpeta del repo.
// Cuando publiques una nueva versión de index.html, sube también de un número
// esta constante (v1 -> v2 -> v3...) para que los celulares descarguen los cambios
// en vez de seguir usando la copia guardada en caché.
const CACHE_NAME = 'mecanica-expert-v1';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(() => { /* si falla el precache, la app igual funciona online */ })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fromNetwork = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached); // sin internet: devuelve la copia guardada
      return cached || fromNetwork;
    })
  );
});
