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
import type { Lesson, Practice } from '@/features/content/domain/types';
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
  {
    competencyId: 'ai-governance-policy',
    whatIs:
      'La decisión escrita sobre qué herramientas están aprobadas, qué datos pueden salir del perímetro, qué casos están prohibidos y quién concede excepciones. Una política útil es corta, enumera y se ejecuta donde se puede comprobar: la lista de permitidas del agente, el escáner del repositorio, la revisión del cambio. Lo que no está aprobado, no está aprobado.',
    problem:
      'El uso de agentes crece por la base: cada persona instala lo que le funciona y pega el código que necesita en la herramienta que tiene a mano. Nadie decidió nada, así que la política efectiva es «lo que cada uno hizo». Cuando alguien pregunta si se puede pasar un fichero a un servicio externo, la respuesta honesta es que no se sabe, y eso significa que ya se hizo.',
    internals: [
      'La política enumera cuatro cosas: herramientas aprobadas, datos permitidos, casos prohibidos y quién aprueba excepciones. Si falta la cuarta, las otras tres se negocian caso por caso.',
      'El valor por defecto es denegar. Lo que no está en la lista no está aprobado, y esa regla tiene que poder aplicarse sin preguntar a nadie.',
      'Una política que vive en un documento no es un control. Se ejecuta en la herramienta —lista de permitidas, permisos del repositorio, filtros— o no existe.',
      'Cada excepción necesita dueño, motivo y fecha de caducidad. Las permanentes dejan de ser excepciones y pasan a ser la norma no escrita.',
      'La auditoría se diseña antes: poder responder qué herramienta, con qué datos y quién, sin reconstruirlo a mano después.',
    ],
    whenToUse: [
      'En cuanto más de un equipo usa agentes con acceso a código o datos de la organización.',
      'Antes de habilitar una herramienta nueva, no después de que alguien la esté usando.',
    ],
    whenNotToUse: [
      'No empieces con cuarenta páginas: una política que nadie ha leído no cambia ningún comportamiento.',
      'No confundas política con burocracia: si aprobar algo tarda tres semanas, la gente lo hará sin aprobarlo.',
    ],
    pitfalls: [
      {
        title: 'La política que no conoce nadie',
        detail:
          'Existe en un documento interno que se envió una vez. Nadie sabe qué está permitido, así que cada uno decide y la política real es la suma de esas decisiones.',
      },
      {
        title: 'El proceso que empuja al uso clandestino',
        detail:
          'Si el camino aprobado es lento y el no aprobado está a un clic, la organización obtiene lo que su proceso incentiva, no lo que su documento dice.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'team-adoption',
    whatIs:
      'Introducir agentes en un equipo de forma que la mejora se pueda medir: elegir una tarea concreta, medir el estado antes, medir después y sobre todo medir el retrabajo —qué proporción de cambios generados necesitó corrección sustancial—. La adopción se demuestra con uso sostenido en el trabajo ingrato, no con entusiasmo en el primer mes.',
    problem:
      'Se anuncia la herramienta en una reunión, unos cuantos la prueban con ilusión y el resto vuelve a lo de antes en dos semanas. Nadie registra cuánto del código generado hubo que rehacer, así que la conversación se queda en anécdotas: «a mí me ahorra tiempo» contra «a mí me da trabajo». Sin medición, gana quien habla más alto, y la decisión de adoptar o no se toma por impresión.',
    internals: [
      'La métrica central es el retrabajo: proporción de cambios generados que necesitaron corrección sustancial después de la revisión o en producción.',
      'Se adopta por tarea, no por herramienta: una tarea concreta, con medición antes y después, dice más que un piloto de cien personas.',
      'El ahorro bruto engaña: si escribir tarda la mitad y revisar el doble, el cambio es neutro o negativo.',
      'La señal de adopción real es que se use en el trabajo que nadie quiere hacer, no en el que ya era agradable.',
      'La confianza se construye con casos donde falló: un equipo que solo conoce los éxitos no sabe cuándo no confiar.',
    ],
    whenToUse: [
      'Cuando haya que decidir si se extiende el uso a más gente o a más tipos de tarea.',
      'Antes de comprar licencias o de fijar expectativas de productividad.',
    ],
    whenNotToUse: [
      'No midas líneas de código generadas ni horas de reunión ahorradas como prueba de nada.',
      'No lances la adopción a toda la organización de golpe: sin medir el retrabajo, no hay forma de corregir el rumbo.',
    ],
    pitfalls: [
      {
        title: 'La demo que enamora',
        detail:
          'Una demostración enseña el mejor caso posible, preparado. Sirve para interesar y no para decidir: la decisión necesita el caso difícil.',
      },
      {
        title: 'Ahorro sin coste',
        detail:
          '«Escribimos un treinta por ciento más rápido» sin contar el tiempo de revisión ni los cambios rehechos. El ahorro bruto suele evaporarse al restar el retrabajo.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'ai-dev-techniques',
    whatIs:
      'El conjunto de hábitos concretos que separan una sesión productiva de una que hay que deshacer: pedir el plan antes del código, trabajar en cambios pequeños, entregar el test que falla en lugar de un párrafo explicando el problema, pedir dos alternativas antes de elegir, reiniciar la conversación cuando el contexto se ensucia y leer el diff en vez del resumen que lo acompaña.',
    problem:
      'La misma herramienta da resultados opuestos según cómo se use. En una sesión se pide «hazme esta funcionalidad» y vuelve un cambio enorme, plausible y equivocado. En otra se entrega un test que falla y una restricción clara, y el agente resuelve en tres pasos verificables. La diferencia casi nunca es el modelo: es el tamaño del encargo, la calidad del contexto y si alguien está leyendo el resultado real.',
    internals: [
      'El plan antes del código: revisar diez líneas de plan es más barato que revisar un diff de seiscientos.',
      'Cambios pequeños: cada paso se verifica y el fallo se localiza donde ocurrió, no al final de la cadena.',
      'El test que falla es el mejor enunciado: describe el comportamiento esperado y da una señal binaria de cuándo terminó.',
      'Pedir dos alternativas antes de elegir evita aceptar la primera solución plausible; comparar fuerza a mirar el problema.',
      'Higiene de contexto: cuando la sesión acumula intentos fallidos, el agente arrastra las soluciones descartadas. Empezar de nuevo con un resumen limpio rinde más que insistir.',
      'Se lee el diff y no el resumen. La explicación la escribe quien hizo el cambio, y puede ser tan plausible como el error.',
    ],
    whenToUse: [
      'En cualquier tarea que dure más de veinte minutos o toque más de un fichero.',
      'Cuando una sesión empieza a dar vueltas sobre el mismo error: es la señal para reiniciar con contexto limpio.',
    ],
    whenNotToUse: [
      'No pidas dos alternativas para una errata: la ceremonia cuesta más que el arreglo.',
      'No reinicies la sesión por cada tropiezo: pierdes el contexto que sí servía. La señal es la repetición, no el primer fallo.',
    ],
    pitfalls: [
      {
        title: 'Aceptar el resumen en lugar del diff',
        detail:
          'El agente describe lo que hizo de forma coherente y el cambio hace otra cosa. Leer el resumen y aprobar es revisar el relato, no el código.',
      },
      {
        title: 'Insistir en una sesión contaminada',
        detail:
          'Diez intentos fallidos dejan diez enfoques descartados en el contexto. Cada petición nueva arrastra restos y el resultado empeora sin que se note la causa.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
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
  // ── ai-governance-policy ────────────────────────────────────────────────────

  {
    id: 'gov-not-on-list',
    competencyId: 'ai-governance-policy',
    difficulty: 1,
    prompt: 'Una herramienta no aparece en la lista de aprobadas. ¿Qué significa?',
    options: [
      {
        id: 'a',
        text: 'Que no está aprobada',
        correct: true,
        rationale:
          'Correcto: la lista es de permitidas, no de sugerencias. Si no está, no está, sin más averiguación.',
      },
      {
        id: 'b',
        text: 'Que se puede usar si alguien la prueba antes',
        correct: false,
        rationale:
          'Convierte la prueba individual en autorización. La decisión de exponer datos no la toma quien prueba.',
      },
      {
        id: 'c',
        text: 'Que está en revisión y se puede usar mientras',
        correct: false,
        rationale:
          '«En revisión» no es un permiso. El uso durante la revisión es exactamente lo que la lista intenta impedir.',
      },
    ],
    explanation:
      'Denegar por defecto es la única regla que se puede aplicar sin preguntar a nadie. Cualquier otra obliga a decidir caso por caso, y en la práctica decide quien tiene prisa.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-four-parts',
    competencyId: 'ai-governance-policy',
    difficulty: 1,
    prompt: '¿Qué cuatro cosas debe enumerar una política de uso de agentes?',
    options: [
      {
        id: 'a',
        text: 'Herramientas, datos, prohibiciones y quién aprueba',
        correct: true,
        rationale:
          'Correcto: sin la cuarta, las otras tres se negocian caso por caso con quien pregunte.',
      },
      {
        id: 'b',
        text: 'Herramientas, precios, licencias y proveedores',
        correct: false,
        rationale:
          'Es información de compras. No dice qué se puede hacer con el código ni con los datos.',
      },
      {
        id: 'c',
        text: 'Objetivos, métricas, responsables y plazos',
        correct: false,
        rationale:
          'Eso es un plan de proyecto. Una política responde a qué está permitido, no a qué se quiere lograr.',
      },
    ],
    explanation:
      'Sin la parte de «quién aprueba», toda excepción depende de encontrar a alguien con autoridad, y eso en la práctica significa que la excepción la concede quien está disponible.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-pdf-is-not-a-control',
    competencyId: 'ai-governance-policy',
    difficulty: 2,
    prompt: 'La política existe en un documento interno y nadie la comprueba. ¿Qué falta?',
    options: [
      {
        id: 'a',
        text: 'Un control técnico que la aplique',
        correct: true,
        rationale:
          'Correcto: la lista de permitidas, los permisos del repositorio y el escáner son la política ejecutándose.',
      },
      {
        id: 'b',
        text: 'Una comunicación más clara al equipo',
        correct: false,
        rationale:
          'La comunicación ayuda a cumplir y no garantiza nada. Lo que no se comprueba no se cumple.',
      },
      {
        id: 'c',
        text: 'Una firma de cada empleado confirmando lectura',
        correct: false,
        rationale:
          'Acredita que se leyó una vez. No cambia lo que ocurre después, que es donde se incumple.',
      },
    ],
    explanation:
      'Una política sin control es una intención. Se convierte en política cuando el sistema impide lo prohibido sin necesidad de que alguien se acuerde de la norma.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-exception-expiry',
    competencyId: 'ai-governance-policy',
    difficulty: 2,
    prompt: 'Alguien pide una excepción permanente para usar una herramienta no aprobada. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Exigir dueño, motivo y fecha de caducidad',
        correct: true,
        rationale:
          'Correcto: una excepción sin caducidad deja de ser excepción y pasa a ser la norma no escrita.',
      },
      {
        id: 'b',
        text: 'Concederla: si el equipo la necesita, algo falla',
        correct: false,
        rationale:
          'Puede ser cierto y no exime de decidir. Lo que falla se arregla en la política, no con un permiso eterno.',
      },
      {
        id: 'c',
        text: 'Denegarla: las excepciones rompen la política',
        correct: false,
        rationale:
          'Sin excepciones, el uso se vuelve clandestino. La política necesita una puerta con dueño, no un muro.',
      },
    ],
    explanation:
      'Las excepciones son válvulas, y una válvula sin cierre deja de regular. Con fecha de caducidad obligan a revisar la decisión: si sigue siendo necesaria, se renueva con motivo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-shadow-usage',
    competencyId: 'ai-governance-policy',
    difficulty: 2,
    prompt: 'El proceso para aprobar una herramienta tarda tres semanas. ¿Qué efecto tiene?',
    options: [
      {
        id: 'a',
        text: 'Que la gente use lo que no puede pedir',
        correct: true,
        rationale:
          'Correcto: la organización obtiene el comportamiento que su proceso incentiva, no el que su documento dice.',
      },
      {
        id: 'b',
        text: 'Que todos esperen: es la norma de la empresa',
        correct: false,
        rationale:
          'Algunos esperan. Los que tienen una fecha de entrega resuelven por su cuenta, y eso no se registra.',
      },
      {
        id: 'c',
        text: 'Que las herramientas aprobadas se usen menos',
        correct: false,
        rationale:
          'Ocurre lo contrario: el uso crece, solo que fuera del radar y sin nadie que pueda auditarlo.',
      },
    ],
    explanation:
      'Un proceso lento no protege: desplaza el uso a la sombra. La política que funciona habilita rápido lo permitido para poder prohibir en serio lo demás.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-audit-before',
    competencyId: 'ai-governance-policy',
    difficulty: 3,
    prompt: 'Quieres poder responder «qué herramienta usó, con qué datos y quién exactamente». ¿Cuándo se diseña eso?',
    options: [
      {
        id: 'a',
        text: 'Antes de habilitar el uso, como parte del control',
        correct: true,
        rationale:
          'Correcto: después solo se reconstruye a mano y con suerte. El registro se diseña con el permiso.',
      },
      {
        id: 'b',
        text: 'Cuando ocurra un incidente y haya que investigarlo',
        correct: false,
        rationale:
          'Ese día ya no hay datos. Lo que no se registró mientras ocurría no se puede recuperar.',
      },
      {
        id: 'c',
        text: 'Al cerrar el año, como parte de la auditoría',
        correct: false,
        rationale:
          'La auditoría comprueba lo que el sistema registró. Si nadie registró, la auditoría solo puede constatar la ausencia.',
      },
    ],
    explanation:
      'La auditabilidad es una propiedad del diseño, no una tarea posterior. Poder reconstruir qué pasó exige que el sistema lo haya guardado desde el primer día.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-data-classification',
    competencyId: 'ai-governance-policy',
    difficulty: 3,
    prompt: 'Antes de permitir que un agente envíe código del repositorio a un servicio externo, ¿qué falta?',
    options: [
      {
        id: 'a',
        text: 'Clasificar los datos que pueden salir y cuáles no',
        correct: true,
        rationale:
          'Correcto: sin esa clasificación no se puede decidir qué ficheros son admisibles ni cuáles se excluyen.',
      },
      {
        id: 'b',
        text: 'Comprobar que el proveedor tiene buena reputación',
        correct: false,
        rationale:
          'La reputación no dice qué parte del repositorio estás enviando ni quién puede leerla después.',
      },
      {
        id: 'c',
        text: 'Medir la latencia del servicio externo',
        correct: false,
        rationale:
          'El rendimiento importa cuando ya se decidió enviar. La pregunta previa es qué se puede enviar.',
      },
    ],
    explanation:
      'La política de datos se escribe una vez y sirve para todas las herramientas. Sin clasificación —público, interno, confidencial, secreto— cada permiso se decide por intuición y cambia según quién lo concede.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gov-rule-without-check',
    competencyId: 'ai-governance-policy',
    difficulty: 3,
    prompt: 'La política prohíbe pegar secretos en herramientas externas. ¿Es suficiente?',
    options: [
      {
        id: 'a',
        text: 'No: falta la comprobación que lo detecte',
        correct: true,
        rationale:
          'Correcto: una prohibición sin detección depende de que todo el mundo se acuerde justo en el momento de prisa.',
      },
      {
        id: 'b',
        text: 'Sí: cada persona sabe lo que no debe hacer',
        correct: false,
        rationale:
          'Sabe lo general y no detecta un secreto concreto dentro de un fichero de configuración ajeno.',
      },
      {
        id: 'c',
        text: 'Sí, si además se incluye en la formación anual',
        correct: false,
        rationale:
          'Añade intención y no detección. El escáner en el flujo se ejecuta en cada cambio, sin recordar nada.',
      },
    ],
    explanation:
      'Las reglas de seguridad que dependen de la memoria fallan el día de la prisa. La política se completa con un control automático en el flujo, que es lo que la convierte en barrera.',
    referenceId: 'ref-anthropic-system',
  },

  // ── team-adoption ───────────────────────────────────────────────────────────

  {
    id: 'ad-retrabajo',
    competencyId: 'team-adoption',
    difficulty: 1,
    prompt: '¿Qué métrica dice de verdad si el uso de agentes está funcionando?',
    options: [
      {
        id: 'a',
        text: 'La proporción de cambios que hubo que rehacer',
        correct: true,
        rationale:
          'Correcto: mide lo que cuesta el resultado, incluida la parte que se descubre después.',
      },
      {
        id: 'b',
        text: 'Las líneas de código generadas por semana',
        correct: false,
        rationale:
          'Mide volumen, no valor. Más código puede ser exactamente el problema.',
      },
      {
        id: 'c',
        text: 'El número de personas que la herramienta usa',
        correct: false,
        rationale:
          'Mide interés. Un equipo puede usarla mucho y rehacer la mitad de lo que produce.',
      },
    ],
    explanation:
      'El retrabajo es la métrica honesta porque incluye el coste que no aparece en la demo: el cambio que hubo que corregir en revisión o que falló en producción.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-start-small',
    competencyId: 'team-adoption',
    difficulty: 1,
    prompt: '¿Cómo se empieza una adopción que se pueda medir?',
    options: [
      {
        id: 'a',
        text: 'Una tarea concreta, medida antes y después',
        correct: true,
        rationale:
          'Correcto: una tarea acotada con línea base da una señal clara, incluso si sale mal.',
      },
      {
        id: 'b',
        text: 'Habilitarlo para todo el equipo el primer día',
        correct: false,
        rationale:
          'Sin línea base ni tarea acotada, el resultado se atribuye a la sensación de la semana.',
      },
      {
        id: 'c',
        text: 'Empezar por el proyecto más grande y visible',
        correct: false,
        rationale:
          'Mezcla adopción con riesgo de negocio. Si falla, no sabes si fue la herramienta o el proyecto.',
      },
    ],
    explanation:
      'La adopción se experimenta, no se decreta. Empezar por una tarea con medición antes y después convierte la discusión de opiniones en un dato discutible.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-enthusiasm',
    competencyId: 'team-adoption',
    difficulty: 2,
    prompt: 'El primer mes todo el equipo lo usa con entusiasmo. ¿Es señal de adopción?',
    options: [
      {
        id: 'a',
        text: 'No: la señal es el uso sostenido en lo ingrato',
        correct: true,
        rationale:
          'Correcto: lo nuevo se usa por novedad. La adopción se ve cuando se usa para lo que nadie quiere hacer.',
      },
      {
        id: 'b',
        text: 'Sí: el uso es la adopción, sin más',
        correct: false,
        rationale:
          'El uso del primer mes puede caer al tercero sin que nadie lo note. La adopción se mide después del entusiasmo.',
      },
      {
        id: 'c',
        text: 'Sí, si además hay licencias compradas',
        correct: false,
        rationale:
          'Comprar licencias mide presupuesto comprometido. No dice si alguien las usa para trabajar de verdad.',
      },
    ],
    explanation:
      'El entusiasmo es una buena señal de partida y mala de llegada. Lo que distingue adopción de moda es que la herramienta siga usándose en la tarea aburrida tres meses después.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-demo-trap',
    competencyId: 'team-adoption',
    difficulty: 2,
    prompt: 'La demostración fue espectacular, con un caso perfecto. ¿Qué te dice?',
    options: [
      {
        id: 'a',
        text: 'Que el mejor caso funciona: falta el difícil',
        correct: true,
        rationale:
          'Correcto: una demo preparada enseña el techo y no el suelo. La decisión necesita el caso que suele fallar.',
      },
      {
        id: 'b',
        text: 'Que el sistema está listo para producción',
        correct: false,
        rationale:
          'Un caso preparado no dice nada de los casos límite, que son los que producen incidentes.',
      },
      {
        id: 'c',
        text: 'Que el equipo está convencido y hay que extenderlo',
        correct: false,
        rationale:
          'Convence a quien la vio y no informa de qué pasa con datos sucios o tareas ambiguas.',
      },
    ],
    explanation:
      'Una demo es un argumento de venta, también cuando la hace tu propio equipo. Para decidir hace falta ver el caso donde falla y qué ocurre entonces.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-gross-savings',
    competencyId: 'team-adoption',
    difficulty: 2,
    prompt: '«Escribimos un treinta por ciento más rápido». ¿Qué falta para que el dato sirva?',
    options: [
      {
        id: 'a',
        text: 'Restar el tiempo de revisión y el retrabajo',
        correct: true,
        rationale:
          'Correcto: el ahorro bruto ignora el coste que se traslada a revisar y rehacer, que también es tiempo del equipo.',
      },
      {
        id: 'b',
        text: 'Compararlo con lo que tardan otras empresas',
        correct: false,
        rationale:
          'El contexto ajeno no corrige tu medición. Primero, que tu número signifique algo.',
      },
      {
        id: 'c',
        text: 'Repetir la medición con un modelo mejor',
        correct: false,
        rationale:
          'Cambia la herramienta y mantiene el error de medida. El problema es qué se cuenta, no con qué.',
      },
    ],
    explanation:
      'El ahorro bruto suele evaporarse al restar el trabajo que se mueve a otra fase. Un cambio neutro con más revisión puede parecer un ahorro del treinta por ciento en la fase de escritura.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-senior-junior',
    competencyId: 'team-adoption',
    difficulty: 3,
    prompt: '¿A quién le aporta más un agente de código?',
    options: [
      {
        id: 'a',
        text: 'Depende: quien revisa mejor aprovecha más',
        correct: true,
        rationale:
          'Correcto: el valor lo pone la capacidad de revisar. Sin criterio, el agente produce trabajo que hay que deshacer.',
      },
      {
        id: 'b',
        text: 'A quien empieza, porque no sabe escribir el código',
        correct: false,
        rationale:
          'Es quien menos puede distinguir lo plausible de lo correcto. La herramienta amplifica su punto ciego.',
      },
      {
        id: 'c',
        text: 'A quien lleva más años, porque conoce el dominio',
        correct: false,
        rationale:
          'El conocimiento de dominio ayuda y el factor decisivo es la revisión: quien sabe revisar convierte la velocidad en resultado.',
      },
    ],
    explanation:
      'La fórmula incómoda: el agente multiplica la capacidad de revisar, no la sustituye. Con buen criterio acelera mucho; sin él, genera deuda a más velocidad.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-shadow-adoption',
    competencyId: 'team-adoption',
    difficulty: 3,
    prompt:
      'Descubres que media plantilla usa herramientas no aprobadas. ¿Cuál es la respuesta útil?',
    options: [
      {
        id: 'a',
        text: 'Dar un camino permitido rápido y luego medir',
        correct: true,
        rationale:
          'Correcto: la demanda es real. Sin una alternativa aprobada, la prohibición solo empuja el uso más a la sombra.',
      },
      {
        id: 'b',
        text: 'Prohibirlo por correo y pedir que se deje de usar',
        correct: false,
        rationale:
          'Consigue que dejen de contarlo. El uso sigue, sin nadie que pueda auditar qué datos salen.',
      },
      {
        id: 'c',
        text: 'Ignorarlo: cada uno sabe lo que hace',
        correct: false,
        rationale:
          'Deja la organización sin política real y sin forma de responder cuando alguien pregunte qué pasó.',
      },
    ],
    explanation:
      'El uso clandestino es información sobre un proceso que no habilita. La respuesta útil ataca la causa —falta un camino aprobado— y luego formaliza lo que ya está pasando.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ad-what-else-to-measure',
    competencyId: 'team-adoption',
    difficulty: 3,
    prompt: 'Además del retrabajo, ¿qué conviene medir?',
    options: [
      {
        id: 'a',
        text: 'Tiempo de revisión y de corrección de incidentes',
        correct: true,
        rationale:
          'Correcto: el coste se mueve de fase. Si la escritura baja y la revisión sube, el resultado puede ser neutro.',
      },
      {
        id: 'b',
        text: 'Número de prompts enviados al día',
        correct: false,
        rationale:
          'Mide actividad. Se puede enviar muchos prompts y no terminar nada útil.',
      },
      {
        id: 'c',
        text: 'Cantidad de herramientas distintas en uso',
        correct: false,
        rationale:
          'Mide dispersión, no resultado. De hecho, más herramientas suele ser peor para la gobernanza.',
      },
    ],
    explanation:
      'El trabajo no desaparece, se desplaza. Medir solo la fase que se acelera esconde el coste que aparece en la siguiente: revisar, arreglar y responder a incidentes.',
    referenceId: 'ref-rules-ml',
  },
  // ── detección del error en un diff generado ─────────────────────────────────

  {
    id: 'rv-off-by-one',
    competencyId: 'ai-code-review',
    difficulty: 3,
    prompt:
      'Revisas este diff generado por un agente. Pasan los tests, el lint y la revisión automática. ¿Qué se escapa?',
    code: {
      label: 'diff · paginación',
      content: [
        '-  for (let i = inicio; i <= fin; i += 1) {',
        '+  for (let i = inicio; i < fin; i += 1) {',
        '     procesar(filas[i]);',
        '   }',
      ].join('\n'),
    },
    options: [
      {
        id: 'a',
        text: 'Que el último elemento del rango ya no se procesa',
        correct: true,
        rationale:
          'Correcto: cambiar `<=` por `<` excluye el extremo. Es un error de uno, invisible sin un caso que lo pruebe.',
      },
      {
        id: 'b',
        text: 'Que falta un test que cubra el bucle completo',
        correct: false,
        rationale:
          'Falta cobertura, y el defecto ya está en el código: se puede detectar leyendo el cambio, sin esperar al test.',
      },
      {
        id: 'c',
        text: 'Que `procesar` no sigue la convención de nombres',
        correct: false,
        rationale:
          'El nombre no cambia el comportamiento ni pierde datos. El estilo es ruido frente al defecto real.',
      },
    ],
    explanation:
      'Es el tipo de error que el código plausible esconde: un operador que pasa desapercibido en un diff de cuatro líneas y pierde datos en silencio. La revisión busca exactamente esto, no que el estilo encaje.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tdd-assertion-relaxed',
    competencyId: 'tdd-with-agents',
    difficulty: 2,
    prompt:
      'El agente dice haber arreglado el fallo. Este es el diff de las pruebas. ¿Qué haces?',
    code: {
      label: 'diff · prueba',
      content: [
        "test('el total suma las líneas', () => {",
        '-  expect(total([1, 2, 3])).toBe(6);',
        '+  expect(total([1, 2, 3])).toBeGreaterThan(0);',
        '});',
      ].join('\n'),
    },
    options: [
      {
        id: 'a',
        text: 'Rechazarlo: la comprobación ya no verifica el total',
        correct: true,
        rationale:
          'Correcto: cualquier resultado positivo pasa, incluido 1 en vez de 6. El criterio se adaptó a la solución.',
      },
      {
        id: 'b',
        text: 'Aceptarlo: sigue comprobando que suma algo',
        correct: false,
        rationale:
          'Comprueba que el resultado no es negativo, y el requisito pedía 6. La prueba pasó a describir el código.',
      },
      {
        id: 'c',
        text: 'Aceptarlo: es más robusto ante cambios futuros',
        correct: false,
        rationale:
          'Robusto frente a lo que importa: un total equivocado ya no rompe nada. La prueba dejó de proteger.',
      },
    ],
    explanation:
      'Es el modo de fallo más difícil de ver porque el número de pruebas no cambia. La comprobación se aflojó justo lo necesario para que su código pasara, y la suite sigue en verde.',
    referenceId: 'ref-rules-ml',
  },
  // ── ai-dev-techniques ───────────────────────────────────────────────────────

  {
    id: 'tec-plan-first',
    competencyId: 'ai-dev-techniques',
    difficulty: 1,
    prompt: 'Vas a pedir un cambio de varias horas. ¿Qué pides primero?',
    options: [
      {
        id: 'a',
        text: 'El plan, antes de que escriba código',
        correct: true,
        rationale:
          'Correcto: corregir un plan de diez líneas cuesta minutos; corregir un diff enorme cuesta rehacerlo.',
      },
      {
        id: 'b',
        text: 'El código completo, para ver si acierta',
        correct: false,
        rationale:
          'Cuando se ve el diff ya hay seiscientos sitios donde puede estar el error, y no sabes cuál decidió.',
      },
      {
        id: 'c',
        text: 'Una estimación de lo que tardará',
        correct: false,
        rationale:
          'La estimación no expone la interpretación del encargo, que es lo que necesitas revisar.',
      },
    ],
    explanation:
      'El plan es el punto de control más barato del flujo. Pedirlo primero convierte la revisión en una decisión sobre el enfoque y no en arqueología sobre un diff.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tec-small-changes',
    competencyId: 'ai-dev-techniques',
    difficulty: 1,
    prompt: 'Un cambio grande falla en la parte final. ¿Qué haces distinto la próxima vez?',
    options: [
      {
        id: 'a',
        text: 'Partirlo en pasos que se verifiquen por separado',
        correct: true,
        rationale:
          'Correcto: cada paso deja una señal de que funciona, y el fallo aparece donde se produjo.',
      },
      {
        id: 'b',
        text: 'Repetirlo con un modelo más potente',
        correct: false,
        rationale:
          'Vuelve a apostar a una cadena larga sin puntos de control, y el fallo sigue sin localizarse.',
      },
      {
        id: 'c',
        text: 'Explicar mejor el enunciado en un párrafo más largo',
        correct: false,
        rationale:
          'Un enunciado más largo no hace el cambio más pequeño. El tamaño es lo que impide verificar.',
      },
    ],
    explanation:
      'El tamaño del cambio decide si la verificación es posible. Con pasos pequeños, cada uno se prueba y se revisa; con una tirada larga, solo puedes comprobar el final.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tec-failing-test',
    competencyId: 'ai-dev-techniques',
    difficulty: 2,
    prompt: 'Quieres que el agente arregle un fallo concreto. ¿Qué le das?',
    options: [
      {
        id: 'a',
        text: 'El test que falla y el comportamiento esperado',
        correct: true,
        rationale:
          'Correcto: el test es el enunciado ejecutable. Describe el problema y da la señal de cuándo terminó.',
      },
      {
        id: 'b',
        text: 'Un párrafo describiendo lo que ves en pantalla',
        correct: false,
        rationale:
          'Es interpretable y no comprobable. El agente arreglará lo que entiende, que no es lo que ocurre.',
      },
      {
        id: 'c',
        text: 'El fichero entero donde crees que está el error',
        correct: false,
        rationale:
          'Señala una zona, no un comportamiento. Sin criterio de éxito, cualquier cambio plausible parece válido.',
      },
    ],
    explanation:
      'Un test que falla es el mejor enunciado posible: no hay interpretación y hay una señal binaria de terminado. El agente puede iterar contra eso sin que tú revises cada intento.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tec-two-options',
    competencyId: 'ai-dev-techniques',
    difficulty: 2,
    prompt: 'El agente propone una solución que parece razonable. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Pedir una segunda alternativa y comparar',
        correct: true,
        rationale:
          'Correcto: comparar obliga a mirar el problema. La primera propuesta plausible rara vez es la única.',
      },
      {
        id: 'b',
        text: 'Aceptarla: si parece razonable, lo será',
        correct: false,
        rationale:
          'La plausibilidad es justo lo que distingue al código generado. Suena bien y puede estar mal.',
      },
      {
        id: 'c',
        text: 'Pedir que la explique con más detalle',
        correct: false,
        rationale:
          'Explicará mejor la misma solución. El detalle no revela los caminos que no consideró.',
      },
    ],
    explanation:
      'Pedir alternativas es una técnica de calidad barata: la comparación saca a la luz supuestos que la primera propuesta esconde. Y a veces la segunda es claramente mejor.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'tec-context-hygiene',
    competencyId: 'ai-dev-techniques',
    difficulty: 2,
    prompt:
      'Llevas diez intentos fallidos con el mismo error y cada respuesta es peor. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Empezar una sesión nueva con un resumen limpio',
        correct: true,
        rationale:
          'Correcto: el contexto arrastra los enfoques descartados y condiciona cada intento nuevo.',
      },
      {
        id: 'b',
        text: 'Insistir: el modelo acabará encontrándolo',
        correct: false,
        rationale:
          'Cada intento añade ruido. La probabilidad de acertar no crece con la insistencia.',
      },
      {
        id: 'c',
        text: 'Subir la temperatura para que sea más creativo',
        correct: false,
        rationale:
          'Añade variación, no criterio. Para un fallo concreto, la variación es más ruido.',
      },
    ],
    explanation:
      'La higiene de contexto es una técnica, no una superstición: una sesión con diez soluciones descartadas empuja al modelo a combinarlas. Un resumen del estado y de lo que ya se probó rinde más.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tec-read-the-diff',
    competencyId: 'ai-dev-techniques',
    difficulty: 3,
    prompt:
      'El agente entrega un cambio con una descripción muy clara de lo que hizo. ¿Qué revisas?',
    options: [
      {
        id: 'a',
        text: 'El diff, línea por línea',
        correct: true,
        rationale:
          'Correcto: la descripción la escribe quien hizo el cambio. Es plausible por construcción, como el error.',
      },
      {
        id: 'b',
        text: 'La descripción, si está bien argumentada',
        correct: false,
        rationale:
          'Revisar el relato no es revisar el código. Un resumen convincente y un cambio distinto conviven bien.',
      },
      {
        id: 'c',
        text: 'El resultado de las pruebas y los checks',
        correct: false,
        rationale:
          'Necesario y no suficiente: las pruebas cubren lo que alguien pensó probar, no lo que falta.',
      },
    ],
    explanation:
      'El diff es el hecho; el resumen es una interpretación. Leer el diff se vuelve más importante, no menos, cuando el autor no responde preguntas.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tec-constrain-output',
    competencyId: 'ai-dev-techniques',
    difficulty: 3,
    prompt: 'El agente devuelve bloques enormes que no puedes revisar. ¿Qué cambias?',
    options: [
      {
        id: 'a',
        text: 'Acotar el encargo: un fichero, un cambio',
        correct: true,
        rationale:
          'Correcto: el tamaño de la respuesta lo decide el tamaño del encargo. Acotar es la palanca.',
      },
      {
        id: 'b',
        text: 'Pedirle que responda de forma más breve',
        correct: false,
        rationale:
          'Acorta el texto y no el cambio. Seguirá tocando los mismos ficheros con menos explicación.',
      },
      {
        id: 'c',
        text: 'Cambiar a un modelo con menos capacidad',
        correct: false,
        rationale:
          'Reduce calidad sin reducir alcance. El problema es el encargo, no la potencia.',
      },
    ],
    explanation:
      'La respuesta refleja el encargo. Si el resultado es inabarcable, el enunciado pedía demasiado: un cambio, un fichero y un formato concreto producen algo que se puede revisar de verdad.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tec-restart-vs-fix',
    competencyId: 'ai-dev-techniques',
    difficulty: 3,
    prompt: 'Una solución casi funciona pero hay que retocar tres cosas. ¿Reinicias o insistes?',
    options: [
      {
        id: 'a',
        text: 'Insistir: hay avance y el problema está acotado',
        correct: true,
        rationale:
          'Correcto: reiniciar tira lo que ya funciona. La higiene de contexto aplica a sesiones atascadas, no a avances parciales.',
      },
      {
        id: 'b',
        text: 'Reiniciar siempre, para no contaminar el contexto',
        correct: false,
        rationale:
          'Reiniciar con avance claro desperdicia el trabajo. La regla es «reinicia cuando no avanzas».',
      },
      {
        id: 'c',
        text: 'Reiniciar y pedir la misma solución desde cero',
        correct: false,
        rationale:
          'Reproduce el mismo camino sin el aprendizaje del intento anterior. Cuesta lo mismo y no mejora.',
      },
    ],
    explanation:
      'La técnica no es una regla fija: se reinicia cuando el contexto acumula fracasos, y se insiste cuando hay progreso y el problema está localizado. Distinguir las dos situaciones es la habilidad.',
    referenceId: 'ref-rules-ml',
  },
];

