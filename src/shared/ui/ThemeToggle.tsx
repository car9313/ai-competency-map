'use client';

import { Moon, Sun } from 'lucide-react';

/**
 * Conmutador de tema.
 *
 * Sin estado de React a propósito: el tema vive en la clase `dark` del elemento `html`,
 * así que el icono se alterna con variantes CSS (`dark:hidden` / `hidden dark:block`).
 *
 * Ventajas: no hay `useState` que sincronizar en un efecto (lo que provoca renders en
 * cascada), no puede haber desajuste de hidratación, y el primer pintado ya es correcto
 * porque el script en línea del layout aplica el tema antes de pintar.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains('dark');

    root.classList.toggle('dark', next);

    try {
      localStorage.setItem('acm-theme', next ? 'dark' : 'light');
    } catch {
      // Sin almacenamiento (modo privado): el tema dura lo que la sesión.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar entre tema claro y oscuro"
      title="Cambiar tema"
      className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-accent"
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
