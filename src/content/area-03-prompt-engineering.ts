/**
 * Área 03 — Prompt y context engineering.
 *
 * Cinco competencias nuevas; `system-instructions-contract` ya estaba publicada.
 * Con esta tanda el área queda completa.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_03: readonly Lesson[] = [
  {
    competencyId: 'few-shot-examples',
    whatIs:
      'Dar ejemplos significa incluir pares de entrada y salida dentro del prompt para que el modelo imite el patrón. No cambia lo que el modelo sabe: cambia lo que ve en ese momento. Es la forma más rápida de fijar un formato que resulta difícil de describir con palabras.',
    problem:
      'Se usan ejemplos para tapar una instrucción ambigua, y entonces el modelo imita el patrón de los ejemplos en vez de entender la tarea. También se eligen ejemplos fáciles, que enseñan justo lo que no hacía falta.',
    internals: [
      'Los ejemplos ocupan contexto: cada uno resta espacio a los documentos y al historial.',
      'El modelo imita el sesgo de los ejemplos. Tres ejemplos de la misma clase enseñan que esa clase es la respuesta habitual.',
      'El orden influye: el último ejemplo tiende a pesar más en la salida.',
      'Un buen ejemplo es representativo del caso difícil, no del caso típico ya resuelto.',
    ],
    whenToUse: [
      'Cuando el formato de salida es difícil de describir pero fácil de mostrar.',
      'Cuando la tarea es repetitiva y el patrón se puede fijar con dos o tres casos.',
    ],
    whenNotToUse: [
      'No uses ejemplos para compensar una instrucción que no dice lo que quieres.',
      'No elijas todos los ejemplos de la misma clase: enseñarás un sesgo.',
    ],
    pitfalls: [
      {
        title: 'Ejemplos desequilibrados',
        detail:
          'Si todos los ejemplos responden «sí», el modelo aprenderá a responder «sí». El sesgo del conjunto se convierte en sesgo del sistema.',
      },
      {
        title: 'Ejemplos con datos reales',
        detail:
          'Un ejemplo se envía en cada llamada. Si contiene datos personales, se filtran tantas veces como llamadas haya.',
      },
    ],
    referenceIds: ['ref-anthropic-system', 'ref-openai-tokens'],
  },
  {
    competencyId: 'context-budgeting',
    whatIs:
      'La ventana de contexto es un presupuesto compartido: instrucciones, ejemplos, documentos, historial y respuesta compiten por el mismo espacio. Decidir qué entra y qué no es una decisión de ingeniería, no un detalle de formato.',
    problem:
      'El contexto se llena por acumulación —historial que crece, documentos «por si acaso»— y cuando ya no cabe lo importante, el sistema falla de forma silenciosa: responde con menos información de la que crees que le diste.',
    internals: [
      'Todo compite: cada sección que añades desplaza a otra, aunque no la borres explícitamente.',
      'El espacio de la respuesta también se reserva. Si no lo haces, el recorte se lo come y la salida se corta a mitad.',
      'Lo que queda en medio de un contexto muy largo tiende a pesar menos que el principio y el final.',
      'Recortar es una decisión de contenido: qué se tira y por qué. Truncar por longitud sin criterio tira lo que tocaba.',
    ],
    whenToUse: [
      'Reserva primero el espacio de la salida y reparte el resto con intención.',
      'Resume el historial cuando crece, en lugar de arrastrarlo entero.',
    ],
    whenNotToUse: [
      'No añadas documentos «por si acaso»: desplazan a los que sí hacen falta.',
      'No recortes por el final sin criterio: lo importante puede estar ahí.',
    ],
    pitfalls: [
      {
        title: 'Historial que crece sin límite',
        detail:
          'Cada turno añade contexto y resta espacio a lo demás. Sin resumen, la conversación acaba empujando fuera los documentos.',
      },
      {
        title: 'Confundir caber con servir',
        detail:
          'Que un documento quepa no significa que el modelo lo use bien. Un contexto enorme con la aguja en el medio es peor que uno corto y bien elegido.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
  {
    competencyId: 'structured-outputs',
    whatIs:
      'Pedir una salida estructurada es fijar un esquema —normalmente JSON— y tratar la respuesta como un contrato: si no cumple el esquema, la respuesta no es válida y se rechaza. El esquema no es una sugerencia de formato, es una puerta.',
    problem:
      'Se pide «devuelve JSON» y se parsea con expresiones regulares, sin validar. Funciona casi siempre, y ese «casi» rompe el pipeline en producción con la misma frecuencia con la que aparecen los casos raros.',
    internals: [
      'El esquema define campos, tipos y obligatoriedad. Lo que no está en el esquema no debería existir en la respuesta.',
      'Validar es obligatorio: el modelo puede devolver JSON sintácticamente válido y semánticamente imposible.',
      'Hay dos fallos distintos: de formato (no parsea) y de contenido (parsea y miente). Se tratan por separado.',
      'Un campo opcional es una invitación a que el modelo lo omita justo cuando importa.',
    ],
    whenToUse: [
      'Siempre que otro programa consuma la salida: el esquema es la frontera entre los dos.',
      'Con validación explícita y una respuesta definida para el caso inválido.',
    ],
    whenNotToUse: [
      'No confíes en «devuelve JSON» sin validar el resultado.',
      'No dejes todos los campos opcionales para que la validación pase siempre.',
    ],
    pitfalls: [
      {
        title: 'Parsear con expresiones regulares',
        detail:
          'Funciona hasta que el modelo añade una frase antes del JSON. Si hay esquema, se valida contra el esquema; si no, se asume el fallo.',
      },
      {
        title: 'Validar la forma y no el contenido',
        detail:
          'Un JSON válido puede traer un importe negativo o una fecha imposible. La forma la valida el esquema; el sentido, las reglas de negocio.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'prompt-evaluation',
    whatIs:
      'Evaluar un prompt es medirlo contra un conjunto fijo de casos con un criterio explícito, antes y después de cada cambio. Sin ese conjunto, comparar dos prompts es comparar impresiones.',
    problem:
      'Se cambia una instrucción, la salida del caso que se estaba mirando mejora, y se despliega. Lo que empeoró en los otros cuarenta casos no se ve porque nadie los ejecutó.',
    internals: [
      'El conjunto de casos es el activo: incluye los difíciles y los que ya fallaron alguna vez.',
      'El criterio tiene que ser explícito, o la evaluación vuelve a ser una opinión.',
      'Se compara con el mismo modelo y los mismos parámetros: si cambian dos cosas, no se sabe qué causó la diferencia.',
      'Los prompts son código: se versionan, y cada cambio se mide contra la versión anterior.',
    ],
    whenToUse: [
      'Antes de cambiar un prompt que ya está en producción.',
      'Cuando varias personas tocan el mismo prompt y hay que saber qué versión es mejor.',
    ],
    whenNotToUse: [
      'No juzgues un prompt con tres ejemplos elegidos a mano por quien lo escribió.',
      'No cambies instrucción y ejemplos a la vez: no podrás atribuir la mejora.',
    ],
    pitfalls: [
      {
        title: 'Evaluar solo con los casos fáciles',
        detail:
          'Un conjunto de casos que ya funcionan no distingue dos prompts buenos. Los casos difíciles son los que informan.',
      },
      {
        title: 'Cambiar varias cosas a la vez',
        detail:
          'Si mejoras dos cosas y empeoras una, el resultado neto oculta la regresión. Un cambio por medición.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'finetuning-vs-prompting',
    whatIs:
      'El prompt cambia lo que el modelo ve en el momento; el ajuste fino cambia los pesos con ejemplos. El primero es reversible y barato; el segundo produce un artefacto que hay que versionar, mantener y volver a entrenar cuando cambie el dominio.',
    problem:
      'Se propone ajuste fino para problemas que en realidad son de instrucción, de formato o de datos. Y se espera que añada conocimiento actualizado, que es justo lo que un modelo ajustado no garantiza.',
    internals: [
      'El ajuste fino necesita un dataset etiquetado: el trabajo de etiquetar aparece otra vez, y ahora es un activo a mantener.',
      'Enseña estilo, formato y tareas estrechas. No es una base de datos: no garantiza incorporar hechos nuevos.',
      'Para conocimiento que cambia —precios, catálogo, políticas— la recuperación en el momento es más fiable que reentrenar.',
      'Antes de ajustar, hay que agotar el prompt: es más barato y se revierte en un minuto.',
    ],
    whenToUse: [
      'Primero el prompt, medido contra el conjunto de casos.',
      'El ajuste fino, cuando el formato o el estilo es estable y el prompt ya no da más de sí.',
    ],
    whenNotToUse: [
      'No ajustes para que el modelo «sepa» datos que cambian: usa recuperación.',
      'No ajustes si no tienes forma de volver a entrenar cuando el proceso cambie.',
    ],
    pitfalls: [
      {
        title: 'Ajuste fino como base de conocimiento',
        detail:
          'Un modelo ajustado puede repetir un dato aprendido con seguridad y estar desactualizado. La confianza no avisa del error.',
      },
      {
        title: 'Olvidar el coste de mantenimiento',
        detail:
          'Cada cambio de proceso exige reetiquetar y reentrenar. Es un artefacto con dueño, no una configuración.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
];

export const ITEMS_AREA_03: readonly Item[] = [
  // ── few-shot-examples ───────────────────────────────────────────────────────
  {
    id: 'few-format-hard',
    competencyId: 'few-shot-examples',
    difficulty: 1,
    prompt: 'La salida tiene un formato raro que no consigues describir con palabras. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Mostrar dos o tres ejemplos entrada-salida',
        correct: true,
        rationale:
          'Correcto: un formato difícil de describir es fácil de mostrar. Para eso existen los ejemplos.',
      },
      {
        id: 'b',
        text: 'Subir la temperatura de generación',
        correct: false,
        rationale:
          'La temperatura añade variedad, y aquí lo que falta es precisión de formato, no variedad.',
      },
      {
        id: 'c',
        text: 'Escribir una instrucción mucho más larga',
        correct: false,
        rationale:
          'Más palabras no describen mejor un formato que no se sabe nombrar; suele añadir ruido.',
      },
    ],
    explanation:
      'Los ejemplos fijan patrones que cuesta verbalizar. Se eligen pocos, representativos y variados: dos o tres casos bien escogidos enseñan más que un párrafo de adjetivos.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'few-class-imbalance',
    competencyId: 'few-shot-examples',
    difficulty: 2,
    prompt: 'Pones tres ejemplos y los tres llevan la misma etiqueta. ¿Qué aprende el modelo?',
    options: [
      {
        id: 'a',
        text: 'Que esa etiqueta es la respuesta habitual',
        correct: true,
        rationale:
          'Correcto: el modelo imita el patrón de los ejemplos, incluido su desequilibrio entre clases.',
      },
      {
        id: 'b',
        text: 'Nada: con tres ejemplos no aprende',
        correct: false,
        rationale:
          'Aprende del contexto, no de los pesos. Tres ejemplos iguales fijan un sesgo claro.',
      },
      {
        id: 'c',
        text: 'A distinguir esa etiqueta de las demás',
        correct: false,
        rationale:
          'Para distinguir hacen falta ejemplos de las dos clases. Solo con una, no hay contraste.',
      },
    ],
    explanation:
      'El sesgo del conjunto de ejemplos se convierte en sesgo del sistema. Si el problema tiene clases desequilibradas, los ejemplos deben reflejarlo a propósito, no por descuido.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'few-order-matters',
    competencyId: 'few-shot-examples',
    difficulty: 2,
    prompt: '¿Por qué importa el orden en que pones los ejemplos?',
    options: [
      {
        id: 'a',
        text: 'El último tiende a pesar más en la salida',
        correct: true,
        rationale:
          'Correcto: la posición cambia la influencia. Ordenar al azar hace el comportamiento menos predecible.',
      },
      {
        id: 'b',
        text: 'No importa: el modelo los lee todos igual',
        correct: false,
        rationale:
          'Los lee todos, pero no les da el mismo peso. La posición influye en el resultado.',
      },
      {
        id: 'c',
        text: 'Solo afecta al coste de la llamada',
        correct: false,
        rationale:
          'El coste depende del número de tokens, no del orden. El efecto del orden es sobre la salida.',
      },
    ],
    explanation:
      'La posición de un ejemplo en el contexto cambia cuánto influye. Por eso el orden forma parte del diseño del prompt y no se deja al azar: se prueba y se fija.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'few-hides-ambiguity',
    competencyId: 'few-shot-examples',
    difficulty: 3,
    prompt: 'La instrucción es ambigua y añades ejemplos para aclararla. ¿Resuelve el problema?',
    options: [
      {
        id: 'a',
        text: 'No: los ejemplos disimulan la ambigüedad',
        correct: true,
        rationale:
          'Correcto: cubren los casos parecidos a los mostrados y fallan en los demás, sin avisar.',
      },
      {
        id: 'b',
        text: 'Sí: con ejemplos claros no hay ambigüedad',
        correct: false,
        rationale:
          'El ejemplo no define la regla, solo un caso. Fuera de su parecido, la ambigüedad sigue.',
      },
      {
        id: 'c',
        text: 'Sí, si se ponen al menos diez ejemplos',
        correct: false,
        rationale:
          'Diez ejemplos cubren diez casos. La instrucción sigue sin decir qué hacer con el undécimo.',
      },
    ],
    explanation:
      'Los ejemplos son una muestra, no una definición. Si la instrucción no expresa el criterio, el modelo generaliza desde los ejemplos y falla en los casos que no se parecen a ninguno.',
    referenceId: 'ref-anthropic-system',
  },

  // ── context-budgeting ───────────────────────────────────────────────────────
  {
    id: 'ctx-what-competes',
    competencyId: 'context-budgeting',
    difficulty: 1,
    prompt: '¿Qué compite por el espacio de la ventana de contexto?',
    options: [
      {
        id: 'a',
        text: 'Instrucciones, ejemplos, documentos, historial y salida',
        correct: true,
        rationale:
          'Correcto: todo eso cabe en el mismo presupuesto. Lo que entra por un lado sale por otro.',
      },
      {
        id: 'b',
        text: 'Solo el texto que escribes como prompt',
        correct: false,
        rationale:
          'Olvida la salida, el historial y los documentos añadidos, que también consumen ventana.',
      },
      {
        id: 'c',
        text: 'Solo el historial de la conversación',
        correct: false,
        rationale:
          'El historial es una parte. Las instrucciones y los documentos también ocupan espacio.',
      },
    ],
    explanation:
      'La ventana es un presupuesto único. Cada sección que añades desplaza a las demás, aunque no borres nada: por eso elegir qué entra es una decisión de ingeniería.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctx-reserve-output',
    competencyId: 'context-budgeting',
    difficulty: 2,
    prompt: 'Antes de recortar contenido, ¿qué espacio hay que reservar?',
    options: [
      {
        id: 'a',
        text: 'El de la respuesta que vas a generar',
        correct: true,
        rationale:
          'Correcto: si no se reserva, el recorte se lo come y la salida se corta a mitad de frase.',
      },
      {
        id: 'b',
        text: 'El del historial completo de la sesión',
        correct: false,
        rationale:
          'El historial es candidato a recortar. Reservarlo entero deja sin sitio a lo demás.',
      },
      {
        id: 'c',
        text: 'El de todos los ejemplos disponibles',
        correct: false,
        rationale:
          'Los ejemplos se eligen en función del espacio que sobra, no al contrario.',
      },
    ],
    explanation:
      'La salida ocupa el mismo presupuesto que la entrada. Reservarla primero evita el fallo más común: respuestas truncadas justo cuando el contexto iba lleno.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctx-middle-of-long',
    competencyId: 'context-budgeting',
    difficulty: 2,
    prompt: 'La respuesta está en la página 25 de un documento de 50. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Que se pierda entre el resto del texto',
        correct: true,
        rationale:
          'Correcto: en contextos largos, lo que queda en el medio tiende a pesar menos que los extremos.',
      },
      {
        id: 'b',
        text: 'Que cueste más caro por estar en el centro',
        correct: false,
        rationale:
          'El coste depende del número de tokens, no de su posición en el documento.',
      },
      {
        id: 'c',
        text: 'Ninguno: si cabe, el modelo lo lee todo',
        correct: false,
        rationale:
          'Que quepa no garantiza que se use. Un contexto enorme con el dato en medio rinde peor.',
      },
    ],
    explanation:
      'Más contexto no es siempre mejor contexto. Si sabes qué fragmento importa, recupéralo y colócalo cerca de la pregunta en vez de confiar en que el modelo lo encuentre solo.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctx-history-growth',
    competencyId: 'context-budgeting',
    difficulty: 3,
    prompt: 'La conversación crece y ya no cabe el documento que hay que analizar. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Resumir el historial y fijar lo esencial',
        correct: true,
        rationale:
          'Correcto: se conserva el estado en pocas palabras y se libera espacio para lo que importa ahora.',
      },
      {
        id: 'b',
        text: 'Borrar todo el historial de la conversación',
        correct: false,
        rationale:
          'Pierdes el contexto acumulado: decisiones, nombres y restricciones que el usuario ya dio.',
      },
      {
        id: 'c',
        text: 'Subir el límite de la ventana del modelo',
        correct: false,
        rationale:
          'Cambiar de modelo no resuelve el hábito. El historial vuelve a crecer y el problema se repite.',
      },
    ],
    explanation:
      'Un historial resumido conserva lo que la tarea necesita y suelta lo que ya no aporta. Borrar es tirar información útil; ampliar la ventana solo retrasa el problema.',
    referenceId: 'ref-openai-tokens',
  },

  // ── structured-outputs ──────────────────────────────────────────────────────
  {
    id: 'so-program-consumes',
    competencyId: 'structured-outputs',
    difficulty: 1,
    prompt: 'Un programa va a consumir la salida del modelo. ¿Qué le pides?',
    options: [
      {
        id: 'a',
        text: 'JSON conforme a un esquema y validado',
        correct: true,
        rationale:
          'Correcto: el esquema es el contrato entre el modelo y el programa que lo consume.',
      },
      {
        id: 'b',
        text: 'Texto libre y lo parseas con expresiones regulares',
        correct: false,
        rationale:
          'Funciona hasta que el modelo añade una frase. Con esquema, el fallo se detecta, no se adivina.',
      },
      {
        id: 'c',
        text: 'Markdown, que es más fácil de leer',
        correct: false,
        rationale:
          'Legible para humanos, frágil para programas. Aquí el consumidor no es una persona.',
      },
    ],
    explanation:
      'Cuando otro programa consume la salida, la forma importa tanto como el contenido. Fijar un esquema y validarlo convierte un texto impredecible en una interfaz estable.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'so-valid-json-enough',
    competencyId: 'structured-outputs',
    difficulty: 2,
    prompt: 'El modelo devuelve JSON sintácticamente válido. ¿Es suficiente?',
    options: [
      {
        id: 'a',
        text: 'No: hay que validar esquema y contenido',
        correct: true,
        rationale:
          'Correcto: puede ser JSON válido con campos que faltan, tipos cambiados o valores imposibles.',
      },
      {
        id: 'b',
        text: 'Sí: si parsea, la respuesta es correcta',
        correct: false,
        rationale:
          'Que parsea solo dice que es JSON. No dice que tenga los campos ni los valores esperados.',
      },
      {
        id: 'c',
        text: 'Sí, si la respuesta es corta',
        correct: false,
        rationale:
          'La longitud no tiene relación con la validez semántica. Una respuesta corta puede estar mal.',
      },
    ],
    explanation:
      'Hay dos fallos distintos: de formato y de contenido. El esquema atrapa el primero; las reglas de negocio, el segundo. Validar solo la forma deja pasar datos imposibles.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'so-unexpected-field',
    competencyId: 'structured-outputs',
    difficulty: 2,
    prompt: 'El modelo inventa un campo que no estaba en el esquema. ¿Qué has perdido?',
    options: [
      {
        id: 'a',
        text: 'El contrato: el consumidor no lo espera',
        correct: true,
        rationale:
          'Correcto: un campo fuera del esquema rompe la frontera o se ignora en silencio.',
      },
      {
        id: 'b',
        text: 'Nada: más información siempre ayuda',
        correct: false,
        rationale:
          'Información no acordada es ruido. Si el contrato no la contempla, no se puede usar ni validar.',
      },
      {
        id: 'c',
        text: 'Solo tokens de la respuesta',
        correct: false,
        rationale:
          'El coste es lo de menos. El problema es que el contrato deja de ser fiable.',
      },
    ],
    explanation:
      'El esquema es una frontera: lo que no está en él no debería existir. Si el modelo se siente libre de añadir campos, nada impide que falten los que sí importan.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'so-all-optional',
    competencyId: 'structured-outputs',
    difficulty: 3,
    prompt: 'Pones todos los campos como opcionales para que la validación pase siempre. ¿Qué pasa?',
    options: [
      {
        id: 'a',
        text: 'El modelo puede omitirlos y aun así validar',
        correct: true,
        rationale:
          'Correcto: la validación pasa con un objeto vacío. El esquema deja de proteger nada.',
      },
      {
        id: 'b',
        text: 'Es más seguro: nunca falla la validación',
        correct: false,
        rationale:
          'No fallar no es un logro si el resultado es inútil. Un contrato laxo no es un contrato.',
      },
      {
        id: 'c',
        text: 'Mejora la calidad de la extracción',
        correct: false,
        rationale:
          'La calidad no cambia por declarar opcional lo que es necesario; solo cambia lo que se detecta.',
      },
    ],
    explanation:
      'Un campo obligatorio declara qué necesita el consumidor para funcionar. Rebajarlo a opcional para evitar errores de validación es mover el fallo más adelante, donde cuesta más.',
    referenceId: 'ref-anthropic-system',
  },

  // ── prompt-evaluation ───────────────────────────────────────────────────────
  {
    id: 'pe-how-to-compare',
    competencyId: 'prompt-evaluation',
    difficulty: 1,
    prompt: '¿Cómo decides si un prompt nuevo es mejor que el anterior?',
    options: [
      {
        id: 'a',
        text: 'Con casos fijos y criterio, antes y después',
        correct: true,
        rationale:
          'Correcto: sin una referencia fija, comparar dos prompts es comparar impresiones del momento.',
      },
      {
        id: 'b',
        text: 'Leyendo las salidas del caso que te importa',
        correct: false,
        rationale:
          'Un caso no representa el conjunto. Mejora ese y puedes empeorar los demás sin verlo.',
      },
      {
        id: 'c',
        text: 'Escribiendo un prompt más largo y detallado',
        correct: false,
        rationale:
          'La longitud no es calidad. Un prompt largo puede ser peor y además cuesta más.',
      },
    ],
    explanation:
      'Evaluar es comparar contra una referencia estable. El conjunto de casos y el criterio son el activo que permite saber si un cambio mejora o solo cambia.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pe-detect-regression',
    competencyId: 'prompt-evaluation',
    difficulty: 2,
    prompt: 'Cambias un prompt para arreglar un caso y rompes otros diez. ¿Cómo te enteras?',
    options: [
      {
        id: 'a',
        text: 'Ejecutando el conjunto completo de casos',
        correct: true,
        rationale:
          'Correcto: la regresión solo aparece si se miran los casos que no estaban en la cabeza de quien cambió.',
      },
      {
        id: 'b',
        text: 'Probando otra vez el caso que querías arreglar',
        correct: false,
        rationale:
          'Ese caso ya lo tienes en la cabeza. Los diez rotos son justo los que no estás mirando.',
      },
      {
        id: 'c',
        text: 'Bajando la temperatura a cero',
        correct: false,
        rationale:
          'Reduce la variación, no detecta regresiones. El cambio de instrucción sigue ahí.',
      },
    ],
    explanation:
      'Un cambio de prompt es un cambio de código sin compilador. El conjunto de casos hace de compilador: si no se ejecuta entero, la regresión llega a producción.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pe-which-cases',
    competencyId: 'prompt-evaluation',
    difficulty: 2,
    prompt: '¿Qué casos metes en el conjunto de evaluación?',
    options: [
      {
        id: 'a',
        text: 'Los difíciles, los representativos y los que fallaron',
        correct: true,
        rationale:
          'Correcto: un conjunto de casos que ya funcionan no distingue dos prompts buenos.',
      },
      {
        id: 'b',
        text: 'Los que ya funcionan, para ver que no empeoran',
        correct: false,
        rationale:
          'Sirven como red de seguridad, pero sin casos difíciles el conjunto no informa de la calidad.',
      },
      {
        id: 'c',
        text: 'Solo los casos nuevos que van apareciendo',
        correct: false,
        rationale:
          'Sin base estable no hay comparación entre versiones: cada evaluación mediría cosas distintas.',
      },
    ],
    explanation:
      'El conjunto de evaluación debe contener los bordes: los casos raros, los ambiguos y los que ya fallaron. Ahí es donde dos prompts se diferencian de verdad.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'pe-one-change',
    competencyId: 'prompt-evaluation',
    difficulty: 3,
    prompt: 'Cambias la instrucción y los ejemplos en la misma iteración. ¿Qué problema hay?',
    options: [
      {
        id: 'a',
        text: 'No sabrás cuál de los dos causó la mejora',
        correct: true,
        rationale:
          'Correcto: dos cambios a la vez impiden atribuir el resultado. Si empeora, tampoco sabes qué deshacer.',
      },
      {
        id: 'b',
        text: 'Ninguno: cambiar más cosas acelera la mejora',
        correct: false,
        rationale:
          'Acelera el cambio, no el aprendizaje. Sin atribución, se avanza a ciegas y se acumula deuda.',
      },
      {
        id: 'c',
        text: 'Solo gastas más tokens en la evaluación',
        correct: false,
        rationale:
          'El coste es lo de menos. El problema es que la comparación deja de ser informativa.',
      },
    ],
    explanation:
      'Un cambio por medición. Si se mueven dos piezas a la vez, el resultado neto puede ocultar que una mejoró y la otra empeoró en la misma proporción.',
    referenceId: 'ref-rules-ml',
  },

  // ── finetuning-vs-prompting ─────────────────────────────────────────────────
  {
    id: 'ft-first-step',
    competencyId: 'finetuning-vs-prompting',
    difficulty: 1,
    prompt: 'El modelo no da el formato que quieres. ¿Qué se prueba primero?',
    options: [
      {
        id: 'a',
        text: 'Ajustar el prompt y medirlo',
        correct: true,
        rationale:
          'Correcto: es barato, reversible y resuelve la mayoría de los problemas de formato.',
      },
      {
        id: 'b',
        text: 'Ajuste fino con cien ejemplos',
        correct: false,
        rationale:
          'Es la opción más cara para un problema que probablemente se resuelve con instrucciones claras.',
      },
      {
        id: 'c',
        text: 'Cambiar a un modelo más grande',
        correct: false,
        rationale:
          'Más capacidad no arregla una instrucción que no dice lo que quieres. Cuesta más y puede no cambiar nada.',
      },
    ],
    explanation:
      'El prompt se revierte en un minuto; el ajuste fino deja un artefacto que hay que mantener. Se agota lo barato antes de comprometerse con lo caro.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ft-knowledge-changes',
    competencyId: 'finetuning-vs-prompting',
    difficulty: 2,
    prompt: 'El asistente debe conocer los precios de hoy. ¿Es un caso de ajuste fino?',
    options: [
      {
        id: 'a',
        text: 'No: los precios cambian; usa recuperación',
        correct: true,
        rationale:
          'Correcto: lo que cambia se recupera en el momento. Ajustar obligaría a reentrenar cada vez.',
      },
      {
        id: 'b',
        text: 'Sí: es la forma más fiable de que los sepa',
        correct: false,
        rationale:
          'El modelo ajustado repetiría el precio con seguridad, incluido el desactualizado.',
      },
      {
        id: 'c',
        text: 'Sí, si se entrena con cien precios actuales',
        correct: false,
        rationale:
          'Cien precios de hoy son cien precios de ayer mañana. El problema no es la cantidad.',
      },
    ],
    explanation:
      'El ajuste fino no es una base de datos. Para datos que cambian, la recuperación en el momento es más fiable y se actualiza sin reentrenar.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ft-style',
    competencyId: 'finetuning-vs-prompting',
    difficulty: 2,
    prompt: 'Quieres que el asistente escriba con el estilo de la empresa. ¿Qué opción valoras?',
    options: [
      {
        id: 'a',
        text: 'Ejemplos en el prompt, o ajuste si el estilo es estable',
        correct: true,
        rationale:
          'Correcto: el estilo se puede mostrar con ejemplos. El ajuste se reserva para cuando es fijo.',
      },
      {
        id: 'b',
        text: 'Ajuste fino siempre, es la solución correcta',
        correct: false,
        rationale:
          'Es una solución, no la primera. Con ejemplos se consigue mucho antes y sin mantener un modelo.',
      },
      {
        id: 'c',
        text: 'Un modelo más grande con el mismo prompt',
        correct: false,
        rationale:
          'El tamaño no enseña estilo. Sin ejemplos ni instrucción de tono, el estilo no aparece.',
      },
    ],
    explanation:
      'El estilo es un buen candidato a ajuste fino cuando es estable, pero se empieza mostrándolo. Si cambia a menudo, un modelo ajustado se queda viejo igual que una regla escrita a mano.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ft-maintenance-cost',
    competencyId: 'finetuning-vs-prompting',
    difficulty: 3,
    prompt: 'El proceso de negocio cambia. ¿Qué implica haber elegido ajuste fino?',
    options: [
      {
        id: 'a',
        text: 'Reetiquetar y reentrenar: es un artefacto',
        correct: true,
        rationale:
          'Correcto: hay que actualizar los datos y volver a entrenar, con su validación y su despliegue.',
      },
      {
        id: 'b',
        text: 'Nada: el modelo se adapta solo al cambio',
        correct: false,
        rationale:
          'Los pesos no se actualizan con el uso. Un proceso nuevo no está en un modelo entrenado con el viejo.',
      },
      {
        id: 'c',
        text: 'Solo el coste de haberlo entrenado una vez',
        correct: false,
        rationale:
          'Ese es el coste inicial. El mantenimiento es recurrente y suele ser la parte que se olvida.',
      },
    ],
    explanation:
      'Un modelo ajustado es un artefacto con dueño y ciclo de vida. Elegirlo es aceptar que cada cambio de proceso implica datos nuevos, validación y despliegue.',
    referenceId: 'ref-rules-ml',
  },
];
