# Backlog — Fase 1: núcleo demostrable

Ocho rebanadas verticales. Cada una deja el repositorio en verde y produce algo que se puede mirar. Sin fechas: el orden y los criterios de hecho son la planificación.

**Objetivo de la fase:** recorrer el [guion de demo](vision.md#el-guion-de-demo) de 0:30 a 4:30 con una sola cadena de contenido.

---

## Vista general

| #   | Rebanada                    | Tamaño | Depende de | Qué queda funcionando                       |
| --- | --------------------------- | ------ | ---------- | -------------------------------------------- |
| S1  | Andamiaje y primera puerta  | M      | —          | `pnpm check` verde y un sitio desplegado      |
| S2  | Dominio del planificador    | L      | S1         | Las 12 reglas, testeadas                      |
| S3  | Proyecciones                | M      | S2         | Estado, desbloqueo y cola, derivados          |
| S4  | Contenido mínimo            | M      | S3         | 3 competencias con lección y 12 ítems válidos |
| S5  | Persistencia y reloj        | M      | S1         | Los intentos se guardan y el tiempo se controla |
| S6  | Comprobación (ítem)         | L      | S3, S4, S5 | Responder, ver feedback y reprogramar         |
| S7  | Mapa y lección              | L      | S4, S5     | Navegar el grafo y leer                      |
| S8  | Cola de repaso y desbloqueo | M      | S6, S7     | El bucle completo de la demo                 |

S5 puede ir en paralelo con S3–S4: no comparten archivos.

---

## S1 — Andamiaje y primera puerta

**Objetivo:** que exista una puerta que impida construir sobre algo roto.

**Se construye**

- Next.js App Router con `output: 'export'`, TypeScript estricto, Tailwind 4, pnpm.
- ESLint con las reglas D1–D8 de [`dependency-rules.md`](../architecture/dependency-rules.md), Prettier, Vitest.
- Scripts `typecheck`, `lint`, `test`, `validate:content` (vacío por ahora), `build`, `check`.
- GitHub Actions con las seis puertas.
- Layout base, navegación y las cinco rutas en blanco.

**Criterio de hecho**

- [x] `pnpm check` pasa en un repo sin código de producto.
- [x] CI en verde sobre el primer commit. *(Verificado en GitHub Actions.)*
- [x] `pnpm build` genera `out/` y se sirve estático sin servidor.
- [x] La regla que prohíbe `Date.now()` falla si se introduce a propósito (probado con una sonda que disparó D2 y D8, y revertida).
- [x] Las cinco rutas responden, aunque sea con texto de relleno.

**Trampas encontradas al ejecutarla** (por esto existe S1):

| Hallazgo | Consecuencia | Resolución |
| --- | --- | --- |
| TypeScript 7 no está soportado por `typescript-eslint` 8.x | El lint no arranca y rompe `pnpm check` | Fijado en TypeScript 6.0.x, documentado en [`tech-stack.md`](../architecture/tech-stack.md#fijaciones-conocidas) |
| TS 7 eliminó `baseUrl` | `tsc --noEmit` falla al arrancar | `paths` sin `baseUrl`, que es válido desde TS 5.4 |
| Next 16 reescribe `tsconfig.json` (jsx obligatorio) | Ruido en el primer commit | Se acepta: es el runtime que Next necesita |
| `pnpm/action-setup` con `version` **y** `packageManager` | El CI muere antes de instalar: *Multiple versions of pnpm specified* | La versión se declara solo en `package.json`; el workflow no la repite |
| Actions en v4 (Node 20, deprecado) | El runner avisa y fuerza Node 24 | `checkout@v7`, `setup-node@v7`, `action-setup@v6` |

---

## S2 — Dominio del planificador

**Objetivo:** la parte que da sentido al producto, sin interfaz.

**Se construye**

- Modelo: `Attempt`, `ItemSchedule`, `Clock`, `Option`, `Item`.
- `scheduleNext()` con las reglas R1–R12 en **tabla de datos**, no en cadena de `if`.
- Acotaciones: `ease ∈ [1.3, 2.8]`, `intervalDays ∈ [1, 180]`.
- Barajado con semilla (PRNG determinista, documentado como no criptográfico).

**Criterio de hecho**

- [x] 12 tests, uno por regla, dirigidos por tabla. *(La tabla del test es una copia independiente del documento, no se genera desde `RULES`.)*
- [x] Tests de acotación en ambos extremos.
- [x] Secuencia aleatoria larga que verifica I12, I13 e I14 sin romperse. *(200 secuencias × 60 intentos, generador determinista.)*
- [x] `scheduleNext` es pura: mismo input, mismo output, sin reloj ambiente.
- [x] El archivo de reglas se lee como la tabla del documento, fila a fila.

**Lo que encontró el test de propiedades:** I14 («un acierto con confianza nunca acorta el intervalo») **solo es cierto sobre estados alcanzables**. Al generar `learning` con intervalo 7 días, R4 lo bajaba a 3. No era un bug del código: era un estado imposible, porque las reglas solo producen 1 o 2 días en `learning`. De ahí nace el invariante **I17** (intervalos acotados por fase), que ahora está documentado porque de él depende I14.

---

## S3 — Proyecciones

**Objetivo:** dejar de tener estado y empezar a tener historia.

**Se construye**

- `foldSchedule(itemId, attempts)`.
- `projectState()`, `projectUnlocked()`.
- `buildReviewQueue(items, attempts, clock)`.
- Validación del grafo: orden topológico y detección de ciclos.

**Criterio de hecho**

- [x] Un test por regla de estado, incluida `consolidated → at_risk`.
- [x] Equivalencia I16: plegar todo == aplicar uno a uno.
- [x] Un test que prueba que una competencia **no vuelve a bloquearse** al fallar un repaso.
- [x] Orden topológico detecta un ciclo en un fixture roto.

**Matiz que apareció al implementarlo:** «último intento correcto» **no** es lo mismo que `phase === 'review'`. Un acierto dudoso (R2, R5, R11) deja el ítem en `learning` y sigue siendo evidencia válida, así que la competencia puede consolidarse con ítems en fase `learning`. La condición correcta es «último intento correcto y el ítem no está en `relearning`», y tiene su test propio.

**Ampliación del puerto `Clock`:** ahora expone `dateOf(timestamp)`. Convertir un instante en una fecha de calendario es una decisión de zona horaria y no podía vivir en el dominio. `fixedClock` fecha en UTC a propósito, para que ningún test dependa de la zona de la máquina.

---

## S4 — Contenido mínimo

**Objetivo:** la cadena mínima de la demo, con contenido de verdad.

**Se construye**

- Un área, tres competencias encadenadas del grafo real, tres lecciones, doce ítems.
- Esquemas Zod del contenido.
- Índice del catálogo y validación al cargar.
- Linter de contenido con R1–R7 y **un fixture negativo por regla**.

**Criterio de hecho**

- [x] `pnpm validate:content` pasa con el contenido real. *(3 competencias · 3 lecciones · 12 ítems · 0 errores · 0 avisos.)*
- [x] Cada fixture negativo es rechazado (o avisado) por la regla que le corresponde. *(13 fixtures: R1–R5 y R7 rompen, R6 avisa.)*
- [x] Un ítem con dos respuestas correctas rompe el build. *(R1 es error; `validate:content` sale con código 1 y detiene `pnpm check`.)*
- [x] Los identificadores son estables y coinciden con el grafo.

**Desviación consciente del plan:** las tres competencias no caben en un área. La cadena real del grafo es `ai-ml-dl-boundaries` → `tokens-and-context-window` → `system-instructions-contract`, y cruza tres áreas porque así están definidos los prerrequisitos. Se prefirió una cadena verdadera a una cadena dentro de un área.

**Lo que hizo falta añadir:** `zod` (esquemas) y `tsx` (ejecutar el CLI en TypeScript). `tsx` arrastra `esbuild`, cuyo script de instalación pnpm 12 bloquea por defecto: hay que autorizarlo en `pnpm-workspace.yaml` con `allowBuilds`, o `pnpm install` falla con `ERR_PNPM_IGNORED_BUILDS` y se cae todo el CI.

---

## S5 — Persistencia y reloj

**Objetivo:** que el progreso sobreviva a recargar y que la demo pueda viajar en el tiempo.

**Se construye**

- Puerto `AttemptStore` (asíncrono e idempotente).
- `LocalStorageAttemptStore` con detección de disponibilidad.
- Puerto `Clock` con el reloj del sistema, **sin control de tiempo** ([ADR-007](../architecture/adr/ADR-007-sin-control-de-tiempo.md)).
- Exportar/importar progreso en JSON.

**Criterio de hecho**

- [x] Test de ida y vuelta: `append` + `list` devuelve lo mismo.
- [x] Insertar dos veces el mismo `id` no duplica.
- [x] Un test prohíbe persistir `ItemSchedule` o `CompetencyState` (I15).
- [x] El producto no ofrece ninguna forma de sustituir «hoy». *(Se implementó `?devtime` y se retiró: ver ADR-007.)*

**Cómo quedó**

| Pieza | Archivo |
|---|---|
| Puerto + implementación en memoria | `assessment/application/attempt-store.ts` |
| Adaptador `localStorage` con detección de disponibilidad | `assessment/infrastructure/local-storage-attempt-store.ts` |
| Validación de lo leído (una entrada corrupta no borra el historial) | `assessment/domain/schema.ts` |
| Archivo de progreso (exportar/importar) | `assessment/application/progress-file.ts` |
| Panel de datos en `/acerca` | `assessment/presentation/DataPanel.tsx` |

Tres decisiones que no estaban escritas y hubo que tomar:

1. **Una entrada corrupta se descarta, no se propaga.** Validar al leer convierte un fallo silencioso (un `undefined` que revienta tres pantallas después) en un descarte visible. Probado con un almacén que mezcla entradas buenas y basura.
2. **Cuando el navegador no puede almacenar, se sigue funcionando en memoria** y el panel lo dice explícitamente. Es preferible un progreso de sesión anunciado a una pantalla en blanco.
3. **Se retiró el control de tiempo.** Llegó a implementarse (`?devtime`, con un gate de CI que verificaba su ausencia en el bundle) y se eliminó por ser más complejo que el problema y por el daño irreversible que un intento con fecha falsa haría en un historial append-only. En su lugar se siembran intentos con fechas pasadas desde la consola, documentado en [development-workflow](../contributing/development-workflow.md).

---

## S6 — Comprobación (ítem)

**Objetivo:** producir evidencia.

**Se construye**

- Presentación del ítem con opciones barajadas por semilla.
- Selección, declaración de confianza y envío.
- Feedback tras responder: justificación de la opción elegida + explicación.
- Registro del intento y reprogramación visible ("vuelve en 8 días").

**Criterio de hecho**

- [ ] El orden presentado se guarda en `presentedOptionIds` y es reproducible desde el intento.
- [ ] Cada opción muestra **su** justificación, no una genérica.
- [ ] La confianza cambia la fecha resultante (con test).
- [ ] Selección y envío funcionan solo con teclado.

---

## S7 — Mapa y lección

**Objetivo:** verse como el producto que es.

**Se construye**

- Layout por niveles topológicos y render SVG desde datos.
- Cuatro estados visibles (bloqueada, disponible, en aprendizaje, consolidada).
- Filtros por URL (`area`, `capa`, `estado`).
- Vista de competencia estática con la isla de comprobación.
- Versión en lista navegable con teclado, como fuente de verdad de interacción.

**Criterio de hecho**

- [ ] 37 rutas de competencia existen en build (`generateStaticParams`).
- [ ] Cada enlace del mapa tiene URL propia y se abre en frío.
- [ ] El filtro `?capa=nucleo` deja 14 nodos.
- [ ] Navegación con teclado completa por el mapa.

---

## S8 — Cola de repaso y desbloqueo

**Objetivo:** cerrar el bucle.

**Se construye**

- Home `/` con la cola del día y su estado vacío.
- Sesión de repaso sobre la cola.
- Recálculo de estados y desbloqueo de la siguiente competencia.

**Criterio de hecho**

- [ ] Tras responder, el ítem desaparece de la cola hasta su vencimiento.
- [ ] Avanzar el reloj hace aparecer exactamente los ítems vencidos.
- [ ] Completar los ítems de una competencia desbloquea la siguiente.
- [ ] **El guion de demo completo corre sin tocar código.**

---

## Fuera de alcance de la fase 1

Bilingüe · autenticación · base de datos · IA · superficie MCP · búsqueda · animaciones · contenido más allá de la cadena mínima · panel de administración.

---

## Riesgos de la fase

| Riesgo                                     | Señal temprana                              | Respuesta                                     |
| ------------------------------------------ | ------------------------------------------- | --------------------------------------------- |
| Que la UI arrastre lógica del dominio      | Una regla de negocio en un componente       | D1–D8 deberían haberlo impedido: revisar la regla |
| Que el contenido mínimo se vuelva "todo"   | S4 crece más de una semana                  | Cortar: 3 competencias bastan para la demo     |
| Que el mapa consuma la fase                | S7 se come S8                               | Versión en lista primero, SVG después          |
| Que aparezcan más de seis islas cliente     | `'use client'` por limitación, no por diseño | Disparador de reversión de ADR-001             |
