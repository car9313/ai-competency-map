'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Item } from '@/shared/types/domain';
import { systemClock } from '@/shared/time/clock';
import { buildReviewQueue } from '../domain/queue';
import { loadAttempts } from '../infrastructure/attempts-cache';
import { ItemRunner } from './ItemRunner';

/**
 * Sesión de repaso: recorre la cola del día, no una competencia.
 *
 * La diferencia con la comprobación importa: aquí solo entra lo que **ya venció**. Es la
 * razón de ser del producto — volver justo cuando estás a punto de olvidar — y por eso el
 * orden lo decide el planificador, no el alumno.
 */

type State =
  | { kind: 'loading' }
  | { kind: 'empty'; total: number }
  | { kind: 'ready'; item: Item; competencyId: string; pending: number };

export function ReviewSession({
  items,
  titles,
}: {
  items: readonly Item[];
  titles: Record<string, string>;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      const queue = buildReviewQueue(items, attempts, systemClock);
      const [head] = queue;

      setState(
        head
          ? {
              kind: 'ready',
              item: head.item,
              competencyId: head.item.competencyId,
              pending: queue.length,
            }
          : { kind: 'empty', total: 0 },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [items, round]);

  if (state.kind === 'loading') {
    return <p className="text-sm text-muted">Mirando qué toca repasar…</p>;
  }

  if (state.kind === 'empty') {
    return (
      <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold tracking-tight">Nada que repasar ahora mismo</h2>
        <p className="text-sm text-muted">
          La cola se llena sola cuando los ítems vencen. Mientras tanto, puedes seguir avanzando
          por el mapa: lo que respondas hoy volverá a aparecer aquí en su momento.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Ir al mapa
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
          Repaso · quedan {state.pending}
        </p>
        <Link
          href={`/c/${state.competencyId}`}
          className="text-xs text-muted underline underline-offset-4 hover:text-accent"
        >
          {titles[state.competencyId] ?? 'Competencia'}
        </Link>
      </div>

      <ItemRunner
        key={`${state.item.id}-${round}`}
        item={state.item}
        context={titles[state.competencyId] ?? 'Repaso'}
        onNext={() => setRound((value) => value + 1)}
        nextLabel="Siguiente de la cola"
        escapeHref="/"
        escapeLabel="Terminar por hoy"
      />
    </div>
  );
}
