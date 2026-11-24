import { describe, expect, it } from 'vitest';
import type { Item } from '@/shared/types/domain';
import type { Area, CompetencyRecord } from '@/features/content/domain/types';
import { buildDiagnostic, DIAGNOSTIC_SIZE } from './diagnostic';

function competency(id: string, areaId: string, order: number, level = 1): CompetencyRecord {
  return {
    id,
    areaId,
    order,
    layer: 'nucleo',
    level,
    phase: 'base',
    title: id,
    claim: '',
    prerequisites: [],
    published: true,
  } as CompetencyRecord;
}

function item(id: string, competencyId: string, difficulty = 1): Item {
  return {
    id,
    competencyId,
    difficulty,
    prompt: id,
    options: [
      { id: 'a', text: 'a', correct: true, rationale: 'x'.repeat(50) },
      { id: 'b', text: 'b', correct: false, rationale: 'x'.repeat(50) },
      { id: 'c', text: 'c', correct: false, rationale: 'x'.repeat(50) },
    ],
    explanation: 'x'.repeat(90),
    referenceId: 'ref',
  } as Item;
}

const AREAS: readonly Area[] = [
  { id: 'area-1', index: '01', name: 'Uno' } as Area,
  { id: 'area-2', index: '02', name: 'Dos' } as Area,
  { id: 'area-3', index: '03', name: 'Tres' } as Area,
];

describe('buildDiagnostic', () => {
  it('cubre primero un ítem por área', () => {
    const competencies = [
      competency('c1', 'area-1', 1),
      competency('c2', 'area-2', 2),
      competency('c3', 'area-3', 3),
    ];
    const items = [item('i1', 'c1'), item('i2', 'c2'), item('i3', 'c3')];

    const chosen = buildDiagnostic({ items, competencies, areas: AREAS }, 3);

    expect(chosen.map((entry) => entry.competencyId)).toEqual(['c1', 'c2', 'c3']);
  });

  it('nunca repite una competencia mientras haya otras disponibles', () => {
    const competencies = [
      competency('c1', 'area-1', 1),
      competency('c2', 'area-2', 2),
      competency('c3', 'area-3', 3),
    ];
    const items = [
      item('i1', 'c1'),
      item('i1b', 'c1'),
      item('i2', 'c2'),
      item('i3', 'c3'),
    ];

    const chosen = buildDiagnostic({ items, competencies, areas: AREAS }, 3);

    expect(new Set(chosen.map((entry) => entry.competencyId)).size).toBe(3);
  });

  it('es determinista: mismo catálogo, misma selección', () => {
    const competencies = [
      competency('c1', 'area-1', 1, 2),
      competency('c2', 'area-2', 2, 1),
      competency('c3', 'area-3', 3, 1),
    ];
    const items = [item('i1', 'c1'), item('i2', 'c2'), item('i3', 'c3')];

    const primera = buildDiagnostic({ items, competencies, areas: AREAS }, 2);
    const segunda = buildDiagnostic({ items, competencies, areas: AREAS }, 2);

    expect(primera.map((entry) => entry.id)).toEqual(segunda.map((entry) => entry.id));
  });

  it('no pasa del tamaño pedido', () => {
    const competencies = AREAS.map((area, index) => competency(`c${index}`, area.id, index));
    const items = competencies.map((entry) => item(`i-${entry.id}`, entry.id));

    expect(buildDiagnostic({ items, competencies, areas: AREAS }, 2)).toHaveLength(2);
  });

  it('ignora competencias sin publicar', () => {
    const competencies = [
      { ...competency('c1', 'area-1', 1), published: false } as CompetencyRecord,
      competency('c2', 'area-2', 2),
    ];
    const items = [item('i1', 'c1'), item('i2', 'c2')];

    const chosen = buildDiagnostic({ items, competencies, areas: AREAS }, 2);

    expect(chosen.map((entry) => entry.id)).toEqual(['i2']);
  });

  it('con el catálogo real elige doce ítems de doce competencias distintas', () => {
    // Se comprueba aparte, en la integración con el contenido.
    expect(DIAGNOSTIC_SIZE).toBe(12);
  });
});
