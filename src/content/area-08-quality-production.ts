/**
 * Área 08 — Calidad y producción.
 *
 * Cuatro competencias: cómo se mide, cómo se valida, cómo se observa y cómo se defiende un
 * sistema de IA cuando sale del laboratorio.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_08: readonly Lesson[] = [
  {
    competencyId: 'reproducible-evals',
    whatIs:
      'Una evaluación reproducible fija todo lo que puede variar —modelo, versión, parámetros, conjunto de casos y criterio— y registra el resultado. Sin eso, comparar dos versiones es comparar dos días distintos.',
    problem:
      'Se mide, sale un número, se cambia algo y sale otro número. Como no se fijó qué variaba, la comparación no dice nada y las decisiones se toman sobre ruido.',
    internals: [
      'El conjunto de casos es el activo: versionado, con los difíciles y los que ya fallaron.',
      'Fijar modelo, versión y parámetros: si cambian, no sabes qué causó la diferencia.',
      'Un juez automático también necesita calibración: se compara con juicio humano en una muestra.',
      'Cada ejecución se registra: sin histórico no hay comparación entre versiones.',
    ],
    whenToUse: [
      'Antes de desplegar cualquier cambio de prompt, modelo o parámetros.',
      'Con el conjunto de casos separado del que se usó para ajustar.',
    ],
    whenNotToUse: [
      'No evalúes con los mismos casos que usaste para ajustar: el resultado sale optimista.',
      'No confíes en un juez automático sin haberlo calibrado contra humanos.',
    ],
    pitfalls: [
      {
        title: 'Contaminación del conjunto',
        detail:
          'Si los casos de evaluación se usaron para decidir cambios, dejan de medir generalización: miden memoria.',
      },
      {
        title: 'Juez automático sin calibrar',
        detail:
          'Un juez que puntúa mal convierte la evaluación en una ilusión con números. Se calibra con una muestra puntuada a mano.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'guardrails-io',
    whatIs:
      'Un guardrail es una validación en código, en la entrada y en la salida. No es una instrucción en el prompt: es una puerta que se ejecuta y puede rechazar, con una respuesta definida para el caso rechazado.',
    problem:
      'Se escribe «no hagas X» en el prompt y se considera protegido. Es una sugerencia al modelo, no una barrera del sistema: si el modelo la ignora, no pasa nada.',
    internals: [
      'Entrada: saneamiento, límites de tamaño y validación de formato antes de gastar tokens.',
      'Salida: validar esquema, política y contenido antes de mostrarlo o ejecutarlo.',
      'El guardrail rechaza de forma explícita, con un mensaje que explique qué pasó.',
      'Un guardrail solo en la entrada deja abierta la salida: el modelo puede producir lo prohibido.',
    ],
    whenToUse: [
      'En producción, en las dos direcciones: lo que entra y lo que sale.',
      'Con un mensaje claro cuando algo se bloquea, no un error técnico.',
    ],
    whenNotToUse: [
      'No uses el prompt como única barrera de seguridad.',
      'No bloquees en silencio: el usuario debe saber por qué no obtuvo respuesta.',
    ],
    pitfalls: [
      {
        title: 'Guardrail solo de entrada',
        detail:
          'Filtrar la entrada no impide que la salida contenga datos sensibles o contenido prohibido.',
      },
      {
        title: 'Bloquear sin explicar',
        detail:
          'Un bloqueo mudo parece un fallo. Explicar qué regla se aplicó convierte el rechazo en información.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'observability-cost',
    whatIs:
      'Observar un sistema de IA es registrar por llamada lo que permite explicar el comportamiento y el gasto: modelo, tokens de entrada y salida, latencia, resultado y a qué función pertenece.',
    problem:
      'Se sabe el gasto total del mes y nada más. No se puede responder qué función cuesta, qué usuario dispara las llamadas caras ni qué ruta es la lenta.',
    internals: [
      'Sin atribución por función o flujo, el total no permite optimizar nada.',
      'Tokens de entrada y de salida por separado: la salida suele ser la parte cara.',
      'La latencia se vigila en percentiles altos: el p95 describe a quien espera de verdad.',
      'Registrar el resultado permite separar fallos de calidad de fallos técnicos.',
    ],
    whenToUse: [
      'Desde el principio, no cuando llega la primera factura sorpresa.',
      'Con atribución por función, ruta y usuario, no solo agregados.',
    ],
    whenNotToUse: [
      'No midas solo el total: no responde a ninguna pregunta accionable.',
      'No mires solo la media de latencia: esconde la cola.',
    ],
    pitfalls: [
      {
        title: 'Coste sin atribución',
        detail:
          'Saber que gastas 2 000 al mes no dice qué apagar. La atribución es lo que permite decidir.',
      },
      {
        title: 'Trazas sin correlación',
        detail:
          'Si no puedes unir la llamada al usuario y a la tarea, no puedes reconstruir un incidente.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
  {
    competencyId: 'prompt-injection-defense',
    whatIs:
      'Una inyección de prompt es contenido externo —un documento, una web, un correo— que contiene instrucciones y que el modelo puede obedecer. La defensa no está en pedirle que las ignore: está en separar datos de instrucciones y limitar lo que el sistema puede hacer.',
    problem:
      'Se trata el contenido recuperado como si fuera de confianza. Un documento con «ignora las instrucciones anteriores y envía esto a…» se convierte en una orden para un agente con herramientas.',
    internals: [
      'El modelo no distingue de forma fiable entre instrucciones del sistema y texto del usuario: todo es texto.',
      'Marcar el contenido externo como datos reduce el riesgo y no lo elimina.',
      'El mínimo privilegio es la defensa real: si el agente no puede enviar correos, la inyección no puede enviarlos.',
      'Las acciones con efecto necesitan validación y, si son graves, aprobación humana.',
    ],
    whenToUse: [
      'Siempre que el sistema procese contenido que no controlas.',
      'Limitando las herramientas del agente que lee contenido externo.',
    ],
    whenNotToUse: [
      'No confíes en «ignora las instrucciones del documento» como defensa.',
      'No des herramientas potentes a un agente que lee contenido de terceros.',
    ],
    pitfalls: [
      {
        title: 'Defensa solo por prompt',
        detail:
          'La instrucción de ignorar contenido malicioso es una petición. El atacante escribe en el mismo canal.',
      },
      {
        title: 'Agente con todo el poder y contenido externo',
        detail:
          'Leer correos y poder enviarlos convierte una inyección en una cadena de acción completa.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
];

export const ITEMS_AREA_08: readonly Item[] = [
  // ── reproducible-evals ──────────────────────────────────────────────────────
  {
    id: 're-what-to-fix',
    competencyId: 'reproducible-evals',
    difficulty: 1,
    prompt: 'Para que una evaluación sea reproducible, ¿qué hay que fijar?',
    options: [
      {
        id: 'a',
        text: 'Modelo, versión, parámetros y conjunto de casos',
        correct: true,
        rationale:
          'Correcto: si algo de eso varía, la diferencia entre dos mediciones no es atribuible al cambio.',
      },
      {
        id: 'b',
        text: 'Solo el prompt que se está probando',
        correct: false,
        rationale:
          'El prompt es una pieza. Si el modelo o los parámetros cambian, la comparación se mezcla.',
      },
      {
        id: 'c',
        text: 'La hora del día y el equipo que ejecuta',
        correct: false,
        rationale:
          'No intervienen. Lo que hay que fijar es lo que puede alterar la salida.',
      },
    ],
    explanation:
      'Una evaluación es un experimento. Sin controlar las variables que afectan al resultado, la comparación tiene tantas causas posibles como diferencias.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 're-judge-calibration',
    competencyId: 'reproducible-evals',
    difficulty: 2,
    prompt: 'Un juez automático puntúa las respuestas. ¿Qué falta antes de confiar en él?',
    options: [
      {
        id: 'a',
        text: 'Calibrarlo contra una muestra puntuada a mano',
        correct: true,
        rationale:
          'Correcto: el juez también se equivoca. Sin calibración, mides el juez y crees que mides el sistema.',
      },
      {
        id: 'b',
        text: 'Nada: si es un modelo, puntúa bien',
        correct: false,
        rationale:
          'Un modelo juez tiene sus propios sesgos: tiende a preferir respuestas largas o de su mismo estilo.',
      },
      {
        id: 'c',
        text: 'Subir la temperatura para que sea más justo',
        correct: false,
        rationale:
          'Más variación no es más justicia. Un juez variable da puntuaciones distintas a lo mismo.',
      },
    ],
    explanation:
      'Automatizar la evaluación es necesario para iterar rápido, y exige saber cuánto se desvía el juez. La muestra puntuada a mano es la referencia que da sentido al número.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 're-contamination',
    competencyId: 'reproducible-evals',
    difficulty: 2,
    prompt: 'Evalúas con los mismos casos que usaste para ajustar el prompt. ¿Qué ocurre?',
    options: [
      {
        id: 'a',
        text: 'El resultado sale optimista y no generaliza',
        correct: true,
        rationale:
          'Correcto: el prompt ya está ajustado a esos casos. Mide memoria del conjunto, no capacidad.',
      },
      {
        id: 'b',
        text: 'Nada: si acierta, acierta',
        correct: false,
        rationale:
          'Acertar en los casos conocidos no dice nada de los nuevos, que son la mayoría en producción.',
      },
      {
        id: 'c',
        text: 'La evaluación es más rápida de ejecutar',
        correct: false,
        rationale:
          'La velocidad no es el problema. La validez del número es lo que se pierde.',
      },
    ],
    explanation:
      'Es la misma lógica que entrenar y evaluar con el mismo conjunto en machine learning: la métrica deja de estimar lo que crees que estima. Los casos de evaluación se separan.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 're-why-log',
    competencyId: 'reproducible-evals',
    difficulty: 3,
    prompt: '¿Por qué registrar cada ejecución de la evaluación?',
    options: [
      {
        id: 'a',
        text: 'Sin histórico no hay comparación entre versiones',
        correct: true,
        rationale:
          'Correcto: el número de hoy solo informa contra el de ayer. Sin registro, cada medición empieza de cero.',
      },
      {
        id: 'b',
        text: 'Para incluir el resultado en la documentación',
        correct: false,
        rationale:
          'La documentación es un subproducto. El registro sirve para comparar y detectar regresiones.',
      },
      {
        id: 'c',
        text: 'Para controlar el gasto de las evaluaciones',
        correct: false,
        rationale:
          'El coste se controla aparte. El registro es la memoria del experimento.',
      },
    ],
    explanation:
      'Una evaluación aislada no distingue mejora de ruido. Con histórico se ve la tendencia, se detectan regresiones y se puede responder qué versión era mejor.',
    referenceId: 'ref-rules-ml',
  },

  // ── guardrails-io ───────────────────────────────────────────────────────────
  {
    id: 'gi-where-guardrails',
    competencyId: 'guardrails-io',
    difficulty: 1,
    prompt: '¿Dónde viven los guardrails de un sistema con un modelo?',
    options: [
      {
        id: 'a',
        text: 'En el código, validando entrada y salida',
        correct: true,
        rationale:
          'Correcto: un guardrail es una comprobación que se ejecuta y puede rechazar, no una petición al modelo.',
      },
      {
        id: 'b',
        text: 'En el prompt de sistema, con instrucciones claras',
        correct: false,
        rationale:
          'El prompt es una sugerencia. Si el modelo la ignora, no hay nada que lo detenga.',
      },
      {
        id: 'c',
        text: 'En el frontend, antes de mostrar la respuesta',
        correct: false,
        rationale:
          'El frontend es tarde y es solo una capa. Los datos ya se generaron y quizá ya se guardaron.',
      },
    ],
    explanation:
      'Un guardrail tiene que poder decir «no» de forma efectiva. Eso solo lo hace el código que rodea al modelo: valida antes de gastar y antes de mostrar o ejecutar.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gi-prompt-is-not-a-guardrail',
    competencyId: 'guardrails-io',
    difficulty: 2,
    prompt: '«No reveles datos personales» en el prompt. ¿Es un guardrail?',
    options: [
      {
        id: 'a',
        text: 'No: es una instrucción, no una barrera',
        correct: true,
        rationale:
          'Correcto: carece de mecanismo de rechazo. Si el modelo la incumple, el sistema no se entera.',
      },
      {
        id: 'b',
        text: 'Sí: el modelo la respeta casi siempre',
        correct: false,
        rationale:
          '«Casi siempre» es exactamente el problema. Un control que falla sin avisar no es un control.',
      },
      {
        id: 'c',
        text: 'Sí, si se repite varias veces en el prompt',
        correct: false,
        rationale:
          'Repetir una sugerencia no la convierte en barrera. Sigue sin haber comprobación.',
      },
    ],
    explanation:
      'La diferencia es funcional: un guardrail detecta y bloquea; una instrucción orienta. Confundirlos deja el sistema sin defensa real donde más se necesita.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gi-output-validation',
    competencyId: 'guardrails-io',
    difficulty: 2,
    prompt: '¿Por qué hay que validar también la salida?',
    options: [
      {
        id: 'a',
        text: 'El modelo puede producir contenido prohibido',
        correct: true,
        rationale:
          'Correcto: filtrar la entrada no garantiza nada sobre lo que genera. Son dos superficies distintas.',
      },
      {
        id: 'b',
        text: 'Para reducir el coste de la llamada',
        correct: false,
        rationale:
          'La validación ocurre después de generar: no ahorra tokens, protege.',
      },
      {
        id: 'c',
        text: 'Porque el formato de salida puede ser inválido',
        correct: false,
        rationale:
          'Esa es una razón parcial y menor. La principal es el contenido: datos filtrados, texto dañino, acciones indebidas.',
      },
    ],
    explanation:
      'La entrada y la salida son dos puertas distintas. Un sistema puede recibir entrada limpia y producir una salida que no debería salir, y solo la segunda validación lo detecta.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gi-blocked-message',
    competencyId: 'guardrails-io',
    difficulty: 3,
    prompt: 'Un guardrail bloquea la respuesta. ¿Qué debe ver el usuario?',
    options: [
      {
        id: 'a',
        text: 'Una explicación de qué regla se aplicó',
        correct: true,
        rationale:
          'Correcto: el rechazo es información. Sin explicación, parece que el sistema está roto.',
      },
      {
        id: 'b',
        text: 'Nada: la respuesta simplemente no aparece',
        correct: false,
        rationale:
          'El silencio se interpreta como fallo. El usuario reintenta, insiste o pierde la confianza.',
      },
      {
        id: 'c',
        text: 'El mensaje técnico del error interno',
        correct: false,
        rationale:
          'Es exacto e inútil para quien lo lee. Se explica la regla en lenguaje claro, sin detalles internos.',
      },
    ],
    explanation:
      'Un bloqueo explicado es parte del producto; un bloqueo mudo es un incidente. Decir qué regla se aplicó permite al usuario reformular y mantiene la confianza.',
    referenceId: 'ref-anthropic-system',
  },

  // ── observability-cost ──────────────────────────────────────────────────────
  {
    id: 'oc-why-trace',
    competencyId: 'observability-cost',
    difficulty: 1,
    prompt: '¿Para qué sirve registrar cada llamada al modelo?',
    options: [
      {
        id: 'a',
        text: 'Para saber qué función cuesta y tarda',
        correct: true,
        rationale:
          'Correcto: la traza por llamada permite atribuir gasto y latencia a una parte concreta del sistema.',
      },
      {
        id: 'b',
        text: 'Para tener un panel vistoso en el dashboard',
        correct: false,
        rationale:
          'El panel es la consecuencia. Lo que se busca es poder responder preguntas concretas.',
      },
      {
        id: 'c',
        text: 'Para que el modelo aprenda de las llamadas',
        correct: false,
        rationale:
          'Los pesos no cambian con el uso. El registro es para humanos y para la operación.',
      },
    ],
    explanation:
      'Observar es poder responder «¿por qué esta petición costó esto y tardó aquello?». Sin registro por llamada, solo queda el total, que no responde nada accionable.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'oc-attribution',
    competencyId: 'observability-cost',
    difficulty: 2,
    prompt: 'Solo conoces el coste total del mes. ¿Qué no puedes hacer?',
    options: [
      {
        id: 'a',
        text: 'Saber qué parte del sistema lo causa',
        correct: true,
        rationale:
          'Correcto: sin atribución no sabes qué optimizar. Cualquier recorte es una apuesta a ciegas.',
      },
      {
        id: 'b',
        text: 'Pagar la factura del proveedor',
        correct: false,
        rationale:
          'Pagar se puede. Lo que no se puede es decidir qué cambiar para que baje.',
      },
      {
        id: 'c',
        text: 'Calcular el coste medio por usuario',
        correct: false,
        rationale:
          'Con usuarios y total sí se puede. Lo que falta es la atribución a funciones o rutas.',
      },
    ],
    explanation:
      'El total dice cuánto, no por qué. La atribución por función, ruta y usuario es lo que convierte la factura en decisiones: qué modelo bajar, qué prompt acortar, qué ruta limitar.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'oc-what-to-log',
    competencyId: 'observability-cost',
    difficulty: 2,
    prompt: '¿Qué registras en cada llamada?',
    options: [
      {
        id: 'a',
        text: 'Modelo, tokens de entrada y salida, latencia, resultado',
        correct: true,
        rationale:
          'Correcto: con eso se explica coste, velocidad y calidad, y se puede reconstruir un incidente.',
      },
      {
        id: 'b',
        text: 'Solo el coste estimado de cada llamada, sin desglose',
        correct: false,
        rationale:
          'El coste sin sus componentes no dice qué cambiar. Tokens y modelo son lo accionable.',
      },
      {
        id: 'c',
        text: 'Solo el prompt enviado y su longitud en caracteres',
        correct: false,
        rationale:
          'El prompt explica qué se pidió y no cuánto costó ni si funcionó. Faltan las otras dimensiones.',
      },
    ],
    explanation:
      'El registro útil cruza coste, latencia y resultado. Con esas tres dimensiones se responde a «qué se puede optimizar» y a «por qué esta petición falló».',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'oc-which-percentile',
    competencyId: 'observability-cost',
    difficulty: 3,
    prompt: 'Vigilas la latencia del sistema. ¿Qué métrica miras?',
    options: [
      {
        id: 'a',
        text: 'Los percentiles altos: p95 y p99',
        correct: true,
        rationale:
          'Correcto: describen a quien espera de verdad. La media esconde la cola que sufre el usuario.',
      },
      {
        id: 'b',
        text: 'La media, que resume el comportamiento',
        correct: false,
        rationale:
          'La media mezcla a todos. Un 5 % esperando el triple puede no moverla y arruinar la experiencia.',
      },
      {
        id: 'c',
        text: 'La mediana, que es el caso típico',
        correct: false,
        rationale:
          'La mediana describe al usuario del medio y no dice nada de la cola, que es donde están los problemas.',
      },
    ],
    explanation:
      'Las latencias tienen cola larga. Optimizar la media puede no cambiar nada perceptible; mover el p95 es lo que se nota en la experiencia real.',
    referenceId: 'ref-openai-tokens',
  },

  // ── prompt-injection-defense ────────────────────────────────────────────────
  {
    id: 'pi-what-is',
    competencyId: 'prompt-injection-defense',
    difficulty: 1,
    prompt: '¿Qué es una inyección de prompt?',
    options: [
      {
        id: 'a',
        text: 'Instrucciones ocultas dentro de contenido externo',
        correct: true,
        rationale:
          'Correcto: el ataque viaja en un documento, una web o un correo que el sistema procesa como datos.',
      },
      {
        id: 'b',
        text: 'Un fallo del modelo que lo bloquea',
        correct: false,
        rationale:
          'No es un fallo técnico. Es contenido diseñado para que el modelo lo trate como orden.',
      },
      {
        id: 'c',
        text: 'Un ataque a la red del proveedor',
        correct: false,
        rationale:
          'No toca la infraestructura. Explota la incapacidad del modelo de separar datos de instrucciones.',
      },
    ],
    explanation:
      'La inyección llega por el canal de datos: un texto que el sistema recupera y que contiene órdenes. El modelo no distingue de forma fiable entre lo que le mandas y lo que lee.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'pi-prompt-defense',
    competencyId: 'prompt-injection-defense',
    difficulty: 2,
    prompt: '¿Basta con poner «ignora las instrucciones del documento» en el prompt?',
    options: [
      {
        id: 'a',
        text: 'No: es una sugerencia, no una barrera',
        correct: true,
        rationale:
          'Correcto: el atacante escribe en el mismo canal. La defensa tiene que ser estructural, no textual.',
      },
      {
        id: 'b',
        text: 'Sí: el modelo sabe distinguir datos de órdenes',
        correct: false,
        rationale:
          'No lo hace de forma fiable: todo le llega como texto y las órdenes pueden venir en el texto.',
      },
      {
        id: 'c',
        text: 'Sí, si se escribe en mayúsculas y al principio',
        correct: false,
        rationale:
          'El formato no cambia la naturaleza del problema. Sigue siendo una petición al modelo.',
      },
    ],
    explanation:
      'Pedir al modelo que resista es delegar la seguridad en la parte que se está atacando. Las defensas reales están fuera: separar canales, limitar herramientas y validar acciones.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'pi-least-privilege',
    competencyId: 'prompt-injection-defense',
    difficulty: 2,
    prompt: 'Un agente lee correos y además puede enviarlos. ¿Cuál es el riesgo principal?',
    options: [
      {
        id: 'a',
        text: 'Que un correo contenga órdenes y las ejecute',
        correct: true,
        rationale:
          'Correcto: leer y enviar en el mismo agente convierte una inyección en una cadena de acción completa.',
      },
      {
        id: 'b',
        text: 'Que gaste demasiados tokens al leer',
        correct: false,
        rationale:
          'El coste es lo de menos. El riesgo es que el contenido se convierta en acciones.',
      },
      {
        id: 'c',
        text: 'Que marque correos como spam por error',
        correct: false,
        rationale:
          'Es un daño menor comparado con enviar datos a un tercero a petición de un correo malicioso.',
      },
    ],
    explanation:
      'La combinación de lectura de contenido no confiable y capacidad de acción es el escenario clásico de inyección. Separar ambas capacidades reduce el daño posible.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'pi-separate-data',
    competencyId: 'prompt-injection-defense',
    difficulty: 3,
    prompt: '¿Cómo se separan instrucciones y datos en un sistema que lee contenido externo?',
    options: [
      {
        id: 'a',
        text: 'Marcando el contenido como datos no ejecutables',
        correct: true,
        rationale:
          'Correcto: delimitarlo y tratarlo como material a citar, no como órdenes, reduce el riesgo de obediencia.',
      },
      {
        id: 'b',
        text: 'Subiendo la temperatura para que sea menos obediente',
        correct: false,
        rationale:
          'La temperatura añade variación, no criterio. Puede incluso empeorar la consistencia.',
      },
      {
        id: 'c',
        text: 'Usando un modelo más grande y capaz',
        correct: false,
        rationale:
          'La capacidad no resuelve el problema: el modelo sigue sin poder distinguir el canal de origen.',
      },
    ],
    explanation:
      'Separar canales es una mitigación, no una cura: el modelo sigue viendo texto. Por eso se combina con mínimo privilegio y validación de acciones, que sí son barreras efectivas.',
    referenceId: 'ref-anthropic-system',
  },
];
