import { describe, expect, it } from 'vitest';
import { fixedClock, localDateOf, localToday, systemClock, utcDateOf } from './clock';

describe('Clock', () => {
  it('el reloj fijo devuelve siempre la misma fecha e instante', () => {
    const clock = fixedClock('2026-11-19');

    expect(clock.today()).toBe('2026-11-19');
    expect(clock.now()).toBe('2026-11-19T12:00:00.000Z');
    expect(clock.today()).toBe(clock.today());
  });

  it('acepta un instante explícito para los tests', () => {
    const clock = fixedClock('2026-11-19', '2026-11-19T08:30:00.000Z');

    expect(clock.now()).toBe('2026-11-19T08:30:00.000Z');
  });

  it('el reloj fijo fecha los instantes en UTC, sin depender de la máquina', () => {
    const clock = fixedClock('2026-11-19');

    expect(clock.dateOf('2026-11-19T23:30:00.000Z')).toBe('2026-11-19');
    expect(clock.dateOf('2026-11-20T00:30:00.000Z')).toBe('2026-11-20');
  });

  it('localToday formatea YYYY-MM-DD en hora local', () => {
    // Constructor con componentes locales: el resultado no depende de la zona del test.
    expect(localToday(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localToday(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('el reloj del sistema produce una fecha ISO válida', () => {
    expect(systemClock.today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(systemClock.now()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('el reloj del sistema fecha sus propios instantes con la misma regla', () => {
    expect(systemClock.dateOf(systemClock.now())).toBe(systemClock.today());
  });
});

describe('dateOf', () => {
  it('utcDateOf toma la parte de fecha del instante', () => {
    expect(utcDateOf('2026-11-19T23:59:59.999Z')).toBe('2026-11-19');
    expect(utcDateOf('2026-12-01T00:00:00.000Z')).toBe('2026-12-01');
  });

  it('localDateOf devuelve una fecha ISO válida', () => {
    expect(localDateOf('2026-11-19T12:00:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
