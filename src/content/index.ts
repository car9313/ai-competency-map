/**
 * El catálogo de contenido.
 *
 * Es el punto único de entrada: cualquier pantalla importa de aquí, nunca de los
 * archivos sueltos. Si el contenido no cumple el esquema, la aplicación falla al
 * importar este módulo (y el build con ella).
 */
import { buildCatalog } from '@/features/content/application/catalog';
import type { Catalog } from '@/features/content/domain/types';
import { AREAS } from './areas';
import { COMPETENCIES } from './competencies';
import { ITEMS_AREA_01, LESSONS_AREA_01 } from './area-01-fundamentals';
import { ITEMS_AREA_02, LESSONS_AREA_02 } from './area-02-generative-llms';
import { ITEMS } from './items';
import { LESSONS } from './lessons';
import { REFERENCES } from './references';

export const CATALOG: Catalog = {
  areas: AREAS,
  competencies: COMPETENCIES,
  lessons: [...LESSONS, ...LESSONS_AREA_01, ...LESSONS_AREA_02],
  items: [...ITEMS, ...ITEMS_AREA_01, ...ITEMS_AREA_02],
  references: REFERENCES,
};

export const contentIndex = buildCatalog(CATALOG);
