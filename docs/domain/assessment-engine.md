# Motor de evaluación

El núcleo del producto. Este documento define el modelo, sus invariantes y el algoritmo de planificación. Es la especificación que la implementación tiene que satisfacer, y la fuente de sus tests.

> **Regla arquitectónica:** todo lo de aquí es **dominio puro**. Sin React, sin DOM, sin red, sin `Date.now()`. Corre en Node y se prueba con Vitest. La UI solo renderiza lo que estas funciones devuelven.

---

## 1. Alcance

El motor responde cuatro preguntas, y solo estas:

1. Dado un intento, ¿cuándo hay que volver a mostrar este ítem?
2. Dado el registro de intentos, ¿cuál es el estado de cada competencia?
3. Dado el grafo y los estados, ¿qué competencias están desbloqueadas?
4. Dada una fecha, ¿qué debería repasar hoy el alumno?

Nada de aquí sabe de lecciones, maquetación, rutas ni estilos.

---

## 2. Modelo

```ts
type IsoDate = string;      // 'AAAA-MM-DD'            (calendario)
type IsoTimestamp = string; // ISO 8601 completo        (instante)

interface Competency {
  id: string;
  areaId: string;
  order: number;
}

interface Prerequisite {
  from: string; // competencia que debe demostrarse antes
  to: string;   // competencia que se desbloquea
}

interface Option {
  id: string;
  text: string;
  correct: boolean;
  rationale: string; // por qué es correcta, o por qué es un error tentador
}

interface Item {
  id: string;
  competencyId: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  options: Option[];      // 3–4 opciones, exactamente una correcta
  explanation: string;    // se muestra tras cualquier respuesta
  referenceId: string;    // debe existir en la lista de referencias
}

interface Attempt {
  id: string;              // UUID generado en el cliente: permite crear intentos sin servidor
  deviceId: string;        // preparado para sincronizar entre dispositivos; constante en la v1
  itemId: string;
  answeredAt: IsoTimestamp;
  selectedOptionId: string;
  correct: boolean;
  confidence: 'confident' | 'doubtful';
  presentedOptionIds: string[]; // orden mostrado, con semilla y guardado para reproducibilidad
  durationMs: number;
}

// DERIVADO: se pliega a partir de los intentos del ítem. Nunca se persiste.
interface ItemSchedule {
  itemId: string;
  phase: 'new' | 'learning' | 'review' | 'relearning';
  intervalDays: number;
  ease: number;   // [1.3, 2.8]
  lapses: number;
  dueAt: IsoDate;
  lastReviewedAt: IsoTimestamp | null;
}
```

**Modelos de lectura derivados** — nunca persistidos, siempre calculados:

```ts
type CompetencyState = 'no_evidence' | 'learning' | 'almost' | 'consolidated' | 'at_risk';

interface CompetencyView {
  competencyId: string;
  state: CompetencyState;
  unlocked: boolean;
  itemsAttempted: number;
  itemsTotal: number;
  nextDueAt: IsoDate | null;
}
```

---

## 3. Invariantes

Cada una de estas es un test, no un comentario.

| ID   | Invariante                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------- |
| I1   | El grafo de prerrequisitos no tiene ciclos.                                                       |
| I2   | Todo `Prerequisite.from` y `.to` referencia una competencia existente.                            |
| I3   | Ninguna competencia es su propio prerrequisito.                                                   |
| I4   | Todo `Item.competencyId` referencia una competencia existente.                                    |
| I5   | Todo ítem tiene 3–4 opciones y exactamente una con `correct: true`.                               |
| I6   | Toda opción tiene `rationale` no vacío.                                                           |
| I7   | Todo ítem tiene `explanation` no vacía y un `referenceId` válido.                                 |
| I8   | El registro de intentos es append-only: los intentos nunca se modifican ni se borran.             |
| I9   | `CompetencyState` nunca se persiste. Persistirlo es un bug.                                       |
| I10  | El planificador es una función pura de `(ItemSchedule, Attempt, now)` — sin tiempo ambiente.      |
| I11  | `presentedOptionIds` se guarda en cada intento y es una permutación de las opciones del ítem.      |
| I12  | `ease ∈ [1.3, 2.8]` y `intervalDays ∈ [1, 180]` se cumplen siempre.                               |
| I13  | `lapses` nunca disminuye.                                                                         |
| I14  | Tras un acierto con confianza, `intervalDays` nunca disminuye.                                    |
| I15  | `ItemSchedule` nunca se persiste: se recalcula plegando los intentos del ítem.                    |
| I16  | `foldSchedule(itemId, attempts)` coincide exactamente con aplicar `scheduleNext` de forma incremental. |
| I17  | Los intervalos son acotados por fase: `new` = 1 · `learning` ∈ {1, 2} · `relearning` = 1 · `review` ∈ [3, 180]. **De aquí depende I14.** |

