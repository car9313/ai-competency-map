import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/shared/time/clock';
import { foldSchedule, groupAttemptsByItem } from './fold';
import { initialSchedule, scheduleNext } from './schedule';
import { correctAttempt, makeAttempt, on, TEST_ITEM_ID, TEST_TODAY, wrongAttempt } from './test-helpers';
import type { Attempt } from './types';

const clock = fixedClock(TEST_TODAY);

describe('foldSchedule', () => {
  it('sin intentos devuelve el estado inicial', () => {
    expect(foldSchedule(TEST_ITEM_ID, [], clock)).toEqual(
      initialSchedule(TEST_ITEM_ID, TEST_TODAY),
    );
  });

  it('ignora los intentos de otros ítems', () => {
    const attempts = [correctAttempt('otro-item', '2026-11-18')];

    expect(foldSchedule(TEST_ITEM_ID, attempts, clock)).toEqual(
      initialSchedule(TEST_ITEM_ID, TEST_TODAY),
    );
  });

  it('pliega el historial en orden cronológico aunque llegue desordenado', () => {
    const day1 = correctAttempt(TEST_ITEM_ID, '2026-11-10', 'a1');
    const day2 = correctAttempt(TEST_ITEM_ID, '2026-11-13', 'a2');
    const day3 = correctAttempt(TEST_ITEM_ID, '2026-11-16', 'a3');

    const ordered = foldSchedule(TEST_ITEM_ID, [day1, day2, day3], clock);
    const shuffled = foldSchedule(TEST_ITEM_ID, [day3, day1, day2], clock);

    expect(ordered).toEqual(shuffled);
    // new → review (3) → 8 → 20
    expect(ordered.intervalDays).toBe(20);
    expect(ordered.phase).toBe('review');
  });

  it('cumple I16: plegar todo equivale a aplicar regla a regla', () => {
    const attempts = [
      wrongAttempt(TEST_ITEM_ID, '2026-11-10', 'a1'),
      correctAttempt(TEST_ITEM_ID, '2026-11-12', 'a2'),
      makeAttempt({
        id: 'a3',
        itemId: TEST_ITEM_ID,
        answeredAt: on('2026-11-15'),
        confidence: 'doubtful',
      }),
      correctAttempt(TEST_ITEM_ID, '2026-11-18', 'a4'),
    ];

    const folded = foldSchedule(TEST_ITEM_ID, attempts, clock);

    // El vencimiento inicial se sobrescribe con el primer intento, así que la fecha
    // de partida no influye en la comparación.
    let manual = initialSchedule(TEST_ITEM_ID, TEST_TODAY);
    for (const attempt of attempts) {
      manual = scheduleNext(manual, attempt, clock.dateOf(attempt.answeredAt));
    }

    expect(folded).toEqual(manual);
  });

  it('es determinista con intentos que comparten instante', () => {
    const first: Attempt = makeAttempt({ id: 'b', itemId: TEST_ITEM_ID, correct: false });
    const second: Attempt = makeAttempt({ id: 'a', itemId: TEST_ITEM_ID, correct: true });

    // El desempate por id hace que el resultado no dependa del orden de llegada.
    expect(foldSchedule(TEST_ITEM_ID, [first, second], clock)).toEqual(
      foldSchedule(TEST_ITEM_ID, [second, first], clock),
    );
  });

  it('un fallo después de un acierto deja el ítem en relearning', () => {
    const attempts = [
      correctAttempt(TEST_ITEM_ID, '2026-11-10', 'a1'),
      wrongAttempt(TEST_ITEM_ID, '2026-11-15', 'a2'),
    ];

    const schedule = foldSchedule(TEST_ITEM_ID, attempts, clock);

    expect(schedule.phase).toBe('relearning');
    expect(schedule.lapses).toBe(1);
    expect(schedule.dueAt).toBe('2026-11-16');
  });
});

describe('groupAttemptsByItem', () => {
  it('agrupa y ordena por ítem', () => {
    const attempts = [
      correctAttempt('x', '2026-11-15', 'x2'),
      correctAttempt('y', '2026-11-10', 'y1'),
      correctAttempt('x', '2026-11-10', 'x1'),
    ];

    const grouped = groupAttemptsByItem(attempts);

    expect([...grouped.keys()].sort()).toEqual(['x', 'y']);
    expect(grouped.get('x')?.map((attempt) => attempt.id)).toEqual(['x1', 'x2']);
  });

  it('devuelve un mapa vacío sin intentos', () => {
    expect(groupAttemptsByItem([]).size).toBe(0);
  });
});
