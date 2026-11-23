import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Guía de uso',
  description:
    'Manual para empezar a usar AI Competency Map sin saber programar: cómo responder, qué significan los estados, cómo repasar y cómo guardar tu progreso.',
};

const INDICE = [
  { id: 'para-que-sirve', label: 'Para qué sirve' },
  { id: 'empezar', label: 'Empezar en tres pasos' },
  { id: 'responder', label: 'Responder una pregunta' },
  { id: 'pistas', label: 'Si no lo sabes: pistas' },
  { id: 'estados', label: 'Qué significan los estados' },
  { id: 'repaso', label: 'Por qué te vuelve a preguntar' },
  { id: 'fallos', label: 'Repasar solo tus fallos' },
  { id: 'notas', label: 'Tus notas' },
  { id: 'mapa', label: 'El mapa' },
  { id: 'rutas', label: 'Ir a un objetivo' },
  { id: 'diagnostico', label: 'El diagnóstico' },
  { id: 'historial', label: 'Tu historial' },
  { id: 'datos', label: 'Tu copia de seguridad' },
  { id: 'movil', label: 'En el móvil y sin conexión' },
  { id: 'accesibilidad', label: 'Teclado y lector de pantalla' },
  { id: 'no-hace', label: 'Lo que esta app no hace' },
  { id: 'dudas', label: 'Dudas frecuentes' },
] as const;

