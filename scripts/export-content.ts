/**
 * Publica el catálogo como dato: `out/contenido.json`.
 *
 * El contenido ya es un artefacto validado —lo comprueban el esquema y siete reglas del
 * linter en cada build—. Esto lo convierte además en algo que otros pueden consumir sin
 * clonar el código: es lo que separa «un repositorio abierto» de «un conjunto de datos
 * reutilizable».
 *
 * Decisiones:
 *
 * - **Sin marca de tiempo.** Un `generatedAt` haría que cada build produjera un archivo
 *   distinto aunque el contenido no cambiara, y eso ensucia cualquier comparación entre
 *   versiones. La identidad la da `version`.
 * - **Con las respuestas correctas.** No es un examen: es material de estudio. Ocultarlas
 *   obligaría a montar un servidor, que es justo lo que este proyecto no tiene.
 * - **En español y sin traducir.** El campo `lang` lo dice de forma explícita.
 *
 * Se ejecuta después de `next build` porque necesita que `out/` exista.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CATALOG } from '../src/content';

const OUT_DIR = 'out';
const FILE = 'contenido.json';

export const CATALOG_KIND = 'acm.catalog';
export const CATALOG_VERSION = 1;

const payload = {
  kind: CATALOG_KIND,
  version: CATALOG_VERSION,
  lang: 'es',
  license: {
    content: 'CC BY-SA 4.0',
    attribution: 'https://github.com/car9313/ai-competency-map',
    note: 'Atribución requerida; las obras derivadas se comparten con la misma licencia.',
  },
  counts: {
    areas: CATALOG.areas.length,
    competencies: CATALOG.competencies.length,
    lessons: CATALOG.lessons.length,
    items: CATALOG.items.length,
    references: CATALOG.references.length,
  },
  areas: CATALOG.areas,
  competencies: CATALOG.competencies,
  lessons: CATALOG.lessons,
  items: CATALOG.items,
  references: CATALOG.references,
};

const json = `${JSON.stringify(payload, null, 2)}\n`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, FILE), json, 'utf8');

const kb = (Buffer.byteLength(json, 'utf8') / 1024).toFixed(0);

console.log(
  `✓ ${OUT_DIR}/${FILE} generado: ${payload.counts.areas} áreas · ${payload.counts.competencies} competencias · ${payload.counts.items} ítems (${kb} KB)`,
);