---

## 4. El planificador

### 4.1 Por qué este diseño

Las respuestas de opción múltiple son binarias, pero la **confianza** es un segundo eje. Eso da una tabla 2×2 por fase, suficiente para distinguir "lo sabe", "acertó por suerte", "va flojo" y "no lo sabe". Es el modelo más pequeño que produce fechas de repaso genuinamente distintas sin fingir que hacemos psicometría.

### 4.2 Reglas

Se evalúan en orden. `ease` arranca en `2.5`; `intervalDays` en `1`; `lapses` en `0`.

| #    | Fase         | Respuesta | Confianza | Fase siguiente  | Intervalo siguiente       | Facilidad        | Lapsos |
| ---- | ------------ | --------- | --------- | --------------- | ------------------------- | ---------------- | ------ |
| R1   | `new`        | correcta  | segura    | `review`        | `3`                       | `2.5`            | `0`    |
| R2   | `new`        | correcta  | dudosa    | `learning`      | `1`                       | `2.5`            | `0`    |
| R3   | `new`        | errónea   | cualquiera| `relearning`    | `1`                       | `2.3`            | `1`    |
| R4   | `learning`   | correcta  | segura    | `review`        | `3`                       | `2.5`            | `+0`   |
| R5   | `learning`   | correcta  | dudosa    | `learning`      | `2`                       | `ease − 0.05`    | `+0`   |
| R6   | `learning`   | errónea   | cualquiera| `relearning`    | `1`                       | `ease − 0.2`     | `+1`   |
| R7   | `review`     | correcta  | segura    | `review`        | `round(interval × ease)`  | `ease + 0.05`    | `+0`   |
| R8   | `review`     | correcta  | dudosa    | `review`        | `round(interval × 1.2)`   | `ease − 0.05`    | `+0`   |
| R9   | `review`     | errónea   | cualquiera| `relearning`    | `1`                       | `ease − 0.2`     | `+1`   |
| R10  | `relearning` | correcta  | segura    | `review`        | `3`                       | `ease`           | `+0`   |
| R11  | `relearning` | correcta  | dudosa    | `learning`      | `2`                       | `ease`           | `+0`   |
| R12  | `relearning` | errónea   | cualquiera| `relearning`    | `1`                       | `ease − 0.2`     | `+1`   |

Acotaciones aplicadas después de cada transición: `ease = clamp(ease, 1.3, 2.8)` y `intervalDays = clamp(resultado, 1, 180)`.

Después:

```
dueAt = answeredAt + intervalDays días
```

El retraso **no** se penaliza en la aritmética. Un repaso hecho diez días tarde sigue programando desde el día en que se respondió de verdad. Razón: castigar el retraso hace que el sistema se sienta hostil y no dice nada sobre el conocimiento.

### 4.3 Ejemplo numérico

Ítem `token-vs-word`, empezando en `new`, `ease = 2.5`. Hoy es el día 0.

| # | Día | Respuesta | Confianza | Regla | Fase        | Intervalo | Facilidad | Vence  |
| - | --- | --------- | --------- | ----- | ----------- | --------- | --------- | ------ |
| 1 | 0   | errónea   | segura    | R3    | `relearning`| 1         | 2.30      | día 1  |
| 2 | 1   | correcta  | dudosa    | R11   | `learning`  | 2         | 2.30      | día 3  |
| 3 | 3   | correcta  | segura    | R4    | `review`    | 3         | 2.50      | día 6  |
| 4 | 6   | correcta  | segura    | R7    | `review`    | 8         | 2.55      | día 14 |
| 5 | 20  | correcta  | segura    | R7    | `review`    | 20        | 2.60      | día 40 |

