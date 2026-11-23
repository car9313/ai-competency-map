/**
 * Archivo de progreso: exportar e importar.
 *
 * Es la única copia de seguridad posible en una app sin cuentas, y también la forma de
 * llevar el progreso de un navegador a otro. El sobre lleva `kind` y `version` para que
 * una versión futura pueda rechazar lo que no entiende en vez de adivinar.
 *
 * Contiene **solo intentos**. Si algún día alguien añade aquí un `schedule` derivado, la
 * prueba de I15 en `progress-file.test.ts` falla.
 */
import type { IsoTimestamp } from '@/shared/time/clock';
import { parseAttempts } from '../domain/schema';
import { parseNotes, type NotesMap } from '../infrastructure/notes-store';
import type { Attempt } from '../domain/types';

export const PROGRESS_KIND = 'acm.progress';
export const PROGRESS_VERSION = 1;

export interface ProgressFile {
  kind: typeof PROGRESS_KIND;
  version: number;
  exportedAt: IsoTimestamp;
  attempts: Attempt[];
  /**
   * Notas personales, opcionales. No son evidencia: no entran en ningún cálculo.
   *
   * Solo aparece la clave cuando hay alguna, para que un progreso sin notas siga teniendo
   * exactamente la forma de siempre (lo comprueba la prueba de I15).
   */
  notes?: NotesMap;
}

export function serializeProgress(
  attempts: readonly Attempt[],
  now: IsoTimestamp,
  notes: NotesMap = {},
): string {
  const file: ProgressFile = {
    kind: PROGRESS_KIND,
    version: PROGRESS_VERSION,
    exportedAt: now,
    attempts: [...attempts],
    ...(Object.keys(notes).length > 0 ? { notes } : {}),
  };

  return `${JSON.stringify(file, null, 2)}\n`;
}

export type ImportResult =
  | { ok: true; attempts: Attempt[]; notes: NotesMap }
  | { ok: false; reason: string };

/** Lee un archivo exportado. Rechaza lo que no sea un archivo de progreso. */
export function parseProgressFile(text: string): ImportResult {
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'El archivo no es JSON válido.' };
  }

  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, reason: 'El archivo no tiene la forma esperada.' };
  }

  const envelope = raw as Record<string, unknown>;

  if (envelope.kind !== PROGRESS_KIND) {
    return { ok: false, reason: 'El archivo no es un progreso de AI Competency Map.' };
  }

  if (envelope.version !== PROGRESS_VERSION) {
    return {
      ok: false,
      reason: `Versión no soportada (${String(envelope.version)}); esta app lee la ${PROGRESS_VERSION}.`,
    };
  }

  const attempts = parseAttempts(envelope.attempts);

  if (attempts.length === 0) {
    return { ok: false, reason: 'El archivo no contiene intentos válidos.' };
  }

  return { ok: true, attempts, notes: parseNotes(JSON.stringify(envelope.notes ?? {})) };
}