export default function GuiaPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 pb-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Guía de uso</h1>
        <p className="text-muted">
          Esta guía es para ti si nunca has usado la app, y también si no programas. No hace falta
          saber nada técnico: aquí solo se explica qué botones hay y qué ocurre al pulsarlos.
        </p>
        <p className="text-sm text-muted">
          Tiempo de lectura: unos cinco minutos. Si tienes prisa, lee <strong>Empezar</strong> y{' '}
          <strong>Responder una pregunta</strong>.
        </p>
      </header>

      <nav aria-label="Índice de la guía" className="rounded-xl border border-border bg-surface p-4">
        <p className="font-mono text-[11px] tracking-wide text-muted uppercase">En esta página</p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {INDICE.map((entrada) => (
            <li key={entrada.id}>
              <a
                href={`#${entrada.id}`}
                className="text-sm text-accent underline underline-offset-4"
              >
                {entrada.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Seccion id="para-que-sirve" titulo="Para qué sirve">
        <p>
          Es un mapa de 39 competencias de ingeniería de IA, agrupadas en ocho áreas. Cada
          competencia tiene una lección corta y ocho preguntas de opción múltiple.
        </p>
        <p>
          La diferencia con casi cualquier otra app de estudio: <strong>aquí no marcas casillas</strong>.
          No existe un botón de «lección completada». Tu nivel en cada competencia se calcula a
          partir de lo que has respondido, cuántas veces y con cuánta seguridad.
        </p>
        <p>
          Si aciertas ocho preguntas seguidas, la competencia se marca como consolidada. Si fallas
          algo que ya sabías, baja a «en riesgo». Nunca se bloquea nada que ya hubieras alcanzado.
        </p>
      </Seccion>

      <Seccion id="empezar" titulo="Empezar en tres pasos">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Decide por dónde entrar.</strong> Si ya sabes algo del tema, ve a{' '}
            <Link href="/diagnostico" className="text-accent underline underline-offset-4">
              Diagnóstico
            </Link>{' '}
            y responde doce preguntas repartidas por todo el mapa. Lo que aciertes abre lo que
            dependa de ello.
          </li>
          <li>
            <strong>Si empiezas de cero</strong>, abre el{' '}
            <Link href="/mapa" className="text-accent underline underline-offset-4">
              Mapa
            </Link>{' '}
            y busca la competencia que tiene el botón «Empezar». Es la raíz del grafo.
          </li>
          <li>
            <strong>Lee la lección y pulsa «Comprobar».</strong> Son ocho preguntas sobre lo que
            acabas de leer. No hace falta memorizar: la app te las volverá a preguntar en el
            momento adecuado.
          </li>
        </ol>
        <p className="text-sm text-muted">
          Cada competencia necesita que tengas <em>alguna</em> evidencia en las que dependen de
          ella. No hace falta dominarlas: responder bien una sola pregunta de un prerrequisito ya
          la desbloquea.
        </p>
      </Seccion>

      <Seccion id="responder" titulo="Responder una pregunta">
        <p>Cada pregunta tiene tres partes:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Elige una opción.</strong> Solo hay una correcta.
          </li>
          <li>
            <strong>Di cómo de seguro estás</strong>: «Seguro» o «Con dudas». Esto no es decorativo.
            Acertar con dudas hace que la pregunta vuelva antes que acertar con seguridad: la app
            desconfía de los aciertos por suerte.
          </li>
          <li>
            <strong>Pulsa «Comprobar».</strong>
          </li>
        </ol>
        <p>
          Después verás si has acertado, por qué la opción que elegiste era o no era la correcta, y
          cuándo volverá a aparecer esa pregunta. El orden de las opciones cambia cada vez, así que
          no sirve memorizar «la segunda».
        </p>
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <p className="text-sm font-semibold">Acertar no es lo único que cuenta</p>
          <p className="mt-1 text-sm text-muted">
            Fallar tampoco bloquea nada. Vuelve a entrar en la cola de repaso y ya está; puedes
            seguir practicando esa competencia en el mismo momento.
          </p>
        </div>
      </Seccion>

      <Seccion id="pistas" titulo="Si no lo sabes: pistas graduadas">
        <p>Debajo de las opciones hay dos ayudas, y van de menos a más:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>«Pedir una pista»</strong> te muestra el error típico de esa competencia. No
            dice cuál es la respuesta correcta.
          </li>
          <li>
            <strong>«Descartar una opción»</strong> tacha una opción incorrecta y te explica por qué
            ese razonamiento no vale. Quedan dos, y la decisión sigue siendo tuya.
          </li>
        </ul>
        <p className="text-sm text-muted">
          No hay más pistas después de esas dos. Y el uso de pistas queda anotado en el intento:
          acertar con ayuda no es lo mismo que acertar solo, y la app lo guarda.
        </p>
      </Seccion>

      <Seccion id="estados" titulo="Qué significan los estados">
        <p>Cada competencia se encuentra en uno de estos cinco estados:</p>
        <dl className="space-y-3">
          <Estado
            nombre="Sin evidencia"
            texto="Todavía no has respondido nada de esta competencia. No dice que no sepas: dice que no hay datos."
          />
          <Estado
            nombre="En aprendizaje"
            texto="Has empezado y aún falla algo. Es el estado normal al principio."
          />
          <Estado
            nombre="Casi"
            texto="Has acertado casi todo: te falta un ítem para consolidar. Sirve para ver la diferencia entre «no lo sé» y «me falta poco»."
          />
          <Estado
            nombre="Consolidada"
            texto="Has demostrado los ocho ítems con aciertos repartidos en el tiempo."
          />
          <Estado
            nombre="En riesgo"
            texto="Ya la dominabas y has fallado algo reciente. No pierdes lo ganado: solo vuelve a la cola antes."
          />
        </dl>
      </Seccion>

      <Seccion id="repaso" titulo="Por qué te vuelve a preguntar">
        <p>
          La pantalla <strong>Hoy</strong> es tu cola de repaso: las preguntas que toca revisar
          hoy. Aparecen cuando están a punto de olvidarse, no cuando tú decides.
        </p>
        <p>
          Cada acierto espacia la siguiente pregunta un poco más: tres días, luego una semana,
          luego más. Cada fallo la trae de vuelta mañana. Es la idea del repaso espaciado.
        </p>
        <p className="text-sm text-muted">
          No hay rachas, ni metas diarias, ni puntos. Si un día no entras, no pasa nada: la cola
          sigue ahí esperándote.
        </p>
      </Seccion>

      <Seccion id="fallos" titulo="Repasar solo tus fallos">
        <p>
          En <strong>Repaso</strong> hay dos pestañas. «La cola de hoy» es lo que vence. «Solo mis
          fallos» son las preguntas cuyo último intento fue incorrecto, sin esperar a que venzan.
        </p>
        <p>
          Útil cuando tienes cinco minutos y prefieres cerrar huecos en vez de repasar lo que ya
          dominas. El número de fallos pendientes aparece también en la barra lateral.
        </p>
      </Seccion>

      <Seccion id="notas" titulo="Tus notas">
        <p>
          Al final de cada lección hay un cuadro de texto. Sirve para apuntar lo que quieras: una
          duda, un ejemplo propio, algo que te costó.
        </p>
        <p>
          Se guarda solo, un segundo después de que dejes de escribir, y verás «guardado a las
          17:15». <strong>Las notas no cuentan como evidencia</strong>: no cambian tu nivel ni
          adelantan repasos. Son para ti.
        </p>
      </Seccion>

      <Seccion id="mapa" titulo="El mapa">
        <p>Hay dos vistas y se llega con las pestañas de arriba:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Mapa:</strong> el grafo. Cada círculo es una competencia y cada flecha dice «esto
            depende de aquello». Arrastra para moverlo, rueda para acercar.
          </li>
          <li>
            <strong>Tarjetas:</strong> lo mismo en lista, agrupado por área. Es la vista buena en
            pantallas pequeñas, donde el grafo no se lee.
          </li>
        </ul>
        <p>
          En las dos puedes filtrar por <strong>área</strong> (las ocho agrupaciones temáticas), por{' '}
          <strong>capa</strong> (núcleo, servicio, interfaz) y por <strong>estado</strong>. Y hay un
          buscador que mira dentro del texto de las lecciones: sirve para encontrar «idempotencia»
          sin saber en qué competencia vive.
        </p>
        <p className="text-sm text-muted">
          Un área no es un curso que se completa: es una etiqueta para navegar. El orden de
          verdad lo marca el grafo, que salta de un área a otra cuando hace falta.
        </p>
      </Seccion>

      <Seccion id="rutas" titulo="Ir a un objetivo">
        <p>
          Si tu meta es concreta —montar un asistente con tus documentos, por ejemplo—, en{' '}
          <Link href="/rutas" className="text-accent underline underline-offset-4">
            Rutas
          </Link>{' '}
          eliges una competencia y ves el camino completo: qué hay que saber antes, en orden.
        </p>
        <p>
          Cada paso de la ruta es una competencia que puedes abrir y comprobar. Es la forma de no
          perderse en un mapa de 39 nodos.
        </p>
      </Seccion>

      <Seccion id="diagnostico" titulo="El diagnóstico">
        <p>
          Doce preguntas repartidas por todo el mapa, sin nota. Cada respuesta cuenta como un
          intento normal: lo que aciertes desbloquea lo que dependa de ello y lo que falles vuelve
          mañana.
        </p>
        <p>
          Sirve para no empezar por la raíz si ya sabes cosas. Con doce preguntas no se mide todo,
          así que el resultado es un punto de partida, no un certificado.
        </p>
      </Seccion>

      <Seccion id="historial" titulo="Tu historial">
        <p>
          Cada intento queda guardado: qué pregunta, qué contestaste, si acertaste, cuánta
          seguridad declaraste y cuándo. En{' '}
          <Link href="/historial" className="text-accent underline underline-offset-4">
            Historial
          </Link>{' '}
          puedes ver la lista y, en cada competencia, la explicación de por qué está en el estado
          en que está.
        </p>
        <p className="text-sm text-muted">
          Es lo que hace que la app pueda justificarse: ningún nivel aparece por arte de magia, se
          puede rastrear hasta las respuestas que lo produjeron.
        </p>
      </Seccion>

      <Seccion id="datos" titulo="Tu copia de seguridad">
        <p>
          El progreso se guarda <strong>en tu navegador</strong>, no en un servidor. Eso tiene una
          consecuencia importante: si borras los datos del navegador, se pierde.
        </p>
        <p>Por eso, en Acerca hay tres botones:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Exportar</strong>: descarga un archivo con tus intentos y tus notas.
          </li>
          <li>
            <strong>Importar</strong>: recupera ese archivo en este u otro navegador.
          </li>
          <li>
            <strong>Borrar</strong>: elimina todo, sin vuelta atrás.
          </li>
        </ul>
        <p className="text-sm text-muted">
          Conviene exportar de vez en cuando, y siempre antes de cambiar de ordenador o de limpiar
          el navegador.
        </p>
      </Seccion>

      <Seccion id="movil" titulo="En el móvil y sin conexión">
        <p>
          La app se puede instalar como si fuera una aplicación normal: en Chrome o Edge aparece un
          icono para instalarla en la barra de direcciones; en Android, en el menú de tres puntos;
          en iPhone, en Compartir → «Añadir a pantalla de inicio».
        </p>
        <p>
          Una vez instalada funciona sin conexión: las páginas que ya has abierto se guardan, y las
          ocho secciones principales están disponibles desde la primera visita. Las competencias
          concretas se guardan al visitarlas.
        </p>
        <p className="text-sm text-muted">
          Si actualizan la app y ves algo raro, cierra y vuelve a abrir: la versión nueva se
          descarga sola.
        </p>
      </Seccion>

      <Seccion id="accesibilidad" titulo="Teclado y lector de pantalla">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Todo se puede usar solo con teclado. Al principio de cada página hay un enlace «Saltar
            al contenido».
          </li>
          <li>
            Los cambios importantes (el resultado de una respuesta, el recuento del buscador) se
            anuncian con voz, sin mover el foco de donde estás.
          </li>
          <li>
            Arriba a la derecha hay un botón para cambiar entre tema claro y oscuro.
          </li>
          <li>
            El tamaño del texto se cambia con el zoom del navegador (<kbd>Ctrl</kbd> + <kbd>+</kbd>)
            sin que se rompa nada.
          </li>
        </ul>
      </Seccion>

      <Seccion id="no-hace" titulo="Lo que esta app no hace">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>No hay cuentas ni contraseñas.</strong> No hay nada que registrar.
          </li>
          <li>
            <strong>No se paga nada</strong> y no hay versión de pago.
          </li>
          <li>
            <strong>No hay rachas, ni puntos, ni medallas.</strong> No se mide tu constancia, se
            mide lo que demuestras saber.
          </li>
          <li>
            <strong>No hay certificados.</strong> Lo que hay es evidencia de tus respuestas, que
            puedes exportar.
          </li>
          <li>
            <strong>Las preguntas no las corrige una IA.</strong> Son de opción múltiple con una
            explicación escrita por cada opción, así que la misma respuesta se corrige igual
            siempre.
          </li>
        </ul>
      </Seccion>

      <Seccion id="dudas" titulo="Dudas frecuentes">
        <dl className="space-y-4">
          <Duda
            pregunta="¿Por qué no puedo hacer la comprobación de una competencia?"
            respuesta="Porque te falta alguna evidencia en las competencias de las que depende. La página te dice cuáles. Puedes leer la lección igualmente: lo que se bloquea es la comprobación, no el acceso."
          />
          <Duda
            pregunta="¿Qué pasa si fallo una competencia que ya tenía consolidada?"
            respuesta="Baja a «en riesgo» y sus preguntas vuelven antes a la cola. No pierdes el acceso a nada ni vuelves a empezar de cero."
          />
          <Duda
            pregunta="¿Cuántas preguntas hay?"
            respuesta="312, ocho por cada una de las 39 competencias. Cada una tiene tres opciones y una justificación por opción."
          />
          <Duda
            pregunta="¿Puedo hacer trampa mirando el código?"
            respuesta="Sí: el contenido es abierto y está publicado en /contenido.json. No es un examen, es material de estudio. Si buscas la respuesta en lugar de pensarla, el único perjudicado es tu repaso."
          />
          <Duda
            pregunta="¿Se guarda algo de mí en un servidor?"
            respuesta="No. No hay servidor ni analítica. Todo vive en el almacenamiento de tu navegador."
          />
          <Duda
            pregunta="¿Puedo usar el contenido en otro sitio?"
            respuesta="Sí, con licencia CC BY-SA 4.0: puedes reutilizarlo citando el origen y compartiendo las obras derivadas con la misma licencia."
          />
        </dl>
      </Seccion>

      <footer className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <p>
          ¿Te has quedado atascado en algo que esta guía no explica? Abre una incidencia en el
          repositorio del proyecto. Y si encuentras una errata en una pregunta, mejor todavía: el
          contenido se revisa con cada cambio.
        </p>
        <p className="mt-3">
          <Link href="/mapa" className="text-accent underline underline-offset-4">
            Ir al mapa
          </Link>{' '}
          ·{' '}
          <Link href="/diagnostico" className="text-accent underline underline-offset-4">
            Hacer el diagnóstico
          </Link>{' '}
          ·{' '}
          <Link href="/acerca" className="text-accent underline underline-offset-4">
            Acerca del proyecto
          </Link>
        </p>
      </footer>
    </article>
  );
}

function Seccion({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {children}
      </div>
    </section>
  );
}

function Estado({ nombre, texto }: { nombre: string; texto: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <dt className="text-sm font-semibold">{nombre}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-muted">{texto}</dd>
    </div>
  );
}

function Duda({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <dt className="text-sm font-semibold">{pregunta}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted">{respuesta}</dd>
    </div>
  );
}
