import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import type { Attempt } from '../domain/types';
import { describeDue, pickNextItem } from './next-item';

const clock = fixedClock('2026-11-20');

function item(id: string): Item {
  return {
    id,
    competencyId: 'comp-1',
    difficulty: 1,
    prompt: `¿Pregunta de ${id}?`,
    options: [
      { id: 'a', text: 'Correcta', correct: true, rationale: 'Motivo suficientemente largo.' },
      { id: 'b', text: 'Incorrecta', correct: false, rationale: 'Otro motivo suficientemente largo.' },
    ],
    explanation: 'Explicación con longitud suficiente para el modelo de datos.',
    referenceId: 'ref-1',
  };
}

function attempt(id: string, itemId: string, answeredAt: string, durationMs = 1000): Attempt {
  return {
    id,
    deviceId: 'device-1',
    itemId,
    answeredAt,
    selectedOptionId: 'a',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['a', 'b'],
    durationMs,
  };
}

const ITEMS = [item('item-1'), item('item-2'), item('item-3')];

describe('pickNextItem', () => {
  it('sin historial empieza por el primer ítem del contenido', () => {
    const next = pickNextItem(ITEMS, [], clock);

    expect(next?.item.id).toBe('item-1');
    expect(next?.isNew).toBe(true);
  });

  it('después de responder el primero, propone el segundo', () => {
    const attempts = [attempt('a1', 'item-1', '2026-11-20T10:00:00.000Z')];
    const next = pickNextItem(ITEMS, attempts, clock);

    expect(next?.item.id).toBe('item-2');
    expect(next?.isNew).toBe(true);
  });

  it('cuando ya se vieron todos, propone el que vence antes', () => {
    const attempts = [
      attempt('a1', 'item-1', '2026-11-20T08:00:00.000Z'),
      attempt('a2', 'item-2', '2026-11-20T09:00:00.000Z'),
      attempt('a3', 'item-3', '2026-11-20T10:00:00.000Z'),
    ];

    const next = pickNextItem(ITEMS, attempts, clock);

    expect(next?.isNew).toBe(false);
    expect(next?.item.id).toBe('item-1');
  });

  it('marca como vencido lo que ya pasó su fecha', () => {
    const attempts = [
      attempt('a1', 'item-1', '2026-11-10T10:00:00.000Z'),
      attempt('a2', 'item-2', '2026-11-20T10:00:00.000Z'),
      attempt('a3', 'item-3', '2026-11-20T10:00:00.000Z'),
    ];

    const next = pickNextItem(ITEMS, attempts, clock);

    expect(next?.item.id).toBe('item-1');
    expect(next?.isDue).toBe(true);
  });

  it('sin ítems devuelve null en vez de un objeto vacío', () => {
    expect(pickNextItem([], [], clock)).toBeNull();
  });
});

describe('describeDue', () => {
  it('no dice "en 0 días": dice que toca hoy', () => {
    const schedule = { itemId: 'item-1', phase: 'learning' as const, intervalDays: 1, ease: 2.5, lapses: 0, dueAt: '2026-11-20', lastReviewedAt: null };

    expect(describeDue(schedule, clock)).toBe('te toca hoy');
  });

  it('dice "mañana" cuando falta un día, no "en 1 días"', () => {
    const schedule = { itemId: 'item-1', phase: 'review' as const, intervalDays: 3, ease: 2.5, lapses: 0, dueAt: '2026-11-21', lastReviewedAt: null };

    expect(describeDue(schedule, clock)).toBe('vuelve mañana');
  });

  it('usa plural para varios días', () => {
    const schedule = { itemId: 'item-1', phase: 'review' as const, intervalDays: 8, ease: 2.5, lapses: 0, dueAt: '2026-11-28', lastReviewedAt: null };

    expect(describeDue(schedule, clock)).toBe('vuelve en 8 días');
  });
});
