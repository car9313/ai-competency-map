/**
 * Plegado del historial.
 *
 * `foldSchedule` es la fuente de verdad de la programación de un ítem: parte del estado
 * inicial y aplica `scheduleNext` a cada intento en orden cronológico. No hay estado de
 * planificación almacenado en ninguna parte (invariante I15).
 *
 * La equivalencia entre «plegar todo» y «aplicar uno a uno» es el invariante I16 y tiene
 * su propio test.
 */
import type { Clock } from '@/shared/time/clock';
import { initialSchedule, scheduleNext } from './schedule';
import type { Attempt, ItemSchedule } from './types';

/**
 * Orden cronológico estable.
 *
 * El desempate por `id` no es cosmético: dos intentos con el mismo instante deben
 * producir siempre el mismo historial, en cualquier máquina y en cualquier orden de
 * llegada.
 */
export function compareAttempts(a: Attempt, b: Attempt): number {
  const byInstant = a.answeredAt.localeCompare(b.answeredAt);

  return byInstant !== 0 ? byInstant : a.id.localeCompare(b.id);
}

/** Programación derivada de un ítem a partir de su historial completo. */
export function foldSchedule(
  itemId: string,
  attempts: readonly Attempt[],
  clock: Clock,
): ItemSchedule {
  const ordered = attempts.filter((attempt) => attempt.itemId === itemId).sort(compareAttempts);
  const [first] = ordered;

  let schedule = initialSchedule(itemId, first ? clock.dateOf(first.answeredAt) : clock.today());

  for (const attempt of ordered) {
    schedule = scheduleNext(schedule, attempt, clock.dateOf(attempt.answeredAt));
  }

  return schedule;
}

/** Agrupa intentos por ítem conservando el orden cronológico dentro de cada grupo. */
export function groupAttemptsByItem(attempts: readonly Attempt[]): Map<string, Attempt[]> {
  const grouped = new Map<string, Attempt[]>();

  for (const attempt of attempts) {
    const bucket = grouped.get(attempt.itemId);

    if (bucket) {
      bucket.push(attempt);
    } else {
      grouped.set(attempt.itemId, [attempt]);
    }
  }

  for (const bucket of grouped.values()) {
    bucket.sort(compareAttempts);
  }

  return grouped;
}
