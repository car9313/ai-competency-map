'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import type { NodeVisibility } from '../application/map';

/**
 * Diagrama vertical del grafo.
 *
 * Vertical a propósito: los niveles topológicos son filas, de arriba abajo, así que el
 * grafo aprovecha todo el ancho y se lee como un camino. Con columnas necesitaba 1548 px
 * y scroll horizontal; con filas cabe en pantalla.
 *
 * Los nodos son enlaces: si la competencia tiene contenido, se puede abrir. El SVG **no**
 * es `aria-hidden`, para que esos enlaces también sean alcanzables con teclado.
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

/**
 * Anchos medidos sobre el grafo real: 10 niveles y la fila más ancha tiene 8 nodos.
 * 8 × 124 + 120 = 1112 px, que cabe en el área de contenido sin scroll horizontal.
 */
const SLOT_WIDTH = 124;
const ROW_HEIGHT = 100;
const NODE_RADIUS = 11;
const LABEL_MAX_LENGTH = 16;
const SIDE_PADDING = 60;

export interface DiagramNode {
  id: string;
  title: string;
  areaId: string;
  layer: string;
  visibility: NodeVisibility;
  published: boolean;
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

  const maxRowWidth = Math.max(...levels.map((ids) => ids.length * SLOT_WIDTH), SLOT_WIDTH);
  const width = maxRowWidth + SIDE_PADDING * 2;
  const height = 60 + levels.length * ROW_HEIGHT + 40;

  const positions = useMemo(() => {
    const result = new Map<string, { x: number; y: number }>();
    const widest = Math.max(...levels.map((ids) => ids.length * SLOT_WIDTH), SLOT_WIDTH);

    levels.forEach((ids, rowIndex) => {
      // Cada fila se centra sobre el ancho TOTAL, no sobre el suyo: si no, las columnas
      // de una fila no caen bajo las de la anterior y las aristas cruzan sin sentido.
      const offset = (widest - ids.length * SLOT_WIDTH) / 2;

      ids.forEach((id, columnIndex) => {
        result.set(id, {
          x: SIDE_PADDING + offset + columnIndex * SLOT_WIDTH + SLOT_WIDTH / 2,
          y: 60 + rowIndex * ROW_HEIGHT,
        });
      });
    });

    return result;
  }, [levels]);

  const trailNodeSet = useMemo(() => new Set(trailIds), [trailIds]);
  const trailLinkSet = useMemo(
    () => new Set(trailLinks.map(([from, to]) => `${from}->${to}`)),
    [trailLinks],
  );

  const matches = (node: DiagramNode): boolean => {
    if (areaFilter && node.areaId !== areaFilter) return false;
    if (layerFilter && node.layer !== layerFilter) return false;
    if (stateFilter && node.visibility !== stateFilter) return false;
    return true;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-xl border border-border bg-surface p-4">
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
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto block max-w-full"
          role="group"
          aria-label="Grafo de competencias"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border)" />
            </marker>
            <marker
              id="arrow-trail"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
            </marker>
          </defs>

          {nodes.flatMap((node) =>
            node.prerequisiteIds.map((fromId) => {
              const from = positions.get(fromId);
              const to = positions.get(node.id);

              if (!from || !to) return null;

              const onTrail = trailLinkSet.has(`${fromId}->${node.id}`);
              const dimmed = !matches(node);
              const midY = (from.y + to.y) / 2;

              return (
                <path
                  key={`${fromId}-${node.id}`}
                  d={`M ${from.x} ${from.y + NODE_RADIUS + 14} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - NODE_RADIUS - 4}`}
                  fill="none"
                  stroke={onTrail ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={onTrail ? 2.5 : 1.5}
                  opacity={dimmed ? 0.12 : onTrail ? 0.9 : 0.5}
                  markerEnd={onTrail ? 'url(#arrow-trail)' : 'url(#arrow)'}
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
            const canOpen = node.published;
            const short =
              node.title.length > LABEL_MAX_LENGTH
                ? `${node.title.slice(0, LABEL_MAX_LENGTH - 1)}…`
                : node.title;

            const shape = (
              <>
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
                  y={position.y + NODE_RADIUS + 16}
                  textAnchor="middle"
                  fill={onTrail ? 'var(--text)' : 'var(--text-muted)'}
                  fontSize={10}
                  fontFamily="var(--font-sans)"
                >
                  {short}
                </text>
              </>
            );

            return (
              <g key={node.id} opacity={dimmed ? 0.18 : 1}>
                {canOpen ? (
                  <Link
                    href={`/c/${node.id}`}
                    className="cursor-pointer"
                    aria-label={`${node.title} — ${visual.label}`}
                  >
                    {shape}
                  </Link>
                ) : (
                  <g role="img" aria-label={`${node.title} — ${visual.label} (sin contenido)`}>
                    {shape}
                  </g>
                )}
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

        <p className="mt-2 text-[11px] text-muted">
          Los nodos con contenido son enlaces: pulsa uno para abrir su lección. Los nodos sin
          contenido aparecen como próximos.
        </p>
      </div>
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
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
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
