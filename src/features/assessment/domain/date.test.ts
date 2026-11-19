import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, isOnOrBefore, parseIsoDate } from './date';

describe('addDays', () => {
  it('suma días dentro del mismo mes', () => {
    expect(addDays('2026-11-19', 3)).toBe('2026-11-22');
  });

  it('cruza el final de mes', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-04-30', 1)).toBe('2026-05-01');
  });

  it('cruza el final de año', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('respeta los años bisiestos', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('acepta el máximo intervalo del planificador', () => {
    expect(addDays('2026-11-19', 180)).toBe('2027-05-18');
  });

  it('sumar cero no cambia la fecha', () => {
    expect(addDays('2026-11-19', 0)).toBe('2026-11-19');
  });

  it('no depende de la zona horaria de la máquina', () => {
    // Si se usara la hora local, un cambio de zona podría desplazar el resultado un día.
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
  });
});

describe('daysBetween', () => {
  it('cuenta días hacia delante y hacia atrás', () => {
    expect(daysBetween('2026-11-19', '2026-11-22')).toBe(3);
    expect(daysBetween('2026-11-22', '2026-11-19')).toBe(-3);
    expect(daysBetween('2026-11-19', '2026-11-19')).toBe(0);
  });

  it('atraviesa el cambio de año', () => {
    expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3);
  });
});

describe('isOnOrBefore', () => {
  it('compara fechas de calendario', () => {
    expect(isOnOrBefore('2026-11-19', '2026-11-19')).toBe(true);
    expect(isOnOrBefore('2026-11-18', '2026-11-19')).toBe(true);
    expect(isOnOrBefore('2026-11-20', '2026-11-19')).toBe(false);
  });
});

describe('parseIsoDate', () => {
  it('descompone una fecha válida', () => {
    expect(parseIsoDate('2026-11-19')).toEqual({ year: 2026, month: 11, day: 19 });
  });

  it('rechaza formatos inválidos', () => {
    expect(() => parseIsoDate('19/11/2026')).toThrow(/Fecha ISO inválida/);
    expect(() => parseIsoDate('2026-13-01')).toThrow(/Fecha ISO inválida/);
    expect(() => parseIsoDate('2026-11-32')).toThrow(/Fecha ISO inválida/);
    expect(() => parseIsoDate('')).toThrow(/Fecha ISO inválida/);
  });
});
