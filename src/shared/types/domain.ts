/**
 * Tipos neutrales compartidos entre features.
 *
 * Viven aquí porque los necesitan tanto el grafo de competencias como el motor de
 * evaluación, y una feature no debe importar el interior de otra (regla D4).
 */

/** Nodo del grafo. `areaId` solo agrupa para navegar: nunca bloquea nada. */
export interface Competency {
  id: string;
  areaId: string;
  order: number;
}

/** Arista dirigida: se necesita evidencia en `from` para desbloquear `to`. */
export interface Prerequisite {
  from: string;
  to: string;
}
