/**
 * Aritmética de fechas de calendario ('YYYY-MM-DD').
 *
 * Se usa `Date.UTC` y los getters UTC a propósito: así el resultado no depende de
 * la zona horaria de la máquina que ejecuta el test ni de la del servidor que compila.
 * El dominio no conoce zonas horarias: recibe la fecha ya resuelta por el adaptador
 * del reloj (docs/architecture/adr/ADR-002-dominio-puro.md).
 */
import type { IsoDate } from './types';

const MS_PER_DAY = 86_400_000;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function parseIsoDate(date: IsoDate): { year: number; month: number; day: number } {
  const parts = date.split('-');
  const [yearText, monthText, dayText] = parts;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    parts.length !== 3 ||
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(`Fecha ISO inválida: ${JSON.stringify(date)}`);
  }

  return { year, month, day };
}

/** Suma (o resta, con valores negativos) días de calendario. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const { year, month, day } = parseIsoDate(date);
  const instant = Date.UTC(year, month - 1, day) + days * MS_PER_DAY;
  const result = new Date(instant);

  return `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`;
}

/** Días enteros entre dos fechas de calendario (positivo si `to` es posterior). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);

  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / MS_PER_DAY,
  );
}

/** Comparación lexicográfica: válida para 'YYYY-MM-DD' con ceros a la izquierda. */
export function isOnOrBefore(date: IsoDate, reference: IsoDate): boolean {
  return date <= reference;
}
