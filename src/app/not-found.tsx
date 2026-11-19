import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">No encontrado</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Esa competencia no existe en el grafo. Solo existen las que se conocen en build.
      </p>
      <Link
        href="/mapa"
        className="inline-block text-sm underline underline-offset-4 hover:text-brand-600"
      >
        Volver al mapa
      </Link>
    </section>
  );
}
