/**
 * Área 07 — Arquitectura de software IA.
 *
 * Cuatro competencias. El eje: dónde vive el proveedor, quién decide qué modelo y qué pasa
 * cuando algo falla.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_07: readonly Lesson[] = [
  {
    competencyId: 'provider-abstraction',
    whatIs:
      'Una interfaz propia sobre los proveedores de modelos: el dominio llama a tu contrato, no al SDK de turno. Los adaptadores traducen, y cambiar de proveedor deja de ser un proyecto.',
    problem:
      'El proveedor se llama directamente desde cada rincón del código. Cambiarlo significa tocar cincuenta archivos, y las decisiones del proveedor —formatos, límites, errores— se filtran al dominio.',
    internals: [
      'La interfaz declara lo que tu producto necesita, no todo lo que el proveedor ofrece.',
      'Cada adaptador traduce diferencias: nombres de parámetros, formato de respuesta, códigos de error.',
      'Abstraer de más también cuesta: si la interfaz oculta una capacidad necesaria, aparece una fuga.',
      'Con un solo proveedor estable, la abstracción puede ser coste sin beneficio.',
    ],
    whenToUse: [
      'Cuando hay o habrá más de un proveedor, o cuando el cambio es un riesgo real.',
      'Declarando en la interfaz solo lo que el producto usa, no el catálogo completo.',
    ],
    whenNotToUse: [
      'No abstraigas si hay un proveedor y no hay intención de cambiar: añade indirección gratis.',
      'No expongas el nombre del proveedor en la interfaz: el acoplamiento vuelve por ahí.',
    ],
    pitfalls: [
      {
        title: 'Abstracción con fuga',
        detail:
          'Si la interfaz acepta «el modelo de OpenAI», el día que cambies tendrás el acoplamiento en los llamantes.',
      },
      {
        title: 'Interfaz que oculta capacidades',
        detail:
          'Cuando el producto necesita una función que la interfaz no contempla, alguien la salta y la abstracción deja de valer.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'model-routing',
    whatIs:
      'Enrutar es elegir modelo por tarea: el pequeño y barato para lo simple, el grande para lo difícil. Funciona si la decisión se basa en algo medido, no en una intuición sobre la longitud del texto.',
    problem:
      'Todo va al modelo más caro por comodidad, o todo al más barato por ahorro. En el primer caso se paga de más; en el segundo, la calidad cae en los casos que importan y nadie lo mide.',
    internals: [
      'Las tareas simples existen: clasificar, extraer un campo, resumir dos líneas. No necesitan el modelo mayor.',
      'La longitud del prompt es un mal indicador de dificultad: un texto largo puede ser trivial y uno corto, ambiguo.',
      'Cada ruta necesita su propia medición: el promedio global esconde que la ruta barata falla en un tipo concreto.',
      'Si la ruta barata falla, el sistema escala al modelo mayor y lo registra: la degradación se mide, no se supone.',
    ],
    whenToUse: [
      'Cuando hay mezcla de tareas simples y complejas y el volumen lo justifica.',
      'Con medición de calidad por ruta, no solo de coste.',
    ],
    whenNotToUse: [
      'No enrutes sin medir la calidad de cada ruta: optimizas el coste a costa de la corrección.',
      'No uses la longitud del prompt como criterio de dificultad.',
    ],
    pitfalls: [
      {
        title: 'Enrutar por longitud',
        detail:
          'Un mensaje corto puede ser el más difícil de todos. La longitud mide tamaño, no ambigüedad.',
      },
      {
        title: 'Medir solo el coste agregado',
        detail:
          'El ahorro total puede esconder una ruta que empeoró la calidad en un caso importante.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'orchestration-patterns',
    whatIs:
      'Orquestar es decidir cómo se encadenan las llamadas: un pipeline fijo, un abanico en paralelo o un bucle con herramientas. El patrón correcto es el más simple que resuelve el problema.',
    problem:
      'Se elige el patrón más avanzado —agente autónomo, varios agentes— para un flujo que era una secuencia conocida. Cada capa añade modos de fallo y hace el sistema más difícil de explicar.',
    internals: [
      'Si el orden de los pasos es conocido, el pipeline determinista es más barato y verificable.',
      'El abanico en paralelo sirve para subtareas independientes; en serie no gana nada.',
      'Un agente solo se justifica cuando el siguiente paso depende de lo que devolvió el anterior de forma imprevisible.',
      'Cada patrón añade modos de fallo: más piezas, más formas de romperse y más difícil de depurar.',
    ],
    whenToUse: [
      'Empieza por el pipeline: si el flujo es fijo, ya está resuelto.',
      'Sube a agente solo cuando la decisión del siguiente paso no se puede prever.',
    ],
    whenNotToUse: [
      'No uses un agente para un flujo fijo: pagas flexibilidad que no necesitas.',
      'No repartas en varios agentes una tarea secuencial.',
    ],
    pitfalls: [
      {
        title: 'Agente donde bastaba un pipeline',
        detail:
          'Un flujo de tres pasos conocidos no necesita decidir nada. El agente añade coste, latencia e imprevisibilidad.',
      },
      {
        title: 'Complejidad sin capacidad de diagnóstico',
        detail:
          'Con varias capas, saber por qué salió mal exige trazas. Sin ellas, el sistema se vuelve un oráculo.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'resilience-fallback',
    whatIs:
      'Resiliencia es qué hace el sistema cuando el proveedor falla o tarda: cuánto espera, qué reintenta, a qué alternativa cae y cómo avisa de que la calidad ha bajado.',
    problem:
      'Se reintenta todo sin espera y sin límite, lo que amplifica la caída del proveedor. O se cae a un modelo alternativo en silencio, y el usuario recibe una respuesta peor sin saberlo.',
    internals: [
      'Un timeout explícito convierte una espera indefinida en un error manejable.',
      'Solo se reintentan los errores transitorios: reintentar un error de validación repite el fallo.',
      'La espera entre reintentos —con crecimiento— evita martillear un servicio que ya está caído.',
      'La degradación se anuncia: si la respuesta viene de una ruta secundaria, el sistema lo dice.',
    ],
    whenToUse: [
      'Con dependencias externas: timeout, reintento acotado y ruta alternativa.',
      'Anunciando la degradación cuando la alternativa cambia la calidad.',
    ],
    whenNotToUse: [
      'No reintentes errores de validación ni de permisos: no van a mejorar.',
      'No ocultes que la respuesta viene de un modelo de respaldo.',
    ],
    pitfalls: [
      {
        title: 'Reintentar todo',
        detail:
          'Un reintento a ciegas multiplica la carga en el momento en que el proveedor está peor, y alarga el fallo.',
      },
      {
        title: 'Fallback silencioso',
        detail:
          'Si la calidad baja y nadie lo sabe, el equipo deja de confiar en el sistema sin entender por qué.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
];

export const ITEMS_AREA_07: readonly Item[] = [
  // ── provider-abstraction ────────────────────────────────────────────────────
  {
    id: 'pa-what-you-gain',
    competencyId: 'provider-abstraction',
    difficulty: 1,
    prompt: '¿Qué se gana con una interfaz propia sobre el proveedor del modelo?',
    options: [
      {
        id: 'a',
        text: 'Cambiar de proveedor sin tocar el dominio',
        correct: true,
        rationale:
          'Correcto: el dominio depende de tu contrato, y el cambio se resuelve escribiendo otro adaptador.',
      },
      {
        id: 'b',
        text: 'Que el modelo responda más rápido',
        correct: false,
        rationale:
          'Una capa de abstracción no acelera el modelo. Añade código entre el dominio y el proveedor.',
      },
      {
        id: 'c',
        text: 'Que el coste por token sea menor',
        correct: false,
        rationale:
          'La tarifa la pone el proveedor. La abstracción no cambia el precio.',
      },
    ],
    explanation:
      'La abstracción aísla una decisión volátil: quién provee el modelo. El dominio habla tu contrato y los detalles del proveedor quedan en un adaptador sustituible.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pa-over-abstraction',
    competencyId: 'provider-abstraction',
    difficulty: 2,
    prompt: '¿Qué riesgo tiene abstraer de más sobre el proveedor?',
    options: [
      {
        id: 'a',
        text: 'Ocultar capacidades que el producto necesita',
        correct: true,
        rationale:
          'Correcto: si la interfaz no contempla una función, alguien la salta y el acoplamiento vuelve.',
      },
      {
        id: 'b',
        text: 'Ninguno: abstraer siempre es bueno',
        correct: false,
        rationale:
          'Toda abstracción tiene coste: indirección, mantenimiento y la tentación de esconder lo específico.',
      },
      {
        id: 'c',
        text: 'Que el modelo consuma más tokens',
        correct: false,
        rationale:
          'Los tokens dependen de lo que envíes, no de la forma en que organizas el código.',
      },
    ],
    explanation:
      'La abstracción útil declara lo que el producto necesita. Si intenta cubrir todo lo que el proveedor ofrece, se vuelve frágil y alguien la rodea para usar una capacidad concreta.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pa-when-not',
    competencyId: 'provider-abstraction',
    difficulty: 2,
    prompt: '¿Cuándo NO merece la pena esta abstracción?',
    options: [
      {
        id: 'a',
        text: 'Con un solo proveedor estable y sin plan de cambio',
        correct: true,
        rationale:
          'Correcto: la indirección cuesta y no compra nada si no hay riesgo de cambio.',
      },
      {
        id: 'b',
        text: 'Nunca: siempre conviene abstraer',
        correct: false,
        rationale:
          'La abstracción prematura es deuda: código extra que hay que mantener sin beneficio claro.',
      },
      {
        id: 'c',
        text: 'Cuando hay más de dos modelos en uso',
        correct: false,
        rationale:
          'Justo al contrario: con varios modelos es cuando más útil resulta.',
      },
    ],
    explanation:
      'La abstracción se justifica por un riesgo real de cambio. Sin ese riesgo, añade una capa que hay que mantener y que puede filtrar los detalles del proveedor igualmente.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pa-leak',
    competencyId: 'provider-abstraction',
    difficulty: 3,
    prompt: 'La interfaz propia recibe un parámetro llamado «modelo de OpenAI». ¿Qué problema hay?',
    options: [
      {
        id: 'a',
        text: 'El acoplamiento vuelve por la interfaz',
        correct: true,
        rationale:
          'Correcto: el dominio ya depende de la marca. Cambiar de proveedor obliga a tocar a todos los que llaman.',
      },
      {
        id: 'b',
        text: 'Ninguno: es solo un nombre de parámetro',
        correct: false,
        rationale:
          'El nombre es la interfaz. Si nombra al proveedor, la abstracción deja de abstraer.',
      },
      {
        id: 'c',
        text: 'Solo afecta al estilo del código',
        correct: false,
        rationale:
          'Afecta al diseño: el día del cambio, el acoplamiento está en cada llamada, no en un adaptador.',
      },
    ],
    explanation:
      'Una abstracción se juzga por lo que deja fuera y por lo que deja pasar. Si el proveedor aparece en la firma, la fuga convierte la capa en decoración.',
    referenceId: 'ref-rules-ml',
  },

  // ── model-routing ───────────────────────────────────────────────────────────
  {
    id: 'mr-why-route',
    competencyId: 'model-routing',
    difficulty: 1,
    prompt: '¿Por qué enrutar las tareas a modelos distintos?',
    options: [
      {
        id: 'a',
        text: 'Una tarea simple no necesita el modelo caro',
        correct: true,
        rationale:
          'Correcto: clasificar o extraer un campo se resuelve con un modelo pequeño a una fracción del coste.',
      },
      {
        id: 'b',
        text: 'Para gastar más y obtener más calidad siempre',
        correct: false,
        rationale:
          'El objetivo es lo contrario: gastar lo necesario. La calidad no mejora por usar el mayor en todo.',
      },
      {
        id: 'c',
        text: 'Porque los modelos pequeños son más modernos',
        correct: false,
        rationale:
          'La novedad no es el criterio. Se elige por ajuste entre tarea, calidad y coste.',
      },
    ],
    explanation:
      'Enrutar es presupuestar con criterio: cada tarea va al modelo que la resuelve bien al menor coste. Sin medición por ruta, es solo un ahorro que puede costar calidad.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'mr-bad-proxy',
    competencyId: 'model-routing',
    difficulty: 2,
    prompt: 'Enrutas por longitud del prompt: corto al modelo pequeño, largo al grande. ¿Qué falla?',
    options: [
      {
        id: 'a',
        text: 'Lo largo no es lo difícil: un texto corto puede ser ambiguo',
        correct: true,
        rationale:
          'Correcto: la longitud mide tamaño. La dificultad depende de la ambigüedad y del razonamiento.',
      },
      {
        id: 'b',
        text: 'Nada: a más texto, más complejidad y más coste',
        correct: false,
        rationale:
          'Un párrafo largo puede ser una transcripción trivial; una frase corta, una pregunta imposible.',
      },
      {
        id: 'c',
        text: 'Solo que gasta más tokens de los necesarios',
        correct: false,
        rationale:
          'El coste es la consecuencia menor. El problema real es mandar lo difícil al modelo pequeño.',
      },
    ],
    explanation:
      'Un criterio de enrutado tiene que correlacionar con la dificultad real. La longitud no lo hace, y el fallo aparece justo en los casos difíciles, que además son los caros de equivocar.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'mr-measure-routes',
    competencyId: 'model-routing',
    difficulty: 2,
    prompt: '¿Cómo compruebas que la ruta barata sirve?',
    options: [
      {
        id: 'a',
        text: 'Midiendo la calidad de esa ruta, no el total',
        correct: true,
        rationale:
          'Correcto: el promedio global esconde la ruta. Cada ruta necesita su propio conjunto y su medición.',
      },
      {
        id: 'b',
        text: 'Mirando el coste total del sistema',
        correct: false,
        rationale:
          'El coste dice cuánto gastas, no si aciertas. Puedes ahorrar mucho fallando en silencio.',
      },
      {
        id: 'c',
        text: 'Preguntando al equipo si le parece bien',
        correct: false,
        rationale:
          'La impresión no distingue dos rutas con calidad parecida. La medición sí.',
      },
    ],
    explanation:
      'Un enrutado es una hipótesis: «este modelo resuelve este tipo de tarea». Se valida con casos por ruta, porque el agregado oculta exactamente el fallo que importa.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'mr-escalation',
    competencyId: 'model-routing',
    difficulty: 3,
    prompt: 'La ruta barata falla. ¿Qué debe hacer el sistema?',
    options: [
      {
        id: 'a',
        text: 'Escalar al modelo mayor y registrar el caso',
        correct: true,
        rationale:
          'Correcto: el usuario recibe una respuesta buena y el equipo sabe qué tareas necesitan más capacidad.',
      },
      {
        id: 'b',
        text: 'Devolver el error de la ruta barata',
        correct: false,
        rationale:
          'El fallo de la ruta barata no es un fallo del sistema: hay una alternativa disponible.',
      },
      {
        id: 'c',
        text: 'Reintentar en la misma ruta varias veces',
        correct: false,
        rationale:
          'Si falla por capacidad, repetir con el mismo modelo da el mismo resultado con más coste.',
      },
    ],
    explanation:
      'El escalado convierte el enrutado en algo seguro: se ahorra en lo que funciona y se paga cuando hace falta. Registrar el caso es lo que permite ajustar la política con datos.',
    referenceId: 'ref-rules-ml',
  },

  // ── orchestration-patterns ──────────────────────────────────────────────────
  {
    id: 'or-fixed-flow',
    competencyId: 'orchestration-patterns',
    difficulty: 1,
    prompt: 'Tienes un flujo fijo de tres pasos conocidos. ¿Qué patrón usas?',
    options: [
      {
        id: 'a',
        text: 'Un pipeline determinista',
        correct: true,
        rationale:
          'Correcto: si el orden se conoce, la secuencia explícita es más barata, rápida y comprobable.',
      },
      {
        id: 'b',
        text: 'Un agente autónomo con herramientas',
        correct: false,
        rationale:
          'Pagarías por decidir un orden que ya sabes. Añades coste e imprevisibilidad sin ganar nada.',
      },
      {
        id: 'c',
        text: 'Varios agentes coordinados',
        correct: false,
        rationale:
          'Es el patrón más caro para el problema más simple. La coordinación cuesta más que el trabajo.',
      },
    ],
    explanation:
      'El orden conocido no se decide: se ejecuta. Un agente se justifica cuando el siguiente paso depende de un resultado imprevisible, no cuando el guion ya está escrito.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'or-when-agent',
    competencyId: 'orchestration-patterns',
    difficulty: 2,
    prompt: '¿Cuándo hace falta de verdad un agente con herramientas?',
    options: [
      {
        id: 'a',
        text: 'Cuando el siguiente paso depende del resultado',
        correct: true,
        rationale:
          'Correcto: la decisión no se puede escribir de antemano. Ahí el bucle aporta algo que el pipeline no tiene.',
      },
      {
        id: 'b',
        text: 'Cuando el texto de entrada es muy largo',
        correct: false,
        rationale:
          'La longitud no exige decidir pasos. Un pipeline con buen troceado resuelve lo mismo.',
      },
      {
        id: 'c',
        text: 'Cuando el proyecto quiere parecer avanzado',
        correct: false,
        rationale:
          'La apariencia no es un requisito técnico. La complejidad se paga en latencia, coste y depuración.',
      },
    ],
    explanation:
      'La autonomía tiene sentido cuando el camino no está escrito: hay que mirar el resultado y decidir. Si el camino está escrito, la autonomía es coste disfrazado de capacidad.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'or-fan-out',
    competencyId: 'orchestration-patterns',
    difficulty: 2,
    prompt: 'Cinco subtareas independientes entre sí. ¿Qué patrón encaja?',
    options: [
      {
        id: 'a',
        text: 'Ejecutarlas en paralelo y combinar resultados',
        correct: true,
        rationale:
          'Correcto: la independencia permite solaparlas y el tiempo total baja al de la más lenta.',
      },
      {
        id: 'b',
        text: 'Ejecutarlas en serie, una detrás de otra',
        correct: false,
        rationale:
          'Es correcto y desperdicia la independencia: pagas cinco veces el tiempo de espera.',
      },
      {
        id: 'c',
        text: 'Un agente que las vaya decidiendo',
        correct: false,
        rationale:
          'No hay nada que decidir: las cinco son necesarias. El agente añade coste de decisión inútil.',
      },
    ],
    explanation:
      'Cuando las subtareas no dependen entre sí, el paralelismo es gratis en calidad y ahorra tiempo. Un agente no aporta aquí: no hay decisión sobre qué hacer ni en qué orden.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'or-complexity-cost',
    competencyId: 'orchestration-patterns',
    difficulty: 3,
    prompt: 'Cada patrón de orquestación añade, sobre todo...',
    options: [
      {
        id: 'a',
        text: 'Modos de fallo que hay que poder explicar',
        correct: true,
        rationale:
          'Correcto: más piezas, más formas de romperse y más difícil saber por qué salió mal.',
      },
      {
        id: 'b',
        text: 'Velocidad de ejecución del sistema',
        correct: false,
        rationale:
          'La complejidad no acelera: añade capas, latencia y coordinación.',
      },
      {
        id: 'c',
        text: 'Ahorro de tokens en todas las llamadas',
        correct: false,
        rationale:
          'Cada patrón añade llamadas. El ahorro, si aparece, viene de otra parte.',
      },
    ],
    explanation:
      'La complejidad se paga en diagnóstico. Un sistema con varias capas necesita trazas para explicar un resultado, y sin ellas se convierte en algo que nadie sabe depurar.',
    referenceId: 'ref-rules-ml',
  },

  // ── resilience-fallback ─────────────────────────────────────────────────────
  {
    id: 'rf-which-errors',
    competencyId: 'resilience-fallback',
    difficulty: 1,
    prompt: '¿Qué errores conviene reintentar?',
    options: [
      {
        id: 'a',
        text: 'Los transitorios: tiempo agotado, servicio ocupado',
        correct: true,
        rationale:
          'Correcto: son fallos que pueden desaparecer solos. Reintentar es razonable y acotado.',
      },
      {
        id: 'b',
        text: 'Todos: siempre puede funcionar a la segunda',
        correct: false,
        rationale:
          'Un error de validación o de permisos falla igual cinco veces, y multiplica la carga.',
      },
      {
        id: 'c',
        text: 'Ninguno: es mejor fallar rápido',
        correct: false,
        rationale:
          'Los fallos transitorios son la mayoría en servicios externos. Renunciar a reintentar empeora la fiabilidad.',
      },
    ],
    explanation:
      'Reintentar tiene sentido cuando el fallo es de disponibilidad, no de corrección. Distinguir los dos tipos evita martillear un servicio y evita repetir errores deterministas.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rf-backoff',
    competencyId: 'resilience-fallback',
    difficulty: 2,
    prompt: 'Reintentas de inmediato y sin espera. ¿Qué problema causas?',
    options: [
      {
        id: 'a',
        text: 'Amplificas la caída del proveedor',
        correct: true,
        rationale:
          'Correcto: todos los clientes reintentan a la vez y el servicio caído recibe más carga justo cuando peor está.',
      },
      {
        id: 'b',
        text: 'Ninguno: cuanto antes se reintente, antes se recupera',
        correct: false,
        rationale:
          'Sin espera, los reintentos compiten con la recuperación. El servicio no puede despegar.',
      },
      {
        id: 'c',
        text: 'Solo gastas más tokens',
        correct: false,
        rationale:
          'Si la llamada falla antes de generar, no hay tokens. El problema es de carga, no de coste.',
      },
    ],
    explanation:
      'La espera creciente reparte los reintentos en el tiempo y deja respirar al servicio. Reintentar en bucle apretado convierte un bache en una caída larga.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rf-degradation-notice',
    competencyId: 'resilience-fallback',
    difficulty: 2,
    prompt: 'Caes a un modelo alternativo que responde peor. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Indicarlo: el usuario debe saberlo',
        correct: true,
        rationale:
          'Correcto: la degradación silenciosa destruye la confianza. El sistema funciona distinto y se dice.',
      },
      {
        id: 'b',
        text: 'Nada: lo importante es responder algo',
        correct: false,
        rationale:
          'Responder peor sin avisar hace que el usuario atribuya el fallo al sistema, sin saber por qué.',
      },
      {
        id: 'c',
        text: 'Ocultarlo para no preocupar al usuario',
        correct: false,
        rationale:
          'Ocultar información relevante sobre la calidad es decidir por el usuario sin decírselo.',
      },
    ],
    explanation:
      'La degradación controlada es legítima si se comunica. Sin aviso, el equipo pierde la señal de que el sistema está en modo secundario y las decisiones se toman con datos peores.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rf-timeout',
    competencyId: 'resilience-fallback',
    difficulty: 3,
    prompt: '¿Por qué hace falta un timeout explícito en cada llamada al modelo?',
    options: [
      {
        id: 'a',
        text: 'Sin él, la espera puede ser indefinida',
        correct: true,
        rationale:
          'Correcto: una petición colgada sin límite bloquea recursos y al usuario sin dar error.',
      },
      {
        id: 'b',
        text: 'Para ahorrar tokens en las respuestas lentas',
        correct: false,
        rationale:
          'El timeout corta la espera, no los tokens ya generados. El ahorro no es el objetivo.',
      },
      {
        id: 'c',
        text: 'Porque el proveedor lo exige en su contrato',
        correct: false,
        rationale:
          'Es una decisión de diseño del cliente. El proveedor no te obliga a ponerlo.',
      },
    ],
    explanation:
      'Un timeout convierte «no sé qué pasa» en un error manejable: se reintenta, se degrada o se avisa. Sin él, el fallo se manifiesta como una pantalla que nunca termina de cargar.',
    referenceId: 'ref-rules-ml',
  },
];
