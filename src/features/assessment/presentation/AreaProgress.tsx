'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { systemClock } from '@/shared/time/clock';
import type { CompetencyState } from '../domain/projection';
import { projectStateByIds } from '../domain/projection';
import type { Attempt } from '../domain/types';
import { loadAttempts } from '../infrastructure/attempts-cache';

/**
 * Progreso por área.
 *
 * Existe por una confusión real: las áreas se ven en el mapa como filtros y parece que
 * fueran cursos que se completan. No lo son — son agrupaciones temáticas. Lo que tiene
 * estado es cada competencia, y el orden lo marca el grafo de prerrequisitos, que cruza
 * áreas constantemente.
 *
 * Se muestran recuentos y no porcentajes, por la misma razón que en el resto del producto:
 * un «60 %» no dice qué falta ni qué hacer.
 */

interface AreaGroup {
  id: string;
  index: string;
  name: string;
  competencies: ReadonlyArray<{ id: string; title: string; itemIds: readonly string[] }>;
}

export function AreaProgress({ areas }: { areas: readonly AreaGroup[] }) {
  const [estados, setEstados] = useState<ReadonlyMap<string, CompetencyState> | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts: readonly Attempt[] = await loadAttempts();

      if (cancelled) return;

      const mapa = new Map<string, CompetencyState>();

      for (const area of areas) {
        for (const competency of area.competencies) {
          mapa.set(
            competency.id,
            projectStateByIds(competency.itemIds, attempts, systemClock),
          );
        }
      }

      setEstados(mapa);
    })();

    return () => {
      cancelled = true;
    };
  }, [areas]);

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Tu progreso por área</h2>
        <p className="text-sm text-muted">
          Las áreas son agrupaciones para navegar, no cursos: <strong>no se completan</strong>. Lo
          que tiene estado es cada competencia, y el orden lo marca el grafo de prerrequisitos, que
          salta de un área a otra.
        </p>
      </div>

      <ul className="space-y-2">
        {areas.map((area) => {
          const total = area.competencies.length;
          const conEvidencia =
            estados === null
              ? null
              : area.competencies.filter(
                  (competency) => (estados.get(competency.id) ?? 'no_evidence') !== 'no_evidence',
                ).length;
          const consolidadas =
            estados === null
              ? null
              : area.competencies.filter(
                  (competency) => estados.get(competency.id) === 'consolidated',
                ).length;

          return (
            <li
              key={area.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <span className="text-sm">
                <span className="font-mono text-xs text-muted">{area.index}</span> · {area.name}
              </span>

              <span className="font-mono text-[11px] text-muted">
                {conEvidencia === null
                  ? 'leyendo…'
                  : `${conEvidencia} de ${total} con evidencia${
                      consolidadas ? ` · ${consolidadas} consolidada${consolidadas === 1 ? '' : 's'}` : ''
                    }`}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted">
        Para ver el detalle de una competencia, abre el{' '}
        <Link href="/mapa/tarjetas" className="text-accent underline underline-offset-4">
          mapa en tarjetas
        </Link>{' '}
        o tu{' '}
        <Link href="/historial" className="text-accent underline underline-offset-4">
          historial
        </Link>
        .
      </p>
    </section>
  );
}
