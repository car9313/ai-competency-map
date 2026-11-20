import { describe, expect, it } from 'vitest';
import { labelLines } from './state-visual';

describe('labelLines', () => {
  it('deja en una línea los títulos cortos', () => {
    expect(labelLines('MCP y skills')).toEqual(['MCP y skills']);
  });

  it('parte por palabra sin cortar palabras', () => {
    const [first, second] = labelLines('Fronteras entre IA, ML y deep learning');

    expect(first).toBe('Fronteras entre');
    // La segunda línea también corta por palabra: «deep le…» no diría nada.
    expect(second).toBe('IA, ML y deep…');
    expect(first?.length).toBeLessThanOrEqual(17);
  });

  it('usa las dos líneas cuando el título no cabe en una', () => {
    expect(labelLines('Chunking y solapamiento')).toEqual(['Chunking y', 'solapamiento']);
  });

  it('no pierde el sentido del título en la primera línea', () => {
    const [first] = labelLines('Tokens y ventana de contexto');

    expect(first).toBe('Tokens y ventana');
  });

  it('corta una palabra que no cabe en una línea', () => {
    expect(labelLines('Supercalifragilisticoespialidoso')).toEqual(['Supercalifragili…']);
  });

  it('nunca devuelve más de dos líneas', () => {
    const lines = labelLines(
      'Un título deliberadamente larguísimo que no cabe ni en dos líneas de texto',
    );

    expect(lines.length).toBeLessThanOrEqual(2);
  });

  it('no añade puntos suspensivos si el texto cabe entero en dos líneas', () => {
    const lines = labelLines('Reutilización tras un fallo');

    expect(lines.join(' ')).toBe('Reutilización tras un fallo');
    expect(lines.some((line) => line.includes('…'))).toBe(false);
  });
});
