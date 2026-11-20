/**
 * Caché del historial dentro de una página.
 *
 * Varias islas de cliente (la cola del día, el estado de cada nodo del mapa) necesitan los
 * mismos intentos. Sin esto, el mapa con 39 nodos haría 39 lecturas del almacenamiento al
 * montar.
 *
 * Se invalida al registrar un intento, para que la siguiente lectura sea fresca.
 */
import type { Attempt } from '../domain/types';
import { openAttemptStore } from './local-storage-attempt-store';

let cached: Promise<readonly Attempt[]> | null = null;

export function loadAttempts(): Promise<readonly Attempt[]> {
  cached ??= openAttemptStore().store.list();

  return cached;
}

export function forgetAttempts(): void {
  cached = null;
}
