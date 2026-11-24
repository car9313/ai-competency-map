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

  {
    competencyId: 'application-architecture',
    whatIs:
      'Cómo se reparte el código en carpetas y, sobre todo, en qué dirección apuntan las dependencias. Hay tres formas que se discuten de verdad: capas horizontales (interfaz, servicio, datos), puertos y adaptadores —también llamada hexagonal— con el dominio en el centro y la infraestructura en el borde, y slices verticales, que cortan por funcionalidad y dejan cada rebanada con lo que necesita. La pregunta que decide entre ellas es una: qué cambia junto.',
    problem:
      'Se elige la estructura por moda y no por el cambio que hay que hacer. Con capas horizontales, añadir un campo al producto toca cinco carpetas y cinco revisiones: la estructura pelea contra el cambio. Con slices verticales sin criterio, la misma regla de negocio aparece copiada en tres rebanadas y se corrige en dos. Y la hexagonal se aplica como ceremonia: una interfaz para cada cosa, sin que nunca exista una segunda implementación, así que el único beneficio es una capa más que leer.',
    internals: [
      'La pregunta que decide no es «qué arquitectura suena mejor» sino «qué ficheros tengo que abrir para cambiar este comportamiento». Si son cinco carpetas distintas, la estructura está mal para ese cambio.',
      'Las capas horizontales optimizan la reutilización técnica; los slices verticales optimizan el cambio de producto. Casi ningún producto se cambia por capas.',
      'Puertos y adaptadores protegen el dominio de la infraestructura. Se justifica cuando hay una segunda implementación real o cuando quieres probar el dominio sin red, base de datos ni proveedor.',
      'La dirección de las dependencias importa más que los nombres de las carpetas: el dominio no importa nada de fuera. Si eso se rompe, la estructura es decorativa.',
      'Con un agente, refactorizar es más barato y convertirlo en ceremonia es más probable: hay que decidir el límite y escribirlo, porque el agente completará el patrón hasta el final.',
      'Un slice es caso de uso, dominio y adaptadores propios. Lo común se extrae cuando de verdad se repite, no antes por simetría.',
    ],
    whenToUse: [
      'Cuando el producto crece y cada cambio empieza a tocar demasiados sitios.',
      'Cuando hay que sustituir una pieza de infraestructura —proveedor de modelos, base de datos— y el dominio no debería enterarse.',
    ],
    whenNotToUse: [
      'No montes puertos y adaptadores para un script de cien líneas: no hay dominio que proteger.',
      'No cortes en slices una librería que se consume por funciones sueltas: no hay producto que cambie por funcionalidad.',
    ],
    pitfalls: [
      {
        title: 'Interfaces sin segundo adaptador',
        detail:
          'Una interfaz para cada dependencia y una sola implementación de cada una. No protege de nada y añade un salto mental en cada lectura.',
      },
      {
        title: 'El slice que copia la regla',
        detail:
          'Dos rebanadas con la misma validación de negocio: se corrige en una y la otra sigue aceptando datos inválidos. Lo común hay que reconocerlo, no evitarlo.',
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

  // ── segunda tanda: hasta 8 ítems por competencia ────────────────────────────

  {
    id: 'pa-adapter-parity',
    competencyId: 'provider-abstraction',
    difficulty: 2,
    prompt: '¿Cómo compruebas que dos adaptadores de proveedor se comportan igual?',
    options: [
      {
        id: 'a',
        text: 'La misma batería de casos contra los dos',
        correct: true,
        rationale:
          'Correcto: la interfaz promete equivalencia; solo una prueba común demuestra que se cumple.',
      },
      {
        id: 'b',
        text: 'Leyendo el código de los dos adaptadores',
        correct: false,
        rationale:
          'La lectura detecta diferencias obvias, no las de comportamiento ante casos límite.',
      },
      {
        id: 'c',
        text: 'Usando solo el proveedor que parece más fiable',
        correct: false,
        rationale:
          'Deja el otro adaptador sin validar hasta el día del cambio, que es el peor momento.',
      },
    ],
    explanation:
      'Una abstracción es una promesa de equivalencia, y las promesas se comprueban. La misma batería contra ambos adaptadores es lo que permite cambiar de proveedor sin sorpresas.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pa-normalized-errors',
    competencyId: 'provider-abstraction',
    difficulty: 2,
    prompt: 'Cada proveedor devuelve errores con códigos y formatos distintos. ¿Qué conviene?',
    options: [
      {
        id: 'a',
        text: 'Normalizarlos en tu propia interfaz',
        correct: true,
        rationale:
          'Correcto: el dominio trata categorías propias —transitorio, límite, inválido— y no códigos ajenos.',
      },
      {
        id: 'b',
        text: 'Pasar el código del proveedor tal cual',
        correct: false,
        rationale:
          'Filtra el proveedor al dominio. Cada capa acabará con un `if` por marca.',
      },
      {
        id: 'c',
        text: 'Ignorar los errores y reintentar siempre',
        correct: false,
        rationale:
          'Reintentar un error de validación repite el fallo. Sin categorías no se puede decidir.',
      },
    ],
    explanation:
      'Los errores son parte de la interfaz. Normalizarlos a un vocabulario propio permite reintentar, degradar o avisar sin saber qué proveedor está detrás.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pa-interface-growth',
    competencyId: 'provider-abstraction',
    difficulty: 3,
    prompt: 'Tu interfaz gana un método nuevo cada vez que un proveedor estrena algo. ¿Qué señal es?',
    options: [
      {
        id: 'a',
        text: 'Está copiando el catálogo del proveedor',
        correct: true,
        rationale:
          'Correcto: la abstracción dejó de expresar lo que necesitas y pasó a reflejar lo que te ofrecen.',
      },
      {
        id: 'b',
        text: 'Está madurando y cubre cada vez más',
        correct: false,
        rationale:
          'Cubrir más no es madurar. Una interfaz que crece con el proveedor vuelve a acoplarte a él.',
      },
      {
        id: 'c',
        text: 'Necesitas un segundo proveedor cuanto antes',
        correct: false,
        rationale:
          'Añadir proveedores multiplica el problema. Antes hay que decidir qué necesita el producto.',
      },
    ],
    explanation:
      'La interfaz se define por lo que el producto necesita, no por lo que el proveedor ofrece. Cuando crece en espejo del proveedor, la capa informa y deja de proteger.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pa-migration-readiness',
    competencyId: 'provider-abstraction',
    difficulty: 3,
    prompt: 'Antes de cambiar de proveedor en producción, ¿qué necesitas tener?',
    options: [
      {
        id: 'a',
        text: 'La calidad del nuevo medida con tus casos',
        correct: true,
        rationale:
          'Correcto: sin medir, el cambio de proveedor es un cambio de comportamiento a ciegas.',
      },
      {
        id: 'b',
        text: 'El precio más bajo del mercado',
        correct: false,
        rationale:
          'El precio sin calidad no es una ventaja. Un proveedor barato que falla cuesta más.',
      },
      {
        id: 'c',
        text: 'El adaptador escrito y las pruebas que pasan',
        correct: false,
        rationale:
          'Es necesario y no suficiente: dice que se comporta igual en forma, no en acierto.',
      },
    ],
    explanation:
      'La abstracción resuelve el trabajo mecánico del cambio, no la decisión. Cambiar de proveedor exige comparar calidad con tus propios casos, igual que cualquier cambio de modelo.',
    referenceId: 'ref-rules-ml',
  },

  {
    id: 'mr-route-by-difficulty',
    competencyId: 'model-routing',
    difficulty: 2,
    prompt: '¿Con qué criterio conviene enrutar entre modelos?',
    options: [
      {
        id: 'a',
        text: 'Por tipo de tarea y dificultad medida',
        correct: true,
        rationale:
          'Correcto: el criterio sale de comparar resultados por tipo, no de una intuición sobre el texto.',
      },
      {
        id: 'b',
        text: 'Por la longitud del prompt recibido',
        correct: false,
        rationale:
          'La longitud mide tamaño, no dificultad. Un texto largo puede ser trivial y uno corto, ambiguo.',
      },
      {
        id: 'c',
        text: 'Por la hora a la que llega la petición',
        correct: false,
        rationale:
          'La hora no dice nada de la tarea. Enrutar así es repartir al azar con apariencia de sistema.',
      },
    ],
    explanation:
      'El enrutado es una hipótesis sobre qué modelo resuelve qué tipo de tarea. Se construye clasificando por tarea y midiendo, no por una propiedad superficial del texto.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'mr-route-tests',
    competencyId: 'model-routing',
    difficulty: 2,
    prompt: '¿Qué necesita el enrutador para no degradar la calidad sin que nadie lo note?',
    options: [
      {
        id: 'a',
        text: 'Casos de prueba por cada ruta',
        correct: true,
        rationale:
          'Correcto: el promedio global esconde la ruta que falla. Se mide por ruta, por separado.',
      },
      {
        id: 'b',
        text: 'Un modelo mayor como respaldo',
        correct: false,
        rationale:
          'El respaldo existe justo porque la ruta falla. Sin medirla, el fallo se paga en silencio.',
      },
      {
        id: 'c',
        text: 'Más rutas para repartir la carga',
        correct: false,
        rationale:
          'Más rutas multiplican los sitios donde la calidad puede caer sin que se note.',
      },
    ],
    explanation:
      'Un enrutado sin medición por ruta es un ahorro invisible que alguien paga en calidad. Cada ruta necesita sus casos, igual que el sistema completo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'mr-hidden-escalation',
    competencyId: 'model-routing',
    difficulty: 3,
    prompt: 'La ruta barata falla el 20 % y escala al modelo caro sin registrarlo. ¿Qué problema hay?',
    options: [
      {
        id: 'a',
        text: 'El coste real se paga sin que nadie lo vea',
        correct: true,
        rationale:
          'Correcto: el ahorro estimado es falso. Un quinto de las llamadas se factura al precio caro.',
      },
      {
        id: 'b',
        text: 'Ninguno: el usuario recibe buena respuesta',
        correct: false,
        rationale:
          'La respuesta es buena y la factura no. Sin registro, el sistema parece más barato de lo que es.',
      },
      {
        id: 'c',
        text: 'Que la latencia media baja demasiado',
        correct: false,
        rationale:
          'La latencia no baja por escalar. Lo que se distorsiona es el modelo de coste.',
      },
    ],
    explanation:
      'El escalado es correcto como mecanismo y engañoso como contabilidad. Si se hace, se registra: es el dato que dice si la ruta barata está sirviendo o solo disimulando.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'mr-when-routing-is-overkill',
    competencyId: 'model-routing',
    difficulty: 3,
    prompt: '¿Cuándo no compensa enrutar entre modelos?',
    options: [
      {
        id: 'a',
        text: 'Con volumen bajo y tareas homogéneas',
        correct: true,
        rationale:
          'Correcto: la complejidad del enrutador cuesta más que el ahorro en pocas llamadas iguales.',
      },
      {
        id: 'b',
        text: 'Con mucho volumen y tareas muy distintas',
        correct: false,
        rationale:
          'Es justo el caso ideal: hay mezcla que separar y volumen para que el ahorro pese.',
      },
      {
        id: 'c',
        text: 'Cuando el presupuesto ya está ajustado',
        correct: false,
        rationale:
          'Si el presupuesto aprieta, el enrutado ayuda; el problema es que añade mantenimiento.',
      },
    ],
    explanation:
      'El enrutado se amortiza con heterogeneidad y volumen. Con tareas parecidas, basta un modelo; con pocas llamadas, el ahorro no paga el sistema de rutas ni su medición.',
    referenceId: 'ref-rules-ml',
  },

  {
    id: 'or-idempotent-steps',
    competencyId: 'orchestration-patterns',
    difficulty: 2,
    prompt: 'Un pipeline puede reintentar pasos. ¿Qué necesita cada paso?',
    options: [
      {
        id: 'a',
        text: 'Ser idempotente o registrar su efecto',
        correct: true,
        rationale:
          'Correcto: sin eso, el reintento repite el efecto y el fallo se convierte en duplicado.',
      },
      {
        id: 'b',
        text: 'Ejecutarse con el modelo más rápido',
        correct: false,
        rationale:
          'La velocidad no evita el duplicado. El problema es de efectos, no de latencia.',
      },
      {
        id: 'c',
        text: 'Tener un timeout más largo que los demás',
        correct: false,
        rationale:
          'Alarga la espera y no resuelve el reintento. El efecto se repetiría igual.',
      },
    ],
    explanation:
      'El reintento es parte del diseño de cualquier pipeline con dependencias externas. O los pasos se pueden repetir sin daño, o hay que saber cuáles ya se aplicaron.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'or-partial-fanout-failure',
    competencyId: 'orchestration-patterns',
    difficulty: 2,
    prompt: 'En un abanico de cinco subtareas, una falla. ¿Qué decide el sistema?',
    options: [
      {
        id: 'a',
        text: 'Si el resultado parcial ya sirve para el objetivo',
        correct: true,
        rationale:
          'Correcto: la respuesta depende de la tarea. A veces cuatro de cinco bastan y a veces no.',
      },
      {
        id: 'b',
        text: 'Descartar todo el abanico y repetirlo entero',
        correct: false,
        rationale:
          'Tira trabajo correcto y paga otra vez las cuatro que iban bien. Solo procede si la tarea es atómica.',
      },
      {
        id: 'c',
        text: 'Ignorar el fallo y seguir con lo que haya',
        correct: false,
        rationale:
          'Oculta el problema. El resultado se presenta como completo sin serlo.',
      },
    ],
    explanation:
      'La política ante el fallo parcial es una decisión de producto: qué significa «suficiente» en esa tarea. Se define antes, no cuando ocurre el fallo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'or-state-location',
    competencyId: 'orchestration-patterns',
    difficulty: 3,
    prompt: '¿Dónde debe vivir el estado de una orquestación larga?',
    options: [
      {
        id: 'a',
        text: 'Fuera del proceso, para sobrevivir a un reinicio',
        correct: true,
        rationale:
          'Correcto: si el proceso muere, el trabajo hecho no puede evaporarse con él.',
      },
      {
        id: 'b',
        text: 'En la memoria del proceso que orquesta',
        correct: false,
        rationale:
          'Un despliegue o una caída se lleva todo el progreso. La orquestación no puede ser efímera.',
      },
      {
        id: 'c',
        text: 'En el prompt, para que el modelo lo recuerde',
        correct: false,
        rationale:
          'El prompt no es almacenamiento. Y crece sin control hasta agotar el contexto.',
      },
    ],
    explanation:
      'Una orquestación dura más que un proceso: minutos, horas o días. El estado tiene que persistir para poder reanudar, y eso implica guardarlo de forma explícita.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'or-debuggability',
    competencyId: 'orchestration-patterns',
    difficulty: 3,
    prompt: 'La orquestación falla al tercer paso y no sabes por qué. ¿Qué faltaba?',
    options: [
      {
        id: 'a',
        text: 'Trazas por paso con entrada y salida',
        correct: true,
        rationale:
          'Correcto: sin ver qué recibió y qué devolvió cada paso, el fallo se investiga adivinando.',
      },
      {
        id: 'b',
        text: 'El prompt inicial completo del coordinador',
        correct: false,
        rationale:
          'Explica la intención y no lo que ocurrió. El error está en un paso intermedio.',
      },
      {
        id: 'c',
        text: 'El coste total de la ejecución fallida',
        correct: false,
        rationale:
          'Sabe cuánto se gastó, no dónde se rompió ni con qué datos.',
      },
    ],
    explanation:
      'Cada patrón de orquestación añade capas, y con ellas modos de fallo. La trazabilidad por paso es lo que convierte «algo falló» en «falló aquí, con esta entrada».',
    referenceId: 'ref-rules-ml',
  },

  {
    id: 'rf-circuit-breaker',
    competencyId: 'resilience-fallback',
    difficulty: 2,
    prompt: 'El proveedor lleva diez minutos devolviendo errores. ¿Qué conviene hacer?',
    options: [
      {
        id: 'a',
        text: 'Dejar de llamarlo y fallar rápido',
        correct: true,
        rationale:
          'Correcto: seguir llamando alarga la espera del usuario y mantiene cargado el servicio caído.',
      },
      {
        id: 'b',
        text: 'Reintentar en cada petición sin parar',
        correct: false,
        rationale:
          'Multiplica la carga sobre un servicio que ya no responde y propaga la caída.',
      },
      {
        id: 'c',
        text: 'Aumentar el timeout para darle más margen',
        correct: false,
        rationale:
          'Alarga la espera sin mejorar la probabilidad. El servicio está caído, no lento.',
      },
    ],
    explanation:
      'El cortacircuitos convierte una caída ajena en un fallo rápido y controlado: se deja de insistir, se activa la alternativa y se reintenta el servicio con medida.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rf-retry-budget',
    competencyId: 'resilience-fallback',
    difficulty: 2,
    prompt: 'Reintentas hasta tres veces por paso, y hay pasos que se encadenan. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Que el tiempo total se multiplique sin control',
        correct: true,
        rationale:
          'Correcto: tres reintentos en cuatro pasos son muchas más esperas que las previstas.',
      },
      {
        id: 'b',
        text: 'Ninguno: los reintentos mejoran la fiabilidad',
        correct: false,
        rationale:
          'Mejoran la fiabilidad por paso y degradan la latencia del conjunto. Hay que presupuestar.',
      },
      {
        id: 'c',
        text: 'Solo que sube el coste en tokens',
        correct: false,
        rationale:
          'El coste importa, y el problema principal es la espera acumulada del usuario.',
      },
    ],
    explanation:
      'Los reintentos se presupuestan sobre el conjunto, no por paso. Sin un límite global, tres reintentos encadenados convierten una petición de un segundo en una de nueve.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rf-fallback-scope',
    competencyId: 'resilience-fallback',
    difficulty: 3,
    prompt: 'El modelo de respaldo es peor en calidad. ¿Qué hay que definir antes de usarlo?',
    options: [
      {
        id: 'a',
        text: 'Qué tareas no admite ese respaldo',
        correct: true,
        rationale:
          'Correcto: para extracción validada puede servir; para decisiones con efecto, quizá no.',
      },
      {
        id: 'b',
        text: 'Nada: es mejor que fallar siempre',
        correct: false,
        rationale:
          'Fallar de forma controlada es preferible a responder mal en una tarea crítica sin avisar.',
      },
      {
        id: 'c',
        text: 'Nada: se usa solo cuando el principal falla',
        correct: false,
        rationale:
          'La condición de uso no dice si el resultado es admisible en esa tarea concreta.',
      },
    ],
    explanation:
      'Un respaldo es un modelo distinto, no una versión degradada del mismo. Su alcance se define por tarea: dónde su calidad basta y dónde es mejor no responder.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'rf-error-classification',
    competencyId: 'resilience-fallback',
    difficulty: 3,
    prompt: '¿Cómo distingues un error transitorio de uno permanente?',
    options: [
      {
        id: 'a',
        text: 'Por el tipo de error y la respuesta anterior',
        correct: true,
        rationale:
          'Correcto: límite de tasa o tiempo agotado son transitorios; validación o permisos, no.',
      },
      {
        id: 'b',
        text: 'Por la latencia que tuvo la llamada',
        correct: false,
        rationale:
          'La latencia no clasifica el error. Un fallo rápido de validación es permanente.',
      },
      {
        id: 'c',
        text: 'Reintentando y viendo qué pasa',
        correct: false,
        rationale:
          'Reintentar es la consecuencia, no la clasificación. Sin criterio, se reintenta lo que nunca funcionará.',
      },
    ],
    explanation:
      'La clasificación se hace antes del reintento, con el código de error y el contexto. Reintentar un error determinista solo gasta presupuesto y retrasa el diagnóstico.',
    referenceId: 'ref-rules-ml',
  },
  // ── application-architecture ────────────────────────────────────────────────

  {
    id: 'arch-what-decides',
    competencyId: 'application-architecture',
    difficulty: 1,
    prompt: '¿Qué debería decidir cómo se organiza el código?',
    options: [
      {
        id: 'a',
        text: 'Qué cambia junto cuando cambia el producto',
        correct: true,
        rationale:
          'Correcto: la estructura sirve al cambio. Si cada cambio toca cinco carpetas, la estructura estorba.',
      },
      {
        id: 'b',
        text: 'La arquitectura que use la empresa de referencia',
        correct: false,
        rationale:
          'Su producto y su equipo no son los tuyos. Copiar la estructura sin el problema que resolvía es ceremonia.',
      },
      {
        id: 'c',
        text: 'El número de ficheros que tenga cada carpeta',
        correct: false,
        rationale:
          'La simetría visual no dice nada del cambio. Una carpeta ordenada puede estar en el camino equivocado.',
      },
    ],
    explanation:
      'La pregunta útil es concreta: para cambiar un comportamiento, ¿qué abro? La respuesta a esa pregunta es la arquitectura real, con independencia de cómo se llamen las carpetas.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-layers-vs-slices',
    competencyId: 'application-architecture',
    difficulty: 2,
    prompt: '¿Qué diferencia hay entre organizar por capas y organizar por slices verticales?',
    options: [
      {
        id: 'a',
        text: 'Capas agrupan por tipo técnico; slices, por funcionalidad',
        correct: true,
        rationale:
          'Correcto: en capas, un cambio de producto se reparte por varias carpetas; en slices, vive en una.',
      },
      {
        id: 'b',
        text: 'Los slices son más modernos y sustituyen a las capas',
        correct: false,
        rationale:
          'Cada slice suele tener sus propias capas dentro. No es una sustitución, es otra forma de cortar.',
      },
      {
        id: 'c',
        text: 'Las capas permiten probar y los slices no',
        correct: false,
        rationale:
          'Los slices se prueban igual, a menudo mejor, porque el caso de uso entero está en un sitio.',
      },
    ],
    explanation:
      'La diferencia práctica está en la revisión: con capas, un cambio de funcionalidad obliga a abrir cinco sitios; con slices, uno o dos. El coste del cambio es el criterio.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-shotgun-surgery',
    competencyId: 'application-architecture',
    difficulty: 2,
    prompt:
      'Añadir un campo al producto obliga a tocar controlador, servicio, repositorio, mapeador y base de datos. ¿Qué te dice?',
    options: [
      {
        id: 'a',
        text: 'Que la estructura está peleando contra el cambio',
        correct: true,
        rationale:
          'Correcto: cinco carpetas para un dato es la señal clásica de que el corte no sigue al producto.',
      },
      {
        id: 'b',
        text: 'Que el proyecto está bien separado en capas',
        correct: false,
        rationale:
          'Separar por tipo técnico tiene ese coste exacto. La separación no es gratis y aquí se paga en cada cambio.',
      },
      {
        id: 'c',
        text: 'Que falta una carpeta donde agrupar esos cambios',
        correct: false,
        rationale:
          'Añadir otra capa no resuelve el corte: lo complica con un sitio más que abrir.',
      },
    ],
    explanation:
      'Cuando un cambio pequeño exige cinco ediciones coordinadas, el problema no es la disciplina del equipo: es el eje por el que se partió el código.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-hexagonal-when',
    competencyId: 'application-architecture',
    difficulty: 2,
    prompt: '¿Cuándo compensa separar puertos y adaptadores?',
    options: [
      {
        id: 'a',
        text: 'Cuando hay una segunda implementación o pruebas sin red',
        correct: true,
        rationale:
          'Correcto: el puerto se justifica por la necesidad de sustituir o de probar sin infraestructura real.',
      },
      {
        id: 'b',
        text: 'Siempre que haya una dependencia externa',
        correct: false,
        rationale:
          'Con una sola implementación que nunca cambiará, la interfaz es una capa más que leer y mantener.',
      },
      {
        id: 'c',
        text: 'Solo en proyectos de más de cien mil líneas',
        correct: false,
        rationale:
          'El tamaño no es el criterio. Un proyecto pequeño que cambiará de proveedor sí lo necesita.',
      },
    ],
    explanation:
      'Un puerto es una promesa de que la implementación puede cambiar. Si nunca hay segunda implementación ni se prueba sin la real, la promesa es decorativa.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-ceremony',
    competencyId: 'application-architecture',
    difficulty: 3,
    prompt:
      'El proyecto tiene una interfaz para cada dependencia y una sola implementación de cada una. ¿Qué valor aporta?',
    options: [
      {
        id: 'a',
        text: 'Poco: añade saltos sin proteger de nada',
        correct: true,
        rationale:
          'Correcto: sin segunda implementación ni pruebas aisladas, la interfaz no sustituye nada y obliga a navegar más.',
      },
      {
        id: 'b',
        text: 'Mucho: prepara el código para el futuro',
        correct: false,
        rationale:
          'Preparar para un futuro hipotético cuesta hoy y suele quedar obsoleto. La abstracción se añade cuando hay dos casos.',
      },
      {
        id: 'c',
        text: 'Es obligatorio en arquitectura hexagonal',
        correct: false,
        rationale:
          'La hexagonal habla de dirección de dependencias, no de crear una interfaz por dependencia porque sí.',
      },
    ],
    explanation:
      'La abstracción se paga en lectura y mantenimiento. Se gana cuando hay algo que sustituir; si no, es el nombre elegante de una capa vacía.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-dependency-direction',
    competencyId: 'application-architecture',
    difficulty: 3,
    prompt:
      'El dominio importa directamente el SDK del proveedor de modelos. ¿Qué problema hay?',
    options: [
      {
        id: 'a',
        text: 'La dirección de dependencia está invertida',
        correct: true,
        rationale:
          'Correcto: el dominio pasa a depender de la infraestructura, y cambiar de proveedor toca la lógica de negocio.',
      },
      {
        id: 'b',
        text: 'Ninguno: el SDK es código del proyecto',
        correct: false,
        rationale:
          'Es código ajeno con su ciclo de versiones. Depender de él desde el dominio ata tu lógica a un calendario externo.',
      },
      {
        id: 'c',
        text: 'Solo que las pruebas tardan más',
        correct: false,
        rationale:
          'Es una consecuencia. El problema de fondo es que el dominio ya no se puede probar ni cambiar sin el proveedor.',
      },
    ],
    explanation:
      'La arquitectura se reconoce en las flechas de importación, no en los nombres. Si el centro importa el borde, la separación existe solo en el diagrama.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-slice-duplication',
    competencyId: 'application-architecture',
    difficulty: 3,
    prompt:
      'Dos slices tienen la misma regla de negocio copiada. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Extraerla a un módulo compartido que ambos usen',
        correct: true,
        rationale:
          'Correcto: si la regla cambia, debe cambiar en un sitio. Copiada, se corrige en una y la otra queda mal.',
      },
      {
        id: 'b',
        text: 'Dejarla duplicada: cada slice debe ser independiente',
        correct: false,
        rationale:
          'La independencia del slice no justifica duplicar reglas. La duplicación se paga el día del cambio.',
      },
      {
        id: 'c',
        text: 'Unificar los dos slices en uno',
        correct: false,
        rationale:
          'Resuelve la duplicación y vuelve a juntar dos funcionalidades que cambian por motivos distintos.',
      },
    ],
    explanation:
      'Lo vertical es el corte, no la prohibición de compartir. El criterio es el de siempre: lo que cambia por la misma razón vive junto; lo que cambia por razones distintas, no.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'arch-ai-refactor-scope',
    competencyId: 'application-architecture',
    difficulty: 3,
    prompt:
      'Un agente propone reorganizar todo el proyecto a slices verticales en un solo cambio. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Acotar el alcance: un módulo, con pruebas, y decidir el límite',
        correct: true,
        rationale:
          'Correcto: el agente completa el patrón hasta el final. Sin límite escrito, el refactor se lleva todo por delante.',
      },
      {
        id: 'b',
        text: 'Aceptar: si el patrón es mejor, mejor en todas partes',
        correct: false,
        rationale:
          'Un refactor total sin revisión intermedia es imposible de revisar y de revertir si algo se rompe.',
      },
      {
        id: 'c',
        text: 'Rechazarlo: los agentes no entienden de arquitectura',
        correct: false,
        rationale:
          'Aplican patrones con soltura, incluida la ceremonia. El problema no es que no sepan, es que no eligen el límite.',
      },
    ],
    explanation:
      'Con un agente, refactorizar es barato y por eso mismo se desborda: aplicará el patrón a todo lo que alcance. Decidir el límite y trabajar con pruebas es lo que convierte la propuesta en una mejora.',
    referenceId: 'ref-rules-ml',
  },
];