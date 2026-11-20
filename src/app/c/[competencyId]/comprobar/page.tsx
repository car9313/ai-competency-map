import type { Metadata } from 'next';
import Link from 'next/link';
import { contentIndex } from '@/content';
import { CheckSession } from '@/features/assessment/presentation/CheckSession';

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
    title: competency ? `Comprobar: ${competency.title}` : 'Comprobar',
    description: competency?.claim,
  };
}

export default async function ComprobarPage({ params }: { params: Promise<Params> }) {
  const { competencyId } = await params;
  const competency = contentIndex.competencyById.get(competencyId);
  const items = contentIndex.itemsByCompetency.get(competencyId) ?? [];

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/c/${competency.id}`}
        className="text-xs font-medium text-muted transition-colors hover:text-accent"
      >
        ← {competency.title}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Comprobación</h1>

      <CheckSession
        competencyId={competency.id}
        title={competency.title}
        items={items}
        prerequisites={competency.prerequisites.map((id) => ({
          id,
          title: contentIndex.competencyById.get(id)?.title ?? id,
          itemIds: (contentIndex.itemsByCompetency.get(id) ?? []).map((item) => item.id),
        }))}
      />
    </div>
  );
}
