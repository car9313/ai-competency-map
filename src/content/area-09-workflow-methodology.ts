/**
 * Área 09 — Metodología y flujo con agentes.
 *
 * Ocho competencias sobre **cómo cambia el trabajo**, no sobre cómo se construye el sistema.
 * El eje: el código que escribe un agente no es el problema; el problema es que nadie
 * especificó qué debía pasar, nadie revisó lo que sí pasó y nadie sabe cuántas veces hubo
 * que rehacerlo.
 *
 * La primera, el desarrollo guiado por especificación, es la base de las demás: sin un
 * criterio de aceptación escrito, no hay forma de saber si el agente acertó.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_09: readonly Lesson[] = [
  {
    competencyId: 'spec-driven-development',
    whatIs:
      'Escribir, antes de que el agente toque código, qué debe hacer el sistema y cómo se comprueba. La especificación describe comportamiento observable —entradas, salidas, errores, límites— y no una idea general del resultado. A partir de ella salen dos piezas distintas: el plan técnico, que decide cómo, y las tareas, que son los pasos verificables que se delegan.',
    problem:
      'Se le pide al agente «implementa el buscador» y devuelve algo que funciona en su cabeza: un método de búsqueda que no es el del producto, un formato de error inventado, ni un solo caso límite. El código compila, los tests escritos por el agente pasan y el comportamiento no es el pedido. Sin criterio de aceptación escrito, no hay forma de discutirlo: la discusión pasa a ser sobre la interpretación de cada uno, después de que el trabajo ya está hecho.',
    internals: [
      'Una especificación se reconoce porque es comprobable: cada punto se puede convertir en un test o en un paso manual con resultado esperado.',
      'Lo que debe cumplirse siempre —tests en verde, lint, ningún secreto— vive en la integración continua, no en la especificación: un script no se negocia ni se olvida.',
      'El plan técnico y la especificación son documentos distintos: el primero decide estructura, el segundo decide comportamiento. Mezclarlos hace que ninguna de las dos cosas sea verificable.',
      'Las tareas se escriben en pasos que se pueden revisar por separado. Una tarea que no se puede verificar sin terminar las siguientes no es una tarea, es una esperanza.',
      'La revisión humana en el plan es el punto de control más barato: cambiar el rumbo antes de implementar cuesta minutos; después, cuesta reescribir.',
    ],
    whenToUse: [
      'Cuando el cambio toca comportamiento que el usuario percibe: formato de respuesta, validaciones, mensajes de error.',
      'Cuando se delega trabajo que hay que poder revisar sin tener que reconstruir la intención original.',
    ],
    whenNotToUse: [
      'No escribas una especificación de veinte páginas para renombrar una variable: el coste supera la ambigüedad que elimina.',
      'No dejes la especificación viva solo al principio: una especificación que nadie actualiza se convierte en documentación obsoleta que alguien usará como verdad.',
    ],
    pitfalls: [
      {
        title: 'Especificación que describe una idea, no un comportamiento',
        detail:
          '«El buscador debe ser rápido y preciso» no se puede comprobar. «Devuelve los cinco primeros resultados con el término en el título en menos de 300 ms con este conjunto» sí.',
      },
      {
        title: 'El monstruo de markdown',
        detail:
          'Adoptar el flujo sin cambiar cómo colaboran producto, arquitectura y pruebas produce documentos que se escriben una vez y envejecen en silencio. El método no arregla un proceso que sigue igual.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'agents-md-context-files',
    whatIs:
      'Un fichero de instrucciones para agentes —AGENTS.md en el formato abierto, con variantes por herramienta— es el contrato del repositorio: qué comandos construyen y prueban, qué convenciones hay que respetar, qué está prohibido tocar. Se escribe para que un agente que entra por primera vez no tenga que deducir nada de la estructura del proyecto.',
    problem:
      'Cada sesión empieza con el agente adivinando. Prueba `npm test`, falla porque el proyecto usa pnpm; edita un fichero generado; introduce un patrón que el equipo abandonó hace un año. La persona corrige lo mismo todos los días y llama a eso «supervisión», cuando en realidad está repitiendo un contexto que debería estar escrito una vez.',
    internals: [
      'Va al principio lo que un recién llegado necesita para no romper nada: comandos exactos de instalación, build, test y lint; y las prohibiciones explícitas.',
      'Corto y mantenido gana a completo y abandonado: un contrato de una página que se actualiza vale más que un manual de cincuenta que nadie relee.',
      'Lo que debe cumplirse siempre no se escribe aquí: se ejecuta en la integración continua. El fichero explica cómo trabajar; los scripts garantizan el resultado.',
      'Las convenciones se escriben como ejemplos del propio repositorio: una ruta a un fichero que sirve de modelo enseña más que tres párrafos describiendo el estilo.',
    ],
    whenToUse: [
      'En cuanto más de una persona —o más de una sesión— trabaja en el repositorio con agentes.',
      'Cuando el proyecto tiene comandos no evidentes o ficheros que nadie debe tocar a mano.',
    ],
    whenNotToUse: [
      'No lo uses como sustituto de la integración continua: un fichero que pide ejecutar los tests no los ejecuta.',
      'No metas en él decisiones que cambian cada semana: un contrato inestable deja de leerse.',
    ],
    pitfalls: [
      {
        title: 'El manual que crece sin límite',
        detail:
          'Añadir una regla por cada incidente convierte el contrato en un archivo histórico. Cuando llega a varias páginas, el agente lo cumple a medias y la persona deja de leerlo.',
      },
      {
        title: 'Contrato que miente',
        detail:
          'Si los comandos del fichero ya no son los que usa el equipo, el agente fallará siguiendo instrucciones correctas para un proyecto que ya no existe.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
];

export const ITEMS_AREA_09: readonly Item[] = [
  {
    id: 'sdd-other-thing',
    competencyId: 'spec-driven-development',
    difficulty: 1,
    prompt:
      'El agente implementa rápido y el código pasa sus propios tests, pero no hace lo que pediste. ¿Qué faltaba?',
    options: [
      {
        id: 'a',
        text: 'Un criterio de aceptación comprobable por escrito',
        correct: true,
        rationale:
          'Correcto: sin criterio no hay nada que incumplir. El agente cumplió su interpretación, que es lo último que quieres.',
      },
      {
        id: 'b',
        text: 'Un modelo más capaz para entender el encargo',
        correct: false,
        rationale:
          'Un modelo mejor interpreta mejor lo ambiguo, y sigue siendo ambiguo. El encargo no estaba definido.',
      },
      {
        id: 'c',
        text: 'Más ejemplos de código en el mensaje inicial',
        correct: false,
        rationale:
          'Los ejemplos muestran estilo, no comportamiento. Sin los casos límite escritos, se inventan igual.',
      },
    ],
    explanation:
      'Cuando el resultado no es el pedido, casi siempre el pedido no estaba escrito en términos que se puedan comprobar. La especificación no es burocracia: es lo que convierte «no es lo que quería» en una lista de puntos que fallan.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-what-belongs',
    competencyId: 'spec-driven-development',
    difficulty: 1,
    prompt: '¿Qué debe contener una especificación para que sirva?',
    options: [
      {
        id: 'a',
        text: 'Comportamiento esperado y cómo se comprueba',
        correct: true,
        rationale:
          'Correcto: entradas, salidas, errores y límites, cada uno con su forma de verificarlo.',
      },
      {
        id: 'b',
        text: 'Los comandos de compilación y despliegue',
        correct: false,
        rationale:
          'Eso es el contrato del repositorio, no la especificación de un cambio. Va en otro sitio.',
      },
      {
        id: 'c',
        text: 'La opinión del revisor sobre el diseño',
        correct: false,
        rationale:
          'Las preferencias se discuten en la revisión del plan. Una especificación con opiniones deja de ser comprobable.',
      },
    ],
    explanation:
      'La prueba de fuego de una especificación es sencilla: cada punto puede convertirse en un test o en un paso manual con resultado esperado. Lo que no pasa esa prueba es contexto útil, pero no especificación.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-spec-or-ci',
    competencyId: 'spec-driven-development',
    difficulty: 2,
    prompt:
      '«Todos los tests deben pasar y no puede haber secretos en el código». ¿Dónde va esa regla?',
    options: [
      {
        id: 'a',
        text: 'En la integración continua, como comprobación',
        correct: true,
        rationale:
          'Correcto: lo que debe cumplirse siempre se ejecuta, no se pide. Un script no se olvida ni se negocia.',
      },
      {
        id: 'b',
        text: 'En la especificación, junto a los criterios',
        correct: false,
        rationale:
          'La especificación se lee una vez; el script se ejecuta en cada cambio. Ponerlo ahí confía en la memoria.',
      },
      {
        id: 'c',
        text: 'En los dos sitios, para reforzarlo',
        correct: false,
        rationale:
          'Duplicar la regla crea dos verdades. Cuando una cambie, la otra mentirá y nadie sabrá cuál manda.',
      },
    ],
    explanation:
      'Es la división más útil del flujo: la especificación describe qué debe pasar, y la integración continua garantiza lo que no puede fallar nunca. Lo que depende de que alguien se acuerde, no está garantizado.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-long-spec-ignored',
    competencyId: 'spec-driven-development',
    difficulty: 2,
    prompt: 'Una especificación de cuarenta páginas y el agente ignora la mitad. ¿Qué está pasando?',
    options: [
      {
        id: 'a',
        text: 'No cabe ni compite por el contexto disponible',
        correct: true,
        rationale:
          'Correcto: lo que no entra en la ventana, o queda sepultado entre lo demás, no existe para el modelo.',
      },
      {
        id: 'b',
        text: 'El modelo elegido es demasiado pequeño',
        correct: false,
        rationale:
          'Cambiar de modelo no arregla un documento que no cabe. Con otro modelo se ignora otra mitad.',
      },
      {
        id: 'c',
        text: 'Faltan ejemplos de lo que se espera',
        correct: false,
        rationale:
          'Puede faltar alguno, y el problema principal es de tamaño: la señal útil está enterrada.',
      },
    ],
    explanation:
      'Una especificación larga compite consigo misma: lo esencial queda a la altura de lo accesorio. Es más útil un documento corto con los casos límite que uno completo que nadie lee entero, ni la persona ni el agente.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sdd-plan-checkpoint',
    competencyId: 'spec-driven-development',
    difficulty: 2,
    prompt:
      'El flujo exige que una persona revise el plan técnico antes de que el agente implemente. ¿Para qué?',
    options: [
      {
        id: 'a',
        text: 'Es el punto más barato para corregir el rumbo',
        correct: true,
        rationale:
          'Correcto: cambiar el plan cuesta minutos; descubrir el error con el código escrito cuesta rehacerlo.',
      },
      {
        id: 'b',
        text: 'Para dejar constancia de que alguien lo supervisó',
        correct: false,
        rationale:
          'La constancia sin criterio es una firma. La revisión vale porque cambia decisiones, no porque exista.',
      },
      {
        id: 'c',
        text: 'Porque el agente no sabe planificar por su cuenta',
        correct: false,
        rationale:
          'Planifica, y no sabe si el plan encaja con la arquitectura real, los plazos o lo que el equipo ya decidió.',
      },
    ],
    explanation:
      'Los puntos de control se colocan donde el error aún es barato. Revisar el plan es la última oportunidad de decir «no por ahí» antes de que el coste sea código escrito, revisado y descartado.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-ambiguous-threshold',
    competencyId: 'spec-driven-development',
    difficulty: 3,
    prompt: 'Un criterio dice «la búsqueda debe ser rápida». ¿Qué le falta para ser aceptable?',
    options: [
      {
        id: 'a',
        text: 'Un umbral medible y bajo qué condiciones',
        correct: true,
        rationale:
          'Correcto: «menos de 300 ms en el percentil 95 con este conjunto» se puede comprobar; «rápida» no.',
      },
      {
        id: 'b',
        text: 'Más detalle en prosa sobre lo que se espera',
        correct: false,
        rationale:
          'La prosa añade contexto y no añade verificabilidad. Diez líneas sobre rapidez siguen sin ser un umbral.',
      },
      {
        id: 'c',
        text: 'Un ejemplo de uso de la función de búsqueda',
        correct: false,
        rationale:
          'El ejemplo muestra la llamada, no cuándo se considera aceptable. Falta el número y la condición.',
      },
    ],
    explanation:
      'Un criterio sin número ni condición no se puede incumplir, y por tanto no sirve. La forma de detectarlo es preguntarse: ¿qué medición haría fallar esto? Si no hay respuesta, no es un criterio.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-stale-spec',
    competencyId: 'spec-driven-development',
    difficulty: 3,
    prompt:
      'La especificación se escribió, se implementó y nadie la volvió a tocar. Seis meses después sigue en el repositorio. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Que alguien la use como verdad de lo que hace el sistema',
        correct: true,
        rationale:
          'Correcto: un documento desactualizado es peor que ninguno, porque se lee con la confianza de lo escrito.',
      },
      {
        id: 'b',
        text: 'Ninguno: ya cumplió su función al implementarse',
        correct: false,
        rationale:
          'Cumplió una vez. El repositorio la sigue ofreciendo como descripción vigente del comportamiento.',
      },
      {
        id: 'c',
        text: 'Solo ocupa espacio y hace más lenta la búsqueda',
        correct: false,
        rationale:
          'El espacio es irrelevante. El daño es informativo: describe un sistema que ya no existe.',
      },
    ],
    explanation:
      'La especificación es documentación viva o es una trampa. Si el flujo no incluye actualizarla cuando cambia el comportamiento, el método produce exactamente el problema que decía resolver.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-task-size',
    competencyId: 'spec-driven-development',
    difficulty: 3,
    prompt:
      'La especificación pide «implementar el módulo de facturación completo». ¿Qué conviene hacer antes de delegar?',
    options: [
      {
        id: 'a',
        text: 'Partirlo en tareas verificables por separado',
        correct: true,
        rationale:
          'Correcto: cada tarea se revisa y se prueba sola, así el error aparece en el paso que lo causó.',
      },
      {
        id: 'b',
        text: 'Pedirlo de golpe y revisar el resultado final',
        correct: false,
        rationale:
          'Cuando algo falla, el diff es enorme y no se sabe qué decisión lo causó. La revisión deja de ser posible.',
      },
      {
        id: 'c',
        text: 'Aumentar el presupuesto de pasos del agente',
        correct: false,
        rationale:
          'Más margen para un encargo indivisible produce más trabajo que revisar de una vez, no mejor.',
      },
    ],
    explanation:
      'El tamaño de la tarea decide si la revisión es posible. Un cambio que no cabe en una revisión de diez minutos es un cambio que se aprueba por cansancio.',
    referenceId: 'ref-rules-ml',
  },

  // ── agents-md-context-files ─────────────────────────────────────────────────

  {
    id: 'agents-md-first-entry',
    competencyId: 'agents-md-context-files',
    difficulty: 1,
    prompt: '¿Qué va primero en un fichero de instrucciones para agentes?',
    options: [
      {
        id: 'a',
        text: 'Los comandos exactos para construir y probar',
        correct: true,
        rationale:
          'Correcto: sin eso, el agente adivina el gestor de paquetes y falla antes de empezar.',
      },
      {
        id: 'b',
        text: 'La historia y la visión del proyecto',
        correct: false,
        rationale:
          'Da contexto y no le dice qué ejecutar. Se puede enlazar, ocupa el espacio que necesita lo operativo.',
      },
      {
        id: 'c',
        text: 'La lista de dependencias y sus versiones',
        correct: false,
        rationale:
          'Eso ya está en el fichero de dependencias. Duplicarlo garantiza que quede desactualizado.',
      },
    ],
    explanation:
      'El contrato responde a «cómo se trabaja aquí», y lo primero que hay que saber es cómo ejecutar el proyecto. Es lo que convierte una sesión en trabajo útil en vez de en exploración.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'agents-md-prohibitions',
    competencyId: 'agents-md-context-files',
    difficulty: 2,
    prompt:
      'En el proyecto hay ficheros generados que nadie debe editar a mano. ¿Cómo lo expresses?',
    options: [
      {
        id: 'a',
        text: 'Como prohibición explícita, con las rutas',
        correct: true,
        rationale:
          'Correcto: «no edites `src/generated/**`» es comprobable por el agente y por una persona al revisar.',
      },
      {
        id: 'b',
        text: 'Esperando que se deduzca de la estructura',
        correct: false,
        rationale:
          'Nada en la estructura dice que sea generado. Se deduce después de editar y romperlo.',
      },
      {
        id: 'c',
        text: 'Poniendo una nota en cada fichero afectado',
        correct: false,
        rationale:
          'Funciona para una persona que abre el fichero. El agente puede no leerlo antes de modificarlo.',
      },
    ],
    explanation:
      'Las prohibiciones son la mitad más útil del contrato: evitan el error caro. Cuanto más concreta la ruta y la razón, más fácil es respetarla y más fácil detectar que se incumplió.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'agents-md-length',
    competencyId: 'agents-md-context-files',
    difficulty: 2,
    prompt:
      'El fichero de instrucciones del repositorio tiene ya quince páginas. ¿Qué está pasando?',
    options: [
      {
        id: 'a',
        text: 'Se ha convertido en un archivo histórico que nadie lee',
        correct: true,
        rationale:
          'Correcto: cada incidente añadió una regla. El agente cumple parte y la persona dejó de leerlo.',
      },
      {
        id: 'b',
        text: 'Está completo, que es lo deseable',
        correct: false,
        rationale:
          'Completo y sin leer es peor que corto y respetado. Lo que no cabe en la sesión no se aplica.',
      },
      {
        id: 'c',
        text: 'Necesita más reglas para cubrir los huecos',
        correct: false,
        rationale:
          'Añadir más acelera el problema. Lo que sobra hay que sacarlo, no compensarlo.',
      },
    ],
    explanation:
      'El contrato compite por el mismo contexto que el código. Quince páginas de reglas dejan menos sitio a lo que hay que hacer y aumentan la probabilidad de que el agente cumpla lo accesorio y olvide lo importante.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'agents-md-not-a-gate',
    competencyId: 'agents-md-context-files',
    difficulty: 3,
    prompt:
      'El contrato dice «ejecuta los tests antes de terminar». El agente entrega sin ejecutarlos. ¿Qué fallaba?',
    options: [
      {
        id: 'a',
        text: 'La regla era una petición, no una comprobación',
        correct: true,
        rationale:
          'Correcto: se lo pediste por escrito. Si debe cumplirse siempre, tiene que ejecutarse en la integración continua.',
      },
      {
        id: 'b',
        text: 'La regla estaba mal redactada',
        correct: false,
        rationale:
          'Está clara. La redacción no cambia el hecho de que nada la hace cumplir.',
      },
      {
        id: 'c',
        text: 'El agente no tenía permiso para ejecutar tests',
        correct: false,
        rationale:
          'Podría ser en algún entorno, y el patrón es más general: lo que se pide no se garantiza.',
      },
    ],
    explanation:
      'Escribir una regla es pedir; automatizarla es garantizar. El fichero de instrucciones explica cómo trabajar, y la integración continua es lo que decide si el trabajo entra o no.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'agents-md-commands-wrong',
    competencyId: 'agents-md-context-files',
    difficulty: 2,
    prompt:
      'El contrato indica `npm test` y el equipo migró a otro gestor de paquetes hace meses. ¿Qué consecuencia tiene?',
    options: [
      {
        id: 'a',
        text: 'El agente falla siguiendo instrucciones correctas para otro proyecto',
        correct: true,
        rationale:
          'Correcto: cumple el contrato al pie de la letra y el contrato describe un repositorio que ya no existe.',
      },
      {
        id: 'b',
        text: 'Ninguna: el agente probará hasta encontrar el comando',
        correct: false,
        rationale:
          'A veces lo encuentra, gastando pasos y tiempo. Otras concluye que el proyecto no compila.',
      },
      {
        id: 'c',
        text: 'El contrato se actualiza solo al detectar el error',
        correct: false,
        rationale:
          'Nada lo actualiza. Un documento que envejece en silencio es la causa, no la solución.',
      },
    ],
    explanation:
      'El contrato es código de configuración: se cambia con los cambios del proyecto. Si los comandos dejan de ser ciertos, el fichero se convierte en una fuente de fallos con apariencia de autoridad.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'agents-md-conventions-as-examples',
    competencyId: 'agents-md-context-files',
    difficulty: 3,
    prompt:
      'Quieres que el agente siga las convenciones del equipo. ¿Cómo se consigue mejor?',
    options: [
      {
        id: 'a',
        text: 'Apuntando a un fichero del repositorio que sirva de modelo',
        correct: true,
        rationale:
          'Correcto: un ejemplo real del propio proyecto enseña estructura, nombres y estilo a la vez.',
      },
      {
        id: 'b',
        text: 'Describiendo el estilo en tres párrafos',
        correct: false,
        rationale:
          'Es interpretable y largo. Lo que se ve en un fichero modelo no se discute.',
      },
      {
        id: 'c',
        text: 'Confiar en que el agente imite el código existente',
        correct: false,
        rationale:
          'Imitará el primero que encuentre, que puede ser justo el patrón antiguo que querías abandonar.',
      },
    ],
    explanation:
      'Un ejemplo del repositorio es la convención más corta y menos ambigua que existe: no describe el estilo, lo muestra. Y cuando el estilo cambie, basta con cambiar el fichero modelo.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'agents-md-when',
    competencyId: 'agents-md-context-files',
    difficulty: 1,
    prompt: '¿Cuándo empieza a compensar escribir un fichero de instrucciones para agentes?',
    options: [
      {
        id: 'a',
        text: 'Cuando más de una persona o sesión trabaja en el repo',
        correct: true,
        rationale:
          'Correcto: en cuanto hay más de una, el contexto deja de estar en una cabeza y hay que escribirlo.',
      },
      {
        id: 'b',
        text: 'Solo en proyectos con más de cien ficheros',
        correct: false,
        rationale:
          'El tamaño no es el criterio. Un proyecto pequeño con comandos raros lo necesita igual.',
      },
      {
        id: 'c',
        text: 'Cuando el equipo empieza a usar agentes de pago',
        correct: false,
        rationale:
          'El precio de la herramienta no cambia lo que el agente necesita saber para no romper nada.',
      },
    ],
    explanation:
      'El disparador es la repetición: si estás explicando lo mismo en cada sesión, ya toca escribirlo. Y si solo trabajas tú, también compensa por la misma razón aplicada a tu yo de dentro de un mes.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'agents-md-stale-authority',
    competencyId: 'agents-md-context-files',
    difficulty: 3,
    prompt:
      'El contrato dice «usa siempre el patrón A» y la arquitectura migró al patrón B. ¿Qué es lo más urgente?',
    options: [
      {
        id: 'a',
        text: 'Corregir el contrato antes de la siguiente sesión',
        correct: true,
        rationale:
          'Correcto: mientras diga A, cada sesión produce código con el patrón abandonado, y encima con respaldo escrito.',
      },
      {
        id: 'b',
        text: 'Añadir una nota al final explicando el cambio',
        correct: false,
        rationale:
          'Deja dos instrucciones contradictorias. El agente elegirá una, y no sabes cuál.',
      },
      {
        id: 'c',
        text: 'Dejarlo y corregir en la revisión de código',
        correct: false,
        rationale:
          'Traslada a la revisión un error que se comete solo por seguir el documento. Cuesta más.',
      },
    ],
    explanation:
      'Un contrato obsoleto es peor que no tenerlo, porque produce errores con autoridad. Cuando la regla cambia, el fichero se actualiza en el mismo cambio que la decisión, no después.',
    referenceId: 'ref-rules-ml',
  },
];
