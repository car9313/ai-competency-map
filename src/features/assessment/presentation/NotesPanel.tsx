'use client';

import { useEffect, useRef, useState } from 'react';
import { systemClock } from '@/shared/time/clock';
import { loadNotes, saveNote } from '../infrastructure/notes-store';

/**
 * Notas de una competencia.
 *
 * Guardado automático con retardo: escribir y ver «guardando…» en cada tecla produce ruido y
 * una escritura por pulsación. El estado visible importa más que el momento exacto, porque un
 * editor que no dice si ha guardado obliga a desconfiar.
 */
export function NotesPanel({
  competencyId,
  title,
}: {
  competencyId: string;
  title: string;
}) {
  const [texto, setTexto] = useState<string | null>(null);
  const [estado, setEstado] = useState<'cargado' | 'pendiente' | 'guardado'>('cargado');
  const [guardadoEn, setGuardadoEn] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Lectura en su propio turno: el almacenamiento no existe durante la exportación
    // estática, así que el primer render siempre es el mismo que el HTML servido.
    void (async () => {
      const nota = loadNotes()[competencyId];

      if (cancelled) return;

      setTexto(nota?.text ?? '');
    })();

    return () => {
      cancelled = true;
    };
  }, [competencyId]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onChange = (value: string) => {
    setTexto(value);
    setEstado('pendiente');

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const ahora = systemClock.now();

      saveNote(competencyId, value, ahora);
      setEstado('guardado');
      setGuardadoEn(ahora.slice(11, 16));
    }, 600);
  };

  return (
    <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor="notas" className="text-sm font-semibold">
          Tus notas
        </label>
        <span className="font-mono text-[10px] text-muted" role="status">
          {estado === 'pendiente'
            ? 'guardando…'
            : estado === 'guardado' && guardadoEn
              ? `guardado a las ${guardadoEn}`
              : 'se guardan en este navegador'}
        </span>
      </div>

      <textarea
        id="notas"
        value={texto ?? ''}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder={`Lo que quieras recordar de «${title}»: una duda, un ejemplo, algo que te costó.`}
        className="w-full resize-y rounded-lg border border-border bg-surface-2 p-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
      />

      <p className="text-xs text-muted">
        Las notas no cuentan como evidencia: no cambian el estado de la competencia ni los
        repasos. Son tuyas, y viajan en el archivo de progreso al exportar.
      </p>
    </section>
  );
}
