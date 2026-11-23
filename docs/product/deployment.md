# Despliegue

El sitio es **estático**: `next build` produce `out/` y no hay servidor, ni base de
datos, ni variables de entorno. Cualquier host de ficheros estáticos sirve; el
proyecto usa Vercel.

## Vercel, paso a paso

1. Entra en <https://vercel.com/new> y elige **Import Git Repository**.
2. Selecciona `car9313/ai-competency-map`.
3. Vercel detecta el framework (**Next.js**) y el comando (**`pnpm build`**). No
   cambies nada.
4. **No añadas variables de entorno.** No hay ninguna.
5. Deploy.

Con `output: 'export'`, Vercel sirve el contenido de `out/` como estático. El
dominio de producción queda en `https://ai-competency-map.vercel.app` y cada push
a `main` despliega solo.

### Qué hace `vercel.json`

| Cabecera | Por qué |
|---|---|
| `X-Content-Type-Options: nosniff` | Evita que el navegador adivine el tipo de un fichero |
| `Referrer-Policy` | No filtra la URL de origen a terceros |
| `X-Frame-Options: DENY` | El sitio no se puede incrustar en un iframe ajeno |
| `Permissions-Policy` | Apaga cámara, micrófono y geolocalización |
| `Content-Security-Policy` | Ver abajo |
| `Cache-Control` en `/_next/static` | Un año e inmutable: los ficheros llevan hash |

### La CSP, y por qué tiene dos excepciones

```
default-src 'self';
script-src  'self' 'unsafe-inline';
style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src    'self' https://fonts.gstatic.com;
```

- **`'unsafe-inline'` en scripts** es necesario porque Next inyecta el bootstrap de
  hidratación en línea. En una exportación estática ese contenido cambia en cada
  build y no se puede fijar por hash. La alternativa sería un servidor que firme
  las respuestas, que es justo lo que este proyecto no tiene.
- **Las fuentes de Google** son una excepción explícita y acotada. Lo correcto
  sería autoalojarlas con `next/font`: elimina la petición a un tercero y la
  excepción. Se intentó y la build de Turbopack de este entorno no resuelve su
  módulo interno de fuentes; queda como mejora pendiente antes que dejar una build
  que solo funciona en una máquina.

Aun con esas concesiones, la CSP bloquea scripts y estilos de dominios externos,
`object`/`embed`, el secuestro de `base-uri`, el envío de formularios a terceros y
la incrustación en iframes.

## Comprobarlo antes de desplegar

```bash
pnpm build
pnpm serve:headers      # sirve out/ CON las cabeceras de vercel.json
```

Abre <http://127.0.0.1:3200> y ejecuta `pnpm a11y` contra esa copia si quieres
verificar con las cabeceras reales.

Este paso existe por un motivo concreto: **un CSP mal escrito no falla en la
build**. Falla en el navegador, en producción. La primera versión de esta
configuración bloqueaba las fuentes y no se habría visto hasta después de
desplegar.

## Verificación tras el despliegue

| Comprobar | Cómo |
|---|---|
| Portada y mapa cargan | `/` y `/mapa` |
| Ruta anidada | `/c/ai-ml-dl-boundaries/comprobar` → 200 |
| Fuentes | El texto no se ve con la fuente del sistema |
| Tema | El botón cambia claro/oscuro y persiste al recargar |
| Consola sin errores | Sin violaciones de CSP |
| 404 | `/ruta-que-no-existe` muestra la página propia |

## Instalable y sin conexión (PWA)

Sale de tres piezas estáticas, sin build aparte:

| Pieza | Archivo | Nota |
|---|---|---|
| Manifest | `public/manifest.webmanifest` | Nombre, iconos, `display: standalone` |
| Iconos | `public/icons/` | 192, 512 y una variante *maskable* |
| Service worker | `public/sw.js` | Estrategia por tipo de recurso |

**Estrategia**, que no es una sola para todo:

- `/_next/static/**` e `/icons/**` → *cache-first*. Llevan el hash del contenido en el
  nombre, así que lo cacheado no puede quedarse obsoleto.
- Navegaciones (HTML) → *network-first* con vuelta a caché. Una versión nueva llega al
  recargar; sin conexión se sirve lo último visto.
- Todo lo demás → red, y si falla no hay respuesta inventada.

**Dos cabeceras importan** y están en `vercel.json`:

- `/sw.js` con `max-age=0, must-revalidate`. Un service worker cacheado es un service
  worker que no se actualiza, y el fallo se ve semanas después.
- `/manifest.webmanifest` con `application/manifest+json`.

**Al desplegar una versión nueva** que cambie la estrategia, sube `VERSION` en `sw.js`.
El `activate` borra las cachés que no sean la actual.

**Cómo comprobarlo:**

1. Abre la app, navega por tres o cuatro páginas.
2. DevTools → Application → Service Workers: debe aparecer activo.
3. Application → Cache Storage: `acm-v1` con las rutas visitadas.
4. DevTools → Network → *Offline*, recarga: la página sale del caché.
## Otros hosts

Sirve `out/` como estático. Dos detalles:

- **Sin `vercel.json`**: replica las cabeceras en la configuración del host.
- **GitHub Pages**: requiere `basePath` y `assetPrefix` en `next.config.ts`, más un
  `.nojekyll`. No está configurado.

## Lo que no hay que hacer

- No añadir `«rewrites»` para las rutas: la exportación ya genera
  `mapa.html` y `c/<id>/comprobar.html`, y Vercel resuelve ambas sin ayuda.
- No pasar el build a servidor (`output: 'server'`): rompe el principio de coste
  cero y obliga a tener backend.
