import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
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
    <html lang="es" className="dark">
      <head>
        {/* Aplica el tema guardado antes del primer pintado: evita el parpadeo. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('acm-theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>

        <div className="flex min-h-screen">
          {/* Sidebar · escritorio */}
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-surface p-4 lg:flex">
            <div className="space-y-7">
              <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-white">
                  AI
                </span>
                <span className="font-display text-sm font-bold tracking-tight">
                  AI Competency Map
                </span>
              </Link>

              <nav aria-label="Navegación principal">
                <ul className="space-y-1">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-3.5">
              <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
                Sesión de hoy
              </p>
              <p className="mt-1 text-sm text-fg">
                Sin repasos pendientes.
              </p>
              <p className="mt-1 text-[11px] text-muted">
                La racha y la meta diaria llegan en la rebanada S8.
              </p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
              <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8">
                {/* En escritorio la navegación vive en la sidebar; aquí solo para móvil. */}
                <nav aria-label="Navegación" className="min-w-0 lg:hidden">
                  <ul className="flex items-center gap-1">
                    {NAV.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="rounded px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="flex items-center gap-2">
                  <span className="hidden font-mono text-[11px] text-muted sm:inline">
                    fase 1 · núcleo demostrable
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main id="contenido" className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
