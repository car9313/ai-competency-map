/**
 * Modelo del dominio de evaluación.
 *
 * Todo lo de este módulo es puro: sin React, sin DOM, sin red y sin tiempo ambiente.
 * El tiempo entra como argumento (`today: IsoDate`), nunca se lee del sistema (regla D8).
 *
 * `Item` y `Option` viven en `shared/types` porque también los produce el contenido:
 * son el contrato entre ambas features, no propiedad de una sola.
 *
 * Especificación: docs/domain/assessment-engine.md
 */
import type { IsoDate, IsoTimestamp } from '@/shared/time/clock';

export type { IsoDate, IsoTimestamp };
export type { Difficulty, Item, Option } from '@/shared/types/domain';

/** Fases del planificador. Tipo cerrado: no existen estados imposibles. */
export type Phase = 'new' | 'learning' | 'review' | 'relearning';

/** Dimensión de confianza declarada por el alumno. */
export type Confidence = 'confident' | 'doubtful';

/**
 * Un intento. Hecho inmutable: nunca se modifica ni se borra (invariante I8).
 *
 * `id` es un UUID generado en el cliente y `deviceId` identifica el navegador,
 * para que una futura sincronización sea una unión por id y no un conflicto.
 */
export interface Attempt {
  id: string;
  deviceId: string;
  itemId: string;
  answeredAt: IsoTimestamp;
  selectedOptionId: string;
  correct: boolean;
  confidence: Confidence;
  /** Orden de opciones que se mostró, para poder reproducir el intento. */
  presentedOptionIds: readonly string[];
  durationMs: number;
  /**
   * 	rue si el alumno pidió alguna pista antes de responder.
   *
   * Se guarda para no perder la diferencia entre recordar y reconocer con ayuda, aunque el
   * planificador todavía no la use: el dato no se puede reconstruir después.
   */
  hinted?: boolean;
}

/**
 * Programación de un ítem. **Derivada**: se pliega a partir de los intentos
 * del ítem y nunca se persiste (invariante I15).
 */
export interface ItemSchedule {
  itemId: string;
  phase: Phase;
  intervalDays: number;
  ease: number;
  lapses: number;
  dueAt: IsoDate;
  lastReviewedAt: IsoTimestamp | null;
}
