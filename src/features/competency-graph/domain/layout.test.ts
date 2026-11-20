import { describe, expect, it } from 'vitest';
import { countCrossings, orderLevels, type LayoutEdge } from './layout';

describe('orderLevels', () => {
  it('elimina un cruce simple reordenando la fila inferior', () => {
    const levels = [
      ['A', 'B'],
      ['X', 'Y'],
    ];
    const edges: LayoutEdge[] = [
      { from: 'A', to: 'Y' },
      { from: 'B', to: 'X' },
    ];

    expect(countCrossings(levels, edges)).toBe(1);

    const ordered = orderLevels(levels, edges);

    expect(countCrossings(ordered, edges)).toBe(0);
    expect(ordered[1]).toEqual(['Y', 'X']);
  });

  it('no toca el orden cuando el grafo ya está limpio', () => {
    const levels = [
      ['A', 'B'],
      ['X', 'Y'],
    ];
    const edges: LayoutEdge[] = [
      { from: 'A', to: 'X' },
      { from: 'B', to: 'Y' },
    ];

    expect(orderLevels(levels, edges)).toEqual([
      ['A', 'B'],
      ['X', 'Y'],
    ]);
  });

  it('deja quietos los nodos sin vecinos en la fila contigua', () => {
    const levels = [
      ['A'],
      ['Z', 'Y', 'X'],
    ];
    const edges: LayoutEdge[] = [{ from: 'A', to: 'X' }];

    const ordered = orderLevels(levels, edges);

    // X se acerca a A (columna 0) y los demás conservan su orden relativo.
    expect(ordered[1]).toEqual(['X', 'Z', 'Y']);
  });

  it('reduce los cruces en un abanico y no solo los desplaza', () => {
    const levels = [
      ['A', 'B', 'C'],
      ['X', 'Y', 'Z'],
    ];
    const edges: LayoutEdge[] = [
      { from: 'A', to: 'Z' },
      { from: 'B', to: 'Y' },
      { from: 'C', to: 'X' },
    ];

    const before = countCrossings(levels, edges);
    const after = countCrossings(orderLevels(levels, edges), edges);

    expect(before).toBe(3);
    expect(after).toBe(0);
  });

  it('es determinista: mismo grafo, mismo resultado', () => {
    const levels = [
      ['A', 'B', 'C'],
      ['X', 'Y', 'Z'],
    ];
    const edges: LayoutEdge[] = [
      { from: 'A', to: 'Y' },
      { from: 'B', to: 'Z' },
      { from: 'C', to: 'X' },
    ];

    expect(orderLevels(levels, edges)).toEqual(orderLevels(levels, edges));
  });

  it('no pierde ni duplica nodos', () => {
    const levels = [
      ['raiz'],
      ['a', 'b', 'c'],
      ['d', 'e'],
    ];
    const edges: LayoutEdge[] = [
      { from: 'raiz', to: 'a' },
      { from: 'raiz', to: 'b' },
      { from: 'a', to: 'd' },
      { from: 'c', to: 'e' },
    ];

    const ordered = orderLevels(levels, edges);

    expect(ordered.map((level) => level.length)).toEqual([1, 3, 2]);
    expect(new Set(ordered.flat()).size).toBe(6);
  });
});

describe('countCrossings', () => {
  it('no cuenta aristas que saltan mas de un nivel', () => {
    const levels = [['A'], ['B'], ['C']];
    const edges: LayoutEdge[] = [{ from: 'A', to: 'C' }];

    expect(countCrossings(levels, edges)).toBe(0);
  });

  it('cuenta cero cuando las aristas comparten origen', () => {
    const levels = [['A'], ['X', 'Y']];
    const edges: LayoutEdge[] = [
      { from: 'A', to: 'X' },
      { from: 'A', to: 'Y' },
    ];

    expect(countCrossings(levels, edges)).toBe(0);
  });
});
