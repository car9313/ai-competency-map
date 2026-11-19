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
import { lintCatalog, summarize } from '@/features/content/domain/linter';
import { parseCatalog } from '@/features/content/domain/schema';
import { systemClock } from '@/shared/time/clock';

const today = systemClock.today();

const schema = parseCatalog(CATALOG);

if (!schema.ok) {
  console.error(`✗ Esquema inválido: ${schema.issues.length} problema(s)`);
  for (const issue of schema.issues) {
    console.error(`   · ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
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
    `Resultado: ${errors} error(es), ${warnings} aviso(s)`,
  ].join('\n'),
);

if (errors > 0) {
  process.exit(1);
}
