'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import {
  activeTrail,
  buildCompetencyMap,
  type MapNode,
  type NodeVisibility,
} from '../application/map';
import { CATALOG } from '@/content';
import { systemClock } from '@/shared/time/clock';
import { cn } from '@/shared/utils/cn';

const VISUAL: Record<NodeVisibility, { fill: string; stroke: string; label: string }> = {
  pending: { fill: 'transparent', stroke: 'var(--border)', label: 'próximamente' },
  locked: { fill: 'var(--surface-2)', stroke: 'var(--border)', label: 'bloqueada' },
  available: { fill: 'var(--accent)', stroke: 'var(--accent)', label: 'disponible' },
  learning: { fill: '#f59e0b', stroke: '#f59e0b', label: 'en aprendizaje' },
  consolidated: { fill: '#10b981', stroke: '#10b981', label: 'consolidada' },
  at_risk: { fill: '#f43f5e', stroke: '#f43f5e', label: 'necesita repaso' },
  no_evidence: { fill: 'transparent', stroke: 'var(--border)', label: 'sin evidencia' },
};

const COLUMN_WIDTH = 172;
const ROW_HEIGHT = 66;
const NODE_RADIUS = 11;
const LABEL_MAX_LENGTH = 20;

export function MapView() {
  const params = useSearchParams();

  const areaFilter = params.get('area');
  const layerFilter = params.get('capa');
  const stateFilter = params.get('estado');

  const map = useMemo(
    () =>
      buildCompetencyMap({
        areas: CATALOG.areas,
        competencies: CATALOG.competencies,
        items: CATALOG.items,
        // La persistencia llega en S5: hoy no hay evidencia, y el mapa lo refleja.
        attempts: [],
        clock: systemClock,
      }),
    [],
  );

  const trail = useMemo(() => activeTrail(map), [map]);
  const trailNodes = useMemo(() => new Set(trail.nodeIds), [trail]);
  const trailLinks = useMemo(
    () => new Set(trail.links.map(([from, to]) => `${from}->${to}`)),
    [trail],
  );

  const focus = trail.focusId ? map.nodes.get(trail.focusId) : undefined;

  const matches = (node: MapNode): boolean => {
    if (areaFilter && node.areaId !== areaFilter) return false;
    if (layerFilter && node.layer !== layerFilter) return false;
    if (stateFilter && node.visibility !== stateFilter) return false;
    return true;
  };

  const positions = useMemo(() => {
    const result = new Map<string, { x: number; y: number }>();

    map.levels.forEach((ids, levelIndex) => {
      ids.forEach((id, rowIndex) => {
        result.set(id, { x: 80 + levelIndex * COLUMN_WIDTH, y: 44 + rowIndex * ROW_HEIGHT });
      });
    });

    return result;
  }, [map]);

  const maxRows = Math.max(...map.levels.map((ids) => ids.length), 1);
  const width = 80 + map.levels.length * COLUMN_WIDTH + 60;
  const height = 44 + maxRows * ROW_HEIGHT + 24;

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

      {/* ── Siguiente paso: el camino se resalta aquí y en el mapa ───────────── */}
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

      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
        <FilterGroup
          label="Área"
          current={areaFilter}
          options={map.areas.map((area) => ({
            value: area.id,
            label: `${area.index} ${area.name}`,
          }))}
        />
        <FilterGroup
          label="Capa"
          current={layerFilter}
          options={[
            { value: 'nucleo', label: 'núcleo' },
            { value: 'servicio', label: 'servicio' },
            { value: 'interfaz', label: 'interfaz' },
          ]}
        />
        <FilterGroup
          label="Estado"
          current={stateFilter}
          options={[
            { value: 'available', label: 'disponible' },
            { value: 'locked', label: 'bloqueada' },
            { value: 'pending', label: 'próximamente' },
          ]}
        />
      </div>

      {/* ── Diagrama: solo desde tablet, en móvil manda la lista ─────────────── */}
      <section
        aria-label="Diagrama del grafo"
        className="hidden overflow-x-auto rounded-xl border border-border bg-surface p-4 md:block"
      >
        <p className="mb-2 font-mono text-[10px] text-muted">
          El grafo se lee de izquierda a derecha y se desplaza en horizontal.
        </p>
        <svg width={width} height={height} aria-hidden="true" className="max-w-none">
          {[...map.nodes.values()].flatMap((node) =>
            node.prerequisiteIds.map((fromId) => {
              const from = positions.get(fromId);
              const to = positions.get(node.id);

              if (!from || !to) return null;

              const onTrail = trailLinks.has(`${fromId}->${node.id}`);
              const dimmed = !matches(node);

              return (
                <path
                  key={`${fromId}-${node.id}`}
                  d={`M ${from.x + NODE_RADIUS} ${from.y} C ${from.x + 60} ${from.y}, ${to.x - 60} ${to.y}, ${to.x - NODE_RADIUS} ${to.y}`}
                  fill="none"
                  stroke={onTrail ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={onTrail ? 2.5 : 1.5}
                  opacity={dimmed ? 0.15 : onTrail ? 0.9 : 0.55}
                />
              );
            }),
          )}

          {[...map.nodes.values()].map((node) => {
            const position = positions.get(node.id);

            if (!position) return null;

            const visual = VISUAL[node.visibility];
            const dimmed = !matches(node);
            const onTrail = trailNodes.has(node.id);
            const isFocus = node.id === trail.focusId;
            const short =
              node.title.length > LABEL_MAX_LENGTH
                ? `${node.title.slice(0, LABEL_MAX_LENGTH - 1)}…`
                : node.title;

            return (
              <g key={node.id} opacity={dimmed ? 0.18 : 1}>
                <title>{`${node.title} — ${visual.label}`}</title>
                {isFocus && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={NODE_RADIUS + 6}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={1.5}
                    opacity={0.5}
                  />
                )}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={NODE_RADIUS}
                  fill={visual.fill}
                  stroke={onTrail ? 'var(--accent)' : visual.stroke}
                  strokeWidth={onTrail ? 3 : 2}
                  strokeDasharray={node.visibility === 'pending' ? '3 3' : undefined}
                />
                {node.visibility === 'consolidated' && (
                  <path
                    d={`M ${position.x - 5} ${position.y} l 3.5 3.5 l 6 -7`}
                    fill="none"
                    stroke="var(--bg)"
                    strokeWidth={2}
                  />
                )}
                <text
                  x={position.x}
                  y={position.y + NODE_RADIUS + 15}
                  textAnchor="middle"
                  fill={onTrail ? 'var(--text)' : 'var(--text-muted)'}
                  fontSize={10}
                  fontFamily="var(--font-sans)"
                >
                  {short}
                </text>
              </g>
            );
          })}
        </svg>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 font-mono text-[10px] text-muted">
          {(['pending', 'locked', 'available', 'learning', 'consolidated', 'at_risk'] as const).map(
            (visibility) => (
              <li key={visibility} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: VISUAL[visibility].fill,
                    border: `1px solid ${VISUAL[visibility].stroke}`,
                  }}
                />
                {VISUAL[visibility].label}
              </li>
            ),
          )}
        </ul>
      </section>

      {/* ── Cards por área ───────────────────────────────────────────────────── */}
      <section aria-label="Competencias por área" className="grid gap-4 md:grid-cols-2">
        {map.areas.map((area) => {
          const nodes = [...map.nodes.values()]
            .filter((node) => node.areaId === area.id && matches(node))
            // Por orden de recorrido del grafo, no alfabético: el orden es información.
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
                  const onTrail = trailNodes.has(node.id);
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

function FilterGroup({
  label,
  current,
  options,
}: {
  label: string;
  current: string | null;
  options: Array<{ value: string; label: string }>;
}) {
  const params = useSearchParams();

  const key = label === 'Área' ? 'area' : label === 'Capa' ? 'capa' : 'estado';

  const hrefFor = (value: string | null): string => {
    const next = new URLSearchParams(params.toString());

    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    const query = next.toString();

    return query.length > 0 ? `/mapa?${query}` : '/mapa';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] tracking-wide text-muted uppercase">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={hrefFor(null)} className={chipClass(current === null)} aria-current={current === null}>
          todas
        </Link>
        {options.map((option) => (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            className={chipClass(current === option.value)}
            aria-current={current === option.value}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function chipClass(active: boolean): string {
  return cn(
    'rounded-full border px-2.5 py-1 text-xs transition-colors',
    active
      ? 'border-accent bg-accent text-white'
      : 'border-border bg-surface text-muted hover:text-fg',
  );
}
