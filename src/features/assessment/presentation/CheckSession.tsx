'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Item } from '@/shared/types/domain';
import { systemClock } from '@/shared/time/clock';
import { pickNextItem } from '../application/next-item';
import { loadAttempts } from '../infrastructure/attempts-cache';
import { ItemRunner } from './ItemRunner';

/**
 * Comprobación de una competencia.
 *
 * Es la cáscara: decide qué se puede hacer (gate de prerrequisitos), qué ítem toca y cuándo
 * recargar. La pregunta en sí vive en `ItemRunner`, compartida con la sesión de repaso.
 *
 * Estado del gate: se exige **alguna** evidencia en cada prerrequisito, no dominio. Es la
 * misma condición que `projectUnlocked`.
 */

export interface PrerequisiteGate {
  id: string;
  title: string;
  itemIds: readonly string[];
}

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'blocked'; missing: Array<{ id: string; title: string }> }
  | { kind: 'ready'; item: Item };

export function CheckSession({
  competencyId,
  title,
  items,
  prerequisites,
}: {
  competencyId: string;
  title: string;
  items: readonly Item[];
  prerequisites: readonly PrerequisiteGate[];
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      const attemptedItems = new Set(attempts.map((attempt) => attempt.itemId));
      const missing = prerequisites.filter((prerequisite) =>
        prerequisite.itemIds.every((itemId) => !attemptedItems.has(itemId)),
      );

      if (missing.length > 0) {
        setState({
          kind: 'blocked',
          missing: missing.map(({ id, title: name }) => ({ id, title: name })),
        });
        return;
      }

      const next = pickNextItem(items, attempts, systemClock);

      setState(next ? { kind: 'ready', item: next.item } : { kind: 'empty' });
    })();

    return () => {
      cancelled = true;
    };
  }, [prerequisites, items, round]);

  if (state.kind === 'loading') {
    return <p className="text-sm text-muted">Preparando la comprobación…</p>;
  }

  if (state.kind === 'empty') {
    return (
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Esta competencia todavía no tiene ítems para comprobar.
      </p>
    );
  }

  if (state.kind === 'blocked') {
    return (
      <section className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-amber-700 dark:text-amber-300">
            Todavía no puedes comprobar esto
          </h2>
          <p className="text-sm text-muted">
            La lección puedes leerla cuando quieras. La comprobación espera a que tengas evidencia
            en lo que va antes, porque medir sin base mide ruido y no conocimiento.
          </p>
        </div>

        <ul className="space-y-2">
          {state.missing.map((prerequisite) => (
            <li key={prerequisite.id}>
              <Link
                href={`/c/${prerequisite.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-accent underline underline-offset-4"
              >
                {prerequisite.title}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={`/c/${competencyId}`}
          className="inline-block text-sm text-muted underline underline-offset-4 hover:text-accent"
        >
          Volver a la lección
        </Link>
      </section>
    );
  }

  return (
    <ItemRunner
      key={`${state.item.id}-${round}`}
      item={state.item}
      context={title}
      onNext={() => setRound((value) => value + 1)}
      nextLabel="Siguiente ítem"
      escapeHref={`/c/${competencyId}`}
      escapeLabel="Volver a la lección"
    />
  );
}
