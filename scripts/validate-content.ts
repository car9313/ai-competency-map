/**
 * CLI del linter de contenido.
 *
 * Es la puerta G4 del harness: si el contenido no cumple el esquema o viola alguna
 * regla R1–R7 con severidad de error, el build no pasa.
 *
 * Los avisos se imprimen pero no rompen: no tiene sentido bloquear una aportación por
 * un detalle estético que un humano debe juzgar.
 */
import { CATALOG } from '@/content';
import { checkWorkshops, lintCatalog, summarize } from '@/features/content/domain/linter';
import { parseCatalog } from '@/features/content/domain/schema';
import { systemClock } from '@/shared/time/clock';
import { TOOL_CATEGORIES } from '../src/content/tools';
import { WORKSHOPS } from '../src/content/workshops';

const today = systemClock.today();

const schema = parseCatalog(CATALOG);

if (!schema.ok) {
  console.error(`✗ Esquema inválido: ${schema.issues.length} problema(s)`);
  for (const issue of schema.issues) {
    console.error(`   · ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}

/*
 * Herramientas: el módulo vive fuera del catálogo y no puede romper el contenido, pero sí
 * avisar de que ha envejecido. Un aviso y no un error por una razón práctica: si caducara
 * como error, cualquiera que clonara el repositorio dentro de un año tendría el CI en rojo
 * sin haber tocado nada.
 */
const MESES_DE_VIDA_HERRAMIENTA = 6;

function mesesDesde(fecha: string, hasta: string): number {
  const [anioF, mesF] = fecha.split('-').map(Number);
  const [anioH, mesH] = hasta.split('-').map(Number);

  if (!anioF || !mesF || !anioH || !mesH) {
    return 0;
  }

  return (anioH - anioF) * 12 + (mesH - mesF);
}

const herramientas = TOOL_CATEGORIES.flatMap((categoria) =>
  categoria.tools.map((tool) => ({ categoria: categoria.id, ...tool })),
);

const sinVerificar = herramientas.filter((tool) => tool.verifiedAt === null);
const caducadas = herramientas.filter(
  (tool) => tool.verifiedAt !== null && mesesDesde(tool.verifiedAt, today) >= MESES_DE_VIDA_HERRAMIENTA,
);

const nombres = new Set<string>();
const duplicadas: string[] = [];

for (const tool of herramientas) {
  if (nombres.has(tool.name)) {
    duplicadas.push(tool.name);
  }

  nombres.add(tool.name);
}

if (herramientas.length > 0) {
  console.log(
    `\nHerramientas: ${herramientas.length} fichas en ${TOOL_CATEGORIES.length} categorías · ` +
      `${sinVerificar.length} sin comprobar en vivo · ${caducadas.length} caducadas`,
  );

  if (sinVerificar.length > 0) {
    console.log(
      `! herramientas · ${sinVerificar.length} fichas sin fecha de comprobación (${sinVerificar
        .slice(0, 5)
        .map((tool) => tool.name)
        .join(', ')}${sinVerificar.length > 5 ? '…' : ''})`,
    );
  }

  for (const tool of caducadas) {
    console.log(`! herramientas · ${tool.name} · sin revisar desde ${tool.verifiedAt}`);
  }
}

if (duplicadas.length > 0) {
  console.error(`✗ herramientas · nombres duplicados: ${duplicadas.join(', ')}`);
  process.exit(1);
}

/*
 * Talleres: se validan aparte del catálogo porque no son contenido evaluable. Un taller no
 * genera evidencia; lo que se comprueba es que se pueda terminar y que no mienta sobre la
 * herramienta que nombra.
 */
const issuesTalleres = checkWorkshops(WORKSHOPS);

if (WORKSHOPS.length > 0) {
  const verificados = WORKSHOPS.filter((taller) => taller.tool?.verifiedAt).length;

  console.log(
    `\nTalleres: ${WORKSHOPS.length} · con herramienta verificada: ${verificados}`,
  );
}

for (const issue of issuesTalleres) {
  const mark = issue.severity === 'error' ? '✗' : '!';
  console.log(`${mark} ${issue.rule} · ${issue.subject} · ${issue.message}`);
}

const issues = lintCatalog(CATALOG, today);
const { errors, warnings } = summarize(issues);

for (const issue of issues) {
  const mark = issue.severity === 'error' ? '✗' : '!';
  console.log(`${mark} ${issue.rule} · ${issue.subject} · ${issue.message}`);
}

console.log(
  [
    '',
    `Contenido revisado: ${CATALOG.competencies.length} competencias · ` +
      `${CATALOG.lessons.length} lecciones · ${CATALOG.items.length} ítems`,
    `Contenido: ${errors} error(es), ${warnings} aviso(s)`,
  ].join('\n'),
);

if (errors > 0 || issuesTalleres.some((issue) => issue.severity === 'error')) {
  process.exit(1);
}