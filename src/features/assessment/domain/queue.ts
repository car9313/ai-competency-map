/**
 * La cola de repaso: derivada, nunca almacenada.
 *
 * Es la pantalla de inicio del producto. Contiene exactamente los ítems cuyo vencimiento
 * ya pasó, ordenados por vencimiento y después por dificultad: lo más atrasado primero,
 * y a igual atraso, lo más fácil primero para no empezar la sesión con un muro.
 */
import type { Clock } from '@/shared/time/clock';
import { daysBetween, isOnOrBefore } from './date';
import { foldSchedule, groupAttemptsByItem } from './fold';
import type { Attempt, Item, ItemSchedule } from './types';

export interface ReviewQueueItem {
  readonly item: Item;
  readonly schedule: ItemSchedule;
  /** Días de atraso respecto a hoy. Cero significa "vence hoy". */
  readonly overdueDays: number;
}

/** Comparación estable: vencimiento, dificultad y, por último, id. */
function compareQueueItems(a: ReviewQueueItem, b: ReviewQueueItem): number {
  const byDueAt = a.schedule.dueAt.localeCompare(b.schedule.dueAt);

  if (byDueAt !== 0) {
    return byDueAt;
  }

  const byDifficulty = a.item.difficulty - b.item.difficulty;

  return byDifficulty !== 0 ? byDifficulty : a.item.id.localeCompare(b.item.id);
}

export function buildReviewQueue(
  items: readonly Item[],
  attempts: readonly Attempt[],
  clock: Clock,
): ReviewQueueItem[] {
  const today = clock.today();
  const attemptsByItem = groupAttemptsByItem(attempts);

  return items
    .map((item) => {
      const schedule = foldSchedule(item.id, attemptsByItem.get(item.id) ?? [], clock);

      return { item, schedule, overdueDays: daysBetween(schedule.dueAt, today) };
    })
    // Un ítem sin intentos no está "vencido": está disponible. Su sitio es el mapa.
    .filter((entry) => entry.schedule.lastReviewedAt !== null)
    .filter((entry) => isOnOrBefore(entry.schedule.dueAt, today))
    .sort(compareQueueItems);
}
