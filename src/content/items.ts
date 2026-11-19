/**
 * Ítems de la fase 1: cuatro por competencia.
 *
 * Cada distractor lleva su propia justificación, y esa justificación describe el
 * razonamiento equivocado, no la respuesta correcta. Ese es el valor pedagógico del
 * ítem: quien falla tiene que reconocer su error, no solo enterarse de que falló.
 *
 * Ver docs/contributing/content-authoring.md
 */
import type { Item } from '@/shared/types/domain';

export const ITEMS: readonly Item[] = [
  // ── ai-ml-dl-boundaries ─────────────────────────────────────────────────────
  {
    id: 'ml-rules-vs-model',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 1,
    prompt:
      'Un equipo clasifica tickets por prioridad con una tabla de reglas que funciona y es auditable. ¿Qué conviene hacer?',
    options: [
      {
        id: 'a',
        text: 'Mantener las reglas y no introducir un modelo',
        correct: true,
        rationale:
          'Correcto: si las reglas ya resuelven el caso con certeza, un modelo añade coste, latencia e incertidumbre sin ganar nada.',
      },
      {
        id: 'b',
        text: 'Sustituirlas por un modelo entrenado en cuanto sea posible',
        correct: false,
        rationale:
          'Tentador por novedad, pero cambia determinismo y trazabilidad por una probabilidad de error que antes no existía.',
      },
      {
        id: 'c',
        text: 'Usar un LLM que decida en tiempo real cada ticket',
        correct: false,
        rationale:
          'Suena moderno, pero es el caso más caro y menos predecible para una decisión que ya estaba resuelta con reglas.',
      },
    ],
    explanation:
      'La pregunta no es si el modelo puede, sino si mejora algo. Cuando la lógica es conocida y hay que poder explicar cada decisión, el sistema de reglas es la respuesta correcta, no la anticuada.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ml-supervised-data',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 1,
    prompt: '¿Qué hace falta para entrenar un modelo supervisado?',
    options: [
      {
        id: 'a',
        text: 'Ejemplos con la respuesta correcta etiquetada',
        correct: true,
        rationale:
          'Correcto: el aprendizaje supervisado aprende de pares entrada-salida; sin etiquetas no hay señal que seguir.',
      },
      {
        id: 'b',
        text: 'Una gran cantidad de datos de cualquier tipo',
        correct: false,
        rationale:
          'Confunde volumen con supervisión. Sin etiquetas no hay respuesta que imitar: eso describe el aprendizaje no supervisado.',
      },
      {
        id: 'c',
        text: 'Un conjunto de reglas escrito por especialistas del dominio',
        correct: false,
        rationale:
          'Eso es un sistema experto clásico: reglas explícitas escritas por personas, no un modelo que aprende de ejemplos.',
      },
    ],
    explanation:
      'Supervisado significa que existe una respuesta correcta conocida para cada ejemplo. Si no la tienes, el problema no es de modelo sino de datos, y hay que resolverlo antes de elegir técnica.',
    referenceId: 'ref-dl-book',
  },
  {
    id: 'ml-overfitting-gap',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 2,
    prompt:
      'Un modelo acierta el 98 % sobre los datos de entrenamiento y el 61 % sobre datos que nunca vio. ¿Qué está ocurriendo?',
    options: [
      {
        id: 'a',
        text: 'Sobreajuste: memorizó y no generaliza',
        correct: true,
        rationale:
          'Correcto: la brecha entre acierto en entrenamiento y en datos nuevos es la firma del sobreajuste.',
      },
      {
        id: 'b',
        text: 'Los datos nuevos son de peor calidad que los de entrenamiento',
        correct: false,
        rationale:
          'Puede ocurrir, pero la brecha aparece también con datos nuevos de la misma calidad: el problema está en el ajuste del modelo.',
      },
      {
        id: 'c',
        text: 'Falta potencia de cálculo para aprovechar el modelo',
        correct: false,
        rationale:
          'Más cómputo agravaría el sobreajuste si nada más cambia, porque permitiría memorizar todavía más rápido.',
      },
    ],
    explanation:
      'Un modelo que solo es bueno con lo que ya vio no predice: recuerda. Por eso la métrica que cuenta es siempre la de datos que el modelo nunca tuvo delante.',
    referenceId: 'ref-dl-book',
  },
  {
    id: 'ml-when-deep-learning',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 2,
    prompt: '¿En qué caso aporta de verdad el aprendizaje profundo frente al machine learning clásico?',
    options: [
      {
        id: 'a',
        text: 'Con datos no estructurados y abundantes',
        correct: true,
        rationale:
          'Correcto: las redes profundas aprenden representaciones de texto, imagen o audio, donde construir variables a mano no es viable.',
      },
      {
        id: 'b',
        text: 'Siempre que haya muchos datos disponibles para entrenar',
        correct: false,
        rationale:
          'Con datos tabulares y variables ya significativas, los métodos clásicos igualan o superan al profundo con menos coste.',
      },
      {
        id: 'c',
        text: 'Cuando se necesita explicar cada decisión paso a paso',
        correct: false,
        rationale:
          'Justo al contrario: una red profunda es menos interpretable que una regresión logística o un árbol de decisión.',
      },
    ],
    explanation:
      'La profundidad resuelve el problema de la representación, no el del volumen. Si el dato viene ya como variables con significado, añadir capas no aporta y complica la operación.',
    referenceId: 'ref-dl-book',
  },

  // ── tokens-and-context-window ───────────────────────────────────────────────
  {
    id: 'ctx-token-unit',
    competencyId: 'tokens-and-context-window',
    difficulty: 1,
    prompt: '¿En qué unidad se mide la ventana de contexto de un modelo?',
    options: [
      {
        id: 'a',
        text: 'En tokens',
        correct: true,
        rationale:
          'Correcto: la ventana se expresa en tokens, que es la unidad que el modelo procesa al leer y al generar.',
      },
      {
        id: 'b',
        text: 'En caracteres',
        correct: false,
        rationale:
          'Tentador porque el editor los cuenta, pero el modelo no ve caracteres: ve los trozos en que el tokenizador parte el texto.',
      },
      {
        id: 'c',
        text: 'En kilobytes',
        correct: false,
        rationale:
          'Confunde el contexto con memoria o con el tamaño del fichero. Aquí no hay bytes en juego, sino secuencias de tokens.',
      },
    ],
    explanation:
      'La ventana es un presupuesto de tokens que se reparte entre instrucciones, contexto recuperado y salida reservada. Por eso se agota mucho antes de lo que sugiere el tamaño del texto.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctx-at-limit',
    competencyId: 'tokens-and-context-window',
    difficulty: 2,
    prompt:
      'Vas a llenar la ventana de contexto con documentación recuperada. ¿Qué consecuencia debes asumir?',
    options: [
      {
        id: 'a',
        text: 'Se recorta parte del contexto que dabas por presente',
        correct: true,
        rationale:
          'Correcto: al no caber todo, el sistema trunca o el proveedor rechaza la llamada; en ambos casos se pierde lo que creías enviado.',
      },
      {
        id: 'b',
        text: 'El modelo procesa el texto más rápido y con más precisión',
        correct: false,
        rationale:
          'No hay ganancia por ir al límite, y además el contenido del centro del contexto recibe menos atención efectiva.',
      },
      {
        id: 'c',
        text: 'La salida se acorta sola para compensar el exceso',
        correct: false,
        rationale:
          'La salida no se reajusta: si no reservas espacio para ella, la respuesta se corta a mitad de frase sin avisar.',
      },
    ],
    explanation:
      'El contexto es un recurso finito que se reparte con la salida. Reservar espacio para generar y recortar la recuperación son decisiones de diseño, no detalles de configuración.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ctx-lost-middle',
    competencyId: 'tokens-and-context-window',
    difficulty: 2,
    prompt:
      'Has metido toda la documentación en el prompt, en orden de llegada. ¿Qué conviene asumir?',
    options: [
      {
        id: 'a',
        text: 'Que lo que queda en el centro se atiende peor',
        correct: true,
        rationale:
          'Correcto: en contextos largos la atención se degrada hacia el medio; lo del principio y el final pesa más en la respuesta.',
      },
      {
        id: 'b',
        text: 'Que el modelo lee todo el contexto con la misma fiabilidad',
        correct: false,
        rationale:
          'Es la intuición natural, pero la evidencia muestra degradación en el centro cuando el contexto se alarga.',
      },
      {
        id: 'c',
        text: 'Que ordenar alfabéticamente mejora la recuperación interna',
        correct: false,
        rationale:
          'El orden alfabético no aporta relevancia. Lo que ayuda es colocar lo importante al principio o al final.',
      },
    ],
    explanation:
      'Meter más contexto no es gratis: cuando todo entra, lo importante puede quedar enterrado en la zona donde el modelo atiende peor. Ordenar por relevancia es parte del trabajo.',
    referenceId: 'ref-attention',
  },
  {
    id: 'ctx-spanish-cost',
    competencyId: 'tokens-and-context-window',
    difficulty: 3,
    prompt: '¿Por qué una frase en español suele ocupar más tokens que su traducción al inglés?',
    options: [
      {
        id: 'a',
        text: 'Porque el vocabulario está más entrenado en inglés',
        correct: true,
        rationale:
          'Correcto: si el vocabulario tiene más piezas para el inglés, lo representa con menos tokens que idiomas con menos cobertura.',
      },
      {
        id: 'b',
        text: 'Porque el español tiene palabras más largas por naturaleza',
        correct: false,
        rationale:
          'A veces influye, pero el factor decisivo es la cobertura del vocabulario del tokenizador, no la longitud aparente.',
      },
      {
        id: 'c',
        text: 'Porque el español incluye más signos de puntuación',
        correct: false,
        rationale:
          'La puntuación aporta poco a la diferencia; lo que pesa es el reparto desigual del vocabulario entre idiomas.',
      },
    ],
    explanation:
      'El coste de un texto depende del tokenizador que lo parte, no solo de su contenido. Un presupuesto calculado sobre pruebas en inglés no se traslada tal cual al español.',
    referenceId: 'ref-openai-tokens',
  },

  // ── system-instructions-contract ────────────────────────────────────────────
  {
    id: 'sys-contract-vs-request',
    competencyId: 'system-instructions-contract',
    difficulty: 1,
    prompt: '¿Qué distingue a las instrucciones de sistema del mensaje del usuario?',
    options: [
      {
        id: 'a',
        text: 'Fijan lo estable; el usuario aporta la petición',
        correct: true,
        rationale:
          'Correcto: el sistema define rol, límites y formato; el mensaje concreto cambia en cada llamada sin tocar el contrato.',
      },
      {
        id: 'b',
        text: 'Son lo mismo, solo cambia el sitio donde se escriben',
        correct: false,
        rationale:
          'Cambian la prioridad y el ciclo de vida: el contrato no debería variar de una petición a otra ni según quién pregunte.',
      },
      {
        id: 'c',
        text: 'Sirven para ocultar información al usuario final',
        correct: false,
        rationale:
          'Su función es definir comportamiento, no esconder datos; confundirlo lleva a meter secretos en el prompt.',
      },
    ],
    explanation:
      'El contrato responde a «qué es una respuesta aceptable»; la petición responde a «qué se quiere ahora». Mezclarlos hace que cada caso nuevo obligue a reescribir el sistema.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sys-vague-contract',
    competencyId: 'system-instructions-contract',
    difficulty: 2,
    prompt: 'Un contrato que solo dice «sé útil y responde bien». ¿Cuál es el problema real?',
    options: [
      {
        id: 'a',
        text: 'No se puede comprobar ni medir',
        correct: true,
        rationale:
          'Correcto: una instrucción que no se puede evaluar no sirve como contrato; no dice qué es aceptable ni qué hacer si no se cumple.',
      },
      {
        id: 'b',
        text: 'Es demasiado corta para definir el rol del asistente',
        correct: false,
        rationale:
          'La longitud no es el problema: podría ser larguísima y seguir sin decir nada que se pueda comprobar.',
      },
      {
        id: 'c',
        text: 'Debería ir en el mensaje del usuario y no en el sistema',
        correct: false,
        rationale:
          'Aunque se moviera ahí, seguiría sin definir nada verificable sobre formato, tono o límites.',
      },
    ],
    explanation:
      'Un contrato útil se puede evaluar: dice formato, tono, límites y qué hacer ante lo que no sabe. Si no se puede escribir un caso de prueba, todavía no es un contrato.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sys-untrusted-content',
    competencyId: 'system-instructions-contract',
    difficulty: 3,
    prompt:
      'El usuario pega un documento que contiene «ignora tus instrucciones anteriores». El contrato no lo contempla. ¿Qué falla?',
    options: [
      {
        id: 'a',
        text: 'El contenido externo compite con el contrato',
        correct: true,
        rationale:
          'Correcto: sin una regla explícita sobre contenido no confiable, un texto pegado puede redefinir el comportamiento del sistema.',
      },
      {
        id: 'b',
        text: 'El modelo se queda sin ventana de contexto disponible',
        correct: false,
        rationale:
          'El contexto sigue existiendo. Lo que se compromete es la jerarquía de instrucciones, no el espacio disponible.',
      },
      {
        id: 'c',
        text: 'El tokenizador interpreta ese texto como código',
        correct: false,
        rationale:
          'El tokenizador solo parte texto: no ejecuta nada. El riesgo es de comportamiento del modelo, no de ejecución.',
      },
    ],
    explanation:
      'Todo lo que entra por el usuario es dato, nunca instrucción. El contrato tiene que decirlo de forma explícita, porque la jerarquía de prioridades no se deduce del contenido.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sys-structured-output',
    competencyId: 'system-instructions-contract',
    difficulty: 2,
    prompt:
      'Necesitas que la respuesta sea siempre JSON válido con tres campos concretos. ¿Cuál es la práctica correcta?',
    options: [
      {
        id: 'a',
        text: 'Pedir el formato y validar la salida al recibirla',
        correct: true,
        rationale:
          'Correcto: el prompt reduce la probabilidad de error; la validación la convierte en garantía en el límite del sistema.',
      },
      {
        id: 'b',
        text: 'Confiar en el prompt si está bien redactado',
        correct: false,
        rationale:
          'Es lo más frecuente y lo más frágil: el prompt no es una garantía, es una instrucción con resultado probabilístico.',
      },
      {
        id: 'c',
        text: 'Validar solo cuando se rompa en producción',
        correct: false,
        rationale:
          'Eso es enterarse del fallo por el usuario. La validación tiene que ocurrir antes de usar el dato, no después.',
      },
    ],
    explanation:
      'El prompt orienta; el validador obliga. Un JSON inválido debe fallar en el borde del sistema, donde se puede rechazar y reintentar, no tres capas más adentro cuando ya se usó.',
    referenceId: 'ref-anthropic-system',
  },
];