Léelo como la historia que cuenta la demo: un fallo degrada el ítem, dos respuestas limpias lo reconstruyen y el hueco entre repasos se ensancha.

### 4.4 API del módulo

El motor expone cinco funciones puras:

```ts
// una transición
scheduleNext(schedule: ItemSchedule, attempt: Attempt, today: IsoDate): ItemSchedule

// todas las transiciones de un ítem, en orden cronológico
foldSchedule(itemId: string, attempts: readonly Attempt[], clock: Clock): ItemSchedule

// las dos proyecciones
projectState(items: readonly Item[], attempts: readonly Attempt[], clock: Clock): CompetencyState
projectUnlocked(
  competencyId: string,
  prerequisites: readonly Prerequisite[],
  states: ReadonlyMap<string, CompetencyState>,
): boolean

// la cola del día
buildReviewQueue(items: readonly Item[], attempts: readonly Attempt[], clock: Clock): ReviewQueueItem[]
```

**Por qué `scheduleNext` recibe una fecha y no el reloj.** Una transición solo necesita saber *qué día es*; convertir un instante en fecha es una decisión de zona horaria, y el dominio no la toma. El puerto `Clock` expone `today()`, `now()` y **`dateOf(timestamp)`**, y son `foldSchedule` y `buildReviewQueue` quienes lo usan.

`foldSchedule` es la fuente de verdad: parte de la programación inicial (`phase: 'new'`, `ease: 2.5`, `intervalDays: 1`) y aplica `scheduleNext` a cada intento del ítem ordenado por `answeredAt` (con desempate por `id`, para que dos intentos del mismo instante no dependan del orden de llegada). **No hay estado de planificación almacenado en ninguna parte** (invariante I15).

Con 120 ítems y unos miles de intentos, plegar todo cuesta microsegundos. Si algún día dejara de serlo, se añade una caché en memoria, no una tabla.

`buildReviewQueue` devuelve los ítems con `dueAt <= clock.today()` **que además tengan algún intento** — un ítem sin estrenar no está vencido, está disponible, y su sitio es el mapa. Orden: `dueAt` ascendente, después `difficulty` ascendente y por último `id`. Sin aleatoriedad y sin heurísticas de priorización en la v1.

---

## 5. Estado de la competencia (derivado)

Dados todos los intentos y todos los ítems de una competencia, se evalúa en este orden exacto — gana la primera coincidencia:

1. **`no_evidence`** — no hay intentos sobre ningún ítem de esta competencia.
2. **`at_risk`** — la competencia estuvo `consolidated` en algún momento del pasado y ahora al menos un ítem tiene su último intento erróneo o está en `relearning`.
3. **`consolidated`** — todos los ítems de la competencia tienen al menos un intento, el último intento de todos es correcto y ninguno está en `relearning`.
4. **`learning`** — cualquier otro caso.

El desbloqueo es una **proyección separada** y deliberadamente independiente del dominio:

```
unlocked(competencia) = todos sus prerrequisitos p cumplen state(p) !== 'no_evidence'
```

> **Por qué están separados.** `consolidated` es un estado vivo que decae: puedes perderlo fallando un repaso. Si el desbloqueo dependiera de él, una competencia ya alcanzada podría volver a bloquearse, lo cual es hostil y confuso. El desbloqueo es permanente una vez ganado; lo que se mueve es el dominio.

### Regla de revisión: lo terminado no se cierra

Un desbloqueo decide **por dónde se puede entrar**, nunca **qué se puede volver a hacer**. En consecuencia:

- Una competencia consolidada se puede **volver a intentar en cualquier momento**. No hay estado final.
- Cada repaso añade un intento nuevo al registro (append-only) y el estado se **recalcula**; no hay operación de "reabrir".
- Si el repaso sale mal, la competencia pasa a `at_risk` y sus ítems vuelven a la cola cuando vencen. Eso no es un castigo: es información.
- Nada en el modelo impide revisar. El único bloqueo del sistema está en la **entrada** (prerrequisitos sin evidencia), jamás en la salida.

