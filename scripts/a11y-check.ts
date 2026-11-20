/**
 * Pasada de accesibilidad automática.
 *
 * Abre cada pantalla en un navegador real, inyecta axe-core y falla si aparece un problema
 * de impacto `critical` o `serious`. Se ejecuta contra la build estática, no contra el
 * servidor de desarrollo: lo que se comprueba es lo que se publica.
 *
 * Por qué un navegador y no un analizador estático: la mitad de los problemas de
 * accesibilidad (contraste, orden de foco, nombres accesibles calculados) solo existen con
 * estilos y DOM reales.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';

const ROOT = 'out';
const AXE_PATH = 'node_modules/axe-core/axe.min.js';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/** Rutas representativas: las cuatro pantallas del guion más los estados vacíos. */
const ROUTES = [
  '/',
  '/mapa',
  '/mapa/tarjetas',
  '/c/ai-ml-dl-boundaries',
  '/c/tokens-and-context-window/comprobar',
  '/repaso',
  '/acerca',
];

/**
 * Historial sembrado: sin evidencia, la comprobación mostraría el aviso de bloqueo y no la
 * pregunta, y el repaso estaría vacío. Con esto axe revisa las pantallas en su estado real.
 */
const SEED = `
  const mk = (id, itemId, dias) => ({
    id, deviceId: 'a11y', itemId,
    answeredAt: new Date(Date.now() - dias * 86400000).toISOString(),
    selectedOptionId: 'a', correct: true, confidence: 'confident',
    presentedOptionIds: ['a', 'b', 'c'], durationMs: 3000,
  });
  localStorage.setItem('acm:attempts:v1', JSON.stringify([
    mk('a1', 'ml-rules-vs-model', 6),
    mk('a2', 'ml-supervised-data', 1),
    mk('a3', 'ml-overfitting-gap', 1),
    mk('a4', 'ml-when-deep-learning', 1),
  ]));
`;

interface Violation {
  id: string;
  impact: string | null;
  help: string;
  nodes: Array<{ target: string[] }>;
}

/** Intenta los canales instalados en el sistema, en orden de preferencia. */
async function launchBrowser(): Promise<Browser> {
  const channels = ['msedge', 'chrome', undefined] as const;

  for (const channel of channels) {
    try {
      return await chromium.launch(
        channel ? { channel, timeout: 60_000 } : { timeout: 60_000 },
      );
    } catch {
      // Siguiente opción.
    }
  }

  throw new Error(
    'No hay ningún navegador disponible. Instala Edge o Chrome, o ejecuta `pnpm exec playwright install chromium`.',
  );
}

function startServer(): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const requested = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
      let file = normalize(join(ROOT, requested));

      if (requested.endsWith('/')) file = join(file, 'index.html');

      try {
        const body = await readFile(file);

        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
        res.end(body);
      } catch {
        try {
          const body = await readFile(`${file}.html`);

          res.writeHead(200, { 'content-type': TYPES['.html'] ?? 'text/html' });
          res.end(body);
        } catch {
          res.writeHead(404, { 'content-type': 'text/plain' });
          res.end('404');
        }
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;

      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

async function auditRoute(
  browser: Browser,
  base: string,
  route: string,
  theme: 'dark' | 'light',
): Promise<Array<Violation & { route: string; theme: string }>> {
  /**
   * Un reintento por ruta. Arrancar un contexto de navegador falla de vez en cuando en
   * máquinas cargadas, y un gate que falla por el entorno en vez de por el código acaba
   * ignorándose. El reintento no oculta un problema real: ax no depende del azar.
   */
  for (let attempt = 1; ; attempt++) {
    try {
      return await auditRouteOnce(browser, base, route, theme);
    } catch (error) {
      if (attempt >= 2) throw error;
    }
  }
}

async function auditRouteOnce(
  browser: Browser,
  base: string,
  route: string,
  theme: 'dark' | 'light',
): Promise<Array<Violation & { route: string; theme: string }>> {
  const context = await browser.newContext({ colorScheme: theme === 'dark' ? 'dark' : 'light' });
  const page: Page = await context.newPage();

  await page.addInitScript(`localStorage.setItem('acm-theme', '${theme}');`);
  await page.addInitScript(SEED);
  /**
   * `waitUntil: 'load'` en vez de `networkidle`: en una página estática no hay peticiones
   * en vuelo que esperar, y `networkidle` es la causa típica de que el gate falle de forma
   * intermitente. Después se espera a que hidraten las islas de cliente.
   */
  await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 45_000 });
  await page.waitForTimeout(900);
  await page.addScriptTag({ path: AXE_PATH });

  const violations = (await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (ctx: unknown) => Promise<{ violations: unknown }> } }).axe;
    const result = await axe.run(document);

    return result.violations;
  })) as Violation[];

  await context.close();

  return violations.map((violation) => ({ route, theme, ...violation }));
}

async function main(): Promise<void> {
  const server = await startServer();
  /**
   * Se usa un navegador ya instalado en la máquina (`channel`) en vez de descargar el de
   * Playwright. Motivo concreto: la descarga falla en este entorno, y en CI el paso
   * `playwright install` añade minutos. Edge y Chrome están en cualquier Windows y en los
   * runners de GitHub, así que la comprobación funciona sin instalar nada.
   */
  const browser = await launchBrowser();
  const found: Array<Violation & { route: string; theme: string }> = [];

  try {
    for (const theme of ['dark', 'light'] as const) {
      for (const route of ROUTES) {
        found.push(...(await auditRoute(browser, server.url, route, theme)));
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const blocking = found.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );

  if (found.length === 0) {
    console.log(`✓ Sin violaciones en ${ROUTES.length} rutas × 2 temas.`);
    return;
  }

  for (const violation of found) {
    console.log(
      `· [${violation.impact ?? 'unknown'}] ${violation.id} — ${violation.help}\n    ${violation.route} (${violation.theme}): ${violation.nodes
        .map((node) => node.target.join(' '))
        .join(', ')}`,
    );
  }

  if (blocking.length > 0) {
    console.error(`\n✗ ${blocking.length} problema(s) de impacto crítico o serio.`);
    process.exit(1);
  }

  console.log(`\n✓ Solo avisos menores (${found.length}).`);
}

await main();
