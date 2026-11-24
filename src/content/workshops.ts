/**
 * Talleres con entregable.
 *
 * Un taller es lo que no se aprende leyendo: montar algo y comprobar que funciona. Va
 * separado de las prácticas porque tiene objetivo, requisitos y entregable, y a veces está
 * atado a una herramienta concreta, en cuyo caso lleva la fecha en la que se comprobó su
 * documentación.
 *
 * El primero está escrito contra OpenCode y su formato real de skills, verificado en
 * https://opencode.ai/docs/skills/ el 2026-11-24. Las trampas de la sección «gotchas» no son
 * inventadas: son los errores que produce el propio diseño del formato.
 */
import type { Workshop } from '@/features/content/domain/types';

export const WORKSHOPS: readonly Workshop[] = [
  {
    id: 'opencode-skill-from-scratch',
    competencyId: 'agent-skills',
    title: 'Escribe tu primera skill para OpenCode',
    goal: 'Convertir una tarea que hoy explicas cada vez en una skill que el agente descubre y carga solo cuando hace falta.',
    requirements: [
      'OpenCode instalado y funcionando sobre un repositorio propio.',
      'Un AGENTS.md en ese repositorio con los comandos de build y de test.',
      'Una tarea repetitiva que hoy resuelves explicándola en el chat cada vez.',
    ],
    timebox: '45 minutos',
    steps: [
      'Elige la tarea y escribe en una frase cuándo debe cargarse la skill. Esa frase es la `description`, y es lo que el modelo ve antes de decidir.',
      'Crea `.opencode/skills/<id>/SKILL.md`. El id sale del nombre del directorio, no del campo `name`: en `.opencode/skills/release/SKILL.md` el id es `release` aunque el `name` diga «Git Release».',
      'Escribe el cuerpo con lo que solo hace falta cuando se carga: los pasos, las restricciones y a qué fichero mirar. No repitas los comandos que ya están en AGENTS.md.',
      'Mueve lo determinista a un script dentro de `scripts/` y haz que la skill lo invoque en el momento adecuado. Los ficheros de apoyo no se cargan solos: el cuerpo tiene que decir cuándo leerlos.',
      'Comprueba el anuncio: pide al agente que resuelva la tarea sin mencionar la skill. Si no la usa, revisa que tenga `description` y que el id no esté duplicado en otra fuente.',
      'Fuerza la carga a mano con `@<id>` para ver qué entra en la conversación: el cuerpo sin el frontmatter, el directorio base y una muestra de hasta diez ficheros de apoyo.',
      'Rompe el anuncio a propósito: quita la `description` y observa que la skill deja de ofrecerse al modelo. Vuelve a ponerla.',
    ],
    deliverable:
      'Una skill en `.opencode/skills/` con su script si hace falta, y una nota de una línea que diga en qué caso NO debe usarse.',
    rubric: [
      'El id coincide con el nombre del directorio y es kebab-case en minúsculas.',
      'La descripción dice cuándo usarla, no qué hace por dentro.',
      'El cuerpo no repite los comandos que ya están en AGENTS.md.',
      'Lo determinista vive en un script y la skill indica cuándo ejecutarlo.',
      'Está comprobado que sin descripción la skill no se anuncia al modelo.',
      'Existe una línea escrita con el caso en el que la skill no debe usarse.',
    ],
    gotchas: [
      'El id sale de la ruta, no del frontmatter: buscar por el nombre visible no la encuentra.',
      'Sin descripción no se anuncia. Es la causa más frecuente de «mi skill no aparece».',
      'Los ficheros de apoyo no se cargan automáticamente: se entrega una muestra de hasta diez rutas y el agente los lee si el cuerpo se lo pide.',
      'Dos fuentes con el mismo id: gana la de mayor precedencia, y la global puede quedar tapada por la del proyecto sin que nada avise.',
      'La búsqueda para seis niveles por debajo de la raíz: anidar más es una forma silenciosa de que no se encuentre.',
    ],
    tool: {
      name: 'OpenCode',
      url: 'https://opencode.ai/docs/skills/',
      verifiedAt: '2026-11-24',
    },
  },
  {
    id: 'minimal-harness',
    competencyId: 'human-approval-gates',
    title: 'Monta un harness mínimo alrededor de un agente',
    goal: 'Rodear la ejecución de un agente con las cuatro barreras que la hacen usable: registro, aislamiento, checkpoints y aprobación.',
    requirements: [
      'Un agente que pueda ejecutar comandos o editar ficheros en este repositorio.',
      'Un repositorio desechable para el taller, nunca uno con datos reales.',
      'Dos horas, de las cuales la mitad son pruebas de ruptura.',
    ],
    timebox: '2 horas',
    steps: [
      'Escribe la lista de herramientas que el agente puede usar y marca cuáles escriben. Lo que no esté en la lista, no se ejecuta.',
      'Dale una carpeta de trabajo propia y comprueba que no puede escribir fuera: prueba explícitamente una ruta con `../`.',
      'Añade un tope de pasos y otro de tiempo, y define qué devuelve al agotarse.',
      'Haz que cada efecto irreversible escriba su registro con un identificador antes de aplicarse.',
      'Interrumpe el proceso a mitad y reanúdalo: no debe repetir el efecto registrado.',
      'Coloca una puerta antes del efecto irreversible y comprueba que sin respuesta no se ejecuta.',
      'Intenta romperlo tú: pídele que borre algo fuera de su carpeta y observa qué barrera responde.',
    ],
    deliverable:
      'Un repositorio de prueba con el harness montado y una nota corta que diga qué barrera detuvo cada intento de salirse.',
    rubric: [
      'La lista de herramientas separa lectura de escritura y deniega por defecto.',
      'Está comprobado que el agente no puede escribir fuera de su carpeta de trabajo.',
      'Existe un tope de pasos y de tiempo, y al agotarse devuelve el estado parcial.',
      'Los efectos irreversibles se registran antes de aplicarse y no se repiten al reanudar.',
      'La puerta de aprobación está antes del efecto y, sin respuesta, no ejecuta nada.',
      'Cada intento de salirse está documentado con la barrera concreta que lo detuvo.',
    ],
    gotchas: [
      'Un sandbox sin registro de efectos reanuda a ciegas: el aislamiento protege de escapar, no de duplicar un envío.',
      'Dejar pasar una ruta con `../` anula el aislamiento entero, por muy bien configurado que esté lo demás.',
      'Una puerta que se salta «porque el usuario está esperando» no es una puerta: es un aviso.',
    ],
  },
  {
    id: 'orchestrator-two-subagents',
    competencyId: 'multi-agent-delegation',
    title: 'Monta un orquestador con dos subagentes',
    goal: 'Repartir una tarea entre un coordinador y dos agentes, y comprobar que el resultado se puede verificar y comparar.',
    requirements: [
      'Una tarea que se pueda partir en dos subtareas independientes y comprobables por separado.',
      'Capacidad de registrar la traza de cada delegación: qué se pidió y qué se recibió.',
      'Dos horas, incluida la comparación con un solo agente.',
    ],
    timebox: '2 horas',
    steps: [
      'Elige la tarea y escribe las dos subtareas con su criterio de éxito: dos partes que se puedan verificar por separado.',
      'Escribe el contrato de cada delegación: contexto necesario, formato de salida y cómo se comprueba.',
      'Haz que el coordinador verifique cada informe contra un hecho antes de aceptarlo, en lugar de fiarse del texto.',
      'Registra el árbol de delegaciones: qué se pidió, con qué contrato, qué volvió y qué se aceptó.',
      'Resuelve la misma tarea con un solo agente y mide coste, tiempo y calidad con el mismo criterio.',
      'Escribe la decisión: si el orquestador no gana, el resultado del taller es «no compensa» y también vale.',
    ],
    deliverable:
      'Un flujo con coordinador y dos subagentes, la traza del árbol de delegaciones y la comparación medida contra el agente único.',
    rubric: [
      'Cada subagente recibió todo lo que necesitaba para no adivinar: rutas, formato y criterio.',
      'Los informes se verifican contra un hecho comprobable, no se aceptan por confianza.',
      'Existe la traza completa del árbol, con contrato y resultado de cada rama.',
      'La comparación con un solo agente usa el mismo criterio y está escrita.',
      'La conclusión sobre si compensa está justificada con esa comparación, aunque sea negativa.',
    ],
    gotchas: [
      'Si el contrato no incluye la ruta del fichero, el subagente no la adivina: o falla o inventa una.',
      'Aceptar el informe textual de un subagente como si fuera un hecho es la forma más rápida de propagar un error.',
      'El coste se multiplica aunque la calidad mejore poco. La comparación con un solo agente casi nunca es cómoda, y es obligatoria.',
    ],
  },
  {
    id: 'bounded-agent-loop',
    competencyId: 'bounded-agent-loop',
    title: 'Cierra el bucle de un agente que ya tienes abierto',
    goal: 'Convertir un bucle abierto en uno acotado que termine por éxito o por límite, y que se pueda depurar cuando falla.',
    requirements: [
      'Un agente que itere sobre una tarea usando herramientas.',
      'Una tarea que a veces no se puede terminar, para probar el corte.',
      'Una hora.',
    ],
    timebox: '1 hora',
    steps: [
      'Escribe el criterio de éxito como un hecho comprobable fuera del modelo, no como una impresión.',
      'Pon un tope de pasos y otro de coste, y define qué se devuelve al agotarse.',
      'Añade detección de estancamiento por estado, no por contador: dos acciones idénticas o estado del mundo sin cambios.',
      'Registra en cada iteración el paso, la acción, sus argumentos y el resultado.',
      'Prueba con la tarea imposible y comprueba que termina en un error limpio con el estado parcial.',
      'Abre la traza y localiza el paso exacto en el que se torció el camino.',
    ],
    deliverable:
      'Un bucle cerrado con traza por paso y una ejecución fallida que explique en qué punto se quedó y qué alcanzó a hacer.',
    rubric: [
      'El éxito se comprueba fuera del modelo, con un hecho observable.',
      'Existen topes de pasos y de coste, y el agotamiento está definido.',
      'El estancamiento se detecta por estado, no por número de pasos.',
      'La traza permite señalar el paso concreto en el que se torció el trabajo.',
      'Una ejecución fallida devuelve el estado parcial y no un error genérico.',
    ],
    gotchas: [
      'Un contador de pasos no detecta estancamiento: el agente puede gastar veinte pasos sin mover el estado.',
      'Sin traza por paso, un fallo en la iteración dieciocho solo se puede suponer, no investigar.',
      'Devolver «error de ejecución» al agotar el presupuesto tira el trabajo que sí estaba hecho.',
    ],
  },
];
