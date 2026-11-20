'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlarmClock, CheckCircle2, Layers, Plus } from 'lucide-react';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { foldSchedule } from '../domain/fold';
import { buildReviewQueue } from '../domain/queue';
import { projectState } from '../domain/projection';
import { daysBetween } from '../domain/date';
import { loadAttempts } from '../infrastructure/attempts-cache';

/**
 * La cola del día.
 *
 * Se calcula entera en el cliente porque depende del historial de este navegador. El HTML
 * estático sirve el marco y el estado vacío; el contenido real aparece al montar. Es la
 * misma razón por la que el mapa no puede mostrar estados personales desde el servidor.
 */

interface Summary {
  dueItems: number;
  overdueItems: number;
  byCompetency: Array<{ id: string; title: string; count: number }>;
  nextDueAt: string | null;
  nextDueIn: number | null;
  withEvidence: number;
  consolidated: number;
  totalCompetencies: number;
  neverSeen: number;
}

export function TodayQueue({
  items,
  titles,
  competencies,
}: {
  items: readonly Item[];
  titles: Record<string, string>;
  competencies: Array<{ id: string; itemIds: readonly string[] }>;
}) {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      const queue = buildReviewQueue(items, attempts, systemClock);
      const attempts_ = attempts as readonly (typeof attempts)[number][];

      const grouped = new Map<string, number>();

      for (const entry of queue) {
        const id = entry.item.competencyId;

        grouped.set(id, (grouped.get(id) ?? 0) + 1);
      }

      const attemptedItems = new Set(attempts_.map((attempt) => attempt.itemId));

      // Próximo vencimiento futuro, para el estado vacío.
      const upcoming = items
        .filter((item) => attemptedItems.has(item.id))
        .map((item) => foldSchedule(item.id, attempts_, systemClock))
        .filter((schedule) => schedule.dueAt > systemClock.today())
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];

      const states = competencies.map((competency) =>
        projectState(
          items.filter((item) => competency.itemIds.includes(item.id)),
          attempts_,
          systemClock,
        ),
      );

      setSummary({
        dueItems: queue.length,
        overdueItems: queue.filter((entry) => entry.overdueDays > 0).length,
        byCompetency: [...grouped.entries()]
          .map(([id, count]) => ({ id, title: titles[id] ?? id, count }))
          .sort((a, b) => b.count - a.count),
        nextDueAt: upcoming?.dueAt ?? null,
        nextDueIn: upcoming ? daysBetween(systemClock.today(), upcoming.dueAt) : null,
        withEvidence: states.filter((state) => state !== 'no_evidence').length,
        consolidated: states.filter((state) => state === 'consolidated').length,
        totalCompetencies: competencies.length,
        neverSeen: items.filter((item) => !attemptedItems.has(item.id)).length,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [items, titles, competencies]);

  if (!summary) {
    return <p className="text-sm text-muted">Mirando qué toca hoy…</p>;
  }

  if (summary.dueItems === 0) {
    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold tracking-tight">Nada vence hoy</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {summary.nextDueAt
              ? `Tu próximo repaso es el ${summary.nextDueAt}${
                  summary.nextDueIn === 1 ? ' (mañana)' : ` (en ${summary.nextDueIn} días)`
                }.`
              : 'Todavía no has respondido nada, así que no hay nada programado.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Ver el mapa
            </Link>
            {summary.neverSeen > 0 && (
              <span className="inline-flex items-center gap-1.5 self-center font-mono text-[11px] text-muted">
                <Plus className="h-3 w-3" aria-hidden="true" />
                {summary.neverSeen} ítems sin estrenar
              </span>
            )}
          </div>
        </section>

        <Stats summary={summary} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-accent/40 bg-surface p-6">
        <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">
          <AlarmClock className="h-3.5 w-3.5" aria-hidden="true" />
          Repaso de hoy
        </p>

        <p className="mt-2 text-3xl font-bold tracking-tight">
          {summary.dueItems} {summary.dueItems === 1 ? 'ítem' : 'ítems'}
        </p>
        <p className="mt-1 text-sm text-muted">
          {summary.overdueItems === summary.dueItems
            ? 'Todos con retraso. Empieza por el más atrasado.'
            : summary.overdueItems > 0
              ? `${summary.overdueItems} con retraso; el resto vencen hoy.`
              : 'Todos vencen hoy.'}
        </p>

        <Link
          href="/repaso"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Empezar el repaso
        </Link>

        <ul className="mt-5 space-y-2 border-t border-border pt-4">
          {summary.byCompetency.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-3 text-sm">
              <Link
                href={`/c/${entry.id}`}
                className="min-w-0 truncate text-muted transition-colors hover:text-accent"
              >
                {entry.title}
              </Link>
              <span className="shrink-0 font-mono text-[11px] text-muted">{entry.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <Stats summary={summary} />
    </div>
  );
}

function Stats({ summary }: { summary: Summary }) {
  const rows = [
    {
      icon: Layers,
      label: 'competencias con evidencia',
      value: `${summary.withEvidence} / ${summary.totalCompetencies}`,
    },
    { icon: CheckCircle2, label: 'consolidadas', value: `${summary.consolidated}` },
    { icon: Plus, label: 'ítems sin estrenar', value: `${summary.neverSeen}` },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <li key={row.label} className="rounded-xl border border-border bg-surface p-4">
          <row.icon className="h-4 w-4 text-muted" aria-hidden="true" />
          <p className="mt-2 font-mono text-lg">{row.value}</p>
          <p className="text-[11px] text-muted">{row.label}</p>
        </li>
      ))}
    </ul>
  );
}
