/**
 * Esquema del contenido (forma) — separado del linter (significado).
 *
 * Zod comprueba que el dato está bien construido: campos obligatorios, tipos, mínimos.
 * El linter comprueba que significa algo: una sola respuesta correcta, justificación en
 * cada distractor, cobertura. Un esquema que intentara validar "¿la explicación es
 * buena?" sería un esquema que miente.
 *
 * Ver docs/quality/content-linter.md
 */
import { z } from 'zod';

export const AreaSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id en kebab-case'),
  index: z.string().regex(/^\d{2}$/, 'índice de dos dígitos'),
  name: z.string().min(3),
  description: z.string().min(20),
});

export const LayerSchema = z.enum(['nucleo', 'servicio', 'interfaz']);
export const LevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const CompetencyRecordSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id en kebab-case'),
  areaId: z.string().min(1),
  order: z.number().int().nonnegative(),
  layer: LayerSchema,
  level: LevelSchema,
  title: z.string().min(5),
  claim: z.string().min(20),
  prerequisites: z.array(z.string().min(1)),
});

export const ReferenceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5),
  url: z.string().regex(/^https:\/\/\S+$/, 'las referencias deben ser URL https'),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha AAAA-MM-DD'),
});

export const LessonSchema = z.object({
  competencyId: z.string().min(1),
  whatIs: z.string().min(20),
  problem: z.string().min(20),
  internals: z.array(z.string().min(10)).min(2),
  whenToUse: z.array(z.string().min(5)).min(1),
  whenNotToUse: z.array(z.string().min(5)).min(1),
  pitfalls: z
    .array(z.object({ title: z.string().min(3), detail: z.string().min(10) }))
    .min(1),
  referenceIds: z.array(z.string().min(1)).min(1),
});

export const OptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean(),
  rationale: z.string().min(1),
});

export const ItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id en kebab-case'),
  competencyId: z.string().min(1),
  difficulty: LevelSchema,
  prompt: z.string().min(10),
  options: z.array(OptionSchema).min(2).max(5),
  explanation: z.string().min(10),
  referenceId: z.string().min(1),
});

export const CatalogSchema = z.object({
  areas: z.array(AreaSchema),
  competencies: z.array(CompetencyRecordSchema),
  lessons: z.array(LessonSchema),
  items: z.array(ItemSchema),
  references: z.array(ReferenceSchema),
});

export type SchemaIssue = {
  path: string;
  message: string;
};

/** Valida la forma del catálogo. No lanza: devuelve los problemas. */
export function parseCatalog(input: unknown): { ok: true } | { ok: false; issues: SchemaIssue[] } {
  const result = CatalogSchema.safeParse(input);

  if (result.success) {
    return { ok: true };
  }

  return {
    ok: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.') || '(raíz)',
      message: issue.message,
    })),
  };
}
