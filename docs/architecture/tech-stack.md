# Stack tecnológico

Cada elección lleva su justificación y, cuando aplica, **la alternativa descartada**. Una herramienta sin alternativa considerada no es una decisión: es una costumbre.

> **Regla:** una dependencia entra por una necesidad demostrable, no por popularidad. Toda dependencia nueva requiere una línea de justificación en su PR.

---

## 1. Núcleo

| Necesidad     | Elección                  | Por qué                                                                                   | Alternativa descartada y por qué                                                                 |
| ------------- | ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Framework     | **Next.js (App Router)**  | Rutas, generación estática y SEO por página sin servidor. Y sobre todo: permite pasar de estático a dinámico ruta por ruta si algún día hay base de datos y API ([ADR-001](adr/ADR-001-nextjs-estatico.md)). | **Vite + React Router** (era la app anterior): sin SEO ni crecimiento incremental hacia servidor. **Astro**: excelente para contenido puro, pero este producto es una *app* con mapa interactivo y estado; React manda. |
| UI            | **React 19**              | Ecosistema, familiaridad y los componentes que necesitamos                                     | **Svelte/Vue**: sin motivo para cambiar de ecosistema en un proyecto de portfolio               |
| Lenguaje      | **TypeScript estricto**   | El dominio es el producto; el tipado es su documentación ejecutable                            | JavaScript: descartado sin discusión                                                             |
| Estilos       | **Tailwind CSS 4**        | Velocidad de iteración y consistencia sin CSS paralelo                                         | CSS Modules: más ceremonia para un autor único                                                   |
| Componentes   | **shadcn/ui + Radix**     | El código entra al repo y se adapta; accesibilidad resuelta donde es difícil (foco, teclado)   | **MUI/Chakra**: imponen su diseño y su peso. **UI propia desde cero**: reinventa la accesibilidad |
| Variantes     | **CVA + clsx + tailwind-merge** | Variantes tipadas y una utilidad `cn()` compartida                                      | `clsx` solo: sin variantes tipadas                                                               |
| Iconos        | **Lucide**                | Ligero, coherente, árbol de sacudida                                                          | Sin alternativa considerada: es el estándar del ecosistema                                       |
| Tema          | **next-themes**           | Evita el parpadeo del tema en la primera carga (FOUC)                                          | Implementación propia de 20 líneas: posible, pero peor                                            |

---

## 2. Datos y validación

| Necesidad        | Elección          | Por qué                                                                        | Alternativa descartada y por qué                                                    |
| ---------------- | ----------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Validación       | **Zod**           | Un solo esquema valida contenido, estado persistido y (futuro) salida de IA      | Validador a mano: duplica reglas que ya están escritas                               |
| Contenido        | **Registros TypeScript** en `src/content` | Tipado y validable campo a campo, sin pipeline de compilación. **Es la decisión menos obvia de la tabla** | **MDX**: aporta prosa con componentes inline, que no necesitamos porque la plantilla de lección son campos fijos. Añade compilador, plugin y errores más difíciles de rastrear. Se reconsidera si las lecciones empiezan a necesitar componentes dentro del texto. |
| Fechas           | **`Intl` nativo + utilidades propias** | Solo hacemos aritmética de días y formateo local                           | **date-fns / dayjs**: dependencia para lo que `Intl` ya resuelve                      |
| Búsqueda         | **Filtro en memoria** | Con ~150 ítems, un `filter` es instantáneo                                  | **Orama / Fuse**: entra cuando el contenido pase de ~150 ítems o la navegación se resienta |

---

## 3. Estado y persistencia

| Necesidad         | Elección                          | Por qué                                                        | Alternativa descartada y por qué                                        |
| ----------------- | --------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Estado local      | **`useState` / `useReducer`**     | Todo cabe en un componente o en la URL                          | **Zustand**: un store global para 3 pantallas es más código, no menos   |
| Estado en URL     | **Search params nativos**         | Filtros compartibles y recargables sin librería                 | **nuqs**: entra si la sincronización se vuelve intrincada               |
| Persistencia      | **`localStorage` tras `AttemptStore`** | Sin backend ni coste; el puerto permite cambiarlo mañana    | **IndexedDB**: complejidad asíncrona sin ganancia a esta escala         |
| Datos remotos     | **Ninguno**                       | No hay servidor                                                 | **TanStack Query**: no hay nada que cachear                              |

---

## 4. Visualización

