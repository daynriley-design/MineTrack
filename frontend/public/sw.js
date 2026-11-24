// Service worker MineTrack — cache runtime des assets statiques (JS/CSS/images/police)
// pour que l'application se charge même sans réseau après une première visite.
// Les requêtes /api ne sont JAMAIS mises en cache ici : les écritures hors-ligne
// sont gérées par la file IndexedDB (src/utils/offlineQueue.js), pas par le SW.

const CACHE_NAME = 'minetrack-shell-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne jamais intercepter les appels API : ils doivent toujours passer par le réseau
  // (ou échouer proprement pour être pris en charge par la file offline côté axios).
  if (url.pathname.startsWith('/api')) return;

  // Uniquement GET, même origine.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation (chargement de page) : réseau d'abord, repli sur le cache si hors-ligne.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Assets statiques (JS/CSS/images/fonts) : cache d'abord, réseau en secours + mise à jour du cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
