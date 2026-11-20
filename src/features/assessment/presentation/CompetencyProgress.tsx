'use client';

import { useEffect, useState } from 'react';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { foldSchedule } from '../domain/fold';
import { projectState, type CompetencyState } from '../domain/projection';
import { describeDue } from '../application/next-item';
import { openAttemptStore } from '../infrastructure/local-storage-attempt-store';
import { STATE_LABEL, STATE_TONE } from './state-labels';

/**
 * Estado de la competencia según la evidencia guardada.
 *
 * No hay estado persistido: esto se recalcula en el cliente a partir del historial
 * (invariante I15). Es la pieza que cierra el bucle de S6: respondes, vuelves a la
 * lección y ves qué cambió.
 *
 * Se calcula en el cliente a propósito. El HTML estático no puede saber qué ha respondido
 * este navegador, y fingir un estado en el servidor sería inventarlo.
 */

export function CompetencyProgress({ items }: { items: readonly Item[] }) {
  const [state, setState] = useState<{ state: CompetencyState; due: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { store } = openAttemptStore();
      const attempts = await store.list();

      if (cancelled) return;

      const projected = projectState(items, attempts, systemClock);

      // El próximo repaso es el del ítem que antes vence de los que ya tienen historial.
      const attempted = new Set(attempts.map((attempt) => attempt.itemId));
      const schedules = items
        .filter((item) => attempted.has(item.id))
        .map((item) => foldSchedule(item.id, attempts, systemClock));

      const next = schedules.sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];

      setState({
        state: projected,
        due: next ? describeDue(next, systemClock) : '',
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!state) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px]">
      <span className={STATE_TONE[state.state]}>{STATE_LABEL[state.state]}</span>
      {state.due && <span className="text-muted">· {state.due}</span>}
    </span>
  );
}
