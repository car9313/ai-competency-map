'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { buildMistakeQueue, buildReviewQueue } from '../domain/queue';
import { loadAttempts } from '../infrastructure/attempts-cache';

/**
 * Contador de la cola en la barra lateral.
 *
 * Sustituye al texto fijo que había («Sin repasos pendientes»), que era una afirmación que
 * el servidor no podía hacer: no conoce el historial de este navegador.
 *
 * Muestra también los fallos cuando los hay: es la deuda más urgente, y esconderla detrás de
 * una pestaña hace que nadie la pague.
 */
export function SidebarToday({ items }: { items: readonly Item[] }) {
  const [due, setDue] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      setDue(buildReviewQueue(items, attempts, systemClock).length);
      setMistakes(buildMistakeQueue(items, attempts, systemClock).length);
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3.5">
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">Sesión de hoy</p>

      {due === null ? (
        <p className="mt-1 text-sm text-muted">Mirando…</p>
      ) : due === 0 ? (
        <p className="mt-1 text-sm text-fg">Nada vence hoy.</p>
      ) : (
        <Link href="/repaso" className="mt-1 block text-sm text-fg hover:text-accent">
          {due} {due === 1 ? 'ítem' : 'ítems'} para repasar
        </Link>
      )}

      {mistakes > 0 && (
        <Link
          href="/repaso?modo=fallos"
          className="mt-1.5 block text-xs text-accent hover:underline"
        >
          {mistakes} {mistakes === 1 ? 'fallo pendiente' : 'fallos pendientes'}
        </Link>
      )}
    </div>
  );
}
