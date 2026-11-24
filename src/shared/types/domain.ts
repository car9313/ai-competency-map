/**
 * Tipos neutrales compartidos entre features.
 *
 * Viven aquí porque los necesitan varias: el grafo de competencias, el motor de
 * evaluación y el contenido. Una feature no debe importar el interior de otra (D4),
 * así que el contrato común vive en `shared`.
 */

/** Dificultad declarada de un ítem o de una competencia. */
export type Difficulty = 1 | 2 | 3;

/** Dónde vive la mayor parte del trabajo de una competencia. */
export type Layer = 'nucleo' | 'servicio' | 'interfaz';

/** Nodo del grafo. `areaId` solo agrupa para navegar: nunca bloquea nada. */
export interface Competency {
  id: string;
  areaId: string;
  order: number;
}

/** Arista dirigida: se necesita evidencia en `from` para desbloquear `to`. */
export interface Prerequisite {
  from: string;
  to: string;
}

/**
 * Una opción de respuesta.
 *
 * `rationale` no es opcional a propósito: cada distractor explica por qué resulta
 * tentador. Un ítem con distractores mudos enseña "esa no era", no "por qué".
 */
export interface Option {
  id: string;
  text: string;
  correct: boolean;
  rationale: string;
}

/** La unidad de evaluación. Pertenece a exactamente una competencia. */
export interface Item {
  id: string;
  competencyId: string;
  difficulty: Difficulty;
  prompt: string;
  /**
   * Fragmento de código que acompaña al enunciado, para los ítems de «encuentra el error».
   *
   * Va como campo propio y no dentro del texto del enunciado por dos razones: se renderiza
   * en monoespaciado sin saltos de línea perdidos, y el léxico del código deja de contar
   * para las reglas que miden longitudes de opciones.
   */
  code?: {
    /** Etiqueta corta: `diff`, `typescript`, `yaml`… Se muestra sobre el bloque. */
    label: string;
    content: string;
  };
  /** 3–4 opciones, exactamente una correcta. */
  options: readonly Option[];
  /** Se muestra tras cualquier respuesta. Explica el concepto, no el error. */
  explanation: string;
  referenceId: string;
}
