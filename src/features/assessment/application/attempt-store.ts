/**
 * Puerto de persistencia del progreso.
 *
 * Solo hay una entidad persistida: el intento. `ItemSchedule` y `CompetencyState` son
 * proyecciones y **no se guardan** (invariante I15, ADR-003). La firma lo hace evidente:
 * no existe un método para guardar un estado, porque no habría nada que guardar.
 *
 * El puerto es asíncrono desde el principio aunque `localStorage` sea síncrono: cuando la
 * persistencia sea remota (fase 2) la interfaz no cambiará.
 */
import type { Attempt } from '../domain/types';

export interface AttemptStore {
  list(): Promise<readonly Attempt[]>;
  /** Idempotente por `id`: reenviar el mismo intento no lo duplica. */
  append(attempts: readonly Attempt[]): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Implementación en memoria.
 *
 * Sirve para dos cosas: los tests (sin DOM) y el modo degradado cuando el navegador no
 * permite almacenar (modo privado, cuota agotada). En ese caso el progreso vive lo que
 * dure la pestaña, y es mejor eso que una pantalla en blanco.
 */
export class MemoryAttemptStore implements AttemptStore {
  private attempts: Attempt[] = [];

  async list(): Promise<readonly Attempt[]> {
    return [...this.attempts];
  }

  async append(attempts: readonly Attempt[]): Promise<void> {
    const known = new Set(this.attempts.map((attempt) => attempt.id));

    for (const attempt of attempts) {
      if (!known.has(attempt.id)) {
        this.attempts.push(attempt);
        known.add(attempt.id);
      }
    }
  }

  async clear(): Promise<void> {
    this.attempts = [];
  }
}

/** Une dos listas por `id`, conservando el primero que aparece. */
export function mergeById(
  current: readonly Attempt[],
  incoming: readonly Attempt[],
): Attempt[] {
  const result = [...current];
  const known = new Set(current.map((attempt) => attempt.id));

  for (const attempt of incoming) {
    if (!known.has(attempt.id)) {
      result.push(attempt);
      known.add(attempt.id);
    }
  }

  return result;
}
