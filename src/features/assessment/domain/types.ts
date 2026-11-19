/**
 * Modelo del dominio de evaluación.
 *
 * Todo lo de este módulo es puro: sin React, sin DOM, sin red y sin tiempo ambiente.
 * El tiempo entra como argumento (`today: IsoDate`), nunca se lee del sistema (regla D8).
 *
 * Especificación: docs/domain/assessment-engine.md
 */
import type { IsoDate, IsoTimestamp } from '@/shared/time/clock';

export type { IsoDate, IsoTimestamp };

/** Fases del planificador. Tipo cerrado: no existen estados imposibles. */
export type Phase = 'new' | 'learning' | 'review' | 'relearning';

/** Dimensión de confianza declarada por el alumno. */
export type Confidence = 'confident' | 'doubtful';

export type Difficulty = 1 | 2 | 3;

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

export interface Option {
  id: string;
  text: string;
  correct: boolean;
  /** Por qué esta opción es correcta, o por qué es un error tentador. */
  rationale: string;
}

export interface Item {
  id: string;
  competencyId: string;
  difficulty: Difficulty;
  prompt: string;
  /** 3–4 opciones, exactamente una correcta. */
  options: readonly Option[];
  /** Se muestra tras cualquier respuesta. Explica el concepto, no el error. */
  explanation: string;
  referenceId: string;
}
