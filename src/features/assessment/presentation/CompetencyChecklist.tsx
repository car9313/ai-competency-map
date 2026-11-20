'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { foldSchedule } from '../domain/fold';
import { projectItemOutcome } from '../domain/projection';
import { loadAttempts } from '../infrastructure/attempts-cache';

/**
 * Cómo va cada ítem de la competencia.
 *
 * Responde a «¿cómo sé si la aprendí?» sin un porcentaje de acierto. Un porcentaje mezcla
 * ítems, ignora la confianza y la antigüedad, y no dice qué hacer al respecto. El resultado
 * por ítem sí: se ve de un vistazo qué falta.
 *
 * La competencia se considera consolidada cuando **todos** sus ítems tienen el último
 * intento correcto y ninguno está en recuperación. No es «la mayoría»: es todos.
 */

interface Row {
  id: string;
  prompt: string;
  outcome: 'no_evidence' | 'correct' | 'incorrect';
  dueAt: string | null;
}

export function CompetencyChecklist({ items }: { items: readonly Item[] }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      setRows(
        items.map((item) => {
          const outcome = projectItemOutcome(item.id, attempts);
          const schedule = foldSchedule(item.id, attempts, systemClock);

          return {
            id: item.id,
            prompt: item.prompt,
            outcome,
            dueAt: outcome === 'no_evidence' ? null : schedule.dueAt,
          };
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!rows) return null;

  // Sin ningún intento no aporta nada: la tarjeta de «Comprobar» ya invita a empezar.
  if (rows.every((row) => row.outcome === 'no_evidence')) return null;

  const correct = rows.filter((row) => row.outcome === 'correct').length;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Tus ítems en esta competencia</h3>
        <span className="font-mono text-[11px] text-muted">
          {correct} de {rows.length} con el último intento correcto
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-2 text-sm">
            {row.outcome === 'correct' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            ) : row.outcome === 'incorrect' ? (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-300" aria-hidden="true" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            )}

            <span className="min-w-0 flex-1">
              <span className="block leading-snug text-muted">{row.prompt}</span>
              <span className="font-mono text-[10px] text-muted">
                {row.outcome === 'no_evidence'
                  ? 'sin intentar'
                  : row.outcome === 'correct'
                    ? `acertado · vuelve el ${row.dueAt}`
                    : `fallado · vuelve el ${row.dueAt}`}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted">
        La competencia se marca como consolidada cuando <strong>todos</strong> sus ítems tienen
        el último intento correcto, no una mayoría.
      </p>
    </div>
  );
}
