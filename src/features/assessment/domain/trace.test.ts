import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/shared/time/clock';
import { foldSchedule } from './fold';
import { traceItemSchedule } from './trace';
import type { Attempt, Confidence } from './types';

const clock = fixedClock('2026-11-20');

function attempt(
  id: string,
  itemId: string,
  correct: boolean,
  answeredAt: string,
  confidence: Confidence = 'confident',
): Attempt {
  return {
    id,
    deviceId: 'device-1',
    itemId,
    answeredAt,
    selectedOptionId: correct ? 'a' : 'b',
    correct,
    confidence,
    presentedOptionIds: ['a', 'b'],
    durationMs: 1000,
  };
}

describe('traceItemSchedule', () => {
  it('un ítem sin intentos no tiene traza', () => {
    expect(traceItemSchedule('item-1', [], clock)).toEqual([]);
  });

  it('la última transición coincide con el plegado completo', () => {
    const attempts = [
      attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z'),
      attempt('a2', 'item-1', true, '2026-11-13T10:00:00.000Z'),
      attempt('a3', 'item-1', false, '2026-11-18T10:00:00.000Z'),
    ];

    const trace = traceItemSchedule('item-1', attempts, clock);
    const last = trace[trace.length - 1];

    expect(last).toBeDefined();
    expect(last?.after).toEqual(foldSchedule('item-1', attempts, clock));
  });

  it('ordena por instante aunque el historial llegue desordenado', () => {
    const attempts = [
      attempt('a2', 'item-1', true, '2026-11-15T10:00:00.000Z'),
      attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z'),
    ];

    const trace = traceItemSchedule('item-1', attempts, clock);

    expect(trace.map((step) => step.attempt.id)).toEqual(['a1', 'a2']);
  });

  it('el primer intento parte del estado inicial del ítem', () => {
    const attempts = [attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z')];
    const [step] = traceItemSchedule('item-1', attempts, clock);

    expect(step?.before.phase).toBe('new');
    expect(step?.before.intervalDays).toBe(1);
    expect(step?.before.lastReviewedAt).toBeNull();
  });

  it('un acierto con seguridad nuevo alarga el intervalo a 3 días', () => {
    const attempts = [attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z')];
    const [step] = traceItemSchedule('item-1', attempts, clock);

    expect(step?.after.phase).toBe('review');
    expect(step?.after.intervalDays).toBe(3);
    expect(step?.after.dueAt).toBe('2026-11-13');
  });

  it('un fallo devuelve el ítem a recuperación con un día', () => {
    const attempts = [
      attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z'),
      attempt('a2', 'item-1', false, '2026-11-13T10:00:00.000Z'),
    ];
    const trace = traceItemSchedule('item-1', attempts, clock);
    const last = trace[trace.length - 1];

    expect(last?.after.phase).toBe('relearning');
    expect(last?.after.intervalDays).toBe(1);
    expect(last?.after.dueAt).toBe('2026-11-14');
  });

  it('no mezcla ítems distintos', () => {
    const attempts = [
      attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z'),
      attempt('a2', 'item-2', false, '2026-11-11T10:00:00.000Z'),
    ];

    expect(traceItemSchedule('item-1', attempts, clock)).toHaveLength(1);
    expect(traceItemSchedule('item-2', attempts, clock)).toHaveLength(1);
  });

  it('cada intento cuenta una transición, sin saltarse ninguna', () => {
    const attempts = [
      attempt('a1', 'item-1', true, '2026-11-10T10:00:00.000Z'),
      attempt('a2', 'item-1', true, '2026-11-13T10:00:00.000Z'),
      attempt('a3', 'item-1', true, '2026-11-21T10:00:00.000Z'),
    ];

    expect(traceItemSchedule('item-1', attempts, clock)).toHaveLength(3);
  });
});
