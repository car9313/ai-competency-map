/**
 * Camino hasta un objetivo.
 *
 * El mapa responde «¿qué aprendo y en qué orden?», pero de forma global. Esta función
 * responde la pregunta concreta: «quiero llegar a *fundamentación con citas*; ¿qué me falta?».
 *
 * Devuelve el cierre de prerrequisitos en orden topológico, con el objetivo al final. No
 * incluye competencias ajenas al camino, aunque estén en la misma área: una ruta no es un
 * temario, es lo mínimo que hay que cubrir.
 */
import type { CompetencyRecord } from '@/features/content/domain/types';

export function prerequisiteClosure(
  targetId: string,
  competencies: readonly CompetencyRecord[],
): CompetencyRecord[] {
  const byId = new Map(competencies.map((competency) => [competency.id, competency]));
  const included = new Map<string, CompetencyRecord>();

  const pendientes = [targetId];

  while (pendientes.length > 0) {
    const id = pendientes.pop();

    if (id === undefined || included.has(id)) continue;

    const competency = byId.get(id);

    if (!competency) continue;

    included.set(id, competency);
    pendientes.push(...competency.prerequisites);
  }

  const nodos = [...included.values()];

  // Kahn sobre el subgrafo inducido, con desempate por orden de catálogo. Ordenar por
  // `level` no serviría: `level` es dificultad, no profundidad en el grafo.
  const entrantes = new Map(
    nodos.map((nodo) => [
      nodo.id,
      nodo.prerequisites.filter((prerequisite) => included.has(prerequisite)).length,
    ]),
  );

  const listos = nodos
    .filter((nodo) => entrantes.get(nodo.id) === 0)
    .sort((a, b) => a.order - b.order);

  const ordenados: CompetencyRecord[] = [];

  while (listos.length > 0) {
    const actual = listos.shift();

    if (!actual) break;

    ordenados.push(actual);

    for (const nodo of nodos) {
      if (!nodo.prerequisites.includes(actual.id)) continue;

      const restantes = (entrantes.get(nodo.id) ?? 0) - 1;

      entrantes.set(nodo.id, restantes);

      if (restantes === 0) {
        listos.push(nodo);
        listos.sort((a, b) => a.order - b.order);
      }
    }
  }

  // Un ciclo dejaría nodos fuera. El linter de contenido ya los impide; si apareciera uno,
  // se devuelve lo ordenado en vez de perder el destino.
  if (ordenados.length < nodos.length) {
    for (const nodo of nodos) {
      if (!ordenados.includes(nodo)) ordenados.push(nodo);
    }
  }

  return ordenados;
}
