# Mapa de navegación

Las rutas del producto, su modo de renderizado y por qué. Con exportación estática no hay middleware ni route handlers: **todo lo que no se conoce en build no existe** ([ADR-001](../architecture/adr/ADR-001-nextjs-estatico.md)).

---

## 1. Rutas

| Ruta                   | Pantalla                            | Modo                              | Datos que necesita                    |
| ---------------------- | ----------------------------------- | --------------------------------- | ------------------------------------- |
| `/`                    | **Hoy**: cola de repaso y estado    | Client Component                  | Intentos del almacenamiento local      |
| `/mapa`                | Mapa (grafo vertical)               | Servidor + isla cliente           | Grafo estático + intentos locales      |
| `/mapa/tarjetas`       | Roadmap en tarjetas                 | Servidor (HTML estático)          | Tarjetas por área, indexable           |
| `/repaso`              | Sesión de repaso                    | Servidor + isla cliente           | Recorre la cola del día, ítem a ítem   |
| `/c/[competencyId]`    | Lección y comprobación              | Estática + isla cliente           | Contenido en build + intentos locales  |
| `/diagnostico`         | Diagnóstico inicial (12 preguntas)  | Servidor + isla cliente           | Selección determinista + intentos      |
| `/rutas`               | Camino hasta un objetivo            | Servidor + isla cliente           | Grafo en build + estado por nodo       |
| `/historial`           | Intentos y su efecto                | Client Component                  | Solo tiene sentido con intentos locales |
| `/acerca`              | Qué es esto y por qué               | Estática                          | Contenido en build                     |
| `not-found`            | 404                                 | Estática                          | —                                      |

