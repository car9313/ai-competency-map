/**
 * Constructores de datos para los tests del dominio.
 *
 * No lo usa la aplicación: existe para que cada test declare solo lo que le importa
 * (`makeAttempt({ correct: false })`) en lugar de repetir ocho campos.
 */
import { initialSchedule } from './schedule';
import type { Attempt, Item, ItemSchedule, IsoDate } from './types';

export const TEST_ITEM_ID = 'tokens-and-context-window';
export const TEST_TODAY: IsoDate = '2026-11-19';

/** Instante de un día concreto, a media mañana UTC. */
export function on(day: IsoDate): string {
  return `${day}T10:00:00.000Z`;
}

export function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-1',
    deviceId: 'device-1',
    itemId: TEST_ITEM_ID,
    answeredAt: on(TEST_TODAY),
    selectedOptionId: 'a',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['a', 'b', 'c'],
    durationMs: 12_000,
    ...overrides,
  };
}

/** Atajo: intento acertado con confianza en un día dado. */
export function correctAttempt(itemId: string, day: IsoDate, id = `${itemId}-${day}`): Attempt {
  return makeAttempt({ id, itemId, answeredAt: on(day) });
}

/** Atajo: intento fallado en un día dado. */
export function wrongAttempt(itemId: string, day: IsoDate, id = `${itemId}-${day}-fail`): Attempt {
  return makeAttempt({ id, itemId, answeredAt: on(day), correct: false });
}

export function makeSchedule(overrides: Partial<ItemSchedule> = {}): ItemSchedule {
  return {
    ...initialSchedule(TEST_ITEM_ID, TEST_TODAY),
    ...overrides,
  };
}

export function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: TEST_ITEM_ID,
    competencyId: 'tokens',
    difficulty: 1,
    prompt: '¿En qué unidad se mide la ventana de contexto?',
    options: [
      {
        id: 'a',
        text: 'En tokens',
        correct: true,
        rationale: 'Es la unidad que el modelo procesa.',
      },
      {
        id: 'b',
        text: 'En caracteres',
        correct: false,
        rationale: 'Tentador porque el editor cuenta caracteres, pero el modelo no los ve.',
      },
      {
        id: 'c',
        text: 'En kilobytes',
        correct: false,
        rationale: 'Confunde el contexto con el tamaño del fichero.',
      },
    ],
    explanation:
      'La ventana es un presupuesto de tokens compartido entre instrucciones, contexto recuperado y salida.',
    referenceId: 'ref-attention',
    ...overrides,
  };
}
