import type { Metadata } from 'next';
import { contentIndex } from '@/content';
import { ReviewSession } from '@/features/assessment/presentation/ReviewSession';

export const metadata: Metadata = {
  title: 'Repaso',
  description: 'Recorre los ítems que vencen hoy, ordenados por atraso y dificultad.',
};

export default function RepasoPage() {
  const titles: Record<string, string> = {};

  for (const competency of contentIndex.competencies) {
    titles[competency.id] = competency.title;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Repaso</h1>
        <p className="text-sm text-muted">
          Lo más atrasado primero. Cuando termines un ítem, vuelve a su fecha según cómo te haya
          ido.
        </p>
      </header>

      <ReviewSession items={[...contentIndex.itemById.values()]} titles={titles} />
    </div>
  );
}
