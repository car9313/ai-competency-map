/**
 * Modelo de contenido.
 *
 * El contenido es dato, no maquetación: registros validados en build que alimentan el
 * grafo y la evaluación. Si no pasa el linter, no se despliega.
 */
import type { Difficulty, Item, Layer } from '@/shared/types/domain';
import type { IsoDate } from '@/shared/time/clock';

export type { Difficulty, Layer };

/** Agrupación para navegar. Nunca bloquea ni desbloquea nada. */
export interface Area {
  id: string;
  /** Dos dígitos, para ordenar el mapa: '01'. */
  index: string;
  name: string;
  description: string;
}

/** Nodo del grafo con su texto editorial. */
/**
 * Fase del itinerario: el orden en el que tiene sentido empezar.
 *
 * No sustituye al grafo. El grafo dice qué **necesitas** saber antes; la fase dice qué es
 * razonable aprender antes, aunque no sea obligatorio. Por eso el linter exige que ninguna
 * competencia dependa de otra de una fase posterior: si el itinerario te manda a algo que
 * aún no puedes comprobar, el itinerario está mal.
 */
export type Phase = 'base' | 'practica' | 'seguridad' | 'calidad' | 'organizacion' | 'avanzado';

export const PHASE_ORDER: readonly Phase[] = [
  'base',
  'practica',
  'seguridad',
  'calidad',
  'organizacion',
  'avanzado',
];

export const PHASE_LABELS: Readonly<Record<Phase, string>> = {
  base: 'Base',
  practica: 'Práctica',
  seguridad: 'Seguridad',
  calidad: 'Calidad',
  organizacion: 'Organización',
  avanzado: 'Avanzado',
};

export interface CompetencyRecord {
  id: string;
  areaId: string;
  order: number;
  layer: Layer;
  level: Difficulty;
  /** Fase del itinerario sugerido. */
  phase: Phase;
  /** Título que ve el alumno. */
  title: string;
  /** Qué demuestra, en una línea. Si no cabe, la competencia es demasiado amplia. */
  claim: string;
  /** Identificadores de las competencias que deben tener evidencia antes. */
  prerequisites: readonly string[];
  /**
   * Si es `false`, el nodo aparece en el mapa como "próximamente" y el linter no le
   * exige lección ni ítems. Permite publicar el grafo completo mientras el contenido
   * se escribe por rebanadas.
   */
  published: boolean;
}

/** Referencia externa. `reviewedAt` es lo que permite caducarla con criterio. */
export interface Reference {
  id: string;
  title: string;
  url: string;
  reviewedAt: IsoDate;
}

/**
 * Lección: el preámbulo de la evaluación, no un artículo.
 *
 * La estructura es fija a propósito. Si un campo no aplica, se deja corto; no se omite
 * ni se convierte la lección en prosa libre.
 */
/**
 * Práctica con rúbrica: un ejercicio sin corrección automática.
 *
 * Existe porque el resto del producto mide reconocimiento, y reconocer no es producir. La
 * rúbrica no puntúa: da criterios para que el alumno se evalúe, que es lo único honesto que
 * se puede hacer sin un evaluador. Por eso no genera evidencia ni mueve el planificador.
 */
export interface Practice {
  /** Qué hay que producir, en una línea. */
  title: string;
  /** Pasos del ejercicio. */
  steps: readonly string[];
  /** Criterios de autoevaluación: se marcan a mano. */
  rubric: readonly string[];
}

/**
 * Taller: un ejercicio guiado con entregable, más largo que una práctica.
 *
 * La diferencia con `Practice` no es de tamaño, es de forma: un taller tiene objetivo,
 * requisitos, entregable y trampas conocidas. Sirve para lo que no se aprende leyendo —
 * montar un harness, escribir una skill— y por eso lo que se evalúa es el artefacto, no la
 * respuesta.
 */
export interface Workshop {
  id: string;
  /** Competencia que practica. */
  competencyId: string;
  title: string;
  /** Qué se lleva quien lo termina, en una línea. */
  goal: string;
  requirements: readonly string[];
  /** Duración aproximada, en texto: «45 minutos». */
  timebox: string;
  steps: readonly string[];
  /** Lo que hay que producir para considerar el taller hecho. */
  deliverable: string;
  rubric: readonly string[];
  /** Errores que se cometen de verdad con esta herramienta o este patrón. */
  gotchas?: readonly string[];
  /**
   * Herramienta concreta, cuando el taller la nombra.
   *
   * `verifiedAt` es la fecha en la que se comprobó su documentación: un taller atado a una
   * herramienta caduca, y el dato dice cuánto.
   */
  tool?: {
    readonly name: string;
    readonly url: string;
    readonly verifiedAt: IsoDate | null;
  };
}

export interface Lesson {
  competencyId: string;
  whatIs: string;
  problem: string;
  internals: readonly string[];
  whenToUse: readonly string[];
  whenNotToUse: readonly string[];
  pitfalls: ReadonlyArray<{ title: string; detail: string }>;
  practice?: Practice;
  referenceIds: readonly string[];
}

/** El conjunto completo de contenido. Es la entrada del esquema y del linter. */
export interface Catalog {
  areas: readonly Area[];
  competencies: readonly CompetencyRecord[];
  lessons: readonly Lesson[];
  items: readonly Item[];
  references: readonly Reference[];
}
