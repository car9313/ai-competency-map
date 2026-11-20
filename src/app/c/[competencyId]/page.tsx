import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { contentIndex } from '@/content';
import { CompetencyProgress } from '@/features/assessment/presentation/CompetencyProgress';

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

  return { title: competency?.title ?? competencyId, description: competency?.claim };
}

export default async function CompetencyPage({ params }: { params: Promise<Params> }) {
  const { competencyId } = await params;
  const competency = contentIndex.competencyById.get(competencyId);
  const lesson = contentIndex.lessonByCompetency.get(competencyId);
  const items = contentIndex.itemsByCompetency.get(competencyId) ?? [];
  const area = competency ? contentIndex.areas?.find((entry) => entry.id === competency.areaId) : undefined;

  if (!competency) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Competencia no encontrada</h1>
        <Link href="/mapa" className="text-sm text-accent underline underline-offset-4">
          Volver al mapa
        </Link>
      </div>
    );
  }

  const prerequisites = competency.prerequisites
    .map((id) => contentIndex.competencyById.get(id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  const references = (lesson?.referenceIds ?? [])
    .map((id) => contentIndex.references.find((reference) => reference.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  return (
    <article className="space-y-6 pb-12">
      <Link
        href="/mapa"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Mapa
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
          {area && (
            <span className="rounded-full border border-border px-2 py-0.5">
              {area.index} · {area.name}
            </span>
          )}
          <span className="rounded-full border border-border px-2 py-0.5">{competency.layer}</span>
          <span className="rounded-full border border-border px-2 py-0.5">
            nivel {competency.level}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5">
            {items.length} ítems
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{competency.title}</h1>
        <p className="max-w-2xl text-muted">{competency.claim}</p>

        {/* Estado real del alumno, recalculado en el cliente a partir del historial. */}
        <CompetencyProgress items={items} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {lesson ? (
            <>
              <Section title="Qué es">
                <p className="leading-relaxed">{lesson.whatIs}</p>
              </Section>

              <Section title="Qué problema resuelve">
                <p className="leading-relaxed">{lesson.problem}</p>
              </Section>

              <Section title="Cómo funciona">
                <ul className="list-disc space-y-2 pl-5 leading-relaxed">
                  {lesson.internals.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Section>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <h2 className="mb-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                    Cuándo usarlo
                  </h2>
                  <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
                    {lesson.whenToUse.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                  <h2 className="mb-2 text-sm font-semibold text-amber-600 dark:text-amber-300">
                    Cuándo no
                  </h2>
                  <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
                    {lesson.whenNotToUse.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Section title="Errores frecuentes">
                <dl className="space-y-4">
                  {lesson.pitfalls.map((pitfall) => (
                    <div key={pitfall.title} className="rounded-xl border border-border bg-surface p-4">
                      <dt className="text-sm font-semibold">{pitfall.title}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-muted">{pitfall.detail}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            </>
          ) : (
            <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
              Esta competencia todavía no tiene lección escrita.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-surface p-4">
            <div>
              <p className="text-sm font-semibold">Comprobación con preguntas</p>
              <p className="text-xs text-muted">
                {items.length > 0
                  ? `Opción múltiple con justificación por distractor y confianza declarada. Puedes repetirla siempre: cada intento se guarda y el estado se recalcula.`
                  : 'Esta competencia todavía no tiene ítems.'}
              </p>
            </div>
            {items.length > 0 && (
              <Link
                href={`/c/${competency.id}/comprobar`}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Comprobar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {references.length > 0 && (
            <Section title="Referencias">
              <ul className="space-y-2">
                {references.map((reference) => (
                  <li key={reference.id}>
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-start gap-1.5 text-sm text-accent underline underline-offset-4"
                    >
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {reference.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 font-mono text-[11px] tracking-wide text-muted uppercase">
              Prerrequisitos
            </h2>
            {prerequisites.length === 0 ? (
              <p className="text-sm text-muted">Ninguno: es una raíz del grafo.</p>
            ) : (
              <ul className="space-y-2">
                {prerequisites.map((prerequisite) => (
                  <li key={prerequisite.id}>
                    <Link
                      href={`/c/${prerequisite.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-accent underline underline-offset-4"
                    >
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      {prerequisite.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 font-mono text-[11px] tracking-wide text-muted uppercase">
              Identificador
            </h2>
            <p className="font-mono text-[11px] break-all text-muted">{competency.id}</p>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      <div className="text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}
