/**
 * Constructores de datos para los tests del dominio.
 *
 * No lo usa la aplicación: existe para que cada test declare solo lo que le importa
 * (`makeAttempt({ correct: false })`) en lugar de repetir ocho campos.
 */
import { initialSchedule } from './schedule';
import type { Attempt, ItemSchedule, IsoDate } from './types';

export const TEST_ITEM_ID = 'tokens-and-context-window';
export const TEST_TODAY: IsoDate = '2026-11-19';

export function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-1',
    deviceId: 'device-1',
    itemId: TEST_ITEM_ID,
    answeredAt: '2026-11-19T10:00:00.000Z',
    selectedOptionId: 'a',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['a', 'b', 'c'],
    durationMs: 12_000,
    ...overrides,
  };
}

export function makeSchedule(overrides: Partial<ItemSchedule> = {}): ItemSchedule {
  return {
    ...initialSchedule(TEST_ITEM_ID, TEST_TODAY),
    ...overrides,
  };
}
