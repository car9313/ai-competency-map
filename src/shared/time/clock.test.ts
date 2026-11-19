import { describe, expect, it } from 'vitest';
import { fixedClock, localToday, systemClock } from './clock';

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

  it('localToday formatea YYYY-MM-DD en hora local', () => {
    // Constructor con componentes locales: el resultado no depende de la zona del test.
    expect(localToday(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localToday(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('el reloj del sistema produce una fecha ISO válida', () => {
    expect(systemClock.today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(systemClock.now()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
