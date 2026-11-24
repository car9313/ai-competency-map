/**
 * Área 00 — Fundamentos de programación.
 *
 * Cuatro competencias que el mapa daba por sabidas. No lo son, y con agentes importan más:
 * si no sabes leer un diff, revisar se convierte en aprobar; si no sabes moverte en el
 * terminal, no puedes comprobar lo que el agente afirma haber hecho.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_00: readonly Lesson[] = [
  {
    competencyId: 'version-control-and-diffs',
    whatIs:
      'El diff es la unidad de revisión de un cambio: qué líneas se añaden, cuáles se quitan y en qué ficheros. El historial de versiones guarda además el porqué de cada cambio en el mensaje del commit. Juntas, las dos cosas responden a «qué cambió» y «por qué», que es lo que hace revisable el trabajo de cualquier persona o agente.',
    problem:
      'Se aprueba un cambio por su mensaje o por el resumen que lo acompaña, sin abrir el diff. Y con agentes eso se vuelve sistemático: el resumen es claro, las pruebas están en verde y el diff hace otra cosa. La consecuencia no es solo un error que entra: es que nadie puede explicar después por qué el sistema hace lo que hace.',
    internals: [
      'Un diff se lee por ficheros y por bloques: el contexto de tres líneas alrededor de cada cambio es donde se ve si encaja con el resto.',
      'Cambiar el formato no es cambiar el comportamiento. Reindentar doscientas líneas y tocar una condición en el mismo commit esconde el segundo cambio dentro del primero.',
      'Las pruebas y la configuración forman parte del diff. Un cambio que afloja una comprobación o añade una dependencia se detecta ahí, no en el código.',
      'El mensaje del commit explica el porqué, no el qué: el qué ya está en el diff.',
      'Lo que no está en el historial no se puede recuperar. Un fichero sin versionar es un fichero que desaparece en cuanto alguien limpia.',
    ],
    whenToUse: [
      'Antes de aprobar cualquier cambio, propio o generado, y siempre antes de integrar.',
      'Cuando un fallo aparece en producción: el historial dice cuándo entró, y el diff de ese commit dice cómo.',
    ],
    whenNotToUse: [
      'No intentes revisar un diff de tres mil líneas: parte el cambio. El tamaño no se compensa con esfuerzo.',
      'No separes cada línea en un commit: el historial existe para explicar intenciones, no para fragmentar.',
    ],
    pitfalls: [
      {
        title: 'Aprobar por el resumen',
        detail:
          'La descripción la escribe quien hizo el cambio, incluido un agente. Es plausible por construcción y puede describir otro cambio distinto.',
      },
      {
        title: 'El commit que mezcla tres cosas',
        detail:
          'Reformateo, un arreglo y una funcionalidad en el mismo commit: si algo se rompe, hay que revertir las tres y reconstruir a mano las dos que servían.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'terminal-and-environment',
    whatIs:
      'El terminal es donde se ejecuta de verdad: comandos, rutas, variables de entorno y un código de salida que dice si algo salió bien. Saber moverte ahí es lo que te permite reproducir un fallo, comprobar una hipótesis y verificar lo que otro —persona o agente— afirma haber ejecutado.',
    problem:
      'Se acepta la salida resumida de una herramienta sin mirar el código de salida, así que un fallo silencioso pasa por éxito. Se mezclan entornos —el de la máquina propia y el de integración— sin fijar versiones, y aparece el «en mi máquina funciona». Y cuando algo falla, se lee la última línea del error en lugar de la primera, que es donde está el origen.',
    internals: [
      'El código de salida es la señal binaria: cero es éxito, cualquier otro valor es fallo. Mirar el texto sin mirarlo no es verificar.',
      'El directorio de trabajo cambia el significado de una ruta relativa. Un «no existe el fichero» suele ser «estás en otro sitio».',
      'La configuración vive en variables de entorno, no en el código: así el mismo programa funciona en dos entornos y los secretos no se versionan.',
      'Antes de arreglar, se reproduce: mismo comando, mismo entorno, mismo fallo. Si no se reproduce, no se sabe qué se arregló.',
      'Un error se lee desde arriba: la primera línea que menciona tu fichero y tu función es la que orienta.',
    ],
    whenToUse: [
      'Siempre que haya que comprobar algo: ejecutar, mirar el código de salida y leer el error completo.',
      'Cuando una herramienta o un agente afirma haber ejecutado tareas y quieres verificarlo por tu cuenta.',
    ],
    whenNotToUse: [
      'No ejecutes un comando destructivo copiado sin entender qué ruta resuelve.',
      'No fijes la configuración en el código para «que funcione ya»: traslada el problema a todos los entornos.',
    ],
    pitfalls: [
      {
        title: 'El comando peligroso copiado',
        detail:
          'Un borrado recursivo o un cambio de permisos pegado de una respuesta sin comprobar la ruta resuelta. Es el error más caro y el más rápido de cometer.',
      },
      {
        title: 'Confiar en la salida resumida',
        detail:
          '«Las pruebas pasan» dicho por quien las ejecutó no es un hecho del sistema. Lo es el código de salida del comando, en tu entorno.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
];

export const ITEMS_AREA_00: readonly Item[] = [
  {
    id: 'git-what-diff-compares',
    competencyId: 'version-control-and-diffs',
    difficulty: 1,
    prompt: '¿Qué compara exactamente un diff?',
    options: [
      {
        id: 'a',
        text: 'Dos versiones del mismo fichero, línea a línea',
        correct: true,
        rationale:
          'Correcto: muestra añadidos, eliminados y el contexto suficiente para situarlos.',
      },
      {
        id: 'b',
        text: 'El estado del proyecto con el de otra rama',
        correct: false,
        rationale:
          'Eso es una comparación entre ramas, que produce varios diffs. Un diff es por fichero.',
      },
      {
        id: 'c',
        text: 'El resumen que escribió quien hizo el cambio',
        correct: false,
        rationale:
          'El resumen es una interpretación. El diff son los cambios reales.',
      },
    ],
    explanation:
      'El diff es la diferencia entre dos estados de un fichero. Todo lo demás —ramas, commits, mensajes— organiza esas diferencias; la verdad está en ellas.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-format-vs-behavior',
    competencyId: 'version-control-and-diffs',
    difficulty: 2,
    prompt:
      'Un commit reindenta doscientas líneas y, en medio, cambia una condición. ¿Qué problema hay?',
    options: [
      {
        id: 'a',
        text: 'El cambio real queda escondido entre el ruido',
        correct: true,
        rationale:
          'Correcto: quien revise verá formato en todas partes y pasará por alto la condición que sí cambia comportamiento.',
      },
      {
        id: 'b',
        text: 'Ninguno: el diff muestra todo lo que cambió',
        correct: false,
        rationale:
          'Lo muestra y no lo destaca. Un cambio de comportamiento entre doscientas líneas de formato es invisible en la práctica.',
      },
      {
        id: 'c',
        text: 'Solo que el commit es más grande de lo necesario',
        correct: false,
        rationale:
          'El tamaño es el síntoma. El problema es que lo que importa deja de verse.',
      },
    ],
    explanation:
      'Formato y comportamiento se separan en commits distintos no por estética: si van juntos, el cambio que puede romper algo es el que menos se ve.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-review-tests-diff',
    competencyId: 'version-control-and-diffs',
    difficulty: 2,
    prompt: 'El cambio incluye modificaciones en ficheros de pruebas. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Revisarlas antes que el código',
        correct: true,
        rationale:
          'Correcto: ahí se ve si el criterio se mantuvo o se aflojó para que pasara la implementación.',
      },
      {
        id: 'b',
        text: 'Ignorarlas: las pruebas son andamiaje',
        correct: false,
        rationale:
          'Son el criterio de aceptación. Si se relajan, el cambio se aprueba contra un listón más bajo.',
      },
      {
        id: 'c',
        text: 'Comprobar solo que el número de pruebas no baja',
        correct: false,
        rationale:
          'Un test puede seguir existiendo con una comprobación más débil. El número no cambia y la cobertura real sí.',
      },
    ],
    explanation:
      'El diff de las pruebas es la parte que menos se mira y más dice. Un borrado se nota; un aflojamiento de la comprobación, no.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-commit-message',
    competencyId: 'version-control-and-diffs',
    difficulty: 2,
    prompt: 'Un commit se llama «cambios». ¿Qué se pierde?',
    options: [
      {
        id: 'a',
        text: 'El porqué, que el diff no puede explicar',
        correct: true,
        rationale:
          'Correcto: el diff dice qué cambió; el motivo de haberlo hecho así solo existe si alguien lo escribió.',
      },
      {
        id: 'b',
        text: 'Nada: el diff ya contiene toda la información',
        correct: false,
        rationale:
          'El diff muestra el resultado, no la alternativa descartada ni la razón. Eso no está en las líneas.',
      },
      {
        id: 'c',
        text: 'Solo la posibilidad de buscar el commit por nombre',
        correct: false,
        rationale:
          'La búsqueda es la molestia menor. Lo que falta es la decisión, que es lo que se necesita meses después.',
      },
    ],
    explanation:
      'El mensaje responde a «por qué así y no de otra forma». Cuando alguien investigue el fallo dentro de un año, ese mensaje es la única pista que no está en el código.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-large-diff',
    competencyId: 'version-control-and-diffs',
    difficulty: 1,
    prompt: 'Un cambio llega con tres mil líneas modificadas. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Pedir que se parta en cambios revisables',
        correct: true,
        rationale:
          'Correcto: si no cabe en una revisión real, la aprobación será por cansancio y no por criterio.',
      },
      {
        id: 'b',
        text: 'Revisarlo entero, aunque cueste una tarde',
        correct: false,
        rationale:
          'Nadie revisa tres mil líneas con atención sostenida. El resultado parece una revisión y no lo es.',
      },
      {
        id: 'c',
        text: 'Aprobarlo si la integración continua está en verde',
        correct: false,
        rationale:
          'Las comprobaciones cubren lo previsto. Lo que falta está justo fuera de lo que alguien pensó probar.',
      },
    ],
    explanation:
      'El tamaño decide si la revisión existe. Es la señal de alarma más fiable y la más barata de detectar: se ve en el número, antes de leer una línea.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-untracked-file',
    competencyId: 'version-control-and-diffs',
    difficulty: 2,
    prompt: 'El agente crea un fichero nuevo y no lo añade al control de versiones. ¿Qué consecuencia tiene?',
    options: [
      {
        id: 'a',
        text: 'No está en el historial y se pierde al limpiar',
        correct: true,
        rationale:
          'Correcto: lo no versionado no existe para el proyecto ni para quien lo clone después.',
      },
      {
        id: 'b',
        text: 'Ninguna: está en el disco y funciona igual',
        correct: false,
        rationale:
          'Funciona en esa máquina hoy. No viaja con el cambio y desaparece en el siguiente entorno limpio.',
      },
      {
        id: 'c',
        text: 'Solo que no aparece en el diff del cambio',
        correct: false,
        rationale:
          'Esa es la consecuencia visible. La grave es que el proyecto queda incompleto sin avisar.',
      },
    ],
    explanation:
      'El historial es la definición de lo que es el proyecto. Un fichero que existe en disco y no en el historial es una dependencia oculta que romperá la build de otra persona.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-revert-vs-fix',
    competencyId: 'version-control-and-diffs',
    difficulty: 3,
    prompt: 'Un commit reciente rompió producción. ¿Qué haces primero?',
    options: [
      {
        id: 'a',
        text: 'Revertir ese commit y después investigar',
        correct: true,
        rationale:
          'Correcto: revertir devuelve el servicio a un estado conocido y deja el historial honesto.',
      },
      {
        id: 'b',
        text: 'Editar los ficheros a mano hasta que funcione',
        correct: false,
        rationale:
          'Añade cambios no revisados encima del problema y borra la pista de qué lo causó.',
      },
      {
        id: 'c',
        text: 'Borrar el commit del historial para que no conste',
        correct: false,
        rationale:
          'Reescribir el historial no arregla el sistema y destruye la información de lo ocurrido.',
      },
    ],
    explanation:
      'Revertir es una operación explícita y reversible; arreglar a mano bajo presión, no. Primero se recupera el servicio y después se entiende el fallo con calma.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'git-diff-context',
    competencyId: 'version-control-and-diffs',
    difficulty: 3,
    prompt: 'En el diff ves un cambio de una línea con tres líneas de contexto alrededor. ¿Para qué sirve ese contexto?',
    options: [
      {
        id: 'a',
        text: 'Para saber si el cambio encaja con lo que rodea',
        correct: true,
        rationale:
          'Correcto: sin contexto, una línea modificada no dice si conserva la intención del bloque.',
      },
      {
        id: 'b',
        text: 'Para cumplir un formato estándar de diff',
        correct: false,
        rationale:
          'El formato se puede generar sin contexto. Está ahí porque el revisor lo necesita.',
      },
      {
        id: 'c',
        text: 'Para poder deshacer el cambio automáticamente',
        correct: false,
        rationale:
          'Deshacer usa el fichero completo. El contexto es para leer, no para aplicar.',
      },
    ],
    explanation:
      'Una línea cambiada aislada puede ser correcta o catastrófica. El contexto es lo que permite decidir sin abrir el fichero entero, y por eso conviene no recortarlo.',
    referenceId: 'ref-rules-ml',
  },

  // ── terminal-and-environment ────────────────────────────────────────────────

  {
    id: 'term-exit-code',
    competencyId: 'terminal-and-environment',
    difficulty: 1,
    prompt: 'Ejecutas un comando y sale texto por pantalla. ¿Cómo sabes si funcionó?',
    options: [
      {
        id: 'a',
        text: 'Por el código de salida: cero es éxito',
        correct: true,
        rationale:
          'Correcto: es la señal que usan los scripts y la integración continua. El texto puede engañar.',
      },
      {
        id: 'b',
        text: 'Si no aparece la palabra «error»',
        correct: false,
        rationale:
          'Hay fallos que no dicen «error» y éxitos que lo mencionan en un aviso.',
      },
      {
        id: 'c',
        text: 'Si el comando termina rápido',
        correct: false,
        rationale:
          'La velocidad no dice nada del resultado. Un fallo puede ser instantáneo.',
      },
    ],
    explanation:
      'El código de salida es la única señal binaria y la que usan todas las automatizaciones. Mirar el texto sin mirar el código es aceptar por impresión.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-working-directory',
    competencyId: 'terminal-and-environment',
    difficulty: 1,
    prompt: 'Un comando dice que el fichero no existe y tú lo ves en el explorador. ¿Qué miras primero?',
    options: [
      {
        id: 'a',
        text: 'El directorio de trabajo desde donde lo ejecutas',
        correct: true,
        rationale:
          'Correcto: una ruta relativa se resuelve contra el directorio actual, no contra el proyecto.',
      },
      {
        id: 'b',
        text: 'Los permisos del fichero',
        correct: false,
        rationale:
          'Los permisos darían otro mensaje, «permiso denegado». El error dice que no está.',
      },
      {
        id: 'c',
        text: 'Que el fichero tenga la extensión correcta',
        correct: false,
        rationale:
          'La extensión no afecta a si el fichero existe. La ruta sí.',
      },
    ],
    explanation:
      'Casi todos los «no existe» son «estás en otro sitio». Comprobar el directorio actual es la primera comprobación y la más rápida.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-secrets-in-env',
    competencyId: 'terminal-and-environment',
    difficulty: 2,
    prompt: 'El programa necesita una clave de API. ¿Dónde va?',
    options: [
      {
        id: 'a',
        text: 'En una variable de entorno, fuera del repositorio',
        correct: true,
        rationale:
          'Correcto: el código se versiona y la configuración no. Así la clave no queda en el historial.',
      },
      {
        id: 'b',
        text: 'Como constante en el fichero de configuración',
        correct: false,
        rationale:
          'El fichero se versiona. La clave entra en el historial y ya no se puede desversionar.',
      },
      {
        id: 'c',
        text: 'En un comentario junto al código que la usa',
        correct: false,
        rationale:
          'Los comentarios también se versionan. Es el mismo problema con peor aspecto.',
      },
    ],
    explanation:
      'La separación es la misma que con el diff: el código describe comportamiento y el entorno describe configuración. Los secretos solo pueden vivir en el segundo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-reproduce-first',
    competencyId: 'terminal-and-environment',
    difficulty: 2,
    prompt: 'Antes de arreglar un fallo, ¿qué haces?',
    options: [
      {
        id: 'a',
        text: 'Reproducirlo con el mismo comando y entorno',
        correct: true,
        rationale:
          'Correcto: sin reproducción no sabes qué arreglaste ni si sigue ahí después.',
      },
      {
        id: 'b',
        text: 'Aplicar el arreglo que parece más probable',
        correct: false,
        rationale:
          'Puede cambiar el síntoma y dejar la causa. Y no podrás demostrar que está resuelto.',
      },
      {
        id: 'c',
        text: 'Preguntar al agente qué cree que falla',
        correct: false,
        rationale:
          'Da una hipótesis útil y no una prueba. La reproducción es la prueba.',
      },
    ],
    explanation:
      'Reproducir convierte un informe en un hecho comprobable. Y da la señal de terminado: cuando el comando deja de fallar, está arreglado.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-read-first-error',
    competencyId: 'terminal-and-environment',
    difficulty: 2,
    prompt: 'El error ocupa cuarenta líneas. ¿Cuál lees primero?',
    options: [
      {
        id: 'a',
        text: 'La primera que menciona tu fichero y tu función',
        correct: true,
        rationale:
          'Correcto: el resto suele ser la cadena de llamadas que llegó hasta allí. El origen está arriba.',
      },
      {
        id: 'b',
        text: 'La última, que es el mensaje final',
        correct: false,
        rationale:
          'La última describe el síntoma que se propagó, no el punto donde empezó.',
      },
      {
        id: 'c',
        text: 'La línea que tiene más palabras en mayúsculas',
        correct: false,
        rationale:
          'El formato no indica importancia. Las mayúsculas suelen marcar el tipo de error, no su origen.',
      },
    ],
    explanation:
      'Las trazas se leen de arriba abajo hasta encontrar tu código: ahí está la causa. Lo de abajo es la consecuencia que se propaga.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-destructive-command',
    competencyId: 'terminal-and-environment',
    difficulty: 3,
    prompt:
      'Un comando de borrado recursivo aparece en una respuesta y vas a ejecutarlo. ¿Qué haces antes?',
    options: [
      {
        id: 'a',
        text: 'Comprobar a qué ruta resuelve exactamente',
        correct: true,
        rationale:
          'Correcto: una variable vacía o una ruta relativa convierten un borrado pequeño en uno enorme.',
      },
      {
        id: 'b',
        text: 'Ejecutarlo: si está en la respuesta, estará bien',
        correct: false,
        rationale:
          'La respuesta se escribió sin ver tu máquina. No conoce tu directorio ni tus variables.',
      },
      {
        id: 'c',
        text: 'Hacer una copia de seguridad del proyecto entero',
        correct: false,
        rationale:
          'La copia es buena práctica y no sustituye a saber qué ruta se va a borrar.',
      },
    ],
    explanation:
      'Los comandos destructivos son el error más caro y el más rápido de cometer. Verificar la ruta resuelta cuesta un segundo; equivocarse cuesta el proyecto.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-verify-agent-claim',
    competencyId: 'terminal-and-environment',
    difficulty: 2,
    prompt: 'El agente dice que las pruebas pasan. ¿Cómo lo verificas?',
    options: [
      {
        id: 'a',
        text: 'Ejecutando el comando y mirando el código de salida',
        correct: true,
        rationale:
          'Correcto: es un hecho reproducible en tu entorno. La afirmación es un testimonio.',
      },
      {
        id: 'b',
        text: 'Confiar: si lo dice, lo habrá ejecutado',
        correct: false,
        rationale:
          'Puede haber ejecutado otro comando, en otro directorio, o haber leído la salida con optimismo.',
      },
      {
        id: 'c',
        text: 'Preguntarle otra vez para confirmar',
        correct: false,
        rationale:
          'Sigue siendo su palabra. Cambia el criterio a algo que no depende de su interpretación.',
      },
    ],
    explanation:
      'Verificar es repetir la comprobación, no pedir confirmación. Es la misma idea que separa un test de una promesa.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'term-lock-file',
    competencyId: 'terminal-and-environment',
    difficulty: 3,
    prompt: 'El proyecto instala dependencias sin fijar versiones exactas. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Que cada máquina instale versiones distintas',
        correct: true,
        rationale:
          'Correcto: el mismo código falla en integración y funciona en local sin que nadie cambiara nada.',
      },
      {
        id: 'b',
        text: 'Ninguno: las versiones nuevas son mejores',
        correct: false,
        rationale:
          'Pueden serlo y traer cambios incompatibles. Sin fijarlas, el proyecto cambia sin commit.',
      },
      {
        id: 'c',
        text: 'Solo que las instalaciones tardan más',
        correct: false,
        rationale:
          'El tiempo es lo de menos. El problema es que dos ejecuciones del mismo commit no son iguales.',
      },
    ],
    explanation:
      'El fichero de bloqueo es lo que hace reproducible una instalación. Sin él, «funciona en mi máquina» deja de ser una excusa y pasa a ser una descripción técnica.',
    referenceId: 'ref-rules-ml',
  },
];
