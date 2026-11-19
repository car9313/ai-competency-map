/**
 * API pública de la feature `assessment`.
 *
 * El mapa y los casos de uso importan de aquí, nunca del interior de `domain/` (D4).
 */
export { foldSchedule, groupAttemptsByItem } from './domain/fold';
export { projectState, projectUnlocked, type CompetencyState } from './domain/projection';
export { buildReviewQueue, type ReviewQueueItem } from './domain/queue';
export {
  initialSchedule,
  scheduleNext,
  findRule,
} from './domain/schedule';
export {
  MAX_EASE,
  MAX_INTERVAL_DAYS,
  MIN_EASE,
  MIN_INTERVAL_DAYS,
  RULES,
} from './domain/rules';
export type { Attempt, Confidence, ItemSchedule, Phase } from './domain/types';
