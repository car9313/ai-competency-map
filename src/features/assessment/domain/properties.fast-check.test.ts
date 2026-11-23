import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { fixedClock } from '@/shared/time/clock';
import { compareAttempts, foldSchedule } from './fold';
import { MAX_EASE, MAX_INTERVAL_DAYS, MIN_EASE, MIN_INTERVAL_DAYS } from './rules';
import { scheduleNext } from './schedule';
import { TEST_ITEM_ID, TEST_TODAY } from './test-helpers';
import { traceItemSchedule } from './trace';
import type { Attempt, Confidence } from './types';

/**
 * Propiedades del planificador con `fast-check`.
 *
 * `properties.test.ts` ya recorre doscientas secuencias generadas con un PRNG propio. Esto
 * añade lo que aquel no puede: **reducción**. Cuando una propiedad falla, `fast-check` no
 * solo avisa; encoge el contraejemplo hasta la secuencia más pequeña que sigue rompiéndola.
 * Un fallo deja de ser «falló en la secuencia 137» y pasa a ser «falla con dos intentos».
 *
 * Se prueban las cuatro cosas que promete el motor y que ningún caso suelto demuestra:
 *
 * 1. Los límites nunca se violan, con cualquier secuencia.
 * 2. El orden de llegada de los intentos no cambia el resultado.
 * 3. La traza y el plegado cuentan la misma historia.
 * 4. Acertar nunca acorta el intervalo; fallar siempre abre un ciclo de recuperación.
 */

const clock = fixedClock(TEST_TODAY);
const BASE_DAY = Date.UTC(2026, 0, 1);

const CONFIDENCES: readonly Confidence[] = ['confident', 'doubtful'];

function isoDay(offset: number): string {
  const date = new Date(BASE_DAY + offset * 86_400_000);

  return date.toISOString().slice(0, 10);
}


/**
 * Fechas como suma acumulada de huecos, no como días sueltos.
 *
 * La primera versión generaba días independientes en [0, 400] y era demasiado plana: las
 * rachas de aciertos apenas crecían y el intervalo nunca se acercaba al tope, así que
 * quitar la acotación del planificador **no hacía fallar ningún test**. Con huecos
 * acumulados las fechas se separan de verdad —que es cuando el planificador despliega
 * intervalos largos— y la misma mutación se detecta.
 */
const sequenceArb: fc.Arbitrary<Attempt[]> = fc
  .array(
    fc.record({
      hueco: fc.integer({ min: 1, max: 400 }),
      correct: fc.boolean(),
      confidence: fc.constantFrom(...CONFIDENCES),
    }),
    { maxLength: 50 },
  )
  .map((steps) => {
    let dia = 0;

    return steps.map((step, index) => {
      dia += step.hueco;

      return {
        id: `a-${index}`,
        deviceId: 'device',
        itemId: TEST_ITEM_ID,
        answeredAt: `${isoDay(dia)}T10:00:00.000Z`,
        selectedOptionId: 'a',
        correct: step.correct,
        confidence: step.confidence,
        presentedOptionIds: ['a', 'b', 'c'],
        durationMs: 1000,
      };
    });
  });

const RUNS = 200;

