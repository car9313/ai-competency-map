/**
 * Sirve `out/` CON las cabeceras de `vercel.json`, para comprobar que la CSP no rompe nada
 * antes de desplegarla.
 *
 * Un CSP mal escrito no falla en el build: falla en el navegador, en producción, y a veces
 * solo en la interacción. Servir la build local con las mismas cabeceras permite verlo aquí.
 *
 * Uso: tsx scripts/serve-with-headers.ts [puerto]
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { readFileSync } from 'node:fs';

const ROOT = 'out';
const port = Number(process.argv[2] ?? 3200);

const CSP = JSON.parse(readFileSync('vercel.json', 'utf8')).headers[0].headers as Array<{
  key: string;
  value: string;
}>;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.js': 'text/javascript',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  const requested = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
  const candidates = [
    join(ROOT, requested),
    join(ROOT, `${requested}.html`),
    join(ROOT, requested, 'index.html'),
  ];

  for (const candidate of candidates) {
    try {
      const body = await readFile(normalize(candidate));

      res.writeHead(200, {
        'content-type': TYPES[extname(candidate)] ?? 'application/octet-stream',
        ...Object.fromEntries(CSP.map((header) => [header.key, header.value])),
      });
      res.end(body);

      return;
    } catch {
      // Siguiente candidato.
    }
  }

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('404');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${port} sirviendo out/ con las cabeceras de vercel.json`);
});
