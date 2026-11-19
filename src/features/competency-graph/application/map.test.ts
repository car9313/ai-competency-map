import { describe, expect, it } from 'vitest';
import type { Attempt } from '@/features/assessment';
import type { CompetencyRecord } from '@/features/content/domain/types';
import { fixedClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { activeTrail, buildCompetencyMap } from './map';

const clock = fixedClock('2026-11-19');

function competency(overrides: Partial<CompetencyRecord> & { id: string }): CompetencyRecord {
  return {
    areaId: 'area-uno',
    order: 1,
    layer: 'nucleo',
    level: 1,
    title: `Competencia ${overrides.id}`,
    claim: 'Descripción de la competencia de prueba para el mapa.',
    prerequisites: [],
    published: true,
    ...overrides,
  };
}

function item(id: string, competencyId: string): Item {
  return {
    id,
    competencyId,
    difficulty: 1,
    prompt: '¿Pregunta de prueba?',
    options: [
      { id: 'a', text: 'Correcta', correct: true, rationale: 'Motivo suficientemente largo.' },
      { id: 'b', text: 'Incorrecta', correct: false, rationale: 'Otro motivo suficientemente largo.' },
    ],
    explanation: 'Explicación con longitud suficiente para el modelo de datos.',
    referenceId: 'ref-uno',
  };
}

function attempt(itemId: string, id: string): Attempt {
  return {
    id,
    deviceId: 'device',
    itemId,
    answeredAt: '2026-11-19T10:00:00.000Z',
    selectedOptionId: 'a',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['a', 'b'],
    durationMs: 1000,
  };
}

const AREAS = [
  { id: 'area-uno', index: '01', name: 'Área uno', description: 'Descripción del área de prueba.' },
];

const COMPETENCIES: CompetencyRecord[] = [
  competency({ id: 'raiz', order: 1 }),
  competency({ id: 'media', order: 2, prerequisites: ['raiz'] }),
  competency({ id: 'final', order: 3, prerequisites: ['media'] }),
  competency({ id: 'sin-contenido', order: 4, prerequisites: [], published: false }),
];

const ITEMS: Item[] = [
  item('item-raiz', 'raiz'),
  item('item-media', 'media'),
  item('item-final', 'final'),
];

describe('buildCompetencyMap', () => {
  it('sin evidencia solo la raíz está disponible', () => {
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts: [], clock });

    expect(map.nodes.get('raiz')?.visibility).toBe('available');
    expect(map.nodes.get('media')?.visibility).toBe('locked');
    expect(map.nodes.get('final')?.visibility).toBe('locked');
  });

  it('una competencia no publicada se muestra como pendiente, no como bloqueada', () => {
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts: [], clock });

    expect(map.nodes.get('sin-contenido')?.visibility).toBe('pending');
  });

  it('la evidencia desbloquea la siguiente y consolida la anterior', () => {
    const attempts = [attempt('item-raiz', 'a1')];
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts, clock });

    expect(map.nodes.get('raiz')?.visibility).toBe('consolidated');
    expect(map.nodes.get('media')?.visibility).toBe('available');
    expect(map.nodes.get('final')?.visibility).toBe('locked');
  });

  it('respeta los niveles topológicos del grafo', () => {
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts: [], clock });

    expect(map.levels[0]).toContain('raiz');
    expect(map.levels[1]).toContain('media');
    expect(map.levels[2]).toContain('final');
  });
});

describe('activeTrail', () => {
  it('sin evidencia, el foco es la raíz y el camino solo la contiene a ella', () => {
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts: [], clock });
    const trail = activeTrail(map);

    expect(trail.focusId).toBe('raiz');
    expect(trail.nodeIds).toEqual(['raiz']);
    expect(trail.links).toEqual([]);
  });

  it('al avanzar, el foco pasa al siguiente y el camino incluye lo recorrido', () => {
    const attempts = [attempt('item-raiz', 'a1')];
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts, clock });
    const trail = activeTrail(map);

    expect(trail.focusId).toBe('media');
    expect(new Set(trail.nodeIds)).toEqual(new Set(['media', 'raiz']));
    expect(trail.links).toEqual([['raiz', 'media']]);
  });

  it('el camino se acumula a lo largo de la cadena', () => {
    const attempts = [attempt('item-raiz', 'a1'), attempt('item-media', 'a2')];
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts, clock });
    const trail = activeTrail(map);

    expect(trail.focusId).toBe('final');
    expect(new Set(trail.nodeIds)).toEqual(new Set(['raiz', 'media', 'final']));
    expect(trail.links).toHaveLength(2);
  });

  it('sin foco disponible devuelve un camino vacío', () => {
    const allDone = [attempt('item-raiz', 'a1'), attempt('item-media', 'a2'), attempt('item-final', 'a3')];
    const map = buildCompetencyMap({ areas: AREAS, competencies: COMPETENCIES, items: ITEMS, attempts: allDone, clock });

    // Sin nodos disponibles ni en curso, no hay siguiente paso: mejor vacío que inventado.
    expect(activeTrail(map).focusId).toBeNull();
  });
});
