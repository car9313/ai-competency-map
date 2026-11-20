'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { systemClock } from '@/shared/time/clock';
import { openAttemptStore } from '../infrastructure/local-storage-attempt-store';
import { parseProgressFile, serializeProgress } from '../application/progress-file';

/**
 * Panel de datos del alumno.
 *
 * Sin cuentas, la única copia de seguridad posible es un archivo. Este panel es también el
 * sitio donde se ve qué está guardado: un número de intentos, no una barra de progreso
 * inventada.
 *
 * El reloj es siempre el del sistema: no hay control de tiempo en el producto (ADR-007).
 * Para probar la cola de repaso se siembran intentos con fechas pasadas, que es lo que de
 * verdad le pasó a alguien que respondió hace cuatro días.
 */
export function DataPanel() {
  const [attempts, setAttempts] = useState<number | null>(null);
  const [persistent, setPersistent] = useState(true);
  const [today, setToday] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Todo se resuelve detrás de un `await`: así el efecto no encadena renders síncronos
    // (regla set-state-in-effect) y no se escribe estado si el componente ya se desmontó.
    void (async () => {
      const { store, persistent: isPersistent } = openAttemptStore();
      const list = await store.list();

      if (cancelled) return;

      setAttempts(list.length);
      setPersistent(isPersistent);
      setToday(systemClock.today());
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async () => {
    const { store } = openAttemptStore();
    const list = await store.list();
    const blob = new Blob([serializeProgress(list, systemClock.now())], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `ai-competency-map-${systemClock.today()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`Exportados ${list.length} intentos.`);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = parseProgressFile(text);

    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    const { store } = openAttemptStore();

    await store.append(result.attempts);
    const list = await store.list();

    setAttempts(list.length);
    setMessage(`Importados ${result.attempts.length} intentos (total ${list.length}).`);
  };

  const handleClear = async () => {
    const { store } = openAttemptStore();

    await store.clear();
    setAttempts(0);
    setMessage('Historial borrado.');
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Tus datos</h2>
        <span className="font-mono text-[11px] text-muted">hoy · {today || '—'}</span>
      </div>

      <p className="text-sm text-muted">
        {attempts === null
          ? 'Leyendo el historial…'
          : `${attempts} intento(s) guardados en este navegador.`}
      </p>

      {!persistent && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-300">
          Este navegador no permite almacenar de forma persistente, así que el progreso se perderá
          al cerrar la pestaña. Puedes exportarlo antes de salir.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:text-accent"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar
        </button>

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:text-accent">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Importar
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) void handleImport(file);
              event.target.value = '';
            }}
          />
        </label>

        <button
          type="button"
          onClick={() => void handleClear()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-rose-400"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Borrar
        </button>
      </div>

      {message && (
        <p role="status" className="text-xs text-muted">
          {message}
        </p>
      )}
    </div>
  );
}
