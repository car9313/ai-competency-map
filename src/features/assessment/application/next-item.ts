/**
 * Qué ítem toca ahora.
 *
 * Regla: primero lo que nunca se ha visto, después lo que vence antes. Es una elección
 * deliberada y no un `Math.random()`: una sesión que empieza por un ítem al azar hace que
 * el alumno no pueda decidir cuándo parar y que el estado no avance en ningún orden.
 *
 * Es puro: recibe los intentos y el reloj. La cola de repaso (S8) usará la misma
 * proyección, pero con el filtro de "solo lo que ya vence".
 */
import type { Clock, IsoDate } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { foldSchedule } from '../domain/fold';
import { daysBetween } from '../domain/date';
import type { Attempt, ItemSchedule } from '../domain/types';

export interface NextItem {
  item: Item;
  schedule: ItemSchedule;
  /** `true` si el ítem nunca se ha intentado. */
  isNew: boolean;
  /** `true` si ya venció o vence hoy. */
  isDue: boolean;
}

export function pickNextItem(
  items: readonly Item[],
  attempts: readonly Attempt[],
  clock: Clock,
): NextItem | null {
  const attempted = new Set(attempts.map((attempt) => attempt.itemId));
  const today: IsoDate = clock.today();

  const fresh = items.find((item) => !attempted.has(item.id));

  if (fresh) {
    return { item: fresh, schedule: foldSchedule(fresh.id, attempts, clock), isNew: true, isDue: true };
  }

  let best: NextItem | null = null;

  for (const item of items) {
    const schedule = foldSchedule(item.id, attempts, clock);

    if (best === null || schedule.dueAt < best.schedule.dueAt) {
      best = { item, schedule, isNew: false, isDue: schedule.dueAt <= today };
    }
  }

  return best;
}

/** Días que faltan para el próximo repaso, redondeados hacia arriba. */
export function daysUntilDue(schedule: ItemSchedule, clock: Clock): number {
  return Math.max(0, daysBetween(clock.today(), schedule.dueAt));
}

/** Texto honesto: no decir "en 0 días" cuando toca hoy. */
export function describeDue(schedule: ItemSchedule, clock: Clock): string {
  const days = daysUntilDue(schedule, clock);

  if (days === 0) return 'te toca hoy';
  if (days === 1) return 'vuelve mañana';

  return `vuelve en ${days} días`;
}
