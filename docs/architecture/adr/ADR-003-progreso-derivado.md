# ADR-003 — El progreso se deriva, nunca se almacena

- **Estado:** aceptado
- **Ámbito:** modelo de dominio

## Contexto

La forma habitual de guardar progreso en una plataforma de aprendizaje es un booleano por lección: `completedLessons: string[]`. El proyecto anterior lo hacía así, con un `toggleLessonComplete(lessonId)`.

Ese modelo tiene tres problemas:

1. **Es una afirmación, no evidencia.** El usuario marca la casilla porque leyó, o porque quiere desbloquear lo siguiente. El sistema no distingue.
2. **No admite revisión.** Una vez "completado", no hay forma de saber si se recuerda.
3. **Se contradice con el historial en cuanto lo hay.** Si el estado es una variable y el historial es otro, tarde o temprano discrepan.

## Decisión

**Solo se almacenan hechos: `Attempt` (append-only).** Todo lo demás —estado de competencia, programación por ítem, desbloqueo, cola de repaso— es una **proyección** calculada bajo demanda a partir de esos hechos.

```ts
// lo único que se guarda
attempts: Attempt[]        // hechos inmutables, append-only

// todo lo demás se calcula siempre
foldSchedule(itemId, attempts)                : ItemSchedule
projectState(competencyId, attempts, items)   : CompetencyState
projectUnlocked(competencyId, prerequisites)  : boolean
buildReviewQueue(items, attempts, clock)      : ReviewQueueItem[]
```

Ninguna función del sistema escribe `CompetencyState` ni `ItemSchedule`: ambos son proyecciones del mismo registro. Persistirlos se considera un bug, y hay un test sobre el adaptador de almacenamiento que lo comprueba.

## Alternativas consideradas

| Alternativa                        | A favor                                       | En contra                                                              |
| ---------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Booleano por lección (el anterior) | Trivial de implementar                        | Es una afirmación; no permite repaso; se contradice con el historial     |
| Guardar estado + historial         | Lectura rápida, sin cálculo                    | Dos fuentes de verdad que divergen; migraciones en cada cambio de regla  |
| Event sourcing completo            | Máxima capacidad de auditoría y replay         | Bus de eventos, versionado, snapshots: infraestructura para un problema que no tenemos |
| Contadores agregados (porcentajes) | Barato de leer                                 | Sin reversibilidad: si cambia la regla, el número es basura              |

## Consecuencias

**Positivas**

- Cambiar las reglas de estado no requiere migración: se reinterpreta el mismo historial.
- El repaso espaciado es natural, porque el historial ya contiene todo lo necesario.
- Los estados nunca mienten: no hay forma de "marcar como aprendido".
- Los tests del modelo son de funciones puras.

**Negativas y costes**

- Cada render calcula. Con cientos de intentos por usuario es irrelevante; con decenas de miles habría que cachear.
- El registro crece de forma monótona. No se implementa compactación en la v1.
- Conceptualmente exige disciplina: es tentador "guardar el resultado para no recalcular".

## Camino a multiusuario

Esta decisión no solo no estorba a un futuro con cuentas: **lo hace fácil**. Un registro append-only de hechos inmutables es el formato que mejor se sincroniza, porque **unir dos historiales no es fusionar estados**.

### Por qué no hay conflictos

Dos dispositivos responden el mismo ítem y producen dos intentos distintos:

```text
portátil, 10:00  →  { id: 'a1b2', itemId: 'token-vs-word', correct: false, ... }
móvil,   10:05  →  { id: 'c3d4', itemId: 'token-vs-word', correct: true,  ... }
```

No se contradicen: **ocurrieron las dos cosas**. Sincronizar es la unión por `id`:

```ts
const merged = dedupeById([...local, ...remote]);
```

Al recalcular, `foldSchedule` aplica ambos en orden cronológico y produce la programación correcta. No hay "gana la última escritura", ni relojes vectoriales, ni resolución de conflictos, porque no hay nada que resolver.

Como las programaciones también son derivadas, **solo se sincroniza una entidad, y solo recibe inserciones**. Es el caso más sencillo de un problema difícil.

### Tres detalles que se deciden hoy porque después son migración

1. **`Attempt.id` es un UUID generado en el cliente.** Sin autoincrementales: dos dispositivos deben poder crear intentos sin coordinarse.
2. **`Attempt.deviceId` existe desde el primer commit.** En la v1 es una constante; con cuentas, permite distinguir el origen y depurar la sincronización.
3. **El puerto es asíncrono e idempotente desde el principio:**

   ```ts
   export interface AttemptStore {
     append(attempts: Attempt[]): Promise<void>; // insertar dos veces el mismo id no hace nada
     list(): Promise<Attempt[]>;
   }
   ```

   El adaptador local lo cumple en veinte líneas; el remoto, en treinta. Y el mismo contrato sirve a los tests.

Con esto, "modo local" y "modo cuenta" no son dos arquitecturas: son **dos adaptadores del mismo puerto**.

### Lo que sí cambia con cuentas

No es solo dónde se guardan los datos. Aparecen identidad, autorización (que un usuario no lea los intentos de otro), migración de los intentos locales al primer inicio de sesión, borrado de datos, y una política de privacidad. Detalle y condición de activación en [ADR-006](ADR-006-persistencia-local.md).

## Criterio de revisión

Si el cálculo de las proyecciones se volviera perceptible (> 50 ms) con volumen real, se añade una **caché derivada**, invalidada por los propios hechos. La fuente de verdad no cambia.
