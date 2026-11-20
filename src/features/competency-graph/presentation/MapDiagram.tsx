'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { NodeVisibility } from '../application/map';
import { LEGEND_ORDER, VISUAL, labelLines } from './state-visual';

/**
 * Diagrama vertical del grafo.
 *
 * Vertical a propósito: los niveles topológicos son filas, de arriba abajo, así que el
 * grafo aprovecha todo el ancho y se lee como un camino.
 *
 * Zoom y paneo sin dependencias: se controla el `viewBox` del SVG. Cuesta unas 40 líneas
 * y ahorra los 86 KB de una librería de lienzo que además movería las posiciones al estado
 * del cliente (dejarían de ser deterministas).
 *
 * El SVG **no** es `aria-hidden`: los nodos con contenido son enlaces reales y se recorren
 * con teclado, igual que los botones de zoom.
 */

const SLOT_WIDTH = 124;
const ROW_HEIGHT = 100;
const NODE_RADIUS = 11;
const SIDE_PADDING = 60;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const DRAG_THRESHOLD = 3;

export interface DiagramNode {
  id: string;
  title: string;
  claim: string;
  areaId: string;
  layer: string;
  visibility: NodeVisibility;
  published: boolean;
  prerequisiteIds: readonly string[];
  /** Títulos de los prerrequisitos que aún no tienen evidencia. Alimenta el tooltip. */
  unmetPrerequisites: readonly string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement | null>(null);

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

  const rowOf = useMemo(() => {
    const result = new Map<string, number>();

    levels.forEach((ids, rowIndex) => ids.forEach((id) => result.set(id, rowIndex)));

    return result;
  }, [levels]);

  const maxRowWidth = Math.max(...levels.map((ids) => ids.length * SLOT_WIDTH), SLOT_WIDTH);
  const width = maxRowWidth + SIDE_PADDING * 2;
  const height = 60 + levels.length * ROW_HEIGHT + 40;

  const viewWidth = width / zoom;
  const viewHeight = height / zoom;
  const viewX = (width - viewWidth) / 2 + pan.x;
  const viewY = (height - viewHeight) / 2 + pan.y;

  const trailNodeSet = useMemo(() => new Set(trailIds), [trailIds]);
  const trailLinkSet = useMemo(
    () => new Set(trailLinks.map(([from, to]) => `${from}->${to}`)),
    [trailLinks],
  );

  /** El nodo bajo el cursor y sus vecinos directos: sin esto, un grafo denso no se lee. */
  const related = useMemo(() => {
    if (!hovered) return null;

    const set = new Set<string>([hovered]);
    const node = nodes.find((entry) => entry.id === hovered);

    node?.prerequisiteIds.forEach((id) => set.add(id));
    nodes.forEach((entry) => {
      if (entry.prerequisiteIds.includes(hovered)) set.add(entry.id);
    });

    return set;
  }, [hovered, nodes]);

  useEffect(() => {
    const element = svgRef.current;

    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((current) => clamp(current * (event.deltaY < 0 ? 1.12 : 0.89), MIN_ZOOM, MAX_ZOOM));
    };

    element.addEventListener('wheel', onWheel, { passive: false });

    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  const matches = (node: DiagramNode): boolean => {
    if (areaFilter && node.areaId !== areaFilter) return false;
    if (layerFilter && node.layer !== layerFilter) return false;
    if (stateFilter && node.visibility !== stateFilter) return false;
    return true;
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const state = drag.current;
    const element = svgRef.current;

    if (!state || !element) return;

    const rect = element.getBoundingClientRect();
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      state.moved = true;
    }

    if (!state.moved) return;

    const scaleX = viewWidth / rect.width;
    const scaleY = viewHeight / rect.height;

    setPan({
      x: clamp(state.panX - dx * scaleX, -width / 2, width / 2),
      y: clamp(state.panY - dy * scaleY, -height / 2, height / 2),
    });
  };

  const onPointerUp = () => {
    // Se limpia en el siguiente tick para que el click del enlace alcance a ver `moved`.
    window.setTimeout(() => {
      drag.current = null;
    }, 0);
  };

