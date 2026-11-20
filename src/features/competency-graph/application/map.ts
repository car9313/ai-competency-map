/**
 * Modelo de lectura del mapa.
 *
 * Es una proyección pura: entra el grafo, los ítems y los intentos; sale lo que la
 * pantalla necesita dibujar. No calcula posiciones (eso es del componente), pero sí
 * decide qué se puede ver y en qué nivel va cada nodo.
 */
import { projectState, projectUnlocked, type CompetencyState } from '@/features/assessment';
import type { Attempt } from '@/features/assessment';
import type { Area, CompetencyRecord } from '@/features/content/domain/types';
import type { Clock } from '@/shared/time/clock';
import type { Difficulty, Item, Layer } from '@/shared/types/domain';
import { topologicalLevels } from '../domain/graph';
import { orderLevels } from '../domain/layout';
import type { Prerequisite } from '@/shared/types/domain';

/**
 * Lo que se dibuja en un nodo.
 *
 * `pending` es un estado propio: la competencia existe en el mapa pero todavía no
 * tiene contenido. No se confunde con `locked`, que sí podría abrirse si se cumplieran
 * sus prerrequisitos.
 */
export type NodeVisibility = 'pending' | 'locked' | 'available' | CompetencyState;

export interface MapNode {
  id: string;
  title: string;
  claim: string;
  areaId: string;
  /** Orden de recorrido dentro del grafo. La lista lo respeta: no es alfabético. */
  order: number;
  layer: Layer;
  level: Difficulty;
  published: boolean;
  state: CompetencyState;
  visibility: NodeVisibility;
  itemCount: number;
  prerequisiteIds: readonly string[];
}

export interface CompetencyMap {
  /** Nodos agrupados por nivel topológico. */
  levels: string[][];
  nodes: ReadonlyMap<string, MapNode>;
  areas: readonly Area[];
}

export interface MapInput {
  areas: readonly Area[];
  competencies: readonly CompetencyRecord[];
  items: readonly Item[];
  attempts: readonly Attempt[];
  clock: Clock;
}

export function prerequisitesOf(competencies: readonly CompetencyRecord[]): Prerequisite[] {
  return competencies.flatMap((competency) =>
    competency.prerequisites.map((from) => ({ from, to: competency.id })),
  );
}

export function buildCompetencyMap(input: MapInput): CompetencyMap {
  const { areas, competencies, items, attempts, clock } = input;

  const states = new Map<string, CompetencyState>();
  const itemCounts = new Map<string, number>();

  for (const competency of competencies) {
    const own = items.filter((item) => item.competencyId === competency.id);

    itemCounts.set(competency.id, own.length);
    states.set(competency.id, projectState(own, attempts, clock));
  }

  const edges = prerequisitesOf(competencies);
  const topology = topologicalLevels(
    competencies.map((competency) => competency.id),
    edges,
  );

  // Los niveles salen de Kahn en orden de declaración; el baricentro los reordena para
  // que las aristas crucen lo menos posible. Mismo grafo, mismo dibujo en cada build.
  const levels = orderLevels(topology.levels, edges);

  const nodes = new Map<string, MapNode>();

  for (const competency of competencies) {
    const state = states.get(competency.id) ?? 'no_evidence';
    const unlocked = projectUnlocked(competency.id, edges, states);

    let visibility: NodeVisibility;

    if (!competency.published) {
      visibility = 'pending';
    } else if (!unlocked) {
      visibility = 'locked';
    } else if (state === 'no_evidence') {
      visibility = 'available';
    } else {
      visibility = state;
    }

    nodes.set(competency.id, {
      id: competency.id,
      title: competency.title,
      claim: competency.claim,
      areaId: competency.areaId,
      order: competency.order,
      layer: competency.layer,
      level: competency.level,
      published: competency.published,
      state,
      visibility,
      itemCount: itemCounts.get(competency.id) ?? 0,
      prerequisiteIds: competency.prerequisites,
    });
  }

  return { levels, nodes, areas };
}

/** Agrupa los niveles por área para el dibujo: una columna por área, niveles dentro. */
export function nodesOfLevel(map: CompetencyMap, level: number): MapNode[] {
  const ids = map.levels[level] ?? [];

  return ids.map((id) => map.nodes.get(id)).filter((node): node is MapNode => node !== undefined);
}

/**
 * El camino activo: por dónde vas.
 *
 * Se calcula como la cadena de prerrequisitos hasta el **foco**, que es la primera
 * competencia publicada que está disponible (o en curso). Con historial vacío el foco
 * es la raíz, y por eso el camino resalta un solo nodo: es honesto, no un error.
 *
 * Este es el equivalente funcional al camino de Duolingo: no decora, informa de dónde
 * estás y de lo que ya recorriste.
 */
export interface ActiveTrail {
  /** La siguiente competencia por hacer, o `null` si no hay ninguna disponible. */
  focusId: string | null;
  /** Nodos que forman el camino, incluido el foco. */
  nodeIds: string[];
  /** Aristas del camino, como pares `[desde, hasta]`. */
  links: Array<[string, string]>;
}

const IN_PROGRESS: readonly NodeVisibility[] = ['available', 'learning', 'at_risk'];

export function activeTrail(map: CompetencyMap): ActiveTrail {
  const ordered = map.levels
    .flat()
    .map((id) => map.nodes.get(id))
    .filter((node): node is MapNode => node !== undefined);

  const focus =
    ordered
      .filter((node) => node.published && IN_PROGRESS.includes(node.visibility))
      // El foco se elige por el orden editorial del grafo, no por la posición en pantalla:
      // el baricentro puede mover un nodo de fila y eso no debe cambiar "por dónde vas".
      .sort((a, b) => a.order - b.order)[0] ?? null;

  if (!focus) {
    return { focusId: null, nodeIds: [], links: [] };
  }

  const trail = new Set<string>([focus.id]);
  const queue: string[] = [focus.id];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === undefined) {
      break;
    }

    const node = map.nodes.get(current);

    for (const prerequisiteId of node?.prerequisiteIds ?? []) {
      if (!trail.has(prerequisiteId)) {
        trail.add(prerequisiteId);
        queue.push(prerequisiteId);
      }
    }
  }

  const links: Array<[string, string]> = [];

  for (const id of trail) {
    const node = map.nodes.get(id);

    for (const prerequisiteId of node?.prerequisiteIds ?? []) {
      if (trail.has(prerequisiteId)) {
        links.push([prerequisiteId, id]);
      }
    }
  }

  return { focusId: focus.id, nodeIds: [...trail], links };
}
