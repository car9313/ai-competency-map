'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import type { CompetencyState } from '@/features/assessment';
import { projectStateByIds } from '@/features/assessment/domain/projection';
import { systemClock } from '@/shared/time/clock';
import { loadAttempts } from '@/features/assessment/infrastructure/attempts-cache';
import { STATE_LABEL, STATE_TONE } from '@/features/assessment/presentation/state-labels';

/**
 * Estado de un nodo del mapa, calculado con el historial de este navegador.
 *
 * El mapa se sirve desde el servidor por SEO, así que su HTML no puede saber qué has
 * respondido. Este es el punto donde el progreso personal entra en la tarjeta: el título y
 * la descripción siguen siendo estáticos, pero la etiqueta de estado es viva.
 *
 * **La etiqueta del servidor solo es cierta con historial vacío.** Antes se usaba como
 * respaldo cuando no había evidencia propia, y eso mentía en cuanto avanzabas: una
 * competencia con los prerrequisitos cubiertos y sin intentos propios seguía diciendo
 * «faltan previos» aunque su comprobación ya estuviera abierta. Por eso el desbloqueo también
 * se recalcula aquí.
 */

/**
 * Ítems de cada prerrequisito, agrupados.
 *
 * Basta con que **un** ítem de un prerrequisito tenga evidencia para que cuente: es la misma
 * regla que aplica `projectUnlocked`. Se pasan los grupos en vez de los estados porque el
 * estado de un prerrequisito también hay que proyectarlo, y aquí no se tienen sus ítems.
 */
export type PrerequisiteItemGroups = readonly (readonly string[])[];

export function NodeStateChip({
  itemIds,
  prerequisiteItemGroups,
  pending,
  fallbackLabel,
  available,
}: {
  itemIds: readonly string[];
  prerequisiteItemGroups: PrerequisiteItemGroups;
  /** Nodo sin contenido: su etiqueta es estática y no depende del historial. */
  pending: boolean;
  /** Etiqueta del servidor, solo para antes de hidratar. */
  fallbackLabel: string;
  /** Cómo se ve un nodo desbloqueado: es lo que hay que mostrar cuando se abre. */
  available: { label: string; fill: string; stroke: string };
}) {
  const [state, setState] = useState<CompetencyState | null>(null);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const attempts = await loadAttempts();

      if (cancelled) return;

      const conEvidencia = new Set(attempts.map((attempt) => attempt.itemId));

      setUnlocked(
        prerequisiteItemGroups.every((group) => group.some((id) => conEvidencia.has(id))),
      );
      setState(projectStateByIds(itemIds, attempts, systemClock));
    })();

    return () => {
      cancelled = true;
    };
  }, [itemIds, prerequisiteItemGroups]);

  const live = state !== null && state !== 'no_evidence';

  if (live) {
    return (
      <span className="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[10px] whitespace-nowrap">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-current"
          style={{ color: 'currentColor' }}
        />
        <span className={STATE_TONE[state]}>{STATE_LABEL[state]}</span>
      </span>
    );
  }

  // Sin evidencia propia quedan tres casos, y cada uno tiene una etiqueta distinta:
  // sin publicar (estática), desbloqueada («evaluable») y bloqueada («faltan previos»).
  // Antes de hidratar manda la del servidor, que solo es cierta con historial vacío.
  const disponible = !pending && unlocked === true;
  const bloqueada = !pending && unlocked === false;
  const etiqueta = disponible
    ? available.label
    : bloqueada
      ? 'faltan previos'
      : fallbackLabel;
  const tono = disponible ? available : { fill: 'transparent', stroke: 'var(--border)' };

  return (
    <span className="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[10px] whitespace-nowrap">
      <span className="flex items-center gap-1.5 text-muted">
        {bloqueada ? (
          <Lock className="h-3 w-3" aria-hidden="true" />
        ) : (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: tono.fill, border: `1px solid ${tono.stroke}` }}
          />
        )}
        {etiqueta}
      </span>
    </span>
  );
}
