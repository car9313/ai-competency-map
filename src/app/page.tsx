import Link from 'next/link';
import { contentIndex } from '@/content';
import { TodayQueue } from '@/features/assessment/presentation/TodayQueue';

export const metadata = {
  title: 'Hoy',
  description:
    'Tu cola de repaso: lo que vence hoy, calculado a partir de tu historial de intentos.',
};

export default function HomePage() {
  const titles: Record<string, string> = {};
  const competencies: Array<{ id: string; itemIds: string[] }> = [];

  for (const competency of contentIndex.competencies) {
    titles[competency.id] = competency.title;

    const items = contentIndex.itemsByCompetency.get(competency.id) ?? [];

    if (items.length > 0) {
      competencies.push({ id: competency.id, itemIds: items.map((item) => item.id) });
    }
  }

  const items = [...contentIndex.itemById.values()];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hoy</h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Lo que vence hoy se calcula con tus intentos, no con una lista que hayas marcado. Si no
          hay nada, es que no hay nada.
        </p>
      </header>

      <TodayQueue items={items} titles={titles} competencies={competencies} />

      <p className="text-xs text-muted">
        ¿Quieres ver qué hay detrás?{' '}
        <Link href="/mapa" className="text-accent underline underline-offset-4">
          Mapa de competencias
        </Link>{' '}
        ·{' '}
        <Link href="/acerca" className="text-accent underline underline-offset-4">
          Cómo funciona
        </Link>
      </p>
    </div>
  );
}