Ocho rutas. Las tres últimas no son contenido: son formas de mirar el mismo estado (`/diagnostico` para entrar, `/rutas` para planificar, `/historial` para auditar). Cualquier pantalla adicional tiene que justificarse contra el [guion de demo](vision.md#el-guion-de-demo) antes de existir.

### Por qué `/` es la cola y no el catálogo

Con repaso espaciado, lo que el producto tiene que decirte al entrar es **qué toca hoy**, no qué existe. El mapa está a un clic, pero no es la puerta: una lista de cursos no te dice nada sobre lo que estás a punto de olvidar.

---

## 2. Modo de renderizado y por qué

| Ruta                | Renderizado                    | Razón                                                                 |
| ------------------- | ------------------------------ | --------------------------------------------------------------------- |
| `/`                 | Cliente                        | Depende de `localStorage`; no hay HTML útil que prerenderizar          |
| `/mapa`             | Cliente                        | Filtros interactivos y estado por nodo derivado de intentos            |
| `/c/[competencyId]` | **Servidor, generado en build** | Es la única página con valor de SEO y de enlace compartible. HTML real |
| `/acerca`           | Servidor, generado en build     | Contenido puro                                                         |
| `not-found`         | Estático                        | —                                                                      |

La página de competencia se genera con `generateStaticParams()` a partir del grafo: **37 rutas conocidas en build**. Si una competencia no existe en el grafo, la ruta no existe, y el 404 lo resuelve Next sin código nuestro.

Dentro de `/c/[competencyId]`, la comprobación es una **isla cliente** (`'use client'`) montada al pulsar "Empezar comprobación". Así el contenido se sirve como HTML y solo se hidrata lo que necesita estado.

> **Regla de presupuesto:** si aparece un sexto `'use client'` por limitación del framework y no por diseño, se revisa [ADR-001](../architecture/adr/ADR-001-nextjs-estatico.md#disparadores-de-reversión).

---

## 3. Parámetros de URL

Todo estado que merece ser compartido vive en la URL ([regla de estado](../architecture/tech-stack.md#3-estado-y-persistencia)):

| Ruta             | Parámetros                                     | Efecto                                    |
| ---------------- | ---------------------------------------------- | ----------------------------------------- |
| `/mapa`          | `?area=<areaId>`                               | Filtra por área                            |
| `/mapa`          | `?capa=nucleo\|servicio\|interfaz`             | Filtra por capa (base del filtro por rol)  |
| `/mapa`          | `?estado=<state>`                              | Filtra por estado de competencia           |
| `/`              | sin parámetros                                | La cola no se comparte: es personal        |

Los parámetros son aditivos y combinables. Un enlace como `/mapa?capa=nucleo&area=generative-llms` es válido y se puede pegar en cualquier sitio.

> **Nota de implementación.** Las dos vistas del mapa son **rutas**, no pestañas con estado: `/mapa` (grafo) y `/mapa/tarjetas` (listado). Se hace así porque con exportación estática `searchParams` no existe en build y resolver la vista por la URL habría dejado el HTML vacío. Cada vista se sirve completa y la navegación entre ellas la resuelve Next sin recargar.
>
> Los filtros sí usan la URL, pero se aplican **solo al diagrama** (isla cliente). El listado de tarjetas es HTML estático completo: es lo que hace indexable y compartible cada competencia, y es la razón de haber elegido Next.js.

**Lo que nunca va en la URL:** el progreso, el ítem actual, la sesión de repaso. No es compartible ni tiene sentido recargarlo.

---

## 4. Estados por pantalla

Cada pantalla tiene que declarar sus cuatro estados. Sin esto, la primera vez que el almacenamiento esté vacío la interfaz miente.

| Pantalla | Vacío                          | Con datos                | Error                    | Sin almacenamiento        |
| -------- | ------------------------------ | ------------------------ | ------------------------ | ------------------------- |
| `/`      | "No hay repasos para hoy" + CTA al mapa | Lista de vencidos       | Aviso y reintento        | Aviso explícito y modo sesión |
| `/mapa`  | Imposible (siempre hay grafo)  | Mapa con cuatro estados  | Carga del grafo falla en build | Mapa en estado "sin evidencia" |
| `/c/[id]`| —                              | Lección + comprobación   | —                        | Comprobación deshabilitada con motivo |

El caso "sin almacenamiento" no es hipotético: el navegador en modo privado o con `localStorage` bloqueado lo produce. Se detecta al arrancar y se informa.

---

## 5. Grafo de navegación

```text
                  ┌──────────────┐
                  │  /  (Hoy)    │◄──────────────┐
                  │ cola de repaso│               │
                  └──────┬───────┘               │
                         │                       │
        ┌────────────────┼────────────────┐      │
        ▼                ▼                ▼      │
   ┌─────────┐     ┌─────────────┐   ┌────────┐  │
   │  /mapa  │────►│ /c/[id]     │──►│/acerca │  │
   │  grafo  │◄────│ lección +   │   └────────┘  │
   └─────────┘     │ comprobación│               │
                   └──────┬──────┘               │
                          │ tras responder       │
                          └──────────────────────┘

   Regreso siempre disponible: "Volver a hoy" y "Volver al mapa".
```

Sin navegación anidada: tres destinos y un acerca. Cualquier profundidad extra es una lista, no una ruta.

---

## 6. Accesibilidad y foco

| Regla                                                          | Motivo                                          |
| -------------------------------------------------------------- | ----------------------------------------------- |
| Un solo `<h1>` por página                                      | Estructura predecible para lectores de pantalla |
| Al cambiar de ruta, el foco va al `<h1>` y se anuncia el cambio | Con SPA el foco se queda en el enlace pulsado   |
| Enlace "saltar al contenido" antes de la navegación            | Evita tabular por todo el menú                  |
| El mapa es navegable con teclado y tiene versión en lista      | Un SVG no es accesible por defecto              |
| Estado nunca solo por color (icono + texto)                    | Daltonismo                                      |
| `prefers-reduced-motion` respetado                             | Sin animaciones por decoración                  |

El mapa es el punto duro: se implementa como **lista de nodos navegable con teclado**, con el SVG como representación visual enlazada. La lista es la fuente de verdad de interacción.

---

## 7. Lo que no es una ruta

| Cosa                       | Por qué no                                           |
| -------------------------- | ---------------------------------------------------- |
| Ítem individual (`/i/[id]`) | Los ítems se presentan en sesión, no por enlace       |
| Ajustes                    | La meta diaria vive en `localStorage` con un control inline |
| Perfil de usuario          | No hay usuarios en la v1                              |
| Búsqueda                   | El filtro del mapa cubre el caso hasta ~150 ítems     |
| Rutas por idioma           | Solo español en la v1 ([ADR-001](../architecture/adr/ADR-001-nextjs-estatico.md)) |

---

## 8. Criterio de aceptación

La navegación está bien cuando el guion de demo se recorre sin tocar la barra de direcciones más de tres veces:

| Escena de la demo | Ruta        |
| ----------------- | ----------- |
| 0:00–0:30 El mapa | `/mapa`     |
| 0:30–1:30 Lección | `/c/[id]`   |
| 1:30–3:30 Comprobar | `/c/[id]` (inline) |
| 3:30–4:30 Cola y desbloqueo | `/`  |

Cuatro escenas, tres rutas. Si una escena necesitara dos rutas más, el diseño de navegación está mal, no el guion.
