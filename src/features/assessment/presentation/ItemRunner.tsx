'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { cn } from '@/shared/utils/cn';
import { hashSeed, shuffleOptionIds } from '../domain/shuffle';
import type { Confidence } from '../domain/types';
import { describeDue } from '../application/next-item';
import { submitAttempt, type SubmitAttemptResult } from '../application/submit-attempt';
import { openAttemptStore } from '../infrastructure/local-storage-attempt-store';
import { forgetAttempts } from '../infrastructure/attempts-cache';
import { getDeviceId, randomId } from '../infrastructure/device-id';

/**
 * Una pregunta, de principio a fin.
 *
 * Se extrajo para que la comprobación por competencia y la sesión de repaso compartan el
 * mismo comportamiento: era la única forma de no duplicar la lógica de barajado, confianza
 * y feedback en dos pantallas que deben sentirse idénticas.
 *
 * El padre debe montarlo con `key={item.id}`: así el estado se reinicia al cambiar de ítem
 * sin necesidad de sincronizarlo a mano.
 */

export interface ItemRunnerProps {
  item: Item;
  /** Línea de contexto: competencia y nivel. */
  context: string;
  onNext: () => void;
  nextLabel?: string;
  /** Enlace de escape (por ejemplo, volver a la lección). */
  escapeHref?: string;
  escapeLabel?: string;
}

interface Presentation {
  item: Item;
  optionIds: string[];
  attemptId: string;
  startedAt: number;
}

export function ItemRunner({
  item,
  context,
  onNext,
  nextLabel = 'Siguiente ítem',
  escapeHref,
  escapeLabel,
}: ItemRunnerProps) {
  const [presentation] = useState<Presentation>(() => {
    const attemptId = randomId();

    return {
      item,
      attemptId,
      optionIds: shuffleOptionIds(item.options, hashSeed(attemptId)),
      startedAt: Date.now(),
    };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SubmitAttemptResult | null>(null);
  const feedbackRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (result) feedbackRef.current?.focus();
  }, [result]);

  const answer = async () => {
    if (!selected || !confidence || pending) return;

    setPending(true);

    const submitted = await submitAttempt(openAttemptStore().store, {
      item,
      selectedOptionId: selected,
      confidence,
      presentedOptionIds: presentation.optionIds,
      durationMs: Date.now() - presentation.startedAt,
      deviceId: getDeviceId(),
      attemptId: presentation.attemptId,
      clock: systemClock,
    });

    forgetAttempts();
    setPending(false);
    setResult(submitted);
  };

  if (result) {
    const chosen = item.options.find((option) => option.id === selected);
    const right = item.options.find((option) => option.correct);

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
            <h2 className="text-base font-semibold">{result.correct ? 'Correcto' : 'Incorrecto'}</h2>
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
            <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              La correcta era: {right.text}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{right.rationale}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold">Explicación</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{item.explanation}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-bg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {escapeHref && (
            <Link
              href={escapeHref}
              className="text-sm text-muted underline underline-offset-4 hover:text-accent"
            >
              {escapeLabel ?? 'Volver'}
            </Link>
          )}
        </div>
      </section>
    );
  }

  const falta = !selected
    ? 'Elige una opción para poder comprobar.'
    : !confidence
      ? 'Falta decir cómo de seguro estás.'
      : null;

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void answer();
      }}
    >
      <p className="text-xs text-muted">
        {context} · nivel {item.difficulty}
      </p>

      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">{item.prompt}</legend>

        <div className="space-y-2">
          {presentation.optionIds.map((optionId) => {
            const option = item.options.find((entry) => entry.id === optionId);

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
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-bg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Guardando…' : 'Comprobar'}
        </button>

        {escapeHref && (
          <Link
            href={escapeHref}
            className="text-sm text-muted underline underline-offset-4 hover:text-accent"
          >
            {escapeLabel ?? 'Volver'}
          </Link>
        )}
      </div>

      {/* Un botón deshabilitado sin explicación deja al usuario adivinando qué le falta.
          Es lo que pasó al probar la comprobación marcando solo la confianza. */}
      <p role="status" className="text-xs text-amber-700 dark:text-amber-300">
        {falta ?? ''}
      </p>
    </form>
  );
}
