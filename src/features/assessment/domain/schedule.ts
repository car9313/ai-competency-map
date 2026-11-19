/**
 * El planificador: una transición por intento.
 *
 * `scheduleNext` es pura e idempotente respecto a sus argumentos: mismo
 * (programación, intento, fecha) produce siempre el mismo resultado, sin leer
 * el reloj del sistema (invariante I10, regla D8).
 *
 * El intervalo se calcula con la facilidad **anterior** al ajuste de la regla:
 * así el ejemplo numérico de docs/domain/assessment-engine.md §4.3 se cumple
 * exactamente (3 × 2.50 = 8 tras redondear, y luego la facilidad sube a 2.55).
 */
import { addDays } from './date';
import {
  INITIAL_EASE,
  INITIAL_INTERVAL_DAYS,
  MAX_EASE,
  MAX_INTERVAL_DAYS,
  MIN_EASE,
  MIN_INTERVAL_DAYS,
  RULES,
  type EaseRule,
  type IntervalRule,
  type Rule,
} from './rules';
import type { Attempt, ItemSchedule, IsoDate } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Redondeo a dos decimales.
 *
 * Sin esto, sumar y restar 0.05 repetidamente acumula error de coma flotante
 * (2.4 - 0.05 = 2.3499999999999996) y la facilidad acaba mostrando valores absurdos
 * al usuario. Dos decimales son más que suficientes para un multiplicador.
 */
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Programación inicial de un ítem que nunca se ha intentado. */
export function initialSchedule(itemId: string, today: IsoDate): ItemSchedule {
  return {
    itemId,
    phase: 'new',
    intervalDays: INITIAL_INTERVAL_DAYS,
    ease: INITIAL_EASE,
    lapses: 0,
    dueAt: today,
    lastReviewedAt: null,
  };
}

/**
 * Busca la regla aplicable. Gana la primera coincidencia de la tabla.
 * Lanza si no hay ninguna: un hueco en la tabla es un bug, no un caso a tolerar.
 */
export function findRule(schedule: ItemSchedule, attempt: Attempt): Rule {
  const rule = RULES.find(
    (candidate) =>
      candidate.phase === schedule.phase &&
      candidate.correct === attempt.correct &&
      (candidate.confidence === null || candidate.confidence === attempt.confidence),
  );

  if (!rule) {
    throw new Error(
      `Sin regla para fase="${schedule.phase}" correcto=${attempt.correct} confianza="${attempt.confidence}"`,
    );
  }

  return rule;
}

function resolveInterval(rule: IntervalRule, schedule: ItemSchedule): number {
  switch (rule.kind) {
    case 'fixed':
      return rule.days;
    case 'byEase':
      return Math.round(schedule.intervalDays * schedule.ease);
    case 'scale':
      return Math.round(schedule.intervalDays * rule.factor);
  }
}

function resolveEase(rule: EaseRule, currentEase: number): number {
  return rule.kind === 'set' ? rule.value : currentEase + rule.amount;
}

/**
 * Aplica un intento a una programación y devuelve la siguiente.
 *
 * `today` es la fecha del intento en el calendario del alumno. La calcula el
 * adaptador del reloj: el dominio no conoce zonas horarias a propósito.
 */
export function scheduleNext(
  schedule: ItemSchedule,
  attempt: Attempt,
  today: IsoDate,
): ItemSchedule {
  if (attempt.itemId !== schedule.itemId) {
    throw new Error(
      `El intento pertenece al ítem "${attempt.itemId}" y la programación a "${schedule.itemId}"`,
    );
  }

  const rule = findRule(schedule, attempt);

  const intervalDays = clamp(
    resolveInterval(rule.interval, schedule),
    MIN_INTERVAL_DAYS,
    MAX_INTERVAL_DAYS,
  );
  const ease = clamp(roundTo(resolveEase(rule.ease, schedule.ease), 2), MIN_EASE, MAX_EASE);

  return {
    itemId: schedule.itemId,
    phase: rule.nextPhase,
    intervalDays,
    ease,
    lapses: schedule.lapses + (rule.lapse ? 1 : 0),
    dueAt: addDays(today, intervalDays),
    lastReviewedAt: attempt.answeredAt,
  };
}
