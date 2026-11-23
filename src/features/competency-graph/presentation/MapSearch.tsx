'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * Buscador del mapa.
 *
 * Filtra las tarjetas **ya renderizadas en el servidor** en lugar de volver a pintarlas. La
 * razón es el SEO: si el filtro viviera en React, la lista de competencias dejaría de estar en
 * el HTML y el mapa se quedaría sin contenido indexable, que es justo lo que se arregló en su
 * momento.
 *
 * Por eso opera sobre el DOM: cada tarjeta lleva su texto en `data-search` y aquí solo se
 * alterna el atributo `hidden`. `hidden` saca el elemento del árbol de accesibilidad, así que
 * el lector de pantalla tampoco anuncia lo filtrado.
 */
export function MapSearch({ listId }: { listId: string }) {
  const [consulta, setConsulta] = useState('');
  const recuento = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const lista = document.getElementById(listId);

    if (!lista) return;

    const tarjetas = [...lista.querySelectorAll<HTMLElement>('[data-search]')];
    const aguja = consulta.trim().toLowerCase();
    let encontradas = 0;

    for (const tarjeta of tarjetas) {
      const coincide = aguja === '' || (tarjeta.dataset.search ?? '').includes(aguja);

      tarjeta.hidden = !coincide;

      if (coincide) encontradas += 1;
    }

    // Las áreas sin ninguna tarjeta visible desaparecen enteras, para no dejar cabeceras
    // sueltas sin contenido debajo. Se respeta lo que haya ocultado el filtro de área: si no,
    // limpiar el buscador volvería a mostrar áreas ya descartadas por el filtro.
    for (const area of lista.querySelectorAll<HTMLElement>('[data-area]')) {
      const conContenido = [...area.querySelectorAll<HTMLElement>('[data-search]')].some(
        (tarjeta) => !tarjeta.hidden,
      );

      area.hidden = area.dataset.filteredOut === 'true' || !conContenido;
    }

    /*
     * El recuento se escribe en el DOM en lugar de pasar por `useState`.
     *
     * No es un atajo: este componente ya filtra tocando el DOM, y guardar el número en estado
     * obligaría a renders en cascada del componente para pintar un texto. La regla del lint lo
     * prohíbe por esa razón, y aquí no hace falta saltársela.
     */
    if (recuento.current) {
      recuento.current.textContent =
        aguja === ''
          ? ''
          : encontradas === 0
            ? 'Ninguna competencia coincide'
            : `${encontradas} ${encontradas === 1 ? 'competencia' : 'competencias'}`;
    }
  }, [consulta, listId]);

  return (
    <div className="space-y-1">
      <label htmlFor="buscador" className="sr-only">
        Buscar competencias por título o descripción
      </label>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="buscador"
          type="search"
          value={consulta}
          onChange={(event) => setConsulta(event.target.value)}
          placeholder="Buscar: rag, tokens, evaluación…"
          className="w-full rounded-lg border border-border bg-surface py-1.5 pr-3 pl-8 text-xs placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {/* Región viva: el recuento se anuncia al filtrar, sin mover el foco del campo. */}
      <p ref={recuento} role="status" className="font-mono text-[10px] text-muted" />
    </div>
  );
}
