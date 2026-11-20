import { describe, expect, it } from 'vitest';
import type { Attempt } from '../domain/types';
import {
  PROGRESS_KIND,
  PROGRESS_VERSION,
  parseProgressFile,
  serializeProgress,
} from './progress-file';

function attempt(id: string): Attempt {
  return {
    id,
    deviceId: 'device-1',
    itemId: 'item-1',
    answeredAt: '2026-11-19T10:00:00.000Z',
    selectedOptionId: 'opt-1',
    correct: false,
    confidence: 'doubtful',
    presentedOptionIds: ['opt-2', 'opt-1'],
    durationMs: 7100,
  };
}

const NOW = '2026-11-20T09:00:00.000Z';

describe('exportar e importar', () => {
  it('ida y vuelta: lo exportado se puede volver a importar igual', () => {
    const original = [attempt('a1'), attempt('a2')];
    const result = parseProgressFile(serializeProgress(original, NOW));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.attempts).toEqual(original);
  });

  it('el sobre lleva tipo y versión', () => {
    const file = JSON.parse(serializeProgress([attempt('a1')], NOW));

    expect(file.kind).toBe(PROGRESS_KIND);
    expect(file.version).toBe(PROGRESS_VERSION);
    expect(file.exportedAt).toBe(NOW);
  });

  it('el archivo contiene SOLO intentos (I15)', () => {
    const file = JSON.parse(serializeProgress([attempt('a1')], NOW)) as Record<string, unknown>;

    expect(Object.keys(file).sort()).toEqual(['attempts', 'exportedAt', 'kind', 'version']);
  });

  it('rechaza JSON inválido', () => {
    expect(parseProgressFile('{no es json')).toEqual({
      ok: false,
      reason: 'El archivo no es JSON válido.',
    });
  });

  it('rechaza un archivo que no es de esta app', () => {
    const result = parseProgressFile(JSON.stringify({ kind: 'otra.cosa', version: 1 }));

    expect(result.ok).toBe(false);
  });

  it('rechaza una versión que no sabe leer', () => {
    const result = parseProgressFile(
      JSON.stringify({ kind: PROGRESS_KIND, version: 99, attempts: [attempt('a1')] }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('99');
  });

  it('ignora intentos corruptos pero conserva los buenos', () => {
    const result = parseProgressFile(
      JSON.stringify({
        kind: PROGRESS_KIND,
        version: PROGRESS_VERSION,
        exportedAt: NOW,
        attempts: [attempt('a1'), { id: 'roto' }],
      }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.attempts.map((entry) => entry.id)).toEqual(['a1']);
  });

  it('rechaza un archivo sin intentos válidos', () => {
    const result = parseProgressFile(
      JSON.stringify({ kind: PROGRESS_KIND, version: PROGRESS_VERSION, attempts: [] }),
    );

    expect(result.ok).toBe(false);
  });
});
