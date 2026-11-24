/**
 * El catálogo de contenido.
 *
 * Es el punto único de entrada: cualquier pantalla importa de aquí, nunca de los
 * archivos sueltos. Si el contenido no cumple el esquema, la aplicación falla al
 * importar este módulo (y el build con ella).
 *
 * Las lecciones e ítems de la fase 1 viven en `lessons.ts` e `items.ts`. A partir de la
 * fase 2 el contenido se escribe **un archivo por área**: una persona cierra un área y el
 * linter dice si cumple. Los arrays se aplanan aquí, así que añadir un área son dos líneas.
 */
import { buildCatalog } from '@/features/content/application/catalog';
import type { Catalog } from '@/features/content/domain/types';
import { AREAS } from './areas';
import { COMPETENCIES } from './competencies';
import { ITEMS_AREA_00, LESSONS_AREA_00 } from './area-00-fundamentals-of-programming';
import { ITEMS_AREA_01, LESSONS_AREA_01 } from './area-01-fundamentals';
import { ITEMS_AREA_02, LESSONS_AREA_02 } from './area-02-generative-llms';
import { ITEMS_AREA_03, LESSONS_AREA_03 } from './area-03-prompt-engineering';
import { ITEMS_AREA_04, LESSONS_AREA_04 } from './area-04-rag-applications';
import { ITEMS_AREA_05, LESSONS_AREA_05 } from './area-05-agentic-engineering';
import { ITEMS_AREA_06, LESSONS_AREA_06 } from './area-06-harness-engineering';
import { ITEMS_AREA_07, LESSONS_AREA_07 } from './area-07-ai-software-architecture';
import { ITEMS_AREA_08, LESSONS_AREA_08 } from './area-08-quality-production';
import { ITEMS_AREA_09, LESSONS_AREA_09 } from './area-09-workflow-methodology';
import { PRACTICES } from './practices';
import { ITEMS } from './items';
import { LESSONS } from './lessons';
import { REFERENCES } from './references';

const AREA_LESSONS = [
  LESSONS_AREA_00,
  LESSONS_AREA_01,
  LESSONS_AREA_02,
  LESSONS_AREA_03,
  LESSONS_AREA_04,
  LESSONS_AREA_05,
  LESSONS_AREA_06,
  LESSONS_AREA_07,
  LESSONS_AREA_08,
  LESSONS_AREA_09,
];

const AREA_ITEMS = [
  ITEMS_AREA_00,
  ITEMS_AREA_01,
  ITEMS_AREA_02,
  ITEMS_AREA_03,
  ITEMS_AREA_04,
  ITEMS_AREA_05,
  ITEMS_AREA_06,
  ITEMS_AREA_07,
  ITEMS_AREA_08,
  ITEMS_AREA_09,
];

export const CATALOG: Catalog = {
  areas: AREAS,
  competencies: COMPETENCIES,
  lessons: [...LESSONS, ...AREA_LESSONS.flat()].map((lesson) => {
    // La práctica vive en un mapa aparte y se fusiona aquí: es un bloque largo que
    // rompería la lectura de la lección si estuviera dentro.
    const practice = PRACTICES[lesson.competencyId];

    return practice ? { ...lesson, practice } : lesson;
  }),
  items: [...ITEMS, ...AREA_ITEMS.flat()],
  references: REFERENCES,
};

export const contentIndex = buildCatalog(CATALOG);
