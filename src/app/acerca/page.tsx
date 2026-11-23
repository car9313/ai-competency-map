import Link from 'next/link';
import { contentIndex } from '@/content';
import { AreaProgress } from '@/features/assessment/presentation/AreaProgress';
import { DataPanel } from '@/features/assessment/presentation/DataPanel';

export const metadata = {
  title: 'Acerca',
};

export default function AcercaPage() {
  const itemCount = contentIndex.itemById.size;
  const areas = (contentIndex.areas ?? []).map((area) => ({
    id: area.id,
    index: area.index,
    name: area.name,
    competencies: contentIndex.competencies
      .filter((competency) => competency.areaId === area.id)
      .map((competency) => ({
        id: competency.id,
        title: competency.title,
        // Solo los identificadores: la proyección no necesita los enunciados.
        itemIds: (contentIndex.itemsByCompetency.get(competency.id) ?? []).map((item) => item.id),
      })),
  }));

  return (
    <section className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Acerca de este proyecto</h1>

      <p className="text-muted">
        La mayoría de plataformas de aprendizaje guarda una casilla: «lección completada». Eso es
        una afirmación del usuario. Aquí una competencia no tiene estado almacenado: su estado se
        calcula a partir del historial de intentos.
      </p>

      <p className="text-muted">
        Si fallas un repaso, no vuelves a bloquear lo que ya alcanzaste. El desbloqueo es permanente
        una vez ganado; lo que se mueve es el dominio.
      </p>

      <p className="text-muted">
        Todas las respuestas son de opción múltiple con una justificación por cada distractor, y
        declaran confianza. Ese segundo eje es lo que permite distinguir «lo sabe» de «acertó por
        suerte».
      </p>

      <AreaProgress areas={areas} />

      <p className="text-sm text-muted">
        Sin backend, sin base de datos, sin claves y sin coste de ejecución. El progreso vive en el
        navegador y se puede exportar.
      </p>

      <p className="text-sm text-muted">
        El catálogo completo —áreas, competencias, lecciones, {itemCount} ítems con la justificación
        de cada distractor y las referencias— está publicado como dato abierto en{' '}
        <a
          href="/contenido.json"
          className="text-accent underline underline-offset-4"
          type="application/json"
        >
          contenido.json
        </a>
        . Es el mismo archivo que valida el build, así que no puede desviarse de lo que ves aquí.
        Licencia CC BY-SA 4.0.
      </p>

      <p className="text-sm text-muted">
        Si es tu primera vez, la{' '}
        <Link href="/guia" className="text-accent underline underline-offset-4">
          guía de uso
        </Link>{' '}
        explica sin tecnicismos cómo responder, qué significan los estados y cómo guardar tu
        progreso.
      </p>

      <DataPanel />
    </section>
  );
}
