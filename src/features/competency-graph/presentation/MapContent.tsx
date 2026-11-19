import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { CATALOG } from '@/content';
import { systemClock } from '@/shared/time/clock';
import { cn } from '@/shared/utils/cn';
import { activeTrail, buildCompetencyMap, type NodeVisibility } from '../application/map';
import { MapDiagram } from './MapDiagram';

/**
 * Contenido del mapa, renderizado en el servidor.
 *
 * Aquí está la decisión importante de esta pantalla: **el listado completo se sirve como
 * HTML estático**. Solo el diagrama interactivo es una isla cliente, porque necesita los
 * filtros de la URL y `useSearchParams` no existe durante la exportación estática.
 *
 * Si todo fuera cliente, el HTML del mapa saldría vacío y se perdería justo lo que
 * justificó elegir Next.js: que cada competencia sea indexable y compartible.
 *
 * Las etiquetas de estado son fiables aunque se calculen en build: `projectState` no
 * depende de la fecha, solo de los intentos. Cuando S5 añada persistencia, el estado por
 * usuario pasará a hidratarse en cliente sin cambiar esta estructura.
 */

const VISUAL: Record<NodeVisibility, { fill: string; stroke: string; label: string }> = {
  pending: { fill: 'transparent', stroke: 'var(--border)', label: 'próximamente' },
  locked: { fill: 'var(--surface-2)', stroke: 'var(--border)', label: 'bloqueada' },
  available: { fill: 'var(--accent)', stroke: 'var(--accent)', label: 'disponible' },
  learning: { fill: '#f59e0b', stroke: '#f59e0b', label: 'en aprendizaje' },
  consolidated: { fill: '#10b981', stroke: '#10b981', label: 'consolidada' },
  at_risk: { fill: '#f43f5e', stroke: '#f43f5e', label: 'necesita repaso' },
  no_evidence: { fill: 'transparent', stroke: 'var(--border)', label: 'sin evidencia' },
};

export function MapContent() {
  const map = buildCompetencyMap({
    areas: CATALOG.areas,
    competencies: CATALOG.competencies,
    items: CATALOG.items,
    // La persistencia llega en S5: hoy no hay evidencia.
    attempts: [],
    clock: systemClock,
  });

  const trail = activeTrail(map);
  const trailIds = new Set(trail.nodeIds);
  const focus = trail.focusId ? map.nodes.get(trail.focusId) : undefined;
  const published = [...map.nodes.values()].filter((node) => node.published);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mapa de competencias</h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          {map.nodes.size} competencias y sus prerrequisitos. {published.length} tienen contenido;
          las demás aparecen como próximas para que el mapa no mienta por omisión.
        </p>
      </header>

      {focus && (
        <section className="rounded-2xl border border-accent/40 bg-surface p-5 sm:p-6">
          <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Tu siguiente paso
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{focus.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">{focus.claim}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/c/${focus.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Empezar
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="font-mono text-[11px] text-muted">
              {focus.layer} · nivel {focus.level} · {focus.itemCount} ítems
            </span>
          </div>

          {trail.nodeIds.length > 1 && (
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
              Camino recorrido: {trail.nodeIds.length - 1} competencia(s) previas de este nodo.
            </p>
          )}
        </section>
      )}

      {/* Solo el diagrama necesita cliente; el listado de abajo es HTML estático. */}
      <div className="hidden md:block">
        <Suspense fallback={<p className="text-sm text-muted">Cargando diagrama…</p>}>
          <MapDiagram
            levels={map.levels}
            nodes={[...map.nodes.values()].map((node) => ({
              id: node.id,
              title: node.title,
              areaId: node.areaId,
              layer: node.layer,
              visibility: node.visibility,
              prerequisiteIds: node.prerequisiteIds,
            }))}
            focusId={trail.focusId}
            trailIds={trail.nodeIds}
            trailLinks={trail.links}
            areas={map.areas.map((area) => ({
              id: area.id,
              index: area.index,
              name: area.name,
            }))}
          />
        </Suspense>
      </div>

      <section aria-label="Competencias por área" className="grid gap-4 md:grid-cols-2">
        {map.areas.map((area) => {
          const nodes = [...map.nodes.values()]
            .filter((node) => node.areaId === area.id)
            .sort((a, b) => a.order - b.order);

          if (nodes.length === 0) return null;

          return (
            <div key={area.id} className="flex flex-col rounded-xl border border-border bg-surface">
              <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold tracking-tight">
                  <span className="font-mono text-xs text-muted">{area.index}</span> · {area.name}
                </h2>
                <span className="font-mono text-[11px] text-muted">{nodes.length}</span>
              </div>

              <ul className="divide-y divide-border">
                {nodes.map((node) => {
                  const visual = VISUAL[node.visibility];
                  const onTrail = trailIds.has(node.id);
                  const clickable = node.visibility !== 'pending';

                  return (
                    <li key={node.id}>
                      <Link
                        href={clickable ? `/c/${node.id}` : '/mapa'}
                        aria-disabled={!clickable}
                        className={cn(
                          'flex items-start justify-between gap-3 px-4 py-3 transition-colors',
                          clickable ? 'hover:bg-surface-2' : 'cursor-default opacity-60',
                          onTrail && 'border-l-2 border-l-accent',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{node.title}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">
                            {node.claim}
                          </span>
                        </span>
                        <span className="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-muted">
                          {node.visibility === 'locked' ? (
                            <Lock className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: visual.fill,
                                border: `1px solid ${visual.stroke}`,
                              }}
                            />
                          )}
                          {visual.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
