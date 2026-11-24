import type { Metadata } from 'next';
import Link from 'next/link';
import { contentIndex } from '@/content';
import { WORKSHOPS } from '@/content/workshops';
import { systemClock } from '@/shared/time/clock';

export const metadata: Metadata = {
  title: 'Talleres',
  description:
    'Ejercicios guiados con entregable: montar un harness, escribir una skill, cerrar el bucle de un agente. Lo que no se aprende leyendo.',
};

/** Meses a partir de los cuales se avisa de que la herramienta puede haber cambiado. */
const MESES = 6;

function mesesDesde(fecha: string, hoy: string): number {
  const [anioF, mesF] = fecha.split('-').map(Number);
  const [anioH, mesH] = hoy.split('-').map(Number);

  if (!anioF || !mesF || !anioH || !mesH) {
    return 0;
  }

  return (anioH - anioF) * 12 + (mesH - mesF);
}

export default function TalleresPage() {
  const hoy = systemClock.today();

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Talleres</h1>
        <p className="text-muted">
          Cada taller produce un artefacto: una skill, un harness, un bucle cerrado. No hay
          corrección automática ni cuenta como evidencia de nada; lo que hay es una rúbrica para que
          sepas si lo que construiste está bien.
        </p>
        <p className="text-sm text-muted">
          Si un taller nombra una herramienta concreta, lleva la fecha en la que se comprobó su
          documentación. Eso se caduca: cuando la fecha tenga más de {MESES} meses, abre el enlace
          antes de fiarte del detalle.
        </p>
      </header>

      {WORKSHOPS.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay talleres escritos.</p>
      ) : (
        <ol className="space-y-10">
          {WORKSHOPS.map((taller, indice) => {
            const competencia = contentIndex.competencyById.get(taller.competencyId);
            const verificado = taller.tool?.verifiedAt ?? null;
            const caducado = verificado === null || mesesDesde(verificado, hoy) >= MESES;

            return (
              <li key={taller.id} id={taller.id} className="scroll-mt-24 space-y-4">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] tracking-wide text-accent uppercase">
                    Taller {indice + 1} · {taller.timebox}
                  </p>
                  <h2 className="text-xl font-bold tracking-tight">{taller.title}</h2>
                  <p className="text-muted">{taller.goal}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  {competencia && (
                    <span>
                      Practica:{' '}
                      <Link
                        href={`/c/${competencia.id}`}
                        className="text-accent underline underline-offset-4"
                      >
                        {competencia.title}
                      </Link>
                    </span>
                  )}
                  {taller.tool && (
                    <span className={caducado ? 'text-amber-700 dark:text-amber-300' : undefined}>
                      {taller.tool.name} ·{' '}
                      {verificado === null ? 'sin comprobar' : `verificado ${verificado}`}
                      {caducado && ' · revisa el enlace'}
                    </span>
                  )}
                </div>

                <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-semibold">Antes de empezar</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                    {taller.requirements.map((requisito) => (
                      <li key={requisito}>{requisito}</li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Pasos</h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                    {taller.steps.map((paso) => (
                      <li key={paso}>{paso}</li>
                    ))}
                  </ol>
                </section>

                <section className="rounded-xl border border-accent/30 bg-surface p-4">
                  <h3 className="text-sm font-semibold">Entregable</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{taller.deliverable}</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Rúbrica de autoevaluación</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                    {taller.rubric.map((criterio) => (
                      <li key={criterio}>{criterio}</li>
                    ))}
                  </ul>
                </section>

                {taller.gotchas && taller.gotchas.length > 0 && (
                  <section className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Trampas que aparecen de verdad
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                      {taller.gotchas.map((trampa) => (
                        <li key={trampa}>{trampa}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <footer className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <p>
          El criterio está en el{' '}
          <Link href="/mapa" className="text-accent underline underline-offset-4">
            mapa
          </Link>{' '}
          y el orden sugerido en el{' '}
          <Link href="/itinerario" className="text-accent underline underline-offset-4">
            itinerario
          </Link>
          . Los talleres son lo que va después de entender: hacer.
        </p>
      </footer>
    </div>
  );
}
