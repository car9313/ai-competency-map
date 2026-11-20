import type { Metadata } from 'next';
import { contentIndex } from '@/content';
import { AttemptHistory } from '@/features/assessment/presentation/AttemptHistory';

export const metadata: Metadata = {
  title: 'Historial de intentos',
  description:
    'Cada respuesta registrada, con su fecha, su confianza y el efecto que tuvo en la programación del ítem.',
};

export default function HistorialPage() {
  const items = [...contentIndex.itemById.values()].map((item) => ({
    id: item.id,
    prompt: item.prompt,
    competencyId: item.competencyId,
  }));

  const titles = Object.fromEntries(
    contentIndex.competencies.map((competency) => [competency.id, competency.title]),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Historial</h1>
        <p className="max-w-2xl text-sm text-muted">
          Todo lo que has respondido, en orden. Cada línea muestra qué hizo ese intento con la
          programación del ítem: de qué estado a cuál, cómo cambió el intervalo y cuándo vuelve.
        </p>
        <p className="max-w-2xl text-xs text-muted">
          Nada de esto se guarda como progreso: son intentos, y el estado se recalcula cada vez
          que abres la página.
        </p>
      </header>

      <AttemptHistory items={items} titles={titles} />
    </div>
  );
}
