/**
 * Adaptador de `localStorage`.
 *
 * Es la cáscara: lee, valida y escribe. La lógica de qué significa un intento no está
 * aquí, y por eso este archivo no importa nada del dominio salvo tipos.
 *
 * `localStorage` no siempre existe: modo privado de algunos navegadores, cuota agotada o
 * almacenamiento deshabilitado. En vez de fallar, la fábrica devuelve la implementación en
 * memoria y avisa de que el progreso no sobrevivirá a la recarga.
 */
import type { AttemptStore } from '../application/attempt-store';
import { MemoryAttemptStore, mergeById } from '../application/attempt-store';
import { parseAttempts } from '../domain/schema';
import type { Attempt } from '../domain/types';

export const ATTEMPTS_KEY = 'acm:attempts:v1';

/** Comprueba que se puede escribir de verdad, no solo que el objeto exista. */
export function isStorageAvailable(storage: Storage | undefined = safeStorage()): boolean {
  if (!storage) return false;

  try {
    const probe = '__acm_probe__';
    storage.setItem(probe, probe);
    storage.removeItem(probe);

    return true;
  } catch {
    return false;
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export class LocalStorageAttemptStore implements AttemptStore {
  constructor(
    private readonly storage: Storage,
    private readonly key: string = ATTEMPTS_KEY,
  ) {}

  async list(): Promise<readonly Attempt[]> {
    const raw = this.storage.getItem(this.key);

    if (raw === null) return [];

    try {
      return parseAttempts(JSON.parse(raw));
    } catch {
      // JSON ilegible: se trata como historial vacío en vez de romper la aplicación.
      return [];
    }
  }

  async append(attempts: readonly Attempt[]): Promise<void> {
    if (attempts.length === 0) return;

    const current = await this.list();
    const merged = mergeById(current, attempts);

    this.storage.setItem(this.key, JSON.stringify(merged));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.key);
  }
}

export interface StoreHandle {
  store: AttemptStore;
  /** `false` cuando el navegador no permite almacenar: el progreso es solo de la sesión. */
  persistent: boolean;
}

export function openAttemptStore(): StoreHandle {
  const storage = safeStorage();

  if (isStorageAvailable(storage) && storage) {
    return { store: new LocalStorageAttemptStore(storage), persistent: true };
  }

  return { store: new MemoryAttemptStore(), persistent: false };
}