| Necesidad        | Elección                    | Por qué                                                                                            | Alternativa descartada y por qué                                                                 |
| ---------------- | --------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Mapa de competencias | **SVG propio + layout por niveles topológicos** | 35 nodos, determinista, accesible por teclado, testeable con Vitest y sin dependencias | **React Flow**: potente y pesado; su modelo de interacción no compensa para un grafo de 35 nodos. **Mermaid**: dibuja diagramas desde texto, no un grafo interactivo con estado por nodo. |
| Diagrama de una lección | **SVG generado desde datos** (nodos y aristas) | Reutiliza el mismo enfoque y el mismo componente                                          | **Mermaid en runtime**: bundle grande y difícil de estilizar                                       |
| Resaltado de código | **Ninguno en la v1**     | Los ejemplos caben en un `<pre>` monoespaciado                                                   | **Shiki**: se incorpora en la fase 2, en build, si los ejemplos crecen                              |

---

## 5. Calidad

| Necesidad            | Elección                | Por qué                                                              |
| -------------------- | ----------------------- | -------------------------------------------------------------------- |
| Tests de dominio     | **Vitest**              | Rápido, mismo transformador que Vite, sin configuración cuando el dominio es puro |
| Tests de componentes | **React Testing Library** | Prueba comportamiento observable, no implementación                  |
| E2E                  | **Playwright**          | Multi-navegador, trazas y control del reloj del navegador             |
| Accesibilidad        | **axe-core** vía Playwright | Detecta lo mecánico; el juicio humano sigue siendo necesario       |
| Lint                 | **ESLint** (config de Next + reglas propias D1–D8) | Ya es la puerta que bloquea la fusión        |
| Formato              | **Prettier**            | Elimina discusiones de estilo                                         |
| CI                   | **GitHub Actions**      | Gratis para repos públicos y ya está donde vive el código              |
| Gestor de paquetes   | **pnpm**                | Instalaciones reproducibles y rápidas                                  |

---

## 6. Herramientas del plan anterior que **no** usamos

Se listan a propósito. Saber qué no usar es la mitad del criterio.

| Herramienta              | Por qué no ahora                                                    | Cuándo se reconsidera                                    |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------- |
| **next-intl**            | La v1 es solo español. Añadirlo sería infraestructura sin usuarios   | Fase 3, al añadir inglés                                  |
| **MDX + remark-gfm**     | Ver §2. El contenido es estructurado, no prosa libre                | Si las lecciones necesitan componentes inline             |
| **Orama**                | Un `filter` basta                                                   | > 150 ítems                                               |
| **Zustand**              | No hay estado global compartido real                                | Si aparece estado entre rutas no derivable                |
| **TanStack Query**       | No hay servidor                                                     | Si aparece una API                                        |
| **TanStack Table**       | No hay tablas complejas                                             | Si aparece un panel de administración de contenido        |
| **React Hook Form**      | No hay formularios complejos                                        | Si aparece un editor de contenido                         |
| **PostgreSQL + Drizzle** | Coste y operación sin beneficio                                     | Cuentas y sincronización entre dispositivos               |
| **Auth.js / Better Auth**| Consecuencia de lo anterior                                         | Con cuentas                                               |
| **Vercel AI SDK**        | Sin IA en la v1                                                     | Con el pipeline de autoría                                |
| **LangGraph**            | No hay agentes en este producto                                     | Probablemente nunca, aquí                                  |
| **MCP SDK**              | No consumimos ni exponemos herramientas                             | Nunca en este producto                                    |
| **pgvector / Qdrant**    | No hay RAG                                                          | Nunca en este producto                                    |
| **OpenTelemetry / Langfuse** | No hay ejecuciones de IA que trazar                             | Con la IA, y solo si hay algo que medir                   |
| **Docker**               | Un sitio estático no necesita contenedor                            | Si aparece un servicio                                    |
| **MSW**                  | No hay HTTP                                                         | Con el adaptador de IA                                    |
| **Storybook**            | Conjunto pequeño, un autor                                          | Si el sistema de diseño crece o hay contribuciones        |

---

## 7. Versiones y actualización

- Se fija la versión en el `lockfile` y se trabaja con Node LTS.
- Las actualizaciones de dependencias no se hacen "porque salió una nueva": se hacen cuando resuelven un problema o cierran una vulnerabilidad, y pasan el mismo `pnpm check`.
- Las actualizaciones mayores (Next, React, Tailwind) se tratan como una fase propia con su criterio de salida.

### Fijaciones conocidas

| Paquete    | Fijado en   | Motivo                                                                                                                                       | Cuándo se sube                                    |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| TypeScript | **6.0.x**   | `typescript-eslint` 8.x **no soporta TS 7.0** (la reescritura en Go): el lint no arranca y rompe `pnpm check`. Detectado en S1, no en producción | Cuando `typescript-eslint` publique soporte para TS 7 |
| ESLint     | 10.x        | Flat config obligatorio                                                                                                                       | —                                                 |

> Estas fijaciones se documentan porque **la próxima persona que ejecute `pnpm add -D typescript@latest` va a romper el build sin saber por qué**. Un rango de versiones en `package.json` no explica un conflicto entre herramientas.

