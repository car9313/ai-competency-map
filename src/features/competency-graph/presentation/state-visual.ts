import type { NodeVisibility } from '../application/map';

/**
 * Representación visual de cada estado. Vive en un solo sitio porque la usan el diagrama
 * y las tarjetas: si se cambia un color o una etiqueta, cambia en las dos vistas.
 *
 * Las etiquetas de `available` y `locked` describen **la comprobación**, no el acceso.
 * Leer una competencia con previos pendientes siempre se puede; lo que no se puede aún es
 * comprobarla, porque mediría algo que no está sostenido por evidencia previa.
 */
export const VISUAL: Record<NodeVisibility, { fill: string; stroke: string; label: string }> = {
  pending: { fill: 'transparent', stroke: 'var(--border)', label: 'próximamente' },
  locked: { fill: 'var(--surface-2)', stroke: 'var(--border)', label: 'faltan previos' },
  available: { fill: 'var(--accent)', stroke: 'var(--accent)', label: 'evaluable' },
  learning: { fill: '#f59e0b', stroke: '#f59e0b', label: 'en aprendizaje' },
  almost: { fill: '#eab308', stroke: '#eab308', label: 'a un ítem' },
  consolidated: { fill: '#10b981', stroke: '#10b981', label: 'consolidada' },
  at_risk: { fill: '#f43f5e', stroke: '#f43f5e', label: 'necesita repaso' },
  no_evidence: { fill: 'transparent', stroke: 'var(--border)', label: 'sin evidencia' },
};

export const LEGEND_ORDER: NodeVisibility[] = [
  'pending',
  'locked',
  'available',
  'learning',
  'almost',
  'consolidated',
  'at_risk',
];

/**
 * Parte una etiqueta en dos líneas por límite de palabra.
 *
 * Antes se truncaba a 16 caracteres, y con títulos como «Fronteras entre IA, ML y deep
 * learning» lo que se perdía era justo lo que identificaba la competencia. Dos líneas
 * cubren casi todos los títulos; el tooltip cubre el resto.
 */
export function labelLines(title: string, maxPerLine = 17): string[] {
  if (title.length <= maxPerLine) return [title];

  const words = title.split(' ');
  const first: string[] = [];
  let start = 0;

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index] ?? '';

    if ([...first, word].join(' ').length <= maxPerLine) {
      first.push(word);
      start = index + 1;
    } else {
      break;
    }
  }

  // Una sola palabra más larga que la línea: no hay corte por palabra posible.
  if (first.length === 0) {
    return [`${title.slice(0, Math.max(1, maxPerLine - 1))}…`];
  }

  const rest = words.slice(start);

  if (rest.length === 0) return [first.join(' ')];

  const second: string[] = [];
  let truncated = false;

  // La segunda línea también corta por palabra: cortar a mitad («deep le…») deja la
  // etiqueta sin sentido, que es justo lo que se quería evitar.
  for (const word of rest) {
    if ([...second, word].join(' ').length <= maxPerLine) {
      second.push(word);
    } else {
      truncated = true;
      break;
    }
  }

  if (second.length === 0) {
    return [first.join(' '), `${(rest[0] ?? '').slice(0, Math.max(1, maxPerLine - 1))}…`];
  }

  return [first.join(' '), `${second.join(' ')}${truncated ? '…' : ''}`];
}
