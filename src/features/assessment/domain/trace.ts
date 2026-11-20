/**
 * Traza de la programación de un ítem.
 *
 * `foldSchedule` dice en qué estado queda un ítem; esto dice **qué hizo cada intento**.
 * Es la diferencia entre ver una fecha y entenderla.
 *
 * La traza se calcula aplicando `scheduleNext` una vez por intento, igual que el plegado,
 * y no recalculando desde cero cada vez: mismo resultado, coste lineal.
 */
import type { Clock } from '@/shared/time/clock';
import { compareAttempts } from './fold';
import { initialSchedule, scheduleNext } from './schedule';
import type { Attempt, ItemSchedule } from './types';

export interface AttemptTransition {
  attempt: Attempt;
  /** Estado del ítem justo antes de este intento. */
  before: ItemSchedule;
  /** Estado después de aplicarlo. */
  after: ItemSchedule;
}

/**
 * Transiciones de un ítem, en orden cronológico.
 *
 * Garantía: la última `after` es exactamente lo que devuelve `foldSchedule` para ese ítem.
 * Está comprobada en los tests; si alguna vez diverge, el historial mostraría una
 * explicación que no corresponde a la fecha real.
 */
export function traceItemSchedule(
  itemId: string,
  attempts: readonly Attempt[],
  clock: Clock,
): AttemptTransition[] {
  const ordered = attempts
    .filter((attempt) => attempt.itemId === itemId)
    .sort(compareAttempts);

  const first = ordered[0];

  if (!first) {
    return [];
  }

  let schedule = initialSchedule(itemId, clock.dateOf(first.answeredAt));
  const transitions: AttemptTransition[] = [];

  for (const attempt of ordered) {
    const before = schedule;

    schedule = scheduleNext(schedule, attempt, clock.dateOf(attempt.answeredAt));
    transitions.push({ attempt, before, after: schedule });
  }

  return transitions;
}
