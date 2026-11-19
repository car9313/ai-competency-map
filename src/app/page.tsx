export default function HoyPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">Hoy</h1>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">
        Aquí vivirá la cola de repaso: exactamente los ítems que vencen hoy. La cola es personal y
        no se comparte por URL.
      </p>
      <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Pendiente de la rebanada S8. Sin intentos registrados, el estado vacío es el correcto.
      </p>
    </section>
  );
}
