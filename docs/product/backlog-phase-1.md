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

- [ ] `pnpm check` pasa en un repo sin código de producto.
- [ ] CI en verde sobre el primer commit.
- [ ] `pnpm build` genera `out/` y se sirve estático sin servidor.
- [ ] La regla que prohíbe `Date.now()` falla si se introduce a propósito (probado una vez, y revertido).
- [ ] Las cinco rutas responden, aunque sea con texto de relleno.

---

## S2 — Dominio del planificador

**Objetivo:** la parte que da sentido al producto, sin interfaz.

**Se construye**

- Modelo: `Attempt`, `ItemSchedule`, `Clock`, `Option`, `Item`.
- `scheduleNext()` con las reglas R1–R12 en **tabla de datos**, no en cadena de `if`.
- Acotaciones: `ease ∈ [1.3, 2.8]`, `intervalDays ∈ [1, 180]`.
- Barajado con semilla (PRNG determinista, documentado como no criptográfico).

**Criterio de hecho**

- [ ] 12 tests, uno por regla, dirigidos por tabla.
- [ ] Tests de acotación en ambos extremos.
- [ ] Secuencia aleatoria larga que verifica I12, I13 e I14 sin romperse.
- [ ] `scheduleNext` es pura: mismo input, mismo output, sin reloj ambiente.
- [ ] El archivo de reglas se lee como la tabla del documento, fila a fila.

---

## S3 — Proyecciones

**Objetivo:** dejar de tener estado y empezar a tener historia.

**Se construye**

- `foldSchedule(itemId, attempts)`.
- `projectState()`, `projectUnlocked()`.
- `buildReviewQueue(items, attempts, clock)`.
- Validación del grafo: orden topológico y detección de ciclos.

**Criterio de hecho**

- [ ] Un test por regla de estado, incluida `consolidated → at_risk`.
- [ ] Equivalencia I16: plegar todo == aplicar uno a uno.
- [ ] Un test que prueba que una competencia **no vuelve a bloquearse** al fallar un repaso.
- [ ] Orden topológico detecta un ciclo en un fixture roto.

---

## S4 — Contenido mínimo

**Objetivo:** la cadena mínima de la demo, con contenido de verdad.

**Se construye**

- Un área, tres competencias encadenadas del grafo real, tres lecciones, doce ítems.
- Esquemas Zod del contenido.
- Índice del catálogo y validación al cargar.
- Linter de contenido con R1–R7 y **un fixture negativo por regla**.

**Criterio de hecho**

- [ ] `pnpm validate:content` pasa con el contenido real.
- [ ] Cada fixture negativo es rechazado (o avisado) por la regla que le corresponde.
- [ ] Un ítem con dos respuestas correctas rompe el build.
- [ ] Los identificadores son estables y coinciden con el grafo.

---

## S5 — Persistencia y reloj

**Objetivo:** que el progreso sobreviva a recargar y que la demo pueda viajar en el tiempo.

**Se construye**

- Puerto `AttemptStore` (asíncrono e idempotente).
- `LocalStorageAttemptStore` con detección de disponibilidad.
- Puerto `Clock` y control de tiempo solo en desarrollo (`?devtime=`).
- Exportar/importar progreso en JSON.

**Criterio de hecho**

- [ ] Test de ida y vuelta: `append` + `list` devuelve lo mismo.
- [ ] Insertar dos veces el mismo `id` no duplica.
- [ ] Un test prohíbe persistir `ItemSchedule` o `CompetencyState` (I15).
- [ ] `?devtime` cambia "hoy" y **no aparece** en el bundle de producción (aserción E2E).

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
