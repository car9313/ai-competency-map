/**
 * Cómo se nombra y se colorea el estado **personal** de una competencia.
 *
 * Vive en `assessment` porque `CompetencyState` es un concepto suyo. La vista del mapa las
 * importa de aquí: la dirección de la dependencia es grafo → evaluación, nunca al revés.
 */
import type { CompetencyState } from '../domain/projection';

export const STATE_LABEL: Record<CompetencyState, string> = {
  no_evidence: 'sin evidencia',
  learning: 'en aprendizaje',
  almost: 'a un ítem',
  consolidated: 'consolidada',
  at_risk: 'necesita repaso',
};

export const STATE_TONE: Record<CompetencyState, string> = {
  no_evidence: 'text-muted',
  learning: 'text-amber-700 dark:text-amber-300',
  almost: 'text-yellow-700 dark:text-yellow-300',
  consolidated: 'text-emerald-700 dark:text-emerald-300',
  at_risk: 'text-rose-700 dark:text-rose-300',
};
