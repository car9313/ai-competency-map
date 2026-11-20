import type { Metadata } from 'next';
import { contentIndex } from '@/content';
import { TargetPath } from '@/features/competency-graph/presentation/TargetPath';

export const metadata: Metadata = {
  title: 'Rutas hacia un objetivo',
  description:
    'Elige una competencia y comprueba qué prerrequisitos te faltan, en orden, con tu estado real en cada uno.',
};

export default function RutasPage() {
  const competencies = contentIndex.competencies.filter((competency) => competency.published);

  const areaNames = Object.fromEntries(
    (contentIndex.areas ?? []).map((area) => [area.id, `${area.index} · ${area.name}`]),
  );

  const itemIdsByCompetency = Object.fromEntries(
    competencies.map((competency) => [
      competency.id,
      (contentIndex.itemsByCompetency.get(competency.id) ?? []).map((item) => item.id),
    ]),
  );

  const edges = competencies.flatMap((competency) =>
    competency.prerequisites.map((from) => ({ from, to: competency.id })),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Rutas</h1>
        <p className="max-w-2xl text-sm text-muted">
          El mapa responde «¿qué aprendo y en qué orden?». Esto responde otra cosa: «quiero llegar
          aquí; ¿qué me falta?». Solo aparecen las competencias del camino, no toda su área.
        </p>
      </header>

      <TargetPath
        competencies={competencies}
        areaNames={areaNames}
        itemIdsByCompetency={itemIdsByCompetency}
        edges={edges}
      />
    </div>
  );
}
