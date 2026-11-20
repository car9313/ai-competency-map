/**
 * Genera `docs/product/content-status.md` a partir del catálogo real.
 *
 * El estado del contenido cambia con cada tanda de autoría. Escribirlo a mano garantiza
 * que en dos semanas diga cosas falsas; generarlo lo mantiene honesto por construcción.
 *
 * Uso: pnpm content:status
 */
import { writeFile } from 'node:fs/promises';
import { CATALOG } from '@/content';

const OUT = 'docs/product/content-status.md';
const ITEMS_PER_COMPETENCY = 4;

const lessonOf = new Set(CATALOG.lessons.map((lesson) => lesson.competencyId));
const itemsOf = new Map<string, number>();

for (const item of CATALOG.items) {
  itemsOf.set(item.competencyId, (itemsOf.get(item.competencyId) ?? 0) + 1);
}

const total = CATALOG.competencies.length;
const published = CATALOG.competencies.filter((competency) => competency.published).length;
const pending = total - published;
const itemCount = CATALOG.items.length;
const target = total * ITEMS_PER_COMPETENCY;

function bullet(competency: (typeof CATALOG.competencies)[number]): string {
  const items = itemsOf.get(competency.id) ?? 0;

  if (competency.published) {
    return `- ✅ \`${competency.id}\` — lección y ${items} ítems`;
  }

  const missing = [
    lessonOf.has(competency.id) ? null : 'lección',
    items === 0 ? `${ITEMS_PER_COMPETENCY} ítems` : null,
  ].filter(Boolean);

  return `- ⬜ \`${competency.id}\` — falta ${missing.join(' y ')}`;
}

const areas = CATALOG.areas.map((area) => {
  const competencies = CATALOG.competencies.filter(
    (competency) => competency.areaId === area.id,
  );
  const done = competencies.filter((competency) => competency.published).length;
  const items = competencies.reduce(
    (sum, competency) => sum + (itemsOf.get(competency.id) ?? 0),
    0,
  );

  return [
    `### ${area.index} · ${area.name} — ${done}/${competencies.length}`,
    '',
    ...competencies.map(bullet),
    '',
    `<sub>${items} ítems en el área · objetivo ${competencies.length * ITEMS_PER_COMPETENCY}</sub>`,
    '',
  ].join('\n');
});

const doc = `# Estado del contenido

Generado desde el catálogo. **No editar a mano**: cambia el contenido y ejecuta \`pnpm content:status\`.

## Resumen

| | |
|---|---|
| Competencias publicadas | **${published} / ${total}** |
| Pendientes | ${pending} |
| Lecciones escritas | ${CATALOG.lessons.length} |
| Ítems escritos | **${itemCount}** (objetivo ~${target}) |
| Áreas completas | ${CATALOG.areas.filter((area) => CATALOG.competencies.filter((c) => c.areaId === area.id).every((c) => c.published)).length} / ${CATALOG.areas.length} |

Una competencia cuenta como publicada solo si tiene lección e ítems, y eso lo verifica el
linter de contenido (regla R4) en CI: \`pnpm validate:content\`.

## Qué significa «publicada»

| Regla | Exige |
|---|---|
| R1 | Identificadores únicos en todo el catálogo |
| R2 | Enunciado, explicación y referencias presentes |
| R3 | Entre 3 y 4 opciones por ítem, y exactamente una correcta |
| R4 | Cada competencia publicada: 1 lección y ≥3 ítems |
| R5 | Los prerrequisitos existen y el grafo no tiene ciclos |
| R6 | Las opciones de un ítem no delatan la correcta por longitud |
| R7 | La referencia citada existe |

Una competencia con \`published: false\` aparece en el mapa como «próximamente» y el linter
no le exige contenido. Es la forma de publicar el grafo completo sin mentir sobre lo que hay.

## Por área

${areas.join('\n')}
## Qué falta, en orden

${pending === 0 ? 'Nada: todas las competencias están publicadas.' : `Quedan **${pending} competencias** y unos **${target - itemCount} ítems**. El orden recomendado sigue las dependencias del grafo: primero las áreas cuyos prerrequisitos ya tienen contenido, para que el desbloqueo sea demostrable.

1. Área 03 · Prompt y context engineering (5 pendientes)
2. Área 04 · Aplicaciones y RAG (5)
3. Área 05 · Ingeniería agéntica (6)
4. Área 06 · Harness engineering (4)
5. Área 07 · Arquitectura de software IA (4)
6. Área 08 · Calidad y producción (4)`}

## Criterio de cierre de la fase 2

- [ ] Las 39 competencias publicadas.
- [ ] ~${target} ítems, con justificación por distractor.
- [ ] \`pnpm validate:content\` en cero, ejecutándose en CI.
- [ ] Ningún nodo del mapa queda como «próximamente».
`;

await writeFile(OUT, doc, 'utf8');
console.log(`✓ ${OUT} generado: ${published}/${total} publicadas, ${itemCount} ítems.`);
