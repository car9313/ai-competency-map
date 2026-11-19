/**
 * Puertos de tiempo.
 *
 * Es el ÚNICO sitio del proyecto donde se construye la hora real. El dominio recibe
 * el reloj como argumento (regla D8 en docs/architecture/dependency-rules.md), de forma
 * que los tests y la demo pueden controlar "hoy" sin tocar el sistema.
 */

export type IsoDate = string; // 'YYYY-MM-DD'
export type IsoTimestamp = string; // ISO 8601 completo

export interface Clock {
  today(): IsoDate;
  now(): IsoTimestamp;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Fecha local del dispositivo, no UTC.
 *
 * En UTC-5, a las 22:00 locales el día UTC ya es el siguiente: usar UTC haría que el
 * alumno viera "mañana" como hoy. La conversión de zona horaria se decide en S5.
 */
export function localToday(date: Date = new Date()): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const systemClock: Clock = {
  today: () => localToday(),
  now: () => new Date().toISOString(),
};

/** Reloj determinista: el que usan los tests y el control de tiempo de la demo. */
export function fixedClock(
  today: IsoDate,
  instant: IsoTimestamp = `${today}T12:00:00.000Z`,
): Clock {
  return {
    today: () => today,
    now: () => instant,
  };
}
