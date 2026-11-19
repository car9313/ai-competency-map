import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI Competency Map',
    template: '%s · AI Competency Map',
  },
  description:
    'Mapa de competencias de AI Engineering donde el progreso se deriva de evidencia, no de casillas marcadas.',
};

const NAV = [
  { href: '/', label: 'Hoy' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/acerca', label: 'Acerca' },
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {/* Accesibilidad: primera parada del tabulador */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>

        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 dark:border-slate-800">
            <span className="text-sm font-semibold tracking-tight">AI Competency Map</span>
            <nav aria-label="Navegación principal">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <main id="contenido" className="flex-1 py-8">
            {children}
          </main>

          <footer className="border-t border-slate-200 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Fase 1 · núcleo demostrable
          </footer>
        </div>
      </body>
    </html>
  );
}
