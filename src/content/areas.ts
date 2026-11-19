/**
 * Áreas: solo agrupan para navegar. Nunca bloquean ni desbloquean nada.
 *
 * En S4 solo existen las áreas que ya tienen contenido. El catálogo crece por
 * rebanadas, no se pre-crea vacío.
 */
import type { Area } from '@/features/content/domain/types';

export const AREAS: readonly Area[] = [
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
];
