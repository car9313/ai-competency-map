/**
 * Registrar un intento.
 *
 * Es el caso de uso central del producto: convierte una respuesta del alumno en evidencia
 * que perdura. Hace exactamente tres cosas —construir el intento, guardarlo y devolver cómo
 * queda la programación— y ninguna de ellas es visual.
 *
 * Lo importante es lo que **no** guarda: ni programación, ni estado de competencia. Todo eso
 * se recalcula (invariante I15).
 */
import type { Clock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { daysBetween } from '../domain/date';
import { foldSchedule } from '../domain/fold';
import type { Attempt, Confidence, ItemSchedule } from '../domain/types';
import type { AttemptStore } from './attempt-store';

export interface SubmitAttemptInput {
  item: Item;
  selectedOptionId: string;
  confidence: Confidence;
  /** Orden exacto en que se mostraron las opciones (invariante I11). */
  presentedOptionIds: readonly string[];
  durationMs: number;
  deviceId: string;
  attemptId: string;
  clock: Clock;
}

export interface SubmitAttemptResult {
  attempt: Attempt;
  /** Programación antes de este intento. */
  previous: ItemSchedule;
  /** Programación después. */
  next: ItemSchedule;
  daysUntilDue: number;
  correct: boolean;
  /** `true` si este intento hizo subir el intervalo. */
  intervalGrew: boolean;
}

export async function submitAttempt(
  store: AttemptStore,
  input: SubmitAttemptInput,
): Promise<SubmitAttemptResult> {
  const { item, selectedOptionId, confidence, presentedOptionIds, durationMs, deviceId, clock } =
    input;

  const selected = item.options.find((option) => option.id === selectedOptionId);

  if (!selected) {
    throw new Error(`La opción "${selectedOptionId}" no pertenece al ítem "${item.id}".`);
  }

  const attempt: Attempt = {
    id: input.attemptId,
    deviceId,
    itemId: item.id,
    answeredAt: clock.now(),
    selectedOptionId,
    correct: selected.correct,
    confidence,
    presentedOptionIds: [...presentedOptionIds],
    durationMs,
  };

  const before = await store.list();
  const previous = foldSchedule(item.id, before, clock);

  await store.append([attempt]);

  const after = await store.list();
  const next = foldSchedule(item.id, after, clock);

  return {
    attempt,
    previous,
    next,
    daysUntilDue: Math.max(0, daysBetween(clock.today(), next.dueAt)),
    correct: selected.correct,
    intervalGrew: next.intervalDays > previous.intervalDays,
  };
}
