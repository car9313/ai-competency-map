/**
 * Puertos de tiempo.
 *
 * Es el ÚNICO sitio del proyecto donde se construye la hora real. El dominio recibe
 * el reloj como argumento (regla D8 en docs/architecture/dependency-rules.md), de forma
 * que los tests y la demo pueden controlar "hoy" sin tocar el sistema.
 *
 * Incluye `dateOf`: convertir un instante en una fecha de calendario es una decisión de
 * zona horaria, y esa decisión no puede vivir en el dominio (ADR-002).
 */

export type IsoDate = string; // 'YYYY-MM-DD'
export type IsoTimestamp = string; // ISO 8601 completo

export interface Clock {
  /** Fecha de hoy en el calendario del alumno. */
  today(): IsoDate;
  /** Instante actual. */
  now(): IsoTimestamp;
  /** Fecha de calendario en la que ocurrió un instante. */
  dateOf(timestamp: IsoTimestamp): IsoDate;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatLocal(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Fecha local del dispositivo, no UTC.
 *
 * En UTC-5, a las 22:00 locales el día UTC ya es el siguiente: usar UTC haría que el
 * alumno viera "mañana" como hoy.
 */
export function localToday(date: Date = new Date()): IsoDate {
  return formatLocal(date);
}

/** Fecha local de un instante dado. */
export function localDateOf(timestamp: IsoTimestamp): IsoDate {
  return formatLocal(new Date(timestamp));
}

/**
 * Fecha UTC de un instante.
 *
 * La usa el reloj fijo a propósito: los tests no deben cambiar de resultado según la
 * zona horaria de la máquina que los ejecuta.
 */
export function utcDateOf(timestamp: IsoTimestamp): IsoDate {
  return timestamp.slice(0, 10);
}

export const systemClock: Clock = {
  today: () => localToday(),
  now: () => new Date().toISOString(),
  dateOf: (timestamp) => localDateOf(timestamp),
};

/** Reloj determinista: el que usan los tests y el control de tiempo de la demo. */
export function fixedClock(
  today: IsoDate,
  instant: IsoTimestamp = `${today}T12:00:00.000Z`,
): Clock {
  return {
    today: () => today,
    now: () => instant,
    dateOf: (timestamp) => utcDateOf(timestamp),
  };
}
