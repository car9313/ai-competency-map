'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { cn } from '@/shared/utils/cn';
import { shuffleOptionIds, hashSeed } from '../domain/shuffle';
import type { Confidence } from '../domain/types';
import { describeDue, pickNextItem } from '../application/next-item';
import { submitAttempt, type SubmitAttemptResult } from '../application/submit-attempt';
import { openAttemptStore } from '../infrastructure/local-storage-attempt-store';
import { getDeviceId, randomId } from '../infrastructure/device-id';

/**
 * Sesión de comprobación.
 *
 * El orden de las opciones se baraja con una semilla derivada del id del intento, y ese
 * orden se guarda en `presentedOptionIds`: el intento es reproducible aunque el barajado
 * sea aleatorio (invariante I11).
 *
 * Todo el flujo funciona con teclado porque usa controles nativos: `fieldset` + `radio`.
 * No hay `div` clicable disfrazado de opción.
 */

interface Presentation {
  item: Item;
  optionIds: string[];
  attemptId: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'blocked'; missing: Array<{ id: string; title: string }> }
  | { kind: 'question'; presentation: Presentation; startedAt: number }
  | { kind: 'feedback'; presentation: Presentation; result: SubmitAttemptResult };

/** Prerrequisito tal como lo necesita el gate: su título y los ítems que lo demuestran. */
export interface PrerequisiteGate {
  id: string;
  title: string;
  itemIds: readonly string[];
}

function present(item: Item): Presentation {
  const attemptId = randomId();

  return {
    item,
    attemptId,
    optionIds: shuffleOptionIds(item.options, hashSeed(attemptId)),
  };
}

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
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [pending, setPending] = useState(false);
  const feedbackRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { store } = openAttemptStore();
      const attempts = await store.list();

      if (cancelled) return;

      /**
       * Gate de evaluación: medir sin base mide ruido.
       *
       * Se exige **alguna** evidencia en cada prerrequisito, no dominio. Es la misma
       * condición que `projectUnlocked`: basta con haber empezado.
       *
       * Ojo: esto bloquea la comprobación, nunca la lectura. La lección se abre siempre.
       */
      const attemptedItems = new Set(attempts.map((attempt) => attempt.itemId));
      const missing = prerequisites.filter((prerequisite) =>
        prerequisite.itemIds.every((itemId) => !attemptedItems.has(itemId)),
      );

      if (missing.length > 0) {
        setState({ kind: 'blocked', missing: missing.map(({ id, title: name }) => ({ id, title: name })) });
        return;
      }

      const next = pickNextItem(items, attempts, systemClock);

      if (!next) {
        setState({ kind: 'empty' });
        return;
      }

      setState({ kind: 'question', presentation: present(next.item), startedAt: Date.now() });
      setSelected(null);
      setConfidence(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    if (state.kind === 'feedback') {
      feedbackRef.current?.focus();
    }
  }, [state.kind]);

  const answer = async (presentation: Presentation, startedAt: number) => {
    if (!selected || !confidence || pending) return;

    setPending(true);

    const { store } = openAttemptStore();
    const result = await submitAttempt(store, {
      item: presentation.item,
      selectedOptionId: selected,
      confidence,
      presentedOptionIds: presentation.optionIds,
      durationMs: Date.now() - startedAt,
      deviceId: getDeviceId(),
      attemptId: presentation.attemptId,
      clock: systemClock,
    });

    setPending(false);
    setState({ kind: 'feedback', presentation, result });
  };

  if (state.kind === 'loading') {
    return <p className="text-sm text-muted">Preparando la comprobación…</p>;
  }

  if (state.kind === 'blocked') {
    return (
      <section className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-amber-700 dark:text-amber-300">
            Todavía no puedes comprobar esto
          </h2>
          <p className="text-sm text-muted">
            La lección puedes leerla cuando quieras. La comprobación espera a que tengas
            evidencia en lo que va antes, porque medir sin base mide ruido y no conocimiento.
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

  if (state.kind === 'empty') {    return (
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Esta competencia todavía no tiene ítems para comprobar.
      </p>
    );
  }

  if (state.kind === 'feedback') {
    const { presentation, result } = state;
    const chosen = presentation.item.options.find((option) => option.id === selected);
    const right = presentation.item.options.find((option) => option.correct);

    return (
      <section className="space-y-5">
        <header
          ref={feedbackRef}
          tabIndex={-1}
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4 outline-none',
            result.correct
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-rose-500/30 bg-rose-500/5',
          )}
        >
          {result.correct ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />
          )}
          <div className="space-y-1">
            <h2 className="text-base font-semibold">
              {result.correct ? 'Correcto' : 'Incorrecto'}
            </h2>
            <p className="text-sm text-muted">
              {describeDue(result.next, systemClock)}
              {result.correct
                ? ` · intervalo ${result.previous.intervalDays} → ${result.next.intervalDays} días`
                : ' · el intervalo vuelve a empezar'}
            </p>
          </div>
        </header>

        {chosen && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold">Por qué esta opción</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{chosen.rationale}</p>
          </div>
        )}

        {!result.correct && right && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              La correcta era: {right.text}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{right.rationale}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold">Explicación</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {presentation.item.explanation}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setConfidence(null);
            void (async () => {
              const { store } = openAttemptStore();
              const attempts = await store.list();
              const next = pickNextItem(items, attempts, systemClock);

              setState(
                next
                  ? { kind: 'question', presentation: present(next.item), startedAt: Date.now() }
                  : { kind: 'empty' },
              );
            })();
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Siguiente ítem
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    );
  }

  const { presentation, startedAt } = state;

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void answer(presentation, startedAt);
      }}
    >
      <p className="text-xs text-muted">
        {title} · nivel {presentation.item.difficulty}
      </p>

      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">{presentation.item.prompt}</legend>

        <div className="space-y-2">
          {presentation.optionIds.map((optionId) => {
            const option = presentation.item.options.find((entry) => entry.id === optionId);

            if (!option) return null;

            return (
              <label
                key={optionId}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors',
                  selected === optionId
                    ? 'border-accent bg-accent-soft'
                    : 'border-border bg-surface hover:border-accent/40',
                )}
              >
                <input
                  type="radio"
                  name="opcion"
                  value={optionId}
                  checked={selected === optionId}
                  onChange={() => setSelected(optionId)}
                  className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                />
                <span>{option.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">¿Cómo de seguro estás?</legend>
        <p className="text-xs text-muted">
          La confianza cambia cuándo vuelve el ítem: acertar con dudas vuelve antes que acertar
          con seguridad.
        </p>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'confident', label: 'Seguro' },
              { value: 'doubtful', label: 'Con dudas' },
            ] as const
          ).map((entry) => (
            <label
              key={entry.value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                confidence === entry.value
                  ? 'border-accent bg-accent-soft'
                  : 'border-border bg-surface hover:border-accent/40',
              )}
            >
              <input
                type="radio"
                name="confianza"
                value={entry.value}
                checked={confidence === entry.value}
                onChange={() => setConfidence(entry.value)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {entry.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!selected || !confidence || pending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Guardando…' : 'Comprobar'}
        </button>

        <Link
          href={`/c/${competencyId}`}
          className="text-sm text-muted underline underline-offset-4 hover:text-accent"
        >
          Volver a la lección
        </Link>
      </div>
    </form>
  );
}
