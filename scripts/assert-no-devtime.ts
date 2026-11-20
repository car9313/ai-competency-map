/**
 * Aserción de que el control de tiempo de la demo no llega a producción.
 *
 * `?devtime=` es una herramienta de desarrollo: permite enseñar la repetición espaciada sin
 * esperar días. Pero si el código sobrevive al build, un visitante puede cambiar «hoy» y ver
 * un estado que no es el suyo. Esta comprobación falla el build si la cadena aparece en
 * cualquier archivo JavaScript del bundle.
 *
 * Es la versión mecánica del criterio de S5: no se confía en que el minificador haga su
 * trabajo, se comprueba.
 */
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const BUNDLE_DIR = 'out/_next/static';
const NEEDLE = 'devtime';

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (extname(entry.name) === '.js') {
      yield path;
    }
  }
}

async function main(): Promise<void> {
  const offenders: string[] = [];
  let scanned = 0;

  for await (const file of walk(BUNDLE_DIR)) {
    scanned += 1;

    const content = await readFile(file, 'utf8');

    if (content.toLowerCase().includes(NEEDLE)) {
      offenders.push(file);
    }
  }

  if (scanned === 0) {
    console.error(`✗ No se encontró ningún archivo JavaScript en ${BUNDLE_DIR}.`);
    process.exit(1);
  }

  if (offenders.length > 0) {
    console.error(`✗ "${NEEDLE}" aparece en ${offenders.length} archivo(s) del bundle:`);
    for (const file of offenders) console.error(`   ${file}`);
    console.error('  El control de tiempo de la demo no debe llegar a producción.');
    process.exit(1);
  }

  console.log(`✓ "${NEEDLE}" no aparece en ${scanned} archivo(s) del bundle.`);
}

await main();
