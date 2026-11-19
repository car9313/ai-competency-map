#!/usr/bin/env node
/**
 * Validador de contenido.
 *
 * En S1 valida lo único que existe todavía: que los identificadores de competencia
 * sean kebab-case y no estén repetidos. Las reglas R1–R7 (estructura de ítems,
 * justificaciones, cobertura, forma del grafo, referencias) llegan en S4 y se
 * documentan en docs/quality/content-linter.md.
 *
 * Existe desde el primer commit para que la puerta esté conectada en CI: una
 * comprobación que se añade "cuando toque" acaba no añadiéndose.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_FILE = path.join(ROOT, 'src', 'content', 'competencies.stub.json');
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function loadIds() {
  const raw = readFileSync(CONTENT_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.ids)) {
    throw new Error(`El archivo no contiene un array "ids": ${CONTENT_FILE}`);
  }
  return parsed.ids;
}

function validate(ids) {
  const errors = [];
  const seen = new Set();

  for (const id of ids) {
    if (typeof id !== 'string' || !KEBAB_CASE.test(id)) {
      errors.push(`id no es kebab-case válido: ${JSON.stringify(id)}`);
      continue;
    }
    if (seen.has(id)) {
      errors.push(`id duplicado: "${id}"`);
    }
    seen.add(id);
  }

  return errors;
}

let ids;
try {
  ids = loadIds();
} catch (error) {
  console.error(`✗ No se pudo leer el contenido: ${error.message}`);
  process.exit(1);
}

const errors = validate(ids);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`  ✗ ${error}`);
  }
  console.error(`\nContenido inválido: ${errors.length} error(es) en ${ids.length} competencia(s).`);
  process.exit(1);
}

console.log(`Contenido válido: ${ids.length} competencia(s).`);
console.log('Reglas activas: R0 (ids kebab-case y únicos). R1–R7 llegan en S4.');
