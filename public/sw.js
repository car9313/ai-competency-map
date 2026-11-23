/**
 * Service worker: la app se puede usar sin conexión, incluidas las navegaciones dentro de
 * la app.
 *
 * La primera versión cacheaba los assets y las navegaciones de documento, y no bastaba: al
 * pulsar un enlace, Next no pide un documento, pide el payload RSC de la ruta destino
 * (`/ruta.txt`, unos 300 KB). Sin él, el router se queda esperando y la navegación falla
 * aunque la app siga pintada.
 *
 * Estrategia por tipo de recurso:
 *
 * - **Assets con hash** (`/_next/static/**`, `/icons/**`): cache-first. El nombre lleva el
 *   hash del contenido, así que lo cacheado no puede quedarse obsoleto.
 * - **Todo lo demás del mismo origen**: network-first con vuelta a caché. Cubre HTML,
 *   payloads RSC, `contenido.json` y cualquier cosa que Next invente más adelante.
 * - **Navegaciones sin copia**: se sirve el inicio, que está precargado.
 *
 * El precacheo es corto a propósito: las ocho rutas de primer nivel con su payload, más los
 * assets. Son unos 6 MB. Precachear las 88 páginas serían más de 100 MB: la app en el móvil
 * no debe costar eso. Las rutas profundas se cachean al visitarlas, y como Next precarga los
 * enlaces al mostrarlos, en la práctica basta con usar la app para tenerlas.
 */

const VERSION = 'v2';
const CACHE = `acm-${VERSION}`;

/**
 * Rutas de primer nivel: su HTML y su payload RSC.
 *
 * Cada navegación de la barra lateral necesita las dos piezas: el HTML para una recarga
 * completa y el `.txt` para la transición del router.
 */
const ROUTES = [
  '/',
  '/mapa',
  '/mapa/tarjetas',
  '/repaso',
  '/rutas',
  '/diagnostico',
  '/historial',
  '/acerca',
];

const RSC_PAYLOADS = [
  '/index.txt',
  '/mapa.txt',
  '/mapa/tarjetas.txt',
  '/repaso.txt',
  '/rutas.txt',
  '/diagnostico.txt',
  '/historial.txt',
  '/acerca.txt',
  '/_not-found.txt',
];

const PRECACHE = [...ROUTES, ...RSC_PAYLOADS, '/manifest.webmanifest', '/contenido.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);

      /*
       * Uno a uno y no `addAll`: `addAll` es todo o nada, así que un solo recurso que falle
       * dejaría la app sin precacheo completo. Con `allSettled` se guarda lo que se pueda.
       */
      await Promise.allSettled(
        PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
      );

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

const IMMUTABLE = ['/_next/static/', '/icons/'];

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);

  if (hit) return hit;

  const response = await fetch(request);

  if (response.ok) cache.put(request, response.clone());

  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request);

    // Solo se guarda lo que salió bien: cachear un 500 convierte un fallo pasajero en uno
    // permanente hasta la siguiente versión.
    if (response.ok) cache.put(request, response.clone());

    return response;
  } catch {
    const hit = await cache.match(request);

    if (hit) return hit;

    // Navegar a una ruta nunca visitada sin conexión: al menos se llega a algún sitio.
    if (request.mode === 'navigate') {
      const inicio = await cache.match('/');

      if (inicio) return inicio;
    }

    return new Response('Sin conexión y sin copia guardada de esta página.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  const immutable = IMMUTABLE.some((prefix) => url.pathname.startsWith(prefix));

  event.respondWith(immutable ? cacheFirst(request) : networkFirst(request));
});
