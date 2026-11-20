import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CATALOG } from '@/content';
import { systemClock } from '@/shared/time/clock';
import { cn } from '@/shared/utils/cn';
import { activeTrail, buildCompetencyMap } from '../application/map';
import { MapDiagram } from './MapDiagram';
import { VISUAL } from './state-visual';
import { NodeStateChip } from './NodeStateChip';

/**
 * Contenido del mapa en dos vistas.
 *
 * Las pestañas son **rutas reales** (`/mapa` y `/mapa/tarjetas`), no estado en cliente.
 * Motivo: `useSearchParams` no existe durante la exportación estática, así que resolver
 * la pestaña con la URL habría vaciado el HTML del servidor. Con rutas, cada vista se
 * sirve completa y la navegación entre ellas es instantánea (es un enlace de Next).
 *
 * Las etiquetas de estado se calculan en build, y es correcto: `projectState` no depende
 * de la fecha, solo de los intentos. Cuando S5 añada persistencia, el estado por usuario
 * pasará a hidratarse en cliente sin cambiar esta estructura.
 */

export type MapView = 'mapa' | 'tarjetas';

const TABS: Array<{ id: MapView; href: string; label: string }> = [
  { id: 'mapa', href: '/mapa', label: 'Mapa' },
  { id: 'tarjetas', href: '/mapa/tarjetas', label: 'Tarjetas' },
];

export function MapContent({ view }: { view: MapView }) {
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

  /** Títulos de los prerrequisitos que todavía no tienen ninguna evidencia. */
  const unmetOf = (ids: readonly string[]): string[] =>
    ids
      .filter((id) => (map.nodes.get(id)?.state ?? 'no_evidence') === 'no_evidence')
      .map((id) => map.nodes.get(id)?.title ?? id);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mapa de competencias</h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          {map.nodes.size} competencias y sus prerrequisitos. {published.length} tienen contenido;
          las demás aparecen como próximas para que el mapa no mienta por omisión.
        </p>

        <nav aria-label="Vista del mapa">
          <ul className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <Link
                  href={tab.href}
                  aria-current={view === tab.id ? 'page' : undefined}
                  className={cn(
                    'block rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                    view === tab.id
                      ? 'bg-accent text-white'
                      : 'text-muted hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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

      {view === 'mapa' ? (
        <>
          {/* En móvil el grafo no se lee: 1112 px de viewBox en 343 px de ancho dejan el
              texto a 3 px. Mejor decirlo y ofrecer la vista que sí funciona. */}
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted md:hidden">
            En pantalla pequeña el grafo no se lee.{' '}
            <Link href="/mapa/tarjetas" className="text-accent underline underline-offset-4">
              Ver el roadmap en tarjetas
            </Link>
            .
          </div>

          <div className="hidden md:block">
            <Suspense fallback={<p className="text-sm text-muted">Cargando diagrama…</p>}>
          <MapDiagram
            levels={map.levels}
            nodes={[...map.nodes.values()].map((node) => ({
              id: node.id,
              title: node.title,
              claim: node.claim,
              areaId: node.areaId,
              layer: node.layer,
              visibility: node.visibility,
              published: node.published,
              prerequisiteIds: node.prerequisiteIds,
              unmetPrerequisites: unmetOf(node.prerequisiteIds),
            }))}
            focusId={trail.focusId}
            trailIds={trail.nodeIds}
            trailLinks={trail.links}
            areas={map.areas.map((area) => ({ id: area.id, index: area.index, name: area.name }))}
          />
            </Suspense>
          </div>
        </>
      ) : (
        <section aria-label="Competencias por área" className="grid gap-4 md:grid-cols-2">
          {map.areas.map((area) => {
            const nodes = [...map.nodes.values()]
              .filter((node) => node.areaId === area.id)
              .sort((a, b) => a.order - b.order);

            if (nodes.length === 0) return null;

            return (
              <div
                key={area.id}
                className="flex flex-col rounded-xl border border-border bg-surface"
              >
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
                    const clickable = node.published;

                    return (
                      <li key={node.id}>
                        <Link
                          href={clickable ? `/c/${node.id}` : '/mapa/tarjetas'}
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
                          <span className="mt-0.5 shrink-0">
                            <NodeStateChip
                              items={CATALOG.items.filter((item) => item.competencyId === node.id)}
                              fallbackLabel={visual.label}
                              fallbackFill={visual.fill}
                              fallbackStroke={visual.stroke}
                              locked={node.visibility === 'locked'}
                            />
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
      )}
    </div>
  );
}
