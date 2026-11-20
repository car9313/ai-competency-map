'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { systemClock } from '@/shared/time/clock';
import type { Attempt, Phase } from '../domain/types';
import { traceItemSchedule } from '../domain/trace';
import { loadAttempts } from '../infrastructure/attempts-cache';

/**
 * Historial de intentos.
 *
 * El producto afirma que el progreso sale de la evidencia. Esta pantalla es donde esa
 * afirmación se puede comprobar: cada intento con su fecha, su confianza y **lo que le hizo
 * al planificador**. Sin ese último dato, las fechas son magia; con él, son una decisión.
 *
 * Se calcula en el cliente porque depende del historial de este navegador. No hay ningún
 * estado de planificación guardado: todo sale de plegar los intentos (invariante I15).
 */

const PHASE_LABEL: Record<Phase, string> = {
  new: 'nuevo',
  learning: 'aprendiendo',
  review: 'en repaso',
  relearning: 'en recuperación',
};

interface ItemRef {
  id: string;
  prompt: string;
  competencyId: string;
}

interface Props {
  readonly items: readonly ItemRef[];
  readonly titles: Readonly<Record<string, string>>;
}

function formatDate(isoTimestamp: string): string {
  // La misma fecha que usa el planificador: la parte UTC, sin reinterpretarla.
  return isoTimestamp.slice(0, 10);
}

export function AttemptHistory({ items, titles }: Props) {
  const [attempts, setAttempts] = useState<readonly Attempt[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const loaded = await loadAttempts();

      if (!cancelled) setAttempts(loaded);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!attempts) {
    return <p className="text-sm text-muted">Leyendo el historial…</p>;
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6">
        <h2 className="text-base font-semibold">Todavía no has respondido nada</h2>
        <p className="mt-2 text-sm text-muted">
          Este historial se llena solo: cada respuesta, con la fecha y con lo que le hizo a la
          programación del ítem.
        </p>
      </div>
    );
  }

  const itemById = new Map(items.map((item) => [item.id, item]));
  const porCompetencia = new Map<string, Map<string, readonly Attempt[]>>();

  for (const attempt of attempts) {
    const item = itemById.get(attempt.itemId);

    if (!item) continue; // Ítem retirado del catálogo: no hay nada que explicar.

    const porItem = porCompetencia.get(item.competencyId) ?? new Map<string, readonly Attempt[]>();
    const previos = porItem.get(item.id) ?? [];

    porItem.set(item.id, [...previos, attempt]);
    porCompetencia.set(item.competencyId, porItem);
  }

  const competenciasConEvidencia = porCompetencia.size;
  const itemsPracticados = new Set(attempts.map((attempt) => attempt.itemId)).size;
  const ultimo = [...attempts].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))[0];

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-4">
        <div>
          <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">Intentos</dt>
          <dd className="font-mono text-xl">{attempts.length}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">Ítems</dt>
          <dd className="font-mono text-xl">{itemsPracticados}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">Competencias</dt>
          <dd className="font-mono text-xl">{competenciasConEvidencia}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">Último</dt>
          <dd className="font-mono text-sm">{ultimo ? formatDate(ultimo.answeredAt) : '—'}</dd>
        </div>
      </dl>

      {[...porCompetencia.entries()].map(([competencyId, porItem]) => (
        <section key={competencyId} className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">
            {titles[competencyId] ?? competencyId}
          </h2>

          <ul className="space-y-4">
            {[...porItem.entries()].map(([itemId, delItem]) => {
              const item = itemById.get(itemId);
              const trace = traceItemSchedule(itemId, delItem, systemClock);

              return (
                <li key={itemId} className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-sm leading-snug">{item?.prompt ?? itemId}</p>

                  <ol className="mt-3 space-y-2">
                    {trace.map(({ attempt, before, after }) => (
                      <li
                        key={attempt.id}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs"
                      >
                        {attempt.correct ? (
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-300"
                            aria-label="Correcto"
                          />
                        ) : (
                          <XCircle
                            className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-300"
                            aria-label="Incorrecto"
                          />
                        )}

                        <time dateTime={attempt.answeredAt} className="font-mono text-muted">
                          {formatDate(attempt.answeredAt)}
                        </time>

                        <span className="text-muted">
                          {attempt.confidence === 'confident' ? 'con seguridad' : 'con dudas'}
                        </span>

                        <span className="text-muted">
                          {PHASE_LABEL[before.phase]} → {PHASE_LABEL[after.phase]}
                        </span>

                        <span className="font-mono text-muted">
                          {before.intervalDays} → {after.intervalDays} d
                        </span>

                        <span className="font-mono text-text">vuelve el {after.dueAt}</span>
                      </li>
                    ))}
                  </ol>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
