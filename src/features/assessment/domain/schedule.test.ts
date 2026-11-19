import { describe, expect, it } from 'vitest';
import { addDays } from './date';
import { MAX_EASE, MAX_INTERVAL_DAYS, MIN_EASE, MIN_INTERVAL_DAYS } from './rules';
import { initialSchedule, scheduleNext } from './schedule';
import { makeAttempt, makeSchedule, TEST_ITEM_ID, TEST_TODAY } from './test-helpers';
import type { Confidence, ItemSchedule, Phase } from './types';

/**
 * Esta tabla es una copia INDEPENDIENTE de docs/domain/assessment-engine.md §4.2.
 *
 * Está escrita a mano a propósito: si alguien edita `rules.ts` y el documento y el
 * test no coinciden, el test falla. Si el test se generara a partir de `RULES`, no
 * verificaría nada.
 */
interface RuleCase {
  rule: string;
  from: { phase: Phase; intervalDays: number; ease: number; lapses: number };
  answer: { correct: boolean; confidence: Confidence };
  expect: { phase: Phase; intervalDays: number; ease: number; lapses: number };
}

const CASES: readonly RuleCase[] = [
  {
    rule: 'R1 · new + acierto seguro → review en 3 días',
    from: { phase: 'new', intervalDays: 1, ease: 2.5, lapses: 0 },
    answer: { correct: true, confidence: 'confident' },
    expect: { phase: 'review', intervalDays: 3, ease: 2.5, lapses: 0 },
  },
  {
    rule: 'R2 · new + acierto dudoso → learning en 1 día',
    from: { phase: 'new', intervalDays: 1, ease: 2.5, lapses: 0 },
    answer: { correct: true, confidence: 'doubtful' },
    expect: { phase: 'learning', intervalDays: 1, ease: 2.5, lapses: 0 },
  },
  {
    rule: 'R3 · new + fallo → relearning, primer lapso',
    from: { phase: 'new', intervalDays: 1, ease: 2.5, lapses: 0 },
    answer: { correct: false, confidence: 'confident' },
    expect: { phase: 'relearning', intervalDays: 1, ease: 2.3, lapses: 1 },
  },
  {
    rule: 'R4 · learning + acierto seguro → review en 3 días',
    from: { phase: 'learning', intervalDays: 1, ease: 2.5, lapses: 0 },
    answer: { correct: true, confidence: 'confident' },
    expect: { phase: 'review', intervalDays: 3, ease: 2.5, lapses: 0 },
  },
  {
    rule: 'R5 · learning + acierto dudoso → sigue en learning',
    from: { phase: 'learning', intervalDays: 2, ease: 2.4, lapses: 0 },
    answer: { correct: true, confidence: 'doubtful' },
    expect: { phase: 'learning', intervalDays: 2, ease: 2.35, lapses: 0 },
  },
  {
    rule: 'R6 · learning + fallo → relearning y baja la facilidad',
    from: { phase: 'learning', intervalDays: 2, ease: 2.5, lapses: 0 },
    answer: { correct: false, confidence: 'doubtful' },
    expect: { phase: 'relearning', intervalDays: 1, ease: 2.3, lapses: 1 },
  },
  {
    rule: 'R7 · review + acierto seguro → intervalo × facilidad',
    from: { phase: 'review', intervalDays: 3, ease: 2.5, lapses: 0 },
    answer: { correct: true, confidence: 'confident' },
    expect: { phase: 'review', intervalDays: 8, ease: 2.55, lapses: 0 },
  },
  {
    rule: 'R8 · review + acierto dudoso → intervalo × 1.2',
    from: { phase: 'review', intervalDays: 8, ease: 2.5, lapses: 0 },
    answer: { correct: true, confidence: 'doubtful' },
    expect: { phase: 'review', intervalDays: 10, ease: 2.45, lapses: 0 },
  },
  {
    rule: 'R9 · review + fallo → relearning y lapso',
    from: { phase: 'review', intervalDays: 8, ease: 2.5, lapses: 0 },
    answer: { correct: false, confidence: 'confident' },
    expect: { phase: 'relearning', intervalDays: 1, ease: 2.3, lapses: 1 },
  },
  {
    rule: 'R10 · relearning + acierto seguro → vuelve a review',
    from: { phase: 'relearning', intervalDays: 1, ease: 2.3, lapses: 1 },
    answer: { correct: true, confidence: 'confident' },
    expect: { phase: 'review', intervalDays: 3, ease: 2.3, lapses: 1 },
  },
  {
    rule: 'R11 · relearning + acierto dudoso → baja a learning',
    from: { phase: 'relearning', intervalDays: 1, ease: 2.3, lapses: 1 },
    answer: { correct: true, confidence: 'doubtful' },
    expect: { phase: 'learning', intervalDays: 2, ease: 2.3, lapses: 1 },
  },
  {
    rule: 'R12 · relearning + fallo → sigue en relearning y suma lapso',
    from: { phase: 'relearning', intervalDays: 1, ease: 2.3, lapses: 1 },
    answer: { correct: false, confidence: 'doubtful' },
    expect: { phase: 'relearning', intervalDays: 1, ease: 2.1, lapses: 2 },
  },
];