describe('planificador · propiedades', () => {
  it('nunca sale de los límites, con cualquier secuencia', () => {
    fc.assert(
      fc.property(sequenceArb, (attempts) => {
        const schedule = foldSchedule(TEST_ITEM_ID, attempts, clock);

        expect(schedule.intervalDays).toBeGreaterThanOrEqual(MIN_INTERVAL_DAYS);
        expect(schedule.intervalDays).toBeLessThanOrEqual(MAX_INTERVAL_DAYS);
        expect(schedule.ease).toBeGreaterThanOrEqual(MIN_EASE);
        expect(schedule.ease).toBeLessThanOrEqual(MAX_EASE);

        // La fecha de vencimiento no puede quedar antes del último repaso visto.
        if (schedule.lastReviewedAt) {
          expect(schedule.dueAt >= schedule.lastReviewedAt.slice(0, 10)).toBe(true);
        }
      }),
      { numRuns: RUNS },
    );
  });

  it('el orden de llegada de los intentos no cambia el resultado', () => {
    fc.assert(
      fc.property(sequenceArb, (attempts) => {
        const enOrden = foldSchedule(TEST_ITEM_ID, [...attempts].sort(compareAttempts), clock);
        const alReves = foldSchedule(TEST_ITEM_ID, [...attempts].reverse(), clock);
        const desordenado = foldSchedule(
          TEST_ITEM_ID,
          [...attempts].sort(() => Math.random() - 0.5),
          clock,
        );

        expect(alReves).toEqual(enOrden);
        expect(desordenado).toEqual(enOrden);
      }),
      { numRuns: RUNS },
    );
  });

  it('la traza y el plegado acaban en el mismo estado', () => {
    fc.assert(
      fc.property(sequenceArb, (attempts) => {
        const traza = traceItemSchedule(TEST_ITEM_ID, attempts, clock);
        const plegado = foldSchedule(TEST_ITEM_ID, attempts, clock);

        // Sin intentos no hay transiciones que comparar; con alguno, la última `after`
        // tiene que ser el estado que se usa en el resto de la app.
        if (traza.length > 0) {
          expect(traza[traza.length - 1]?.after).toEqual(plegado);
        }

        // Y cada transición encadena con la anterior: no hay saltos ni huecos.
        for (let index = 1; index < traza.length; index += 1) {
          expect(traza[index]?.before).toEqual(traza[index - 1]?.after);
        }
      }),
      { numRuns: RUNS },
    );
  });

  it('acertar nunca acorta el intervalo', () => {
    fc.assert(
      fc.property(sequenceArb, fc.constantFrom(...CONFIDENCES), (attempts, confidence) => {
        const previo = foldSchedule(TEST_ITEM_ID, attempts, clock);
        const siguiente = scheduleNext(
          previo,
          {
            id: 'extra',
            deviceId: 'device',
            itemId: TEST_ITEM_ID,
            answeredAt: `${isoDay(500)}T10:00:00.000Z`,
            selectedOptionId: 'a',
            correct: true,
            confidence,
            presentedOptionIds: ['a', 'b', 'c'],
            durationMs: 1000,
          },
          isoDay(500),
        );

        expect(siguiente.intervalDays).toBeGreaterThanOrEqual(previo.intervalDays);
      }),
      { numRuns: RUNS },
    );
  });

  it('fallar abre siempre un ciclo de recuperación de un día', () => {
    fc.assert(
      fc.property(sequenceArb, (attempts) => {
        const previo = foldSchedule(TEST_ITEM_ID, attempts, clock);
        const siguiente = scheduleNext(
          previo,
          {
            id: 'fallo',
            deviceId: 'device',
            itemId: TEST_ITEM_ID,
            answeredAt: `${isoDay(500)}T10:00:00.000Z`,
            selectedOptionId: 'b',
            correct: false,
            confidence: 'confident',
            presentedOptionIds: ['a', 'b', 'c'],
            durationMs: 1000,
          },
          isoDay(500),
        );

        expect(siguiente.phase).toBe('relearning');
        expect(siguiente.intervalDays).toBe(MIN_INTERVAL_DAYS);
        expect(siguiente.dueAt).toBe(isoDay(501));
      }),
      { numRuns: RUNS },
    );
  });

  it('el intervalo se detiene en el tope aunque se acierte siempre', () => {
    /*
     * Esta prueba existe para que la acotación no sea decorativa. Sin el `clamp`, una racha
     * larga con huecos grandes hace crecer el intervalo de forma multiplicativa (3 → 4 → 6 →
     * 9 → …) hasta salirse del calendario. Comprobado quitando el clamp: falla.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 14, max: 45 }),
        fc.integer({ min: 1, max: 400 }),
        (aciertos, hueco) => {
          const attempts: Attempt[] = [];
          let dia = 0;

          for (let index = 0; index < aciertos; index += 1) {
            dia += hueco;
            attempts.push({
              id: `racha-${index}`,
              deviceId: 'device',
              itemId: TEST_ITEM_ID,
              answeredAt: `${isoDay(dia)}T10:00:00.000Z`,
              selectedOptionId: 'a',
              correct: true,
              confidence: 'confident',
              presentedOptionIds: ['a', 'b', 'c'],
              durationMs: 1000,
            });
          }

          const schedule = foldSchedule(TEST_ITEM_ID, attempts, clock);

          expect(schedule.intervalDays).toBeLessThanOrEqual(MAX_INTERVAL_DAYS);
          expect(schedule.ease).toBeLessThanOrEqual(MAX_EASE);
        },
      ),
      { numRuns: RUNS },
    );
  });
});
