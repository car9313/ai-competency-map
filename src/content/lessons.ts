/**
 * Lecciones de la fase 1.
 *
 * Estructura fija y deliberadamente breve: una lección es el preámbulo de la
 * evaluación, no un artículo. Ver docs/contributing/content-authoring.md
 */
import type { Lesson } from '@/features/content/domain/types';

export const LESSONS: readonly Lesson[] = [
  {
    competencyId: 'ai-ml-dl-boundaries',
    whatIs:
      'La inteligencia artificial es el objetivo: que un sistema haga tareas que asociamos a inteligencia. El machine learning es una forma de conseguirlo mostrando ejemplos en lugar de escribiendo reglas. El deep learning es una familia de machine learning basada en redes neuronales con muchas capas.',
    problem:
      'Los tres términos se usan como sinónimos en conversaciones y presentaciones. Esa confusión lleva a pedir "una IA" para un problema que se resuelve con tres reglas, o a descartar las reglas por parecer antiguas cuando son la opción correcta.',
    internals: [
      'En un sistema de reglas, una persona escribe la lógica. Es determinista, auditable y explica cada decisión.',
      'En machine learning, se elige un modelo y se ajusta con ejemplos etiquetados. La lógica no está escrita: se infiere de los datos.',
      'En deep learning, las capas aprenden representaciones intermedias. Eso permite trabajar con texto o imagen crudos, donde las variables no vienen dadas de antemano.',
      'La frontera práctica no es la sofisticación: es si el problema está mejor descrito por reglas explícitas o por ejemplos.',
    ],
    whenToUse: [
      'Reglas: cuando las condiciones son conocidas, estables y hay que poder explicar cada decisión.',
      'Machine learning clásico: cuando hay variables ya significativas y datos tabulares suficientes.',
      'Deep learning: cuando el dato es no estructurado y abundante, como texto, audio o imagen.',
    ],
    whenNotToUse: [
      'No introduzcas un modelo si una regla resuelve el caso con certeza y trazabilidad.',
      'No uses deep learning con pocos cientos de ejemplos: memorizará en lugar de aprender.',
    ],
    pitfalls: [
      {
        title: 'Tratar una salida probabilística como una garantía',
        detail:
          'Un modelo da una estimación con una probabilidad de error. Si el caso exige certeza, la validación tiene que estar fuera del modelo.',
      },
      {
        title: 'Elegir la técnica más avanzada por defecto',
        detail:
          'La técnica más avanzada no es la que mejor resuelve: es la que más cuesta operar. Empieza por lo más simple que pueda funcionar.',
      },
    ],
    referenceIds: ['ref-rules-ml', 'ref-dl-book'],
  },
  {
    competencyId: 'tokens-and-context-window',
    whatIs:
      'Un token es un fragmento de texto, no una palabra ni una letra. La ventana de contexto es el número máximo de tokens que el modelo puede tener en cuenta a la vez, sumando lo que entra y lo que genera.',
    problem:
      'El contexto parece "memoria" y no lo es: es un presupuesto. Cuando se agota, el sistema recorta información que el desarrollador creía presente, y la respuesta empeora por una razón que no se ve en el prompt.',
    internals: [
      'El texto se parte con un tokenizador; las palabras frecuentes suelen ocupar un token y las raras se fragmentan.',
      'El mismo texto ocupa distinto número de tokens según el idioma: el vocabulario está desequilibrado hacia el inglés.',
      'El presupuesto se reparte entre instrucciones de sistema, contexto recuperado, historial y salida reservada.',
      'En contextos largos, la atención se degrada hacia el centro: lo primero y lo último pesan más que lo del medio.',
    ],
    whenToUse: [
      'Siempre que calcules coste: el precio se paga por token de entrada y de salida, no por petición.',
      'Cuando diseñes la interfaz: saber cuántos tokens entran decide si puedes recuperar documentos o no.',
    ],
    whenNotToUse: [
      'No conviertas el límite de la ventana en el objetivo: llenarla no mejora la respuesta, la degrada.',
      'No estimes tokens con "una palabra = un token": en español el error es sistemático y grande.',
    ],
    pitfalls: [
      {
        title: 'Asumir que un carácter o una palabra equivalen a un token',
        detail:
          'Las cifras de tamaño y coste calculadas así fallan justo en los casos que importan: JSON, código y acentos.',
      },
      {
        title: 'Enterrar lo importante en el centro del contexto',
        detail:
          'Si metes todo, lo relevante puede quedar en la zona de menor atención. Ordena por relevancia, no por orden de llegada.',
      },
    ],
    referenceIds: ['ref-openai-tokens', 'ref-attention'],
  },
  {
    competencyId: 'system-instructions-contract',
    whatIs:
      'Las instrucciones de sistema son el contrato de comportamiento del asistente: rol, límites, tono, formato y qué hacer ante lo que no sabe. El mensaje del usuario es la petición concreta que cambia en cada llamada.',
    problem:
      'Un contrato escrito como deseo ("sé útil y responde bien") no se puede comprobar, así que no se puede mantener. Sin contrato explícito, cualquier texto que entre por el usuario compite con las instrucciones y puede redefinir el comportamiento.',
    internals: [
      'El contrato fija lo estable; la petición fija lo variable. Mezclarlos hace que cada cambio de caso obligue a tocar el sistema.',
      'Todo lo que llega del usuario es dato, no instrucción. El contrato tiene que decir explícitamente que ese contenido no se obedece.',
      'El formato pedido en el prompt reduce la probabilidad de error, pero solo el validador la convierte en garantía.',
      'Un buen contrato se puede evaluar: dice qué es una respuesta aceptable y qué se hace cuando no se puede cumplir.',
    ],
    whenToUse: [
      'Siempre que la respuesta se consuma por código: el formato válido es parte del contrato, no una sugerencia.',
      'Cuando haya contenido externo (documentos, correos, tickets) que pueda contener instrucciones.',
    ],
    whenNotToUse: [
      'No metas secretos ni credenciales en el contrato: el prompt no es un sitio seguro.',
      'No uses el contrato para corregir un problema que se arregla validando o filtrando la salida.',
    ],
    pitfalls: [
      {
        title: 'Confiar en que el prompt garantiza el formato',
        detail:
          'El prompt orienta; no obliga. Un JSON inválido debe fallar en el borde del sistema, antes de que tres capas más adentro lo usen.',
      },
      {
        title: 'Escribir el contrato una vez y no evaluarlo nunca',
        detail:
          'Un contrato sin casos de prueba se degrada con cada cambio de modelo. Necesita su conjunto fijo de ejemplos y alguien que lo mire.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
];
