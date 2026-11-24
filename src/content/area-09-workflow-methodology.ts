/**
 * Área 09 — Metodología y flujo con agentes.
 *
 * Ocho competencias sobre **cómo cambia el trabajo**, no sobre cómo se construye el sistema.
 * El eje: el código que escribe un agente no es el problema; el problema es que nadie
 * especificó qué debía pasar, nadie revisó lo que sí pasó y nadie sabe cuántas veces hubo
 * que rehacerlo.
 *
 * La primera, el desarrollo guiado por especificación, es la base de las demás: sin un
 * criterio de aceptación escrito, no hay forma de saber si el agente acertó.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_09: readonly Lesson[] = [
  {
    competencyId: 'spec-driven-development',
    whatIs:
      'Escribir, antes de que el agente toque código, qué debe hacer el sistema y cómo se comprueba. La especificación describe comportamiento observable —entradas, salidas, errores, límites— y no una idea general del resultado. A partir de ella salen dos piezas distintas: el plan técnico, que decide cómo, y las tareas, que son los pasos verificables que se delegan.',
    problem:
      'Se le pide al agente «implementa el buscador» y devuelve algo que funciona en su cabeza: un método de búsqueda que no es el del producto, un formato de error inventado, ni un solo caso límite. El código compila, los tests escritos por el agente pasan y el comportamiento no es el pedido. Sin criterio de aceptación escrito, no hay forma de discutirlo: la discusión pasa a ser sobre la interpretación de cada uno, después de que el trabajo ya está hecho.',
    internals: [
      'Una especificación se reconoce porque es comprobable: cada punto se puede convertir en un test o en un paso manual con resultado esperado.',
      'Lo que debe cumplirse siempre —tests en verde, lint, ningún secreto— vive en la integración continua, no en la especificación: un script no se negocia ni se olvida.',
      'El plan técnico y la especificación son documentos distintos: el primero decide estructura, el segundo decide comportamiento. Mezclarlos hace que ninguna de las dos cosas sea verificable.',
      'Las tareas se escriben en pasos que se pueden revisar por separado. Una tarea que no se puede verificar sin terminar las siguientes no es una tarea, es una esperanza.',
      'La revisión humana en el plan es el punto de control más barato: cambiar el rumbo antes de implementar cuesta minutos; después, cuesta reescribir.',
    ],
    whenToUse: [
      'Cuando el cambio toca comportamiento que el usuario percibe: formato de respuesta, validaciones, mensajes de error.',
      'Cuando se delega trabajo que hay que poder revisar sin tener que reconstruir la intención original.',
    ],
    whenNotToUse: [
      'No escribas una especificación de veinte páginas para renombrar una variable: el coste supera la ambigüedad que elimina.',
      'No dejes la especificación viva solo al principio: una especificación que nadie actualiza se convierte en documentación obsoleta que alguien usará como verdad.',
    ],
    pitfalls: [
      {
        title: 'Especificación que describe una idea, no un comportamiento',
        detail:
          '«El buscador debe ser rápido y preciso» no se puede comprobar. «Devuelve los cinco primeros resultados con el término en el título en menos de 300 ms con este conjunto» sí.',
      },
      {
        title: 'El monstruo de markdown',
        detail:
          'Adoptar el flujo sin cambiar cómo colaboran producto, arquitectura y pruebas produce documentos que se escriben una vez y envejecen en silencio. El método no arregla un proceso que sigue igual.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
];

export const ITEMS_AREA_09: readonly Item[] = [
  {
    id: 'sdd-other-thing',
    competencyId: 'spec-driven-development',
    difficulty: 1,
    prompt:
      'El agente implementa rápido y el código pasa sus propios tests, pero no hace lo que pediste. ¿Qué faltaba?',
    options: [
      {
        id: 'a',
        text: 'Un criterio de aceptación comprobable por escrito',
        correct: true,
        rationale:
          'Correcto: sin criterio no hay nada que incumplir. El agente cumplió su interpretación, que es lo último que quieres.',
      },
      {
        id: 'b',
        text: 'Un modelo más capaz para entender el encargo',
        correct: false,
        rationale:
          'Un modelo mejor interpreta mejor lo ambiguo, y sigue siendo ambiguo. El encargo no estaba definido.',
      },
      {
        id: 'c',
        text: 'Más ejemplos de código en el mensaje inicial',
        correct: false,
        rationale:
          'Los ejemplos muestran estilo, no comportamiento. Sin los casos límite escritos, se inventan igual.',
      },
    ],
    explanation:
      'Cuando el resultado no es el pedido, casi siempre el pedido no estaba escrito en términos que se puedan comprobar. La especificación no es burocracia: es lo que convierte «no es lo que quería» en una lista de puntos que fallan.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-what-belongs',
    competencyId: 'spec-driven-development',
    difficulty: 1,
    prompt: '¿Qué debe contener una especificación para que sirva?',
    options: [
      {
        id: 'a',
        text: 'Comportamiento esperado y cómo se comprueba',
        correct: true,
        rationale:
          'Correcto: entradas, salidas, errores y límites, cada uno con su forma de verificarlo.',
      },
      {
        id: 'b',
        text: 'Los comandos de compilación y despliegue',
        correct: false,
        rationale:
          'Eso es el contrato del repositorio, no la especificación de un cambio. Va en otro sitio.',
      },
      {
        id: 'c',
        text: 'La opinión del revisor sobre el diseño',
        correct: false,
        rationale:
          'Las preferencias se discuten en la revisión del plan. Una especificación con opiniones deja de ser comprobable.',
      },
    ],
    explanation:
      'La prueba de fuego de una especificación es sencilla: cada punto puede convertirse en un test o en un paso manual con resultado esperado. Lo que no pasa esa prueba es contexto útil, pero no especificación.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-spec-or-ci',
    competencyId: 'spec-driven-development',
    difficulty: 2,
    prompt:
      '«Todos los tests deben pasar y no puede haber secretos en el código». ¿Dónde va esa regla?',
    options: [
      {
        id: 'a',
        text: 'En la integración continua, como comprobación',
        correct: true,
        rationale:
          'Correcto: lo que debe cumplirse siempre se ejecuta, no se pide. Un script no se olvida ni se negocia.',
      },
      {
        id: 'b',
        text: 'En la especificación, junto a los criterios',
        correct: false,
        rationale:
          'La especificación se lee una vez; el script se ejecuta en cada cambio. Ponerlo ahí confía en la memoria.',
      },
      {
        id: 'c',
        text: 'En los dos sitios, para reforzarlo',
        correct: false,
        rationale:
          'Duplicar la regla crea dos verdades. Cuando una cambie, la otra mentirá y nadie sabrá cuál manda.',
      },
    ],
    explanation:
      'Es la división más útil del flujo: la especificación describe qué debe pasar, y la integración continua garantiza lo que no puede fallar nunca. Lo que depende de que alguien se acuerde, no está garantizado.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-long-spec-ignored',
    competencyId: 'spec-driven-development',
    difficulty: 2,
    prompt: 'Una especificación de cuarenta páginas y el agente ignora la mitad. ¿Qué está pasando?',
    options: [
      {
        id: 'a',
        text: 'No cabe ni compite por el contexto disponible',
        correct: true,
        rationale:
          'Correcto: lo que no entra en la ventana, o queda sepultado entre lo demás, no existe para el modelo.',
      },
      {
        id: 'b',
        text: 'El modelo elegido es demasiado pequeño',
        correct: false,
        rationale:
          'Cambiar de modelo no arregla un documento que no cabe. Con otro modelo se ignora otra mitad.',
      },
      {
        id: 'c',
        text: 'Faltan ejemplos de lo que se espera',
        correct: false,
        rationale:
          'Puede faltar alguno, y el problema principal es de tamaño: la señal útil está enterrada.',
      },
    ],
    explanation:
      'Una especificación larga compite consigo misma: lo esencial queda a la altura de lo accesorio. Es más útil un documento corto con los casos límite que uno completo que nadie lee entero, ni la persona ni el agente.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'sdd-plan-checkpoint',
    competencyId: 'spec-driven-development',
    difficulty: 2,
    prompt:
      'El flujo exige que una persona revise el plan técnico antes de que el agente implemente. ¿Para qué?',
    options: [
      {
        id: 'a',
        text: 'Es el punto más barato para corregir el rumbo',
        correct: true,
        rationale:
          'Correcto: cambiar el plan cuesta minutos; descubrir el error con el código escrito cuesta rehacerlo.',
      },
      {
        id: 'b',
        text: 'Para dejar constancia de que alguien lo supervisó',
        correct: false,
        rationale:
          'La constancia sin criterio es una firma. La revisión vale porque cambia decisiones, no porque exista.',
      },
      {
        id: 'c',
        text: 'Porque el agente no sabe planificar por su cuenta',
        correct: false,
        rationale:
          'Planifica, y no sabe si el plan encaja con la arquitectura real, los plazos o lo que el equipo ya decidió.',
      },
    ],
    explanation:
      'Los puntos de control se colocan donde el error aún es barato. Revisar el plan es la última oportunidad de decir «no por ahí» antes de que el coste sea código escrito, revisado y descartado.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-ambiguous-threshold',
    competencyId: 'spec-driven-development',
    difficulty: 3,
    prompt:
      'Un criterio dice «la búsqueda debe ser rápida». ¿Qué le falta para ser aceptable?',
    options: [
      {
        id: 'a',
        text: 'Un umbral medible y bajo qué condiciones',
        correct: true,
        rationale:
          'Correcto: «menos de 300 ms en el percentil 95 con este conjunto» se puede comprobar; «rápida» no.',
      },
      {
        id: 'b',
        text: 'Más detalle en prosa sobre lo que se espera',
        correct: false,
        rationale:
          'La prosa añade contexto y no añade verificabilidad. Diez líneas sobre rapidez siguen sin ser un umbral.',
      },
      {
        id: 'c',
        text: 'Un ejemplo de uso de la función de búsqueda',
        correct: false,
        rationale:
          'El ejemplo muestra la llamada, no cuándo se considera aceptable. Falta el número y la condición.',
      },
    ],
    explanation:
      'Un criterio sin número ni condición no se puede incumplir, y por tanto no sirve. La forma de detectarlo es preguntarse: ¿qué medición haría fallar esto? Si no hay respuesta, no es un criterio.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-stale-spec',
    competencyId: 'spec-driven-development',
    difficulty: 3,
    prompt:
      'La especificación se escribió, se implementó y nadie la volvió a tocar. Seis meses después sigue en el repositorio. ¿Qué riesgo hay?',
    options: [
      {
        id: 'a',
        text: 'Que alguien la use como verdad de lo que hace el sistema',
        correct: true,
        rationale:
          'Correcto: un documento desactualizado es peor que ninguno, porque se lee con la confianza de lo escrito.',
      },
      {
        id: 'b',
        text: 'Ninguno: ya cumplió su función al implementarse',
        correct: false,
        rationale:
          'Cumplió una vez. El repositorio la sigue ofreciendo como descripción vigente del comportamiento.',
      },
      {
        id: 'c',
        text: 'Solo ocupa espacio y hace más lenta la búsqueda',
        correct: false,
        rationale:
          'El espacio es irrelevante. El daño es informativo: describe un sistema que ya no existe.',
      },
    ],
    explanation:
      'La especificación es documentación viva o es una trampa. Si el flujo no incluye actualizarla cuando cambia el comportamiento, el método produce exactamente el problema que decía resolver.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sdd-task-size',
    competencyId: 'spec-driven-development',
    difficulty: 3,
    prompt:
      'La especificación pide «implementar el módulo de facturación completo». ¿Qué conviene hacer antes de delegar?',
    options: [
      {
        id: 'a',
        text: 'Partirlo en tareas verificables por separado',
        correct: true,
        rationale:
          'Correcto: cada tarea se revisa y se prueba sola, así el error aparece en el paso que lo causó.',
      },
      {
        id: 'b',
        text: 'Pedirlo de golpe y revisar el resultado final',
        correct: false,
        rationale:
          'Cuando algo falla, el diff es enorme y no se sabe qué decisión lo causó. La revisión deja de ser posible.',
      },
      {
        id: 'c',
        text: 'Aumentar el presupuesto de pasos del agente',
        correct: false,
        rationale:
          'Más margen para un encargo indivisible produce más trabajo que revisar de una vez, no mejor.',
      },
    ],
    explanation:
      'El tamaño de la tarea decide si la revisión es posible. Un cambio que no cabe en una revisión de diez minutos es un cambio que se aprueba por cansancio.',
    referenceId: 'ref-rules-ml',
  },
];