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
  {
    competencyId: 'testing-fundamentals',
    whatIs:
      'Una prueba es una afirmación ejecutable sobre el comportamiento de un programa: dado esto, espero aquello. La pirámide reparte cuántas de cada tipo conviene tener —muchas unitarias rápidas, algunas de integración donde las piezas se juntan, muy pocas de extremo a extremo— y el criterio para escribir una es sencillo: si no puede fallar, no prueba nada.',
    problem:
      'Se persigue la cobertura como si fuera el objetivo, y se llega al cien por cien con pruebas que recorren todas las líneas sin comprobar ninguna. O se prueban los dobles de prueba en lugar del comportamiento. O la suite tarda veinte minutos y nadie la ejecuta antes de integrar. En los tres casos el resultado es el mismo: hay pruebas, están en verde y no protegen de nada.',
    internals: [
      'La pirámide es una proporción, no una ley: muchas unitarias porque son baratas y rápidas, integración donde hay riesgo de que las piezas no encajen, extremo a extremo solo para el camino que no puede romperse.',
      'Un buen caso prueba comportamiento observable: el camino feliz, el límite y el error esperado. Los tres, no solo el primero.',
      'La prueba se escribe para poder fallar. Verla en rojo antes de implementar comprueba el instrumento, no el código.',
      'Probar un doble de prueba comprueba que el doble hace lo que le dijiste, no que el sistema funcione.',
      'La velocidad es un requisito: una suite que tarda se salta, y una suite que se salta no es una red de seguridad.',
    ],
    whenToUse: [
      'Antes de tocar código que ya funciona: la prueba fija el comportamiento actual y avisa si lo rompes.',
      'Al arreglar un fallo: primero la prueba que lo reproduce, después la corrección.',
    ],
    whenNotToUse: [
      'No escribas una prueba por cada detalle interno: cada refactor la romperá sin que nada se haya roto de verdad.',
      'No uses la cobertura como objetivo: se infla con pruebas que pasan por las líneas sin afirmar nada.',
    ],
    pitfalls: [
      {
        title: 'Probar el mock',
        detail:
          'Una prueba que comprueba que se llamó a una función concreta verifica la implementación de hoy, no el comportamiento. Cambia el cómo y la prueba cae aunque el resultado sea correcto.',
      },
      {
        title: 'La suite que nadie ejecuta',
        detail:
          'Veinte minutos de pruebas significan que se ejecutan al final, o no se ejecutan. La red existe para usarse muchas veces, no una.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'read-and-debug-code',
    whatIs:
      'Depurar es buscar, no tener una corazonada: reproducir el fallo, formular una hipótesis sobre la causa, buscar la evidencia que la pueda refutar y reducir el espacio hasta el punto exacto donde el comportamiento deja de ser el esperado. Leer código ajeno es parte de lo mismo: se entra por el punto de llamada y se sigue el recorrido del dato, no se lee el fichero entero.',
    problem:
      'Se cambian cosas al azar hasta que el síntoma desaparece, se cambian cinco a la vez y luego no se sabe cuál funcionó, o se culpa a la dependencia sin haber mirado. El síntoma se tapa —una validación desactivada, un caso especial— y la causa sigue ahí, esperando al siguiente dato que la dispare.',
    internals: [
      'Primero se reproduce. Un fallo que no se reproduce no se puede arreglar: solo se puede dejar de ver.',
      'La hipótesis se intenta refutar, no confirmar. Buscar lo que la sostiene es cómo uno se convence de una idea equivocada.',
      'Bisección: reducir el espacio por mitades —la mitad de los datos, la mitad de los commits, la mitad del recorrido— encuentra la causa más rápido que leerlo todo.',
      'El registro que falta se añade donde la hipótesis puede romperse, no donde el fallo se manifiesta.',
      'Un fallo intermitente pide más información —condiciones, hora, datos de entrada—, no más reintentos.',
    ],
    whenToUse: [
      'Cuando algo falla y no sabes por qué, o cuando sabes el síntoma y no la causa.',
      'Al entrar en un código que no escribiste: seguir una llamada concreta desde su punto de entrada.',
    ],
    whenNotToUse: [
      'No añadas registros por todas partes: el ruido esconde la señal que buscabas.',
      'No apliques un arreglo sin haber reproducido el fallo: no sabrás si funcionó.',
    ],
    pitfalls: [
      {
        title: 'Tapar el síntoma',
        detail:
          'Desactivar la validación que falla o envolver la llamada en un try que ignora el error. El sistema deja de avisar y el problema sigue ocurriendo.',
      },
      {
        title: 'Cinco cambios a la vez',
        detail:
          'Si algo funciona después, no sabes cuál de los cinco era necesario. Depurar exige cambiar una variable por vez.',
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

  // ── testing-fundamentals ────────────────────────────────────────────────────

  {
    id: 'test-what-is-it',
    competencyId: 'testing-fundamentals',
    difficulty: 1,
    prompt: '¿Qué es una prueba automatizada?',
    options: [
      {
        id: 'a',
        text: 'Una afirmación ejecutable sobre el comportamiento',
        correct: true,
        rationale:
          'Correcto: dado esto, espero aquello, y se comprueba solo cada vez que se ejecuta.',
      },
      {
        id: 'b',
        text: 'Un documento que describe lo que hace el programa',
        correct: false,
        rationale:
          'Una descripción no se ejecuta y por tanto no puede avisar cuando deja de ser cierta.',
      },
      {
        id: 'c',
        text: 'Una lista de pasos para probar a mano',
        correct: false,
        rationale:
          'Los pasos manuales se olvidan y no se repiten en cada cambio. Eso es un guion de pruebas, no una prueba.',
      },
    ],
    explanation:
      'Lo que distingue a una prueba es que se ejecuta y falla sin que nadie opine. Esa es la razón de que sirva como red de seguridad al delegar código.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-which-cases',
    competencyId: 'testing-fundamentals',
    difficulty: 1,
    prompt: '¿Qué casos conviene cubrir en una función nueva?',
    options: [
      {
        id: 'a',
        text: 'El camino normal, el límite y el error esperado',
        correct: true,
        rationale:
          'Correcto: los tres tipos. Los fallos de producción viven casi siempre en los dos últimos.',
      },
      {
        id: 'b',
        text: 'Solo el caso normal, para que pase rápido',
        correct: false,
        rationale:
          'El caso normal es el que ya funciona. Las pruebas se escriben para lo que aún no está comprobado.',
      },
      {
        id: 'c',
        text: 'Todos los valores posibles de entrada',
        correct: false,
        rationale:
          'Es imposible en casi cualquier función y no hace falta. Se prueban valores que representan clases de casos.',
      },
    ],
    explanation:
      'Probar el camino feliz demuestra que funciona cuando todo va bien. Los límites y los errores son donde el sistema se rompe, y son justo los que nadie prueba por iniciativa propia.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-proportion',
    competencyId: 'testing-fundamentals',
    difficulty: 2,
    prompt: '¿Por qué conviene tener muchas pruebas unitarias y pocas de extremo a extremo?',
    options: [
      {
        id: 'a',
        text: 'Porque el coste y la fragilidad crecen con el alcance',
        correct: true,
        rationale:
          'Correcto: una de extremo a extremo tarda, es inestable y su fallo no dice dónde está el problema.',
      },
      {
        id: 'b',
        text: 'Porque las de extremo a extremo no encuentran errores',
        correct: false,
        rationale:
          'Encuentran errores de integración que las unitarias no ven. El problema es su coste por caso.',
      },
      {
        id: 'c',
        text: 'Porque es la regla que se enseña en los cursos',
        correct: false,
        rationale:
          'La proporción no es una norma ceremonial: responde a cuánto cuesta cada tipo y qué te dice cuando falla.',
      },
    ],
    explanation:
      'La pirámide existe por economía: cuando una prueba falla, lo barato es saber exactamente qué se rompió. Cuanto más ancha es la prueba, menos lo dice y más tarda.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-mock-trap',
    competencyId: 'testing-fundamentals',
    difficulty: 2,
    prompt:
      'Una prueba comprueba que se llamó a una función interna con unos argumentos concretos. ¿Qué problema tiene?',
    options: [
      {
        id: 'a',
        text: 'Fija la implementación, no el comportamiento',
        correct: true,
        rationale:
          'Correcto: cualquier refactor que conserve el resultado romperá la prueba sin que nada se haya roto.',
      },
      {
        id: 'b',
        text: 'Ninguno: cuantas más comprobaciones, mejor',
        correct: false,
        rationale:
          'Comprobar cómo está hecho convierte cada mejora en una rotura de pruebas y enseña al equipo a ignorarlas.',
      },
      {
        id: 'c',
        text: 'Solo que es más lenta de ejecutar',
        correct: false,
        rationale:
          'La velocidad es lo de menos. El problema es que mide lo que no debe y bloquea cambios correctos.',
      },
    ],
    explanation:
      'Una prueba debe sobrevivir a cualquier reescritura que conserve el comportamiento. Si cae en cada refactor, no estaba probando el sistema: estaba probando su forma actual.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-red-first',
    competencyId: 'testing-fundamentals',
    difficulty: 2,
    prompt: 'Escribes una prueba y pasa a la primera, antes de implementar nada. ¿Qué significa?',
    options: [
      {
        id: 'a',
        text: 'Que probablemente no está probando lo que crees',
        correct: true,
        rationale:
          'Correcto: si no podía fallar, no verifica nada. O el caso ya estaba cubierto o la comprobación es vacía.',
      },
      {
        id: 'b',
        text: 'Que la funcionalidad ya existía y no hacía falta',
        correct: false,
        rationale:
          'Es una posibilidad que hay que comprobar, no la conclusión. La mayoría de las veces el fallo está en la prueba.',
      },
      {
        id: 'c',
        text: 'Que la prueba está muy bien escrita',
        correct: false,
        rationale:
          'Una prueba que nunca falla no protege. La primera ejecución en rojo es la que demuestra que el instrumento funciona.',
      },
    ],
    explanation:
      'Ver el rojo primero es una comprobación del instrumento. Un test que nace en verde puede estar midiendo otra cosa, y no lo sabrás hasta que algo se rompa sin avisar.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-suite-speed',
    competencyId: 'testing-fundamentals',
    difficulty: 2,
    prompt: 'La suite completa tarda veinticinco minutos. ¿Qué consecuencia tiene?',
    options: [
      {
        id: 'a',
        text: 'Se ejecuta al final o no se ejecuta',
        correct: true,
        rationale:
          'Correcto: nadie espera veinticinco minutos entre cambios. La red existe para usarse muchas veces.',
      },
      {
        id: 'b',
        text: 'Ninguna: es el precio de tener buenas pruebas',
        correct: false,
        rationale:
          'Una suite que se salta no protege, y lo caro no es tener muchas pruebas sino tener las lentas donde no toca.',
      },
      {
        id: 'c',
        text: 'Mejora la calidad porque cubre más casos',
        correct: false,
        rationale:
          'La cobertura no depende del tiempo. Se puede cubrir lo mismo en segundos separando tipos de prueba.',
      },
    ],
    explanation:
      'La velocidad no es comodidad: es lo que decide si las pruebas se usan. La solución es separar la suite rápida de la lenta, no aceptar que todo tarde.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-coverage-trap',
    competencyId: 'testing-fundamentals',
    difficulty: 3,
    prompt: 'El proyecto tiene cien por cien de cobertura y un fallo llegó a producción. ¿Cómo se explica?',
    options: [
      {
        id: 'a',
        text: 'La cobertura mide líneas ejecutadas, no casos comprobados',
        correct: true,
        rationale:
          'Correcto: se puede ejecutar cada línea y no comprobar ninguna rama ni ningún límite.',
      },
      {
        id: 'b',
        text: 'Alguien modificó las pruebas antes de desplegar',
        correct: false,
        rationale:
          'Puede haber pasado. La explicación estructural es más simple y más frecuente: cobertura alta con casos flojos.',
      },
      {
        id: 'c',
        text: 'El fallo estaba en una dependencia externa',
        correct: false,
        rationale:
          'Es una causa posible que no explica por qué una métrica alta convive con comportamiento sin verificar.',
      },
    ],
    explanation:
      'Como objetivo, la cobertura se infla con pruebas que pasan por las líneas sin afirmar nada. Como diagnóstico, sirve para encontrar lo que no se ejecuta nunca.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'test-first-when-fixing',
    competencyId: 'testing-fundamentals',
    difficulty: 3,
    prompt: 'Vas a arreglar un fallo que ya conoces. ¿Por dónde empiezas?',
    options: [
      {
        id: 'a',
        text: 'Por una prueba que lo reproduzca y falle',
        correct: true,
        rationale:
          'Correcto: la prueba fija el fallo y, al pasar, demuestra que está resuelto sin discusión.',
      },
      {
        id: 'b',
        text: 'Por el arreglo, que ya sabes cuál es',
        correct: false,
        rationale:
          'Sin prueba, no puedes demostrar que el fallo desapareció ni que no vuelve la semana que viene.',
      },
      {
        id: 'c',
        text: 'Por leer todo el módulo para entenderlo',
        correct: false,
        rationale:
          'Entender ayuda y no acota. La prueba reduce el problema a un caso concreto y comprobable.',
      },
    ],
    explanation:
      'La prueba de reproducción convierte un informe en un hecho y define el final: cuando pasa, está arreglado. Y queda como barrera para el siguiente cambio.',
    referenceId: 'ref-rules-ml',
  },

  // ── read-and-debug-code ─────────────────────────────────────────────────────

  {
    id: 'dbg-first-step',
    competencyId: 'read-and-debug-code',
    difficulty: 1,
    prompt: 'Algo falla y no sabes por qué. ¿Cuál es el primer paso?',
    options: [
      {
        id: 'a',
        text: 'Reproducirlo y describir qué esperabas y qué ocurre',
        correct: true,
        rationale:
          'Correcto: sin reproducción no hay caso concreto, y sin describirlo no sabes qué es «fallar».',
      },
      {
        id: 'b',
        text: 'Cambiar lo que parezca más sospechoso',
        correct: false,
        rationale:
          'Sin reproducir no puedes saber si el cambio afectó al fallo o al azar. Y no sabrás si volvió.',
      },
      {
        id: 'c',
        text: 'Revisar los últimos cambios de todo el equipo',
        correct: false,
        rationale:
          'Es una pista útil cuando hay pocos. Empezar por ahí sin un caso concreto es leer sin criterio.',
      },
    ],
    explanation:
      'Depurar es reducir un misterio a un caso: esto, con estos datos, produce esto otro. Esa reproducción es lo que permite comprobar hipótesis y saber cuándo terminaste.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-one-change',
    competencyId: 'read-and-debug-code',
    difficulty: 1,
    prompt: 'Cambias cinco cosas a la vez y el fallo desaparece. ¿Qué has ganado?',
    options: [
      {
        id: 'a',
        text: 'Poco: no sabes cuál era necesaria',
        correct: true,
        rationale:
          'Correcto: cuatro cambios pueden ser innecesarios o dañinos y ahora están dentro sin justificar.',
      },
      {
        id: 'b',
        text: 'El arreglo, que es lo que importaba',
        correct: false,
        rationale:
          'El síntoma desapareció. La causa no está identificada y volverá por otro camino.',
      },
      {
        id: 'c',
        text: 'Tiempo, al resolverlo de una vez',
        correct: false,
        rationale:
          'Ahorras el momento y pagas después: sin saber qué funcionó, el siguiente fallo empieza de cero.',
      },
    ],
    explanation:
      'Cambiar una cosa por vez es lo que convierte una corazonada en evidencia. Con cinco cambios simultáneos, cualquier resultado es ambiguo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-bisect',
    competencyId: 'read-and-debug-code',
    difficulty: 2,
    prompt: 'Hay doscientos commits desde la última versión que funcionaba. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Bisecar: probar el del medio y descartar la mitad',
        correct: true,
        rationale:
          'Correcto: con ocho comprobaciones se localiza el commit culpable entre doscientos.',
      },
      {
        id: 'b',
        text: 'Leer los doscientos diffs en orden',
        correct: false,
        rationale:
          'Cuesta mucho más y la atención se agota antes de llegar a la mitad. La bisección no requiere leer nada.',
      },
      {
        id: 'c',
        text: 'Volver a la versión anterior y no mirar más',
        correct: false,
        rationale:
          'Recupera el servicio, que es lo primero, y deja el fallo vivo para la próxima vez que se despliegue.',
      },
    ],
    explanation:
      'La bisección es la herramienta más rentable de la depuración: divide el espacio por mitades y no necesita entender el código para encontrar dónde cambió el comportamiento.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-where-to-log',
    competencyId: 'read-and-debug-code',
    difficulty: 2,
    prompt: 'Vas a añadir un registro para investigar. ¿Dónde lo pones?',
    options: [
      {
        id: 'a',
        text: 'Donde tu hipótesis se pueda romper',
        correct: true,
        rationale:
          'Correcto: el registro sirve para refutar. Si solo confirma lo que ya crees, no informa.',
      },
      {
        id: 'b',
        text: 'Justo donde aparece el error',
        correct: false,
        rationale:
          'Ahí ya sabes que algo falla. Lo que no sabes es qué llegó hasta ese punto.',
      },
      {
        id: 'c',
        text: 'Al principio y al final de cada función',
        correct: false,
        rationale:
          'Genera ruido que esconde la señal y hace la salida ilegible justo cuando necesitas leerla.',
      },
    ],
    explanation:
      'Un registro es un experimento: se coloca donde el resultado puede contradecirte. Si solo puede confirmar, no aporta información.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-refute-hypothesis',
    competencyId: 'read-and-debug-code',
    difficulty: 2,
    prompt: 'Tienes una hipótesis sobre la causa. ¿Qué buscas?',
    options: [
      {
        id: 'a',
        text: 'Evidencia que la pueda refutar',
        correct: true,
        rationale:
          'Correcto: si no encuentras nada que la contradiga, gana fuerza. Buscar apoyo solo confirma sesgos.',
      },
      {
        id: 'b',
        text: 'Ejemplos que la confirmen',
        correct: false,
        rationale:
          'Siempre se encuentran. Es la forma más común de pasar horas arreglando lo que no era.',
      },
      {
        id: 'c',
        text: 'La opinión de otra persona sobre la hipótesis',
        correct: false,
        rationale:
          'Una segunda opinión ayuda a generar hipótesis. Comprobar la propia exige datos del sistema, no pareceres.',
      },
    ],
    explanation:
      'Intentar refutar es lo que distingue depurar de justificar. Si la hipótesis sobrevive a los intentos de tumbarla, es una buena candidata; si solo se confirma, es una creencia.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-intermittent',
    competencyId: 'read-and-debug-code',
    difficulty: 3,
    prompt: 'Un fallo aparece una vez cada cincuenta ejecuciones. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Capturar condiciones, datos y hora de los fallos',
        correct: true,
        rationale:
          'Correcto: lo intermitente pide más datos para encontrar el patrón, no más intentos de reproducirlo.',
      },
      {
        id: 'b',
        text: 'Reintentar hasta que aparezca',
        correct: false,
        rationale:
          'Cada intento sin información es una tirada a ciegas. Puede aparecer y no dirá nada nuevo.',
      },
      {
        id: 'c',
        text: 'Añadir un reintento automático y cerrar el caso',
        correct: false,
        rationale:
          'Esconde el fallo y puede duplicar efectos. Un fallo intermitente suele ser una condición de carrera real.',
      },
    ],
    explanation:
      'Los fallos intermitentes son los más caros porque no se pueden provocar a voluntad. La estrategia es instrumentar y esperar el patrón: qué tienen en común los casos que fallan.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-read-foreign-code',
    competencyId: 'read-and-debug-code',
    difficulty: 3,
    prompt: 'Entras en un módulo que no escribiste y no funciona. ¿Por dónde empiezas a leer?',
    options: [
      {
        id: 'a',
        text: 'Por el punto de entrada y siguiendo el recorrido del dato',
        correct: true,
        rationale:
          'Correcto: se lee lo que el dato recorre. Leer el fichero entero gasta atención en código que no participa.',
      },
      {
        id: 'b',
        text: 'Por el principio del fichero más largo',
        correct: false,
        rationale:
          'La longitud no indica relevancia. El fichero más largo puede no estar en el camino del fallo.',
      },
      {
        id: 'c',
        text: 'Por las funciones que parecen más complejas',
        correct: false,
        rationale:
          'La complejidad atrae la mirada y no la justifica. El fallo puede estar en una línea trivial.',
      },
    ],
    explanation:
      'En código ajeno se lee un camino, no un fichero. Seguir el dato desde donde entra hasta donde falla convierte miles de líneas en una decena relevante.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'dbg-symptom-vs-cause',
    competencyId: 'read-and-debug-code',
    difficulty: 3,
    prompt: 'Una validación falla y desactivas la validación. ¿Qué has hecho?',
    options: [
      {
        id: 'a',
        text: 'Tapar el síntoma y dejar la causa',
        correct: true,
        rationale:
          'Correcto: el sistema deja de avisar y el problema sigue ocurriendo, ahora sin señal.',
      },
      {
        id: 'b',
        text: 'Arreglarlo, si la validación era demasiado estricta',
        correct: false,
        rationale:
          'Podría ser el caso, y hay que demostrarlo. Desactivar sin entender es quitar el detector de humo.',
      },
      {
        id: 'c',
        text: 'Nada: la validación no cambia el comportamiento',
        correct: false,
        rationale:
          'Cambia lo que el sistema acepta. Esa es precisamente la decisión que no se debe tomar sin entender la causa.',
      },
    ],
    explanation:
      'La diferencia entre síntoma y causa es la diferencia entre apagar la alarma y apagar el fuego. Desactivar la comprobación convierte un fallo visible en un fallo silencioso.',
    referenceId: 'ref-rules-ml',
  },
];
