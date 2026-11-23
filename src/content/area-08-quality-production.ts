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

  // ── segunda tanda: hasta 8 ítems por competencia ────────────────────────────

  {
    id: 're-model-version-drift',
    competencyId: 'reproducible-evals',
    difficulty: 2,
    prompt: 'El proveedor actualiza el modelo manteniendo el mismo nombre. ¿Qué rompe?',
    options: [
      {
        id: 'a',
        text: 'La comparación con tus mediciones anteriores',
        correct: true,
        rationale:
          'Correcto: el número cambió porque cambió el modelo. Ya no es comparable con el histórico.',
      },
      {
        id: 'b',
        text: 'Nada: el nombre es el mismo, así que el modelo',
        correct: false,
        rationale:
          'El nombre es una etiqueta comercial. El comportamiento detrás puede haber cambiado.',
      },
      {
        id: 'c',
        text: 'Solo el coste por token de la nueva versión',
        correct: false,
        rationale:
          'El coste puede cambiar y lo importante es que la calidad medida dejó de ser comparable.',
      },
    ],
    explanation:
      'Los modelos cambian detrás de un alias estable. Sin registrar versión efectiva y fecha de cada medición, la serie histórica deja de significar lo mismo sin que nadie lo note.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 're-eval-size',
    competencyId: 'reproducible-evals',
    difficulty: 2,
    prompt: '¿Cuántos casos necesita el conjunto de evaluación?',
    options: [
      {
        id: 'a',
        text: 'Los que distingan un cambio real, medido',
        correct: true,
        rationale:
          'Correcto: el tamaño se fija por su capacidad de detectar diferencias, no por una cifra redonda.',
      },
      {
        id: 'b',
        text: 'Cuantos más casos, mejor en cualquier caso',
        correct: false,
        rationale:
          'Más casos cuestan más en cada ejecución, y el exceso no aporta si el problema ya se detecta.',
      },
      {
        id: 'c',
        text: 'Diez casos bien elegidos bastan siempre',
        correct: false,
        rationale:
          'Diez pueden no distinguir dos prompts parecidos. La cifra depende de la variabilidad real.',
      },
    ],
    explanation:
      'El conjunto se dimensiona por poder de discriminación: cuántos casos hacen falta para que la diferencia entre dos versiones no sea ruido. Eso se mide, no se estima.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 're-human-judgment',
    competencyId: 'reproducible-evals',
    difficulty: 3,
    prompt: '¿Cuándo hace falta juicio humano aunque tengas un juez automático?',
    options: [
      {
        id: 'a',
        text: 'En criterios que el juez automático no captura',
        correct: true,
        rationale:
          'Correcto: utilidad real, tono o adecuación al contexto suelen escaparse de una métrica simple.',
      },
      {
        id: 'b',
        text: 'Siempre: sin una persona no hay evaluación válida',
        correct: false,
        rationale:
          'Inviable a escala. El juicio humano se reserva para calibrar y para lo que no se automatiza.',
      },
      {
        id: 'c',
        text: 'Nunca: si el juez es un modelo, es suficiente',
        correct: false,
        rationale:
          'Un juez hereda sesgos y mide lo que sabe medir. Lo que está fuera de su criterio queda invisible.',
      },
    ],
    explanation:
      'La evaluación automática escala y la humana entiende. Se combinan: el juez cubre el volumen y la persona revisa una muestra y los criterios donde el automatismo no llega.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 're-eval-cost-tradeoff',
    competencyId: 'reproducible-evals',
    difficulty: 3,
    prompt: 'Ejecutar el conjunto completo cuesta demasiado para cada cambio. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Un subconjunto estable para el día a día',
        correct: true,
        rationale:
          'Correcto: se mantiene una señal rápida y se reserva el conjunto grande para hitos.',
      },
      {
        id: 'b',
        text: 'Dejar de evaluar y confiar en la revisión manual',
        correct: false,
        rationale:
          'Sin medición no hay comparación. La impresión de quien revisa cambia con el caso que miró.',
      },
      {
        id: 'c',
        text: 'Evaluar solo con el conjunto completo al final',
        correct: false,
        rationale:
          'Llega tarde: las regresiones se acumulan durante semanas sin que nadie las vea.',
      },
    ],
    explanation:
      'La evaluación tiene dos velocidades: una rápida y representativa en cada cambio, y otra completa en los hitos. Lo que no puede pasar es quedarse sin ninguna señal.',
    referenceId: 'ref-rules-ml',
  },

  {
    id: 'gi-false-positive-rate',
    competencyId: 'guardrails-io',
    difficulty: 2,
    prompt: 'El guardrail bloquea respuestas legítimas. ¿Qué mides para decidirlo?',
    options: [
      {
        id: 'a',
        text: 'La tasa de bloqueos incorrectos',
        correct: true,
        rationale:
          'Correcto: un guardrail demasiado estricto rompe el producto sin aportar seguridad real.',
      },
      {
        id: 'b',
        text: 'La velocidad con la que decide el filtro',
        correct: false,
        rationale:
          'La latencia importa y no dice si está acertando. Un filtro rápido y equivocado es peor.',
      },
      {
        id: 'c',
        text: 'El coste en tokens del guardrail',
        correct: false,
        rationale:
          'El coste no informa de si bloquea lo que debe. El problema aquí es de precisión.',
      },
    ],
    explanation:
      'Todo guardrail tiene dos errores posibles: dejar pasar lo prohibido y bloquear lo correcto. El segundo se nota en el producto y se mide igual que el primero.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gi-latency-cost',
    competencyId: 'guardrails-io',
    difficulty: 2,
    prompt: 'Un guardrail añade 300 ms a cada respuesta. ¿Cómo decides si vale la pena?',
    options: [
      {
        id: 'a',
        text: 'Comparando el riesgo real con esa espera',
        correct: true,
        rationale:
          'Correcto: la decisión es un intercambio explícito entre fricción constante y daño evitado.',
      },
      {
        id: 'b',
        text: 'Quitándolo: la latencia siempre es prioritaria',
        correct: false,
        rationale:
          'Hay riesgos que justifican esperar. La latencia no es la única dimensión del producto.',
      },
      {
        id: 'c',
        text: 'Dejándolo: la seguridad no se negocia',
        correct: false,
        rationale:
          'La seguridad tampoco es infinita. Un coste fijo en cada respuesta afecta a todos los usuarios.',
      },
    ],
    explanation:
      'Los guardrails se pagan en cada petición. Se aceptan cuando el daño que evitan es mayor que la fricción que añaden, y esa comparación se hace explícita.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gi-layered',
    competencyId: 'guardrails-io',
    difficulty: 3,
    prompt: '¿Por qué varios guardrails especializados en vez de uno solo muy estricto?',
    options: [
      {
        id: 'a',
        text: 'Cada uno cubre un fallo distinto',
        correct: true,
        rationale:
          'Correcto: datos personales, formato y política son problemas distintos con comprobaciones distintas.',
      },
      {
        id: 'b',
        text: 'Para que el sistema parezca más seguro',
        correct: false,
        rationale:
          'La apariencia no protege. Capas sin criterio solo suman latencia y falsos bloqueos.',
      },
      {
        id: 'c',
        text: 'Porque un filtro único siempre se queda corto',
        correct: false,
        rationale:
          'Es una consecuencia, no la razón. Lo que decide es que cada capa responde a un riesgo concreto.',
      },
    ],
    explanation:
      'Las capas se justifican por tipo de riesgo: lo que entra, lo que sale, lo que se ejecuta. Cada una tiene su regla y su coste; un filtro genérico falla en los tres frentes.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gi-block-audit',
    competencyId: 'guardrails-io',
    difficulty: 3,
    prompt: '¿Qué hay que registrar cuando un guardrail bloquea?',
    options: [
      {
        id: 'a',
        text: 'La regla aplicada y el contenido que la disparó',
        correct: true,
        rationale:
          'Correcto: sin ambos no se puede distinguir un acierto de un falso positivo al revisar.',
      },
      {
        id: 'b',
        text: 'Solo que hubo un bloqueo, para contar métricas',
        correct: false,
        rationale:
          'El recuento no permite revisar nada. Se necesita saber qué regla y con qué contenido.',
      },
      {
        id: 'c',
        text: 'El prompt completo del sistema en ese momento',
        correct: false,
        rationale:
          'Es contexto interno y voluminoso. Lo relevante es la regla y el texto que la activó.',
      },
    ],
    explanation:
      'Un bloqueo es una decisión, y las decisiones se auditan. Registrar regla y contenido permite detectar falsos positivos y ajustar el criterio con datos.',
    referenceId: 'ref-anthropic-system',
  },

  {
    id: 'oc-logs-with-pii',
    competencyId: 'observability-cost',
    difficulty: 2,
    prompt: 'Tus trazas guardan los prompts completos de los usuarios. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Datos personales en un log sin política',
        correct: true,
        rationale:
          'Correcto: un log es un almacén de datos. Si guarda contenido de usuarios, necesita el mismo trato.',
      },
      {
        id: 'b',
        text: 'Ninguno: el log es interno y no se comparte',
        correct: false,
        rationale:
          'Interno no es inocuo. Un acceso indebido o una retención excesiva bastan para el problema.',
      },
      {
        id: 'c',
        text: 'Solo que el log ocupa demasiado espacio',
        correct: false,
        rationale:
          'El tamaño es lo de menos. El riesgo es qué contiene, cuánto dura y quién puede verlo.',
      },
    ],
    explanation:
      'Observar exige registrar, y registrar contenido de usuarios es tratar datos personales. Las trazas necesitan retención, acceso y anonimización tan definidos como la base de datos.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'oc-alert-targets',
    competencyId: 'observability-cost',
    difficulty: 2,
    prompt: '¿Sobre qué conviene alertar de un servicio con modelo?',
    options: [
      {
        id: 'a',
        text: 'Sobre p95 y tasa de error, no sobre la media',
        correct: true,
        rationale:
          'Correcto: las alertas describen el sufrimiento del usuario, que vive en la cola.',
      },
      {
        id: 'b',
        text: 'Sobre la latencia media de cada hora',
        correct: false,
        rationale:
          'La media esconde la cola. Una hora con p95 de cinco segundos puede tener media normal.',
      },
      {
        id: 'c',
        text: 'Sobre el mínimo registrado en el día',
        correct: false,
        rationale:
          'El mínimo solo dice lo mejor que fue. Nadie vive el mínimo.',
      },
    ],
    explanation:
      'Las alertas deben corresponder a lo que rompe la experiencia. Con latencias de cola larga, el percentil alto y la tasa de error describen el incidente mucho mejor que el promedio.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'oc-sampling',
    competencyId: 'observability-cost',
    difficulty: 3,
    prompt: 'Trazar el 100 % de las peticiones es caro. ¿Qué estrategia conviene?',
    options: [
      {
        id: 'a',
        text: 'Una muestra amplia más todas las que fallan',
        correct: true,
        rationale:
          'Correcto: el muestreo da la visión general y los fallos se conservan enteros, que es donde se investiga.',
      },
      {
        id: 'b',
        text: 'Trazar todo siempre, sin excepciones',
        correct: false,
        rationale:
          'El coste crece con el volumen y, cuando llega el incidente, se paga igual de caro.',
      },
      {
        id: 'c',
        text: 'No trazar y confiar en las métricas agregadas',
        correct: false,
        rationale:
          'Sin trazas no se puede reconstruir una petición concreta, que es lo que se necesita al depurar.',
      },
    ],
    explanation:
      'La observabilidad se presupuesta como el resto. Muestrear con sesgo hacia los errores conserva lo que sirve para investigar sin pagar por cada petición correcta.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'oc-cost-dimensions',
    competencyId: 'observability-cost',
    difficulty: 3,
    prompt: '¿Con qué dimensiones atribuyes el coste de un sistema con modelo?',
    options: [
      {
        id: 'a',
        text: 'Por función, ruta de modelo y usuario',
        correct: true,
        rationale:
          'Correcto: esas tres permiten decidir qué optimizar y quién genera el gasto.',
      },
      {
        id: 'b',
        text: 'Solo el total por día y por proveedor',
        correct: false,
        rationale:
          'El total diario no dice qué apagar. Sin dimensiones, cualquier recorte es una apuesta.',
      },
      {
        id: 'c',
        text: 'Solo por modelo utilizado',
        correct: false,
        rationale:
          'Sabes cuánto cuesta cada modelo y no qué parte del producto lo usa ni por qué.',
      },
    ],
    explanation:
      'El coste se optimiza donde se puede actuar: una función concreta, una ruta, un usuario. El agregado por proveedor informa de la factura, no de la decisión.',
    referenceId: 'ref-openai-tokens',
  },

  {
    id: 'pi-indirect-source',
    competencyId: 'prompt-injection-defense',
    difficulty: 2,
    prompt: '¿Por dónde entra una inyección indirecta de prompt?',
    options: [
      {
        id: 'a',
        text: 'En un documento o web que el sistema lee',
        correct: true,
        rationale:
          'Correcto: el ataque viaja en contenido que el agente trata como dato y acaba como instrucción.',
      },
      {
        id: 'b',
        text: 'En el prompt de sistema que escribes tú',
        correct: false,
        rationale:
          'Eso lo controlas tú. La inyección viene de lo que no escribes: el contenido externo.',
      },
      {
        id: 'c',
        text: 'En el código del agente, mediante parches',
        correct: false,
        rationale:
          'Eso sería otra clase de ataque. La inyección explota el canal de datos hacia el modelo.',
      },
    ],
    explanation:
      'La forma indirecta es la más frecuente en sistemas con recuperación: el texto recuperado contiene órdenes y el modelo no distingue el canal. Se defiende con permisos, no con advertencias.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'pi-tool-scope',
    competencyId: 'prompt-injection-defense',
    difficulty: 2,
    prompt: 'Un agente lee correos y tiene herramientas. ¿Qué mínimo aplicas?',
    options: [
      {
        id: 'a',
        text: 'Que no pueda enviar nada sin aprobación',
        correct: true,
        rationale:
          'Correcto: la combinación de leer contenido ajeno y actuar sin control es el escenario clásico.',
      },
      {
        id: 'b',
        text: 'Que no lea correos, para eliminar el riesgo',
        correct: false,
        rationale:
          'Elimina la función, no el riesgo: el agente no sirve para lo que se le pide.',
      },
      {
        id: 'c',
        text: 'Que use un modelo más grande y prudente',
        correct: false,
        rationale:
          'La prudencia no es una garantía. La barrera tiene que estar en las herramientas.',
      },
    ],
    explanation:
      'La defensa efectiva es el mínimo privilegio: leer y actuar en el mismo agente convierte una inyección en una cadena completa. La aprobación humana rompe esa cadena.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'pi-text-filter-limits',
    competencyId: 'prompt-injection-defense',
    difficulty: 3,
    prompt: '¿Por qué un filtro de texto no basta para detectar inyecciones?',
    options: [
      {
        id: 'a',
        text: 'El ataque cabe en lenguaje normal y legítimo',
        correct: true,
        rationale:
          'Correcto: «resume esto y envía el resultado a…» es texto corriente. No hay firma que buscar.',
      },
      {
        id: 'b',
        text: 'Porque los filtros de texto son demasiado lentos',
        correct: false,
        rationale:
          'La latencia es un problema distinto. Un filtro rápido tampoco detectaría el ataque.',
      },
      {
        id: 'c',
        text: 'Porque no existen filtros de texto fiables',
        correct: false,
        rationale:
          'Existen y sirven para otras cosas. Aquí el problema es que la forma del ataque es inocua.',
      },
    ],
    explanation:
      'La inyección no tiene una firma léxica: es una instrucción bien escrita dentro de un documento. Por eso se defiende con arquitectura —permisos, separación de canales, aprobación— y no con patrones.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'pi-red-team',
    competencyId: 'prompt-injection-defense',
    difficulty: 3,
    prompt: '¿Cómo compruebas que tu sistema resiste una inyección?',
    options: [
      {
        id: 'a',
        text: 'Intentando inyectar tú, con casos conocidos',
        correct: true,
        rationale:
          'Correcto: la resistencia se prueba atacando, no leyendo el prompt ni confiando en el proveedor.',
      },
      {
        id: 'b',
        text: 'Revisando el prompt de sistema y su redacción',
        correct: false,
        rationale:
          'La redacción ayuda y no demuestra nada. El ataque real llega por el contenido, no por tu prompt.',
      },
      {
        id: 'c',
        text: 'Confiar en las protecciones del proveedor del modelo',
        correct: false,
        rationale:
          'El proveedor protege su modelo, no tu arquitectura. Las herramientas y permisos son tuyos.',
      },
    ],
    explanation:
      'La inyección se verifica empíricamente: un conjunto de ataques conocidos —exfiltración, cambio de tarea, uso indebido de herramientas— que se ejecuta contra el sistema y se mide.',
    referenceId: 'ref-anthropic-system',
  },
];
