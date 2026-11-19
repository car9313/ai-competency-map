import { describe, expect, it } from 'vitest';
import { topologicalLevels } from './graph';

describe('topologicalLevels', () => {
  it('un nodo suelto es su propio nivel', () => {
    expect(topologicalLevels(['a'], [])).toEqual({ levels: [['a']], order: ['a'] });
  });

  it('una cadena produce un nivel por nodo', () => {
    const topology = topologicalLevels(
      ['a', 'b', 'c'],
      [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ],
    );

    expect(topology.levels).toEqual([['a'], ['b'], ['c']]);
    expect(topology.order).toEqual(['a', 'b', 'c']);
  });

  it('agrupa en el mismo nivel lo que no depende entre sí', () => {
    const topology = topologicalLevels(
      ['raiz', 'hijo1', 'hijo2'],
      [
        { from: 'raiz', to: 'hijo1' },
        { from: 'raiz', to: 'hijo2' },
      ],
    );

    expect(topology.levels).toEqual([['raiz'], ['hijo1', 'hijo2']]);
  });

  it('resuelve un rombo: los dos caminos convergen', () => {
    const topology = topologicalLevels(
      ['a', 'b', 'c', 'd'],
      [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'c' },
        { from: 'b', to: 'd' },
        { from: 'c', to: 'd' },
      ],
    );

    expect(topology.levels).toEqual([['a'], ['b', 'c'], ['d']]);
    expect(topology.order).toHaveLength(4);
  });

  it('respeta el orden de entrada dentro de cada nivel', () => {
    const topology = topologicalLevels(['z', 'y', 'x'], []);

    expect(topology.levels).toEqual([['z', 'y', 'x']]);
  });

  it('detecta un ciclo directo y nombra los nodos implicados', () => {
    expect(() =>
      topologicalLevels(
        ['a', 'b'],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'a' },
        ],
      ),
    ).toThrow(/ciclo entre: a, b/);
  });

  it('detecta un ciclo largo', () => {
    expect(() =>
      topologicalLevels(
        ['a', 'b', 'c'],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
          { from: 'c', to: 'a' },
        ],
      ),
    ).toThrow(/ciclo/);
  });

  it('rechaza un prerrequisito que apunta a un nodo desconocido', () => {
    expect(() => topologicalLevels(['a'], [{ from: 'a', to: 'fantasma' }])).toThrow(
      /Prerrequisito desconocido: "fantasma"/,
    );
    expect(() => topologicalLevels(['a'], [{ from: 'fantasma', to: 'a' }])).toThrow(
      /Prerrequisito desconocido: "fantasma"/,
    );
  });

  it('rechaza que una competencia sea su propio prerrequisito', () => {
    expect(() => topologicalLevels(['a'], [{ from: 'a', to: 'a' }])).toThrow(
      /no puede ser su propio prerrequisito/,
    );
  });

  it('rechaza identificadores duplicados', () => {
    expect(() => topologicalLevels(['a', 'a'], [])).toThrow(/duplicados/);
  });

  it('es determinista', () => {
    const ids = ['a', 'b', 'c'];
    const edges = [
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
    ];

    expect(topologicalLevels(ids, edges)).toEqual(topologicalLevels(ids, edges));
  });
});
