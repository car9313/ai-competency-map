/**
 * Service worker: la app se puede usar sin conexión.
 *
 * Estrategia por tipo de recurso, y no una sola para todo:
 *
 * - **Assets con hash** (`/_next/static/…`): cache-first. El nombre incluye el hash del
 *   contenido, así que un asset cacheado nunca queda obsoleto.
 * - **Navegaciones** (HTML): network-first con vuelta a caché. Así una versión nueva llega
 *   al recargar, y sin conexión se sirve lo último que se vio.
 * - **Todo lo demás**: red, y si falla, nada. No se inventan respuestas.
 *
 * El nombre de la caché lleva versión. Cambiarlo es la forma de forzar la limpieza: en
 * `activate` se borran todas las cachés que no sean la actual.
 */

const VERSION = 'v1';
const CACHE = `acm-${VERSION}`;

/** Rutas que se precargan para que la primera visita sin conexión ya sirva. */
const PRECACHE = ['/', '/mapa', '/mapa/tarjetas', '/repaso', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Las fuentes de Google se cachean aparte: no son del origen y su URL no cambia.
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            const copy = response.clone();

            void caches.open(CACHE).then((cache) => cache.put(request, copy));

            return response;
          }),
      ),
    );

    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          void caches.open(CACHE).then((cache) => cache.put(request, copy));

          return response;
        })
        /*
         * Sin red: lo cacheado de esa misma URL. Si es la primera visita a esa página y no
         * hay nada guardado, se cae al inicio, que sí está precargado.
         */
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match('/'))),
    );
  }
});
