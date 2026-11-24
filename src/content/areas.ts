/**
 * Las ocho áreas de la taxonomía (docs/domain/competency-graph.md).
 *
 * Un área solo agrupa para navegar: nunca bloquea ni desbloquea nada.
 */
import type { Area } from '@/features/content/domain/types';

export const AREAS: readonly Area[] = [
  {
    id: 'programming-fundamentals',
    index: '00',
    name: 'Fundamentos de programación',
    description:
      'Lo que hay que saber antes de delegar código: leer un diff, moverte en el terminal, probar y depurar. Sin esto, cada error del agente se convierte en una hora perdida.',
  },
  {
    id: 'ai-fundamentals',
    index: '01',
    name: 'Fundamentos de IA',
    description:
      'Qué separa la IA simbólica del aprendizaje automático y cuándo conviene cada uno.',
  },
  {
    id: 'generative-llms',
    index: '02',
    name: 'IA generativa y LLMs',
    description: 'Cómo un transformer procesa tokens y por qué el contexto es un recurso finito.',
  },
  {
    id: 'prompt-context',
    index: '03',
    name: 'Prompt y context engineering',
    description: 'Cómo escribir un contrato de comportamiento en lugar de una petición amable.',
  },
  {
    id: 'ai-apps-rag',
    index: '04',
    name: 'Aplicaciones de IA y RAG',
    description: 'Herramientas, streaming y recuperación: cómo se conecta un modelo a los datos.',
  },
  {
    id: 'agentic-engineering',
    index: '05',
    name: 'Ingeniería agéntica',
    description: 'Ciclos acotados, memoria y el protocolo que hace interoperables las herramientas.',
  },
  {
    id: 'harness-engineering',
    index: '06',
    name: 'Harness engineering',
    description: 'Los límites: registro de herramientas, aislamiento y aprobación humana.',
  },
  {
    id: 'ai-architecture',
    index: '07',
    name: 'Arquitectura de software IA',
    description: 'Desacoplar del proveedor, enrutar modelos y sobrevivir a sus fallos.',
  },
  {
    id: 'ai-quality-production',
    index: '08',
    name: 'Calidad y producción',
    description: 'Medir, filtrar, observar y defenderse: lo que separa una demo de un sistema.',
  },
  {
    id: 'ai-workflow-methodology',
    index: '09',
    name: 'Metodología y flujo con agentes',
    description:
      'Cómo trabaja un equipo con agentes: especificar, delegar, revisar y gobernar. Aquí no se construye el sistema, se cambia la forma de construirlo.',
  },
];
