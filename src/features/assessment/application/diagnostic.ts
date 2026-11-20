/**
 * Diagnóstico inicial.
 *
 * El problema que resuelve: el mapa asume que empiezas por la raíz. Quien ya sabe qué es
 * el machine learning tiene que demostrarlo respondiendo lo básico para desbloquear el
 * nivel siguiente.
 *
 * El diagnóstico no inventa un mecanismo nuevo: elige pocos ítems repartidos por áreas y los
 * presenta como una sesión más. Cada respuesta es un intento igual que cualquier otro, así
 * que **desbloquea lo que dependa de ella**. No hay «modo diagnóstico» en el dominio porque
 * no hace falta: un intento es un intento.
 *
 * La selección es determinista. Si dependiera del azar, dos personas no podrían comparar sus
 * resultados, y los tests no podrían afirmar nada.
 */
import type { Item } from '@/shared/types/domain';
import type { Area, CompetencyRecord } from '@/features/content/domain/types';

export const DIAGNOSTIC_SIZE = 12;

interface DiagnosticInput {
  items: readonly Item[];
  competencies: readonly CompetencyRecord[];
  areas: readonly Area[];
}

/**
 * Elige hasta `size` ítems cubriendo el máximo de áreas distinto.
 *
 * Orden: primero uno por área (la primera competencia publicada de cada una, en el orden del
 * contenido), después el resto por nivel y orden de catálogo. El resultado es estable: mismo
 * catálogo, misma selección.
 */
export function buildDiagnostic(
  { items, competencies, areas }: DiagnosticInput,
  size: number = DIAGNOSTIC_SIZE,
): Item[] {
  const competencyById = new Map(competencies.map((competency) => [competency.id, competency]));
  const itemsByCompetency = new Map<string, Item[]>();

  for (const item of items) {
    const bucket = itemsByCompetency.get(item.competencyId);

    if (bucket) {
      bucket.push(item);
    } else {
      itemsByCompetency.set(item.competencyId, [item]);
    }
  }

  const ordered = [...competencyById.values()]
    .filter((competency) => competency.published)
    .sort((a, b) => a.level - b.level || a.order - b.order);

  const chosen: Item[] = [];
  const usedAreas = new Set<string>();

  // Primera pasada: una competencia por área, para que el diagnóstico hable de todo el mapa.
  for (const area of areas) {
    const competency = ordered.find(
      (candidate) => candidate.areaId === area.id && !usedAreas.has(candidate.areaId),
    );

    if (!competency) continue;

    const [first] = itemsByCompetency.get(competency.id) ?? [];

    if (first) {
      chosen.push(first);
      usedAreas.add(competency.areaId);
    }
  }

  // Segunda pasada: completa con competencias que aún no tengan ítem elegido.
  for (const competency of ordered) {
    if (chosen.length >= size) break;

    const already = chosen.some((item) => item.competencyId === competency.id);

    if (already) continue;

    const [first] = itemsByCompetency.get(competency.id) ?? [];

    if (first) chosen.push(first);
  }

  return chosen.slice(0, size);
}