  const suppressClickAfterDrag = (event: React.MouseEvent) => {
    if (drag.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /**
   * Tooltip de verdad, no `title` nativo: aparece al instante, sigue al nodo y muestra lo
   * que la etiqueta no cabe (título completo, qué demuestra, estado y previos pendientes).
   *
   * Se calcula la posición desde el `getBoundingClientRect` del nodo, así funciona igual
   * con ratón y con teclado —al enfocar un enlace no hay cursor del que tirar—.
   */
  const showTip = (id: string, event: React.SyntheticEvent<Element>) => {
    setHovered(id);

    const base = cardRef.current?.getBoundingClientRect();
    const target = event.currentTarget as Element;

    if (!base) return;

    const rect = target.getBoundingClientRect();

    setTip({ id, x: rect.left + rect.width / 2 - base.left, y: rect.top - base.top });
  };

  const hideTip = () => {
    setHovered(null);
    setTip(null);
  };

  const tipNode = tip ? nodes.find((node) => node.id === tip.id) : undefined;

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

      <div ref={cardRef} className="relative rounded-xl border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
          <p className="font-mono text-[10px] text-muted">
            Arrastra para mover · rueda para acercar · {Math.round(zoom * 100)}%
          </p>

          <div className="flex items-center gap-1">
            <ZoomButton
              label="Alejar"
              onClick={() => setZoom((current) => clamp(current * 0.85, MIN_ZOOM, MAX_ZOOM))}
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </ZoomButton>
            <ZoomButton
              label="Acercar"
              onClick={() => setZoom((current) => clamp(current * 1.18, MIN_ZOOM, MAX_ZOOM))}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </ZoomButton>
            <ZoomButton
              label="Ver el grafo completo"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </ZoomButton>
          </div>
        </div>

        <div className="overflow-hidden p-2">
          <svg
            ref={svgRef}
            viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
            /* El cursor lo resuelve CSS (`active:`) y no un ref: leer `drag.current` durante
               el render es exactamente lo que la regla de hooks prohíbe. */
            /* Sin tope de altura: al encajar 1100 px de grafo en 70 vh el texto caía a 6 px.
               Aquí manda la legibilidad; para ver el conjunto están el zoom y el arrastre. */
            className="block h-auto w-full cursor-grab touch-none select-none active:cursor-grabbing"
            role="group"
            aria-label="Grafo de competencias. Arrastra para mover y usa los botones para acercar."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClickCapture={suppressClickAfterDrag}
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
                const faded = related !== null && !(related.has(fromId) && related.has(node.id));
                const midY = (from.y + to.y) / 2;

                return (
                  <path
                    key={`${fromId}-${node.id}`}
                    d={`M ${from.x} ${from.y + NODE_RADIUS + 14} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - NODE_RADIUS - 4}`}
                    fill="none"
                    stroke={onTrail ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth={onTrail ? 2.5 : 1.5}
                    opacity={dimmed || faded ? 0.1 : onTrail ? 0.9 : 0.5}
                    markerEnd={onTrail ? 'url(#arrow-trail)' : 'url(#arrow)'}
                    pathLength={onTrail ? 1 : undefined}
                    className={cn('acm-edge', onTrail && 'acm-draw')}
                  />
                );
              }),
            )}

            {nodes.map((node) => {
              const position = positions.get(node.id);

              if (!position) return null;

              const visual = VISUAL[node.visibility];
              const dimmed = !matches(node);
              const faded = related !== null && !related.has(node.id);
              const onTrail = trailNodeSet.has(node.id);
              const isFocus = node.id === focusId;
              const canOpen = node.published;
              const row = rowOf.get(node.id) ?? 0;
              const lines = labelLines(node.title);

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
                      className="acm-pulse"
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
                    className="acm-node"
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
                    {lines.map((line, index) => (
                      <tspan key={line} x={position.x} dy={index === 0 ? 0 : 11}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </>
              );

              const opacity = dimmed ? 0.18 : faded ? 0.3 : 1;

              return (
                <g
                  key={node.id}
                  opacity={opacity}
                  className="acm-row"
                  style={{ animationDelay: `${row * 45}ms` }}
                  onPointerEnter={(event) => showTip(node.id, event)}
                  onPointerLeave={hideTip}
                >
                  {canOpen ? (
                    <Link
                      href={`/c/${node.id}`}
                      className="cursor-pointer"
                      aria-label={`${node.title} — ${visual.label}`}
                      onFocus={(event) => showTip(node.id, event)}
                      onBlur={hideTip}
                    >
                      {shape}
                    </Link>
                  ) : (
                    <g
                      role="img"
                      aria-label={`${node.title} — ${visual.label} (sin contenido)`}
                      onFocus={(event) => showTip(node.id, event)}
                      onBlur={hideTip}
                    >
                      {shape}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Tooltip propio: instantáneo, accesible por teclado y con lo que la etiqueta no cabe. */}
        {tip && tipNode && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-30 w-64 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-surface-2 px-3 py-2 shadow-xl"
            style={{ left: tip.x, top: tip.y - 14 }}
          >
            <p className="text-xs font-semibold text-fg">{tipNode.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted">{tipNode.claim}</p>
            <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-muted">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: VISUAL[tipNode.visibility].fill,
                  border: `1px solid ${VISUAL[tipNode.visibility].stroke}`,
                }}
              />
              {VISUAL[tipNode.visibility].label}
            </p>
            {tipNode.unmetPrerequisites.length > 0 && (
              <p className="mt-1.5 border-t border-border pt-1.5 text-[10px] leading-snug text-muted">
                Te falta: {tipNode.unmetPrerequisites.join(' · ')}
              </p>
            )}
          </div>
        )}

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 font-mono text-[10px] text-muted">
          {LEGEND_ORDER.map((visibility) => (
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
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-muted">
        Los nodos con contenido son enlaces: pulsa uno para abrir su lección. Al pasar el cursor
        sobre un nodo se resaltan sus prerrequisitos y sus dependencias, y el tooltip muestra el
        título completo y lo que falta para poder comprobarlo.
      </p>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-accent"
    >
      {children}
    </button>
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
