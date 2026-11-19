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
export interface CompetencyRecord {
  id: string;
  areaId: string;
  order: number;
  layer: Layer;
  level: Difficulty;
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
export interface Lesson {
  competencyId: string;
  whatIs: string;
  problem: string;
  internals: readonly string[];
  whenToUse: readonly string[];
  whenNotToUse: readonly string[];
  pitfalls: ReadonlyArray<{ title: string; detail: string }>;
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
