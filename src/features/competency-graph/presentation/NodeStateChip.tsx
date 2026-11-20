'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import type { CompetencyState } from '@/features/assessment';
import { projectState } from '@/features/assessment/domain/projection';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { loadAttempts } from '@/features/assessment/infrastructure/attempts-cache';
import { STATE_LABEL, STATE_TONE } from '@/features/assessment/presentation/state-labels';

/**
 * Estado de un nodo del mapa, calculado con el historial de este navegador.
 *
 * El mapa se sirve desde el servidor por SEO, así que su HTML no puede saber qué has
 * respondido. Este es el punto donde el progreso personal entra en la tarjeta: el título y
 * la descripción siguen siendo estáticos, pero la etiqueta de estado es viva.
 *
 * Sin evidencia se muestra la etiqueta del grafo («evaluable», «faltan previos»), que sigue
 * siendo cierta; con evidencia, manda el estado real.
 */
export function NodeStateChip({
  items,
  fallbackLabel,
  fallbackFill,
  fallbackStroke,
  locked,
}: {
  items: readonly Item[];
  fallbackLabel: string;
  fallbackFill: string;
  fallbackStroke: string;
  locked: boolean;
}) {
  const [state, setState] = useState<CompetencyState | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      setState(projectState(items, attempts, systemClock));
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const live = state !== null && state !== 'no_evidence';

  return (
    <span className="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[10px] whitespace-nowrap">
      {live ? (
        <>
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-current"
            style={{ color: 'currentColor' }}
          />
          <span className={STATE_TONE[state]}>{STATE_LABEL[state]}</span>
        </>
      ) : (
        <span className="flex items-center gap-1.5 text-muted">
          {locked ? (
            <Lock className="h-3 w-3" aria-hidden="true" />
          ) : (
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: fallbackFill, border: `1px solid ${fallbackStroke}` }}
            />
          )}
          {fallbackLabel}
        </span>
      )}
    </span>
  );
}
