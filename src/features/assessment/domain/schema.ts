/**
 * Validación de lo que se lee del almacenamiento.
 *
 * Nada garantiza que lo guardado ayer siga teniendo la forma de hoy: una versión anterior
 * de la app, una edición a mano o un cuota a medias pueden dejar basura. Validar al leer
 * convierte un fallo silencioso (un `undefined` que revienta tres pantallas después) en un
 * descarte explícito de la entrada corrupta.
 */
import { z } from 'zod';
import type { Attempt } from './types';

export const attemptSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  itemId: z.string().min(1),
  answeredAt: z.string().min(1),
  selectedOptionId: z.string().min(1),
  correct: z.boolean(),
  confidence: z.enum(['confident', 'doubtful']),
  presentedOptionIds: z.array(z.string().min(1)).min(1),
  durationMs: z.number().int().nonnegative(),
  /* Opcional: los intentos guardados antes de que existieran las pistas no lo tienen. */
  hinted: z.boolean().optional(),
});

export const attemptListSchema = z.array(attemptSchema);

/**
 * Filtra las entradas inválidas una a una.
 *
 * Se descarta la entrada corrupta, no la lista entera: perder un intento es un problema,
 * perder el historial completo porque uno se corrompió es otro mucho peor.
 */
export function parseAttempts(input: unknown): Attempt[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((entry) => {
    const result = attemptSchema.safeParse(entry);

    return result.success ? [result.data as Attempt] : [];
  });
}
