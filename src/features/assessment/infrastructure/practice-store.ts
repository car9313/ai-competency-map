/**
 * Progreso de las prácticas con rúbrica.
 *
 * Guarda qué criterios has marcado en cada competencia. No es evidencia: la práctica no
 * está corregida por nadie, así que no puede contar como dominio. Sirve para retomarla
 * donde la dejaste, que es lo único que se puede prometer con honestidad.
 */
import { z } from 'zod';

export const PRACTICE_KEY = 'acm:practice:v1';

const practiceSchema = z.record(z.string().min(1), z.array(z.number().int().nonnegative()));

export type PracticeProgress = Readonly<Record<string, readonly number[]>>;

export function parsePractice(raw: string | null): PracticeProgress {
  if (!raw) {
    return {};
  }

  try {
    const result = practiceSchema.safeParse(JSON.parse(raw));

    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

export function loadPractice(): PracticeProgress {
  if (typeof window === 'undefined') {
    return {};
  }

  return parsePractice(window.localStorage.getItem(PRACTICE_KEY));
}

export function toggleCriterion(competencyId: string, index: number): PracticeProgress {
  const actual = { ...loadPractice() };
  const marcados = new Set(actual[competencyId] ?? []);

  if (marcados.has(index)) {
    marcados.delete(index);
  } else {
    marcados.add(index);
  }

  const siguientes = [...marcados].sort((a, b) => a - b);

  const resultado: Record<string, readonly number[]> = { ...actual };

  if (siguientes.length === 0) {
    delete resultado[competencyId];
  } else {
    resultado[competencyId] = siguientes;
  }

  window.localStorage.setItem(PRACTICE_KEY, JSON.stringify(resultado));

  return resultado;
}
