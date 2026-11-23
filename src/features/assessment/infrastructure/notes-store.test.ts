import { describe, expect, it } from 'vitest';
import { parseNotes } from './notes-store';

/**
 * La lectura es tolerante a propósito: lo guardado ayer puede tener otra forma, o haber
 * quedado a medias. Una nota corrupta se descarta y el resto se conserva.
 */
describe('parseNotes', () => {
  it('sin nada guardado devuelve un mapa vacío', () => {
    expect(parseNotes(null)).toEqual({});
    expect(parseNotes('')).toEqual({});
  });

  it('lee notas válidas', () => {
    const raw = JSON.stringify({
      'bounded-agent-loop': { text: 'El límite de pasos es el contrato.', updatedAt: '2026-11-20T10:00:00.000Z' },
    });

    expect(parseNotes(raw)).toEqual({
      'bounded-agent-loop': {
        text: 'El límite de pasos es el contrato.',
        updatedAt: '2026-11-20T10:00:00.000Z',
      },
    });
  });

  it('descarta las notas vacías: una nota borrada no debe reaparecer', () => {
    const raw = JSON.stringify({
      a: { text: '   ', updatedAt: '2026-11-20T10:00:00.000Z' },
      b: { text: 'algo', updatedAt: '2026-11-20T10:00:00.000Z' },
    });

    expect(Object.keys(parseNotes(raw))).toEqual(['b']);
  });

  it('devuelve un mapa vacío ante JSON inválido', () => {
    expect(parseNotes('{no es json')).toEqual({});
  });

  it('devuelve un mapa vacío si la forma no es la esperada', () => {
    expect(parseNotes('[]')).toEqual({});
    expect(parseNotes('"texto"')).toEqual({});
    expect(parseNotes(JSON.stringify({ a: { text: 42 } }))).toEqual({});
  });
});
