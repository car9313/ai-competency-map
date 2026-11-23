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

      <div className="rounded-xl border border-accent/30 bg-surface p-4">
        <h2 className="text-sm font-semibold">¿Primera vez aquí?</h2>
        <p className="mt-1 text-xs text-muted">
          Hay una guía escrita para quien nunca ha usado esto, sin dar nada por sabido: qué
          significan los estados, por qué te vuelve a preguntar y cómo guardar tu progreso.
        </p>
        <Link
          href="/guia"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:text-accent"
        >
          Leer la guía de uso
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">¿Ya sabes algo de esto?</h2>
        <p className="mt-1 text-xs text-muted">
          Doce preguntas repartidas por todo el mapa. Lo que aciertes desbloquea lo que dependa de
          ello, así que no tienes que empezar por la raíz si ya vienes sabiendo.
        </p>
        <Link
          href="/diagnostico"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:text-accent"
        >
          Hacer el diagnóstico
        </Link>
      </div>

      <p className="text-xs text-muted">
        ¿Quieres ver qué hay detrás?{' '}
        <Link href="/mapa" className="text-accent underline underline-offset-4">
          Mapa de competencias
        </Link>{' '}
        ·{' '}
        <Link href="/historial" className="text-accent underline underline-offset-4">
          Historial
        </Link>{' '}
        ·{' '}
        <Link href="/acerca" className="text-accent underline underline-offset-4">
          Cómo funciona
        </Link>
      </p>
    </div>
  );
}
