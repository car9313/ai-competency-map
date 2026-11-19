import type { Metadata } from 'next';
import Link from 'next/link';
import stub from '@/content/competencies.stub.json';

/**
 * Solo existen las competencias conocidas en build.
 * Fuente temporal: src/content/competencies.stub.json (se sustituye en S4).
 */
export const dynamicParams = false;

type Params = { competencyId: string };

export function generateStaticParams(): Params[] {
  return stub.ids.map((competencyId) => ({ competencyId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { competencyId } = await params;
  return { title: competencyId };
}

export default async function CompetencyPage({ params }: { params: Promise<Params> }) {
  const { competencyId } = await params;

  return (
    <article className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">Competencia: {competencyId}</h1>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">
        Aquí vivirá la lección (estática, indexable) y la comprobación como isla cliente.
      </p>
      <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Pendiente de las rebanadas S4 y S6.
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
