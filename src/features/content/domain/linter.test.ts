import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content';
import type { Item, Option } from '@/shared/types/domain';
import { lintCatalog, type Catalog, type RuleId } from './linter';
import { parseCatalog } from './schema';
import type { Area, CompetencyRecord, Lesson, Reference } from './types';

/**
 * Fixture propio, no el contenido real.
 *
 * Si los tests dependieran del contenido real, cada lección nueva podría romperlos sin
 * que nada estuviera mal. Aquí se construye un catálogo mínimo válido y cada test
 * rompe **una** cosa para comprobar que la regla que corresponde se entera.
 */

const TODAY = '2026-11-19';

const OPTION_CORRECT: Option = {
  id: 'a',
  text: 'Respuesta correcta breve',
  correct: true,
  rationale:
    'Justificación de la opción correcta con longitud suficiente para pasar la regla sin avisos.',
};

const OPTION_WRONG_1: Option = {
  id: 'b',
  text: 'Distractor plausible número uno',
  correct: false,
  rationale:
    'Justificación del primer distractor, explicando por qué resulta tentador para quien se equivoca.',
};

const OPTION_WRONG_2: Option = {
  id: 'c',
  text: 'Distractor plausible número dos',
  correct: false,
  rationale:
    'Justificación del segundo distractor, explicando el razonamiento equivocado que lo hace atractivo.',
};

function makeItem(id: string, competencyId: string, overrides: Partial<Item> = {}): Item {
  return {
    id,
    competencyId,
    difficulty: 1,
    prompt: '¿Cuál es la respuesta correcta a esta pregunta de prueba?',
    options: [OPTION_CORRECT, OPTION_WRONG_1, OPTION_WRONG_2],
    explanation:
      'Explicación del concepto con la longitud mínima necesaria para que la regla la acepte sin avisos.',
    referenceId: 'ref-uno',
    ...overrides,
  };
}

function makeLesson(competencyId: string, overrides: Partial<Lesson> = {}): Lesson {
  return {
    competencyId,
    whatIs: 'Definición breve del concepto que la competencia evalúa.',
    problem: 'Problema concreto que el concepto resuelve en la práctica.',
    internals: ['Primer punto interno con detalle suficiente.', 'Segundo punto interno con detalle.'],
    whenToUse: ['Cuando aplica el concepto.'],
    whenNotToUse: ['Cuando no aplica el concepto.'],
    pitfalls: [{ title: 'Error típico', detail: 'Detalle del error que comete la gente.' }],
    referenceIds: ['ref-uno'],
    ...overrides,
  };
}

function validCatalog(): Catalog {
  const areas: Area[] = [
    { id: 'area-uno', index: '01', name: 'Área uno', description: 'Descripción del área de prueba.' },
  ];

  const competencies: CompetencyRecord[] = [
    {
      id: 'base',
      areaId: 'area-uno',
      order: 1,
      layer: 'nucleo',
      level: 1,
      title: 'Competencia base',
      claim: 'Demuestra la competencia base del catálogo de prueba.',
      prerequisites: [],
      published: true,
    },
    {
      id: 'avanzada',
      areaId: 'area-uno',
      order: 2,
      layer: 'servicio',
      level: 2,
      title: 'Competencia avanzada',
      claim: 'Demuestra la competencia avanzada, que depende de la base.',
      prerequisites: ['base'],
      published: true,
    },
  ];

  const references: Reference[] = [
    {
      id: 'ref-uno',
      title: 'Referencia de prueba',
      url: 'https://example.com/referencia',
      reviewedAt: '2026-11-01',
    },
  ];

  return {
    areas,
    competencies,
    lessons: [makeLesson('base'), makeLesson('avanzada')],
    /*
     * Ocho ítems por competencia: es el mínimo que exige el linter (R4). Con cuatro, la
     * regla de consolidación dependía demasiado de un solo fallo. El fixture tiene que
     * reflejar el listón actual, o el test pasaría por estar midiendo otra cosa.
     */
    items: [
      makeItem('item-b1', 'base'),
      makeItem('item-b2', 'base'),
      makeItem('item-b3', 'base'),
      makeItem('item-b4', 'base'),
      makeItem('item-b5', 'base'),
      makeItem('item-b6', 'base'),
      makeItem('item-b7', 'base'),
      makeItem('item-b8', 'base'),
      makeItem('item-a1', 'avanzada'),
      makeItem('item-a2', 'avanzada'),
      makeItem('item-a3', 'avanzada'),
      makeItem('item-a4', 'avanzada'),
      makeItem('item-a5', 'avanzada'),
      makeItem('item-a6', 'avanzada'),
      makeItem('item-a7', 'avanzada'),
      makeItem('item-a8', 'avanzada'),
    ],
    references,
  };
}

