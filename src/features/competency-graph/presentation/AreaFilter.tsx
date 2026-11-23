'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

/**
 * Filtro por área para la vista de tarjetas.
 *
 * En el grafo el filtro vive dentro del diagrama, que es cliente y puede recalcular el SVG.
 * Aquí las tarjetas son HTML del servidor —a propósito, por SEO—, así que el filtro no puede
 * repintarlas: oculta las que no tocan alternando `hidden`, igual que el buscador.
 *
 * La fuente de verdad es el parámetro `area` de la URL, el mismo que usa el grafo, para que
 * el estado se pueda compartir y volver atrás con el navegador.
 */

interface AreaOption {
  id: string;
  index: string;
  name: string;
}

function chipClass(active: boolean): string {
  return cn(
    'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
    active
      ? 'border-accent bg-accent-bg text-white'
      : 'border-border bg-surface text-muted hover:text-accent',
  );
}

export function AreaFilter({
  areas,
  basePath,
  listId,
}: {
  areas: readonly AreaOption[];
  basePath: string;
  listId: string;
}) {
  const params = useSearchParams();
  const current = params.get('area');

  useEffect(() => {
    const lista = document.getElementById(listId);

    if (!lista) return;

    for (const bloque of lista.querySelectorAll<HTMLElement>('[data-area]')) {
      const coincide = current === null || bloque.dataset.area === current;

      /*
       * `filteredOut` es la marca que el buscador consulta antes de decidir si un área se
       * oculta por falta de coincidencias. Sin ella, limpiar el buscador volvería a mostrar
       * áreas que este filtro había descartado.
       */
      bloque.dataset.filteredOut = coincide ? 'false' : 'true';
      bloque.hidden = !coincide;
    }
  }, [current, listId]);

  const hrefFor = (value: string | null): string => {
    const next = new URLSearchParams(params.toString());

    if (value === null) {
      next.delete('area');
    } else {
      next.set('area', value);
    }

    const query = next.toString();

    return query.length > 0 ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="font-mono text-[11px] tracking-wide text-muted uppercase">Área</span>

      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={hrefFor(null)} className={chipClass(current === null)} aria-current={current === null}>
          todas
        </Link>

        {areas.map((area) => (
          <Link
            key={area.id}
            href={hrefFor(area.id)}
            className={chipClass(current === area.id)}
            aria-current={current === area.id}
          >
            {area.index} {area.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
