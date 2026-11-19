export const metadata = {
  title: 'Acerca',
};

export default function AcercaPage() {
  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Acerca de este proyecto</h1>

      <p className="text-slate-600 dark:text-slate-300">
        La mayoría de plataformas de aprendizaje guarda una casilla: «lección completada». Eso es
        una afirmación del usuario. Aquí una competencia no tiene estado almacenado: su estado se
        calcula a partir del historial de intentos.
      </p>

      <p className="text-slate-600 dark:text-slate-300">
        Si fallas un repaso, no vuelves a bloquear lo que ya alcanzaste. El desbloqueo es permanente
        una vez ganado; lo que se mueve es el dominio.
      </p>

      <p className="text-slate-600 dark:text-slate-300">
        Todas las respuestas son de opción múltiple con una justificación por cada distractor, y
        declaran confianza. Ese segundo eje es lo que permite distinguir «lo sabe» de «acertó por
        suerte».
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Sin backend, sin base de datos, sin claves y sin coste de ejecución. El progreso vive en el
        navegador y se puede exportar.
      </p>
    </section>
  );
}