### Qué se bloquea: la comprobación, no el acceso

Son tres cosas distintas y conviene no confundirlas:

| | ¿Cuándo se puede? | Por qué |
|---|---|---|
| **Leer** la lección | Siempre que tenga contenido | El contenido no se gasta por leerlo antes de tiempo |
| **Comprobar** con preguntas | Solo con evidencia en sus prerrequisitos | Medir sin base mide ruido, no conocimiento |
| **Ser el siguiente paso** | Según el camino activo | Es una recomendación, no un permiso |

Por eso las etiquetas del mapa dicen **«evaluable»** y **«faltan previos»**, y no «bloqueada»: describen la comprobación. Un nodo con previos pendientes se abre igual, y el tooltip dice exactamente qué falta.

**Se descartó el bloqueo por temática** (cada área como entrada independiente con secuencia interna) porque el grafo no está particionado: **20 de las 49 aristas cruzan de área** y solo una de las ocho áreas es autocontenida. Un área cuyos prerrequisitos viven en otra no puede tener una secuencia interna que la desbloquee; el bloqueo quedaría vacío o arbitrario.

---

## 6. Testeabilidad

| Mecanismo                | Propósito                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Puerto `Clock`           | Inyectar "hoy". Obligatorio para la demo (viajar en el tiempo) y para tests deterministas.        |
| Orden de opciones con semilla | `presentedOptionIds` permite reproducir cualquier intento a partir de su propio registro.    |
| Funciones puras          | Cada regla es una función de valor a valor; sin E/S en ningún punto.                              |
| Tests de propiedades     | I12–I14 se escriben como invariantes sobre secuencias generadas de intentos, no como casos sueltos. |

Suite mínima del módulo:

- Un test por regla R1–R12 (12 casos, dirigidos por tabla).
- Acotaciones en ambos extremos (`ease` suelo/techo, `intervalDays` techo).
- Secuencia aleatoria larga de intentos que comprueba que I12, I13 e I14 nunca se rompen.
- Un test por regla de estado, incluida la transición `consolidated → at_risk`.
- Un test de desbloqueo que prueba que una competencia no se vuelve a bloquear tras fallar un repaso.
- Un test de equivalencia (I16): plegar los intentos completos produce la misma programación que aplicarlos uno a uno.
- Un test del adaptador de almacenamiento que **prohíbe** que se persista cualquier `ItemSchedule` o `CompetencyState`.

---

## 7. Alternativas descartadas

| Candidata                    | Por qué no                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **SM-2 literal**             | Su fórmula de facilidad asume una nota de calidad de 0 a 5 que no recogemos. Forzar una respuesta binaria en una escala de cinco puntos sería precisión inventada. Conservamos la _forma_ (facilidad × intervalo) y diseñamos la 2×2 que sí tenemos. |
| **FSRS**                     | Más preciso, pero es un modelo ajustado, con parámetros entrenados y una ecuación de estado de memoria. Unexplicable para el usuario sin un gráfico e intuneable con n≈120 ítems. Se reconsidera solo con volumen real de intentos. |
| **IRT / Elo**                | Requiere datos de calibración (muchos intentos por ítem) que un proyecto en solitario nunca va a acumular.                                     |
| **Intervalos fijos**         | Sin adaptación, o repasas para siempre o olvidas en silencio. Anula el propósito.                                                              |
| **Texto libre puntuado por LLM** | Excluido por la restricción de presupuesto cero, y metería no-determinismo en lo único que tiene que ser testeable.                       |

---

## 8. Lo que este documento no decide

- **Contenido**: qué competencias existen y cómo se conectan → [`competency-graph.md`](competency-graph.md).
- **Persistencia**: cómo se guardan y sincronizan los intentos → [ADR-003](../architecture/adr/ADR-003-progreso-derivado.md) y [ADR-006](../architecture/adr/ADR-006-persistencia-local.md).
- **Interfaz**: cómo se pintan el mapa y la cola → documentos de producto.
