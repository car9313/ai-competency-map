/**
 * Ordenación de niveles para reducir cruces de aristas.
 *
 * Es el heurístico de **baricentro** del método de Sugiyama: dentro de cada fila, un nodo
 * se coloca cerca de la media de la posición de sus vecinos en la fila contigua. Se hace
 * en pasadas alternas (hacia abajo con los padres, hacia arriba con los hijos) porque una
 * sola pasada mueve los cruces de sitio en lugar de eliminarlos.
 *
 * Es puro y determinista: mismo grafo, mismo dibujo, en cada build. No se busca el óptimo
 * (eso es NP-duro); se baja el número de cruces lo suficiente para que el grafo se lea.
 */

export interface LayoutEdge {
  from: string;
  to: string;
}

type Neighbours = ReadonlyMap<string, readonly string[]>;

function buildNeighbours(edges: readonly LayoutEdge[], key: 'from' | 'to', value: 'to' | 'from') {
  const result = new Map<string, string[]>();

  for (const edge of edges) {
    const k = edge[key];
    const v = edge[value];
    const list = result.get(k);

    if (list) {
      list.push(v);
    } else {
      result.set(k, [v]);
    }
  }

  return result;
}

function barycenterOrder(
  level: readonly string[],
  neighbours: Neighbours,
  positions: ReadonlyMap<string, number>,
): string[] {
  const scored = level.map((id, currentIndex) => {
    const related = (neighbours.get(id) ?? [])
      .map((id2) => positions.get(id2))
      .filter((position): position is number => position !== undefined);

    // Sin vecinos en la fila contigua no hay señal: el nodo conserva su sitio, pero con
    // medio punto de lastre para que ceda el paso a un nodo que sí tiene padres. Si no,
    // un nodo suelto en la columna 0 empata con el baricentro 0 y gana por orden de llegada,
    // dejando al nodo conectado lejos de su padre.
    const score =
      related.length > 0
        ? related.reduce((total, position) => total + position, 0) / related.length
        : currentIndex + 0.5;

    return { id, score, currentIndex };
  });

  // El desempate por índice hace el resultado estable: sin él, dos nodos con la misma
  // media podrían intercambiarse entre builds.
  scored.sort((a, b) => a.score - b.score || a.currentIndex - b.currentIndex);

  return scored.map((entry) => entry.id);
}

export function orderLevels(
  levels: readonly (readonly string[])[],
  edges: readonly LayoutEdge[],
  iterations = 4,
): string[][] {
  const parents = buildNeighbours(edges, 'to', 'from');
  const children = buildNeighbours(edges, 'from', 'to');

  const current: string[][] = levels.map((level) => [...level]);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let index = 1; index < current.length; index += 1) {
      const above = current[index - 1];
      const level = current[index];

      if (!above || !level) continue;

      const positions = new Map(above.map((id, position) => [id, position]));
      current[index] = barycenterOrder(level, parents, positions);
    }

    for (let index = current.length - 2; index >= 0; index -= 1) {
      const below = current[index + 1];
      const level = current[index];

      if (!below || !level) continue;

      const positions = new Map(below.map((id, position) => [id, position]));
      current[index] = barycenterOrder(level, children, positions);
    }
  }

  return current;
}

/**
 * Cuenta cruces entre aristas que unen filas contiguas.
 *
 * Existe para poder afirmar con una prueba que la ordenación mejora algo, en vez de
 * confiar en que "se ve mejor". Las aristas que saltan varios niveles se dibujan curvas
 * y no se cuentan: su cruce no depende del orden dentro de una fila.
 */
export function countCrossings(
  levels: readonly (readonly string[])[],
  edges: readonly LayoutEdge[],
): number {
  const positions = new Map<string, { level: number; index: number }>();

  levels.forEach((level, levelIndex) => {
    level.forEach((id, index) => {
      positions.set(id, { level: levelIndex, index });
    });
  });

  const adjacent = edges.flatMap((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);

    if (!from || !to || to.level !== from.level + 1) return [];

    return [{ from: from.index, to: to.index, level: from.level }];
  });

  let crossings = 0;

  for (let i = 0; i < adjacent.length; i += 1) {
    for (let j = i + 1; j < adjacent.length; j += 1) {
      const a = adjacent[i];
      const b = adjacent[j];

      if (!a || !b || a.level !== b.level) continue;

      if ((a.from - b.from) * (a.to - b.to) < 0) {
        crossings += 1;
      }
    }
  }

  return crossings;
}
