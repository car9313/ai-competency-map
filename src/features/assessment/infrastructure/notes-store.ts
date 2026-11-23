/**
 * Notas personales por competencia.
 *
 * No son evidencia: no cambian el estado, no programan repasos y no se derivan de nada. Por
 * eso viven en su propia clave y no en el historial de intentos: mezclarlas con la evidencia
 * haría que «lo que anoté» contara como «lo que demuestro».
 *
 * La validación al leer es la misma que en los intentos, y por la misma razón: lo guardado
 * ayer puede tener otra forma, o haber quedado a medias.
 */
import { z } from 'zod';
import type { IsoTimestamp } from '@/shared/time/clock';

export const NOTES_KEY = 'acm:notes:v1';

const noteSchema = z.object({
  text: z.string(),
  updatedAt: z.string().min(1),
});

const notesSchema = z.record(z.string().min(1), noteSchema);

export interface Note {
  readonly text: string;
  readonly updatedAt: IsoTimestamp;
}

export type NotesMap = Readonly<Record<string, Note>>;

/** Lectura tolerante: una entrada corrupta se descarta y el resto se conserva. */
export function parseNotes(raw: string | null): NotesMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = notesSchema.safeParse(parsed);

    if (!result.success) {
      return {};
    }

    const limpio: Record<string, Note> = {};

    for (const [competencyId, note] of Object.entries(result.data)) {
      if (note.text.trim().length > 0) {
        limpio[competencyId] = { text: note.text, updatedAt: note.updatedAt };
      }
    }

    return limpio;
  } catch {
    return {};
  }
}

export function loadNotes(): NotesMap {
  if (typeof window === 'undefined') {
    return {};
  }

  return parseNotes(window.localStorage.getItem(NOTES_KEY));
}

export function saveNote(competencyId: string, text: string, now: IsoTimestamp): NotesMap {
  const actuales = { ...loadNotes() };

  if (text.trim().length === 0) {
    delete actuales[competencyId];
  } else {
    actuales[competencyId] = { text, updatedAt: now };
  }

  window.localStorage.setItem(NOTES_KEY, JSON.stringify(actuales));

  return actuales;
}

/** Reemplaza todas las notas. Se usa al importar un archivo de progreso. */
export function replaceNotes(notes: NotesMap): void {
  if (Object.keys(notes).length === 0) {
    window.localStorage.removeItem(NOTES_KEY);

    return;
  }

  window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function countNotes(): number {
  return Object.keys(loadNotes()).length;
}
