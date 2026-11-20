import { describe, expect, it } from 'vitest';
import type { Prerequisite } from '@/shared/types/domain';
import { fixedClock } from '@/shared/time/clock';
import { projectState, projectUnlocked, type CompetencyState } from './projection';
import {
  correctAttempt,
  makeAttempt,
  makeItem,
  TEST_TODAY,
  wrongAttempt,
} from './test-helpers';
import type { Attempt, Item } from './types';

const clock = fixedClock(TEST_TODAY);

const ITEM_A: Item = makeItem({ id: 'item-a', difficulty: 1 });
const ITEM_B: Item = makeItem({ id: 'item-b', difficulty: 2 });
const ITEM_C: Item = makeItem({ id: 'item-c', difficulty: 3 });
const ITEMS: readonly Item[] = [ITEM_A, ITEM_B];

const states = (entries: Array<[string, CompetencyState]>): Map<string, CompetencyState> =>
  new Map(entries);

describe('projectState', () => {
  it('no_evidence si no hay intentos', () => {
    expect(projectState(ITEMS, [], clock)).toBe('no_evidence');
  });

  it('no_evidence si los intentos son de otros ítems', () => {
    const attempts = [correctAttempt('otro-item', '2026-11-10')];

    expect(projectState(ITEMS, attempts, clock)).toBe('no_evidence');
  });

  it('learning si falta algún ítem por intentar', () => {
    const attempts = [correctAttempt(ITEM_A.id, '2026-11-10')];

    expect(projectState(ITEMS, attempts, clock)).toBe('learning');
  });

  it('consolidated cuando todos los ítems tienen su último intento correcto', () => {
    const attempts = [
      correctAttempt(ITEM_A.id, '2026-11-10'),
      correctAttempt(ITEM_B.id, '2026-11-10'),
    ];

    expect(projectState(ITEMS, attempts, clock)).toBe('consolidated');
  });

  it('almost si todos los ítems están intentados y solo uno quedó sin acierto', () => {
    const attempts = [
      correctAttempt(ITEM_A.id, '2026-11-10'),
      wrongAttempt(ITEM_B.id, '2026-11-10'),
    ];

    // Antes esto devolvía `learning`, que con dos ítems se lee como «no sé nada»
    // cuando en realidad falta uno. La regla de consolidación no cambia.
    expect(projectState(ITEMS, attempts, clock)).toBe('almost');
  });

  it('learning si falla más de un ítem y nunca llegó a estar consolidada', () => {
    const items = [ITEM_A, ITEM_B, ITEM_C];
    const attempts = [
      correctAttempt(ITEM_A.id, '2026-11-10'),
      wrongAttempt(ITEM_B.id, '2026-11-10'),
      wrongAttempt(ITEM_C.id, '2026-11-10'),
    ];

    expect(projectState(items, attempts, clock)).toBe('learning');
  });

  it('learning si aún quedan ítems sin intentar, aunque el resto esté bien', () => {
    const attempts = [correctAttempt(ITEM_A.id, '2026-11-10')];

    expect(projectState(ITEMS, attempts, clock)).toBe('learning');
  });

  it('pasa de consolidated a at_risk al fallar un repaso (transición clave)', () => {
    const consolidated: Attempt[] = [
      correctAttempt(ITEM_A.id, '2026-11-10', 'a-ok'),
      correctAttempt(ITEM_B.id, '2026-11-10', 'b-ok'),
    ];
    const afterFailure: Attempt[] = [
      ...consolidated,
      wrongAttempt(ITEM_A.id, '2026-11-12', 'a-fail'),
    ];

    expect(projectState(ITEMS, consolidated, clock)).toBe('consolidated');
    expect(projectState(ITEMS, afterFailure, clock)).toBe('at_risk');
  });

  it('vuelve a consolidated al recuperar el ítem fallado', () => {
    const attempts: Attempt[] = [
      correctAttempt(ITEM_A.id, '2026-11-10', 'a1'),
      correctAttempt(ITEM_B.id, '2026-11-10', 'b1'),
      wrongAttempt(ITEM_A.id, '2026-11-12', 'a-fail'),
      correctAttempt(ITEM_A.id, '2026-11-13', 'a-recovered'),
    ];

    expect(projectState(ITEMS, attempts, clock)).toBe('consolidated');
  });

  it('un acierto dudoso cuenta como acierto (fase learning, pero evidencia)', () => {
    const doubtful = makeAttempt({
      id: 'a-doubt',
      itemId: ITEM_A.id,
      answeredAt: '2026-11-10T10:00:00.000Z',
      confidence: 'doubtful',
    });
    const attempts = [doubtful, correctAttempt(ITEM_B.id, '2026-11-10')];

    // R2 deja el ítem en `learning`, pero el último intento fue correcto.
    expect(projectState(ITEMS, attempts, clock)).toBe('consolidated');
  });

  it('no depende del orden en que lleguen los intentos', () => {
    const attempts: Attempt[] = [
      correctAttempt(ITEM_A.id, '2026-11-10', 'a1'),
      wrongAttempt(ITEM_B.id, '2026-11-11', 'b1'),
      correctAttempt(ITEM_B.id, '2026-11-12', 'b2'),
      correctAttempt(ITEM_A.id, '2026-11-13', 'a2'),
    ];

    expect(projectState(ITEMS, attempts, clock)).toBe(
      projectState(ITEMS, [...attempts].reverse(), clock),
    );
  });
});

describe('projectUnlocked', () => {
  const prerequisites: Prerequisite[] = [{ from: 'base', to: 'avanzada' }];

  it('una competencia sin prerrequisitos está desbloqueada (es una raíz)', () => {
    expect(projectUnlocked('base', prerequisites, states([]))).toBe(true);
  });

  it('se bloquea si el prerrequisito no tiene evidencia', () => {
    expect(projectUnlocked('avanzada', prerequisites, states([['base', 'no_evidence']]))).toBe(
      false,
    );
  });

  it('se desbloquea con solo empezar, sin exigir dominio', () => {
    expect(projectUnlocked('avanzada', prerequisites, states([['base', 'learning']]))).toBe(true);
    expect(projectUnlocked('avanzada', prerequisites, states([['base', 'consolidated']]))).toBe(
      true,
    );
  });

  it('NO se vuelve a bloquear cuando el prerrequisito entra en riesgo', () => {
    // Este es el punto del ADR-003: el desbloqueo es permanente, el dominio decae.
    expect(projectUnlocked('avanzada', prerequisites, states([['base', 'at_risk']]))).toBe(true);
  });

  it('exige que se cumplan todos los prerrequisitos', () => {
    const two: Prerequisite[] = [
      { from: 'base', to: 'avanzada' },
      { from: 'otra', to: 'avanzada' },
    ];

    expect(
      projectUnlocked('avanzada', two, states([
        ['base', 'consolidated'],
        ['otra', 'no_evidence'],
      ])),
    ).toBe(false);

    expect(
      projectUnlocked('avanzada', two, states([
        ['base', 'consolidated'],
        ['otra', 'learning'],
      ])),
    ).toBe(true);
  });

  it('ignora los prerrequisitos de otras competencias', () => {
    const unrelated: Prerequisite[] = [
      { from: 'x', to: 'otra' },
      { from: 'y', to: 'tercera' },
    ];

    expect(projectUnlocked('avanzada', unrelated, states([['x', 'no_evidence']]))).toBe(true);
  });
});