/**
 * Prácticas del área.
 *
 * Van en un mapa aparte y se fusionan al construir el catálogo por una razón práctica:
 * cada práctica es un bloque largo y meterlo dentro de su lección rompe la lectura de la
 * lección. Aquí se leen seguidas, que es como se escriben.
 */
export const PRACTICES_AREA_09: Readonly<Record<string, Practice>> = {
  'spec-driven-development': {
    title: 'Escribe la especificación de un cambio pequeño de tu proyecto',
    steps: [
      'Elige un cambio que toque comportamiento visible: un mensaje de error, una validación, un formato de respuesta.',
      'Escribe los criterios de aceptación como comportamientos observables, no como descripciones de la solución.',
      'Añade al menos tres casos límite con el resultado esperado.',
      'Separa lo que debe cumplirse siempre y decide en qué comprobación automática vive.',
      'Pide a un agente que implemente solo con ese documento delante y compara el resultado con lo escrito.',
    ],
    rubric: [
      'Cada criterio se puede convertir en una prueba o en un paso manual con resultado esperado.',
      'Hay al menos un criterio con umbral numérico y condiciones, no solo adjetivos.',
      'Los casos límite aparecen escritos, no se dejan a la interpretación de quien implemente.',
      'Las reglas que deben cumplirse siempre están asignadas a una comprobación automática, no al documento.',
      'Al comparar el resultado con la especificación, la diferencia se puede describir sin discutir intenciones.',
    ],
  },
  'agents-md-context-files': {
    title: 'Escribe el contrato del repositorio en una página',
    steps: [
      'Copia los comandos reales de instalación, construcción, pruebas y lint del proyecto.',
      'Enumera las prohibiciones con rutas concretas: ficheros generados, dependencias fijadas, configuración sensible.',
      'Elige un fichero del propio repositorio que sirva de modelo de estilo y enlázalo.',
      'Quita todo lo que no sea operativo hasta que quepa en una pantalla o dos.',
    ],
    rubric: [
      'Los comandos se pueden copiar y ejecutar tal cual, sin adivinar el gestor de paquetes.',
      'Cada prohibición nombra la ruta y el motivo de por qué no se toca.',
      'Las convenciones se muestran con un ejemplo del repositorio, no solo se describen.',
      'El documento no repite reglas que ya están en la integración continua.',
      'Alguien ajeno al proyecto puede trabajar siguiendo solo el documento.',
    ],
  },
  'context-engineering-for-agents': {
    title: 'Prepara el contexto de una tarea antes de delegarla',
    steps: [
      'Escribe en una frase qué necesita el agente para no inventar nada.',
      'Reúne solo los ficheros que el cambio toca y el contrato del repositorio.',
      'Pide primero un plan sin escribir código y revísalo.',
      'Divide la tarea en pasos con su propia verificación.',
    ],
    rubric: [
      'El contexto incluye lo que se va a modificar y las restricciones que no puede violar.',
      'Hay un plan revisado antes de que exista cualquier cambio en el código.',
      'Cada paso se puede verificar por separado y el fallo se localiza en el paso que lo causó.',
      'Lo que no aplica a la tarea se ha dejado fuera a propósito, no por olvido.',
      'Está previsto qué hacer si otra persona o proceso cambia los ficheros durante el trabajo.',
    ],
  },
  'tdd-with-agents': {
    title: 'Delega un cambio con la red de pruebas puesta',
    steps: [
      'Escribe la prueba del caso que falla o del comportamiento nuevo, y ejecútala para verla fallar.',
      'Delega la implementación indicando explícitamente que las pruebas no se modifican.',
      'Revisa el diff de las pruebas antes que el del código.',
      'Comprueba cuánto tarda la suite y qué pasaría si tardara el doble.',
    ],
    rubric: [
      'La prueba existía y fallaba antes de que el agente empezara.',
      'El diff no borra ni afloja ninguna comprobación existente.',
      'Las pruebas describen comportamiento observable, no llamadas internas.',
      'La suite se ejecuta completa en un tiempo que un agente iterando no abandonaría.',
      'Si el agente tocó las pruebas, hay una justificación escrita del cambio.',
    ],
  },
  'ticket-to-pr-workflow': {
    title: 'Recorre el flujo completo con un cambio real',
    steps: [
      'Parte de una petición con criterio de aceptación escrito.',
      'Revisa el plan técnico antes de que nadie escriba código.',
      'Implementa en una rama con las pruebas primero.',
      'Deja que la integración continua decida y revisa el diff completo, pruebas incluidas.',
      'Escribe la descripción del cambio con qué se probó y qué no.',
    ],
    rubric: [
      'El criterio de aceptación existía antes de crear la rama.',
      'El plan se revisó por una persona y esa revisión cambió algo o lo aprobó con criterio.',
      'La integración continua es la que declara que las pruebas pasan, no el autor del cambio.',
      'El diff se puede revisar en menos de diez minutos o se partió en varios.',
      'La descripción dice qué queda sin cubrir, no solo qué funciona.',
    ],
  },
  'ai-code-review': {
    title: 'Revisa un diff generado y justifica cada objeción',
    steps: [
      'Elige un cambio real producido por un agente, cuanto más plausible mejor.',
      'Lee primero las pruebas y la configuración, después el código.',
      'Anota tres cosas que podrían estar mal aunque todo pase.',
      'Clasifícalas por consecuencia: lo que no se deshace primero.',
    ],
    rubric: [
      'La revisión empezó por lo irreversible: datos, permisos, secretos, dependencias.',
      'El diff de las pruebas se leyó con la misma atención que el del código.',
      'Alguna objeción se refiere a algo que las pruebas no pueden detectar.',
      'Cada objeción explica la consecuencia, no solo la preferencia.',
      'El estilo se ha dejado para el final y no ha consumido la revisión.',
    ],
  },
  'ai-governance-policy': {
    title: 'Escribe la política mínima de uso de agentes de tu equipo',
    steps: [
      'Enumera las herramientas que el equipo usa hoy, aprobadas o no.',
      'Clasifica los datos del proyecto en públicos, internos y sensibles, con un ejemplo de cada uno.',
      'Escribe las cuatro partes: herramientas, datos, prohibiciones y quién aprueba excepciones.',
      'Decide en qué control técnico se aplica cada prohibición.',
    ],
    rubric: [
      'La política cabe en una página y enumera las cuatro partes.',
      'Cada prohibición tiene un control automático asociado o se reconoce que no lo tiene.',
      'El valor por defecto es denegar y se puede aplicar sin preguntar a nadie.',
      'Existe un camino de aprobación con plazo razonable, no solo un muro.',
      'Las excepciones tienen dueño, motivo y fecha de caducidad.',
    ],
  },
  'team-adoption': {
    title: 'Mide una adopción antes de extenderla',
    steps: [
      'Elige una tarea concreta y frequente del equipo.',
      'Mide el estado actual: tiempo, retrabajo y tiempo de revisión.',
      'Introduce el agente solo en esa tarea durante dos semanas.',
      'Vuelve a medir lo mismo y calcula el retrabajo, no el ahorro bruto.',
    ],
    rubric: [
      'Hay una medición antes y otra después, de la misma tarea y con el mismo criterio.',
      'El cálculo incluye el tiempo de revisión y lo que hubo que rehacer.',
      'La conclusión se puede discutir con datos, no con impresiones.',
      'Está identificado el caso en el que la herramienta falló, no solo el que funcionó.',
      'La decisión de extender o no se toma con esa medición delante.',
    ],
  },
};