function buildSchedule(from: RuleCase['from']): ItemSchedule {
  return makeSchedule({
    phase: from.phase,
    intervalDays: from.intervalDays,
    ease: from.ease,
    lapses: from.lapses,
  });
}

describe('scheduleNext · las doce reglas', () => {
  for (const testCase of CASES) {
    it(testCase.rule, () => {
      const next = scheduleNext(
        buildSchedule(testCase.from),
        makeAttempt(testCase.answer),
        TEST_TODAY,
      );

      expect(next.phase).toBe(testCase.expect.phase);
      expect(next.intervalDays).toBe(testCase.expect.intervalDays);
      expect(next.ease).toBe(testCase.expect.ease);
      expect(next.lapses).toBe(testCase.expect.lapses);
      expect(next.dueAt).toBe(addDays(TEST_TODAY, testCase.expect.intervalDays));
      expect(next.itemId).toBe(TEST_ITEM_ID);
      expect(next.lastReviewedAt).toBe('2026-11-19T10:00:00.000Z');
    });
  }
});

describe('scheduleNext · acotaciones', () => {
  it('la facilidad no baja del suelo de 1.3', () => {
    const schedule = makeSchedule({ phase: 'review', intervalDays: 5, ease: MIN_EASE, lapses: 0 });

    const next = scheduleNext(schedule, makeAttempt({ correct: false }), TEST_TODAY);

    expect(next.ease).toBe(MIN_EASE);
  });

  it('la facilidad no sube del techo de 2.8', () => {
    const schedule = makeSchedule({ phase: 'review', intervalDays: 5, ease: MAX_EASE, lapses: 0 });

    const next = scheduleNext(schedule, makeAttempt(), TEST_TODAY);

    expect(next.ease).toBe(MAX_EASE);
  });

  it('el intervalo no pasa del techo de 180 días', () => {
    const schedule = makeSchedule({ phase: 'review', intervalDays: 150, ease: 2.8, lapses: 0 });

    const next = scheduleNext(schedule, makeAttempt(), TEST_TODAY);

    expect(next.intervalDays).toBe(MAX_INTERVAL_DAYS);
  });

  it('el intervalo nunca baja del mínimo de un día', () => {
    const schedule = makeSchedule({ phase: 'review', intervalDays: 1, ease: MIN_EASE, lapses: 0 });

    const next = scheduleNext(schedule, makeAttempt(), TEST_TODAY);

    expect(next.intervalDays).toBeGreaterThanOrEqual(MIN_INTERVAL_DAYS);
  });

  it('la facilidad no acumula error de coma flotante', () => {
    let schedule = makeSchedule({ phase: 'review', intervalDays: 3, ease: 2.5 });

    for (let index = 0; index < 20; index += 1) {
      schedule = scheduleNext(schedule, makeAttempt({ id: `attempt-${index}` }), TEST_TODAY);
    }

    expect(schedule.ease).toBe(MAX_EASE);
    expect(Number.isInteger(Math.round(schedule.ease * 100))).toBe(true);
  });
});

describe('scheduleNext · contrato', () => {
  it('es pura: mismos argumentos, mismo resultado', () => {
    const schedule = makeSchedule({ phase: 'review', intervalDays: 8, ease: 2.5 });
    const attempt = makeAttempt();

    expect(scheduleNext(schedule, attempt, TEST_TODAY)).toEqual(
      scheduleNext(schedule, attempt, TEST_TODAY),
    );
  });

  it('no modifica la programación de entrada', () => {
    const schedule = makeSchedule({ phase: 'review', intervalDays: 8, ease: 2.5 });
    const snapshot = structuredClone(schedule);

    scheduleNext(schedule, makeAttempt(), TEST_TODAY);

    expect(schedule).toEqual(snapshot);
  });

  it('rechaza un intento de otro ítem', () => {
    const schedule = makeSchedule();
    const attempt = makeAttempt({ itemId: 'otro-item' });

    expect(() => scheduleNext(schedule, attempt, TEST_TODAY)).toThrow(/pertenece al ítem/);
  });

  it('falla ruidosamente si no hay regla para la combinación', () => {
    const schedule = makeSchedule({ phase: 'inventada' as Phase });

    expect(() => scheduleNext(schedule, makeAttempt(), TEST_TODAY)).toThrow(/Sin regla/);
  });
});

describe('initialSchedule', () => {
  it('empieza en new, con facilidad 2.5 y vencimiento hoy', () => {
    const schedule = initialSchedule(TEST_ITEM_ID, TEST_TODAY);

    expect(schedule).toEqual<ItemSchedule>({
      itemId: TEST_ITEM_ID,
      phase: 'new',
      intervalDays: 1,
      ease: 2.5,
      lapses: 0,
      dueAt: TEST_TODAY,
      lastReviewedAt: null,
    });
  });
});
