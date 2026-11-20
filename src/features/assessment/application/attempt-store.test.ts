import { describe, expect, it } from 'vitest';
import type { Attempt } from '../domain/types';
import { MemoryAttemptStore, mergeById } from './attempt-store';

function attempt(id: string, itemId = 'item-1'): Attempt {
  return {
    id,
    deviceId: 'device-1',
    itemId,
    answeredAt: '2026-11-19T10:00:00.000Z',
    selectedOptionId: 'opt-1',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['opt-1', 'opt-2'],
    durationMs: 4200,
  };
}

describe('MemoryAttemptStore', () => {
  it('devuelve lo mismo que se guardó (ida y vuelta)', async () => {
    const store = new MemoryAttemptStore();
    const original = [attempt('a1'), attempt('a2', 'item-2')];

    await store.append(original);

    expect(await store.list()).toEqual(original);
  });

  it('insertar dos veces el mismo id no duplica', async () => {
    const store = new MemoryAttemptStore();

    await store.append([attempt('a1')]);
    await store.append([attempt('a1')]);
    await store.append([attempt('a1'), attempt('a2')]);

    expect((await store.list()).map((entry) => entry.id)).toEqual(['a1', 'a2']);
  });

  it('clear deja el historial vacío', async () => {
    const store = new MemoryAttemptStore();

    await store.append([attempt('a1')]);
    await store.clear();

    expect(await store.list()).toEqual([]);
  });

  it('list devuelve una copia: mutar el resultado no altera el almacén', async () => {
    const store = new MemoryAttemptStore();

    await store.append([attempt('a1')]);

    const listed = await store.list();
    (listed as Attempt[]).push(attempt('a2'));

    expect(await store.list()).toHaveLength(1);
  });
});

describe('mergeById', () => {
  it('conserva el orden y descarta los ids repetidos', () => {
    const merged = mergeById([attempt('a1')], [attempt('a1'), attempt('a2')]);

    expect(merged.map((entry) => entry.id)).toEqual(['a1', 'a2']);
  });

  it('no muta la lista original', () => {
    const current = [attempt('a1')];

    mergeById(current, [attempt('a2')]);

    expect(current).toHaveLength(1);
  });
});
