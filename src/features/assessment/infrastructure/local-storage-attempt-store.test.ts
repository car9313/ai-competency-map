import { describe, expect, it } from 'vitest';
import type { Attempt } from '../domain/types';
import {
  ATTEMPTS_KEY,
  LocalStorageAttemptStore,
  isStorageAvailable,
  openAttemptStore,
} from './local-storage-attempt-store';

function attempt(id: string): Attempt {
  return {
    id,
    deviceId: 'device-1',
    itemId: 'item-1',
    answeredAt: '2026-11-19T10:00:00.000Z',
    selectedOptionId: 'opt-1',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['opt-1', 'opt-2'],
    durationMs: 4200,
  };
}

function fakeStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));

  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe('LocalStorageAttemptStore', () => {
  it('ida y vuelta: append + list devuelve lo mismo', async () => {
    const store = new LocalStorageAttemptStore(fakeStorage());
    const original = [attempt('a1'), attempt('a2')];

    await store.append(original);

    expect(await store.list()).toEqual(original);
  });

  it('insertar dos veces el mismo id no duplica', async () => {
    const storage = fakeStorage();
    const store = new LocalStorageAttemptStore(storage);

    await store.append([attempt('a1')]);
    await store.append([attempt('a1')]);

    const raw = storage.getItem(ATTEMPTS_KEY) ?? '[]';

    expect(JSON.parse(raw)).toHaveLength(1);
  });

  it('persiste SOLO intentos, nunca proyecciones derivadas (I15)', async () => {
    const storage = fakeStorage();
    const store = new LocalStorageAttemptStore(storage);

    await store.append([attempt('a1')]);

    const raw = storage.getItem(ATTEMPTS_KEY) ?? '';
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;

    // El sobre no puede contener nada que se calcule: ni programación ni estado.
    for (const banned of [
      'schedule',
      'phase',
      'dueAt',
      'ease',
      'intervalDays',
      'lapses',
      'state',
      'mastery',
      'unlocked',
      'lastReviewedAt',
    ]) {
      expect(raw.includes(banned)).toBe(false);
    }

    expect(Object.keys(parsed[0] ?? {}).sort()).toEqual(
      [
        'answeredAt',
        'confidence',
        'correct',
        'deviceId',
        'durationMs',
        'id',
        'itemId',
        'presentedOptionIds',
        'selectedOptionId',
      ].sort(),
    );
  });

  it('descarta la entrada corrupta y conserva las buenas', async () => {
    const storage = fakeStorage({
      [ATTEMPTS_KEY]: JSON.stringify([attempt('a1'), { id: 'roto' }, attempt('a3')]),
    });
    const store = new LocalStorageAttemptStore(storage);

    expect((await store.list()).map((entry) => entry.id)).toEqual(['a1', 'a3']);
  });

  it('un JSON ilegible se trata como historial vacío, no como error', async () => {
    const store = new LocalStorageAttemptStore(fakeStorage({ [ATTEMPTS_KEY]: '{no es json' }));

    await expect(store.list()).resolves.toEqual([]);
  });

  it('clear borra la clave del almacenamiento', async () => {
    const storage = fakeStorage();
    const store = new LocalStorageAttemptStore(storage);

    await store.append([attempt('a1')]);
    await store.clear();

    expect(storage.getItem(ATTEMPTS_KEY)).toBeNull();
  });
});

describe('detección de disponibilidad', () => {
  it('un almacenamiento que lanza al escribir no está disponible', () => {
    const broken = {
      ...fakeStorage(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    } as Storage;

    expect(isStorageAvailable(broken)).toBe(false);
  });

  it('sin almacenamiento abre el modo en memoria y lo declara no persistente', () => {
    // En el entorno de pruebas no hay `window`, igual que en una pestaña privada.
    const handle = openAttemptStore();

    expect(handle.persistent).toBe(false);
    expect(handle.store).toBeDefined();
  });
});
