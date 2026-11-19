/**
 * Las doce reglas del planificador, como DATOS.
 *
 * Por qué una tabla y no una cadena de `if`: doce transiciones en un `if/else if` son
 * ilegibles, difíciles de cubrir con tests y propensas a huecos. Aquí el archivo se lee
 * como la tabla de docs/domain/assessment-engine.md, fila a fila, y el test recorre la
 * misma tabla.
 *
 * Si una combinación (fase, acierto, confianza) no tiene regla, `scheduleNext` lanza:
 * un hueco debe fallar ruidosamente en el primer test, no devolver algo plausible.
 */
import type { Confidence, Phase } from './types';

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;
export const INITIAL_INTERVAL_DAYS = 1;
export const MIN_INTERVAL_DAYS = 1;
export const MAX_INTERVAL_DAYS = 180;

/** Cómo se calcula el intervalo siguiente. */
export type IntervalRule =
  | { kind: 'fixed'; days: number }
  /** round(intervalo actual × facilidad actual) */
  | { kind: 'byEase' }
  /** round(intervalo actual × factor) */
  | { kind: 'scale'; factor: number };

/** Cómo cambia la facilidad. */
export type EaseRule = { kind: 'set'; value: number } | { kind: 'delta'; amount: number };

export interface Rule {
  /** Identificador estable: el test lo cita y la documentación también. */
  readonly id: string;
  readonly phase: Phase;
  readonly correct: boolean;
  /** `null` significa "cualquier confianza". */
  readonly confidence: Confidence | null;
  readonly nextPhase: Phase;
  readonly interval: IntervalRule;
  readonly ease: EaseRule;
  /** Si cuenta como lapso (fallo después de haber aprendido). */
  readonly lapse: boolean;
}

export const RULES: readonly Rule[] = [
  // ── new ────────────────────────────────────────────────────────────────────
  {
    id: 'R1',
    phase: 'new',
    correct: true,
    confidence: 'confident',
    nextPhase: 'review',
    interval: { kind: 'fixed', days: 3 },
    ease: { kind: 'set', value: INITIAL_EASE },
    lapse: false,
  },
  {
    id: 'R2',
    phase: 'new',
    correct: true,
    confidence: 'doubtful',
    nextPhase: 'learning',
    interval: { kind: 'fixed', days: 1 },
    ease: { kind: 'set', value: INITIAL_EASE },
    lapse: false,
  },
  {
    id: 'R3',
    phase: 'new',
    correct: false,
    confidence: null,
    nextPhase: 'relearning',
    interval: { kind: 'fixed', days: 1 },
    ease: { kind: 'set', value: 2.3 },
    lapse: true,
  },

  // ── learning ───────────────────────────────────────────────────────────────
  {
    id: 'R4',
    phase: 'learning',
    correct: true,
    confidence: 'confident',
    nextPhase: 'review',
    interval: { kind: 'fixed', days: 3 },
    ease: { kind: 'set', value: INITIAL_EASE },
    lapse: false,
  },
  {
    id: 'R5',
    phase: 'learning',
    correct: true,
    confidence: 'doubtful',
    nextPhase: 'learning',
    interval: { kind: 'fixed', days: 2 },
    ease: { kind: 'delta', amount: -0.05 },
    lapse: false,
  },
  {
    id: 'R6',
    phase: 'learning',
    correct: false,
    confidence: null,
    nextPhase: 'relearning',
    interval: { kind: 'fixed', days: 1 },
    ease: { kind: 'delta', amount: -0.2 },
    lapse: true,
  },

  // ── review ─────────────────────────────────────────────────────────────────
  {
    id: 'R7',
    phase: 'review',
    correct: true,
    confidence: 'confident',
    nextPhase: 'review',
    interval: { kind: 'byEase' },
    ease: { kind: 'delta', amount: 0.05 },
    lapse: false,
  },
  {
    id: 'R8',
    phase: 'review',
    correct: true,
    confidence: 'doubtful',
    nextPhase: 'review',
    interval: { kind: 'scale', factor: 1.2 },
    ease: { kind: 'delta', amount: -0.05 },
    lapse: false,
  },
  {
    id: 'R9',
    phase: 'review',
    correct: false,
    confidence: null,
    nextPhase: 'relearning',
    interval: { kind: 'fixed', days: 1 },
    ease: { kind: 'delta', amount: -0.2 },
    lapse: true,
  },

  // ── relearning ─────────────────────────────────────────────────────────────
  {
    id: 'R10',
    phase: 'relearning',
    correct: true,
    confidence: 'confident',
    nextPhase: 'review',
    interval: { kind: 'fixed', days: 3 },
    ease: { kind: 'delta', amount: 0 },
    lapse: false,
  },
  {
    id: 'R11',
    phase: 'relearning',
    correct: true,
    confidence: 'doubtful',
    nextPhase: 'learning',
    interval: { kind: 'fixed', days: 2 },
    ease: { kind: 'delta', amount: 0 },
    lapse: false,
  },
  {
    id: 'R12',
    phase: 'relearning',
    correct: false,
    confidence: null,
    nextPhase: 'relearning',
    interval: { kind: 'fixed', days: 1 },
    ease: { kind: 'delta', amount: -0.2 },
    lapse: true,
  },
];