function rulesOf(catalog: Catalog): RuleId[] {
  return lintCatalog(catalog, TODAY).map((issue) => issue.rule);
}

function firstItem(catalog: Catalog): Item {
  const [item] = catalog.items;

  if (!item) {
    throw new Error('el fixture no tiene ítems');
  }

  return item;
}

describe('catálogo válido', () => {
  it('no produce ningún problema', () => {
    expect(lintCatalog(validCatalog(), TODAY)).toEqual([]);
  });

  it('el esquema Zod lo acepta', () => {
    expect(parseCatalog(validCatalog())).toEqual({ ok: true });
  });

  it('el contenido real del producto pasa las reglas de error', () => {
    const errors = lintCatalog(CATALOG, TODAY).filter((issue) => issue.severity === 'error');

    expect(errors).toEqual([]);
  });

  it('el contenido real pasa también el esquema', () => {
    expect(parseCatalog(CATALOG)).toEqual({ ok: true });
  });
});

describe('fixtures negativos: una regla rota cada vez', () => {
  it('R1 · dos respuestas correctas', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const duplicated: Item = {
      ...item,
      options: item.options.map((option) => ({ ...option, correct: true })),
    };

    const broken: Catalog = {
      ...catalog,
      items: [duplicated, ...catalog.items.slice(1)],
    };

    expect(rulesOf(broken)).toContain('R1');
  });

  it('R1 · dos opciones (por debajo del mínimo)', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const broken: Catalog = {
      ...catalog,
      items: [{ ...item, options: [OPTION_CORRECT, OPTION_WRONG_1] }, ...catalog.items.slice(1)],
    };

    expect(rulesOf(broken)).toContain('R1');
  });

  it('R2 · justificación vacía en un distractor', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const broken: Catalog = {
      ...catalog,
      items: [
        { ...item, options: [OPTION_CORRECT, { ...OPTION_WRONG_1, rationale: '' }, OPTION_WRONG_2] },
        ...catalog.items.slice(1),
      ],
    };

    expect(rulesOf(broken)).toContain('R2');
  });

  it('R2 · dos opciones con la misma justificación', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const broken: Catalog = {
      ...catalog,
      items: [
        {
          ...item,
          options: [
            OPTION_CORRECT,
            OPTION_WRONG_1,
            { ...OPTION_WRONG_2, rationale: OPTION_WRONG_1.rationale },
          ],
        },
        ...catalog.items.slice(1),
      ],
    };

    expect(rulesOf(broken)).toContain('R2');
  });

  it('R3 · la explicación copia una justificación', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const broken: Catalog = {
      ...catalog,
      items: [
        { ...item, explanation: `Repite lo mismo: ${OPTION_WRONG_1.rationale} y ya está.` },
        ...catalog.items.slice(1),
      ],
    };

    expect(rulesOf(broken)).toContain('R3');
  });

  it('R4 · ítem huérfano', () => {
    const catalog = validCatalog();
    const broken: Catalog = {
      ...catalog,
      items: [...catalog.items, makeItem('item-huerfano', 'competencia-inexistente')],
    };

    expect(rulesOf(broken)).toContain('R4');
  });

  it('R4 · competencia con menos de tres ítems', () => {
    const catalog = validCatalog();
    const broken: Catalog = {
      ...catalog,
      items: catalog.items.filter((item) => item.id !== 'item-a3'),
    };

    expect(rulesOf(broken)).toContain('R4');
  });

  it('R5 · ciclo en el grafo', () => {
    const catalog = validCatalog();
    const broken: Catalog = {
      ...catalog,
      competencies: catalog.competencies.map((competency) =>
        competency.id === 'base'
          ? { ...competency, prerequisites: ['avanzada'] }
          : competency,
      ),
    };

    const issues = lintCatalog(broken, TODAY);

    expect(issues.some((issue) => issue.rule === 'R5' && /ciclo/.test(issue.message))).toBe(true);
  });

  it('R5 · prerrequisito inexistente', () => {
    const catalog = validCatalog();
    const broken: Catalog = {
      ...catalog,
      competencies: catalog.competencies.map((competency) =>
        competency.id === 'avanzada'
          ? { ...competency, prerequisites: ['fantasma'] }
          : competency,
      ),
    };

    expect(rulesOf(broken)).toContain('R5');
  });

  it('R6 · referencia inexistente en una lección', () => {
    const catalog = validCatalog();
    const broken: Catalog = {
      ...catalog,
      lessons: catalog.lessons.map((lesson) =>
        lesson.competencyId === 'base' ? { ...lesson, referenceIds: ['ref-fantasma'] } : lesson,
      ),
    };

    const issues = lintCatalog(broken, TODAY);

    expect(
      issues.some((issue) => issue.rule === 'R6' && issue.severity === 'warning'),
    ).toBe(true);
  });

  it('R6 · referencia revisada en el futuro', () => {
    const catalog = validCatalog();
    const broken: Catalog = {
      ...catalog,
      references: catalog.references.map((reference) => ({
        ...reference,
        reviewedAt: '2027-01-01',
      })),
    };

    expect(rulesOf(broken)).toContain('R6');
  });

  it('R7 · la opción correcta es mucho más larga', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const broken: Catalog = {
      ...catalog,
      items: [
        {
          ...item,
          options: [
            {
              ...OPTION_CORRECT,
              text: 'Una respuesta correcta tan larga que delata la respuesta por su forma, no por su contenido real',
            },
            OPTION_WRONG_1,
            OPTION_WRONG_2,
          ],
        },
        ...catalog.items.slice(1),
      ],
    };

    const issues = lintCatalog(broken, TODAY);

    expect(issues.some((issue) => issue.rule === 'R7' && issue.severity === 'warning')).toBe(true);
  });

  it('R7 · opción con «todas las anteriores»', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const broken: Catalog = {
      ...catalog,
      items: [
        {
          ...item,
          options: [
            OPTION_CORRECT,
            OPTION_WRONG_1,
            { ...OPTION_WRONG_2, text: 'Todas las anteriores' },
          ],
        },
        ...catalog.items.slice(1),
      ],
    };

    expect(rulesOf(broken)).toContain('R7');
  });
});

describe('esquema', () => {
  it('rechaza un ítem sin enunciado', () => {
    const catalog = validCatalog();
    const item = firstItem(catalog);
    const { prompt: _omitido, ...sinPrompt } = item;
    const broken = {
      ...catalog,
      items: [sinPrompt, ...catalog.items.slice(1)],
    };

    const result = parseCatalog(broken);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path.includes('prompt'))).toBe(true);
    }
  });

  it('exige https en las referencias', () => {
    const catalog = validCatalog();
    const broken = {
      ...catalog,
      references: catalog.references.map((reference) => ({
        ...reference,
        url: 'http://example.com/insegura',
      })),
    };

    expect(parseCatalog(broken).ok).toBe(false);
  });
});
