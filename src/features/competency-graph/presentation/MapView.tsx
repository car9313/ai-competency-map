'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buildCompetencyMap, type MapNode, type NodeVisibility } from '../application/map';
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
        result.set(id, {
          x: 80 + levelIndex * COLUMN_WIDTH,
          y: 44 + rowIndex * ROW_HEIGHT,
        });
      });
    });

    return result;
  }, [map]);

  const maxRows = Math.max(...map.levels.map((ids) => ids.length), 1);
  // El ancho incluye un margen derecho: sin él, las etiquetas de la última columna se cortan.
  const width = 80 + map.levels.length * COLUMN_WIDTH + 60;
  const height = 44 + maxRows * ROW_HEIGHT + 24;

  const visible = [...map.nodes.values()].filter(matches);
  const published = [...map.nodes.values()].filter((node) => node.published);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mapa de competencias</h1>
        <p className="max-w-2xl text-muted">
          {map.nodes.size} competencias y sus prerrequisitos. {published.length} tienen contenido;
          las demás aparecen como próximas para que el mapa no mienta por omisión.
        </p>
      </header>

      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
        <FilterGroup
          label="Área"
          current={areaFilter}
          options={map.areas.map((area) => ({ value: area.id, label: `${area.index} ${area.name}` }))}
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

      <section
        aria-label="Diagrama del grafo"
        className="overflow-x-auto rounded-xl border border-border bg-surface p-4"
      >
        <svg
          width={width}
          height={height}
          role="presentation"
          aria-hidden="true"
          className="max-w-none"
        >
          {[...map.nodes.values()].flatMap((node) =>
            node.prerequisiteIds.map((fromId) => {
              const from = positions.get(fromId);
              const to = positions.get(node.id);

              if (!from || !to) return null;

              return (
                <path
                  key={`${fromId}-${node.id}`}
                  d={`M ${from.x + NODE_RADIUS} ${from.y} C ${from.x + 60} ${from.y}, ${to.x - 60} ${to.y}, ${to.x - NODE_RADIUS} ${to.y}`}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth={1.5}
                />
              );
            }),
          )}

          {[...map.nodes.values()].map((node) => {
            const position = positions.get(node.id);

            if (!position) return null;

            const visual = VISUAL[node.visibility];
            const dimmed = !matches(node);
            const short =
              node.title.length > LABEL_MAX_LENGTH
                ? `${node.title.slice(0, LABEL_MAX_LENGTH - 1)}…`
                : node.title;

            return (
              <g key={node.id} opacity={dimmed ? 0.2 : 1}>
                <title>{`${node.title} — ${visual.label}`}</title>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={NODE_RADIUS}
                  fill={visual.fill}
                  stroke={visual.stroke}
                  strokeWidth={2}
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
                {/* Etiqueta centrada DEBAJO del nodo: a la derecha se solapaba con la columna siguiente. */}
                <text
                  x={position.x}
                  y={position.y + NODE_RADIUS + 15}
                  textAnchor="middle"
                  fill="var(--text)"
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

      <section aria-label="Lista de competencias" className="space-y-6">
        {map.areas.map((area) => {
          const nodes = visible.filter((node) => node.areaId === area.id);

          if (nodes.length === 0) return null;

          return (
            <div key={area.id} className="space-y-2">
              <h2 className="font-mono text-xs tracking-wide text-muted uppercase">
                {area.index} · {area.name}
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {nodes.map((node) => {
                  const visual = VISUAL[node.visibility];

                  return (
                    <li key={node.id}>
                      <Link
                        href={node.visibility === 'pending' ? '/mapa' : `/c/${node.id}`}
                        aria-disabled={node.visibility === 'pending'}
                        className={cn(
                          'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors',
                          node.visibility === 'pending'
                            ? 'cursor-default opacity-60'
                            : 'hover:bg-surface-2',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{node.title}</span>
                          <span className="block truncate text-xs text-muted">{node.claim}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-muted">
                          <span
                            aria-hidden="true"
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: visual.fill,
                              border: `1px solid ${visual.stroke}`,
                            }}
                          />
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

  const hrefFor = (value: string | null): string => {
    const next = new URLSearchParams(params.toString());

    if (value === null) {
      next.delete(keyOf(label));
    } else {
      next.set(keyOf(label), value);
    }

    const query = next.toString();

    return query.length > 0 ? `/mapa?${query}` : '/mapa';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] tracking-wide text-muted uppercase">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={hrefFor(null)}
          className={chipClass(current === null)}
          aria-current={current === null}
        >
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

function keyOf(label: string): string {
  if (label === 'Área') return 'area';
  if (label === 'Capa') return 'capa';
  return 'estado';
}

function chipClass(active: boolean): string {
  return cn(
    'rounded-full border px-2.5 py-1 text-xs transition-colors',
    active
      ? 'border-accent bg-accent text-white'
      : 'border-border bg-surface text-muted hover:text-fg',
  );
}
