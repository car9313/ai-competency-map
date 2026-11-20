/**
 * Área 02 — IA generativa y LLMs.
 *
 * Cinco competencias nuevas; `tokens-and-context-window` ya estaba publicada en la fase 1.
 * Con esta tanda el área queda completa.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_02: readonly Lesson[] = [
  {
    competencyId: 'tokenization-mechanics',
    whatIs:
      'Antes de calcular nada, el texto se parte en tokens con un vocabulario aprendido de un corpus. Un token no es un carácter ni una palabra: es un fragmento frecuente. El mismo texto cuesta distinto según el idioma, el formato y el modelo.',
    problem:
      'Se estiman presupuestos y costes contando palabras o caracteres. El error no es pequeño y no es aleatorio: crece justo en los casos que importan, como español, JSON, código y números sueltos.',
    internals: [
      'El vocabulario se construye con los fragmentos más frecuentes del corpus de entrenamiento, así que está desequilibrado hacia el inglés.',
      'Una palabra rara se parte en trozos: cuanto menos frecuente, más tokens consume.',
      'Los dígitos, las llaves y las comillas se fragmentan con facilidad, y por eso un JSON ocupa más de lo que sugiere su tamaño.',
      'El espacio forma parte del token: «hola» y « hola» pueden ser cosas distintas para el tokenizador.',
    ],
    whenToUse: [
      'Para estimar coste, latencia y límites de contexto de un modelo concreto.',
      'Para decidir el formato de un payload: mismo contenido, distinto coste según cómo se serialice.',
    ],
    whenNotToUse: [
      'No reutilices un conteo hecho con el tokenizador de otro modelo: cada vocabulario es distinto.',
      'No estimes con «una palabra, un token»: en español el error es sistemático y grande.',
    ],
    pitfalls: [
      {
        title: 'Contar con el tokenizador de otro modelo',
        detail:
          'Los conteos no son portables. Cambiar de proveedor invalida cualquier presupuesto que se haya calculado con el anterior.',
      },
      {
        title: 'Suponer que el español cuesta como el inglés',
        detail:
          'El vocabulario está entrenado mayoritariamente con inglés, así que el mismo contenido en español suele ocupar más tokens.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
  {
    competencyId: 'attention-and-transformers',
    whatIs:
      'Un transformer procesa el contexto con atención: cada posición pondera a las demás para decidir qué importa. Después genera la respuesta un token cada vez, alimentándose de lo que ya escribió. Es autorregresivo: no revisa, continúa.',
    problem:
      'Se habla del modelo como si «entendiera» o «recordara». No recuerda: cada llamada ve solo y exclusivamente el contexto que le envías. Y no revisa lo que dijo: lo continúa, incluyendo sus errores.',
    internals: [
      'La atención calcula, para cada token, cuánto pesa cada uno de los otros. De ahí sale el contexto efectivo.',
      'La generación es secuencial: cada token depende de los anteriores, incluidos los que inventó él mismo.',
      'No hay memoria entre llamadas. Si algo no está en el contexto, no existe para el modelo.',
      'El coste de atención crece más rápido que la longitud del contexto, y por eso el contexto largo no sale gratis.',
    ],
    whenToUse: [
      'Diseña cada llamada suponiendo que no recuerda nada: el estado va en el contexto, explícito.',
      'Asume que un error temprano arrastra a los siguientes; por eso importan los pasos cortos y verificables.',
    ],
    whenNotToUse: [
      'No esperes que corrija una salida anterior dentro de la misma respuesta: la está continuando, no revisando.',
      'No cuentes con que «recuerde» conversaciones previas sin volver a enviarlas.',
    ],
    pitfalls: [
      {
        title: 'Confiar en la memoria de conversación',
        detail:
          'No existe memoria: hay historial reenviado. Si se recorta para ahorrar contexto, el modelo pierde exactamente lo recortado.',
      },
      {
        title: 'Esperar razonamiento sin pasos',
        detail:
          'El modelo predice el siguiente token, no ejecuta un plan. Si la tarea tiene varios pasos, se le dan los pasos.',
      },
    ],
    referenceIds: ['ref-attention'],
  },
  {
    competencyId: 'embeddings-and-vectors',
    whatIs:
      'Un embedding convierte un texto en un vector de números, de forma que textos usados en contextos parecidos quedan cerca. La distancia entre vectores mide parecido de contexto, no corrección ni utilidad.',
    problem:
      'La similitud se trata como si fuera verdad. Que un fragmento esté cerca de la pregunta no significa que la responda: puede hablar del mismo tema y no contener la respuesta.',
    internals: [
      'El vector resume el uso del texto en el corpus, no su significado en el sentido estricto.',
      'La comparación habitual es el coseno, que mide el ángulo entre vectores y no su longitud.',
      'Cada modelo produce su propio espacio: los vectores de dos modelos distintos no son comparables.',
      'La similitud ordena candidatos. Decidir si el candidato sirve exige algo más que la distancia.',
    ],
    whenToUse: [
      'Para recuperar candidatos, agrupar, deduplicar o buscar por parecido.',
      'Para comparar solo vectores generados por el mismo modelo y con el mismo preprocesado.',
    ],
    whenNotToUse: [
      'No uses la similitud como prueba de que un texto responde a la pregunta.',
      'No mezcles vectores de modelos distintos en el mismo índice.',
    ],
    pitfalls: [
      {
        title: 'Cambiar de modelo y reutilizar el índice',
        detail:
          'Si cambias el modelo de embeddings, los vectores existentes están en otra geometría. Hay que reindexar todo.',
      },
      {
        title: 'Confundir parecido con relevancia',
        detail:
          'Un fragmento muy parecido puede no contener la respuesta. La similitud propone; la lectura decide.',
      },
    ],
    referenceIds: ['ref-attention'],
  },
  {
    competencyId: 'inference-latency-cost',
    whatIs:
      'Cada llamada tiene dos costes distintos: los tokens que entran y los que salen, que además se facturan distinto. La latencia tampoco es una sola: procesar la entrada es paralelo y rápido; generar la salida es secuencial y lento.',
    problem:
      'Los presupuestos se calculan por petición sin contar la salida, y las latencias se miden con la media. Con eso, el sistema sorprende en producción justo en el percentil que sufre el usuario.',
    internals: [
      'La entrada se procesa de una vez; la salida se genera token a token. Por eso la longitud de la respuesta domina la espera.',
      'El coste de salida por token suele ser mayor que el de entrada: la relación no es 1:1.',
      'La misma entrada no da la misma salida: el muestreo introduce variación, y con él cambia la longitud y el coste.',
      'La latencia que importa es el percentil alto: la media esconde a quien espera el triple.',
    ],
    whenToUse: [
      'Presupuesta entrada y salida por separado, con la salida estimada por su longitud típica.',
      'Vigila el p95 y el p99, no la media, cuando hay personas esperando.',
    ],
    whenNotToUse: [
      'No compares modelos por número de parámetros: se comparan por coste, latencia y calidad en tu caso.',
      'No prometas una latencia basándote en una media medida en tu máquina.',
    ],
    pitfalls: [
      {
        title: 'Ignorar el coste de la salida',
        detail:
          'Una respuesta el doble de larga no cuesta el doble de todo: cuesta más, porque la salida es la parte cara.',
      },
      {
        title: 'Medir solo la media',
        detail:
          'Una media de 800 ms puede convivir con un p95 de 4 s. El usuario no vive la media.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
  {
    competencyId: 'generation-controls',
    whatIs:
      'Los parámetros de muestreo deciden cómo se elige el siguiente token: temperatura (cuánto se aplana la distribución), top-p (cuánto se recorta a los candidatos más probables), penalizaciones de repetición y secuencias de parada.',
    problem:
      'Se copian valores por defecto o se suben «para que sea más creativo» en tareas donde la creatividad es un defecto: extraer campos de una factura no mejora con variación.',
    internals: [
      'La temperatura no cambia lo que el modelo sabe: cambia cuánto se arriesga al elegir.',
      'Top-p corta la cola de candidatos improbables; con valores bajos, el modelo elige entre pocas opciones.',
      'Las secuencias de parada cortan la generación en un marcador, no mejoran su calidad.',
      'Temperatura cero reduce la variación, pero no garantiza reproducibilidad exacta entre ejecuciones.',
    ],
    whenToUse: [
      'Temperatura baja para extracción, clasificación y cualquier salida que se vaya a validar.',
      'Temperatura alta solo para ideación, donde varias respuestas distintas son el objetivo.',
    ],
    whenNotToUse: [
      'No uses temperatura alta con salidas estructuradas: multiplica los fallos de formato.',
      'No confíes en temperatura cero para auditoría: no es una garantía de determinismo.',
    ],
    pitfalls: [
      {
        title: 'Subir la temperatura para «mejorar» la calidad',
        detail:
          'Añade variedad, no acierto. En una tarea con respuesta correcta, la variedad es error.',
      },
      {
        title: 'Creer que temperatura cero es determinista',
        detail:
          'Reduce la variación, pero el hardware y el orden de operaciones pueden cambiar el resultado. Si necesitas reproducibilidad, verifícala.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
];

export const ITEMS_AREA_02: readonly Item[] = [
  // ── tokenization-mechanics ──────────────────────────────────────────────────
  {
    id: 'tok-words-vs-tokens',
    competencyId: 'tokenization-mechanics',
    difficulty: 1,
    prompt: 'Una factura redactada en español tiene 1 000 palabras. ¿Cuántos tokens son?',
    options: [
      {
        id: 'a',
        text: 'Más de 1 000, y depende del tokenizador',
        correct: true,
        rationale:
          'Correcto: el vocabulario está sesgado al inglés, así que el español suele gastar más de un token por palabra.',
      },
      {
        id: 'b',
        text: 'Exactamente 1 000, una palabra es un token',
        correct: false,
        rationale:
          'Confunde palabra con token. El token es un fragmento frecuente del corpus, no una unidad lingüística.',
      },
      {
        id: 'c',
        text: 'Menos de 1 000, porque hay palabras cortas',
        correct: false,
        rationale:
          'El tamaño de la palabra no decide: decide si esa palabra estaba bien representada en el vocabulario.',
      },
    ],
    explanation:
      'El tokenizador parte el texto en fragmentos frecuentes de su corpus. En español, con menos presencia en ese corpus, muchas palabras se rompen en trozos y el conteo supera al de palabras.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'tok-json-cost',
    competencyId: 'tokenization-mechanics',
    difficulty: 2,
    prompt: 'Un JSON de 2 KB consume más tokens de lo que su tamaño sugiere. ¿Por qué?',
    options: [
      {
        id: 'a',
        text: 'Llaves, comillas y dígitos se fragmentan',
        correct: true,
        rationale:
          'Correcto: la puntuación y los números se parten en varios tokens, así que el formato cuesta más que el contenido.',
      },
      {
        id: 'b',
        text: 'Porque el JSON ocupa más bytes que el texto',
        correct: false,
        rationale:
          'El tamaño en bytes no explica el conteo: dos textos del mismo tamaño pueden costar muy distinto.',
      },
      {
        id: 'c',
        text: 'Porque el modelo lee el JSON dos veces',
        correct: false,
        rationale:
          'El modelo no relee: procesa la entrada una vez. El coste viene de cómo se fragmenta el texto.',
      },
    ],
    explanation:
      'La estructura de un JSON está llena de símbolos poco frecuentes que el tokenizador parte en trozos. Mismo contenido, distinto coste según cómo se serialice: por eso conviene elegir el formato pensando en el tokenizador.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'tok-model-change',
    competencyId: 'tokenization-mechanics',
    difficulty: 2,
    prompt: 'Cambias de proveedor de modelo. ¿Qué pasa con el conteo de tokens que tenías?',
    options: [
      {
        id: 'a',
        text: 'Hay que recontar con el tokenizador nuevo',
        correct: true,
        rationale:
          'Correcto: cada modelo tiene su vocabulario. El mismo texto puede costar bastante más o menos.',
      },
      {
        id: 'b',
        text: 'Sigue valiendo: un token es un token',
        correct: false,
        rationale:
          'No existe un token universal. El token es la unidad del vocabulario de cada modelo concreto.',
      },
      {
        id: 'c',
        text: 'Solo cambia si el texto está en inglés',
        correct: false,
        rationale:
          'Cambia siempre, porque cambia el vocabulario. El idioma afecta a la magnitud, no a si cambia.',
      },
    ],
    explanation:
      'Los conteos no son portables entre modelos. Cualquier presupuesto de contexto o de coste calculado con un tokenizador queda invalidado al cambiar de proveedor, y hay que volver a medirlo.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'tok-whitespace',
    competencyId: 'tokenization-mechanics',
    difficulty: 3,
    prompt: '¿Por qué «hola» y « hola» (con espacio delante) pueden ser tokens distintos?',
    options: [
      {
        id: 'a',
        text: 'El espacio forma parte del token aprendido',
        correct: true,
        rationale:
          'Correcto: el vocabulario se aprende sobre texto con espacios, así que la versión con espacio es otro fragmento.',
      },
      {
        id: 'b',
        text: 'Es un fallo del tokenizador que se corrige',
        correct: false,
        rationale:
          'No es un fallo: es cómo se construyó el vocabulario. El espacio aporta información de frontera de palabra.',
      },
      {
        id: 'c',
        text: 'Solo ocurre en textos en inglés',
        correct: false,
        rationale:
          'Ocurre en cualquier idioma cuyos tokens incluyan el espacio inicial, que es lo habitual.',
      },
    ],
    explanation:
      'El tokenizador aprende fragmentos del texto tal cual aparece, espacios incluidos. Por eso el espacio inicial puede cambiar el token, y con él el conteo y hasta el comportamiento del modelo.',
    referenceId: 'ref-openai-tokens',
  },

  // ── attention-and-transformers ──────────────────────────────────────────────
  {
    id: 'att-next-token',
    competencyId: 'attention-and-transformers',
    difficulty: 1,
    prompt: '¿Qué hace exactamente el modelo en cada paso de la generación?',
    options: [
      {
        id: 'a',
        text: 'Elige el siguiente token según el contexto',
        correct: true,
        rationale:
          'Correcto: es autorregresivo. Cada token se elige a partir de lo que ya hay, incluido lo que escribió él.',
      },
      {
        id: 'b',
        text: 'Reescribe la respuesta completa cada vez',
        correct: false,
        rationale:
          'No reescribe: continúa. Lo que ya está escrito no se revisa, se toma como contexto.',
      },
      {
        id: 'c',
        text: 'Consulta una base de datos de respuestas',
        correct: false,
        rationale:
          'No hay base de datos de respuestas. Todo lo que sabe está en los pesos del modelo y en el contexto.',
      },
    ],
    explanation:
      'La generación avanza un token cada vez, y cada uno depende de los anteriores. Eso explica tanto la fluidez como el arrastre de errores: un token equivocado condiciona todos los siguientes.',
    referenceId: 'ref-attention',
  },
  {
    id: 'att-no-memory',
    competencyId: 'attention-and-transformers',
    difficulty: 2,
    prompt: 'Haces una llamada nueva sin enviar el historial. ¿Qué sabe el modelo de la anterior?',
    options: [
      {
        id: 'a',
        text: 'Nada: solo ve lo que va en el contexto',
        correct: true,
        rationale:
          'Correcto: no hay memoria entre llamadas. Si algo no se reenvía, para el modelo no existe.',
      },
      {
        id: 'b',
        text: 'Recuerda el resumen de la conversación',
        correct: false,
        rationale:
          'Atribuye memoria que no existe. El resumen solo funciona si alguien lo vuelve a enviar.',
      },
      {
        id: 'c',
        text: 'Aprende de cada llamada para la siguiente',
        correct: false,
        rationale:
          'Los pesos no cambian al usarlo. El modelo no se ajusta con tus llamadas.',
      },
    ],
    explanation:
      'La memoria de conversación es un efecto del historial reenviado, no una propiedad del modelo. Cuando se recorta el contexto para ahorrar, el modelo pierde exactamente lo recortado.',
    referenceId: 'ref-attention',
  },
  {
    id: 'att-context-cost',
    competencyId: 'attention-and-transformers',
    difficulty: 2,
    prompt: 'Duplicas la longitud del contexto. ¿Qué ocurre con el coste de la atención?',
    options: [
      {
        id: 'a',
        text: 'Crece más que el doble',
        correct: true,
        rationale:
          'Correcto: cada token compara con todos los demás. Al duplicar posiciones, las comparaciones se cuadruplican.',
      },
      {
        id: 'b',
        text: 'Se mantiene: el contexto es una lista',
        correct: false,
        rationale:
          'No es una lista que se recorre una vez: cada posición pondera a todas las demás.',
      },
      {
        id: 'c',
        text: 'Se reduce porque hay más información',
        correct: false,
        rationale:
          'Más información no abarata el cálculo. El coste de atención crece con el cuadrado de la longitud.',
      },
    ],
    explanation:
      'La atención compara cada token con todos los demás, así que el coste crece de forma cuadrática con la longitud. Por eso el contexto largo no es gratis y conviene enviar solo lo que se necesita.',
    referenceId: 'ref-attention',
  },
  {
    id: 'att-error-compound',
    competencyId: 'attention-and-transformers',
    difficulty: 3,
    prompt: 'El modelo comete un error en el primer párrafo de su propia respuesta. ¿Qué pasa después?',
    options: [
      {
        id: 'a',
        text: 'Lo toma como contexto y lo arrastra',
        correct: true,
        rationale:
          'Correcto: lo ya escrito se convierte en contexto. Un error temprano condiciona el resto de la salida.',
      },
      {
        id: 'b',
        text: 'Lo detecta y lo corrige al final',
        correct: false,
        rationale:
          'No revisa lo escrito. No hay un paso de relectura: cada token continúa la secuencia.',
      },
      {
        id: 'c',
        text: 'Se detiene al detectar la inconsistencia',
        correct: false,
        rationale:
          'No hay detección de inconsistencias. La generación sigue salvo que una condición de parada lo corte.',
      },
    ],
    explanation:
      'Cada token se apoya en los anteriores, incluidos los erróneos. Por eso las tareas largas se parten en pasos cortos y verificables: un fallo temprano se propaga y es más caro de detectar al final.',
    referenceId: 'ref-attention',
  },

  // ── embeddings-and-vectors ──────────────────────────────────────────────────
  {
    id: 'emb-what-is',
    competencyId: 'embeddings-and-vectors',
    difficulty: 1,
    prompt: '¿Qué representa un embedding de un texto?',
    options: [
      {
        id: 'a',
        text: 'Un vector que lo sitúa por parecido de uso',
        correct: true,
        rationale:
          'Correcto: resume en qué contextos aparece. Textos usados de forma parecida quedan cerca.',
      },
      {
        id: 'b',
        text: 'El significado exacto del texto en español',
        correct: false,
        rationale:
          'No hay traducción del significado. Es una posición en un espacio aprendido del corpus.',
      },
      {
        id: 'c',
        text: 'El número de tokens que ocupa el texto',
        correct: false,
        rationale:
          'Confunde dos cosas distintas: el conteo de tokens no tiene relación con el vector.',
      },
    ],
    explanation:
      'Un embedding es una posición en un espacio donde la cercanía refleja parecido de contexto. Sirve para ordenar candidatos, no para certificar significado ni corrección.',
    referenceId: 'ref-attention',
  },
  {
    id: 'emb-mixed-models',
    competencyId: 'embeddings-and-vectors',
    difficulty: 2,
    prompt: '¿Puedes comparar vectores generados por dos modelos de embeddings distintos?',
    options: [
      {
        id: 'a',
        text: 'No: cada modelo define su propia geometría',
        correct: true,
        rationale:
          'Correcto: los espacios no son compatibles. Un vector de uno no significa nada en el otro.',
      },
      {
        id: 'b',
        text: 'Sí, son vectores de números al fin y al cabo',
        correct: false,
        rationale:
          'Ser vectores no los hace comparables. Comparten forma, no espacio: las distancias no significan lo mismo.',
      },
      {
        id: 'c',
        text: 'Sí, normalizando ambos antes de comparar',
        correct: false,
        rationale:
          'Normalizar unifica la longitud, no la geometría. Las direcciones siguen siendo de espacios distintos.',
      },
    ],
    explanation:
      'Cambiar de modelo de embeddings obliga a reindexar todo. Los vectores antiguos están en otra geometría, y mezclarlos produce similitudes que no significan nada.',
    referenceId: 'ref-attention',
  },
  {
    id: 'emb-similar-not-answer',
    competencyId: 'embeddings-and-vectors',
    difficulty: 2,
    prompt: 'Un fragmento recuperado es muy similar a la pregunta. ¿Significa que la responde?',
    options: [
      {
        id: 'a',
        text: 'No: similar no es lo mismo que correcto',
        correct: true,
        rationale:
          'Correcto: puede hablar del mismo tema sin contener la respuesta. La similitud ordena, no certifica.',
      },
      {
        id: 'b',
        text: 'Sí: la similitud mide relevancia exacta',
        correct: false,
        rationale:
          'La similitud mide parecido de contexto, no relevancia para una pregunta concreta.',
      },
      {
        id: 'c',
        text: 'Sí, si el coseno pasa de 0,8',
        correct: false,
        rationale:
          'No hay umbral universal. El mismo valor significa cosas distintas según el modelo y el corpus.',
      },
    ],
    explanation:
      'La búsqueda vectorial propone candidatos; decidir si sirven requiere leerlos o comprobarlos. Tratar la similitud como prueba de corrección es el origen de respuestas que suenan bien y no responden.',
    referenceId: 'ref-attention',
  },
  {
    id: 'emb-cosine',
    competencyId: 'embeddings-and-vectors',
    difficulty: 3,
    prompt: '¿Qué mide exactamente la similitud del coseno entre dos vectores?',
    options: [
      {
        id: 'a',
        text: 'El ángulo: si apuntan en la misma dirección',
        correct: true,
        rationale:
          'Correcto: compara direcciones e ignora la longitud, que suele ser un artefacto del texto.',
      },
      {
        id: 'b',
        text: 'La distancia en línea recta entre ambos',
        correct: false,
        rationale:
          'Eso es la distancia euclídea. El coseno no mide separación, mide orientación.',
      },
      {
        id: 'c',
        text: 'La longitud de cada vector por separado',
        correct: false,
        rationale:
          'La longitud se ignora a propósito. Comparar magnitudes mediría cuánto texto hay, no su parecido.',
      },
    ],
    explanation:
      'El coseno mide el ángulo entre dos vectores y descarta su longitud. Se usa porque la magnitud suele reflejar el tamaño del texto más que su contenido, y distorsionaría la comparación.',
    referenceId: 'ref-attention',
  },

  // ── inference-latency-cost ──────────────────────────────────────────────────
  {
    id: 'inf-cost-parts',
    competencyId: 'inference-latency-cost',
    difficulty: 1,
    prompt: '¿De qué depende el coste de una llamada al modelo?',
    options: [
      {
        id: 'a',
        text: 'De los tokens de entrada y de salida',
        correct: true,
        rationale:
          'Correcto: se factura por token, y la salida suele costar más por token que la entrada.',
      },
      {
        id: 'b',
        text: 'Solo de los tokens de entrada',
        correct: false,
        rationale:
          'Olvida la salida, que es la parte que más crece cuando la respuesta se alarga.',
      },
      {
        id: 'c',
        text: 'Del número de parámetros del modelo',
        correct: false,
        rationale:
          'El tamaño del modelo no es la unidad de facturación: se paga por token procesado y generado.',
      },
    ],
    explanation:
      'El coste se compone de entrada y salida, con tarifas distintas. Por eso una respuesta larga puede costar mucho más que una consulta larga con respuesta corta.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'inf-why-slow',
    competencyId: 'inference-latency-cost',
    difficulty: 2,
    prompt: '¿Por qué una respuesta larga tarda más que una corta con la misma entrada?',
    options: [
      {
        id: 'a',
        text: 'Porque la salida se genera token a token',
        correct: true,
        rationale:
          'Correcto: la entrada se procesa de golpe, pero la salida es secuencial. Más tokens, más espera.',
      },
      {
        id: 'b',
        text: 'Porque el modelo razona más cuando escribe más',
        correct: false,
        rationale:
          'No hay un paso de razonamiento aparte: predice tokens. La espera viene del número de pasos.',
      },
      {
        id: 'c',
        text: 'Porque la red tarda más en enviar más bytes',
        correct: false,
        rationale:
          'La transferencia es una parte mínima. Lo que domina es la generación secuencial.',
      },
    ],
    explanation:
      'La latencia la manda la generación: cada token necesita su paso. Si una pantalla espera a la respuesta completa, la longitud de la respuesta decide la experiencia.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'inf-nondeterminism',
    competencyId: 'inference-latency-cost',
    difficulty: 2,
    prompt: 'La misma consulta devuelve dos respuestas distintas. ¿Es un fallo?',
    options: [
      {
        id: 'a',
        text: 'No: el muestreo introduce variación',
        correct: true,
        rationale:
          'Correcto: el modelo elige entre candidatos según la distribución. Sin fijar el muestreo, varía.',
      },
      {
        id: 'b',
        text: 'Sí: el servicio está inestable',
        correct: false,
        rationale:
          'La variación es esperada por diseño. Solo sería un fallo si esperaras la misma salida y no la obtienes.',
      },
      {
        id: 'c',
        text: 'Solo pasa con entradas muy cortas',
        correct: false,
        rationale:
          'Pasa con cualquier entrada. La longitud influye en la magnitud, no en si ocurre.',
      },
    ],
    explanation:
      'La generación es probabilística. Si el sistema necesita estabilidad —una extracción que se valida, por ejemplo— hay que bajar la variación y, aun así, validar la salida.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'inf-which-latency',
    competencyId: 'inference-latency-cost',
    difficulty: 3,
    prompt: 'Tienes una media de 800 ms y un p95 de 4 s. ¿Qué mides para mejorar la experiencia?',
    options: [
      {
        id: 'a',
        text: 'El p95: es quien espera de verdad',
        correct: true,
        rationale:
          'Correcto: la media esconde la cola. Optimizar la media puede no mover a quien sufre la espera.',
      },
      {
        id: 'b',
        text: 'La media: resume el comportamiento',
        correct: false,
        rationale:
          'La media mezcla a todos. Un 5 % esperando cuatro segundos no mueve la media y sí arruina la experiencia.',
      },
      {
        id: 'c',
        text: 'El mínimo: marca lo posible',
        correct: false,
        rationale:
          'El mínimo solo dice lo mejor que puede ir. Nadie experimenta el mínimo.',
      },
    ],
    explanation:
      'Las latencias tienen cola larga. Se vigila el percentil alto porque describe al usuario desafortunado, y es ahí donde se decide si el sistema se percibe rápido o lento.',
    referenceId: 'ref-openai-tokens',
  },

  // ── generation-controls ─────────────────────────────────────────────────────
  {
    id: 'ctl-extraction-temp',
    competencyId: 'generation-controls',
    difficulty: 1,
    prompt: 'Vas a extraer campos de facturas con salida validada. ¿Qué temperatura eliges?',
    options: [
      {
        id: 'a',
        text: 'Baja o cero: aquí la variedad es error',
        correct: true,
        rationale:
          'Correcto: hay una respuesta correcta por factura. Cualquier variación es un fallo de extracción.',
      },
      {
        id: 'b',
        text: 'Alta, para que el modelo sea más listo',
        correct: false,
        rationale:
          'La temperatura añade variación, no inteligencia. En extracción, la variación es el enemigo.',
      },
      {
        id: 'c',
        text: 'Da igual: no afecta a la extracción',
        correct: false,
        rationale:
          'Afecta directamente. Con temperatura alta cambian los campos y el formato.',
      },
    ],
    explanation:
      'La temperatura decide cuánto se arriesga al elegir el siguiente token. En tareas con respuesta correcta única conviene reducirla; se reserva la variación para ideación.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctl-top-p',
    competencyId: 'generation-controls',
    difficulty: 2,
    prompt: '¿Qué hace el parámetro top-p?',
    options: [
      {
        id: 'a',
        text: 'Limita la elección a los más probables',
        correct: true,
        rationale:
          'Correcto: recorta la cola de candidatos improbables y elige dentro del conjunto que queda.',
      },
      {
        id: 'b',
        text: 'Fija la longitud máxima de la respuesta',
        correct: false,
        rationale:
          'La longitud se controla con el máximo de tokens, no con top-p.',
      },
      {
        id: 'c',
        text: 'Reduce el coste por token generado',
        correct: false,
        rationale:
          'No cambia la facturación: cambia qué candidatos entran en el sorteo del siguiente token.',
      },
    ],
    explanation:
      'Top-p corta la distribución acumulada y deja fuera los tokens menos probables. Es otro mando sobre la variación, complementario a la temperatura, no sustituto.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctl-stop-sequence',
    competencyId: 'generation-controls',
    difficulty: 2,
    prompt: '¿Para qué sirve una secuencia de parada?',
    options: [
      {
        id: 'a',
        text: 'Para cortar la generación en un marcador',
        correct: true,
        rationale:
          'Correcto: detiene la salida cuando aparece el texto indicado, y evita seguir generando de más.',
      },
      {
        id: 'b',
        text: 'Para mejorar la calidad de la respuesta',
        correct: false,
        rationale:
          'No mejora el contenido: solo decide dónde termina. La calidad se trabaja en el prompt y el modelo.',
      },
      {
        id: 'c',
        text: 'Para reducir la temperatura efectiva',
        correct: false,
        rationale:
          'Son controles distintos. La secuencia de parada no toca el muestreo.',
      },
    ],
    explanation:
      'La secuencia de parada define el final de la generación cuando el formato tiene un cierre conocido. Ahorra tokens y evita que el modelo siga hablando después de lo que necesitas.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctl-temp-zero',
    competencyId: 'generation-controls',
    difficulty: 3,
    prompt: 'Con temperatura cero, ¿puedes garantizar la misma salida siempre?',
    options: [
      {
        id: 'a',
        text: 'No: reduce la variación, no la elimina',
        correct: true,
        rationale:
          'Correcto: el orden de operaciones y el hardware pueden cambiar el resultado. No es una garantía.',
      },
      {
        id: 'b',
        text: 'Sí: cero significa determinista',
        correct: false,
        rationale:
          'Confunde reducir la variación con garantizarla. La reproducibilidad exacta no está asegurada.',
      },
      {
        id: 'c',
        text: 'Sí, si además fijas la longitud máxima',
        correct: false,
        rationale:
          'La longitud no interviene en la elección del token. No convierte el proceso en determinista.',
      },
    ],
    explanation:
      'Temperatura cero hace más probable el token más probable, no obliga a un resultado reproducible entre ejecuciones. Si el sistema exige reproducibilidad, hay que verificarla, no suponerla.',
    referenceId: 'ref-openai-tokens',
  },
];
