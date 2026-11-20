'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import type { CompetencyRecord } from '@/features/content/domain/types';
import type { Prerequisite } from '@/shared/types/domain';
import { systemClock } from '@/shared/time/clock';
import { projectStateByIds, projectUnlocked } from '@/features/assessment/domain/projection';
import type { Attempt } from '@/features/assessment/domain/types';
import { loadAttempts } from '@/features/assessment/infrastructure/attempts-cache';
import { STATE_LABEL, STATE_TONE } from '@/features/assessment/presentation/state-labels';
import { prerequisiteClosure } from '../application/path';

/**
 * Ruta hasta un objetivo.
 *
 * El estado se calcula en el cliente porque depende de los intentos de este navegador. Lo que
 * se sirve desde el servidor es el grafo y los títulos, que no cambian.
 */

interface Props {
  readonly competencies: readonly CompetencyRecord[];
  readonly areaNames: Readonly<Record<string, string>>;
  readonly itemIdsByCompetency: Readonly<Record<string, readonly string[]>>;
  readonly edges: readonly Prerequisite[];
}

export function TargetPath({ competencies, areaNames, itemIdsByCompetency, edges }: Props) {
  const conPrerrequisitos = competencies.filter((competency) => competency.prerequisites.length > 0);
  const [targetId, setTargetId] = useState(
    () => (conPrerrequisitos[0] ?? competencies[0])?.id ?? '',
  );
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

  const camino = useMemo(
    () => prerequisiteClosure(targetId, competencies),
    [targetId, competencies],
  );

  const estados = useMemo(() => {
    const mapa = new Map<string, ReturnType<typeof projectStateByIds>>();

    if (!attempts) return mapa;

    for (const competency of competencies) {
      mapa.set(
        competency.id,
        projectStateByIds(itemIdsByCompetency[competency.id] ?? [], attempts, systemClock),
      );
    }

    return mapa;
  }, [attempts, competencies, itemIdsByCompetency]);

  const porArea = useMemo(() => {
    const grupos = new Map<string, CompetencyRecord[]>();

    for (const competency of competencies) {
      const bucket = grupos.get(competency.areaId) ?? [];

      bucket.push(competency);
      grupos.set(competency.areaId, bucket);
    }

    return grupos;
  }, [competencies]);

  const objetivo = competencies.find((competency) => competency.id === targetId);
  const cubiertas = camino.filter((competency) => (estados.get(competency.id) ?? 'no_evidence') !== 'no_evidence').length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="objetivo"
          className="block font-mono text-[10px] tracking-wide text-muted uppercase"
        >
          Quiero llegar a
        </label>
        <select
          id="objetivo"
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
          className="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          {[...porArea.entries()].map(([areaId, lista]) => (
            <optgroup key={areaId} label={areaNames[areaId] ?? areaId}>
              {lista.map((competency) => (
                <option key={competency.id} value={competency.id}>
                  {competency.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {objetivo && (
        <p className="text-sm text-muted">
          {camino.length === 1 ? (
            <>No tiene prerrequisitos: puedes empezar por ella.</>
          ) : (
            <>
              Te faltan <strong className="text-text">{camino.length - cubiertas}</strong> de{' '}
              {camino.length} competencias en el camino. La última es el objetivo.
            </>
          )}
        </p>
      )}

      {!attempts && <p className="text-sm text-muted">Leyendo tu historial…</p>}

      <ol className="space-y-2">
        {camino.map((competency, index) => {
          const estado = estados.get(competency.id) ?? 'no_evidence';
          const tieneEvidencia = estado !== 'no_evidence';
          const desbloqueada = projectUnlocked(competency.id, edges, estados);
          const esObjetivo = competency.id === targetId;

          return (
            <li
              key={competency.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                esObjetivo ? 'border-accent/60 bg-surface' : 'border-border bg-surface'
              }`}
            >
              <span className="font-mono text-[11px] text-muted">{index + 1}</span>

              {tieneEvidencia ? (
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300"
                  aria-hidden="true"
                />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              )}

              <span className="min-w-0 flex-1">
                <Link
                  href={`/c/${competency.id}`}
                  className="text-sm font-medium hover:text-accent"
                >
                  {competency.title}
                </Link>
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  {areaNames[competency.areaId] ?? competency.areaId}
                  {esObjetivo ? ' · objetivo' : ''}
                </span>
              </span>

              <span className={`font-mono text-[10px] ${tieneEvidencia ? STATE_TONE[estado] : 'text-muted'}`}>
                {tieneEvidencia ? STATE_LABEL[estado] : desbloqueada ? 'evaluable' : 'faltan previos'}
              </span>

              {desbloqueada && (
                <Link
                  href={`/c/${competency.id}/comprobar`}
                  className="inline-flex items-center gap-1 text-[11px] text-accent underline underline-offset-4"
                >
                  Comprobar <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
