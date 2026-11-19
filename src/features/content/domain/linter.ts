/**
 * Linter de contenido: las reglas R1–R7.
 *
 * El esquema (Zod) comprueba la forma; esto comprueba el significado. Un linter que
 * nunca ha rechazado nada es un linter que nadie ha probado: hay un fixture negativo
 * por regla en `linter.test.ts`.
 *
 * Ver docs/quality/content-linter.md
 */
import { topologicalLevels } from '@/features/competency-graph';
import type { IsoDate } from '@/shared/time/clock';
import type { Item, Option } from '@/shared/types/domain';
import type { Catalog } from './types';

export type RuleId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7';
export type Severity = 'error' | 'warning';

export interface LintIssue {
  rule: RuleId;
  severity: Severity;
  /** Identificador de lo que falla: un ítem, una competencia o 'grafo'. */
  subject: string;
  message: string;
}

export type { Catalog };

/** Umbrales de las reglas. Escritos aquí para que el documento y el código no diverjan. */
export const LIMITS = {
  minOptionsPerItem: 3,
  maxOptionsPerItem: 4,
  minRationaleLength: 40,
  minExplanationLength: 80,
  minItemsPerCompetency: 3,
  minLessonsPerCompetency: 1,
  /** La opción correcta no puede superar este múltiplo de la media de las incorrectas. */
  maxLengthRatio: 1.5,
} as const;

const BANNED_OPTION_PHRASES = ['todas las anteriores', 'ninguna de las anteriores'];

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function meanLength(options: readonly Option[]): number {
  if (options.length === 0) {
    return 0;
  }

  return options.reduce((total, option) => total + option.text.length, 0) / options.length;
}

/** R1 · estructura del ítem. */
function checkStructure(item: Item): LintIssue[] {
  const issues: LintIssue[] = [];
  const { options } = item;

  if (
    options.length < LIMITS.minOptionsPerItem ||
    options.length > LIMITS.maxOptionsPerItem
  ) {
    issues.push({
      rule: 'R1',
      severity: 'error',
      subject: item.id,
      message: `tiene ${options.length} opciones; se esperan entre ${LIMITS.minOptionsPerItem} y ${LIMITS.maxOptionsPerItem}`,
    });
  }

  const correctCount = options.filter((option) => option.correct).length;

  if (correctCount !== 1) {
    issues.push({
      rule: 'R1',
      severity: 'error',
      subject: item.id,
      message: `tiene ${correctCount} respuestas correctas; debe haber exactamente una`,
    });
  }

  const optionIds = new Set(options.map((option) => option.id));

  if (optionIds.size !== options.length) {
    issues.push({
      rule: 'R1',
      severity: 'error',
      subject: item.id,
      message: 'tiene identificadores de opción repetidos',
    });
  }

  return issues;
}

/** R2 · justificación por opción. */
function checkRationales(item: Item): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const option of item.options) {
    if (option.rationale.trim().length < LIMITS.minRationaleLength) {
      issues.push({
        rule: 'R2',
        severity: 'error',
        subject: `${item.id}/${option.id}`,
        message: `la justificación tiene ${option.rationale.trim().length} caracteres; mínimo ${LIMITS.minRationaleLength}. Un distractor mudo enseña "esa no era", no "por qué"`,
      });
    }
  }

  const seen = new Map<string, string>();

  for (const option of item.options) {
    const key = normalize(option.rationale);
    const duplicate = seen.get(key);

    if (duplicate) {
      issues.push({
        rule: 'R2',
        severity: 'error',
        subject: `${item.id}/${option.id}`,
        message: `repite la justificación de la opción "${duplicate}"`,
      });
    } else {
      seen.set(key, option.id);
    }
  }

  return issues;
}

/** R3 · explicación del ítem. */
function checkExplanation(item: Item): LintIssue[] {
  const issues: LintIssue[] = [];
  const explanation = item.explanation.trim();

  if (explanation.length < LIMITS.minExplanationLength) {
    issues.push({
      rule: 'R3',
      severity: 'error',
      subject: item.id,
      message: `la explicación tiene ${explanation.length} caracteres; mínimo ${LIMITS.minExplanationLength}`,
    });
  }

  const normalizedExplanation = normalize(explanation);

  for (const option of item.options) {
    if (normalize(option.rationale).length > 0 && normalizedExplanation.includes(normalize(option.rationale))) {
      issues.push({
        rule: 'R3',
        severity: 'error',
        subject: item.id,
        message: `la explicación copia literalmente la justificación de "${option.id}"; debe explicar el concepto, no el error`,
      });
    }
  }

  return issues;
}

