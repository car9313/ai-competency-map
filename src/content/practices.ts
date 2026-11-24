import { PRACTICES_AREA_09 } from './area-09-workflow-methodology';
import type { Practice } from '@/features/content/domain/types';

/**
 * Prácticas de todo el catálogo.
 *
 * Hasta ahora solo el área de metodología pedía producir algo; el resto del mapa se podía
 * aprobar leyendo. Estas prácticas cubren ese hueco en las áreas donde más falta hacía:
 * agentes, harness y arquitectura.
 *
 * Cada una está escrita como una receta con condiciones de aceptación, no como una
 * descripción: el sentido es que se pueda hacer hoy y saber si está bien hecho.
 */
export const PRACTICES: Readonly<Record<string, Practice>> = {
  ...PRACTICES_AREA_09,

  // ── Área 05 · Ingeniería agéntica ──────────────────────────────────────────

  // ── Área 00 · Fundamentos de programación ──────────────────────────────────

  'version-control-and-diffs': {
    title: 'Revisa un diff ajeno y explica cada bloque',
    steps: [
      'Elige un cambio real que no hayas escrito tú, de otro repositorio si puede ser.',
      'Léelo por ficheros: primero pruebas y configuración, después el código.',
      'Escribe en una frase qué hace cada bloque modificado y por qué.',
      'Marca los bloques donde no puedas explicar la intención.',
      'Parte el cambio en los commits que habrías hecho tú.',
    ],
    rubric: [
      'Cada bloque modificado tiene una explicación escrita, no «cambios varios».',
      'El diff de las pruebas se revisó antes que el del código.',
      'Está identificado al menos un cambio de formato mezclado con uno de comportamiento.',
      'Los bloques sin intención clara aparecen marcados para preguntar al autor.',
      'La partición propuesta separa formato, arreglo y funcionalidad.',
    ],
  },

  'terminal-and-environment': {
    title: 'Diagnostica desde el terminal sin adivinar',
    steps: [
      'Elige un comando del proyecto y ejecútalo mirando su código de salida.',
      'Provoca un fallo a propósito: ruta equivocada, variable vacía o permiso retirado.',
      'Lee el error completo y localiza la primera línea que menciona tu código.',
      'Reproduce el fallo con el comando exacto y corrígelo.',
      'Comprueba que el código de salida pasa a cero.',
    ],
    rubric: [
      'El diagnóstico empezó por el código de salida, no por el texto en pantalla.',
      'El fallo provocado es distinto del síntoma que se ve al final.',
      'Está identificada la primera línea del error que señala el origen.',
      'La corrección se validó repitiendo el mismo comando en el mismo entorno.',
      'Ningún comando destructivo se ejecutó sin comprobar la ruta resuelta.',
    ],
  },
  'bounded-agent-loop': {
    title: 'Cierra el bucle de un agente que ya tienes abierto',
    steps: [
      'Escribe el criterio de éxito como algo que se pueda comprobar sin preguntarle al modelo.',
      'Pon un tope de pasos y otro de coste, y escribe qué devuelve al agotarse.',
      'Añade detección de estancamiento: dos acciones idénticas seguidas o estado del mundo sin cambios.',
      'Devuelve, cuando no termina, el estado parcial y el punto exacto donde se quedó.',
      'Prueba con una tarea imposible y comprueba que el fallo es limpio y explicable.',
    ],
    rubric: [
      'El éxito se comprueba fuera del modelo, con un hecho observable.',
      'Los topes de pasos y de coste existen y están escritos.',
      'El estancamiento se detecta por estado, no por número de pasos.',
      'Una ejecución fallida devuelve el trabajo hecho y dónde se paró.',
      'La tarea imposible termina en un error limpio, no en un bucle infinito.',
    ],
  },

  'multi-agent-delegation': {
    title: 'Monta un orquestador con dos subagentes',
    steps: [
      'Elige una tarea que se parta en dos subtareas independientes y verificables.',
      'Escribe el contrato de cada delegación: contexto necesario, formato de salida y criterio de éxito.',
      'Haz que el orquestador compruebe cada informe antes de aceptarlo, en lugar de fiarse.',
      'Registra el árbol: qué delegó, con qué contrato y qué recibió.',
      'Resuelve la misma tarea con un solo agente y compara coste, tiempo y calidad.',
    ],
    rubric: [
      'Cada subagente recibió todo lo que necesitaba para no adivinar.',
      'Los informes se verifican contra un hecho, no se aceptan por confianza.',
      'Existe la traza del árbol de delegaciones.',
      'La comparación con un solo agente está hecha y escrita.',
      'La decisión de usar varios queda justificada con esa comparación.',
    ],
  },

  // ── Área 06 · Harness engineering ──────────────────────────────────────────

  'tool-registry-allowlist': {
    title: 'Escribe el registro de herramientas y la lista de permitidas',
    steps: [
      'Enumera todas las herramientas que el agente podría usar hoy, incluidas las que nadie aprobó.',
      'Separa las que solo leen de las que escriben, y asigna un dueño a cada una.',
      'Deja la política en denegar por defecto: lo que no está en la lista no se ejecuta.',
      'Escribe qué cambia cuando se añade una herramienta y quién lo autoriza.',
      'Comprueba que un agente no puede usar una herramienta que no está en la lista.',
    ],
    rubric: [
      'La política por defecto es denegar y se aplica sin preguntar a nadie.',
      'Lectura y escritura son permisos distintos.',
      'Cada herramienta tiene dueño y motivo de estar ahí.',
      'El historial de cambios dice quién amplió la lista y por qué.',
      'Está probado que lo no declarado no se ejecuta.',
    ],
  },

  'sandboxing-isolation': {
    title: 'Aísla la ejecución y comprueba el perímetro',
    steps: [
      'Dale al agente una carpeta de trabajo propia y nada más.',
      'Copia dentro solo los datos que la tarea necesita, no el directorio que los contiene.',
      'Pasa credenciales de vida corta y alcance mínimo, fuera del contexto del modelo.',
      'Pon límites de tiempo, memoria y red.',
      'Intenta salir del perímetro a propósito y documenta qué ocurre.',
    ],
    rubric: [
      'El agente no puede escribir fuera de su carpeta de trabajo.',
      'Los datos sensibles entraron por copia mínima, no por acceso al directorio.',
      'Las credenciales no aparecen en el contexto ni en los registros.',
      'Hay límites de tiempo, memoria y red que se respetan.',
      'El intento de escape está documentado con su resultado.',
    ],
  },

  'checkpoints-recovery': {
    title: 'Recupera un trabajo interrumpido sin repetir efectos',
    steps: [
      'Decide qué cuenta como paso: acciones con efecto, no consultas.',
      'Guarda el estado fuera del proceso que orquesta.',
      'Añade una clave de idempotencia a los efectos que no se pueden repetir.',
      'Interrumpe el proceso a mitad y reanúdalo.',
      'Comprueba que ningún efecto se aplicó dos veces.',
    ],
    rubric: [
      'El registro guarda efectos aplicados, no actividad.',
      'El estado sobrevive a un reinicio del proceso.',
      'Reanudar no duplica ningún efecto irreversible.',
      'Los pasos que no se pueden deshacer están marcados como tales.',
      'Reanudar con código más nuevo se comprueba antes de continuar.',
    ],
  },

  'human-approval-gates': {
    title: 'Diseña la puerta de aprobación de un agente',
    steps: [
      'Ordena las acciones del agente por consecuencia: reversible, costosa, irreversible.',
      'Coloca la puerta antes del efecto irreversible, nunca después.',
      'Decide qué ve la persona que aprueba: qué se va a hacer, sobre qué datos y con qué efecto.',
      'Define qué ocurre si nadie responde en el plazo.',
      'Registra quién aprobó, qué, cuándo y sobre qué datos.',
    ],
    rubric: [
      'La puerta está antes del efecto, no como control posterior.',
      'La persona que aprueba tiene autoridad sobre esa consecuencia.',
      'Sin respuesta, la acción no se ejecuta.',
      'El registro permite reconstruir la decisión sin preguntar a nadie.',
      'Las aprobaciones en lote llevan resumen y detalle disponible.',
    ],
  },

  // ── Área 07 · Arquitectura ─────────────────────────────────────────────────

  'provider-abstraction': {
    title: 'Desacopla tu aplicación del proveedor de modelos',
    steps: [
      'Escribe una interfaz mínima con lo que tu producto necesita: generar, transmitir, medir coste.',
      'Implementa dos adaptadores contra esa interfaz.',
      'Normaliza los errores a un vocabulario propio: transitorio, límite, inválido.',
      'Pasa la misma batería de casos por los dos adaptadores.',
      'Mide la diferencia de calidad y de coste entre ambos.',
    ],
    rubric: [
      'El dominio no importa ningún SDK de proveedor.',
      'Los errores se traducen a categorías propias antes de salir de la capa.',
      'La misma batería de pruebas se ejecuta contra los dos adaptadores.',
      'La interfaz tiene los métodos que el producto necesita, no los que ofrece el proveedor.',
      'La diferencia de calidad entre proveedores está medida con casos propios.',
    ],
  },

  'ai-dev-techniques': {
    title: 'Compara una sesión de golpe con una sesión por pasos',
    steps: [
      'Elige una tarea del tamaño de media tarde en tu proyecto real.',
      'Pídela de golpe y guarda el resultado tal cual: esa es tu línea base.',
      'Repítela en otra rama con plan revisado, un fichero por paso y el test que falla primero.',
      'Compara las dos con el mismo criterio: revisiones necesarias, tiempo de revisión y qué hubo que rehacer.',
      'Escribe las tres reglas que te habrían ahorrado el primer intento.',
    ],
    rubric: [
      'La comparación usa el mismo criterio en las dos sesiones.',
      'La segunda empezó por un plan revisado antes de escribir código.',
      'Cada paso de la segunda se verificó antes de continuar.',
      'Está identificado el momento en que el contexto se contaminó y qué lo provocó.',
      'Las tres reglas están escritas y son aplicables al próximo encargo.',
    ],
  },
  'orchestration-patterns': {
    title: 'Elige el patrón de orquestación más simple que funcione',
    steps: [
      'Describe el flujo como pasos con su entrada y su salida.',
      'Decide si el orden es fijo, si las partes son independientes o si el siguiente paso depende del anterior.',
      'Escribe el patrón mínimo que cubre ese caso: pipeline, abanico o bucle de agente.',
      'Haz idempotentes los pasos y saca el estado del proceso.',
      'Define qué ocurre cuando falla un paso intermedio.',
    ],
    rubric: [
      'El patrón elegido es el más simple que cubre el flujo, y el motivo está escrito.',
      'Los pasos se pueden repetir sin duplicar efectos.',
      'El estado vive fuera del proceso que orquesta.',
      'Cada paso deja traza con su entrada y su salida.',
      'La política ante un fallo parcial está decidida antes, no durante el incidente.',
    ],
  },
};
