/**
 * Las competencias con contenido en la fase 1.
 *
 * Son tres nodos encadenados del grafo real (docs/domain/competency-graph.md):
 * fundamentos → tokens → contrato de sistema. La cadena cruza áreas a propósito:
 * los prerrequisitos del grafo no respetan las áreas, y el contenido tampoco debería.
 */
import type { CompetencyRecord } from '@/features/content/domain/types';

export const COMPETENCIES: readonly CompetencyRecord[] = [
  {
    id: 'ai-ml-dl-boundaries',
    areaId: 'ai-fundamentals',
    order: 1,
    layer: 'nucleo',
    level: 1,
    title: 'Fronteras entre IA, ML y deep learning',
    claim:
      'Distinguir los tres niveles y decidir cuándo un problema pide reglas, un modelo clásico o una red profunda.',
    prerequisites: [],
  },
  {
    id: 'tokens-and-context-window',
    areaId: 'generative-llms',
    order: 1,
    layer: 'nucleo',
    level: 1,
    title: 'Tokens y ventana de contexto',
    claim: 'Calcular un presupuesto de contexto y explicar por qué se agota antes de lo esperado.',
    prerequisites: ['ai-ml-dl-boundaries'],
  },
  {
    id: 'system-instructions-contract',
    areaId: 'prompt-context',
    order: 1,
    layer: 'nucleo',
    level: 1,
    title: 'Instrucciones de sistema como contrato',
    claim: 'Escribir un contrato estable que no se rompa con entradas hostiles ni con el uso.',
    prerequisites: ['tokens-and-context-window'],
  },
];
