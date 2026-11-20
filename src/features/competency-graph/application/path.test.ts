import { describe, expect, it } from 'vitest';
import type { CompetencyRecord } from '@/features/content/domain/types';
import { prerequisiteClosure } from './path';

function competency(id: string, prerequisites: string[] = [], order = 0): CompetencyRecord {
  return {
    id,
    areaId: 'area-1',
    order,
    layer: 'nucleo',
    level: 1,
    title: id,
    claim: '',
    prerequisites,
    published: true,
  };
}

const CATALOG = [
  competency('raiz', [], 1),
  competency('media', ['raiz'], 2),
  competency('objetivo', ['media'], 3),
  competency('otra', ['raiz'], 4),
];

describe('prerequisiteClosure', () => {
  it('incluye los prerrequisitos en orden y deja el objetivo al final', () => {
    const camino = prerequisiteClosure('objetivo', CATALOG);

    expect(camino.map((nodo) => nodo.id)).toEqual(['raiz', 'media', 'objetivo']);
  });

  it('no incluye competencias que no están en el camino', () => {
    const camino = prerequisiteClosure('objetivo', CATALOG);

    expect(camino.some((nodo) => nodo.id === 'otra')).toBe(false);
  });

  it('un objetivo sin prerrequisitos devuelve solo ese nodo', () => {
    const camino = prerequisiteClosure('raiz', CATALOG);

    expect(camino.map((nodo) => nodo.id)).toEqual(['raiz']);
  });

  it('con varios prerrequisitos los ordena por orden de catálogo', () => {
    const catalogo = [
      competency('a', [], 10),
      competency('b', [], 20),
      competency('objetivo', ['b', 'a'], 30),
    ];

    expect(prerequisiteClosure('objetivo', catalogo).map((nodo) => nodo.id)).toEqual([
      'a',
      'b',
      'objetivo',
    ]);
  });

  it('un identificador desconocido no rompe: devuelve vacío', () => {
    expect(prerequisiteClosure('noexiste', CATALOG)).toEqual([]);
  });

  it('no repite nodos cuando el grafo tiene diamante', () => {
    const catalogo = [
      competency('raiz', [], 1),
      competency('izq', ['raiz'], 2),
      competency('der', ['raiz'], 3),
      competency('objetivo', ['izq', 'der'], 4),
    ];

    const camino = prerequisiteClosure('objetivo', catalogo).map((nodo) => nodo.id);

    expect(camino).toHaveLength(4);
    expect(new Set(camino).size).toBe(4);
    expect(camino[camino.length - 1]).toBe('objetivo');
  });
});
