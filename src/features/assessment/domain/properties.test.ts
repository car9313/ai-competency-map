import { describe, expect, it } from 'vitest';
import { MAX_EASE, MAX_INTERVAL_DAYS, MIN_EASE, MIN_INTERVAL_DAYS } from './rules';
import { scheduleNext } from './schedule';
import { mulberry32 } from './shuffle';
import { makeAttempt, makeSchedule, TEST_TODAY } from './test-helpers';
import type { Confidence, ItemSchedule, Phase } from './types';

/**
 * Comprobación de propiedades sobre secuencias generadas.
 *
 * Los doce casos de `schedule.test.ts` verifican la tabla regla a regla. Esto verifica
 * lo otro: que **ninguna secuencia larga** de intentos rompe los invariantes. Un bug en
 * una acotación o en un delta enseguida produce valores absurdos en algún punto.
 *
 * El generador es determinista (Mulberry32 con semilla fija por secuencia), así que un
 * fallo es reproducible sin necesidad de semilla aleatoria.
 */

const PHASES: readonly Phase[] = ['new', 'learning', 'review', 'relearning'];
const CONFIDENCES: readonly Confidence[] = ['confident', 'doubtful'];

const SEQUENCES = 200;
const STEPS = 60;

function pick<T>(items: readonly T[], random: () => number): T {
  const value = items[Math.floor(random() * items.length)];

  if (value === undefined) {
    throw new Error('pick: no se puede elegir de una lista vacía');
  }

  return value;
}

/**
 * Intervalos ALCANZABLES por fase (invariante I17).
 *
 * No son rangos elegidos al azar: son los únicos valores que las reglas pueden producir.
 *   new        → 1                    (estado inicial)
 *   learning   → 1 (R2, R11) o 2 (R5)
 *   relearning → 1                    (R3, R6, R9, R12)
 *   review     → 3 (R1, R4, R10) hasta 180 (techo)
 *
 * Esto importa: I14 («un acierto con confianza nunca acorta el intervalo») solo es
 * cierto sobre estados alcanzables. Con `learning` en 7 días, R4 lo bajaría a 3 y el
 * test fallaría — pero ese estado no existe en el sistema.
 */
const INTERVAL_RANGE_BY_PHASE: Record<Phase, readonly [number, number]> = {
  new: [1, 1],
  learning: [1, 2],
  review: [3, MAX_INTERVAL_DAYS],
  relearning: [1, 1],
};

function randomSchedule(random: () => number): ItemSchedule {
  const phase = pick(PHASES, random);
  const [minInterval, maxInterval] = INTERVAL_RANGE_BY_PHASE[phase];

  return makeSchedule({
    phase,
    intervalDays: minInterval + Math.floor(random() * (maxInterval - minInterval + 1)),
    ease: MIN_EASE + random() * (MAX_EASE - MIN_EASE),
    lapses: phase === 'new' ? 0 : Math.floor(random() * 3),
  });
}

/** Ejecuta una secuencia y devuelve las programaciones producidas. */
function runSequence(sequence: number): ItemSchedule[] {
  const random = mulberry32(9_000 + sequence);
  const history: ItemSchedule[] = [];

  let schedule = randomSchedule(random);

  for (let step = 0; step < STEPS; step += 1) {
    const correct = random() < 0.6;
    const confidence = pick(CONFIDENCES, random);

    schedule = scheduleNext(
      schedule,
      makeAttempt({ id: `s${sequence}-${step}`, correct, confidence }),
      TEST_TODAY,
    );
    history.push(schedule);
  }

  return history;
}

describe('invariantes sobre secuencias generadas', () => {
  it(`I12, I13 e I14 se mantienen en ${SEQUENCES} secuencias de ${STEPS} intentos`, () => {
    for (let sequence = 0; sequence < SEQUENCES; sequence += 1) {
      const history = runSequence(sequence);
      let previous: ItemSchedule | undefined;

      for (const [step, schedule] of history.entries()) {
        const where = `secuencia ${sequence}, paso ${step}`;

        // I12 · acotaciones
        expect(schedule.ease, `${where}: facilidad`).toBeGreaterThanOrEqual(MIN_EASE);
        expect(schedule.ease, `${where}: facilidad`).toBeLessThanOrEqual(MAX_EASE);
        expect(schedule.intervalDays, `${where}: intervalo`).toBeGreaterThanOrEqual(
          MIN_INTERVAL_DAYS,
        );
        expect(schedule.intervalDays, `${where}: intervalo`).toBeLessThanOrEqual(
          MAX_INTERVAL_DAYS,
        );

        // El vencimiento siempre es posterior al día del intento.
        expect(schedule.dueAt > TEST_TODAY, `${where}: vencimiento`).toBe(true);

        if (previous) {
          // I13 · los lapsos nunca disminuyen
          expect(schedule.lapses, `${where}: lapsos`).toBeGreaterThanOrEqual(previous.lapses);
        }

        previous = schedule;
      }
    }
  });

  it('un acierto con confianza nunca acorta el intervalo (I14)', () => {
    // Se comprueba aparte porque necesita los dos accidentes del intento anterior.
    for (let sequence = 0; sequence < SEQUENCES; sequence += 1) {
      const random = mulberry32(4_500 + sequence);
      let schedule = randomSchedule(random);

      for (let step = 0; step < STEPS; step += 1) {
        const previous = schedule;
        const correct = random() < 0.7;
        const confidence: Confidence = random() < 0.5 ? 'confident' : 'doubtful';

        schedule = scheduleNext(
          previous,
          makeAttempt({ id: `q${sequence}-${step}`, correct, confidence }),
          TEST_TODAY,
        );

        if (correct && confidence === 'confident') {
          expect(
            schedule.intervalDays,
            `secuencia ${sequence}, paso ${step}: ${previous.phase} → ${schedule.phase}`,
          ).toBeGreaterThanOrEqual(previous.intervalDays);
        }
      }
    }
  });

  it('la misma secuencia produce siempre el mismo historial', () => {
    expect(runSequence(17)).toEqual(runSequence(17));
  });
});
