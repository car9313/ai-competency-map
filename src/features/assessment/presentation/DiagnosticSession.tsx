'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { systemClock } from '@/shared/time/clock';
import type { Item } from '@/shared/types/domain';
import { projectState } from '../domain/projection';
import type { Attempt } from '../domain/types';
import { loadAttempts } from '../infrastructure/attempts-cache';
import { ItemRunner } from './ItemRunner';
import { STATE_LABEL, STATE_TONE } from './state-labels';

/**
 * Sesión de diagnóstico.
 *
 * Presenta los ítems elegidos como una sesión más. Al terminar, el resumen **se calcula desde
 * los intentos guardados**, no se acumula en el componente: así no hay dos fuentes de verdad
 * que puedan discrepar.
 *
 * Refresca tras cada respuesta porque `ItemRunner` invalida la caché al registrar el intento.
 */

interface CompetencyGroup {
  id: string;
  title: string;
  items: readonly Item[];
}

interface Props {
  readonly items: readonly Item[];
  readonly groups: readonly CompetencyGroup[];
}

export function DiagnosticSession({ items, groups }: Props) {
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<readonly Attempt[] | null>(null);

  const terminado = index >= items.length;

  useEffect(() => {
    if (!terminado) return;

    let cancelled = false;

    void (async () => {
      const loaded = await loadAttempts();

      if (!cancelled) setAttempts(loaded);
    })();

    return () => {
      cancelled = true;
    };
  }, [terminado]);

  if (terminado) {
    if (!attempts) {
      return <p className="text-sm text-muted">Calculando el resultado…</p>;
    }

    const filas = groups.map((group) => ({
      ...group,
      state: projectState(group.items, attempts, systemClock),
    }));

    const conEvidencia = filas.filter((fila) => fila.state !== 'no_evidence').length;

    return (
      <section className="space-y-5">
        <div className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Has dado evidencia en {conEvidencia} de {filas.length} competencias
          </h2>
          <p className="text-sm text-muted">
            Esto no es una nota: son {items.length} intentos que ya cuentan como cualquier otro.
            Lo que hayas acertado ha desbloqueado lo que dependía de ello.
          </p>
        </div>

        <ul className="space-y-2">
          {filas.map((fila) => (
            <li
              key={fila.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <span className="text-sm">{fila.title}</span>
              <span className={`font-mono text-[11px] ${STATE_TONE[fila.state]}`}>
                {STATE_LABEL[fila.state]}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-bg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Ver el mapa actualizado
          </Link>
          <Link
            href="/"
            className="text-sm text-muted underline underline-offset-4 hover:text-accent"
          >
            Ir a la sesión de hoy
          </Link>
        </div>
      </section>
    );
  }

  const actual = items[index];
  const grupo = groups.find((candidate) => candidate.id === actual?.competencyId);

  if (!actual) return null;

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
        Diagnóstico · {index + 1} de {items.length}
      </p>

      <ItemRunner
        key={actual.id}
        item={actual}
        context={`Diagnóstico · ${grupo?.title ?? actual.competencyId}`}
        onNext={() => setIndex((value) => value + 1)}
        nextLabel={index + 1 >= items.length ? 'Ver resultado' : 'Siguiente ítem'}
      />
    </div>
  );
}
