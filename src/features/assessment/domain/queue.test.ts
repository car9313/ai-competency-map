import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/shared/time/clock';
import { foldSchedule } from './fold';
import { buildReviewQueue } from './queue';
import { correctAttempt, makeItem, makeAttempt, wrongAttempt } from './test-helpers';
import type { Attempt, Item } from './types';

const clock = fixedClock('2026-11-19');

const ITEM_EASY: Item = makeItem({ id: 'item-easy', difficulty: 1 });
const ITEM_HARD: Item = makeItem({ id: 'item-hard', difficulty: 3 });
const ITEM_NEW: Item = makeItem({ id: 'item-new', difficulty: 2 });
const ITEMS: readonly Item[] = [ITEM_HARD, ITEM_NEW, ITEM_EASY];

describe('buildReviewQueue', () => {
  it('está vacía sin intentos', () => {
    expect(buildReviewQueue(ITEMS, [], clock)).toEqual([]);
  });

  it('excluye los ítems que nunca se intentaron: están disponibles, no vencidos', () => {
    const attempts = [correctAttempt(ITEM_EASY.id, '2026-11-10')];

    const queue = buildReviewQueue(ITEMS, attempts, clock);

    expect(queue.map((entry) => entry.item.id)).not.toContain(ITEM_NEW.id);
  });

  it('incluye solo lo que ya venció', () => {
    // Acertado el 10 de noviembre con confianza → review a 3 días → vence el 13.
    const due = [correctAttempt(ITEM_EASY.id, '2026-11-10')];
    // Acertado el 18 → review a 3 días → vence el 21: todavía no toca.
    const notDue = [correctAttempt(ITEM_HARD.id, '2026-11-18')];

    const queue = buildReviewQueue(ITEMS, [...due, ...notDue], clock);

    expect(queue.map((entry) => entry.item.id)).toEqual([ITEM_EASY.id]);
  });

  it('calcula los días de atraso', () => {
    const attempts = [correctAttempt(ITEM_EASY.id, '2026-11-10')];

    const [entry] = buildReviewQueue(ITEMS, attempts, clock);

    // Vencía el 13 y hoy es 19.
    expect(entry?.schedule.dueAt).toBe('2026-11-13');
    expect(entry?.overdueDays).toBe(6);
  });

  it('ordena por vencimiento: lo más atrasado primero', () => {
    const attempts: Attempt[] = [
      correctAttempt(ITEM_EASY.id, '2026-11-15'), // vence el 18
      correctAttempt(ITEM_HARD.id, '2026-11-10'), // vence el 13
    ];

    const queue = buildReviewQueue(ITEMS, attempts, clock);

    expect(queue.map((entry) => entry.item.id)).toEqual([ITEM_HARD.id, ITEM_EASY.id]);
    expect(queue.map((entry) => entry.overdueDays)).toEqual([6, 1]);
  });

  it('a igual vencimiento, ordena por dificultad', () => {
    const attempts: Attempt[] = [
      correctAttempt(ITEM_HARD.id, '2026-11-10'),
      correctAttempt(ITEM_EASY.id, '2026-11-10'),
    ];

    const queue = buildReviewQueue(ITEMS, attempts, clock);

    expect(queue.map((entry) => entry.item.difficulty)).toEqual([1, 3]);
  });

  it('incluye los ítems fallados, que vuelven con intervalo de un día', () => {
    const attempts = [wrongAttempt(ITEM_EASY.id, '2026-11-17')];

    const queue = buildReviewQueue(ITEMS, attempts, clock);

    expect(queue.map((entry) => entry.item.id)).toEqual([ITEM_EASY.id]);
    expect(queue[0]?.schedule.phase).toBe('relearning');
    expect(queue[0]?.schedule.dueAt).toBe('2026-11-18');
  });

  it('es determinista y no modifica sus entradas', () => {
    const attempts = [correctAttempt(ITEM_EASY.id, '2026-11-10')];
    const snapshot = structuredClone([...attempts]);

    const first = buildReviewQueue(ITEMS, attempts, clock);
    const second = buildReviewQueue(ITEMS, attempts, clock);

    expect(first).toEqual(second);
    expect(attempts).toEqual(snapshot);
  });

  it('un ítem con historial largo usa su programación plegada, no el último intento', () => {
    const attempts = [
      makeAttempt({ id: 'h1', itemId: ITEM_EASY.id, answeredAt: '2026-11-01T10:00:00.000Z' }),
      makeAttempt({ id: 'h2', itemId: ITEM_EASY.id, answeredAt: '2026-11-04T10:00:00.000Z' }),
      makeAttempt({ id: 'h3', itemId: ITEM_EASY.id, answeredAt: '2026-11-07T10:00:00.000Z' }),
    ];

    // 3 → 8 → 20 días: el tercer acierto lleva el vencimiento al 27, todavía futuro,
    // así que el ítem no debe aparecer en la cola de hoy (19).
    expect(buildReviewQueue(ITEMS, attempts, clock)).toEqual([]);

    const schedule = foldSchedule(ITEM_EASY.id, attempts, clock);
    expect(schedule.intervalDays).toBe(20);
    expect(schedule.dueAt).toBe('2026-11-27');
  });
});
