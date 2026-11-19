/**
 * Índice del catálogo.
 *
 * El contenido se referencia por identificadores estables entre lecciones, ítems y
 * competencias. Buscar linealmente y esperar que los ids estén bien escritos es
 * exactamente el error que aparece tarde; aquí se valida y se indexa una sola vez.
 *
 * La validación de *significado* (reglas R1–R7) no se hace en el arranque: es trabajo
 * del CLI de contenido en CI, para no cargar el linter en el bundle del navegador.
 */
import type { Item } from '@/shared/types/domain';
import { parseCatalog } from '../domain/schema';
import type { Catalog, CompetencyRecord, Lesson, Reference } from '../domain/types';

export interface ContentIndex {
  competencies: readonly CompetencyRecord[];
  competencyById: ReadonlyMap<string, CompetencyRecord>;
  lessonByCompetency: ReadonlyMap<string, Lesson>;
  itemsByCompetency: ReadonlyMap<string, readonly Item[]>;
  itemById: ReadonlyMap<string, Item>;
  references: readonly Reference[];
}

export function buildCatalog(catalog: Catalog): ContentIndex {
  const schema = parseCatalog(catalog);

  if (!schema.ok) {
    const detail = schema.issues
      .map((issue) => `  · ${issue.path}: ${issue.message}`)
      .join('\n');

    throw new Error(`El contenido no cumple el esquema:\n${detail}`);
  }

  const competencyById = new Map(catalog.competencies.map((entry) => [entry.id, entry]));
  const lessonByCompetency = new Map(
    catalog.lessons.map((lesson) => [lesson.competencyId, lesson]),
  );
  const itemById = new Map(catalog.items.map((item) => [item.id, item]));

  const itemsByCompetency = new Map<string, Item[]>();

  for (const item of catalog.items) {
    const bucket = itemsByCompetency.get(item.competencyId);

    if (bucket) {
      bucket.push(item);
    } else {
      itemsByCompetency.set(item.competencyId, [item]);
    }
  }

  return {
    competencies: catalog.competencies,
    competencyById,
    lessonByCompetency,
    itemsByCompetency,
    itemById,
    references: catalog.references,
  };
}
