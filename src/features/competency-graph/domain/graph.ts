/**
 * Topología del grafo de competencias.
 *
 * Un solo algoritmo sirve a dos propósitos: dar niveles al dibujo del mapa y validar el
 * invariante I1 (el grafo no tiene ciclos). Si hay ciclo, falla el mapa y falla el linter
 * de contenido en el mismo punto, que es lo que se quiere.
 */
import type { Prerequisite } from '@/shared/types/domain';

export interface GraphTopology {
  /** Nodos agrupados por nivel. El nivel 0 no tiene prerrequisitos dentro del grafo. */
  levels: string[][];
  /** Orden topológico plano: los niveles concatenados. */
  order: string[];
}

export function topologicalLevels(
  competencyIds: readonly string[],
  prerequisites: readonly Prerequisite[],
): GraphTopology {
  const ids = new Set(competencyIds);

  if (ids.size !== competencyIds.length) {
    throw new Error('Hay identificadores de competencia duplicados');
  }

  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const id of competencyIds) {
    outgoing.set(id, []);
    indegree.set(id, 0);
  }

  for (const edge of prerequisites) {
    if (!ids.has(edge.from)) {
      throw new Error(`Prerrequisito desconocido: "${edge.from}"`);
    }

    if (!ids.has(edge.to)) {
      throw new Error(`Prerrequisito desconocido: "${edge.to}"`);
    }

    if (edge.from === edge.to) {
      throw new Error(`Una competencia no puede ser su propio prerrequisito: "${edge.from}"`);
    }

    outgoing.get(edge.from)?.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const levels: string[][] = [];
  const processed = new Set<string>();

  // El orden del nivel sigue el orden de entrada: el mapa se dibuja igual en cada build.
  let frontier = competencyIds.filter((id) => (indegree.get(id) ?? 0) === 0);

  while (frontier.length > 0) {
    levels.push([...frontier]);

    const next: string[] = [];

    for (const id of frontier) {
      processed.add(id);

      for (const target of outgoing.get(id) ?? []) {
        const remaining = (indegree.get(target) ?? 0) - 1;
        indegree.set(target, remaining);

        if (remaining === 0) {
          next.push(target);
        }
      }
    }

    frontier = competencyIds.filter((id) => next.includes(id));
  }

  if (processed.size !== competencyIds.length) {
    const blocked = competencyIds.filter((id) => !processed.has(id));

    throw new Error(`El grafo tiene un ciclo entre: ${blocked.join(', ')}`);
  }

  return { levels, order: levels.flat() };
}
