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

export type CompetencyState = 'no_evidence' | 'learning' | 'consolidated' | 'at_risk';

/**
 * Un ítem cuenta como consolidado si su último intento fue correcto y no está en
 * `relearning`. Fíjate en que NO se exige `phase === 'review'`: un acierto dudoso deja
 * el ítem en `learning` y sigue siendo un acierto (R2, R5, R11).
 */
function isConsolidated(
  items: readonly Item[],
  latest: ReadonlyMap<string, Attempt>,
  schedules: ReadonlyMap<string, ItemSchedule>,
): boolean {
  if (items.length === 0) {
    return false;
  }

  return items.every((item) => {
    const attempt = latest.get(item.id);

    if (!attempt || !attempt.correct) {
      return false;
    }

    const schedule = schedules.get(item.id);

    return schedule !== undefined && schedule.phase !== 'relearning';
  });
}

/**
 * Estado de una competencia, evaluado en este orden (gana el primero):
 *
 *   1. no_evidence   — no hay intentos sobre ninguno de sus ítems
 *   2. at_risk       — estuvo consolidada y ya no lo está
 *   3. consolidated  — todos los ítems intentados, últimos aciertos, ninguno en relearning
 *   4. learning      — cualquier otro caso
 */
export function projectState(
  items: readonly Item[],
  attempts: readonly Attempt[],
  clock: Clock,
): CompetencyState {
  const itemIds = new Set(items.map((item) => item.id));
  const relevant = attempts.filter((attempt) => itemIds.has(attempt.itemId));

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
    if (isConsolidated(items, latest, schedules)) {
      everConsolidated = true;
    }
  }

  const consolidatedNow = isConsolidated(items, latest, schedules);

  if (everConsolidated && !consolidatedNow) {
    return 'at_risk';
  }

  return consolidatedNow ? 'consolidated' : 'learning';
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
