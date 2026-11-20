import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import type { Confidence } from '../domain/types';
import { MemoryAttemptStore } from './attempt-store';
import { submitAttempt } from './submit-attempt';

const clock = fixedClock('2026-11-20');

const ITEM: Item = {
  id: 'item-1',
  competencyId: 'comp-1',
  difficulty: 1,
  prompt: '¿Cuántos tokens entran en una ventana de 8k?',
  options: [
    { id: 'ok', text: 'Depende del tokenizador', correct: true, rationale: 'Porque el token no es un carácter.' },
    { id: 'mal', text: 'Exactamente 8000 palabras', correct: false, rationale: 'Confunde tokens con palabras.' },
  ],
  explanation: 'La ventana se mide en tokens, y el tokenizador cambia según idioma y formato.',
  referenceId: 'ref-1',
};

function baseInput(overrides: Partial<Parameters<typeof submitAttempt>[1]> = {}) {
  return {
    item: ITEM,
    selectedOptionId: 'ok',
    confidence: 'confident' as Confidence,
    presentedOptionIds: ['mal', 'ok'],
    durationMs: 5000,
    deviceId: 'device-1',
    attemptId: 'a1',
    clock,
    ...overrides,
  };
}

describe('submitAttempt', () => {
  it('guarda el intento con el orden de opciones presentado (I11)', async () => {
    const store = new MemoryAttemptStore();
    const result = await submitAttempt(store, baseInput());

    expect(result.attempt.presentedOptionIds).toEqual(['mal', 'ok']);

    const [saved] = await store.list();
    expect(saved?.presentedOptionIds).toEqual(['mal', 'ok']);
  });

  it('marca el intento como correcto según la opción elegida, no según lo que diga la UI', async () => {
    const store = new MemoryAttemptStore();

    const right = await submitAttempt(store, baseInput({ attemptId: 'a1' }));
    const wrong = await submitAttempt(
      store,
      baseInput({ attemptId: 'a2', selectedOptionId: 'mal' }),
    );

    expect(right.correct).toBe(true);
    expect(wrong.correct).toBe(false);
  });

  it('la confianza cambia la fecha resultante', async () => {
    const store = new MemoryAttemptStore();

    const confident = await submitAttempt(store, baseInput({ attemptId: 'a1' }));
    const doubtfulStore = new MemoryAttemptStore();
    const doubtful = await submitAttempt(
      doubtfulStore,
      baseInput({ attemptId: 'a1', confidence: 'doubtful' }),
    );

    expect(confident.next.dueAt).not.toBe(doubtful.next.dueAt);
    expect(confident.next.intervalDays).toBeGreaterThan(doubtful.next.intervalDays);
  });

  it('devuelve la programación anterior y la posterior', async () => {
    const store = new MemoryAttemptStore();
    const result = await submitAttempt(store, baseInput());

    // Regla R1: desde `new`, un acierto con confianza pasa directo a `review`, a 3 días.
    expect(result.previous.phase).toBe('new');
    expect(result.next.phase).toBe('review');
    expect(result.next.intervalDays).toBe(3);
    expect(result.intervalGrew).toBe(true);
  });

  it('rechaza una opción que no pertenece al ítem', async () => {
    const store = new MemoryAttemptStore();

    await expect(
      submitAttempt(store, baseInput({ selectedOptionId: 'no-existe' })),
    ).rejects.toThrow(/no pertenece al ítem/);
  });

  it('un segundo intento se pliega sobre el primero, no lo sustituye', async () => {
    const store = new MemoryAttemptStore();

    await submitAttempt(store, baseInput({ attemptId: 'a1' }));
    const second = await submitAttempt(store, baseInput({ attemptId: 'a2' }));

    expect(await store.list()).toHaveLength(2);
    expect(second.previous.phase).toBe('review');
    // R7: en review, intervalo × facilidad = 3 × 2.5 = 7.5 → 8 días.
    expect(second.next.intervalDays).toBe(8);
  });

  it('reenviar el mismo intento no duplica evidencia', async () => {
    const store = new MemoryAttemptStore();

    await submitAttempt(store, baseInput({ attemptId: 'a1' }));
    await submitAttempt(store, baseInput({ attemptId: 'a1' }));

    expect(await store.list()).toHaveLength(1);
  });
});
