import type { Metadata } from 'next';
import Link from 'next/link';
import { contentIndex } from '@/content';

/**
 * Solo existen las competencias que tienen contenido en build.
 * Con exportación estática, una ruta que no se genera aquí no existe.
 */
export const dynamicParams = false;

type Params = { competencyId: string };

export function generateStaticParams(): Params[] {
  return contentIndex.competencies.map((competency) => ({ competencyId: competency.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { competencyId } = await params;
  const competency = contentIndex.competencyById.get(competencyId);

  return {
    title: competency?.title ?? competencyId,
    description: competency?.claim,
  };
}

export default async function CompetencyPage({ params }: { params: Promise<Params> }) {
  const { competencyId } = await params;
  const competency = contentIndex.competencyById.get(competencyId);
  const lesson = contentIndex.lessonByCompetency.get(competencyId);
  const items = contentIndex.itemsByCompetency.get(competencyId) ?? [];

  if (!competency) {
    return (
      <article className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Competencia no encontrada</h1>
        <Link href="/mapa" className="text-sm underline underline-offset-4">
          Volver al mapa
        </Link>
      </article>
    );
  }

  return (
    <article className="max-w-3xl space-y-6 pb-12">
      <header className="space-y-2">
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {competency.layer} · nivel {competency.level} · {items.length} ítems
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{competency.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">{competency.claim}</p>
      </header>

      {lesson ? (
        <div className="space-y-5">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Qué es
            </h2>
            <p className="leading-relaxed text-slate-700 dark:text-slate-200">{lesson.whatIs}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Qué problema resuelve
            </h2>
            <p className="leading-relaxed text-slate-700 dark:text-slate-200">{lesson.problem}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Cómo funciona
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700 dark:text-slate-200">
              {lesson.internals.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/25 dark:bg-emerald-950/20">
              <h2 className="mb-1.5 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Cuándo usarlo
              </h2>
              <ul className="list-disc space-y-1 pl-4 text-sm text-emerald-900 dark:text-emerald-100">
                {lesson.whenToUse.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <section className="rounded border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-950/20">
              <h2 className="mb-1.5 text-sm font-semibold text-amber-900 dark:text-amber-200">
                Cuándo no
              </h2>
              <ul className="list-disc space-y-1 pl-4 text-sm text-amber-900 dark:text-amber-100">
                {lesson.whenNotToUse.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Errores frecuentes
            </h2>
            <dl className="space-y-3">
              {lesson.pitfalls.map((pitfall) => (
                <div key={pitfall.title}>
                  <dt className="font-medium text-slate-900 dark:text-slate-100">
                    {pitfall.title}
                  </dt>
                  <dd className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {pitfall.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      ) : (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Esta competencia todavía no tiene lección escrita.
        </p>
      )}

      <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        La comprobación con preguntas llega en la rebanada S6.
      </p>

      <Link
        href="/mapa"
        className="inline-block text-sm text-brand-600 underline underline-offset-4 dark:text-brand-500"
      >
        Volver al mapa
      </Link>
    </article>
  );
}
