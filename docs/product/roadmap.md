# Roadmap

Tres fases. Sin fechas: cada fase se cierra con **criterios de salida verificables**, no con un calendario. Si los criterios de una fase no se cumplen, la siguiente no empieza.

La regla organizadora: **cada fase tiene que ser demostrable por sí sola**. Una fase que solo produce andamiaje ha fracasado.

---

## Fase 1 — Núcleo demostrable

**Objetivo:** demostrar la tesis de punta a punta sobre una sola cadena, antes de escribir contenido real.

| Se construye                                                                 | Por qué                                                                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Montaje del proyecto: Next.js App Router (exportación estática), TypeScript estricto, Tailwind, pnpm, Vitest | Hosting sin coste, SEO en build, ningún servidor que mantener |
| `features/assessment/domain`: modelo, invariantes, planificador (R1–R12), proyecciones | Es aquello de lo que va el proyecto                      |
| Puerto de almacenamiento + adaptador `localStorage`                          | Los intentos persisten sin backend                                      |
| Puerto `Clock` con el reloj del sistema, sin control de tiempo ([ADR-007](../architecture/adr/ADR-007-sin-control-de-tiempo.md)) | Los tests inyectan un reloj fijo; el producto no lo sustituye |
| Una cadena completa: 1 área → 3 competencias → 3 lecciones → 12 ítems         | Suficiente para recorrer la demo, pequeño para terminar                 |
| Vista de mapa, vista de lección, vista de ítem, cola de repaso               | Son las cuatro pantallas de la demo                                      |

**Criterios de salida**

- El guion de demo cubre las escenas de 0:30 a 4:30 sin tocar código.
- Suite del planificador en verde, incluidos los tests de propiedades de I12–I14.
- `pnpm build` produce un sitio estático que funciona sin servidor.
- Ningún `Date.now()` fuera del adaptador de reloj (impuesto por regla de lint).
- Ningún `CompetencyState` ni `ItemSchedule` escrito en el almacenamiento (impuesto por un test sobre el adaptador).

**Fuera explícitamente:** volumen real de contenido, búsqueda, i18n, autenticación, IA, animaciones.

---

## Fase 2 — Contenido y mapa

**Objetivo:** el producto pasa de demostrable a útil.

| Se construye                                                          | Por qué                                                          |
| --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Grafo de competencias: 39 competencias en 8 áreas, con eje de capa (`núcleo` / `servicio` / `interfaz`) | Es el mapa por el que navega el alumno |
| ~156 ítems con justificación por distractor                            | Es el suministro de evidencia                                     |
| Linter de contenido (R1–R7) conectado a CI                             | Evita que la calidad decaiga según crece el contenido             |
| UI completa del grafo con cuatro estados, filtros y URLs compartibles  | Navegación y capacidad de compartir                               |
| SEO: metadatos por competencia, generación estática                    | Descubribilidad, y argumento de portfolio                         |
| Flujo de autoría de contenido documentado                              | Para que el modelo sea repetible                                  |

**Estado: completada.** 39 de 39 competencias publicadas, con lección y 4 ítems cada una: 39 lecciones y 156 ítems, con 0 errores y 0 avisos del linter. El mapa no muestra ningún nodo «próximamente».

El **estado detallado** por área está en [content-status.md](content-status.md), que se genera desde el catálogo con `pnpm content:status` y por tanto no se puede quedar desactualizado.

El contenido se escribe **un archivo por área** (`src/content/area-NN-*.ts`) que exporta `LESSONS_AREA_NN` e `ITEMS_AREA_NN` y se suma al catálogo en `src/content/index.ts`. Así una persona cierra un área completa y `pnpm validate:content` dice si cumple; ver [content-authoring](../contributing/content-authoring.md#patrón-por-área).

**Criterios de salida**

- El linter rechaza un ítem roto a propósito en CI (esto es en sí una escena de la demo). ✅
- Toda competencia tiene ≥ 1 lección y ≥ 3 ítems, verificado por regla, no por confianza. ✅ 39 lecciones, 156 ítems
- Toda URL es compartible y se renderiza en primera carga sin estado de cliente. ✅
- El guion de demo completo corre de principio a fin.

**Fuera explícitamente:** inglés, cuentas, IA, comunidad.

---

## Fase 3 — Pitch y pulido

**Objetivo:** hacer visible la calidad.

| Se construye                                                | Por qué                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Pasada de accesibilidad: teclado, foco, contraste, axe en E2E | Una afirmación de calidad que se comprueba                |
| Guion de demo final, grabado y escrito                       | Es el artefacto de portfolio                              |
| ADRs completos para toda decisión relevante                  | Es lo que un revisor senior lee de verdad                 |
| Preparación open-source: LICENSE, CONTRIBUTING, guías        | Solo ahora, cuando el núcleo está estable                 |
| Opcional: contenido en inglés, una competencia a la vez      | Aditivo por diseño, gracias a la costura                  |
| **Superficie MCP para agentes**: servidor local (stdio) exponiendo el dominio + skills que enseñan a usarlo | Convierte el núcleo en consumible por agentes, sin IA y sin coste. Requiere ADR previo |

**Criterios de salida**

- Un desconocido puede clonar, `pnpm i`, `pnpm dev` y ver la demo sin configuración.
- El juego de ADRs explica toda decisión no obvia, incluidas las descartadas.
- axe no reporta problemas críticos; la navegación solo con teclado funciona en las cuatro pantallas.

---

## Lo que deliberadamente no está planificado

Estas son las cosas con más probabilidad de matar el proyecto. No son "más adelante": son **diferidas con condición**:

| Diferido                    | Condición para reconsiderarlo                                       |
| --------------------------- | ------------------------------------------------------------------- |
| Generación de ítems con IA  | Que existan los 156 ítems escritos a mano y el pipeline de fixtures esté probado |
| Contenido en inglés         | Fase 3 cerrada, y una razón más allá de la simetría                  |
| Cuentas y sincronización    | Que alguien que no sea el autor lo use más de una semana             |
| Labs con ejecución de código| Nunca, en este producto. Otro producto, otra amenaza                 |
| Búsqueda                    | Que el contenido pase de ~150 ítems o el catálogo deje de ser navegable |

---

## Hitos

| Hito | Significado                                | Estado |
| ---- | ------------------------------------------ | ------ |
| M0   | Juego documental completo (fase 0)         | ✅     |
| M1   | Núcleo demostrable                         | ⬜     |
| M2   | Contenido y mapa completos                 | ⬜     |
| M3   | Listo para portfolio                       | ⬜     |
