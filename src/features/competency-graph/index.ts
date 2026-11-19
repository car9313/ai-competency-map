/**
 * API pública de la feature `competency-graph`.
 *
 * Otra feature (o el linter de contenido) solo debe importar de aquí, nunca del
 * interior de `domain/` (regla D4 en docs/architecture/dependency-rules.md).
 */
export { topologicalLevels, type GraphTopology } from './domain/graph';
export {
  buildCompetencyMap,
  prerequisitesOf,
  nodesOfLevel,
  type CompetencyMap,
  type MapNode,
  type NodeVisibility,
} from './application/map';
