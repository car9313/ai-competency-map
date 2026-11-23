/**
 * La cola de repaso: derivada, nunca almacenada.
 *
 * Es la pantalla de inicio del producto. Contiene exactamente los ítems cuyo vencimiento
 * ya pasó, ordenados por vencimiento y después por dificultad: lo más atrasado primero,
 * y a igual atraso, lo más fácil primero para no empezar la sesión con un muro.
 */
import type { Clock } from '@/shared/time/clock';
import { daysBetween, isOnOrBefore } from './date';
import { compareAttempts, foldSchedule, groupAttemptsByItem } from './fold';
import type { Attempt, IsoTimestamp, Item, ItemSchedule } from './types';

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

/** Un fallo pendiente de reparar: el ítem y cuándo se falló por última vez. */
export interface MistakeQueueItem {
  readonly item: Item;
  readonly schedule: ItemSchedule;
  readonly failedAt: IsoTimestamp;
}

/**
 * Cola de fallos: los ítems cuyo **último** intento fue incorrecto.
 *
 * Existe por una razón de producto: quien va justo de tiempo quiere cerrar brechas, no
 * repasar lo que ya domina. Es más estrecha que la cola del día y no respeta el vencimiento,
 * porque un fallo reciente se repara mejor hoy que dentro de tres días.
 *
 * Deliberadamente **no** incluye los ítems que acertaste y luego venciste: esos los trae la
 * cola normal cuando toca. Mezclar ambas cosas convertiría esto en «todo menos el mapa».
 */
export function buildMistakeQueue(
  items: readonly Item[],
  attempts: readonly Attempt[],
  clock: Clock,
): MistakeQueueItem[] {
  const attemptsByItem = groupAttemptsByItem(attempts);

  const fallos = items.flatMap((item) => {
    const propios = attemptsByItem.get(item.id) ?? [];

    if (propios.length === 0) {
      return [];
    }

    const ultimo = [...propios].sort(compareAttempts)[propios.length - 1];

    if (!ultimo || ultimo.correct) {
      return [];
    }

    return [
      {
        item,
        schedule: foldSchedule(item.id, propios, clock),
        failedAt: ultimo.answeredAt,
      },
    ];
  });

  // Lo último que fallaste, primero: es lo que está más fresco en la memoria.
  return fallos.sort((a, b) => {
    const byRecency = b.failedAt.localeCompare(a.failedAt);

    if (byRecency !== 0) {
      return byRecency;
    }

    const byDifficulty = a.item.difficulty - b.item.difficulty;

    return byDifficulty !== 0 ? byDifficulty : a.item.id.localeCompare(b.item.id);
  });
}
