'use client';

import { useEffect, useState } from 'react';
import type { Practice } from '@/features/content/domain/types';
import { loadPractice, toggleCriterion } from '../infrastructure/practice-store';

/**
 * Práctica con rúbrica.
 *
 * El resto del producto pide reconocer; esto pide producir. No hay corrección automática y
 * el texto lo dice sin rodeos: marcar criterios es una autoevaluación, no una prueba
 * superada. Por eso tampoco toca el estado de la competencia.
 */
export function PracticePanel({
  competencyId,
  practice,
}: {
  competencyId: string;
  practice: Practice;
}) {
  const [marcados, setMarcados] = useState<readonly number[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const guardado = loadPractice()[competencyId] ?? [];

      if (cancelled) return;

      setMarcados(guardado);
    })();

    return () => {
      cancelled = true;
    };
  }, [competencyId]);

  const total = practice.rubric.length;
  const hechos = marcados?.length ?? 0;

  return (
    <section className="space-y-4 rounded-xl border border-accent/30 bg-surface p-4">
      <div className="space-y-1">
        <p className="font-mono text-[10px] tracking-wide text-accent uppercase">Práctica</p>
        <h2 className="text-base font-semibold">{practice.title}</h2>
        <p className="text-xs text-muted">
          Sin corrección automática: no hay respuesta que comparar. Marca los criterios cuando
          los cumplas; no cuentan como evidencia ni cambian el estado de la competencia.
        </p>
      </div>

      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        {practice.steps.map((paso) => (
          <li key={paso}>{paso}</li>
        ))}
      </ol>

      <div className="space-y-2">
        <p className="text-sm font-semibold">
          Autoevaluación{' '}
          <span className="font-mono text-xs font-normal text-muted">
            {hechos} de {total}
          </span>
        </p>

        <ul className="space-y-1.5">
          {practice.rubric.map((criterio, index) => (
            <li key={criterio}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={(marcados ?? []).includes(index)}
                  onChange={() => setMarcados(toggleCriterion(competencyId, index)[competencyId] ?? [])}
                  className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                />
                <span className="leading-relaxed">{criterio}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
