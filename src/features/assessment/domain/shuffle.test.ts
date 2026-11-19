import { describe, expect, it } from 'vitest';
import { hashSeed, mulberry32, shuffleOptionIds, shuffleWithSeed } from './shuffle';

const OPTIONS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
const ITEMS = ['a', 'b', 'c', 'd'] as const;

describe('shuffleWithSeed', () => {
  it('es determinista: la misma semilla da el mismo orden', () => {
    expect(shuffleWithSeed(ITEMS, 42)).toEqual(shuffleWithSeed(ITEMS, 42));
  });

  it('semillas distintas producen órdenes distintos', () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, index) => shuffleWithSeed(ITEMS, index).join('')),
    );

    expect(orders.size).toBeGreaterThan(1);
  });

  it('devuelve una permutación: mismos elementos, sin duplicados ni pérdidas', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const shuffled = shuffleWithSeed(ITEMS, seed);

      expect(shuffled).toHaveLength(ITEMS.length);
      expect([...shuffled].sort()).toEqual([...ITEMS].sort());
    }
  });

  it('no modifica la entrada', () => {
    const input = [...ITEMS];
    shuffleWithSeed(input, 7);

    expect(input).toEqual([...ITEMS]);
  });

  it('funciona con listas vacías o de un elemento', () => {
    expect(shuffleWithSeed([], 1)).toEqual([]);
    expect(shuffleWithSeed(['solo'], 1)).toEqual(['solo']);
  });

  it('reparte el orden: ninguna posición queda fija siempre', () => {
    const firstPositions = new Set(
      Array.from({ length: 30 }, (_, seed) => shuffleWithSeed(ITEMS, seed)[0]),
    );

    expect(firstPositions.size).toBeGreaterThan(1);
  });
});

describe('shuffleOptionIds', () => {
  it('baraja los ids de las opciones de forma reproducible', () => {
    const first = shuffleOptionIds(OPTIONS, 123);
    const second = shuffleOptionIds(OPTIONS, 123);

    expect(first).toEqual(second);
    expect([...first].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('mulberry32', () => {
  it('produce valores en [0, 1)', () => {
    const random = mulberry32(2026);

    for (let index = 0; index < 1000; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('es reproducible desde la misma semilla', () => {
    const a = mulberry32(7);
    const b = mulberry32(7);

    for (let index = 0; index < 10; index += 1) {
      expect(a()).toBe(b());
    }
  });

  it('no repite la misma secuencia con semillas distintas', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);

    expect(a()).not.toBe(b());
  });
});

describe('hashSeed', () => {
  it('es estable para el mismo texto', () => {
    expect(hashSeed('attempt-123')).toBe(hashSeed('attempt-123'));
  });

  it('devuelve un entero de 32 bits sin signo', () => {
    const seed = hashSeed('attempt-123');

    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });

  it('textos distintos suelen dar semillas distintas', () => {
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
  });
});
