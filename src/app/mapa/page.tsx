export default function MapaPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">Mapa de competencias</h1>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">
        Las 37 competencias y sus prerrequisitos, con cuatro estados: bloqueada, disponible, en
        aprendizaje y consolidada.
      </p>
      <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Pendiente de la rebanada S7. Los filtros por área, capa y estado vivirán en la URL.
      </p>
    </section>
  );
}
