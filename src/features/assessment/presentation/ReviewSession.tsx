'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Item } from '@/shared/types/domain';
import { systemClock } from '@/shared/time/clock';
import { buildMistakeQueue, buildReviewQueue } from '../domain/queue';
import { loadAttempts } from '../infrastructure/attempts-cache';
import { cn } from '@/shared/utils/cn';
import { ItemRunner } from './ItemRunner';

/**
 * Sesión de repaso: recorre una cola, no una competencia.
 *
 * Dos modos, y la diferencia importa:
 *
 * - **Cola de hoy**: solo lo que ya venció, en orden de atraso. Es la razón de ser del
 *   producto — volver justo cuando estás a punto de olvidar.
 * - **Solo mis fallos**: los ítems cuyo último intento fue incorrecto, sin esperar
 *   vencimiento. Un fallo reciente se repara mejor hoy que dentro de tres días.
 *
 * El orden lo decide el planificador en ambos casos, no el alumno.
 */

type Mode = 'due' | 'mistakes';

type State =
  | { kind: 'loading' }
  | { kind: 'empty'; dueCount: number; mistakeCount: number }
  | {
      kind: 'ready';
      item: Item;
      competencyId: string;
      pending: number;
      dueCount: number;
      mistakeCount: number;
    };

function tabClass(active: boolean): string {
  return cn(
    'rounded-full border px-3 py-1 text-xs transition-colors',
    active
      ? 'border-accent bg-accent-bg text-white'
      : 'border-border bg-surface text-muted hover:text-accent',
  );
}

export function ReviewSession({
  items,
  titles,
  hints,
}: {
  items: readonly Item[];
  titles: Record<string, string>;
  /** Pista de primer nivel por competencia. */
  hints: Record<string, string>;
}) {
  const params = useSearchParams();
  const mode: Mode = params.get('modo') === 'fallos' ? 'mistakes' : 'due';

  const [state, setState] = useState<State>({ kind: 'loading' });
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      const due = buildReviewQueue(items, attempts, systemClock);
      const mistakes = buildMistakeQueue(items, attempts, systemClock);
      const cola = mode === 'mistakes' ? mistakes : due;
      const [head] = cola;

      setState(
        head
          ? {
              kind: 'ready',
              item: head.item,
              competencyId: head.item.competencyId,
              pending: cola.length,
              dueCount: due.length,
              mistakeCount: mistakes.length,
            }
          : { kind: 'empty', dueCount: due.length, mistakeCount: mistakes.length },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [items, round, mode]);

  const tabs = (dueCount: number, mistakeCount: number) => (
    <nav aria-label="Modo de repaso" className="flex flex-wrap items-center gap-1.5">
      <Link
        href="/repaso"
        className={tabClass(mode === 'due')}
        aria-current={mode === 'due' ? 'page' : undefined}
      >
        La cola de hoy · {dueCount}
      </Link>
      <Link
        href="/repaso?modo=fallos"
        className={tabClass(mode === 'mistakes')}
        aria-current={mode === 'mistakes' ? 'page' : undefined}
      >
        Solo mis fallos · {mistakeCount}
      </Link>
    </nav>
  );

  if (state.kind === 'loading') {
    return <p className="text-sm text-muted">Mirando qué toca repasar…</p>;
  }

  if (state.kind === 'empty') {
    return (
      <div className="space-y-5">
        {tabs(state.dueCount, state.mistakeCount)}

        <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === 'mistakes' ? 'No tienes fallos pendientes' : 'Nada que repasar ahora mismo'}
          </h2>
          <p className="text-sm text-muted">
            {mode === 'mistakes'
              ? 'Todo lo que has fallado está ya reparado: acertaste en el último intento. Los ítems que volverán a vencer aparecen en la cola de hoy.'
              : 'La cola se llena sola cuando los ítems vencen. Mientras tanto, puedes seguir avanzando por el mapa: lo que respondas hoy volverá a aparecer aquí en su momento.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={mode === 'mistakes' ? '/repaso' : '/mapa'}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-bg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {mode === 'mistakes' ? 'Ver la cola de hoy' : 'Ir al mapa'}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {tabs(state.dueCount, state.mistakeCount)}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
          {mode === 'mistakes' ? 'Fallos' : 'Repaso'} · quedan {state.pending}
        </p>
        <Link
          href={`/c/${state.competencyId}`}
          className="text-xs text-muted underline underline-offset-4 hover:text-accent"
        >
          {titles[state.competencyId] ?? 'Competencia'}
        </Link>
      </div>

      <ItemRunner
        key={`${state.item.id}-${round}-${mode}`}
        item={state.item}
        context={titles[state.competencyId] ?? 'Repaso'}
        hint={hints[state.competencyId]}
        onNext={() => setRound((value) => value + 1)}
        nextLabel={mode === 'mistakes' ? 'Siguiente fallo' : 'Siguiente de la cola'}
        escapeHref="/"
        escapeLabel="Terminar por hoy"
      />
    </div>
  );
}
