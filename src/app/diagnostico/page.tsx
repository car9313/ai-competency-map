import type { Metadata } from 'next';
import { contentIndex } from '@/content';
import { buildDiagnostic } from '@/features/assessment/application/diagnostic';
import { DiagnosticSession } from '@/features/assessment/presentation/DiagnosticSession';

export const metadata: Metadata = {
  title: 'Diagnóstico inicial',
  description:
    'Doce preguntas repartidas por áreas para saber en qué punto estás, sin empezar por el principio del mapa.',
};

export default function DiagnosticoPage() {
  const todos = [...contentIndex.itemById.values()];

  const seleccion = buildDiagnostic({
    items: todos,
    competencies: contentIndex.competencies,
    areas: contentIndex.areas ?? [],
  });

  const idsDeCompetencia = [...new Set(seleccion.map((item) => item.competencyId))];

  const grupos = idsDeCompetencia.map((competencyId) => ({
    id: competencyId,
    title: contentIndex.competencyById.get(competencyId)?.title ?? competencyId,
    // El estado se proyecta sobre TODOS los ítems de la competencia, no solo sobre el que
    // salió en el diagnóstico: con uno solo, acertarlo la daría por consolidada.
    items: contentIndex.itemsByCompetency.get(competencyId) ?? [],
  }));

  const hints: Record<string, string> = {};

  for (const competencyId of idsDeCompetencia) {
    const lesson = contentIndex.lessonByCompetency.get(competencyId);

    if (lesson) {
      hints[competencyId] = lesson.problem;
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Diagnóstico</h1>
        <p className="max-w-2xl text-sm text-muted">
          {seleccion.length} preguntas repartidas por todo el mapa. Si ya sabes algo, aquí se ve:
          no hace falta empezar por la raíz para desbloquear lo básico.
        </p>
        <p className="max-w-2xl text-xs text-muted">
          Cada respuesta es un intento normal. Lo que aciertes desbloquea lo que dependa de ello,
          y lo que falles vuelve mañana como cualquier otro. No hay nota: hay evidencia.
        </p>
      </header>

      <DiagnosticSession items={seleccion} groups={grupos} hints={hints} />
    </div>
  );
}
