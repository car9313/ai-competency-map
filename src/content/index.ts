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
import { ITEMS } from './items';
import { LESSONS } from './lessons';
import { REFERENCES } from './references';

export const CATALOG: Catalog = {
  areas: AREAS,
  competencies: COMPETENCIES,
  lessons: LESSONS,
  items: ITEMS,
  references: REFERENCES,
};

export const contentIndex = buildCatalog(CATALOG);
