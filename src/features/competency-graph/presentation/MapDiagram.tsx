'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import type { NodeVisibility } from '../application/map';

/**
 * Diagrama del grafo con filtros.
 *
 * Es una isla cliente a propósito: `useSearchParams` no existe durante la exportación
 * estática, así que si esto se renderizara en el servidor el HTML saldría vacío. El
 * contenido del mapa (el listado completo) se sirve estático desde el servidor; esto es
 * solo la representación visual, que además es `aria-hidden` y decorativa.
 *
 * Los filtros afectan **al diagrama**. El listado completo siempre está visible.
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

const COLUMN_WIDTH = 172;
const ROW_HEIGHT = 66;
const NODE_RADIUS = 11;
const LABEL_MAX_LENGTH = 20;

export interface DiagramNode {
  id: string;
  title: string;
  areaId: string;
  layer: string;
  visibility: NodeVisibility;
  prerequisiteIds: readonly string[];
}

export function MapDiagram({
  levels,
  nodes,
  focusId,
  trailIds,
  trailLinks,
  areas,
}: {
  levels: string[][];
  nodes: DiagramNode[];
  focusId: string | null;
  trailIds: string[];
  trailLinks: Array<[string, string]>;
  areas: Array<{ id: string; index: string; name: string }>;
}) {
  const params = useSearchParams();

  const areaFilter = params.get('area');
  const layerFilter = params.get('capa');
  const stateFilter = params.get('estado');

  const positions = useMemo(() => {
    const result = new Map<string, { x: number; y: number }>();

    levels.forEach((ids, levelIndex) => {
      ids.forEach((id, rowIndex) => {
        result.set(id, { x: 80 + levelIndex * COLUMN_WIDTH, y: 44 + rowIndex * ROW_HEIGHT });
      });
    });

    return result;
  }, [levels]);

  const trailNodeSet = useMemo(() => new Set(trailIds), [trailIds]);
  const trailLinkSet = useMemo(
    () => new Set(trailLinks.map(([from, to]) => `${from}->${to}`)),
    [trailLinks],
  );

  const maxRows = Math.max(...levels.map((ids) => ids.length), 1);
  const width = 80 + levels.length * COLUMN_WIDTH + 60;
  const height = 44 + maxRows * ROW_HEIGHT + 24;

  const matches = (node: DiagramNode): boolean => {
    if (areaFilter && node.areaId !== areaFilter) return false;
    if (layerFilter && node.layer !== layerFilter) return false;
    if (stateFilter && node.visibility !== stateFilter) return false;
    return true;
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
        <FilterGroup
          label="Área"
          current={areaFilter}
          options={areas.map((area) => ({ value: area.id, label: `${area.index} ${area.name}` }))}
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

      <div className="overflow-x-auto rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 font-mono text-[10px] text-muted">
          El grafo se lee de izquierda a derecha y se desplaza en horizontal.
        </p>
        <svg width={width} height={height} aria-hidden="true" className="max-w-none">
          {nodes.flatMap((node) =>
            node.prerequisiteIds.map((fromId) => {
              const from = positions.get(fromId);
              const to = positions.get(node.id);

              if (!from || !to) return null;

              const onTrail = trailLinkSet.has(`${fromId}->${node.id}`);
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

          {nodes.map((node) => {
            const position = positions.get(node.id);

            if (!position) return null;

            const visual = VISUAL[node.visibility];
            const dimmed = !matches(node);
            const onTrail = trailNodeSet.has(node.id);
            const isFocus = node.id === focusId;
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
      </div>
    </section>
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

function chipClass(active: boolean): string {
  return cn(
    'rounded-full border px-2.5 py-1 text-xs transition-colors',
    active
      ? 'border-accent bg-accent text-white'
      : 'border-border bg-surface text-muted hover:text-fg',
  );
}
