/**
 * Área 01 — Fundamentos.
 *
 * Tres competencias nuevas (la cuarta, `ai-ml-dl-boundaries`, vivía ya en `lessons.ts` e
 * `items.ts`). A partir de aquí el contenido se organiza **por área**, que es la unidad de
 * autoría: una persona escribe un área completa y el linter dice si cumple.
 *
 * Restricción de estilo que no es obvia: las opciones de un ítem deben tener longitudes
 * parecidas (R6). Si la correcta es mucho más larga que las demás, se acierta por forma y
 * no por conocimiento.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_01: readonly Lesson[] = [
  {
    competencyId: 'supervised-vs-unsupervised',
    whatIs:
      'Aprendizaje supervisado es aprender de ejemplos con respuesta conocida: cada entrada trae su etiqueta. No supervisado es buscar estructura sin respuesta: agrupar, reducir dimensión, detectar lo raro. Aprendizaje por refuerzo es aprender qué acción tomar en un entorno, a partir de la recompensa que llega después.',
    problem:
      'El paradigma se elige por moda o por comodidad, no por el dato disponible. Y el dato disponible es justo lo que decide: si no hay etiquetas, el supervisado no puede existir por mucho que se insista.',
    internals: [
      'La etiqueta es el recurso escaso. Todo lo demás —modelo, cómputo, ajuste— se compra; la etiqueta fiable se produce a mano y cuesta.',
      'Supervisado resuelve predicción: clasificar o estimar un valor concreto que te interesa.',
      'No supervisado resuelve exploración: no dice "esto es un fraude", dice "estos se parecen entre sí".',
      'Refuerzo no tiene respuesta correcta por ejemplo: tiene una señal de recompensa diferida, y por eso tarda en aprender.',
    ],
    whenToUse: [
      'Supervisado: hay etiquetas fiables y el objetivo es predecir algo concreto.',
      'No supervisado: quieres agrupar o reducir antes de saber qué buscas, y no hay etiquetas.',
      'Refuerzo: existe un entorno donde actuar y una forma de medir la consecuencia de la acción.',
    ],
    whenNotToUse: [
      'No uses no supervisado para "predecir" una etiqueta que necesitas: agrupar no es clasificar.',
      'No uses refuerzo si no puedes medir la recompensa de forma barata y repetida.',
    ],
    pitfalls: [
      {
        title: 'Creer que el clustering descubre las clases que te importan',
        detail:
          'Agrupa por similitud según las variables que le diste. Puede separar por un rasgo irrelevante y dejarte grupos que no significan nada para el negocio.',
      },
      {
        title: 'Entrenar con etiquetas ruidosas y llamarlo supervisado',
        detail:
          'El modelo aprende el ruido con la misma dedicación que la señal. Antes de modelar, hay que medir cuánto se equivoca quien etiqueta.',
      },
    ],
    referenceIds: ['ref-isl', 'ref-dl-book'],
  },
  {
    competencyId: 'generalization-overfitting',
    whatIs:
      'Generalizar es rendir bien sobre datos que no se han visto durante el entrenamiento. Sobreajustar es lo contrario: bajar el error memorizando los ejemplos disponibles, incluido su ruido, de forma que el rendimiento se desploma en cuanto el dato es nuevo.',
    problem:
      'La métrica que se mira suele ser la de entrenamiento, y esa siempre mejora. Es posible tener un modelo que acierte el 98 % de lo que ya vio y el 61 % de lo que verá.',
    internals: [
      'Se parte el dato: entrenamiento para ajustar, validación para decidir, prueba para estimar al final.',
      'La brecha entre entrenamiento y validación es la señal: si es grande, el modelo está memorizando.',
      'La capacidad del modelo y el tamaño del dato empujan en direcciones opuestas: más capacidad con pocos datos sobreajusta.',
      'La fuga de datos es el caso extremo: el test se cuela en el entrenamiento y las métricas salen perfectas.',
    ],
    whenToUse: [
      'Siempre: mide sobre datos que el modelo no ha visto, aunque sea una partición pequeña.',
      'Con pocos datos: usa validación cruzada para no depender del azar de una sola partición.',
    ],
    whenNotToUse: [
      'No elijas el modelo mirando el conjunto de prueba: deja de ser una estimación independiente.',
      'No normalices ni imputes usando el dataset completo antes de partir: es fuga de datos.',
    ],
    pitfalls: [
      {
        title: 'Ajustar contra el conjunto de prueba',
        detail:
          'Cada vez que decides algo mirando el test, el test deja de medir generalización. Se toca una vez, al final, o no se toca.',
      },
      {
        title: 'Confundir una métrica alta con un modelo útil',
        detail:
          'Un 99 % en un dataset desequilibrado puede conseguirse sin aprender nada: prediciendo siempre la clase mayoritaria.',
      },
    ],
    referenceIds: ['ref-isl'],
  },
  {
    competencyId: 'deterministic-vs-learned',
    whatIs:
      'La lógica determinista produce siempre la misma salida para la misma entrada y se puede leer. La inferencia aprendida produce una salida probable, que depende de un modelo ajustado con datos y que no se puede recorrer línea a línea.',
    problem:
      'Se introduce un modelo donde bastaba una regla, y con él llegan la latencia, el coste por llamada y la variación entre ejecuciones. O al contrario: se intenta escribir a mano una regla para algo que no se puede enumerar, como reconocer lenguaje natural.',
    internals: [
      'El determinismo es una propiedad operativa: permite repetir, auditar y probar. Perderla es un coste, no un detalle.',
      'Un modelo aporta cuando el espacio de entradas es abierto y no puedes escribir las reglas que lo cubren.',
      'El coste oculto no es el entrenamiento: es el por-llamada, la latencia y la imposibilidad de garantizar el resultado.',
      'La pregunta que decide: ¿puedo enumerar las reglas que resuelven esto? Si la respuesta es sí, el modelo sobra.',
    ],
    whenToUse: [
      'Reglas: dominios explícitos y acotados, donde cada decisión debe poder justificarse.',
      'Modelo: percepción, lenguaje o casos donde las reglas no se pueden enumerar ni mantener.',
    ],
    whenNotToUse: [
      'No uses un modelo para cálculos exactos: nómina, impuestos, facturación, saldos.',
      'No intentes escribir reglas para reconocer lenguaje libre: el espacio es inabarcable.',
    ],
    pitfalls: [
      {
        title: 'Poner el modelo en el camino crítico de una decisión exacta',
        detail:
          'Si el resultado tiene que cuadrar al céntimo, el modelo puede proponer pero la validación y el cálculo deben ser deterministas.',
      },
      {
        title: 'Mezclar reglas y modelo sin saber quién decide',
        detail:
          'Cuando la lógica se reparte entre un `if` y una llamada al modelo, nadie puede explicar una decisión concreta. Hay que poder señalar el sitio donde se decide.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
];

export const ITEMS_AREA_01: readonly Item[] = [
  // ── supervised-vs-unsupervised ──────────────────────────────────────────────
  {
    id: 'sup-no-labels',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 1,
    prompt:
      'Tienes 50 000 tickets sin etiquetar y quieres clasificarlos por tipo. ¿Qué haces primero?',
    options: [
      {
        id: 'a',
        text: 'Etiquetar una muestra y entrenar con ella',
        correct: true,
        rationale:
          'Correcto: sin etiquetas no hay señal supervisada. Se etiqueta una muestra representativa y se empieza por ahí.',
      },
      {
        id: 'b',
        text: 'Entrenar el clasificador con los 50 000',
        correct: false,
        rationale:
          'No hay nada que aprender: el modelo necesita saber cuál es la respuesta para poder imitarla.',
      },
      {
        id: 'c',
        text: 'Agruparlos y llamar a los grupos "tipos"',
        correct: false,
        rationale:
          'Confunde agrupar con clasificar. Los grupos se parecen entre sí, pero no tienen por qué ser tus tipos.',
      },
    ],
    explanation:
      'Un clasificador supervisado aprende de pares entrada-etiqueta. Si no existen las etiquetas, el problema no es de modelo sino de datos: hay que producirlas antes de elegir técnica.',
    referenceId: 'ref-isl',
  },
  {
    id: 'sup-clustering-meaning',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 2,
    prompt:
      'Un clustering separa a los clientes en cinco grupos. ¿Qué has obtenido exactamente?',
    options: [
      {
        id: 'a',
        text: 'Grupos por similitud que hay que interpretar',
        correct: true,
        rationale:
          'Correcto: el algoritmo agrupa por cercanía según las variables dadas. El significado lo pone quien lo lee.',
      },
      {
        id: 'b',
        text: 'Cinco segmentos de negocio listos para usar',
        correct: false,
        rationale:
          'Da por hecho que la similitud matemática coincide con un segmento útil, y eso hay que comprobarlo.',
      },
      {
        id: 'c',
        text: 'Un clasificador entrenado sin etiquetas',
        correct: false,
        rationale:
          'No existe tal cosa: sin etiquetas no hay clasificación, solo agrupación o reducción.',
      },
    ],
    explanation:
      'El clustering descubre estructura, no categorías con significado. Sus grupos pueden separarse por una variable irrelevante, así que interpretarlos y validarlos es parte del trabajo, no un extra.',
    referenceId: 'ref-isl',
  },
  {
    id: 'sup-reinforcement-when',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 2,
    prompt: '¿En qué situación el aprendizaje por refuerzo es la elección natural?',
    options: [
      {
        id: 'a',
        text: 'Un agente que actúa y recibe recompensa',
        correct: true,
        rationale:
          'Correcto: hay un entorno, acciones y una consecuencia medible. Eso es exactamente lo que el refuerzo necesita.',
      },
      {
        id: 'b',
        text: 'Clasificar correos con etiquetas de spam',
        correct: false,
        rationale:
          'Hay respuesta correcta conocida por ejemplo: es supervisado clásico, no refuerzo.',
      },
      {
        id: 'c',
        text: 'Agrupar documentos sin etiquetas previas',
        correct: false,
        rationale:
          'No hay acciones ni recompensa: es un problema de agrupación, no de decisión secuencial.',
      },
    ],
    explanation:
      'El refuerzo encaja cuando decides acciones dentro de un entorno y solo después sabes si salió bien. Si ya tienes la respuesta por ejemplo, no necesitas esperar recompensa: es supervisado.',
    referenceId: 'ref-isl',
  },
  {
    id: 'sup-label-cost',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 3,
    prompt:
      'El equipo dice: "no tenemos etiquetas, pero el modelo las deducirá solo". ¿Qué contestas?',
    options: [
      {
        id: 'a',
        text: 'Sin etiquetas hay que producirlas o cambiar de enfoque',
        correct: true,
        rationale:
          'Correcto: la etiqueta es el recurso que falta. O se etiqueta, o se plantea un problema no supervisado distinto.',
      },
      {
        id: 'b',
        text: 'Que use un LLM para etiquetar sin revisar nada',
        correct: false,
        rationale:
          'Sustituye un problema de etiquetado por uno de confianza: el modelo aprende los errores del etiquetador automático.',
      },
      {
        id: 'c',
        text: 'Que entrene igual y mida la exactitud final',
        correct: false,
        rationale:
          'Sin etiquetas no hay contra qué medir: la métrica saldría inventada y no diría si aprendió algo.',
      },
    ],
    explanation:
      'Etiquetar con un modelo es posible, pero convierte la calidad del etiquetador en techo del sistema, y sin revisión humana ese techo es desconocido. El trabajo de etiquetar no desaparece: cambia de sitio.',
    referenceId: 'ref-isl',
  },

  // ── generalization-overfitting ──────────────────────────────────────────────
  {
    id: 'gen-train-vs-unseen',
    competencyId: 'generalization-overfitting',
    difficulty: 1,
    prompt:
      'Un modelo acierta el 98 % sobre los datos de entrenamiento y el 61 % sobre datos que nunca vio. ¿Qué está pasando?',
    options: [
      {
        id: 'a',
        text: 'Está sobreajustado: memorizó el entrenamiento',
        correct: true,
        rationale:
          'Correcto: la brecha entre lo visto y lo no visto es la firma del sobreajuste. Aprendió el ruido de esos datos.',
      },
      {
        id: 'b',
        text: 'Los datos nuevos están mal recogidos',
        correct: false,
        rationale:
          'Es la primera excusa y casi nunca la causa. Antes de culpar al dato nuevo, mira la brecha.',
      },
      {
        id: 'c',
        text: 'Necesita más capas para mejorar',
        correct: false,
        rationale:
          'Más capacidad suele empeorar este caso: daría todavía más margen para memorizar el entrenamiento.',
      },
    ],
    explanation:
      'La diferencia entre entrenamiento y datos no vistos mide generalización. Cuanto mayor es la brecha, más está memorizando el modelo en vez de aprender la regla subyacente.',
    referenceId: 'ref-isl',
  },
  {
    id: 'gen-normalize-leak',
    competencyId: 'generalization-overfitting',
    difficulty: 2,
    prompt:
      'Normalizas con la media de todo el dataset y después lo partes en entrenamiento y prueba. ¿Qué has hecho?',
    options: [
      {
        id: 'a',
        text: 'Filtrar información del test: métricas optimistas',
        correct: true,
        rationale:
          'Correcto: la media incluye el test. El modelo ya sabe algo del conjunto con el que vas a evaluarlo.',
      },
      {
        id: 'b',
        text: 'Nada relevante: normalizar es un paso estándar',
        correct: false,
        rationale:
          'El paso es estándar; el orden no. Lo que se calcula con el test contamina la estimación final.',
      },
      {
        id: 'c',
        text: 'Acelerar la convergencia del entrenamiento',
        correct: false,
        rationale:
          'Puede converger mejor, pero el problema no es la velocidad: es que la métrica ya no es honesta.',
      },
    ],
    explanation:
      'Cualquier estadístico calculado con todo el dataset —media, mediana, máximos— introduce fuga de datos. Se calcula con el entrenamiento y se aplica al resto con esos mismos valores.',
    referenceId: 'ref-isl',
  },
  {
    id: 'gen-test-touching',
    competencyId: 'generalization-overfitting',
    difficulty: 2,
    prompt:
      'Pruebas cuarenta configuraciones y eliges la que mejor puntúa en el conjunto de prueba. ¿Qué ha pasado?',
    options: [
      {
        id: 'a',
        text: 'El test deja de ser una estimación independiente',
        correct: true,
        rationale:
          'Correcto: has usado el test para decidir, así que la cifra final está ajustada a él y será optimista.',
      },
      {
        id: 'b',
        text: 'Nada: más pruebas dan siempre mejor modelo',
        correct: false,
        rationale:
          'Elegir mirando el test es entrenar con el test, aunque el modelo no haya visto esas filas.',
      },
      {
        id: 'c',
        text: 'El entrenamiento se ha sobreajustado',
        correct: false,
        rationale:
          'El sobreajuste es del modelo contra el entrenamiento; aquí el problema es de la estimación.',
      },
    ],
    explanation:
      'El conjunto de prueba sirve para estimar una vez, al final. Cada decisión tomada mirándolo lo convierte en un conjunto de validación encubierto y la métrica pierde su sentido.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'gen-small-data-split',
    competencyId: 'generalization-overfitting',
    difficulty: 3,
    prompt:
      'Tienes 300 ejemplos y haces una única partición 70/30. ¿Cuál es el riesgo principal?',
    options: [
      {
        id: 'a',
        text: 'La estimación depende del azar de la partición',
        correct: true,
        rationale:
          'Correcto: con tan pocos datos, cambiar la semilla puede mover la métrica varios puntos.',
      },
      {
        id: 'b',
        text: 'Ninguno: con 300 ejemplos ya hay muestra',
        correct: false,
        rationale:
          'El tamaño no elimina el problema. Con 300 filas, el 30 % son 90 casos y un par de difíciles pesan mucho.',
      },
      {
        id: 'c',
        text: 'Que conviene pasar a deep learning',
        correct: false,
        rationale:
          'Con 300 ejemplos el deep learning suele empeorar: memoriza más rápido de lo que generaliza.',
      },
    ],
    explanation:
      'Con pocos datos, una sola partición es una estimación de alta varianza. La validación cruzada repite el reparto y da una media con dispersión, que es lo que permite decidir con fundamento.',
    referenceId: 'ref-isl',
  },

  // ── deterministic-vs-learned ────────────────────────────────────────────────
  {
    id: 'det-payroll',
    competencyId: 'deterministic-vs-learned',
    difficulty: 1,
    prompt: 'Hay que calcular la nómina mensual de 800 empleados. ¿Reglas o modelo?',
    options: [
      {
        id: 'a',
        text: 'Reglas: cálculo exacto, auditable y repetible',
        correct: true,
        rationale:
          'Correcto: el resultado tiene que cuadrar al céntimo y poder justificarse ante cualquiera.',
      },
      {
        id: 'b',
        text: 'Un modelo entrenado con nóminas anteriores',
        correct: false,
        rationale:
          'Nadie aceptaría una nómina "probablemente correcta". La exactitud no es negociable aquí.',
      },
      {
        id: 'c',
        text: 'Un LLM que calcule cada mes el importe',
        correct: false,
        rationale:
          'Introduce variación donde se exige exactitud, y sin garantía de que el cálculo sea el mismo dos veces.',
      },
    ],
    explanation:
      'Cuando el dominio es explícito y el resultado debe ser exacto y justificable, la lógica determinista es la única opción defendible. Un modelo añadiría incertidumbre sin resolver nada nuevo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'det-open-space',
    competencyId: 'deterministic-vs-learned',
    difficulty: 2,
    prompt: '¿Por qué no se resuelven las reseñas libres con reglas explícitas?',
    options: [
      {
        id: 'a',
        text: 'Porque las formas de escribir son ilimitadas',
        correct: true,
        rationale:
          'Correcto: el espacio de entradas es abierto. Cada regla nueva deja fuera cientos de formas de decir lo mismo.',
      },
      {
        id: 'b',
        text: 'Porque las reglas son demasiado lentas',
        correct: false,
        rationale:
          'Una regla es más rápida que un modelo. El problema es la cobertura, no la velocidad.',
      },
      {
        id: 'c',
        text: 'Porque un modelo siempre cuesta menos',
        correct: false,
        rationale:
          'No siempre: un modelo añade coste por llamada y latencia. Aquí se elige por cobertura, no por precio.',
      },
    ],
    explanation:
      'La frontera práctica no es la sofisticación sino la enumerabilidad: si puedes escribir las reglas que cubren el caso, escríbelas; si el espacio es abierto, necesitas aprender de ejemplos.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'det-audit-demand',
    competencyId: 'deterministic-vs-learned',
    difficulty: 2,
    prompt:
      'Un regulador exige explicar cada decisión y poder reproducirla. ¿Qué implica para el sistema?',
    options: [
      {
        id: 'a',
        text: 'Lógica explícita, o poder justificar la salida',
        correct: true,
        rationale:
          'Correcto: o la decisión está en reglas legibles, o hay que poder demostrar por qué salió eso mismo otra vez.',
      },
      {
        id: 'b',
        text: 'Basta con decir que decide un modelo',
        correct: false,
        rationale:
          'Nombrar la técnica no es explicar la decisión. El requisito es sobre el caso concreto, no sobre el método.',
      },
      {
        id: 'c',
        text: 'Se resuelve entrenando con más datos',
        correct: false,
        rationale:
          'Más datos mejoran el promedio, no la trazabilidad de una decisión individual.',
      },
    ],
    explanation:
      'Auditoría exige reproducibilidad: misma entrada, misma salida, y una razón legible. Si el modelo es imprescindible, la explicabilidad se construye alrededor, no se supone.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'det-hybrid-care',
    competencyId: 'deterministic-vs-learned',
    difficulty: 3,
    prompt:
      'Vas a combinar reglas y un modelo en la misma decisión. ¿Qué cuidado es imprescindible?',
    options: [
      {
        id: 'a',
        text: 'Poder señalar dónde se decide y validar fuera',
        correct: true,
        rationale:
          'Correcto: si la lógica está repartida sin un punto claro, nadie puede explicar una decisión concreta.',
      },
      {
        id: 'b',
        text: 'Que el modelo valide sus propias salidas',
        correct: false,
        rationale:
          'Un modelo no puede ser juez de sí mismo: repetiría sus mismos errores con otra forma.',
      },
      {
        id: 'c',
        text: 'Ninguno: es lo habitual en producción',
        correct: false,
        rationale:
          'Que sea habitual no lo hace seguro. La mezcla sin frontera clara es donde se pierden las auditorías.',
      },
    ],
    explanation:
      'En sistemas híbridos, la regla de oro es que exista un punto único donde se decide y que la validación sea determinista. El modelo propone; algo verificable dispone.',
    referenceId: 'ref-rules-ml',
  },

  // ── segunda tanda: hasta 8 ítems por competencia ────────────────────────────

  {
    id: 'ml-unstructured-data',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 2,
    prompt: '¿Qué tipo de dato hace que el deep learning sea la opción natural?',
    options: [
      {
        id: 'a',
        text: 'Texto o imagen crudos, sin variables definidas',
        correct: true,
        rationale:
          'Correcto: sin variables dadas de antemano, las capas aprenden representaciones. Ese es su terreno.',
      },
      {
        id: 'b',
        text: 'Una tabla de ventas con veinte columnas',
        correct: false,
        rationale:
          'Con variables ya significativas, el machine learning clásico suele rendir igual y cuesta menos operar.',
      },
      {
        id: 'c',
        text: 'Un cálculo con reglas contables estables',
        correct: false,
        rationale:
          'Eso pide reglas, no un modelo: es determinista, auditable y no necesita aprender nada.',
      },
    ],
    explanation:
      'El deep learning brilla cuando el dato es no estructurado y abundante: texto, audio, imagen. Donde las variables ya vienen dadas, su ventaja desaparece y su coste de operación sigue ahí.',
    referenceId: 'ref-dl-book',
  },
  {
    id: 'ml-explainability-demand',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 3,
    prompt: 'Un regulador exige explicar por qué se denegó un crédito. ¿Qué implica para el sistema?',
    options: [
      {
        id: 'a',
        text: 'Lógica explícita, o modelo explicable con validación fuera',
        correct: true,
        rationale:
          'Correcto: hay que poder justificar el caso concreto, no solo el promedio del modelo.',
      },
      {
        id: 'b',
        text: 'Cualquier modelo, siempre que su precisión sea alta',
        correct: false,
        rationale:
          'La precisión describe el promedio. El requisito habla de una decisión individual y de sus razones.',
      },
      {
        id: 'c',
        text: 'Basta con documentar el conjunto de entrenamiento',
        correct: false,
        rationale:
          'Documentar los datos no explica por qué esa solicitud se denegó. Faltan las razones del caso.',
      },
    ],
    explanation:
      'Explicar una decisión exige trazabilidad sobre ese caso: qué reglas o qué factores intervinieron. Si el modelo es imprescindible, la explicación se construye alrededor y se valida, no se supone.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'ml-model-not-magic',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 1,
    prompt: 'El equipo espera que el modelo «descubra» solo qué es fraude. ¿Qué falta en ese plan?',
    options: [
      {
        id: 'a',
        text: 'Ejemplos de fraude ya etiquetados como tales',
        correct: true,
        rationale:
          'Correcto: sin ejemplos de lo que quieres detectar no hay señal que imitar, solo intuición.',
      },
      {
        id: 'b',
        text: 'Más capacidad de cálculo para el modelo',
        correct: false,
        rationale:
          'El cómputo acelera el entrenamiento de algo que ya está definido. No define el objetivo.',
      },
      {
        id: 'c',
        text: 'Un prompt mejor escrito sobre el problema',
        correct: false,
        rationale:
          'Un prompt describe la tarea, no la enseña. Sin ejemplos, el modelo adivina qué cuenta como fraude.',
      },
    ],
    explanation:
      'Un modelo aprende de ejemplos, no de intenciones. Si nadie ha marcado qué operaciones fueron fraude, el sistema no tiene contra qué ajustarse y el resultado será una definición implícita y no auditada.',
    referenceId: 'ref-isl',
  },
  {
    id: 'ml-probability-reading',
    competencyId: 'ai-ml-dl-boundaries',
    difficulty: 3,
    prompt: 'El modelo devuelve 0,82 para una clase. ¿Qué significa exactamente?',
    options: [
      {
        id: 'a',
        text: 'Una estimación con error, no una garantía',
        correct: true,
        rationale:
          'Correcto: es una probabilidad asignada por el modelo, con su calibración y su margen de error.',
      },
      {
        id: 'b',
        text: 'Que acertará el 82 % de las veces que diga eso',
        correct: false,
        rationale:
          'Solo sería cierto si el modelo estuviera bien calibrado, y eso hay que comprobarlo aparte.',
      },
      {
        id: 'c',
        text: 'Que hay 82 casos de esa clase en los datos',
        correct: false,
        rationale:
          'Es una probabilidad por caso, no un recuento del conjunto de entrenamiento.',
      },
    ],
    explanation:
      'Un 0,82 es una estimación, y su utilidad depende de la calibración: de que cuando el modelo dice 0,8, acierte de verdad en torno al 80 % de las veces. Si la decisión exige certeza, la validación va fuera.',
    referenceId: 'ref-dl-book',
  },

  {
    id: 'sup-regression-vs-classification',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 1,
    prompt: 'Quieres predecir el precio de una vivienda a partir de sus características. ¿Qué tarea es?',
    options: [
      {
        id: 'a',
        text: 'Regresión supervisada: un número continuo',
        correct: true,
        rationale:
          'Correcto: hay respuesta conocida (precios históricos) y el objetivo es un valor, no una categoría.',
      },
      {
        id: 'b',
        text: 'Clasificación: hay que elegir una clase',
        correct: false,
        rationale:
          'Clasificar es elegir entre categorías. Un precio no es una clase, es un número con orden y distancia.',
      },
      {
        id: 'c',
        text: 'Agrupación: no hay etiqueta que predecir',
        correct: false,
        rationale:
          'Sí hay etiqueta: el precio. Y no buscas grupos, buscas el valor de un caso concreto.',
      },
    ],
    explanation:
      'Con etiqueta y salida numérica se habla de regresión; con etiqueta y salida categórica, de clasificación. La distinción importa porque cambia la métrica y el tratamiento del error.',
    referenceId: 'ref-isl',
  },
  {
    id: 'sup-reward-delay',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 3,
    prompt: '¿Qué hace difícil de verdad el aprendizaje por refuerzo?',
    options: [
      {
        id: 'a',
        text: 'La recompensa llega tarde y hay que explorar',
        correct: true,
        rationale:
          'Correcto: el agente no sabe qué acción fue la buena y debe probar opciones sin saber el resultado.',
      },
      {
        id: 'b',
        text: 'Necesita más datos etiquetados que el supervisado',
        correct: false,
        rationale:
          'Justo lo contrario: no usa etiquetas. Su problema es atribuir la recompensa a acciones pasadas.',
      },
      {
        id: 'c',
        text: 'Solo funciona con imágenes y con vídeo',
        correct: false,
        rationale:
          'Funciona con cualquier entorno donde se actúe y se mida. El tipo de dato no es la dificultad.',
      },
    ],
    explanation:
      'El refuerzo aprende de consecuencias diferidas: la señal llega después de varias decisiones, así que asignar el mérito es el problema central. Y explorar cuesta, porque las malas acciones también se ejecutan.',
    referenceId: 'ref-isl',
  },
  {
    id: 'sup-partial-labels',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 2,
    prompt: 'Tienes etiquetas del 10 % de tus datos y el resto sin marcar. ¿Qué haces primero?',
    options: [
      {
        id: 'a',
        text: 'Entrenar con ese 10 % y medir cuánto aguanta',
        correct: true,
        rationale:
          'Correcto: se empieza con lo que hay y se mide la calidad para decidir cuánto más etiquetar.',
      },
      {
        id: 'b',
        text: 'Esperar a tener etiquetado el 100 %',
        correct: false,
        rationale:
          'Bloquea el proyecto indefinidamente sin saber si hace falta tanto. Primero se mide la necesidad.',
      },
      {
        id: 'c',
        text: 'Usar agrupación para predecir la etiqueta',
        correct: false,
        rationale:
          'Confunde agrupar con predecir. Los grupos no son las clases y no rellenan la etiqueta que falta.',
      },
    ],
    explanation:
      'Etiquetar es caro y su valor es empírico: se estima cuánto mejora el sistema por cada tanda. Empezar con una muestra y medir evita gastar en etiquetas que no cambian ninguna decisión.',
    referenceId: 'ref-isl',
  },
  {
    id: 'sup-anomaly-no-labels',
    competencyId: 'supervised-vs-unsupervised',
    difficulty: 2,
    prompt: 'Quieres detectar comportamientos raros y no tienes ejemplos de «raro». ¿Qué enfoque encaja?',
    options: [
      {
        id: 'a',
        text: 'Detección de anomalías no supervisada',
        correct: true,
        rationale:
          'Correcto: aprende la forma de lo normal y señala lo que se aleja, sin necesitar ejemplos del fallo.',
      },
      {
        id: 'b',
        text: 'Un clasificador binario entrenado al efecto',
        correct: false,
        rationale:
          'Necesitaría ejemplos de ambas clases. Sin ejemplos de lo raro, no puede aprender a reconocerlo.',
      },
      {
        id: 'c',
        text: 'Una regresión sobre el valor esperado',
        correct: false,
        rationale:
          'Estimaría un valor continuo, no la rareza de un caso. No responde a la pregunta que haces.',
      },
    ],
    explanation:
      'Cuando la clase que buscas es rara o no está etiquetada, modelar lo normal es más práctico que buscar ejemplos del fallo. Es el caso típico de fraude o de averías con pocos antecedentes.',
    referenceId: 'ref-isl',
  },

  {
    id: 'gen-more-data',
    competencyId: 'generalization-overfitting',
    difficulty: 1,
    prompt: 'El modelo sobreajusta y tienes pocos datos. ¿Qué ataca la causa?',
    options: [
      {
        id: 'a',
        text: 'Más datos, o menos capacidad en el modelo',
        correct: true,
        rationale:
          'Correcto: el sobreajuste nace del desequilibrio entre capacidad y datos. Se corrige por ese lado.',
      },
      {
        id: 'b',
        text: 'Más épocas de entrenamiento sobre lo mismo',
        correct: false,
        rationale:
          'Alarga la memorización del mismo conjunto. Empeora justo lo que quieres resolver.',
      },
      {
        id: 'c',
        text: 'Cambiar la métrica con la que evalúas',
        correct: false,
        rationale:
          'La métrica no cambia el modelo. Solo cambia lo que ves, y puede esconder el problema.',
      },
    ],
    explanation:
      'El sobreajuste se combate reduciendo la capacidad de memorizar o aumentando la evidencia disponible: más datos, más regularización, menos parámetros. Más entrenamiento va en la dirección contraria.',
    referenceId: 'ref-isl',
  },
  {
    id: 'gen-imbalanced-accuracy',
    competencyId: 'generalization-overfitting',
    difficulty: 2,
    prompt: 'Aciertas el 99 % prediciendo siempre la clase mayoritaria. ¿Qué le falta a esa medición?',
    options: [
      {
        id: 'a',
        text: 'Una métrica que mire la clase minoritaria',
        correct: true,
        rationale:
          'Correcto: con clases desequilibradas, la exactitud alta puede convivir con no detectar nunca lo importante.',
      },
      {
        id: 'b',
        text: 'Más datos de la clase mayoritaria',
        correct: false,
        rationale:
          'Refuerza el desequilibrio que causa el problema. El modelo ya la acierta sin esfuerzo.',
      },
      {
        id: 'c',
        text: 'Subir la capacidad del modelo actual',
        correct: false,
        rationale:
          'Con un 99 % trivial, más capacidad no aporta. Falta medir lo que de verdad importa.',
      },
    ],
    explanation:
      'La exactitud es engañosa con clases desequilibradas. Hay que mirar precisión y exhaustividad de la clase que importa, y decidir qué error es peor en ese dominio.',
    referenceId: 'ref-isl',
  },
  {
    id: 'gen-cross-validation',
    competencyId: 'generalization-overfitting',
    difficulty: 2,
    prompt: '¿Para qué sirve la validación cruzada?',
    options: [
      {
        id: 'a',
        text: 'Para estimar sin depender de un solo reparto',
        correct: true,
        rationale:
          'Correcto: repite el reparto y promedia, así la estimación no depende del azar de una partición.',
      },
      {
        id: 'b',
        text: 'Para entrenar el modelo mucho más rápido',
        correct: false,
        rationale:
          'Entrena varias veces, así que es más lento. Lo que gana es fiabilidad de la estimación.',
      },
      {
        id: 'c',
        text: 'Para aumentar la cantidad de datos útiles',
        correct: false,
        rationale:
          'No crea datos. Reutiliza los mismos en turnos distintos para medir mejor.',
      },
    ],
    explanation:
      'Con pocos datos, una única partición da una estimación de alta varianza. La validación cruzada reparte varias veces y permite ver la dispersión, que es lo que hace decidible el resultado.',
    referenceId: 'ref-isl',
  },
  {
    id: 'gen-temporal-leak',
    competencyId: 'generalization-overfitting',
    difficulty: 3,
    prompt: 'Predices el futuro y partes los datos al azar. ¿Qué está mal?',
    options: [
      {
        id: 'a',
        text: 'Entrenas con datos posteriores a los de prueba',
        correct: true,
        rationale:
          'Correcto: la partición aleatoria mezcla pasado y futuro. El modelo ve mañana antes de predecirlo.',
      },
      {
        id: 'b',
        text: 'El modelo se queda sin datos suficientes',
        correct: false,
        rationale:
          'La cantidad no es el problema. El problema es el orden temporal de lo que entra en cada parte.',
      },
      {
        id: 'c',
        text: 'La partición es demasiado pequeña para medir',
        correct: false,
        rationale:
          'El tamaño afecta a la precisión de la medida. Aquí el fallo es de fuga: la medida es inválida.',
      },
    ],
    explanation:
      'Con datos temporales, la partición se hace por fecha: entrenas con el pasado y evalúas con lo posterior. Barajar rompe esa garantía y produce métricas optimistas que no se sostienen en producción.',
    referenceId: 'ref-isl',
  },

  {
    id: 'det-test-repeatability',
    competencyId: 'deterministic-vs-learned',
    difficulty: 1,
    prompt: '¿Qué te permite afirmar un test sobre lógica determinista?',
    options: [
      {
        id: 'a',
        text: 'Que la misma entrada da la misma salida',
        correct: true,
        rationale:
          'Correcto: sin esa garantía, un test verde no significa nada porque mañana podría dar otra cosa.',
      },
      {
        id: 'b',
        text: 'Que el modelo acierta más que las reglas',
        correct: false,
        rationale:
          'Un test comprueba comportamiento esperado, no compara estrategias. Eso se mide de otra forma.',
      },
      {
        id: 'c',
        text: 'Que el sistema escala mejor con carga',
        correct: false,
        rationale:
          'El escalado es una propiedad operativa distinta, y no se deduce de la reproducibilidad.',
      },
    ],
    explanation:
      'El determinismo es lo que hace que un test sea una garantía: misma entrada, misma salida, hoy y dentro de un año. Sin él, los tests se convierten en observaciones del momento.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'det-volume-cost',
    competencyId: 'deterministic-vs-learned',
    difficulty: 2,
    prompt: 'Un cálculo exacto se ejecuta 10 000 veces al día. ¿Qué importa además de acertar?',
    options: [
      {
        id: 'a',
        text: 'El coste por ejecución y la latencia',
        correct: true,
        rationale:
          'Correcto: a ese volumen, un coste pequeño por llamada se convierte en la factura del mes.',
      },
      {
        id: 'b',
        text: 'La marca del proveedor del modelo',
        correct: false,
        rationale:
          'La marca no dice nada del coste ni de la latencia en tu caso. Se mide, no se supone.',
      },
      {
        id: 'c',
        text: 'El tamaño del conjunto de entrenamiento',
        correct: false,
        rationale:
          'Si el cálculo es determinista, no hay entrenamiento. La pregunta no aplica.',
      },
    ],
    explanation:
      'A gran volumen, la aritmética cambia: lo que por llamada parecía irrelevante domina la factura. Es el argumento decisivo para resolver con reglas lo que se ejecuta miles de veces.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'det-rules-growth',
    competencyId: 'deterministic-vs-learned',
    difficulty: 3,
    prompt: 'La tabla de reglas crece hasta 500 condiciones que se contradicen entre sí. ¿Qué señal es?',
    options: [
      {
        id: 'a',
        text: 'El espacio ya no es enumerable: replantea',
        correct: true,
        rationale:
          'Correcto: cuando las reglas se pisan, mantenerlas cuesta más que aprender de ejemplos.',
      },
      {
        id: 'b',
        text: 'Hay que escribir todavía más reglas',
        correct: false,
        rationale:
          'Es la trampa clásica: cada regla nueva resuelve un caso y rompe otro. El coste crece sin techo.',
      },
      {
        id: 'c',
        text: 'El problema pide un modelo más grande',
        correct: false,
        rationale:
          'Pide cambiar de enfoque, no de tamaño. Un modelo mayor con el mismo problema falla igual.',
      },
    ],
    explanation:
      'La frontera no es tecnológica sino de mantenibilidad: cuando enumerar las reglas deja de ser posible, el problema pasa a describirse mejor con ejemplos. Ese es el momento de cambiar de técnica.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'det-decision-question',
    competencyId: 'deterministic-vs-learned',
    difficulty: 2,
    prompt: '¿Qué pregunta decide de verdad entre escribir reglas o entrenar un modelo?',
    options: [
      {
        id: 'a',
        text: 'Si puedes enumerar las reglas que resuelven el caso',
        correct: true,
        rationale:
          'Correcto: si puedes escribirlas y sostenerlas, ganas determinismo y trazabilidad gratis.',
      },
      {
        id: 'b',
        text: 'Cuántos datos históricos tienes disponibles',
        correct: false,
        rationale:
          'Tener datos no obliga a usarlos. La pregunta es si las reglas cubren el problema o no.',
      },
      {
        id: 'c',
        text: 'Qué modelo es el más reciente del mercado',
        correct: false,
        rationale:
          'La novedad no es un criterio técnico. Se elige por ajuste al problema, no por fecha.',
      },
    ],
    explanation:
      'La prueba de enumerabilidad es la que decide: si las reglas caben en la cabeza y en un archivo, escríbelas. Si el espacio de entradas es abierto, ninguna lista de reglas lo cubrirá.',
    referenceId: 'ref-rules-ml',
  },
];
