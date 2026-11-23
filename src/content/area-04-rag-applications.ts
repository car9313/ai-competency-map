/**
 * Área 04 — Aplicaciones de IA y RAG.
 *
 * Cinco competencias, todas nuevas. El eje del área es la frontera entre lo que decide el
 * modelo y lo que decide el código.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_04: readonly Lesson[] = [
  {
    competencyId: 'function-calling-contracts',
    whatIs:
      'El modelo no ejecuta nada: elige una herramienta declarada y propone argumentos. El código recibe esa propuesta, la valida y decide si ejecuta. La herramienta es un contrato entre el modelo, que propone, y tu sistema, que dispone.',
    problem:
      'Se asume que el modelo ejecuta y controla los efectos. Y no: el modelo solo propone. Si el código ejecuta lo propuesto sin validar, cualquier argumento inventado o malformado se convierte en una acción real.',
    internals: [
      'Cada herramienta se declara con nombre, descripción y esquema de argumentos. Sin esquema, el modelo improvisa.',
      'El modelo propone; tu código valida permisos, tipos y límites; después ejecuta.',
      'El resultado vuelve al modelo como parte del contexto. Si el error se le oculta, no puede corregirlo.',
      'Los efectos irreversibles —pagos, borrados, envíos— necesitan barreras fuera del modelo.',
    ],
    whenToUse: [
      'Con validación de argumentos y de permisos en tu código, antes de cualquier efecto.',
      'Devolviendo errores explícitos para que el modelo pueda corregir la siguiente propuesta.',
    ],
    whenNotToUse: [
      'No confíes en que el modelo «pida permiso»: eso es una barrera del sistema, no del prompt.',
      'No ejecutes argumentos sin validar porque la herramienta los declare bien.',
    ],
    pitfalls: [
      {
        title: 'Ejecutar lo propuesto sin validar',
        detail:
          'Un identificador vacío o un importe negativo son propuestas válidas del modelo. La validación es la última puerta antes del efecto.',
      },
      {
        title: 'Ocultar el error al modelo',
        detail:
          'Si la herramienta falla y no se le dice, repetirá la misma propuesta. El error explícito es información para corregir.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'streaming-ux',
    whatIs:
      'En streaming la respuesta llega token a token. Mejora el tiempo hasta el primer token percibido y permite cancelar, pero obliga a manejar un estado parcial: lo que se muestra todavía no está validado ni completo.',
    problem:
      'Se añade streaming a cualquier salida, incluidas las que después se validan y se descartan. El usuario lee un texto que un instante después desaparece o se corrige.',
    internals: [
      'Lo que se percibe es el primer token, no el final. Para respuestas largas de lectura, es una mejora grande.',
      'El texto parcial no es válido ni definitivo: cualquier validación ocurre al terminar.',
      'Cancelar es parte del diseño: si el usuario puede detenerla, ahorra tiempo y coste.',
      'El streaming y la salida estructurada se llevan mal: no se puede validar un JSON a medias.',
    ],
    whenToUse: [
      'Cuando hay texto largo que el usuario va a leer y la espera se nota.',
      'Cuando el usuario debe poder cancelar una generación que se alarga.',
    ],
    whenNotToUse: [
      'No hagas streaming de una salida que se valida y se rechaza si no cumple: mostrar y retirar es peor que esperar.',
      'No presentes el texto parcial como definitivo.',
    ],
    pitfalls: [
      {
        title: 'Mostrar y luego retirar',
        detail:
          'Si la validación puede descartar la salida, el streaming enseña algo incorrecto. La espera honesta es mejor que la corrección visible.',
      },
      {
        title: 'Streaming sin cancelar',
        detail:
          'Una generación larga sin botón de parada deja al usuario esperando algo que ya no quiere.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
  {
    competencyId: 'chunking-and-overlap',
    whatIs:
      'Trocear un documento decide qué unidades se pueden recuperar. El tamaño, el solape y los cortes determinan si la respuesta llega entera o partida en dos fragmentos que, por separado, no sirven.',
    problem:
      'Se corta por número fijo de caracteres. Eso parte tablas, listas y frases por la mitad, y el fragmento recuperado aparece sin la frase que le daba sentido.',
    internals: [
      'Cortar por estructura —títulos, secciones, párrafos— conserva el significado mejor que cortar por longitud.',
      'El solape entre fragmentos evita perder la frontera, a costa de duplicar contenido en el índice.',
      'Fragmentos pequeños dan precisión; grandes dan contexto. No hay tamaño correcto universal.',
      'Conservar el título en cada fragmento da contexto a un trozo que, solo, no lo tendría.',
    ],
    whenToUse: [
      'Corta por secciones y conserva la ruta de títulos en cada fragmento.',
      'Usa solape moderado cuando el corte pueda caer en medio de una idea.',
    ],
    whenNotToUse: [
      'No cortes por longitud fija sin mirar la estructura del documento.',
      'No metas tablas o listas en fragmentos que las partan: pierden la cabecera.',
    ],
    pitfalls: [
      {
        title: 'Fragmentos sin título',
        detail:
          'Un párrafo suelto puede no decir de qué habla. El título de la sección es contexto barato y casi siempre se olvida.',
      },
      {
        title: 'Tablas partidas',
        detail:
          'Sin la cabecera, una fila recuperada es un conjunto de números sin significado. Las tablas se trocean por filas completas.',
      },
    ],
    referenceIds: ['ref-openai-tokens'],
  },
  {
    competencyId: 'hybrid-retrieval',
    whatIs:
      'La búsqueda híbrida combina dos señales: la léxica, que acierta con términos exactos, códigos y nombres propios, y la vectorial, que acierta con paráfrasis y sinónimos. Cada una falla donde la otra funciona.',
    problem:
      'Se usa solo búsqueda vectorial para todo. Y entonces un código de error, una referencia o un nombre propio se diluyen en el espacio semántico, mientras el documento que los contiene literalmente no aparece.',
    internals: [
      'La búsqueda léxica puntúa por coincidencia de términos: es imbatible con identificadores exactos.',
      'La vectorial puntúa por parecido de contexto: encuentra lo que dice lo mismo con otras palabras.',
      'Los dos rankings no son comparables directamente; se fusionan por posición y se reordenan.',
      'Un reordenador posterior puede mirar los mejores candidatos con más cuidado que cualquiera de las dos señales.',
    ],
    whenToUse: [
      'Cuando el dominio tiene códigos, referencias, nombres de producto o números de artículo.',
      'Cuando los usuarios escriben a la vez con palabras exactas y con paráfrasis.',
    ],
    whenNotToUse: [
      'No confíes solo en embeddings para buscar identificadores exactos.',
      'No fusiones puntuaciones de dos métodos sin normalizar o sin usar posiciones.',
    ],
    pitfalls: [
      {
        title: 'Solo vectorial por moda',
        detail:
          'La búsqueda vectorial es potente y no sustituye a la exacta. Para un código de error, el término literal gana casi siempre.',
      },
      {
        title: 'Sumar puntuaciones de escalas distintas',
        detail:
          'Un 0,8 de coseno y un 12 de BM25 no se suman. Se combinan por ranking, o se normalizan antes.',
      },
    ],
    referenceIds: ['ref-attention'],
  },
  {
    competencyId: 'grounding-and-citations',
    whatIs:
      'Una respuesta está fundamentada cuando se apoya en fragmentos recuperados y los cita. Si los fragmentos no sostienen la afirmación, el sistema debe decirlo en lugar de completar el hueco con texto plausible.',
    problem:
      'Se pide «cita fuentes» y el modelo inventa identificadores de fragmentos que no existen. La cita da apariencia de rigor y el lector no la comprueba.',
    internals: [
      'La cita debe apuntar a un fragmento que exista y que contenga lo afirmado; ambas condiciones se verifican.',
      'Citar no garantiza acierto: el fragmento puede ser antiguo, parcial o estar equivocado.',
      'Abstenerse es una respuesta válida: «no está en los documentos» es información útil.',
      'La verificación es del sistema, no del lector: si el identificador no existe, la respuesta se rechaza.',
    ],
    whenToUse: [
      'Cuando el usuario puede y quiere verificar la fuente de lo que lee.',
      'Cuando un error tiene coste alto y hace falta poder rastrear de dónde sale.',
    ],
    whenNotToUse: [
      'No muestres citas sin comprobar que el fragmento existe.',
      'No presentes una cita como prueba de que el contenido es correcto.',
    ],
    pitfalls: [
      {
        title: 'Citas inventadas',
        detail:
          'Un identificador plausible que no existe es peor que no citar: parece verificado y es falso.',
      },
      {
        title: 'Confundir tener fuente con tener razón',
        detail:
          'El documento puede estar desactualizado o hablar de otro caso. La cita localiza la afirmación; no la valida sola.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
];

export const ITEMS_AREA_04: readonly Item[] = [
  // ── function-calling-contracts ──────────────────────────────────────────────
  {
    id: 'fc-who-executes',
    competencyId: 'function-calling-contracts',
    difficulty: 1,
    prompt: 'El modelo «llama» a una herramienta. ¿Quién la ejecuta realmente?',
    options: [
      {
        id: 'a',
        text: 'Tu código, con los argumentos que propuso',
        correct: true,
        rationale:
          'Correcto: el modelo solo propone nombre y argumentos. La ejecución es de tu sistema.',
      },
      {
        id: 'b',
        text: 'El modelo, dentro de su propio proceso',
        correct: false,
        rationale:
          'El modelo no tiene acceso a tus sistemas. No puede ejecutar nada por sí mismo.',
      },
      {
        id: 'c',
        text: 'El proveedor del modelo, automáticamente',
        correct: false,
        rationale:
          'El proveedor entrega la propuesta. Ejecutarla es responsabilidad de quien la recibe.',
      },
    ],
    explanation:
      'La separación entre proponer y ejecutar es la que permite validar. Si esa frontera se difumina, los argumentos inventados por el modelo se convierten en acciones reales sin control.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'fc-validate-args',
    competencyId: 'function-calling-contracts',
    difficulty: 2,
    prompt: 'El modelo propone borrar un registro con identificador vacío. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Rechazar: validar argumentos antes de ejecutar',
        correct: true,
        rationale:
          'Correcto: la propuesta es válida como propuesta y peligrosa como acción. La validación va antes.',
      },
      {
        id: 'b',
        text: 'Ejecutar: el modelo sabe lo que hace',
        correct: false,
        rationale:
          'El modelo no sabe qué existe en tu base de datos. Un identificador vacío lo demuestra.',
      },
      {
        id: 'c',
        text: 'Preguntar al modelo si está seguro del identificador',
        correct: false,
        rationale:
          'Le pides que valide su propia propuesta con la misma información. No añade ninguna garantía.',
      },
    ],
    explanation:
      'Los argumentos son datos que llegan de fuera: se validan como cualquier entrada de usuario. Que los genere un modelo no los hace fiables, y los efectos irreversibles no admiten ensayo.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'fc-error-feedback',
    competencyId: 'function-calling-contracts',
    difficulty: 2,
    prompt: 'La herramienta falla al ejecutarse. ¿Qué le devuelves al modelo?',
    options: [
      {
        id: 'a',
        text: 'Un error explícito para que pueda corregir',
        correct: true,
        rationale:
          'Correcto: el resultado vuelve como contexto. Ocultar el fallo garantiza que repita la misma propuesta.',
      },
      {
        id: 'b',
        text: 'Nada: el modelo no necesita saberlo',
        correct: false,
        rationale:
          'Sin esa información, el modelo no puede cambiar de estrategia y repetirá el intento fallido.',
      },
      {
        id: 'c',
        text: 'Un éxito falso para no interrumpir el flujo',
        correct: false,
        rationale:
          'Miente al sistema y al usuario. El flujo continúa sobre una premisa que no ocurrió.',
      },
    ],
    explanation:
      'El bucle de herramientas funciona porque el resultado vuelve al modelo. Un error explícito es información accionable; un éxito falso convierte un fallo recuperable en una decisión equivocada.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'fc-irreversible-effects',
    competencyId: 'function-calling-contracts',
    difficulty: 3,
    prompt: 'Una herramienta transfiere dinero. ¿Dónde va la barrera de seguridad?',
    options: [
      {
        id: 'a',
        text: 'Fuera del modelo: límites y aprobación explícita',
        correct: true,
        rationale:
          'Correcto: el modelo propone; la autorización es del sistema. Sin esa barrera, un error es irreversible.',
      },
      {
        id: 'b',
        text: 'En el prompt: pedirle que confirme antes de actuar',
        correct: false,
        rationale:
          'El prompt es una sugerencia, no un control. El modelo puede ignorarla y la acción se ejecuta igual.',
      },
      {
        id: 'c',
        text: 'En la temperatura: ponerla a cero',
        correct: false,
        rationale:
          'Temperatura cero reduce la variación, no la probabilidad de una propuesta equivocada.',
      },
    ],
    explanation:
      'Las barreras de seguridad viven en el código que ejecuta, no en el texto que instruye. Para efectos irreversibles: límites, aprobación humana y capacidad de deshacer o de no hacer.',
    referenceId: 'ref-anthropic-system',
  },

  // ── streaming-ux ────────────────────────────────────────────────────────────
  {
    id: 'st-why-stream',
    competencyId: 'streaming-ux',
    difficulty: 1,
    prompt: '¿Qué mejora el streaming en una respuesta larga?',
    options: [
      {
        id: 'a',
        text: 'El tiempo hasta ver el primer texto',
        correct: true,
        rationale:
          'Correcto: la espera percibida cae porque el usuario empieza a leer antes de que termine.',
      },
      {
        id: 'b',
        text: 'La calidad de la respuesta generada',
        correct: false,
        rationale:
          'El contenido es el mismo. Cambia cuándo se ve, no qué se genera.',
      },
      {
        id: 'c',
        text: 'El coste por token generado',
        correct: false,
        rationale:
          'El número de tokens no cambia, así que el coste tampoco. Solo cambia la entrega.',
      },
    ],
    explanation:
      'El streaming ataca la percepción de espera, no la calidad ni el coste. Para texto que se lee, es la mejora de experiencia más barata que existe; para salidas validadas, es un riesgo.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'st-structured-conflict',
    competencyId: 'streaming-ux',
    difficulty: 2,
    prompt: 'Necesitas un JSON que se valida al final. ¿Tiene sentido hacer streaming?',
    options: [
      {
        id: 'a',
        text: 'No: no se puede validar un JSON a medias',
        correct: true,
        rationale:
          'Correcto: si la validación puede rechazarlo, mostrar el parcial es enseñar algo que se retira.',
      },
      {
        id: 'b',
        text: 'Sí: siempre es mejor mostrar algo antes',
        correct: false,
        rationale:
          'Mostrar y luego retirar confunde más que esperar. El usuario leyó un dato que no era válido.',
      },
      {
        id: 'c',
        text: 'Sí, si se baja la temperatura a cero',
        correct: false,
        rationale:
          'La temperatura no cambia el problema: el JSON sigue incompleto hasta el final.',
      },
    ],
    explanation:
      'El streaming y la validación se llevan mal. Si el resultado puede descartarse, conviene esperar: la corrección visible destruye la confianza en la interfaz.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'st-cancel',
    competencyId: 'streaming-ux',
    difficulty: 2,
    prompt: 'Una generación larga está en curso. ¿Qué debe poder hacer el usuario?',
    options: [
      {
        id: 'a',
        text: 'Cancelarla en cualquier momento',
        correct: true,
        rationale:
          'Correcto: si ya no la quiere, seguir generando gasta tiempo y tokens sin utilidad.',
      },
      {
        id: 'b',
        text: 'Esperar: no se puede interrumpir',
        correct: false,
        rationale:
          'Es una decisión de interfaz, no una limitación. La generación se puede detener en el cliente.',
      },
      {
        id: 'c',
        text: 'Recargar la página para cortarla',
        correct: false,
        rationale:
          'Recargar pierde el estado de la pantalla. Cancelar es una acción explícita y limpia.',
      },
    ],
    explanation:
      'Cancelar forma parte del diseño del streaming: da control, ahorra coste y evita esperas inútiles. Es de las pocas funciones en las que el usuario y la factura salen ganando.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'st-partial-shown',
    competencyId: 'streaming-ux',
    difficulty: 3,
    prompt: 'Muestras texto en streaming que después la validación descarta. ¿Cuál es el daño real?',
    options: [
      {
        id: 'a',
        text: 'El usuario ya leyó algo que no era cierto',
        correct: true,
        rationale:
          'Correcto: el texto apareció como respuesta y se retiró. La confianza en la interfaz es lo que se pierde.',
      },
      {
        id: 'b',
        text: 'Ninguno: si desaparece, no cuenta',
        correct: false,
        rationale:
          'Lo leído no se deslee. La corrección posterior no borra la impresión de la primera lectura.',
      },
      {
        id: 'c',
        text: 'Solo el coste de los tokens mostrados',
        correct: false,
        rationale:
          'El coste es pequeño. El daño es de confianza, y cuesta mucho más de recuperar.',
      },
    ],
    explanation:
      'Mostrar y retirar rompe la promesa implícita de la interfaz: lo que aparece es la respuesta. Si el resultado puede descartarse, mejor no mostrarlo hasta validarlo.',
    referenceId: 'ref-openai-tokens',
  },

  // ── chunking-and-overlap ────────────────────────────────────────────────────
  {
    id: 'ch-answer-split',
    competencyId: 'chunking-and-overlap',
    difficulty: 1,
    prompt: 'La respuesta aparece partida entre dos fragmentos y ninguno la contiene entera. ¿Qué falla?',
    options: [
      {
        id: 'a',
        text: 'El tamaño del fragmento o el solape',
        correct: true,
        rationale:
          'Correcto: o el trozo es pequeño para la idea, o falta solape entre trozos contiguos.',
      },
      {
        id: 'b',
        text: 'El modelo: no une bien los fragmentos',
        correct: false,
        rationale:
          'El modelo solo ve lo que se le entrega. Si la respuesta está cortada, el problema es previo.',
      },
      {
        id: 'c',
        text: 'La temperatura de generación',
        correct: false,
        rationale:
          'La temperatura afecta a la variación de la salida, no a qué fragmentos se recuperan.',
      },
    ],
    explanation:
      'El troceado decide qué se puede recuperar entero. Un solape moderado y cortes por estructura evitan que la unidad de sentido quede dividida entre dos fragmentos inservibles por separado.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ch-cut-by-structure',
    competencyId: 'chunking-and-overlap',
    difficulty: 2,
    prompt: 'Vas a trocear un manual con secciones claras. ¿Cómo lo cortas?',
    options: [
      {
        id: 'a',
        text: 'Por secciones, conservando los títulos',
        correct: true,
        rationale:
          'Correcto: la estructura del documento ya marca las unidades de sentido. El título da contexto al trozo.',
      },
      {
        id: 'b',
        text: 'Cada 500 caracteres exactos',
        correct: false,
        rationale:
          'Corta frases, tablas y listas por la mitad. La uniformidad no compensa perder el significado.',
      },
      {
        id: 'c',
        text: 'Una página por fragmento',
        correct: false,
        rationale:
          'Mejor que por caracteres, pero la página es arbitraria: una sección corta es demasiado y una larga también.',
      },
    ],
    explanation:
      'La estructura del documento es información gratis sobre dónde acaba una idea. Cortar por secciones y conservar el título produce fragmentos que se entienden solos, sin leer lo de al lado.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ch-small-tradeoff',
    competencyId: 'chunking-and-overlap',
    difficulty: 2,
    prompt: 'Fragmentos muy pequeños: ¿qué se gana y qué se pierde?',
    options: [
      {
        id: 'a',
        text: 'Se gana precisión y se pierde contexto',
        correct: true,
        rationale:
          'Correcto: el fragmento recuperado se parece mucho a la consulta, pero puede faltarle lo necesario.',
      },
      {
        id: 'b',
        text: 'Se gana todo: precisión y contexto',
        correct: false,
        rationale:
          'Hay un compromiso real. Un trozo pequeño no puede contener la explicación que lo rodea.',
      },
      {
        id: 'c',
        text: 'No cambia nada mientras quepa en la ventana',
        correct: false,
        rationale:
          'El tamaño cambia qué se recupera y qué se puede responder. No es un detalle de formato.',
      },
    ],
    explanation:
      'El tamaño del fragmento es un compromiso: pequeño da precisión, grande da contexto. Se elige según si la pregunta se responde con un dato puntual o con una explicación.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ch-table-headers',
    competencyId: 'chunking-and-overlap',
    difficulty: 3,
    prompt: 'Una tabla de precios se trocea a mitad de fila. ¿Cuál es la consecuencia?',
    options: [
      {
        id: 'a',
        text: 'Recuperas filas sin cabecera, sin significado',
        correct: true,
        rationale:
          'Correcto: un número suelto sin el nombre de la columna no dice nada. El dato existe y no se puede usar.',
      },
      {
        id: 'b',
        text: 'Ninguna: las filas se leen solas',
        correct: false,
        rationale:
          'Una fila es un valor por columna, y sin cabecera no se sabe cuál es cuál. Puede invertirse el sentido.',
      },
      {
        id: 'c',
        text: 'Mejora la precisión al ser más pequeño',
        correct: false,
        rationale:
          'La precisión aparente engaña: recupera la fila correcta y la vuelve ininterpretable.',
      },
    ],
    explanation:
      'Las tablas se trocean por filas completas y repitiendo la cabecera en cada fragmento. Sin ella, el fragmento es un conjunto de números que el modelo tendrá que adivinar.',
    referenceId: 'ref-openai-tokens',
  },

  // ── hybrid-retrieval ────────────────────────────────────────────────────────
  {
    id: 'hr-exact-code',
    competencyId: 'hybrid-retrieval',
    difficulty: 1,
    prompt: 'Buscas el código de error E-4021 y solo usas búsqueda vectorial. ¿Qué falla?',
    options: [
      {
        id: 'a',
        text: 'Los identificadores exactos se diluyen',
        correct: true,
        rationale:
          'Correcto: el vector aproxima el significado y pierde la coincidencia literal del código.',
      },
      {
        id: 'b',
        text: 'Nada: el vector encuentra cualquier texto',
        correct: false,
        rationale:
          'Encuentra textos parecidos, y un código no se parece a nada: o coincide o no coincide.',
      },
      {
        id: 'c',
        text: 'Solo el coste de la consulta',
        correct: false,
        rationale:
          'El problema es de acierto, no de precio. El documento correcto puede no aparecer.',
      },
    ],
    explanation:
      'Hay dos señales con fortalezas distintas: la léxica acierta con lo literal, la vectorial con lo parafraseado. Usar solo una deja un tipo de consulta sin cubrir.',
    referenceId: 'ref-attention',
  },
  {
    id: 'hr-lexical-value',
    competencyId: 'hybrid-retrieval',
    difficulty: 2,
    prompt: '¿Qué aporta la búsqueda léxica frente a la vectorial?',
    options: [
      {
        id: 'a',
        text: 'Coincidencia exacta de términos y códigos',
        correct: true,
        rationale:
          'Correcto: puntúa por presencia literal. Es imbatible cuando el término exacto es la respuesta.',
      },
      {
        id: 'b',
        text: 'Encontrar sinónimos y paráfrasis',
        correct: false,
        rationale:
          'Eso es justo lo que aporta la búsqueda vectorial. La léxica no reconoce sinónimos que no estén escritos.',
      },
      {
        id: 'c',
        text: 'Traducir la consulta al idioma del documento',
        correct: false,
        rationale:
          'No traduce. Si el término no aparece escrito, la búsqueda léxica no lo encuentra.',
      },
    ],
    explanation:
      'Las dos señales se complementan porque fallan en sitios distintos. La léxica gana en lo literal; la vectorial, en lo que se dice con otras palabras. Juntas cubren más consultas que cualquiera sola.',
    referenceId: 'ref-attention',
  },
  {
    id: 'hr-fusion',
    competencyId: 'hybrid-retrieval',
    difficulty: 2,
    prompt: 'Tienes un ranking léxico y otro vectorial. ¿Cómo los combinas?',
    options: [
      {
        id: 'a',
        text: 'Fusionar por posición y reordenar el resultado',
        correct: true,
        rationale:
          'Correcto: las puntuaciones no son comparables, pero las posiciones sí. Se combinan y se reordenan.',
      },
      {
        id: 'b',
        text: 'Sumar las puntuaciones de ambos métodos',
        correct: false,
        rationale:
          'Un 0,8 de coseno y un 12 de BM25 no se suman: son escalas distintas y una domina.',
      },
      {
        id: 'c',
        text: 'Quedarte con el ranking que dé más resultados',
        correct: false,
        rationale:
          'Más resultados no es mejor. Se elige por calidad del orden, no por cantidad.',
      },
    ],
    explanation:
      'Los rankings se fusionan por posición, no por puntuación, precisamente porque las escalas no son comparables. Después, un reordenador puede mirar los mejores candidatos con más detalle.',
    referenceId: 'ref-attention',
  },
  {
    id: 'hr-rerank-purpose',
    competencyId: 'hybrid-retrieval',
    difficulty: 3,
    prompt: '¿Para qué sirve un reordenador después de recuperar candidatos?',
    options: [
      {
        id: 'a',
        text: 'Para ordenar los mejores con más precisión',
        correct: true,
        rationale:
          'Correcto: la recuperación prioriza cobertura y el reordenador prioriza precisión sobre pocos candidatos.',
      },
      {
        id: 'b',
        text: 'Para reducir el coste total de la búsqueda',
        correct: false,
        rationale:
          'Añade una etapa más. Suele costar más y mejora el orden, no el precio.',
      },
      {
        id: 'c',
        text: 'Para traducir los documentos al idioma de la consulta',
        correct: false,
        rationale:
          'El reordenador no traduce: puntúa la relevancia de cada candidato para la consulta.',
      },
    ],
    explanation:
      'La recuperación es barata y prioriza no dejar fuera lo importante; el reordenador es caro y solo mira unos pocos. Esa división de trabajo es lo que hace viable la precisión.',
    referenceId: 'ref-attention',
  },

  // ── grounding-and-citations ─────────────────────────────────────────────────
  {
    id: 'gr-no-support',
    competencyId: 'grounding-and-citations',
    difficulty: 1,
    prompt: 'Ningún fragmento recuperado responde a la pregunta. ¿Qué debe hacer el sistema?',
    options: [
      {
        id: 'a',
        text: 'Decirlo, en vez de responder de memoria',
        correct: true,
        rationale:
          'Correcto: abstenerse es una respuesta válida. Inventar aquí es el fallo más caro.',
      },
      {
        id: 'b',
        text: 'Responder igual con lo que el modelo sabe',
        correct: false,
        rationale:
          'Rompe la promesa del sistema: la respuesta ya no se apoya en los documentos.',
      },
      {
        id: 'c',
        text: 'Buscar la respuesta en internet sin avisar',
        correct: false,
        rationale:
          'Cambia la fuente sin decirlo. El usuario cree que la respuesta sale de sus documentos.',
      },
    ],
    explanation:
      'Un sistema fundamentado promete que la respuesta se apoya en las fuentes. Si no hay soporte, decirlo es más útil que una respuesta plausible que el usuario no puede verificar.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gr-citation-check',
    competencyId: 'grounding-and-citations',
    difficulty: 2,
    prompt: 'El modelo cita el fragmento 12. ¿Qué comprueba el sistema?',
    options: [
      {
        id: 'a',
        text: 'Que existe y que contiene lo citado',
        correct: true,
        rationale:
          'Correcto: son dos comprobaciones distintas. Un identificador válido puede no sostener la frase.',
      },
      {
        id: 'b',
        text: 'Nada: si lo cita, es que lo leyó',
        correct: false,
        rationale:
          'El modelo puede inventar identificadores con total naturalidad. La cita no se autovalida.',
      },
      {
        id: 'c',
        text: 'Que la cita suene coherente con la respuesta',
        correct: false,
        rationale:
          'La coherencia es lo que el modelo ya produjo. Comprobar contra el texto real es otra cosa.',
      },
    ],
    explanation:
      'Una cita tiene dos condiciones: el fragmento existe y el fragmento dice lo afirmado. La primera es mecánica; la segunda exige comparar el texto, y es donde se cuelan las citas decorativas.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gr-cite-not-proof',
    competencyId: 'grounding-and-citations',
    difficulty: 2,
    prompt: 'Que una respuesta cite una fuente, ¿garantiza que es correcta?',
    options: [
      {
        id: 'a',
        text: 'No: depende de la fuente y del fragmento',
        correct: true,
        rationale:
          'Correcto: el documento puede estar desactualizado, hablar de otro caso o ser parcial.',
      },
      {
        id: 'b',
        text: 'Sí: si está citado, está respaldado',
        correct: false,
        rationale:
          'La cita localiza la afirmación en un texto. No certifica que ese texto sea verdad ni vigente.',
      },
      {
        id: 'c',
        text: 'Sí, si la fuente es oficial',
        correct: false,
        rationale:
          'Una fuente oficial también puede estar desactualizada. La cita aporta trazabilidad, no veracidad.',
      },
    ],
    explanation:
      'Citar mejora la trazabilidad: permite comprobar de dónde sale. La corrección depende de la calidad y vigencia de la fuente, y eso no lo resuelve el modelo.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gr-verify-support',
    competencyId: 'grounding-and-citations',
    difficulty: 3,
    prompt: '¿Cómo verificas que una cita respalda la frase que la acompaña?',
    options: [
      {
        id: 'a',
        text: 'Comparando el texto citado con la afirmación',
        correct: true,
        rationale:
          'Correcto: hay que leer el fragmento y comprobar que dice lo afirmado, no algo parecido.',
      },
      {
        id: 'b',
        text: 'Comprobando que la cita no es demasiado larga',
        correct: false,
        rationale:
          'La longitud no dice nada sobre si el fragmento sostiene la afirmación.',
      },
      {
        id: 'c',
        text: 'Verificando que el fragmento está en el idioma correcto',
        correct: false,
        rationale:
          'El idioma no es el criterio. Un fragmento puede estar en el idioma correcto y no hablar de eso.',
      },
    ],
    explanation:
      'La verificación de soporte es una comparación semántica entre dos textos: lo afirmado y lo citado. Automatizarla exige un juez, y ese juez también puede equivocarse: por eso se mide.',
    referenceId: 'ref-anthropic-system',
  },

  // ── segunda tanda: hasta 8 ítems por competencia ────────────────────────────

  {
    id: 'fc-vague-schema',
    competencyId: 'function-calling-contracts',
    difficulty: 2,
    prompt: 'Una herramienta declara un campo llamado «datos» sin tipo ni descripción. ¿Qué falla?',
    options: [
      {
        id: 'a',
        text: 'El esquema no guía la propuesta del modelo',
        correct: true,
        rationale:
          'Correcto: sin tipo ni descripción, el modelo rellena a ciegas y la validación no puede exigir nada.',
      },
      {
        id: 'b',
        text: 'Nada: el modelo deduce el tipo del contexto',
        correct: false,
        rationale:
          'Deducirá algo, y probablemente distinto en cada llamada. Un contrato vago produce propuestas vagas.',
      },
      {
        id: 'c',
        text: 'Cuantos más campos libres, mejor para el modelo',
        correct: false,
        rationale:
          'La libertad de formato es libertad de error. El esquema existe para acotar, no para abrir.',
      },
    ],
    explanation:
      'El esquema es la interfaz con el modelo: tipos, obligatoriedad y descripción de cada campo. Cuando falta, el modelo improvisa y la validación no tiene con qué rechazar la improvisación.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'fc-tool-count',
    competencyId: 'function-calling-contracts',
    difficulty: 2,
    prompt: 'Le das veinte herramientas a un agente para una tarea que usa tres. ¿Qué efecto tiene?',
    options: [
      {
        id: 'a',
        text: 'Más opciones equivocadas en cada paso',
        correct: true,
        rationale:
          'Correcto: cada herramienta innecesaria es una decisión más en la que el modelo puede fallar.',
      },
      {
        id: 'b',
        text: 'Más capacidad: siempre es mejor tener más',
        correct: false,
        rationale:
          'La capacidad no crece con el catálogo. Crece la superficie donde elegir mal y gastar contexto.',
      },
      {
        id: 'c',
        text: 'Menos coste, porque hay más donde elegir',
        correct: false,
        rationale:
          'Cada declaración ocupa contexto y se paga en todas las llamadas. El coste sube, no baja.',
      },
    ],
    explanation:
      'El catálogo de herramientas es parte del diseño del agente. Exponer lo que no se necesita añade ruido en cada decisión y consume presupuesto en cada llamada.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'fc-idempotency',
    competencyId: 'function-calling-contracts',
    difficulty: 3,
    prompt: 'Una herramienta crea un pedido y puede reintentarse por un fallo de red. ¿Qué hace falta?',
    options: [
      {
        id: 'a',
        text: 'Una clave de idempotencia por operación',
        correct: true,
        rationale:
          'Correcto: así el reintento se reconoce como el mismo pedido y no se duplica el efecto.',
      },
      {
        id: 'b',
        text: 'Reintentar con otra temperatura de generación',
        correct: false,
        rationale:
          'La temperatura no interviene en el efecto de la herramienta. El pedido se duplicaría igual.',
      },
      {
        id: 'c',
        text: 'Avisar al modelo de que no duplique pedidos',
        correct: false,
        rationale:
          'El modelo no controla la red ni el reintento. Es una garantía que debe dar el sistema.',
      },
    ],
    explanation:
      'Con efectos irreversibles, el reintento es parte del camino normal: la red falla. La idempotencia es lo que separa «recuperarse de un fallo» de «cobrar dos veces».',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'fc-result-size',
    competencyId: 'function-calling-contracts',
    difficulty: 3,
    prompt: 'La herramienta devuelve 200 KB de JSON y ese resultado vuelve al modelo. ¿Qué problema hay?',
    options: [
      {
        id: 'a',
        text: 'Se come el contexto y ahoga la decisión',
        correct: true,
        rationale:
          'Correcto: el resultado compite con las instrucciones y con lo que el agente ya sabía.',
      },
      {
        id: 'b',
        text: 'Ninguno: cuanta más información, mejor decide',
        correct: false,
        rationale:
          'Más información cruda no es mejor decisión. Sin filtrar, lo relevante se pierde entre el volumen.',
      },
      {
        id: 'c',
        text: 'Solo encarece el registro de las llamadas',
        correct: false,
        rationale:
          'El coste de registro es menor. El problema real es que esos tokens se pagan y desplazan lo útil.',
      },
    ],
    explanation:
      'El resultado de una herramienta es contexto, y el contexto tiene presupuesto. Las herramientas deberían devolver lo necesario para decidir, con paginación o resumen, no el volcado completo.',
    referenceId: 'ref-openai-tokens',
  },

  {
    id: 'st-failure-midstream',
    competencyId: 'streaming-ux',
    difficulty: 2,
    prompt: 'La generación falla cuando ya se ha mostrado medio texto. ¿Qué ve el usuario?',
    options: [
      {
        id: 'a',
        text: 'Un texto incompleto sin saber que falló',
        correct: true,
        rationale:
          'Correcto: el streaming no incluye el final, así que un corte se confunde con una respuesta corta.',
      },
      {
        id: 'b',
        text: 'Nada: la interfaz borra lo mostrado',
        correct: false,
        rationale:
          'Borrar lo ya leído es peor que avisar. Lo mostrado existe, aunque no se sepa que está incompleto.',
      },
      {
        id: 'c',
        text: 'La respuesta completa, ya que se guardó entera',
        correct: false,
        rationale:
          'No se guardó nada entero: la generación se interrumpió. Lo que falta no está en ningún sitio.',
      },
    ],
    explanation:
      'El streaming necesita marcar el final de forma explícita. Sin esa señal, un fallo de red es indistinguible de una respuesta breve, y el usuario actúa sobre texto a medias.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'st-timeout-policy',
    competencyId: 'streaming-ux',
    difficulty: 2,
    prompt: 'Una generación en streaming se alarga mucho. ¿Cuándo la cortas?',
    options: [
      {
        id: 'a',
        text: 'Con un límite de tiempo explícito y avisando',
        correct: true,
        rationale:
          'Correcto: el límite convierte una espera indefinida en una decisión del sistema, con su mensaje.',
      },
      {
        id: 'b',
        text: 'Cuando el usuario se canse y recargue',
        correct: false,
        rationale:
          'Deja la decisión al azar del agotamiento. Y quien recarga pierde incluso lo que ya tenía.',
      },
      {
        id: 'c',
        text: 'Nunca: hay que dejar que termine',
        correct: false,
        rationale:
          'Una generación puede quedarse colgada mucho tiempo. Sin límite, el recurso y la paciencia se agotan.',
      },
    ],
    explanation:
      'El timeout es parte del contrato de la interfaz: define cuándo algo se considera fallido. Sin él, el sistema no puede distinguir entre lento y roto.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'st-screen-reader',
    competencyId: 'streaming-ux',
    difficulty: 3,
    prompt: 'El texto llega token a token. ¿Qué implica para quien usa lector de pantalla?',
    options: [
      {
        id: 'a',
        text: 'Anunciar el bloque completo, no cada fragmento',
        correct: true,
        rationale:
          'Correcto: un lector anunciando tokens sueltos es ininteligible. Se anuncia cuando hay contenido legible.',
      },
      {
        id: 'b',
        text: 'Anunciar cada token conforme llega',
        correct: false,
        rationale:
          'Produce una voz entrecortada imposible de seguir. El streaming visual no se traduce en audio.',
      },
      {
        id: 'c',
        text: 'Nada: el lector de pantalla lo gestiona solo',
        correct: false,
        rationale:
          'No hay magia. Una región viva que cambia cien veces por segundo es una trampa para el lector.',
      },
    ],
    explanation:
      'El streaming es una propiedad visual. Para audio, el equivalente es anunciar por bloques o al terminar, en una región viva controlada y no en cada actualización del texto.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'st-batch-context',
    competencyId: 'streaming-ux',
    difficulty: 1,
    prompt: '¿En qué caso el streaming no aporta nada?',
    options: [
      {
        id: 'a',
        text: 'Cuando el resultado lo consume un proceso por lotes',
        correct: true,
        rationale:
          'Correcto: sin persona leyendo, la entrega parcial no mejora nada y añade complejidad.',
      },
      {
        id: 'b',
        text: 'Cuando la respuesta es larga y hay que esperar',
        correct: false,
        rationale:
          'Justo ahí es donde más aporta: el usuario empieza a leer antes de que termine.',
      },
      {
        id: 'c',
        text: 'Cuando el usuario está mirando la pantalla',
        correct: false,
        rationale:
          'Es el caso ideal del streaming. La espera percibida es lo que se reduce.',
      },
    ],
    explanation:
      'El streaming mejora la percepción de espera de una persona. Si nadie espera delante de una pantalla, solo añade piezas: transporte parcial, estado intermedio y errores a mitad.',
    referenceId: 'ref-openai-tokens',
  },

  {
    id: 'ch-excessive-overlap',
    competencyId: 'chunking-and-overlap',
    difficulty: 2,
    prompt: 'Configuras un solape del 80 % entre fragmentos. ¿Qué efecto tiene?',
    options: [
      {
        id: 'a',
        text: 'Índice inflado y resultados casi duplicados',
        correct: true,
        rationale:
          'Correcto: casi todo el contenido aparece varias veces, y la recuperación devuelve copias.',
      },
      {
        id: 'b',
        text: 'Mejor recuperación: nunca se pierde contexto',
        correct: false,
        rationale:
          'Se gana continuidad a costa de duplicar. Los cinco resultados pueden ser el mismo texto repetido.',
      },
      {
        id: 'c',
        text: 'Menos coste, porque hay menos fragmentos únicos',
        correct: false,
        rationale:
          'Hay muchos más fragmentos, cada uno con su vector. El almacenamiento y el coste suben.',
      },
    ],
    explanation:
      'El solape evita cortar ideas por la mitad, y pasado cierto punto solo duplica. Un solape moderado —del orden de una frase— resuelve el corte sin llenar el índice de copias.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ch-section-title',
    competencyId: 'chunking-and-overlap',
    difficulty: 2,
    prompt: 'Guardas el título de la sección en cada fragmento. ¿Para qué sirve?',
    options: [
      {
        id: 'a',
        text: 'Para que el trozo tenga contexto propio',
        correct: true,
        rationale:
          'Correcto: un párrafo suelto puede no decir de qué habla. El título lo sitúa sin leer el resto.',
      },
      {
        id: 'b',
        text: 'Para que el índice ocupe menos espacio',
        correct: false,
        rationale:
          'Añade texto a cada fragmento, así que ocupa más. El beneficio es de comprensión, no de tamaño.',
      },
      {
        id: 'c',
        text: 'Para contar mejor los tokens gastados',
        correct: false,
        rationale:
          'El conteo no lo necesita: se mide sobre lo que se envía. El título sirve al contenido.',
      },
    ],
    explanation:
      'Un fragmento recuperado se lee aislado. Sin el título de su sección, el modelo tiene que deducir el tema de un párrafo que quizá empieza a mitad de una idea.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ch-semantic-cuts',
    competencyId: 'chunking-and-overlap',
    difficulty: 3,
    prompt: 'Cortar por unidades de significado en vez de por longitud. ¿Qué se gana?',
    options: [
      {
        id: 'a',
        text: 'Fragmentos que se entienden por sí solos',
        correct: true,
        rationale:
          'Correcto: el corte respeta la estructura del texto, así que la unidad recuperada tiene sentido.',
      },
      {
        id: 'b',
        text: 'Un índice bastante más pequeño',
        correct: false,
        rationale:
          'El tamaño depende del contenido, no del criterio de corte. Los dos índices pesan parecido.',
      },
      {
        id: 'c',
        text: 'Indexar mucho más rápido',
        correct: false,
        rationale:
          'Detectar unidades semánticas cuesta más que cortar cada N caracteres. Se gana calidad.',
      },
    ],
    explanation:
      'El corte por longitud es barato y rompe ideas. El corte por estructura respeta las unidades que el autor escribió, y por eso los fragmentos recuperados se pueden usar tal cual.',
    referenceId: 'ref-openai-tokens',
  },
  {
    id: 'ch-measuring-chunking',
    competencyId: 'chunking-and-overlap',
    difficulty: 3,
    prompt: '¿Cómo sabes si tu troceado funciona?',
    options: [
      {
        id: 'a',
        text: 'Midiendo si recuperas lo que responde',
        correct: true,
        rationale:
          'Correcto: la prueba es si el fragmento correcto aparece en los candidatos, no cómo se ve el índice.',
      },
      {
        id: 'b',
        text: 'Mirando el tamaño medio de los fragmentos',
        correct: false,
        rationale:
          'Un promedio bonito no dice nada del acierto. Se puede trocear mal con un tamaño ideal.',
      },
      {
        id: 'c',
        text: 'Contando cuántos fragmentos ha generado',
        correct: false,
        rationale:
          'El número habla de coste, no de calidad de recuperación. No informa de si sirve.',
      },
    ],
    explanation:
      'El troceado se evalúa por su efecto en la recuperación: con un conjunto de preguntas y sus fragmentos correctos, se mide si el troceado los saca. Lo demás son métricas de forma.',
    referenceId: 'ref-rules-ml',
  },

  {
    id: 'hr-weight-by-measurement',
    competencyId: 'hybrid-retrieval',
    difficulty: 2,
    prompt: '¿Cómo decides cuánto peso dar a la búsqueda léxica frente a la vectorial?',
    options: [
      {
        id: 'a',
        text: 'Midiéndolo con consultas reales de tu corpus',
        correct: true,
        rationale:
          'Correcto: el equilibrio depende de los datos y de cómo preguntan los usuarios, no de una receta.',
      },
      {
        id: 'b',
        text: 'Mitad y mitad: es el reparto más justo',
        correct: false,
        rationale:
          'La simetría es una elección estética. En un corpus lleno de códigos, lo léxico debería pesar más.',
      },
      {
        id: 'c',
        text: 'Todo vectorial: es la técnica más moderna',
        correct: false,
        rationale:
          'La novedad no es criterio. Si los usuarios buscan identificadores exactos, lo vectorial falla.',
      },
    ],
    explanation:
      'La mezcla óptima es una propiedad del corpus y de las consultas. Se decide con un conjunto de preguntas y midiendo qué combinación recupera mejor la respuesta correcta.',
    referenceId: 'ref-attention',
  },
  {
    id: 'hr-two-query-kinds',
    competencyId: 'hybrid-retrieval',
    difficulty: 2,
    prompt: 'Los usuarios buscan tanto códigos exactos como preguntas redactadas. ¿Qué implica?',
    options: [
      {
        id: 'a',
        text: 'Que hacen falta las dos señales a la vez',
        correct: true,
        rationale:
          'Correcto: cada señal cubre un tipo de consulta que la otra no resuelve bien.',
      },
      {
        id: 'b',
        text: 'Que basta con la búsqueda por lenguaje natural',
        correct: false,
        rationale:
          'Deja sin cubrir las consultas exactas, que son justo donde lo vectorial pierde.',
      },
      {
        id: 'c',
        text: 'Que hay que normalizar todas las consultas a códigos',
        correct: false,
        rationale:
          'Forzar la forma cambia lo que el usuario quiere decir. Se adapta el sistema, no la consulta.',
      },
    ],
    explanation:
      'La búsqueda híbrida existe porque los usuarios no preguntan de una sola manera. Elegir una señal obliga a perder la mitad de los casos; combinarlas cubre ambas formas.',
    referenceId: 'ref-attention',
  },
  {
    id: 'hr-parallel-latency',
    competencyId: 'hybrid-retrieval',
    difficulty: 3,
    prompt: 'Ejecutas las dos búsquedas en paralelo y luego fusionas. ¿Cómo queda la latencia?',
    options: [
      {
        id: 'a',
        text: 'La de la más lenta, no la suma de ambas',
        correct: true,
        rationale:
          'Correcto: en paralelo se solapan, así que manda la que tarda más más el tiempo de fusión.',
      },
      {
        id: 'b',
        text: 'La suma de las dos, aunque vayan en paralelo',
        correct: false,
        rationale:
          'En serie se sumarían. En paralelo se solapan, y por eso conviene lanzarlas a la vez.',
      },
      {
        id: 'c',
        text: 'Se multiplica el tiempo de la más rápida',
        correct: false,
        rationale:
          'No hay multiplicación. El tiempo lo marca la más lenta, más el coste pequeño de fusionar.',
      },
    ],
    explanation:
      'El paralelismo es lo que hace viable la búsqueda híbrida: dos consultas simultáneas cuestan lo que la más lenta. Hacerlas en serie duplicaría la espera sin mejorar el resultado.',
    referenceId: 'ref-attention',
  },
  {
    id: 'hr-recall-precision-split',
    competencyId: 'hybrid-retrieval',
    difficulty: 3,
    prompt: 'Recuperas cien candidatos y acabas usando cinco. ¿Qué aporta cada fase?',
    options: [
      {
        id: 'a',
        text: 'Recuperar da cobertura; reordenar, precisión',
        correct: true,
        rationale:
          'Correcto: la recuperación barata no debe dejar fuera lo importante; el reordenador afina el orden.',
      },
      {
        id: 'b',
        text: 'Recuperar da precisión; reordenar, cobertura',
        correct: false,
        rationale:
          'Es al revés. Recuperar con cien candidatos prioriza no perder nada; el orden llega después.',
      },
      {
        id: 'c',
        text: 'Las dos fases hacen exactamente lo mismo',
        correct: false,
        rationale:
          'Si hicieran lo mismo, la segunda sobraría. Se dividen el trabajo por coste y por alcance.',
      },
    ],
    explanation:
      'La división es económica: recuperar es barato y se permite mirar mucho; reordenar es caro y solo mira unos pocos. Cada fase optimiza una cosa distinta.',
    referenceId: 'ref-attention',
  },

  {
    id: 'gr-abstention-message',
    competencyId: 'grounding-and-citations',
    difficulty: 2,
    prompt: 'El sistema no encuentra respaldo y se abstiene. ¿Qué debería ofrecer?',
    options: [
      {
        id: 'a',
        text: 'Qué buscó y qué no encontró',
        correct: true,
        rationale:
          'Correcto: la abstención es información útil si dice qué se consultó y qué faltó.',
      },
      {
        id: 'b',
        text: 'Una disculpa breve y nada más',
        correct: false,
        rationale:
          'Disculparse no ayuda a decidir el siguiente paso. Falta el detalle de qué se intentó.',
      },
      {
        id: 'c',
        text: 'Una respuesta aproximada, avisando del riesgo',
        correct: false,
        rationale:
          'Rompe la promesa del sistema. Si no hay respaldo, una aproximación es exactamente lo que no se quería.',
      },
    ],
    explanation:
      'Abstenerse es una respuesta de primera clase, no un fallo: permite al usuario reformular o buscar en otra fuente. Para eso tiene que saber qué se miró y por qué no bastó.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gr-chunk-identifier',
    competencyId: 'grounding-and-citations',
    difficulty: 2,
    prompt: '¿Qué necesita cada fragmento para poder citarse de forma verificable?',
    options: [
      {
        id: 'a',
        text: 'Un identificador estable y localizable',
        correct: true,
        rationale:
          'Correcto: sin identificador que resuelva al fragmento, la cita no se puede comprobar.',
      },
      {
        id: 'b',
        text: 'Su texto completo copiado en la respuesta',
        correct: false,
        rationale:
          'Duplicar el texto infla la salida y no localiza nada. Hace falta la referencia, no la copia.',
      },
      {
        id: 'c',
        text: 'Su posición exacta en tokens del modelo',
        correct: false,
        rationale:
          'La posición en tokens no le dice nada al lector ni permite volver al documento.',
      },
    ],
    explanation:
      'Una cita útil resuelve a un fragmento concreto. Eso exige un identificador estable —documento, sección, fragmento— que sobreviva a la reindexación y que el lector pueda abrir.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gr-partial-support',
    competencyId: 'grounding-and-citations',
    difficulty: 3,
    prompt: 'El fragmento citado respalda la primera mitad de la frase, no la segunda. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Recortar la afirmación a lo respaldado',
        correct: true,
        rationale:
          'Correcto: se ajusta la respuesta a la evidencia disponible, en vez de estirar la cita.',
      },
      {
        id: 'b',
        text: 'Citarlo igual: la mitad ya está probada',
        correct: false,
        rationale:
          'La cita avalaría una frase que dice más de lo que el fragmento sostiene. Eso es precisamente lo que hay que evitar.',
      },
      {
        id: 'c',
        text: 'Añadir otra frase para compensar la falta',
        correct: false,
        rationale:
          'Añadir texto sin respaldo agrava el problema. Lo que falta es evidencia, no palabras.',
      },
    ],
    explanation:
      'La unidad de verificación es la afirmación, no el párrafo. Si la evidencia cubre una parte, la respuesta se recorta a esa parte y se dice qué queda sin cubrir.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'gr-citation-utility',
    competencyId: 'grounding-and-citations',
    difficulty: 1,
    prompt: '¿Qué hace útil una cita para quien la lee?',
    options: [
      {
        id: 'a',
        text: 'Poder abrir la fuente y comprobarla',
        correct: true,
        rationale:
          'Correcto: la cita sirve si lleva al texto. Su valor es la verificación, no la apariencia.',
      },
      {
        id: 'b',
        text: 'Que sea extensa y detallada',
        correct: false,
        rationale:
          'Una cita larga puede ser más difícil de comprobar. Lo que importa es que resuelva a la fuente.',
      },
      {
        id: 'c',
        text: 'Que aparezca siempre al final del texto',
        correct: false,
        rationale:
          'La posición es una decisión de formato. No determina si la cita se puede verificar.',
      },
    ],
    explanation:
      'Una cita es un puntero verificable. Si el lector no puede llegar al fragmento y leerlo, la cita solo añade apariencia de rigor, que es peor que no citar.',
    referenceId: 'ref-anthropic-system',
  },
];
