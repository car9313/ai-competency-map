import type { Metadata } from 'next';
import Link from 'next/link';
import { TOOL_CATEGORIES, type ToolEntry } from '@/content/tools';
import { systemClock } from '@/shared/time/clock';

export const metadata: Metadata = {
  title: 'Herramientas',
  description:
    'Mapa del ecosistema de herramientas para trabajar con agentes: qué ofrece cada una gratis, qué de pago y cuándo se comprobó.',
};

/**
 * Meses a partir de los cuales una ficha se considera caducada.
 *
 * Seis: el ecosistema cambia lo bastante rápido como para que una capa gratuita descrita
 * hace medio año ya no exista, y lo bastante lento como para que revisar antes sea ruido.
 */
const MESES_DE_VIDA = 6;

function mesesDesde(fecha: string, hoy: string): number {
  const [anioF, mesF] = fecha.split('-').map(Number);
  const [anioH, mesH] = hoy.split('-').map(Number);

  if (!anioF || !mesF || !anioH || !mesH) {
    return 0;
  }

  return (anioH - anioF) * 12 + (mesH - mesF);
}

function frescura(tool: ToolEntry, hoy: string): { texto: string; caducada: boolean } {
  if (tool.verifiedAt === null) {
    return { texto: 'sin comprobar en vivo', caducada: true };
  }

  const meses = mesesDesde(tool.verifiedAt, hoy);

  if (meses >= MESES_DE_VIDA) {
    return { texto: `sin revisar desde ${tool.verifiedAt}`, caducada: true };
  }

  return { texto: `verificada ${tool.verifiedAt}`, caducada: false };
}

export default function HerramientasPage() {
  const hoy = systemClock.today();
  const total = TOOL_CATEGORIES.reduce((suma, categoria) => suma + categoria.tools.length, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Herramientas</h1>
        <p className="max-w-2xl text-muted">
          {total} fichas del ecosistema, agrupadas por lo que resuelven. Están fuera del mapa de
          competencias a propósito: una competencia debe seguir siendo cierta cuando cambie el
          precio de una herramienta.
        </p>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            Esto caduca, y lo dice
          </p>
          <p className="mt-1 text-muted">
            Las capas gratuitas y los precios cambian cada pocos meses. Cada ficha lleva su fecha
            de comprobación: si tiene más de {MESES_DE_VIDA} meses, o dice «sin comprobar en vivo»,
            abre el enlace antes de fiarte. No hay precios exactos aquí: depende de país y cambian
            demasiado rápido.
          </p>
        </div>
        <p className="text-sm text-muted">
          La primera tanda se escribió desde conocimiento general del ecosistema, no desde una
          visita a cada proveedor. Por eso aparece como no verificada: inventar una fecha sería
          peor que reconocer el hueco.
        </p>
      </header>

      <nav aria-label="Índice de categorías" className="rounded-xl border border-border bg-surface p-4">
        <p className="font-mono text-[11px] tracking-wide text-muted uppercase">Categorías</p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {TOOL_CATEGORIES.map((categoria) => (
            <li key={categoria.id}>
              <a href={`#${categoria.id}`} className="text-sm text-accent underline underline-offset-4">
                {categoria.title} · {categoria.tools.length}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {TOOL_CATEGORIES.map((categoria) => (
        <section key={categoria.id} id={categoria.id} className="scroll-mt-24 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">{categoria.title}</h2>
          <p className="max-w-2xl text-sm text-muted">{categoria.intro}</p>

          <ul className="space-y-2">
            {categoria.tools.map((tool) => {
              const estado = frescura(tool, hoy);

              return (
                <li
                  key={tool.name}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-accent underline underline-offset-4"
                      >
                        {tool.name}
                      </a>
                    </h3>
                    <span
                      className={
                        estado.caducada
                          ? 'font-mono text-[10px] text-amber-700 dark:text-amber-300'
                          : 'font-mono text-[10px] text-muted'
                      }
                    >
                      {estado.texto}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-relaxed text-muted">{tool.what}</p>

                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-mono tracking-wide text-muted uppercase">Gratis</dt>
                      <dd>{tool.free}</dd>
                    </div>
                    <div>
                      <dt className="font-mono tracking-wide text-muted uppercase">De pago</dt>
                      <dd>{tool.paid}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <footer className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <p>
          Criterio para elegir, más útil que cualquier lista: empieza por lo gratis, mide el
          retrabajo antes de pagar, y no ates herramientas que no vas a revisar. Lo que cambia el
          resultado es el método —especificar, delegar con pruebas, revisar el diff—, no la marca.
        </p>
        <p className="mt-3">
          El método está en el{' '}
          <Link href="/mapa?area=ai-workflow-methodology" className="text-accent underline underline-offset-4">
            área 09 del mapa
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
