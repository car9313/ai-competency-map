/**
 * Proyecciones: el estado se calcula, nunca se guarda (ADR-003).
 *
 * Aquí se responde a dos preguntas distintas, y a propósito separadas:
 *
 *   projectState()    ¿cuál es el dominio actual de esta competencia?
 *   projectUnlocked()  ¿puede el alumno entrar en esta competencia?
 *
 * El desbloqueo **no** depende del dominio: `consolidated` es un estado vivo que decae,
 * y si el desbloqueo dependiera de él, una competencia ya alcanzada podría volver a
 * bloquearse al fallar un repaso. El desbloqueo es permanente una vez ganado.
 */
import type { Clock } from '@/shared/time/clock';
import type { Prerequisite } from '@/shared/types/domain';
import { compareAttempts } from './fold';
import { initialSchedule, scheduleNext } from './schedule';
import type { Attempt, Item, ItemSchedule } from './types';

export type CompetencyState = 'no_evidence' | 'learning' | 'almost' | 'consolidated' | 'at_risk';

/**
 * Un ítem cuenta como consolidado si su último intento fue correcto y no está en
 * `relearning`. Fíjate en que NO se exige `phase === 'review'`: un acierto dudoso deja
 * el ítem en `learning` y sigue siendo un acierto (R2, R5, R11).
 */
function isConsolidated(
  itemIds: readonly string[],
  latest: ReadonlyMap<string, Attempt>,
  schedules: ReadonlyMap<string, ItemSchedule>,
): boolean {
  if (itemIds.length === 0) {
    return false;
  }

  return itemIds.every((itemId) => {
    const attempt = latest.get(itemId);

    if (!attempt || !attempt.correct) {
      return false;
    }

    const schedule = schedules.get(itemId);

    return schedule !== undefined && schedule.phase !== 'relearning';
  });
}

/**
 * Estado de una competencia, evaluado en este orden (gana el primero):
 *
 *   1. no_evidence   — no hay intentos sobre ninguno de sus ítems
 *   2. consolidated  — todos los ítems intentados, últimos aciertos, ninguno en relearning
 *   3. at_risk       — estuvo consolidada y ya no lo está
 *   4. almost        — todos los ítems intentados y solo uno sin el último acierto
 *   5. learning      — cualquier otro caso
 *
 * `almost` existe por un problema real: con cuatro ítems, fallar uno deja la competencia en
 * `learning`, que se lee como «no sé nada» cuando en realidad faltan tres de cuatro. La regla
 * de consolidación no se relaja —sigue exigiendo los cuatro—, pero el estado deja de mentir
 * sobre cuánto falta.
 *
 * `at_risk` va antes que `almost` a propósito: haber tenido la competencia y perderla es más
 * informativo que estar a un ítem, y pide una acción distinta.
 */
export function projectState(
  items: readonly Item[],
  attempts: readonly Attempt[],
  clock: Clock,
): CompetencyState {
  return projectStateByIds(
    items.map((item) => item.id),
    attempts,
    clock,
  );
}

/**
 * La misma proyección, por identificadores.
 *
 * Existe porque calcular un estado solo necesita **qué ítems** tiene la competencia, no sus
 * enunciados ni sus opciones. Pasar objetos `Item` completos desde el servidor al cliente
 * metía en el HTML de cada tarjeta del mapa el texto de todas las preguntas, y con 156 ítems
 * eso pesa. Los identificadores son todo lo que hace falta.
 */
export function projectStateByIds(
  itemIds: readonly string[],
  attempts: readonly Attempt[],
  clock: Clock,
): CompetencyState {
  const known = new Set(itemIds);
  const relevant = attempts.filter((attempt) => known.has(attempt.itemId));

  if (relevant.length === 0) {
    return 'no_evidence';
  }

  const ordered = [...relevant].sort(compareAttempts);
  const latest = new Map<string, Attempt>();
  const schedules = new Map<string, ItemSchedule>();

  let everConsolidated = false;

  for (const attempt of ordered) {
    latest.set(attempt.itemId, attempt);

    const current =
      schedules.get(attempt.itemId) ??
      initialSchedule(attempt.itemId, clock.dateOf(attempt.answeredAt));
    schedules.set(
      attempt.itemId,
      scheduleNext(current, attempt, clock.dateOf(attempt.answeredAt)),
    );

    // La comprobación es O(ítems) por intento. Con decenas de ítems y cientos de
    // intentos es irrelevante, y evita guardar el histórico de estados.
    if (isConsolidated(itemIds, latest, schedules)) {
      everConsolidated = true;
    }
  }

  if (isConsolidated(itemIds, latest, schedules)) {
    return 'consolidated';
  }

  if (everConsolidated) {
    return 'at_risk';
  }

  const allAttempted = itemIds.every((itemId) => latest.has(itemId));
  const settled = itemIds.filter((itemId) => {
    const schedule = schedules.get(itemId);

    return latest.get(itemId)?.correct === true && schedule?.phase !== 'relearning';
  }).length;

  if (itemIds.length >= 2 && allAttempted && settled === itemIds.length - 1) {
    return 'almost';
  }

  return 'learning';
}

/**
 * ¿Está desbloqueada una competencia?
 *
 * Sí, cuando **todos** sus prerrequisitos tienen alguna evidencia. Basta con
 * `learning`: no se exige dominio, solo haber empezado.
 */
export function projectUnlocked(
  competencyId: string,
  prerequisites: readonly Prerequisite[],
  states: ReadonlyMap<string, CompetencyState>,
): boolean {
  return prerequisites
    .filter((prerequisite) => prerequisite.to === competencyId)
    .every((prerequisite) => (states.get(prerequisite.from) ?? 'no_evidence') !== 'no_evidence');
}

/**
 * Resultado del último intento de un ítem.
 *
 * Sirve para responder «¿qué tal voy en esta competencia?» sin inventar un porcentaje de
 * acierto. Un porcentaje mezcla ítems, ignora la confianza y la antigüedad, y no dice qué
 * hacer; el resultado por ítem sí: señala exactamente qué falta.
 */
export type ItemOutcome = 'no_evidence' | 'correct' | 'incorrect';

export function projectItemOutcome(itemId: string, attempts: readonly Attempt[]): ItemOutcome {
  const own = attempts.filter((attempt) => attempt.itemId === itemId);

  if (own.length === 0) {
    return 'no_evidence';
  }

  const ordered = [...own].sort(compareAttempts);
  const last = ordered[ordered.length - 1];

  return last?.correct ? 'correct' : 'incorrect';
}
