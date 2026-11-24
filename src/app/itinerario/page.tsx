import type { Metadata } from 'next';
import Link from 'next/link';
import { contentIndex } from '@/content';
import { PHASE_LABELS, PHASE_ORDER, type Phase } from '@/features/content/domain/types';

export const metadata: Metadata = {
  title: 'Itinerario',
  description:
    'El mapa de competencias en seis fases, de la base a lo avanzado: por dónde empezar sin perderse entre 47 nodos.',
};

/**
 * Itinerario por fases.
 *
 * Existe porque el grafo responde «qué necesito antes» y no responde «por dónde empiezo».
 * La fase es una sugerencia de orden, no un requisito: se puede entrar por cualquier
 * competencia que no tenga prerrequisitos pendientes. El texto lo dice, para no convertir
 * una recomendación en una puerta.
 */

const INTRO: Readonly<Record<Phase, string>> = {
  base: 'Cómo funciona el modelo, cómo se le habla y cómo se escribe un cambio. Sin esto, lo demás se aprende de memoria.',
  practica: 'Convertir lo anterior en sistemas: herramientas, recuperación de documentos y agentes con límites.',
  seguridad: 'Qué puede tocar un agente, qué necesita aprobación humana y cómo se recupera un trabajo a medias.',
  calidad: 'Lo que separa una demo de un sistema: medir, filtrar y observar lo que ocurre en producción.',
  organizacion: 'La parte que no está en el código: política de uso, adopción en un equipo y medición del retrabajo.',
  avanzado: 'Cuando lo anterior ya funciona: varios agentes, enrutado entre modelos y resistencia a fallos.',
};

export default function ItinerarioPage() {
  const porFase = new Map<Phase, Array<{ id: string; title: string; claim: string; level: number }>>();

  for (const phase of PHASE_ORDER) {
    porFase.set(phase, []);
  }

  for (const competency of contentIndex.competencies) {
    porFase.get(competency.phase)?.push({
      id: competency.id,
      title: competency.title,
      claim: competency.claim,
      level: competency.level,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Itinerario</h1>
        <p className="text-muted">
          El mapa tiene {contentIndex.competencies.length} competencias y el grafo dice de qué
          depende cada una. Eso responde «qué necesito antes», no «por dónde empiezo». Esto es lo
          segundo: seis fases en el orden en que suelen tener sentido.
        </p>
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          <p>
            Es una <strong>sugerencia</strong>, no una puerta. Puedes entrar por cualquier
            competencia cuyos prerrequisitos ya tengas; la app te dirá cuáles faltan. Si tu
            trabajo es con agentes y ya sabes lo básico, empieza por la fase de práctica y vuelve
            a la base cuando algo no encaje.
          </p>
        </div>
      </header>

      <nav aria-label="Fases" className="rounded-xl border border-border bg-surface p-4">
        <p className="font-mono text-[11px] tracking-wide text-muted uppercase">Las seis fases</p>
        <ol className="mt-2 space-y-1">
          {PHASE_ORDER.map((phase, index) => (
            <li key={phase} className="text-sm">
              <span className="font-mono text-xs text-muted">{index + 1}.</span>{' '}
              <a href={`#${phase}`} className="text-accent underline underline-offset-4">
                {PHASE_LABELS[phase]}
              </a>{' '}
              <span className="text-muted">· {porFase.get(phase)?.length ?? 0} competencias</span>
            </li>
          ))}
        </ol>
      </nav>

      {PHASE_ORDER.map((phase, index) => {
        const competencias = porFase.get(phase) ?? [];

        return (
          <section key={phase} id={phase} className="scroll-mt-24 space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                <span className="font-mono text-sm text-muted">{index + 1}.</span>{' '}
                {PHASE_LABELS[phase]}
              </h2>
              <p className="text-sm text-muted">{INTRO[phase]}</p>
            </div>

            <ul className="space-y-2">
              {competencias.map((competency) => (
                <li
                  key={competency.id}
                  className="rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-accent/40"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <Link
                      href={`/c/${competency.id}`}
                      className="text-sm font-semibold hover:text-accent"
                    >
                      {competency.title}
                    </Link>
                    <span className="font-mono text-[10px] text-muted">nivel {competency.level}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{competency.claim}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <p>
          Para ver las dependencias reales, abre el{' '}
          <Link href="/mapa" className="text-accent underline underline-offset-4">
            mapa
          </Link>
          . Y si tu objetivo es concreto, la{' '}
          <Link href="/rutas" className="text-accent underline underline-offset-4">
            ruta hacia un objetivo
          </Link>{' '}
          calcula el camino mínimo desde donde estás.
        </p>
      </footer>
    </div>
  );
}
