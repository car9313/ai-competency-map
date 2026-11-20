/**
 * Área 05 — Ingeniería agéntica.
 *
 * Seis competencias nuevas. El eje del área: un agente es un bucle con herramientas, y todo
 * lo que lo hace usable son los límites que le pones alrededor.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_05: readonly Lesson[] = [
  {
    competencyId: 'bounded-agent-loop',
    whatIs:
      'Un agente es un bucle: piensa, actúa con una herramienta, observa el resultado y repite. Lo que lo hace viable en producción no es el bucle, son sus límites: cuántos pasos, cuánto puede gastar y cuándo se detiene.',
    problem:
      'Se monta el bucle y se deja abierto. El agente itera sin tope, repite la misma acción cuando se atasca, y el coste y la duración dejan de ser predecibles. Un bucle sin límite no es autonomía: es una factura sin techo.',
    internals: [
      'El límite de pasos acota el tiempo y la factura; sin él, una tarea imposible se convierte en un bucle infinito.',
      'El coste no crece solo con los pasos: pocos pasos con contextos enormes agotan el presupuesto igual.',
      'El estancamiento es distinto del fallo: el agente repite la misma acción y espera otro resultado.',
      'La condición de parada por éxito tiene que estar escrita: «cuando el fichero compile» se puede comprobar; «cuando esté bien» no.',
    ],
    whenToUse: [
      'Fija un presupuesto de pasos y de coste antes de arrancar, no después.',
      'Detecta repetición de acciones como señal de que hay que parar y devolver el control.',
    ],
    whenNotToUse: [
      'No dejes un bucle abierto en producción aunque la tarea «casi siempre» termine.',
      'No midas el límite solo en pasos si las llamadas pueden ser arbitrariamente caras.',
    ],
    pitfalls: [
      {
        title: 'Contar pasos y no coste',
        detail:
          'Diez pasos pueden costar céntimos o euros, según cuánto contexto arrastre cada uno. Los dos límites son necesarios.',
      },
      {
        title: 'No distinguir atascado de lento',
        detail:
          'Repetir la tercera vez la misma acción con el mismo resultado no es progresar. Sin detectarlo, se gasta el presupuesto en un bucle estéril.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'tool-schemas-and-selection',
    whatIs:
      'El modelo elige herramienta con lo único que ve: su nombre, su descripción y el esquema de sus argumentos. No ve el código. Una descripción ambigua es una elección mal informada, y dos herramientas parecidas son una elección al azar.',
    problem:
      'Se exponen treinta herramientas «por si acaso» y varias se solapan. El modelo acierta a veces, y cuando falla nadie sabe si el problema era el modelo o el catálogo.',
    internals: [
      'La descripción es la interfaz para el modelo: debe decir qué hace y cuándo no usarla.',
      'El solape es la causa más común de elección equivocada: dos herramientas que resuelven lo mismo compiten en la misma decisión.',
      'Más herramientas no es más capacidad: es más superficie de confusión en cada paso.',
      'El esquema de argumentos limita los errores de forma antes de que ocurran.',
    ],
    whenToUse: [
      'Expón solo las herramientas que la tarea necesita en ese momento.',
      'Escribe descripciones que incluyan el caso contrario: cuándo no usar esa herramienta.',
    ],
    whenNotToUse: [
      'No expongas treinta herramientas si cinco cubren el trabajo.',
      'No describas la implementación interna si no cambia la decisión del modelo.',
    ],
    pitfalls: [
      {
        title: 'Herramientas solapadas',
        detail:
          'Dos formas de hacer lo mismo obligan al modelo a elegir sin criterio. Si una absorbe a la otra, se retira.',
      },
      {
        title: 'Descripción que repite el nombre',
        detail:
          '«Busca cosas» no informa de nada. La descripción útil dice qué devuelve y para qué caso es la correcta.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'agent-memory',
    whatIs:
      'Hay tres memorias distintas y se confunden: la de trabajo —el contexto de la llamada—, la de corto plazo —un resumen de lo ocurrido— y la de largo plazo —un almacén externo que se consulta por relevancia. El historial no es memoria persistente.',
    problem:
      'Se llama memoria al historial, que se pierde al cerrar y crece sin control mientras la sesión dura. O se persiste todo sin criterio, y el almacén acaba devolviendo información vieja que contamina decisiones nuevas.',
    internals: [
      'El contexto es memoria de trabajo: existe mientras dura la llamada y desaparece al terminar.',
      'El resumen comprime lo ocurrido y conserva decisiones, no transcripciones.',
      'El almacén externo se consulta por relevancia; meterlo entero en el contexto es volver al problema del presupuesto.',
      'Olvidar es parte del diseño: una preferencia de hace un año puede ser hoy un error.',
    ],
    whenToUse: [
      'Persiste decisiones, restricciones y estado de la tarea: lo que cambia lo que harás mañana.',
      'Recupera del almacén solo lo relevante para la consulta actual.',
    ],
    whenNotToUse: [
      'No persistas transcripciones completas esperando que el modelo las use bien.',
      'No cargues todo el almacén en cada llamada.',
    ],
    pitfalls: [
      {
        title: 'Guardar sin política de olvido',
        detail:
          'Sin caducidad, lo guardado envejece y compite con lo actual. La memoria se convierte en ruido con autoridad.',
      },
      {
        title: 'Datos personales en la memoria',
        detail:
          'Una memoria persistente es un almacén de datos. Si guarda datos personales, necesita la misma política que cualquier otro.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'multi-agent-delegation',
    whatIs:
      'Delegar es que un agente encargue parte del trabajo a otro, con su propio contexto y su propio bucle. Cada delegación es una llamada más: cuesta, tarda y devuelve un informe que hay que verificar.',
    problem:
      'Se usa multiagente para parecer avanzado. El coste se multiplica, el coordinador recibe resúmenes de los que no puede fiarse, y nadie puede explicar por qué el resultado final es el que es.',
    internals: [
      'Cada agente tiene su contexto: lo que no se le pasa, no lo sabe; lo que se le pasa, lo paga.',
      'El resultado de una delegación vuelve como texto. Es un informe, no un hecho comprobado.',
      'La delegación tiene sentido cuando las subtareas son independientes y su resultado se puede verificar.',
      'El coordinador necesita trazabilidad: qué delegó, qué recibió y en qué se basó para aceptar.',
    ],
    whenToUse: [
      'Cuando hay subtareas independientes y existe una forma objetiva de comprobar el resultado.',
      'Cuando un contexto separado aporta foco, no cuando solo reparte trabajo secuencial.',
    ],
    whenNotToUse: [
      'No uses varios agentes para una tarea secuencial que un agente resuelve.',
      'No delegues si no puedes verificar lo que vuelve.',
    ],
    pitfalls: [
      {
        title: 'Delegar sin contrato',
        detail:
          'Sin entrada, salida y criterio de éxito definidos, el subagente devuelve algo plausible y el coordinador no sabe si sirve.',
      },
      {
        title: 'Creer el informe sin comprobarlo',
        detail:
          '«Terminado» es una afirmación, no una prueba. El coordinador verifica o el sistema no tiene garantías.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'mcp-protocol',
    whatIs:
      'Un protocolo como MCP estandariza cómo un modelo accede a herramientas y datos: un servidor declara lo que ofrece y un cliente lo conecta. Sustituye el pegamento a medida por una interfaz común, pero no añade seguridad por sí mismo.',
    problem:
      'Cada integración se hace con código propio, difícil de reutilizar y de auditar. Y al estandarizar, se conectan servidores de terceros asumiendo que el protocolo ya resuelve los permisos.',
    internals: [
      'El servidor declara sus capacidades: herramientas, recursos y lo que expone de cada uno.',
      'El cliente conecta esas capacidades al modelo, igual que conectaría herramientas locales.',
      'El protocolo normaliza el transporte y el descubrimiento; los permisos siguen siendo una decisión de quien conecta.',
      'Un servidor de terceros es código de terceros: expone lo que decide exponer y con el alcance que decide.',
    ],
    whenToUse: [
      'Para reutilizar conectores entre agentes en lugar de reescribir el pegamento.',
      'Revisando siempre qué herramientas expone el servidor y con qué permisos.',
    ],
    whenNotToUse: [
      'No asumas que conectar por protocolo estándar implica seguridad.',
      'No expongas todo tu sistema por comodidad: el mínimo privilegio sigue aplicando.',
    ],
    pitfalls: [
      {
        title: 'Confundir estándar con seguro',
        detail:
          'El protocolo define cómo se habla, no qué se permite. La autorización y el aislamiento se configuran aparte.',
      },
      {
        title: 'Conectar servidores sin revisar',
        detail:
          'Un servidor puede exponer más de lo que esperas. Se revisa lo que declara antes de darle acceso.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'agent-skills',
    whatIs:
      'Una habilidad empaqueta instrucciones, herramientas y recursos para una tarea concreta, y el agente la carga cuando la tarea lo pide. Es carga bajo demanda: el contexto se llena con lo que se usa, no con todo lo disponible.',
    problem:
      'Se mete todo en el prompt de sistema siempre, y el contexto se gasta en capacidades que no se usan. O se crean habilidades que se contradicen entre sí y el resultado depende de cuál se cargue.',
    internals: [
      'La descripción de la habilidad es lo que el agente lee para decidir si la carga: si es vaga, no la elegirá bien.',
      'Cargar bajo demanda ahorra contexto, pero exige que el agente sepa que la habilidad existe.',
      'Dos habilidades con instrucciones contrarias producen resultados distintos según el orden de carga.',
      'Para dos capacidades simples, empaquetarlas añade una indirección que no aporta nada.',
    ],
    whenToUse: [
      'Cuando hay muchas capacidades y no caben todas en el contexto a la vez.',
      'Cuando una capacidad tiene instrucciones largas que solo aplican a algunas tareas.',
    ],
    whenNotToUse: [
      'No crees habilidades para dos capacidades simples: un prompt claro basta.',
      'No dejes dos habilidades con instrucciones contradictorias sin resolver cuál manda.',
    ],
    pitfalls: [
      {
        title: 'Descripción vaga',
        detail:
          'Si la descripción no dice cuándo aplica, el agente no la carga cuando toca y la carga cuando no toca.',
      },
      {
        title: 'Habilidades que se contradicen',
        detail:
          'Dos reglas opuestas en habilidades distintas hacen que el comportamiento dependa de cuál se cargue primero.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
];

export const ITEMS_AREA_05: readonly Item[] = [
  // ── bounded-agent-loop ──────────────────────────────────────────────────────
  {
    id: 'al-why-limit-steps',
    competencyId: 'bounded-agent-loop',
    difficulty: 1,
    prompt: '¿Por qué hay que limitar el número de pasos de un agente?',
    options: [
      {
        id: 'a',
        text: 'Sin tope, coste y tiempo son impredecibles',
        correct: true,
        rationale:
          'Correcto: una tarea imposible se convierte en un bucle sin fin con factura sin techo.',
      },
      {
        id: 'b',
        text: 'Para que el agente piense con más cuidado',
        correct: false,
        rationale:
          'El límite no mejora el razonamiento. Acota el daño cuando la tarea no avanza.',
      },
      {
        id: 'c',
        text: 'Porque el proveedor cobra por minuto de ejecución',
        correct: false,
        rationale:
          'Se cobra por token, no por tiempo. El límite protege del bucle, no de una tarifa por minuto.',
      },
    ],
    explanation:
      'El bucle es la fuente de la autonomía y también de la incertidumbre. Un presupuesto de pasos convierte una ejecución impredecible en una acotada, y permite fallar rápido.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'al-stop-condition',
    competencyId: 'bounded-agent-loop',
    difficulty: 2,
    prompt: '¿Qué necesita el bucle para poder terminar bien, no solo por agotamiento?',
    options: [
      {
        id: 'a',
        text: 'Una condición de éxito que se pueda comprobar',
        correct: true,
        rationale:
          'Correcto: «el fichero compila» se verifica; «está bien» no. Sin criterio, solo queda el límite.',
      },
      {
        id: 'b',
        text: 'Que el modelo diga que ha terminado',
        correct: false,
        rationale:
          'Es una afirmación del modelo, no una comprobación. Puede decir que terminó sin haberlo hecho.',
      },
      {
        id: 'c',
        text: 'Un temporizador de diez minutos',
        correct: false,
        rationale:
          'Es otro límite, no una condición de éxito. Corta por tiempo aunque la tarea esté a medias.',
      },
    ],
    explanation:
      'Terminar por éxito requiere un criterio verificable fuera del modelo. Sin él, el bucle solo sabe parar por agotamiento, que es lo mismo que fallar tarde y caro.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'al-stall-detection',
    competencyId: 'bounded-agent-loop',
    difficulty: 2,
    prompt: 'El agente repite la misma acción por quinta vez. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Detectar el estancamiento y parar',
        correct: true,
        rationale:
          'Correcto: repetir la misma acción con el mismo resultado no es progresar. Hay que devolver el control.',
      },
      {
        id: 'b',
        text: 'Subir el límite de pasos para que lo consiga',
        correct: false,
        rationale:
          'Más pasos con la misma estrategia dan más repeticiones. El problema no es el presupuesto.',
      },
      {
        id: 'c',
        text: 'Cambiar de modelo y reintentar',
        correct: false,
        rationale:
          'Puede ayudar, pero antes hay que reconocer el patrón. Sin detección, el cambio se repite igual.',
      },
    ],
    explanation:
      'El estancamiento es una señal distinta del fallo: el agente cree que está avanzando. Detectar la repetición y parar es lo que evita quemar el presupuesto en un bucle estéril.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'al-steps-vs-cost',
    competencyId: 'bounded-agent-loop',
    difficulty: 3,
    prompt: 'Limitas los pasos pero no el coste. ¿Qué riesgo queda abierto?',
    options: [
      {
        id: 'a',
        text: 'Pocos pasos muy caros agotan el presupuesto',
        correct: true,
        rationale:
          'Correcto: cada paso puede arrastrar un contexto enorme. El número de pasos no acota el gasto.',
      },
      {
        id: 'b',
        text: 'Ninguno: los pasos son el coste real',
        correct: false,
        rationale:
          'Los pasos son la unidad de tiempo, no de gasto. Diez pasos pueden costar céntimos o euros.',
      },
      {
        id: 'c',
        text: 'Solo que tarde más de lo previsto',
        correct: false,
        rationale:
          'La tardanza es el menor de los problemas. El gasto puede desbordarse sin cambiar el tiempo.',
      },
    ],
    explanation:
      'Los dos límites miden cosas distintas: pasos acotan duración, coste acota factura. Un bucle con pocos pasos y contextos gigantes puede ser caro y además lento.',
    referenceId: 'ref-rules-ml',
  },

  // ── tool-schemas-and-selection ──────────────────────────────────────────────
  {
    id: 'ts-what-model-sees',
    competencyId: 'tool-schemas-and-selection',
    difficulty: 1,
    prompt: '¿Con qué información decide el modelo qué herramienta usar?',
    options: [
      {
        id: 'a',
        text: 'Con el nombre, la descripción y el esquema',
        correct: true,
        rationale:
          'Correcto: el modelo no ve el código. Su decisión se apoya en el texto que declara la herramienta.',
      },
      {
        id: 'b',
        text: 'Con el código de implementación de la herramienta',
        correct: false,
        rationale:
          'El modelo no lee el código. Solo ve la declaración que le envías.',
      },
      {
        id: 'c',
        text: 'Con el historial completo de las llamadas',
        correct: false,
        rationale:
          'El historial puede ayudar, pero la decisión se basa en la declaración y en la tarea actual.',
      },
    ],
    explanation:
      'La descripción es la interfaz del modelo con la herramienta. Escribirla mal es como ponerle a una función un nombre equivocado: el fallo aparece en la elección, no en la ejecución.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ts-overlapping-tools',
    competencyId: 'tool-schemas-and-selection',
    difficulty: 2,
    prompt: 'Tienes dos herramientas que hacen casi lo mismo. ¿Qué efecto tiene?',
    options: [
      {
        id: 'a',
        text: 'El modelo elige mal entre ellas sin criterio',
        correct: true,
        rationale:
          'Correcto: si ambas sirven, no hay señal para distinguirlas. La elección se vuelve arbitraria.',
      },
      {
        id: 'b',
        text: 'Ninguno: tener alternativas es bueno',
        correct: false,
        rationale:
          'Alternativas equivalentes no son riqueza, son ambigüedad. El modelo no tiene por qué saber cuál prefieres.',
      },
      {
        id: 'c',
        text: 'El sistema va más rápido al tener más opciones',
        correct: false,
        rationale:
          'Más opciones cuestan más contexto y más confusión. La velocidad no mejora.',
      },
    ],
    explanation:
      'El solape es la causa más común de elección equivocada. Si dos herramientas compiten, se fusionan o se retira una: el catálogo es parte del diseño, no un cajón.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ts-too-many-tools',
    competencyId: 'tool-schemas-and-selection',
    difficulty: 2,
    prompt: 'Expones treinta herramientas y se usan cinco. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Exponer solo las que la tarea necesita',
        correct: true,
        rationale:
          'Correcto: menos opciones es menos confusión y menos contexto gastado en declaraciones.',
      },
      {
        id: 'b',
        text: 'Dejarlas todas, por si hacen falta',
        correct: false,
        rationale:
          'El «por si acaso» se paga en cada paso: ocupa contexto y aumenta la probabilidad de elegir mal.',
      },
      {
        id: 'c',
        text: 'Numerarlas para que el modelo las distinga',
        correct: false,
        rationale:
          'Numerar no aclara la función. La confusión viene del solape, no de la falta de etiquetas.',
      },
    ],
    explanation:
      'El catálogo de herramientas es superficie de decisión. Cada herramienta innecesaria añade una opción equivocada posible y consume contexto en todas las llamadas.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'ts-description-content',
    competencyId: 'tool-schemas-and-selection',
    difficulty: 3,
    prompt: '¿Qué debe decir la descripción de una herramienta?',
    options: [
      {
        id: 'a',
        text: 'Qué hace y cuándo no usarla',
        correct: true,
        rationale:
          'Correcto: el caso contrario es lo que evita la elección equivocada cuando hay herramientas parecidas.',
      },
      {
        id: 'b',
        text: 'Cómo está implementada por dentro',
        correct: false,
        rationale:
          'Los detalles internos no cambian la decisión del modelo y gastan contexto.',
      },
      {
        id: 'c',
        text: 'Quién la escribió y cuándo',
        correct: false,
        rationale:
          'Es metadato para humanos. Al modelo no le ayuda a decidir si esa herramienta es la correcta.',
      },
    ],
    explanation:
      'Una descripción útil responde a la pregunta del modelo: ¿es esta la herramienta para esto? Decir también cuándo no aplica es lo que la distingue de las parecidas.',
    referenceId: 'ref-anthropic-system',
  },

  // ── agent-memory ────────────────────────────────────────────────────────────
  {
    id: 'am-history-is-not-memory',
    competencyId: 'agent-memory',
    difficulty: 1,
    prompt: '¿El historial de la conversación es memoria persistente?',
    options: [
      {
        id: 'a',
        text: 'No: vive en el contexto de esa llamada',
        correct: true,
        rationale:
          'Correcto: es memoria de trabajo. Al cerrar la llamada, desaparece salvo que se guarde aparte.',
      },
      {
        id: 'b',
        text: 'Sí: se conserva entre sesiones',
        correct: false,
        rationale:
          'El historial solo existe si alguien lo reenvía. Sin almacén, no hay persistencia.',
      },
      {
        id: 'c',
        text: 'Solo si la conversación es muy larga',
        correct: false,
        rationale:
          'La duración no crea persistencia. Larga o corta, se pierde al terminar.',
      },
    ],
    explanation:
      'Confundir historial con memoria es el error de partida. El contexto es de trabajo; la persistencia exige un almacén explícito con su propia política de qué guardar y qué olvidar.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'am-what-to-persist',
    competencyId: 'agent-memory',
    difficulty: 2,
    prompt: '¿Qué merece guardarse entre sesiones?',
    options: [
      {
        id: 'a',
        text: 'Decisiones, restricciones y estado de la tarea',
        correct: true,
        rationale:
          'Correcto: es lo que cambia lo que harás mañana. La transcripción completa no aporta lo mismo.',
      },
      {
        id: 'b',
        text: 'La transcripción completa de cada conversación',
        correct: false,
        rationale:
          'Es mucho volumen y poco valor: lo esencial está en pocas frases y el resto ensucia la recuperación.',
      },
      {
        id: 'c',
        text: 'Nada: cada sesión debe empezar limpia',
        correct: false,
        rationale:
          'Sin memoria se repiten las mismas preguntas y se pierde el contexto del proyecto.',
      },
    ],
    explanation:
      'La memoria útil es la que evita repetir trabajo: decisiones tomadas, restricciones del proyecto y en qué punto quedó la tarea. Guardar todo lo demás encarece y distorsiona.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'am-retrieve-relevant',
    competencyId: 'agent-memory',
    difficulty: 2,
    prompt: 'El almacén de memoria tiene 10 000 notas. ¿Cómo lo usas al responder?',
    options: [
      {
        id: 'a',
        text: 'Recuperando solo lo relevante para la consulta',
        correct: true,
        rationale:
          'Correcto: la memoria se consulta, no se vuelca. Meter el almacén entero rompe el contexto.',
      },
      {
        id: 'b',
        text: 'Metiéndolo entero en el contexto de cada llamada',
        correct: false,
        rationale:
          'No cabe y, si cupiera, diluiría lo importante. El contexto tiene presupuesto.',
      },
      {
        id: 'c',
        text: 'Resumiéndolo todo antes de cada pregunta',
        correct: false,
        rationale:
          'Resumir 10 000 notas en cada llamada es caro y pierde el detalle que hace falta.',
      },
    ],
    explanation:
      'La memoria a largo plazo se comporta como un índice: se consulta por relevancia. Volcarla en el contexto es el mismo error que no tenerla, con más coste.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'am-why-forget',
    competencyId: 'agent-memory',
    difficulty: 3,
    prompt: '¿Por qué una memoria necesita política de olvido?',
    options: [
      {
        id: 'a',
        text: 'Porque lo guardado envejece y contamina',
        correct: true,
        rationale:
          'Correcto: una preferencia de hace un año puede ser hoy un error. Lo viejo compite con lo actual.',
      },
      {
        id: 'b',
        text: 'Solo por espacio de almacenamiento',
        correct: false,
        rationale:
          'El espacio es lo de menos. El problema es que la información obsoleta se lee como si fuera vigente.',
      },
      {
        id: 'c',
        text: 'Solo por protección de datos personales',
        correct: false,
        rationale:
          'Es una razón importante, pero el olvido también es necesario para que la memoria siga siendo útil.',
      },
    ],
    explanation:
      'Una memoria sin caducidad se convierte en ruido con autoridad: datos viejos con apariencia de verdad actual. Olvidar es mantenimiento, no descuido.',
    referenceId: 'ref-anthropic-system',
  },

  // ── multi-agent-delegation ──────────────────────────────────────────────────
  {
    id: 'ma-when-to-delegate',
    competencyId: 'multi-agent-delegation',
    difficulty: 1,
    prompt: '¿Cuándo tiene sentido repartir el trabajo entre varios agentes?',
    options: [
      {
        id: 'a',
        text: 'Con subtareas independientes y verificables',
        correct: true,
        rationale:
          'Correcto: la independencia permite paralelizar y la verificación permite aceptar el resultado.',
      },
      {
        id: 'b',
        text: 'Siempre: más agentes son más capacidad',
        correct: false,
        rationale:
          'Cada agente multiplica coste y coordinación. Sin independencia, el reparto estorba.',
      },
      {
        id: 'c',
        text: 'Cuando la tarea es urgente',
        correct: false,
        rationale:
          'La urgencia no es criterio de diseño. Repartir mal una tarea urgente la hace más lenta.',
      },
    ],
    explanation:
      'Delegar tiene sentido cuando las partes no dependen entre sí y el resultado se puede comprobar. En una tarea secuencial, varios agentes se pasan el turno sin ganar nada.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ma-verify-result',
    competencyId: 'multi-agent-delegation',
    difficulty: 2,
    prompt: 'El subagente informa de que terminó. ¿Qué hace el coordinador?',
    options: [
      {
        id: 'a',
        text: 'Verificar el resultado antes de aceptarlo',
        correct: true,
        rationale:
          'Correcto: el informe es una afirmación. La aceptación exige comprobar el estado real.',
      },
      {
        id: 'b',
        text: 'Confiar: el subagente trabajó en la tarea',
        correct: false,
        rationale:
          'Trabajar en la tarea no garantiza terminarla. La confianza sin verificación es donde se cuelan los falsos positivos.',
      },
      {
        id: 'c',
        text: 'Preguntarle otra vez si está seguro',
        correct: false,
        rationale:
          'Es pedirle que reafirme su propia afirmación. No añade ninguna comprobación externa.',
      },
    ],
    explanation:
      'El resultado de una delegación es texto, y el texto no es prueba. En un sistema con varias capas, la verificación en la frontera es lo que impide que un error se propague como si fuera un hecho.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ma-delegation-cost',
    competencyId: 'multi-agent-delegation',
    difficulty: 2,
    prompt: '¿Qué cuesta cada delegación a otro agente?',
    options: [
      {
        id: 'a',
        text: 'Una llamada con su propio contexto completo',
        correct: true,
        rationale:
          'Correcto: el subagente no hereda gratis el contexto; hay que dárselo, y eso se paga.',
      },
      {
        id: 'b',
        text: 'Nada: el trabajo se reparte sin coste extra',
        correct: false,
        rationale:
          'Cada delegación es una ejecución más. Repartir no abarata; suma.',
      },
      {
        id: 'c',
        text: 'Solo el texto del resultado final',
        correct: false,
        rationale:
          'El resultado es la parte visible. La ejecución completa del subagente es el coste real.',
      },
    ],
    explanation:
      'La delegación multiplica: contexto de entrada, ejecución del subagente y lectura del informe por el coordinador. Se delega cuando el reparto aporta foco o paralelismo, no por defecto.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ma-delegation-contract',
    competencyId: 'multi-agent-delegation',
    difficulty: 3,
    prompt: '¿Qué debe definir una delegación para que sea comprobable?',
    options: [
      {
        id: 'a',
        text: 'Entrada, salida y criterio de éxito',
        correct: true,
        rationale:
          'Correcto: sin las tres, el coordinador recibe algo plausible y no puede decidir si vale.',
      },
      {
        id: 'b',
        text: 'Solo el objetivo en lenguaje natural',
        correct: false,
        rationale:
          'Un objetivo sin formato de salida ni criterio deja la verificación al juicio del momento.',
      },
      {
        id: 'c',
        text: 'El modelo concreto que debe usar',
        correct: false,
        rationale:
          'Es un detalle de implementación. Lo que hace comprobable la delegación es el contrato, no la marca.',
      },
    ],
    explanation:
      'Un contrato de delegación es lo que convierte una conversación en una interfaz: qué recibe, qué devuelve y cómo se sabe si sirve. Sin él, el coordinador solo tiene una opinión.',
    referenceId: 'ref-rules-ml',
  },

  // ── mcp-protocol ────────────────────────────────────────────────────────────
  {
    id: 'mcp-what-it-solves',
    competencyId: 'mcp-protocol',
    difficulty: 1,
    prompt: '¿Qué problema resuelve un protocolo como MCP?',
    options: [
      {
        id: 'a',
        text: 'Conectar herramientas y datos de forma estándar',
        correct: true,
        rationale:
          'Correcto: sustituye pegamento a medida por una interfaz común que servidores y clientes entienden.',
      },
      {
        id: 'b',
        text: 'Hacer que el modelo razone con más pasos',
        correct: false,
        rationale:
          'El protocolo no toca el modelo. Cambia cómo se conectan los recursos, no la capacidad.',
      },
      {
        id: 'c',
        text: 'Reducir el coste por token y por llamada',
        correct: false,
        rationale:
          'El coste depende del modelo y de los tokens. El protocolo no cambia la tarifa.',
      },
    ],
    explanation:
      'Un protocolo estandariza el descubrimiento y la llamada. El beneficio es reutilización y claridad en la frontera, no inteligencia ni precio.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'mcp-third-party-review',
    competencyId: 'mcp-protocol',
    difficulty: 2,
    prompt: 'Vas a conectar un servidor de terceros. ¿Qué revisas antes?',
    options: [
      {
        id: 'a',
        text: 'Qué herramientas expone y con qué permisos',
        correct: true,
        rationale:
          'Correcto: es código de terceros. Su alcance real es lo que declara, no lo que supones.',
      },
      {
        id: 'b',
        text: 'Solo su velocidad de respuesta',
        correct: false,
        rationale:
          'La velocidad importa, pero no es el riesgo principal. El alcance sí.',
      },
      {
        id: 'c',
        text: 'El precio de la suscripción',
        correct: false,
        rationale:
          'El coste económico es visible; el alcance real de lo que expone, no.',
      },
    ],
    explanation:
      'Conectar un servidor es conceder acceso. Antes hay que saber exactamente qué ofrece y con qué alcance, igual que se revisa una dependencia antes de añadirla.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'mcp-security',
    competencyId: 'mcp-protocol',
    difficulty: 2,
    prompt: '¿Que la conexión use un protocolo estándar implica que es segura?',
    options: [
      {
        id: 'a',
        text: 'No: la autorización se configura aparte',
        correct: true,
        rationale:
          'Correcto: el protocolo dice cómo se habla, no qué se permite. Permisos y aislamiento son decisiones propias.',
      },
      {
        id: 'b',
        text: 'Sí: el estándar incluye las comprobaciones',
        correct: false,
        rationale:
          'Un protocolo de transporte no decide por ti qué herramientas puede ejecutar un agente.',
      },
      {
        id: 'c',
        text: 'Sí, si el servidor es oficial',
        correct: false,
        rationale:
          'La procedencia no sustituye el control de permisos. Un servidor oficial sigue exponiendo lo que expone.',
      },
    ],
    explanation:
      'Estandarizar el cómo no resuelve el quién y el cuánto. La seguridad sigue estando en la lista de permitidos, el aislamiento y la aprobación humana.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'mcp-expose-scope',
    competencyId: 'mcp-protocol',
    difficulty: 3,
    prompt: 'Vas a exponer tu sistema por un servidor de herramientas. ¿Qué expones?',
    options: [
      {
        id: 'a',
        text: 'Lo necesario para la tarea, con mínimo privilegio',
        correct: true,
        rationale:
          'Correcto: cada herramienta expuesta es una capacidad concedida. Se limita al alcance real de la tarea.',
      },
      {
        id: 'b',
        text: 'Todo el sistema, para que sea más útil',
        correct: false,
        rationale:
          'La utilidad no compensa el riesgo. Un catálogo enorme expone operaciones que nadie pidió.',
      },
      {
        id: 'c',
        text: 'Solo lectura, siempre, para todos los casos',
        correct: false,
        rationale:
          'Es más seguro y también insuficiente: hay tareas que necesitan escribir. El criterio es el mínimo necesario.',
      },
    ],
    explanation:
      'Exponer herramientas es conceder permisos. El principio es el mismo que en cualquier API: el mínimo privilegio que permite la tarea, revisado cuando la tarea cambia.',
    referenceId: 'ref-anthropic-system',
  },

  // ── agent-skills ────────────────────────────────────────────────────────────
  {
    id: 'sk-why-on-demand',
    competencyId: 'agent-skills',
    difficulty: 1,
    prompt: '¿Qué ventaja tiene cargar una habilidad solo cuando la tarea la pide?',
    options: [
      {
        id: 'a',
        text: 'Ahorra contexto y el agente elige',
        correct: true,
        rationale:
          'Correcto: el contexto se llena con lo que se usa. Las instrucciones largas entran solo si aplican.',
      },
      {
        id: 'b',
        text: 'Hace el modelo más barato por token',
        correct: false,
        rationale:
          'La tarifa no cambia. Lo que cambia es cuántos tokens se gastan en instrucciones.',
      },
      {
        id: 'c',
        text: 'Garantiza que el agente acierte siempre',
        correct: false,
        rationale:
          'No hay garantía. La carga bajo demanda depende de que el agente reconozca cuándo aplica.',
      },
    ],
    explanation:
      'La carga bajo demanda convierte el contexto en algo que se administra: se paga por lo que se carga y no por el catálogo entero. Exige, eso sí, descripciones que el agente sepa interpretar.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sk-how-decision',
    competencyId: 'agent-skills',
    difficulty: 2,
    prompt: '¿Con qué decide el agente que debe cargar una habilidad?',
    options: [
      {
        id: 'a',
        text: 'Con su nombre y su descripción',
        correct: true,
        rationale:
          'Correcto: es lo único que ve antes de cargarla. Si la descripción es vaga, no la reconocerá.',
      },
      {
        id: 'b',
        text: 'Con el código de las herramientas que incluye',
        correct: false,
        rationale:
          'El agente no lee el código. Decide con el texto de presentación.',
      },
      {
        id: 'c',
        text: 'Cargándolas todas y descartando después',
        correct: false,
        rationale:
          'Sería lo contrario de la carga bajo demanda: gastaría el contexto que intenta ahorrar.',
      },
    ],
    explanation:
      'La descripción de una habilidad es su puerta de entrada. Debe decir qué problema resuelve y cuándo aplica, porque el agente decide con eso y nada más.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sk-conflict',
    competencyId: 'agent-skills',
    difficulty: 2,
    prompt: 'Dos habilidades dan instrucciones contrarias. ¿Qué consecuencia tiene?',
    options: [
      {
        id: 'a',
        text: 'El resultado depende de cuál se cargue',
        correct: true,
        rationale:
          'Correcto: si ambas entran, compiten; si entra una, la otra no aplica. El comportamiento se vuelve impredecible.',
      },
      {
        id: 'b',
        text: 'Ninguna: el agente detecta el conflicto',
        correct: false,
        rationale:
          'No hay detección de contradicciones entre instrucciones. El modelo sigue la que más peso tenga.',
      },
      {
        id: 'c',
        text: 'Se fusionan en una regla intermedia',
        correct: false,
        rationale:
          'No hay fusión. Las reglas opuestas se contradicen, no se promedian.',
      },
    ],
    explanation:
      'Las habilidades son instrucciones, y dos instrucciones opuestas producen resultados distintos según cuál esté cargada. Resolver el conflicto es trabajo de diseño, no del modelo.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sk-overkill',
    competencyId: 'agent-skills',
    difficulty: 3,
    prompt: 'Tienes dos capacidades simples y estables. ¿Merece la pena empaquetarlas como habilidades?',
    options: [
      {
        id: 'a',
        text: 'No: un prompt claro resuelve eso',
        correct: true,
        rationale:
          'Correcto: empaquetar añade una capa de indirección y un modo de fallo sin aportar nada.',
      },
      {
        id: 'b',
        text: 'Sí: todas las capacidades deben ser habilidades',
        correct: false,
        rationale:
          'Convertir todo en habilidad multiplica la maquinaria para el mismo resultado.',
      },
      {
        id: 'c',
        text: 'Sí, cuanto antes se estandarice mejor',
        correct: false,
        rationale:
          'La estandarización prematura cuesta mantenimiento. Dos reglas simples caben en el prompt.',
      },
    ],
    explanation:
      'Empaquetar tiene sentido cuando hay volumen de capacidades o instrucciones largas que no aplican siempre. Para dos reglas simples, la estructura pesa más que el contenido.',
    referenceId: 'ref-anthropic-system',
  },
];
