import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/shared/time/clock';
import type { Attempt } from './types';
import { projectItemOutcome } from './projection';

const clock = fixedClock('2026-11-20');

function attempt(id: string, itemId: string, correct: boolean, answeredAt: string): Attempt {
  return {
    id,
    deviceId: 'device-1',
    itemId,
    answeredAt,
    selectedOptionId: correct ? 'a' : 'b',
    correct,
    confidence: 'confident',
    presentedOptionIds: ['a', 'b'],
    durationMs: 1000,
  };
}

describe('projectItemOutcome', () => {
  it('un ítem sin intentos no tiene resultado', () => {
    expect(projectItemOutcome('item-1', [])).toBe('no_evidence');
  });

  it('devuelve el resultado del ÚLTIMO intento, no del primero', () => {
    const attempts = [
      attempt('a1', 'item-1', false, '2026-11-18T10:00:00.000Z'),
      attempt('a2', 'item-1', true, '2026-11-19T10:00:00.000Z'),
    ];

    expect(projectItemOutcome('item-1', attempts)).toBe('correct');
  });

  it('fallar después de acertar deja el ítem como fallado', () => {
    const attempts = [
      attempt('a1', 'item-1', true, '2026-11-18T10:00:00.000Z'),
      attempt('a2', 'item-1', false, '2026-11-19T10:00:00.000Z'),
    ];

    expect(projectItemOutcome('item-1', attempts)).toBe('incorrect');
  });

  it('no mezcla ítems distintos', () => {
    const attempts = [
      attempt('a1', 'item-1', true, '2026-11-19T10:00:00.000Z'),
      attempt('a2', 'item-2', false, '2026-11-19T11:00:00.000Z'),
    ];

    expect(projectItemOutcome('item-1', attempts)).toBe('correct');
    expect(projectItemOutcome('item-2', attempts)).toBe('incorrect');
  });

  it('con dos intentos en el mismo instante desempata por id, no por orden de llegada', () => {
    const attempts = [
      attempt('b', 'item-1', true, '2026-11-19T10:00:00.000Z'),
      attempt('a', 'item-1', false, '2026-11-19T10:00:00.000Z'),
    ];

    // El orden cronológico estable usa el id como desempate: 'b' va después de 'a'.
    expect(projectItemOutcome('item-1', attempts)).toBe('correct');
  });

  it('no depende del reloj: el resultado es del último intento, no de la fecha de hoy', () => {
    const antiguo = [attempt('a1', 'item-1', true, '2020-01-01T10:00:00.000Z')];

    expect(projectItemOutcome('item-1', antiguo)).toBe('correct');
    expect(clock.today()).toBe('2026-11-20');
  });
});