/** R7 · neutralidad de forma. */
function checkShapeNeutrality(item: Item): LintIssue[] {
  const issues: LintIssue[] = [];
  const correct = item.options.filter((option) => option.correct);
  const [correctOption] = correct;

  if (correctOption) {
    const incorrect = item.options.filter((option) => !option.correct);
    const average = meanLength(incorrect);

    if (average > 0 && correctOption.text.length > average * LIMITS.maxLengthRatio) {
      issues.push({
        rule: 'R7',
        severity: 'warning',
        subject: item.id,
        message: `la opción correcta es mucho más larga que las incorrectas (${correctOption.text.length} vs ${Math.round(average)} de media): pista de forma`,
      });
    }
  }

  for (const option of item.options) {
    const normalized = normalize(option.text);
    const banned = BANNED_OPTION_PHRASES.find((phrase) => normalized.includes(phrase));

    if (banned) {
      issues.push({
        rule: 'R7',
        severity: 'warning',
        subject: `${item.id}/${option.id}`,
        message: `usa "${banned}", que mide estrategia de examen y no conocimiento`,
      });
    }
  }

  return issues;
}

/** R4 · cobertura. */
function checkCoverage(catalog: Catalog): LintIssue[] {
  const issues: LintIssue[] = [];
  const competencyIds = new Set(catalog.competencies.map((competency) => competency.id));

  for (const competency of catalog.competencies) {
    const itemCount = catalog.items.filter((item) => item.competencyId === competency.id).length;
    const lessonCount = catalog.lessons.filter(
      (lesson) => lesson.competencyId === competency.id,
    ).length;

    if (itemCount < LIMITS.minItemsPerCompetency) {
      issues.push({
        rule: 'R4',
        severity: 'error',
        subject: competency.id,
        message: `tiene ${itemCount} ítems; mínimo ${LIMITS.minItemsPerCompetency} (con menos, el estado de la competencia nunca es fiable)`,
      });
    }

    if (lessonCount < LIMITS.minLessonsPerCompetency) {
      issues.push({
        rule: 'R4',
        severity: 'error',
        subject: competency.id,
        message: `tiene ${lessonCount} lecciones; mínimo ${LIMITS.minLessonsPerCompetency}`,
      });
    }
  }

  for (const item of catalog.items) {
    if (!competencyIds.has(item.competencyId)) {
      issues.push({
        rule: 'R4',
        severity: 'error',
        subject: item.id,
        message: `apunta a la competencia "${item.competencyId}", que no existe (ítem huérfano)`,
      });
    }
  }

  for (const lesson of catalog.lessons) {
    if (!competencyIds.has(lesson.competencyId)) {
      issues.push({
        rule: 'R4',
        severity: 'error',
        subject: lesson.competencyId,
        message: 'la lección apunta a una competencia que no existe',
      });
    }
  }

  return issues;
}

/** R5 · forma del grafo. */
function checkGraph(catalog: Catalog): LintIssue[] {
  const issues: LintIssue[] = [];
  const competencyIds = catalog.competencies.map((competency) => competency.id);
  const areaIds = new Set(catalog.areas.map((area) => area.id));
  const edges = catalog.competencies.flatMap((competency) =>
    competency.prerequisites.map((from) => ({ from, to: competency.id })),
  );

  for (const competency of catalog.competencies) {
    if (!areaIds.has(competency.areaId)) {
      issues.push({
        rule: 'R5',
        severity: 'error',
        subject: competency.id,
        message: `pertenece al área "${competency.areaId}", que no existe`,
      });
    }
  }

  try {
    topologicalLevels(competencyIds, edges);
  } catch (error) {
    issues.push({
      rule: 'R5',
      severity: 'error',
      subject: 'grafo',
      message: error instanceof Error ? error.message : 'el grafo no es válido',
    });
  }

  return issues;
}

/** R6 · referencias. */
function checkReferences(catalog: Catalog, today: IsoDate): LintIssue[] {
  const issues: LintIssue[] = [];
  const referencesById = new Map(catalog.references.map((reference) => [reference.id, reference]));

  for (const lesson of catalog.lessons) {
    for (const referenceId of lesson.referenceIds) {
      const reference = referencesById.get(referenceId);

      if (!reference) {
        issues.push({
          rule: 'R6',
          severity: 'warning',
          subject: lesson.competencyId,
          message: `cita la referencia "${referenceId}", que no existe`,
        });
        continue;
      }

      if (reference.reviewedAt > today) {
        issues.push({
          rule: 'R6',
          severity: 'warning',
          subject: reference.id,
          message: `reviewedAt (${reference.reviewedAt}) está en el futuro`,
        });
      }
    }
  }

  return issues;
}

/**
 * Ejecuta todas las reglas.
 *
 * `today` se inyecta: la comprobación de fechas no depende del reloj del sistema
 * (regla D8, aplicada al CLI).
 */
export function lintCatalog(catalog: Catalog, today: IsoDate): LintIssue[] {
  return [
    ...catalog.items.flatMap((item) => checkStructure(item)),
    ...catalog.items.flatMap((item) => checkRationales(item)),
    ...catalog.items.flatMap((item) => checkExplanation(item)),
    ...checkCoverage(catalog),
    ...checkGraph(catalog),
    ...checkReferences(catalog, today),
    ...catalog.items.flatMap((item) => checkShapeNeutrality(item)),
  ];
}

export function summarize(issues: readonly LintIssue[]): {
  errors: number;
  warnings: number;
} {
  return {
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
  };
}
