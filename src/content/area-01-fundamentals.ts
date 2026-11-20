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
];
