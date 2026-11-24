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
  {
    competencyId: 'context-engineering-for-agents',
    whatIs:
      'Elegir qué información recibe el agente antes de que actúe: los ficheros que el cambio toca, el estado de la tarea, las restricciones que no puede violar. Incluye el modo de trabajo: primero leer y proponer un plan, después escribir. Y la división del trabajo en pasos con su propio contexto, para que cada fallo aparezca donde se produjo.',
    problem:
      'Se lanza el agente con el mensaje del ticket y una carpeta, o con el repositorio entero «para que no le falte nada». En el primer caso inventa la estructura que no vio; en el segundo, la señal útil se diluye entre ficheros que no aplican y acaba imitando el patrón más cercano, que a veces es el que el equipo abandonó.',
    internals: [
      'El contexto se elige por necesidad concreta —«qué hace falta para no inventar esto»— y no por cobertura —«todo lo que podría ser relevante».',
      'Separar la fase de leer y proponer de la de escribir convierte el error de enfoque en un plan que se revisa en diez líneas.',
      'El contexto caduca: un fichero leído hace veinte pasos puede haber cambiado. Releer antes de editar es la única regla que sobrevive a la concurrencia.',
      'Cada paso con su contexto y su verificación hace visible dónde se rompió una cadena larga, que es lo que una tirada de cuarenta pasos nunca revela.',
      'El orden importa: las restricciones y el criterio de éxito van donde no se pierdan; el material de consulta, después.',
    ],
    whenToUse: [
      'Cuando la tarea toca varios módulos o el agente no conoce el proyecto.',
      'Cuando hay trabajo concurrente: otra persona, otro agente o un despliegue que cambia el código mientras se edita.',
    ],
    whenNotToUse: [
      'No montes una ceremonia de contexto para un cambio de una línea en un fichero que ya está claro.',
      'No entregues el repositorio completo como sustituto de saber qué es relevante: la selección es el trabajo.',
    ],
    pitfalls: [
      {
        title: 'Contexto por costumbre',
        detail:
          'Pegar los mismos cinco ficheros en todas las tareas porque una vez hicieron falta. Cada paso paga ese contexto y la atención se reparte entre lo que no aplica.',
      },
      {
        title: 'Plan como teatro',
        detail:
          'Si el plan se aprueba siempre sin leerlo, se convierte en un trámite más: un paso que añade tiempo y no añade control.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'tdd-with-agents',
    whatIs:
      'Escribir la prueba que falla antes de delegar la implementación, y dejar que el agente itere hasta que pase. El test es el criterio de aceptación ejecutable: convierte la especificación en una condición que se cumple o no, sin interpretación. La persona define el caso; el agente recorre el camino.',
    problem:
      'Se delega sin ninguna prueba que cubra el cambio, así que la única verificación es mirar el código y decidir que parece correcto. Y aparece el modo de fallo característico: como el objetivo implícito del agente es «que pase», acaba borrando el test que falla, relajando la comprobación o rodeando el caso límite. El número de tests no baja y la cobertura no se mueve: el criterio se ha vaciado por dentro.',
    internals: [
      'El test se escribe o se valida desde fuera. Si lo redacta quien implementa, describe la solución en lugar del requisito.',
      'Los tests forman parte del contrato: se revisan sus diffs con la misma atención que el código, porque debilitar una comprobación es más difícil de ver que borrarla.',
      'La suite rápida es un requisito, no una comodidad: un agente que itera no espera veinte minutos, se salta la red.',
      'Un test comprueba comportamiento observable. Si mira llamadas internas, cada refactor lo rompe y el equipo aprende a esquivarlo.',
      'Ver el test fallar primero comprueba el instrumento: un test que nace en verde puede estar midiendo otra cosa.',
    ],
    whenToUse: [
      'Siempre que el cambio se pueda describir como «dado esto, espero aquello».',
      'Al arreglar un error: primero el test que lo reproduce, después la corrección.',
    ],
    whenNotToUse: [
      'No escribas un test para cada detalle interno: la red se vuelve un impuesto que frena los cambios que no alteran comportamiento.',
      'No uses la cobertura como objetivo: se infla con tests que ejecutan líneas sin comprobar nada.',
    ],
    pitfalls: [
      {
        title: 'El test que desaparece',
        detail:
          'El agente borra el caso que falla para dejar la integración en verde. Si nadie mira el diff de los tests, el cambio entra con menos cobertura que antes.',
      },
      {
        title: 'La comprobación que se afloja',
        detail:
          '«El total es 3» pasa a «el total no es nulo». Sigue habiendo un test, sigue pasando, y ya no distingue un resultado correcto de casi cualquiera.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'ticket-to-pr-workflow',
    whatIs:
      'El recorrido completo de un cambio asistido: la petición con su criterio de aceptación, el plan técnico revisado por una persona, la rama, los tests escritos primero, la integración continua como puerta, la revisión del diff y el merge. Cada paso existe porque corrige un tipo de error concreto, y el orden importa: se colocan donde el error todavía es barato.',
    problem:
      'Se salta el plan y se revisa al final, cuando el cambio ya está entero. El resultado es un diff de dos mil líneas que nadie lee de verdad: se aprueba porque las pruebas están en verde y porque hay prisa. Y como nadie sabe qué decidió el agente por el camino, tampoco se puede explicar mañana por qué el sistema hace lo que hace.',
    internals: [
      'La petición trae el criterio de aceptación antes de que exista una rama: sin eso, el flujo solo produce código más rápido hacia el sitio equivocado.',
      'El plan se revisa antes de escribir. Es el único punto donde decir «no por ahí» cuesta minutos.',
      'Las ramas y los diffs se mantienen pequeños por una razón práctica: un cambio que no cabe en diez minutos de revisión se aprueba por cansancio.',
      'La integración continua decide con hechos: pruebas, lint, secretos, dependencias. Lo que el agente afirma sobre su propio trabajo no es evidencia.',
      'La revisión la firma una persona. Un agente puede hacer el primer pase, y la responsabilidad del merge no se delega.',
    ],
    whenToUse: [
      'En cualquier cambio que llegue a una rama compartida, también en los pequeños: el coste del flujo es proporcional al tamaño.',
      'Cuando varias personas u otros agentes van a leer el cambio después.',
    ],
    whenNotToUse: [
      'No conviertas el flujo en una ceremonia obligatoria para corregir una errata: la gente aprende a rellenar formularios sin leerlos.',
      'No añadas puntos de control que nadie ejerce: una aprobación automática es peor que ninguna, porque simula supervisión.',
    ],
    pitfalls: [
      {
        title: 'El diff que nadie lee',
        detail:
          'Un cambio enorme con pruebas en verde se aprueba por inercia. El tamaño es la primera señal de alarma, antes que el contenido.',
      },
      {
        title: 'Tratar la rama como un estorbo',
        detail:
          'Cuando el agente tiene permiso para integrar sin revisión, el flujo desaparece y con él la posibilidad de explicar qué pasó.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'ai-code-review',
    whatIs:
      'Revisar el diff de un cambio generado buscando lo que un revisor con prisa no vería: coherencia con el resto del proyecto, casos límite inventados, dependencias nuevas, secretos, pruebas debilitadas y código que ya no se usa. La revisión se ordena por riesgo —datos y seguridad primero— y la firma una persona.',
    problem:
      'El código generado es plausible. Compila, las pruebas pasan, los nombres son razonables y el estilo encaja. Justo por eso se revisa por encima: parece escrito por alguien que sabía lo que hacía. Y en esa plausibilidad se esconden la función que no existe, el apagado del caso límite y la clave de ejemplo que alguien copió de la documentación.',
    internals: [
      'Se revisa el diff completo, incluidas las pruebas, la configuración y las dependencias: lo que no está en el código también cambia el comportamiento.',
      'Lo primero es el riesgo: datos personales, permisos, secretos, dependencias nuevas. El estilo, al final y con moderación.',
      'Una dependencia nueva es una decisión de arquitectura disfrazada de línea en un fichero.',
      'El diff de las pruebas se lee con la misma atención: borrar un caso o aflojar una comprobación no cambia el número de pruebas.',
      'Un agente revisor sirve como primer pase y no como aprobación: dos modelos de acuerdo no son una firma.',
    ],
    whenToUse: [
      'Siempre que el cambio lo haya producido un agente, aunque el diff sea pequeño: la plausibilidad no es proporcional al tamaño.',
      'Cuando el cambio toca pruebas o configuración de despliegue.',
    ],
    whenNotToUse: [
      'No reescribas el estilo del cambio solo porque no es tu forma de escribirlo: eso es ruido y desgasta al autor de la próxima revisión.',
      'No sustituyas la revisión humana por dos revisiones automáticas: coincide el mismo punto ciego en los dos.',
    ],
    pitfalls: [
      {
        title: 'Revisión de cortesía',
        detail:
          'Mirar que las pruebas estén en verde y aprobar. Es la revisión que el código plausible invita a hacer, y la que deja pasar lo que nadie más va a mirar.',
      },
      {
        title: 'Discutir estilo durante una hora',
        detail:
          'El tiempo de revisión es finito: gastarlo en comas significa no gastarlo en el caso límite que falta.',
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

  // ── context-engineering-for-agents ──────────────────────────────────────────

  {
    id: 'ctxa-what-first',
    competencyId: 'context-engineering-for-agents',
    difficulty: 1,
    prompt: 'Vas a delegar un cambio pequeño. ¿Qué contexto das primero?',
    options: [
      {
        id: 'a',
        text: 'Los ficheros que toca y el contrato del repositorio',
        correct: true,
        rationale:
          'Correcto: lo que se va a modificar y las reglas de la casa. Es el mínimo que evita inventar.',
      },
      {
        id: 'b',
        text: 'El repositorio entero, para que no le falte nada',
        correct: false,
        rationale:
          'La señal útil se pierde entre miles de líneas que no aplican, y se paga en cada llamada.',
      },
      {
        id: 'c',
        text: 'Solo el mensaje original del ticket',
        correct: false,
        rationale:
          'Sin el código ni las convenciones, el agente rellena los huecos inventando estructura.',
      },
    ],
    explanation:
      'Elegir contexto es decidir qué necesita el agente para no adivinar. La pregunta útil no es «¿qué podría ser relevante?» sino «¿qué necesita para no inventar esto?».',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ctxa-plan-mode',
    competencyId: 'context-engineering-for-agents',
    difficulty: 2,
    prompt:
      'En el modo agente, el agente edita ficheros mientras explora. ¿Qué cambia si primero solo planifica?',
    options: [
      {
        id: 'a',
        text: 'El error de enfoque se ve sin haber escrito código',
        correct: true,
        rationale:
          'Correcto: revisar un plan es leer diez líneas; revisar un cambio mal enfocado es descartar un diff.',
      },
      {
        id: 'b',
        text: 'El agente tarda lo mismo pero escribe mejor',
        correct: false,
        rationale:
          'No es una mejora de calidad del código. Es un punto de control colocado antes del coste.',
      },
      {
        id: 'c',
        text: 'El agente deja de poder editar ficheros para siempre',
        correct: false,
        rationale:
          'El plan es una fase, no una limitación permanente. Después de aprobarlo, ejecuta.',
      },
    ],
    explanation:
      'Separar explorar de modificar es lo que convierte el agente en algo revisable. Sin esa separación, la primera noticia de que iba por otro camino es un diff completo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ctxa-stale-read',
    competencyId: 'context-engineering-for-agents',
    difficulty: 2,
    prompt:
      'Cambias un fichero mientras el agente trabaja y él sigue editando con la versión que leyó al principio. ¿Qué ha pasado?',
    options: [
      {
        id: 'a',
        text: 'Trabajaba sobre una versión que ya no existe',
        correct: true,
        rationale:
          'Correcto: su contexto es una foto. Toda edición posterior se aplica a un texto desactualizado.',
      },
      {
        id: 'b',
        text: 'El agente debería haber bloqueado el fichero',
        correct: false,
        rationale:
          'Ningún agente bloquea ficheros por su cuenta. La regla de «leer antes de editar» es del flujo.',
      },
      {
        id: 'c',
        text: 'Es normal: al guardar se fusiona lo tuyo con lo suyo',
        correct: false,
        rationale:
          'La fusión de texto puede funcionar y el resultado puede carecer de sentido: nadie decidió sobre el conjunto.',
      },
    ],
    explanation:
      'El contexto envejece. En trabajo concurrente, la única regla fiable es releer antes de escribir, y decidir quién toca qué. Lo demás es confiar en que el texto encaje por suerte.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ctxa-split-tasks',
    competencyId: 'context-engineering-for-agents',
    difficulty: 2,
    prompt:
      'Una tarea de cuarenta pasos falla en el paso treinta y ocho. ¿Qué conviene para la próxima vez?',
    options: [
      {
        id: 'a',
        text: 'Dividirla en pasos con su propio contexto y verificación',
        correct: true,
        rationale:
          'Correcto: el fallo aparece en el paso que lo causó, y el trabajo anterior no se repite.',
      },
      {
        id: 'b',
        text: 'Repetirla entera con un modelo más potente',
        correct: false,
        rationale:
          'Vuelve a apostar a una sola tirada larga. El punto de fallo sigue siendo invisible.',
      },
      {
        id: 'c',
        text: 'Aumentar el límite de pasos del agente',
        correct: false,
        rationale:
          'Más margen para una cadena larga no revela dónde se torció, que es lo que necesitas saber.',
      },
    ],
    explanation:
      'Dividir no es burocracia: es hacer visible dónde se rompe. Una cadena de cuarenta pasos produce un resultado que no se puede diagnosticar cuando falla.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ctxa-everything-is-noise',
    competencyId: 'context-engineering-for-agents',
    difficulty: 3,
    prompt: 'Le pasas el repositorio completo «para que tenga todo el contexto». ¿Qué efecto tiene?',
    options: [
      {
        id: 'a',
        text: 'Lo relevante compite con miles de líneas que no aplican',
        correct: true,
        rationale:
          'Correcto: más texto no es más información. La señal se diluye y el coste sube en cada paso.',
      },
      {
        id: 'b',
        text: 'Ninguno: el modelo ignora lo que no sirve',
        correct: false,
        rationale:
          'Ignorar no es filtrar. Lo irrelevante ocupa presupuesto y puede arrastrar patrones que no tocan.',
      },
      {
        id: 'c',
        text: 'Mejora la calidad porque no hay huecos de información',
        correct: false,
        rationale:
          'Rellena huecos y crea un problema mayor: el agente imita el patrón más cercano, que puede ser el obsoleto.',
      },
    ],
    explanation:
      'El contexto se elige, no se acumula. Pasar el repositorio entero es delegar la selección al modelo dentro de una ventana limitada, que es justo lo que no funciona.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ctxa-invented-function',
    competencyId: 'context-engineering-for-agents',
    difficulty: 3,
    prompt: 'El agente usa una función que no existe en el proyecto. ¿Cuál es la causa más probable?',
    options: [
      {
        id: 'a',
        text: 'No vio el módulo donde esa función ya está resuelta',
        correct: true,
        rationale:
          'Correcto: sin el fichero relevante, lo más probable es que reutilice algo que suena igual.',
      },
      {
        id: 'b',
        text: 'El modelo alucina y no hay nada que hacer',
        correct: false,
        rationale:
          'A veces inventa con todo el contexto delante, y aquí había una causa concreta y evitable.',
      },
      {
        id: 'c',
        text: 'El proyecto tiene demasiadas dependencias',
        correct: false,
        rationale:
          'Las dependencias no explican por qué buscó una función inexistente en vez de reutilizar la que había.',
      },
    ],
    explanation:
      'La mayoría de las invenciones son huecos de contexto, no fallos del modelo: escribió la función que habría hecho falta porque nadie le mostró la que existía. Se arregla señalando el fichero, no cambiando de modelo.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ctxa-stale-summary',
    competencyId: 'context-engineering-for-agents',
    difficulty: 3,
    prompt:
      'El resumen de arquitectura que pasas al agente tiene tres semanas y desde entonces cambió el esquema de datos. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Que implemente sobre decisiones que ya no se toman',
        correct: true,
        rationale:
          'Correcto: el resumen tiene autoridad sin tener vigencia, y el agente no puede saberlo.',
      },
      {
        id: 'b',
        text: 'Ninguno: tres semanas es poco tiempo',
        correct: false,
        rationale:
          'El criterio no es el tiempo, es si cambió lo que describe. Un día puede bastar.',
      },
      {
        id: 'c',
        text: 'Solo que gaste contexto en información redundante',
        correct: false,
        rationale:
          'El coste es lo de menos. El riesgo es que el código resultante sea coherente con un mundo anterior.',
      },
    ],
    explanation:
      'El contexto que das se usa como verdad. Si caduca, produce código correcto para un sistema que ya no existe. La defensa es fechar el resumen y releer del código lo que cambia a menudo.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ctxa-order',
    competencyId: 'context-engineering-for-agents',
    difficulty: 1,
    prompt: '¿Importa en qué orden das el contexto al agente?',
    options: [
      {
        id: 'a',
        text: 'Sí: lo crítico va donde no se pierda',
        correct: true,
        rationale:
          'Correcto: en un contexto largo, lo enterrado en medio se diluye. La restricción crítica va a la vista.',
      },
      {
        id: 'b',
        text: 'No: el modelo atiende todo por igual',
        correct: false,
        rationale:
          'Lee todo y no presta la misma atención a todo. La posición cambia lo que acaba pesando.',
      },
      {
        id: 'c',
        text: 'Solo por estética: se lee mejor',
        correct: false,
        rationale:
          'No es cosmético. Una prohibición a mitad de un documento largo se incumple con más frecuencia.',
      },
    ],
    explanation:
      'Ordenar el contexto es parte de escribirlo. Las restricciones y el criterio de éxito van al principio; el material de consulta, después. Lo que da igual es el orden de lo irrelevante.',
    referenceId: 'ref-anthropic-system',
  },

  // ── tdd-with-agents ─────────────────────────────────────────────────────────

  {
    id: 'tdd-why-first',
    competencyId: 'tdd-with-agents',
    difficulty: 1,
    prompt: 'Delegas un cambio sin ningún test que lo cubra. ¿Cuál es la única verificación que te queda?',
    options: [
      {
        id: 'a',
        text: 'Mirar el código y decidir que parece correcto',
        correct: true,
        rationale:
          'Correcto: sin prueba ejecutable, la revisión visual es lo único que separa el cambio del merge.',
      },
      {
        id: 'b',
        text: 'Comprobar que compila y que el linter pasa',
        correct: false,
        rationale:
          'Eso verifica forma, no comportamiento. Un cambio correcto en forma puede ser el bug.',
      },
      {
        id: 'c',
        text: 'Confiar en que el agente ya lo habrá probado',
        correct: false,
        rationale:
          'El agente no tiene tu criterio ni conoce los casos límite del producto. Probar no es verificar.',
      },
    ],
    explanation:
      'Los tests son la red que hace posible delegar: convierten «parece bien» en «falla si no lo está». Sin red, revisar cada línea es la única opción, y por eso se aprueba por cansancio.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-who-writes-test',
    competencyId: 'tdd-with-agents',
    difficulty: 1,
    prompt: 'En un flujo con tests primero, ¿quién escribe el test?',
    options: [
      {
        id: 'a',
        text: 'Una persona lo define; el agente itera la implementación',
        correct: true,
        rationale:
          'Correcto: el test es el criterio de aceptación. Si lo escribe quien implementa, mide lo que hizo.',
      },
      {
        id: 'b',
        text: 'El agente, porque escribe más rápido',
        correct: false,
        rationale:
          'Rápido y a la medida de su solución. El test pasa a describir lo implementado, no lo pedido.',
      },
      {
        id: 'c',
        text: 'Da igual mientras el test pase al final',
        correct: false,
        rationale:
          'No da igual: el origen del test decide si comprueba el requisito o justifica el resultado.',
      },
    ],
    explanation:
      'El test es la especificación ejecutable. Escribirlo desde fuera —o validarlo antes de delegar— es lo que impide que el criterio se adapte a la solución en lugar de al revés.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-deleted-test',
    competencyId: 'tdd-with-agents',
    difficulty: 2,
    prompt:
      'El agente borra un test que fallaba para que la integración continua pase. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Rechazarlo: se arregla el código o se justifica el test',
        correct: true,
        rationale:
          'Correcto: un test que falla es información. Borrarlo elimina la señal y deja el fallo en el código.',
      },
      {
        id: 'b',
        text: 'Aceptarlo: si el test estorbaba, estaba mal escrito',
        correct: false,
        rationale:
          'Puede estar mal escrito, y eso se decide mirándolo. Aceptado por defecto, el próximo test también estorba.',
      },
      {
        id: 'c',
        text: 'Aceptarlo y abrir una tarea para revisarlo luego',
        correct: false,
        rationale:
          'La tarea se pierde y el cambio ya está dentro. La deuda se pagó con la cobertura de un caso real.',
      },
    ],
    explanation:
      'Es el modo de fallo más característico de delegar: el objetivo escondido es «que pase», no «que funcione». La defensa es tratar los tests como parte del contrato, no como obstáculo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-weakened-assertion',
    competencyId: 'tdd-with-agents',
    difficulty: 2,
    prompt:
      'El cambio modifica una comprobación de «el total es 3» a «el total no es nulo». ¿Qué ha pasado?',
    options: [
      {
        id: 'a',
        text: 'Ha debilitado el criterio hasta que su código lo cumple',
        correct: true,
        rationale:
          'Correcto: la comprobación ya no distingue el resultado pedido de casi cualquier resultado.',
      },
      {
        id: 'b',
        text: 'Ha hecho el test más robusto ante cambios',
        correct: false,
        rationale:
          'Robusto frente a lo que importa: ya no verifica lo que el requisito pedía.',
      },
      {
        id: 'c',
        text: 'Es una optimización para que el test sea más rápido',
        correct: false,
        rationale:
          'Una comparación de igualdad no es lenta. El cambio de forma no tiene motivo técnico.',
      },
    ],
    explanation:
      'Debilitar una comprobación es más difícil de detectar que borrar el test, porque el número de tests no cambia. Se ve leyendo el diff del test con la misma atención que el del código.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-slow-suite',
    competencyId: 'tdd-with-agents',
    difficulty: 2,
    prompt: 'La suite tarda veinte minutos y el agente itera sobre un cambio. ¿Qué consecuencia tiene?',
    options: [
      {
        id: 'a',
        text: 'Deja de ejecutarla y entrega a ciegas',
        correct: true,
        rationale:
          'Correcto: el agente optimiza tiempo. Si la red es lenta, la red se salta y la delegación pierde sentido.',
      },
      {
        id: 'b',
        text: 'Ninguna: el agente espera lo que haga falta',
        correct: false,
        rationale:
          'Los agentes tienen límites de tiempo y de pasos. Una suite larga consume ambos y se abandona.',
      },
      {
        id: 'c',
        text: 'Mejora la calidad porque se prueba más',
        correct: false,
        rationale:
          'Probar más veces lo mismo no aporta. Lo que aporta es una suite rápida que se ejecute siempre.',
      },
    ],
    explanation:
      'En el trabajo con agentes, la velocidad de la suite deja de ser una comodidad y pasa a ser un requisito. Si tarda demasiado, no se ejecuta, y sin ejecutarse no protege.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-behavior-not-internals',
    competencyId: 'tdd-with-agents',
    difficulty: 3,
    prompt:
      'Un test comprueba que se llama a una función interna concreta. Cada refactor lo rompe. ¿Qué falla?',
    options: [
      {
        id: 'a',
        text: 'Prueba cómo está hecho, no qué hace',
        correct: true,
        rationale:
          'Correcto: probar cómo está hecho obliga a reescribir el test en cada cambio que no altera el resultado.',
      },
      {
        id: 'b',
        text: 'Falta un mock más que lo estabilice',
        correct: false,
        rationale:
          'Más mocks lo atan todavía más a la implementación actual. El problema es el objeto de la prueba.',
      },
      {
        id: 'c',
        text: 'El refactor está mal hecho',
        correct: false,
        rationale:
          'Un refactor que no cambia comportamiento no debería tocar los tests. Si los toca, el test estaba mirando dentro.',
      },
    ],
    explanation:
      'Un test atado a la implementación se convierte en un impuesto: cada mejora lo rompe y el equipo aprende a esquivarlo. El test útil describe qué se ve desde fuera, no cómo se consigue.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-see-it-fail',
    competencyId: 'tdd-with-agents',
    difficulty: 3,
    prompt: '¿Por qué se ejecuta el test antes de implementar, sabiendo que va a fallar?',
    options: [
      {
        id: 'a',
        text: 'Para comprobar que el test prueba algo de verdad',
        correct: true,
        rationale:
          'Correcto: un test que pasa antes de implementar no mide nada. Ese fallo es la prueba de que el test mira donde debe.',
      },
      {
        id: 'b',
        text: 'Por tradición del desarrollo guiado por pruebas',
        correct: false,
        rationale:
          'La costumbre no es un motivo. El motivo es que el orden verifica el test, no solo el código.',
      },
      {
        id: 'c',
        text: 'Para que el agente vea el mensaje de error y aprenda',
        correct: false,
        rationale:
          'Útil, y no es la razón principal. Aunque el test lo escriba una persona, se ejecuta primero por la misma causa.',
      },
    ],
    explanation:
      'El primer paso del ciclo comprueba el instrumento, no el código. Un test que nace en verde puede estar midiendo otra cosa, y nunca lo sabrás hasta que algo se rompa sin avisar.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tdd-coverage-trap',
    competencyId: 'tdd-with-agents',
    difficulty: 3,
    prompt: 'El proyecto tiene cien por cien de cobertura y apareció un bug en producción. ¿Cómo se explica?',
    options: [
      {
        id: 'a',
        text: 'La cobertura mide líneas ejecutadas, no casos comprobados',
        correct: true,
        rationale:
          'Correcto: se puede ejecutar una línea y no comprobar ninguna de sus ramas ni sus límites.',
      },
      {
        id: 'b',
        text: 'Alguien desactivó los tests antes de desplegar',
        correct: false,
        rationale:
          'Podría ser, y la explicación estructural es más simple: cobertura alta con casos flojos.',
      },
      {
        id: 'c',
        text: 'El bug estaba en una dependencia externa',
        correct: false,
        rationale:
          'Es una causa posible. No explica por qué una métrica alta convive con comportamiento sin cubrir.',
      },
    ],
    explanation:
      'La cobertura dice cuánto código se ejecutó, no cuánto se verificó. Como objetivo se puede inflar con tests que pasan por todas las líneas sin comprobar nada. Como diagnóstico, sirve para encontrar lo que no se ejecuta nunca.',
    referenceId: 'ref-rules-ml',
  },
  // ── ticket-to-pr-workflow ───────────────────────────────────────────────────

  {
    id: 't2p-before-branch',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 1,
    prompt: 'Antes de crear la rama, ¿qué debería existir?',
    options: [
      {
        id: 'a',
        text: 'El criterio de aceptación del cambio',
        correct: true,
        rationale:
          'Correcto: sin él, el flujo solo produce código más rápido hacia un sitio sin definir.',
      },
      {
        id: 'b',
        text: 'El nombre definitivo de la rama',
        correct: false,
        rationale:
          'Es trámite. Se decide en segundos y no cambia si el resultado es el correcto.',
      },
      {
        id: 'c',
        text: 'La estimación de horas del cambio',
        correct: false,
        rationale:
          'La estimación gestiona expectativas, no corrige nada del trabajo. No es un punto de control.',
      },
    ],
    explanation:
      'El primer control del flujo es saber qué significa que el cambio esté bien. Todo lo demás —plan, pruebas, revisión— compara contra eso. Si falta, los puntos de control se convierten en opiniones.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-pr-size',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 1,
    prompt: 'El cambio llega como un diff de dos mil líneas con las pruebas en verde. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Partirlo en cambios revisables por separado',
        correct: true,
        rationale:
          'Correcto: si no cabe en una revisión real, la aprobación será por cansancio y no por criterio.',
      },
      {
        id: 'b',
        text: 'Aprobarlo: las pruebas pasan, que es la garantía',
        correct: false,
        rationale:
          'Las pruebas cubren lo que alguien pensó probar. Lo que falta está justo fuera de eso.',
      },
      {
        id: 'c',
        text: 'Pedir un resumen en lenguaje natural para revisar eso',
        correct: false,
        rationale:
          'El resumen lo escribe quien implementó. Aprobarías su descripción del cambio, no el cambio.',
      },
    ],
    explanation:
      'El tamaño del diff decide si la revisión puede existir. Es la señal de alarma más fiable y la más fácil de detectar, antes de mirar una sola línea.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-merge-permission',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 2,
    prompt: 'El agente tiene permiso para integrar sus propios cambios sin revisión. ¿Qué se pierde?',
    options: [
      {
        id: 'a',
        text: 'La firma: alguien que responda del cambio',
        correct: true,
        rationale:
          'Correcto: sin firma, nadie puede explicar mañana quién decidió que esto entrara.',
      },
      {
        id: 'b',
        text: 'Velocidad de entrega del equipo',
        correct: false,
        rationale:
          'Al contrario, se gana velocidad. Lo que se pierde es el control y la trazabilidad.',
      },
      {
        id: 'c',
        text: 'Nada, si las pruebas pasan siempre',
        correct: false,
        rationale:
          'Las pruebas comprueban lo previsto. Lo imprevisto es justo lo que la revisión busca.',
      },
    ],
    explanation:
      'La revisión es donde una persona asume el cambio. Delegar la integración a quien lo escribió elimina la única defensa frente a lo que las pruebas no cubren.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-ci-not-claim',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 2,
    prompt: 'El agente informa de que las pruebas pasan. ¿Qué haces con esa afirmación?',
    options: [
      {
        id: 'a',
        text: 'Comprobarlo en la integración continua',
        correct: true,
        rationale:
          'Correcto: la afirmación de quien hizo el trabajo no es evidencia. El resultado del script sí.',
      },
      {
        id: 'b',
        text: 'Aceptarla: si lo dice, lo habrá ejecutado',
        correct: false,
        rationale:
          'Puede haber ejecutado otra cosa, en otro entorno, o haber leído la salida de forma optimista.',
      },
      {
        id: 'c',
        text: 'Pedirle que lo repita para confirmarlo',
        correct: false,
        rationale:
          'Sigue siendo su palabra. Cambia el punto de verificación a algo que no depende de su criterio.',
      },
    ],
    explanation:
      'La puerta la abre un hecho verificable, no un testimonio. Por eso el flujo pone la integración continua entre el trabajo y el merge: sustituye la confianza por una ejecución reproducible.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-direct-to-main',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 2,
    prompt:
      'Un cambio pequeño y urgente: ¿se puede saltar la rama y tocar la línea principal?',
    options: [
      {
        id: 'a',
        text: 'No: sin rama no hay revisión ni registro de qué entró',
        correct: true,
        rationale:
          'Correcto: la urgencia acorta el flujo, no lo anula. El registro de por qué se cambió algo vale igual.',
      },
      {
        id: 'b',
        text: 'Sí, si el cambio ocupa menos de diez líneas',
        correct: false,
        rationale:
          'El tamaño no mide el riesgo. Una línea puede cambiar un permiso o un cálculo de facturación.',
      },
      {
        id: 'c',
        text: 'Sí, avisando después en el canal del equipo',
        correct: false,
        rationale:
          'El aviso llega cuando ya ocurrió. El canal no es un punto de control y nadie lo usará para reconstruirlo.',
      },
    ],
    explanation:
      'El flujo protege sobre todo el registro y la revisión, y esos dos no dependen del tamaño. Saltarlo por urgencia es aceptar no poder explicar el cambio después.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-fix-or-regenerate',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 3,
    prompt: 'La revisión pide dos correcciones. ¿Se arreglan en la misma rama o se regenera el cambio?',
    options: [
      {
        id: 'a',
        text: 'En la misma rama, con correcciones acotadas',
        correct: true,
        rationale:
          'Correcto: el diff sigue siendo revisable y el hilo conserva por qué se pidió cada ajuste.',
      },
      {
        id: 'b',
        text: 'Regenerar todo con las indicaciones nuevas',
        correct: false,
        rationale:
          'Se pierde lo que ya estaba bien y aparecen cambios no revisados en zonas que nadie miró.',
      },
      {
        id: 'c',
        text: 'Cerrar el cambio y abrir otro desde cero',
        correct: false,
        rationale:
          'Reinicia la revisión entera por dos detalles. El coste de revisar no se reutiliza.',
      },
    ],
    explanation:
      'Regenerar sustituye un problema conocido y acotado por un diff nuevo sin revisar. La corrección incremental mantiene el trabajo ya validado y el motivo de cada cambio.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-pr-description',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 3,
    prompt: '¿Qué debe contar la descripción de un cambio generado?',
    options: [
      {
        id: 'a',
        text: 'Qué cambia, por qué, qué se probó y qué no',
        correct: true,
        rationale:
          'Correcto: lo que el revisor necesita para decidir, incluida la parte que quedó sin cubrir.',
      },
      {
        id: 'b',
        text: 'Que el cambio lo ha generado un agente',
        correct: false,
        rationale:
          'Cómo se escribió no cambia cómo se revisa. Lo que importa es el efecto y la evidencia.',
      },
      {
        id: 'c',
        text: 'Un resumen del proceso de conversación',
        correct: false,
        rationale:
          'El recorrido interesa poco. El revisor necesita el resultado y sus límites, no la transcripción.',
      },
    ],
    explanation:
      'Una descripción útil permite revisar sin arqueología: qué se pretendía, qué se hizo, qué se comprobó y qué se dejó fuera a sabiendas. El «qué no» es lo que suele faltar y lo que más ayuda.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 't2p-disable-check',
    competencyId: 'ticket-to-pr-workflow',
    difficulty: 3,
    prompt:
      'Una comprobación de la integración continua bloquea el cambio y no está claro por qué. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Investigar el fallo antes de tocar la comprobación',
        correct: true,
        rationale:
          'Correcto: la comprobación existe porque algo se rompió antes. Desactivarla borra la lección.',
      },
      {
        id: 'b',
        text: 'Desactivarla temporalmente y seguir',
        correct: false,
        rationale:
          'Lo temporal se queda. Y desactivar la puerta es exactamente lo que el flujo intentaba evitar.',
      },
      {
        id: 'c',
        text: 'Añadir una excepción para este caso concreto',
        correct: false,
        rationale:
          'Las excepciones se acumulan y la comprobación acaba siendo opcional en la práctica.',
      },
    ],
    explanation:
      'Cuando la puerta estorba, casi siempre es porque está diciendo algo. Desactivarla convierte un fallo detectado en un fallo latente, y el siguiente que llegue tendrá menos red.',
    referenceId: 'ref-rules-ml',
  },

  // ── ai-code-review ──────────────────────────────────────────────────────────

  {
    id: 'rv-where-to-start',
    competencyId: 'ai-code-review',
    difficulty: 1,
    prompt: 'Abres el diff de un cambio generado. ¿Por dónde empiezas?',
    options: [
      {
        id: 'a',
        text: 'Por lo que puede hacer daño: datos, permisos, secretos',
        correct: true,
        rationale:
          'Correcto: el tiempo de revisión es finito y se gasta mejor en lo irreversible.',
      },
      {
        id: 'b',
        text: 'Por el estilo, para dejarlo coherente',
        correct: false,
        rationale:
          'Se arregla después y suele tener arreglo automático. Ocupa el tiempo de lo que no lo tiene.',
      },
      {
        id: 'c',
        text: 'Por el final, que es donde suelen estar los errores',
        correct: false,
        rationale:
          'No hay razón para suponer eso. El orden se decide por riesgo, no por posición en el fichero.',
      },
    ],
    explanation:
      'La revisión se prioriza por consecuencia: primero lo que no se deshace —un secreto expuesto, un permiso abierto, un dato de más—, después la corrección y al final la forma.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'rv-plausible-danger',
    competencyId: 'ai-code-review',
    difficulty: 1,
    prompt: 'El código compila, pasa las pruebas y los nombres son razonables. ¿Qué implica?',
    options: [
      {
        id: 'a',
        text: 'Nada sobre su corrección: la plausibilidad es el riesgo',
        correct: true,
        rationale:
          'Correcto: lo generado suele leerse como si lo hubiera escrito alguien que sabía, y por eso se revisa menos.',
      },
      {
        id: 'b',
        text: 'Que está bien: tres señales coinciden',
        correct: false,
        rationale:
          'Las tres miden forma. Una función correcta para el problema equivocado pasa las tres.',
      },
      {
        id: 'c',
        text: 'Que solo hay que revisar la lógica de negocio',
        correct: false,
        rationale:
          'La lógica de negocio es justo donde la plausibilidad engaña: suena a lo que se pedía.',
      },
    ],
    explanation:
      'Lo peligroso del código automático no es que sea obviamente malo, sino que es coherente. La revisión tiene que buscar activamente lo plausible pero incorrecto.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'rv-review-the-tests',
    competencyId: 'ai-code-review',
    difficulty: 2,
    prompt: 'El cambio incluye modificaciones en las pruebas. ¿Se revisan?',
    options: [
      {
        id: 'a',
        text: 'Sí, con la misma atención que el código',
        correct: true,
        rationale:
          'Correcto: borrar un caso o aflojar una comprobación deja el mismo número de pruebas y menos cobertura real.',
      },
      {
        id: 'b',
        text: 'No: las pruebas son andamiaje del cambio',
        correct: false,
        rationale:
          'Son el criterio de aceptación. Si se relajan, el cambio se aprueba contra un listón más bajo.',
      },
      {
        id: 'c',
        text: 'Solo si falla algo en la integración continua',
        correct: false,
        rationale:
          'Si se aflojó lo justo para que pasara, no fallará nunca. Es el fallo que no produce señal.',
      },
    ],
    explanation:
      'El diff de las pruebas es donde se ve si el criterio se mantuvo o se adaptó a la solución. Es la parte del cambio que menos se mira y más dice.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rv-new-dependency',
    competencyId: 'ai-code-review',
    difficulty: 2,
    prompt: 'El cambio añade una dependencia nueva para resolver un caso. ¿Cómo lo tratas?',
    options: [
      {
        id: 'a',
        text: 'Como una decisión de arquitectura, no como un detalle',
        correct: true,
        rationale:
          'Correcto: una dependencia nueva entra en producción, se mantiene y hay que actualizarla durante años.',
      },
      {
        id: 'b',
        text: 'Como un detalle: resuelve el caso y es pequeña',
        correct: false,
        rationale:
          'El tamaño del paquete no mide el coste de mantenerlo, auditarlo y actualizarlo.',
      },
      {
        id: 'c',
        text: 'Como algo que decide el autor del cambio',
        correct: false,
        rationale:
          'Quien implementa optimiza su tarea. La decisión afecta a todo el proyecto y la toma quien lo mantiene.',
      },
    ],
    explanation:
      'Una línea en el fichero de dependencias es la decisión con más alcance de un cambio pequeño: introduce código ajeno, obligaciones de seguridad y mantenimiento futuro.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'rv-secret-in-example',
    competencyId: 'ai-code-review',
    difficulty: 2,
    prompt: 'El diff incluye una clave de ejemplo en el código. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Quitarla y revisar si la clave real existe',
        correct: true,
        rationale:
          'Correcto: los secretos de ejemplo suelen ser reales copiados de un entorno. Hay que comprobar y rotar.',
      },
      {
        id: 'b',
        text: 'Dejarla: es solo un ejemplo en un comentario',
        correct: false,
        rationale:
          'El ejemplo queda en el historial del repositorio, que es donde se buscan claves.',
      },
      {
        id: 'c',
        text: 'Sustituirla por una cadena vacía',
        correct: false,
        rationale:
          'Tapa el síntoma en el código y no comprueba si la clave estuvo expuesta o sigue siendo válida.',
      },
    ],
    explanation:
      'Un secreto en el historial ya está comprometido, aunque el fichero se corrija después. La respuesta es quitarlo, comprobar si era válido y rotarlo si lo era.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'rv-dead-code',
    competencyId: 'ai-code-review',
    difficulty: 3,
    prompt: 'El cambio deja una función nueva que nadie llama y una rama que nunca se ejecuta. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Pedir que se quite: no hay razón para dejarla',
        correct: true,
        rationale:
          'Correcto: el código sin usar se lee, se mantiene y se cree vivo. Es deuda desde el primer día.',
      },
      {
        id: 'b',
        text: 'Dejarlo: puede servir más adelante',
        correct: false,
        rationale:
          'Lo que no se usa hoy se escribe cuando haga falta, con el contexto de entonces. Guardarlo es apostar.',
      },
      {
        id: 'c',
        text: 'Dejarlo con un comentario que explique para qué es',
        correct: false,
        rationale:
          'El comentario no lo ejecuta ni lo prueba. Sigue siendo código que nadie valida.',
      },
    ],
    explanation:
      'Las sobras son típicas de un agente que explora: prueba caminos y no limpia. Revisarlas es parte de la revisión, porque lo que no se usa no está verificado por nada.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'rv-two-agents-approve',
    competencyId: 'ai-code-review',
    difficulty: 3,
    prompt: 'Dos agentes revisores dan el visto bueno. ¿Puede integrarse?',
    options: [
      {
        id: 'a',
        text: 'No: falta la firma de una persona',
        correct: true,
        rationale:
          'Correcto: los revisores automáticos comparten puntos ciegos y no asumen responsabilidad.',
      },
      {
        id: 'b',
        text: 'Sí: dos revisiones independientes son más que una humana',
        correct: false,
        rationale:
          'No son independientes: miran lo mismo con criterios parecidos. Y no responden del resultado.',
      },
      {
        id: 'c',
        text: 'Sí, si el cambio es pequeño y las pruebas pasan',
        correct: false,
        rationale:
          'El tamaño no sustituye a la responsabilidad. Un cambio pequeño puede abrir un permiso.',
      },
    ],
    explanation:
      'Los agentes revisores son un buen primer pase: leen rápido y son constantes. No firman, no responden de lo que aprueban y comparten el sesgo de haber sido entrenados igual.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'rv-priority-order',
    competencyId: 'ai-code-review',
    difficulty: 3,
    prompt: 'Quedan cinco minutos de revisión y hay tres cosas pendientes. ¿Cuál miras?',
    options: [
      {
        id: 'a',
        text: 'El cambio de permisos y el acceso a datos',
        correct: true,
        rationale:
          'Correcto: es lo único que no se arregla después. El estilo tiene arreglo automático.',
      },
      {
        id: 'b',
        text: 'Los nombres de variables y la longitud de las funciones',
        correct: false,
        rationale:
          'Se corrige con herramientas y en otra iteración. No deja consecuencias fuera del código.',
      },
      {
        id: 'c',
        text: 'Los comentarios, para que quede documentado',
        correct: false,
        rationale:
          'Útil y aplazable. Ningún incidente se produce por un comentario que falta.',
      },
    ],
    explanation:
      'Revisar con prisa es la situación normal, así que el orden tiene que estar decidido de antemano: primero lo irreversible, después lo corregible y al final lo estético.',
    referenceId: 'ref-anthropic-system',
  },
];