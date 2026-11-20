/**
 * Control de tiempo para la demo.
 *
 * `?devtime=2026-12-01` hace que la app crea que hoy es esa fecha. Sin esto, enseñar la
 * repetición espaciada obligaría a esperar ocho días o a mentir con datos inventados.
 *
 * **No debe existir en producción.** El bloque va detrás de `process.env.NODE_ENV`, que
 * Next sustituye en build: en el bundle final la condición es `false` y el minificador
 * elimina el bloque entero, incluida la cadena `devtime`. La aserción está en
 * `scripts/assert-no-devtime.mjs` y corre en CI tras el build.
 */
import { fixedClock, systemClock, type Clock, type IsoDate } from './clock';

export const DEV_TIME_PARAM = 'devtime';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function resolveClock(search: string): Clock {
  if (process.env.NODE_ENV !== 'production') {
    const value = new URLSearchParams(search).get(DEV_TIME_PARAM);

    if (value !== null && ISO_DATE.test(value)) {
      return fixedClock(value as IsoDate);
    }
  }

  return systemClock;
}
