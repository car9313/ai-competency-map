# ADR-001 — Next.js con exportación estática

- **Estado:** aceptado
- **Ámbito:** stack, despliegue
- **Sustituye a:** la elección implícita de Vite + SPA del proyecto anterior

## Contexto

El producto es un conjunto de páginas de contenido (competencia, lección) más tres pantallas interactivas (mapa, ítem, cola de repaso). No hay datos por usuario salvo los que viven en el propio navegador. El presupuesto de infraestructura es cero y el objetivo secundario es que el proyecto sea indexable, porque buena parte de su valor como pieza de portfolio es que se pueda encontrar y compartir por enlace.

La aplicación anterior era una SPA de Vite con un `useState` como router: sin URLs, sin SEO, sin enlaces compartibles.

## Decisión

**Next.js con App Router y `output: 'export'`.** La aplicación se compila a HTML estático y se sirve desde cualquier hosting gratuito. No hay servidor, ni funciones, ni runtime.

## Alternativas consideradas

| Alternativa            | A favor                                                  | En contra                                                                   |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Vite + React Router**| Ya conocido, arranque instantáneo                        | Sin SEO; rutas en cliente; habría que construir el prerenderizado a mano     |
| **Astro**              | Ideal para contenido, HTML mínimo, islas de interactividad | El producto es una app con estado interactivo; el modelo de islas añade fricción justo donde más trabajamos |
| **Remix / React Router 7** | Buen modelo de datos                                  | Su fuerza está en el servidor, y aquí no hay servidor                        |
| **SPA con react-snap** | Mantiene la stack anterior                               | Herramienta frágil para un requisito que el framework debería dar de serie    |

## Consecuencias

**Positivas**

- Toda competencia y lección tiene URL propia, metadatos y primera carga sin JavaScript de datos.
- Despliegue gratuito y sin mantenimiento.
- Sin superficie de ataque: no hay servidor que comprometer.

**Negativas y costes**

- Hay que respetar la frontera servidor/cliente: un componente que use `localStorage` no puede ser de servidor. Se resuelve con Client Components explícitos.
- Con exportación estática no hay rutas dinámicas sin `generateStaticParams`, y el contenido tiene que ser conocido en build. Es exactamente nuestro caso.
- Menos control sobre el arranque que con Vite; el primer `dev` es más lento.

## La alternativa real: Vite + React Router

Conviene formular la disyuntiva bien: no es "React contra Next.js", porque React es la librería en ambos casos. La diferencia es **dónde se genera el HTML**: en build o en el navegador.

| Aspecto                                  | Vite + React Router | Next.js con exportación estática |
| ---------------------------------------- | ------------------- | -------------------------------- |
| Modelo mental                            | Uno                  | Dos (servidor y cliente)          |
| Arranque en desarrollo                   | Instantáneo          | Más lento, y a veces con caché que engaña |
| HTML prerenderizado por página           | ❌ Hay que montarlo a mano | ✅ De serie                  |
| Enlaces compartibles, previews, indexado | Débil                | Fuerte                            |
| Optimización de imágenes                 | La que tú hagas      | Limitada en export (`unoptimized`) |
| Middleware, ISR, Server Actions          | No existen           | Existen, pero **no en export**     |
| Curva para quien ya sabe React           | Ninguna              | Media (fronteras `'use client'`)  |

**El punto clave:** de las cuatro pantallas del producto, tres (mapa, ítem, cola de repaso) son interactivas y usan `localStorage`, así que **serán Client Components igualmente**. La ventaja de Next.js se concentra en un solo sitio: las ~36 páginas de lección, que sí deben ser HTML indexable.

Dicho de otro modo: no estás eligiendo Next.js por su potencia, sino por **36 páginas**. Si el SEO no fuera un objetivo declarado, la respuesta sería Vite sin dudarlo.

## El crecimiento incremental, que es el argumento decisivo

El argumento de las 36 páginas explica la v1. No explica la v2.

Lo que ninguna alternativa ofrece es **pasar de estático a dinámico ruta por ruta, sin cambiar de arquitectura**:

| Hoy                        | Si mañana hay base de datos y API                                        |
| -------------------------- | ------------------------------------------------------------------------ |
| `output: 'export'`         | Se quita el export y solo las rutas de datos pasan a servidor            |
| Sin backend                | `app/api/*` o Server Actions en el mismo proyecto y el mismo despliegue   |
| Tipos compartidos en un repo | Siguen compartidos: servidor y cliente son el mismo código              |
| Sin CORS                   | No hay CORS, porque no hay dos orígenes                                  |

Con Vite, el día que haga falta servidor la elección es binaria: un backend aparte (otro despliegue, CORS, tipos duplicados) o migrar la cáscara.

**Corrección al planteamiento inicial.** "Base de datos y API" esconde dos futuros muy distintos:

- **Proveedor con autorización por políticas de fila** (Supabase y similares, que además gestionan la identidad): el navegador habla directo con él y **no hace falta servidor propio**. La exportación estática sigue valiendo y Next.js no aporta mucho más que las 36 páginas.
- **Servidor propio** que guarda secretos o aplica reglas de negocio (por ejemplo, llamar a un modelo con una clave privada): aquí Next.js gana claramente.

Y el balance del riesgo: elegir Next.js y no necesitar nunca servidor cuesta fricción; elegir Vite y necesitarlo después cuesta un backend separado para siempre o una migración. Como el dominio es agnóstico del framework ([ADR-002](ADR-002-dominio-puro.md)), ninguno de los dos errores es grave: el primero cuesta comodidad, el segundo cuesta uno o dos días.

## Disparadores de reversión

Esta es una decisión de **bajo arrepentimiento**, porque el dominio es agnóstico del framework ([ADR-002](ADR-002-dominio-puro.md)): ni una línea de `features/*/domain` ni de `application` sabe que Next.js existe. Cambiar la cáscara es trabajo de uno o dos días, no una reescritura.

Se revierte a Vite si ocurre cualquiera de estas cosas:

1. **Más de un día perdido** en errores de hidratación o de serialización entre servidor y cliente.
2. Hay que añadir `'use client'` a **más de cinco** componentes por una limitación del framework, no por diseño.
3. La exportación estática bloquea una funcionalidad de la fase 1 (por ejemplo, un control de tiempo que necesita rutas dinámicas).
4. El SEO deja de ser un objetivo, por ejemplo si el proyecto se queda como pieza privada de portfolio.

## Criterio de revisión

Se revisa si el producto necesitara datos de servidor (cuentas, sincronización) o si la exportación estática bloqueara una funcionalidad de la fase 2.

Y se revierte según los disparadores de la sección anterior, sin necesidad de un ADR nuevo: la reversión ya está decidida aquí.
