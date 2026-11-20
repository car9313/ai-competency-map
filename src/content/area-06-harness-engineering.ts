/**
 * Área 06 — Harness engineering.
 *
 * Cuatro competencias. El eje: lo que hace usable un agente no es su capacidad, son las
 * barreras que lo rodean.
 */
import type { Lesson } from '@/features/content/domain/types';
import type { Item } from '@/shared/types/domain';

export const LESSONS_AREA_06: readonly Lesson[] = [
  {
    competencyId: 'tool-registry-allowlist',
    whatIs:
      'Un registro es la lista de herramientas que el sistema conoce, y la lista de permitidas es cuáles puede usar un agente concreto. Todo lo que no está declarado no existe para el modelo, y lo que no está permitido no se ejecuta aunque el modelo lo pida.',
    problem:
      'El catálogo de herramientas crece sin control: alguien añade una, nadie revisa quién puede usarla, y un agente acaba con acceso a operaciones que nadie le concedió explícitamente.',
    internals: [
      'La política por defecto es denegar: cada herramienta se concede a propósito, no por herencia.',
      'El registro es la fuente de verdad para auditar: qué existe, con qué esquema y quién lo usa.',
      'Los esquemas se versionan: un cambio de argumentos rompe llamadas que ya funcionaban.',
      'El descubrimiento dinámico de herramientas es cómodo y peligroso: lo que aparece en ejecución no ha pasado revisión.',
    ],
    whenToUse: [
      'Siempre que un agente tenga efectos: el registro es lo que permite responder quién pudo hacer qué.',
      'Con versionado del esquema en cada cambio que pueda romper llamadas.',
    ],
    whenNotToUse: [
      'No permitas el descubrimiento dinámico sin una revisión previa.',
      'No dejes crecer la lista de permitidas sin revisar: cada entrada es una capacidad concedida.',
    ],
    pitfalls: [
      {
        title: 'Allowlist que crece por comodidad',
        detail:
          'Añadir una herramienta «para que funcione» sin revisar es como dar permisos de administrador para evitar un error de configuración.',
      },
      {
        title: 'Esquema sin versión',
        detail:
          'Cambiar los argumentos de una herramienta en uso rompe en silencio las llamadas que dependían del formato anterior.',
      },
    ],
    referenceIds: ['ref-anthropic-system'],
  },
  {
    competencyId: 'sandboxing-isolation',
    whatIs:
      'Aislar es ejecutar el código y las herramientas con permisos mínimos y límites de recursos: qué ficheros ve, a qué red llega, cuánto puede consumir. El aislamiento no evita que el modelo se equivoque; evita que equivocarse sea catastrófico.',
    problem:
      'El agente ejecuta comandos con los permisos de la persona que lo lanzó. Un error de razonamiento se convierte en un borrado real, y la conversación sobre el prompt se vuelve irrelevante.',
    internals: [
      'Mínimo privilegio: solo los ficheros y directorios que la tarea necesita.',
      'La red también es un permiso: sin límite, el contenido leído puede salir a un destino externo.',
      'Los límites de recursos evitan que un bucle consuma la máquina además del presupuesto.',
      'El aislamiento acota el daño de un fallo y no corrige la intención. Un prompt malo dentro de un sandbox sigue siendo un prompt malo.',
    ],
    whenToUse: [
      'En cualquier ejecución de código generado, sin excepciones.',
      'Con permisos concedidos por tarea, no por sesión completa.',
    ],
    whenNotToUse: [
      'No concedas acceso total «para que funcione»: el fallo siguiente será más caro.',
      'No asumas que el sandbox sustituye a la validación de acciones.',
    ],
    pitfalls: [
      {
        title: 'Credenciales dentro del entorno aislado',
        detail:
          'Si el sandbox no tiene red pero sí claves en el entorno, el aislamiento de red no protege nada.',
      },
      {
        title: 'Sandbox de ficheros y red abierta',
        detail:
          'Limitar el disco y dejar la red abierta permite exfiltrar lo que sí se pudo leer.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'checkpoints-recovery',
    whatIs:
      'Un checkpoint guarda el estado suficiente para reanudar una tarea larga sin repetir lo ya hecho. Lo importante no es guardar mucho, sino guardar lo que permite continuar sin volver a ejecutar efectos.',
    problem:
      'Una tarea de veinte pasos falla en el dieciocho y hay que empezar de cero. O peor: se reanuda y se vuelve a ejecutar la acción de pago, porque nadie registró que ya se había hecho.',
    internals: [
      'Se guarda antes de una acción larga o irreversible, no en cada paso: el coste también cuenta.',
      'La recuperación exige idempotencia o un registro de efectos ya aplicados.',
      'El checkpoint contiene lo mínimo para reanudar: estado de la tarea, no la transcripción entera.',
      'Reanudar sin verificar es repetir: el estado guardado y el mundo real pueden haber divergido.',
    ],
    whenToUse: [
      'En tareas largas y caras, y antes de cualquier efecto irreversible.',
      'Con un registro de acciones ejecutadas, para no repetirlas al recuperar.',
    ],
    whenNotToUse: [
      'No hagas checkpoint de cada token: el coste supera el beneficio.',
      'No reanudes asumiendo que el mundo está como lo dejaste.',
    ],
    pitfalls: [
      {
        title: 'Reanudar y repetir el pago',
        detail:
          'Sin idempotencia ni registro, la recuperación vuelve a aplicar el efecto. El fallo original se convierte en dos cargos.',
      },
      {
        title: 'Checkpoint que no sirve para reanudar',
        detail:
          'Guardar el historial completo no permite continuar: falta el estado de la tarea y lo ya ejecutado.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
  {
    competencyId: 'human-approval-gates',
    whatIs:
      'Una puerta de aprobación es el punto donde la automatización se detiene y una persona decide si el efecto se aplica. Su valor está en ser pocas, claras y anteriores al efecto.',
    problem:
      'Se pone aprobación en todo y la persona acaba pulsando «sí» sin leer; o no se pone en nada y una acción irreversible la decide un modelo. Los dos extremos son el mismo fallo: la puerta deja de informar.',
    internals: [
      'Se aprueba por clase de riesgo: irreversible, caro, con terceros o con datos sensibles.',
      'La puerta debe mostrar qué va a pasar exactamente, no el prompt que lo generó.',
      'La aprobación ocurre antes del efecto; después ya no hay nada que aprobar.',
      'Queda registro de quién aprobó qué: es la parte que permite auditar la decisión.',
    ],
    whenToUse: [
      'Antes de acciones irreversibles, costosas o que afectan a terceros.',
      'Con el detalle exacto de la acción propuesta, en lenguaje claro.',
    ],
    whenNotToUse: [
      'No pidas aprobación de todo: la fatiga de confirmación convierte la puerta en un trámite.',
      'No coloques la aprobación después de ejecutar.',
    ],
    pitfalls: [
      {
        title: 'Aprobar sin leer',
        detail:
          'Si todo requiere confirmación, nadie lee ninguna. La puerta existe y no protege nada.',
      },
      {
        title: 'Puerta que muestra el prompt',
        detail:
          'La persona necesita saber qué se va a hacer, no qué instrucciones recibió el modelo.',
      },
    ],
    referenceIds: ['ref-rules-ml'],
  },
];

export const ITEMS_AREA_06: readonly Item[] = [
  // ── tool-registry-allowlist ─────────────────────────────────────────────────
  {
    id: 'tr-default-policy',
    competencyId: 'tool-registry-allowlist',
    difficulty: 1,
    prompt: '¿Qué política por defecto conviene para las herramientas de un agente?',
    options: [
      {
        id: 'a',
        text: 'Denegar, y permitir cada una a propósito',
        correct: true,
        rationale:
          'Correcto: la lista de permitidas se construye por concesión explícita, no por herencia.',
      },
      {
        id: 'b',
        text: 'Permitir todo, y restringir si hay problemas',
        correct: false,
        rationale:
          'El problema se descubre cuando ya ocurrió. Restringir después es cerrar la puerta con el efecto hecho.',
      },
      {
        id: 'c',
        text: 'Permitir solo lectura, y ampliar poco a poco',
        correct: false,
        rationale:
          'Suena razonable y deja abierto lo que más importa: leer datos sensibles también es acceso.',
      },
    ],
    explanation:
      'El valor por defecto define la superficie de riesgo. Denegar y conceder a propósito hace que cada capacidad tenga un dueño y una razón, y que auditarla sea posible.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tr-registry-purpose',
    competencyId: 'tool-registry-allowlist',
    difficulty: 2,
    prompt: '¿Para qué sirve tener un registro central de herramientas?',
    options: [
      {
        id: 'a',
        text: 'Para saber qué existe y quién puede usarlo',
        correct: true,
        rationale:
          'Correcto: el registro es la fuente de verdad para auditar y para conceder permisos con criterio.',
      },
      {
        id: 'b',
        text: 'Para que el agente tenga más herramientas disponibles',
        correct: false,
        rationale:
          'Más herramientas no es el objetivo. El registro puede servir para todo lo contrario: limitar.',
      },
      {
        id: 'c',
        text: 'Para acelerar las llamadas al modelo',
        correct: false,
        rationale:
          'El registro no interviene en la velocidad. Es control y trazabilidad, no rendimiento.',
      },
    ],
    explanation:
      'Sin registro no hay respuesta a «quién pudo hacer esto». El registro convierte el catálogo de herramientas en algo gobernable: declarado, versionado y auditable.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tr-dynamic-discovery',
    competencyId: 'tool-registry-allowlist',
    difficulty: 2,
    prompt: 'El agente descubre herramientas nuevas en tiempo de ejecución. ¿Qué haces?',
    options: [
      {
        id: 'a',
        text: 'Revisarlas antes de permitir su uso',
        correct: true,
        rationale:
          'Correcto: lo que aparece en ejecución no ha pasado revisión. Una herramienta nueva es una capacidad nueva.',
      },
      {
        id: 'b',
        text: 'Dejar que las use: para eso están',
        correct: false,
        rationale:
          'Conceder acceso sin revisar es lo mismo que no tener lista de permitidas.',
      },
      {
        id: 'c',
        text: 'Registrarlas automáticamente y revisar al final',
        correct: false,
        rationale:
          'Al final ya se usaron. La revisión posterior no deshace el efecto de una herramienta indebida.',
      },
    ],
    explanation:
      'El descubrimiento dinámico es comodidad para el desarrollador y superficie de ataque para el sistema. Una herramienta no revisada es un permiso concedido a ciegas.',
    referenceId: 'ref-anthropic-system',
  },
  {
    id: 'tr-schema-version',
    competencyId: 'tool-registry-allowlist',
    difficulty: 3,
    prompt: 'Cambias los argumentos del esquema de una herramienta en uso. ¿Qué riesgo aparece?',
    options: [
      {
        id: 'a',
        text: 'Llamadas antiguas con argumentos que ya no valen',
        correct: true,
        rationale:
          'Correcto: quien dependía del formato anterior falla o envía datos con otro significado.',
      },
      {
        id: 'b',
        text: 'Ninguno: el modelo se adapta al esquema nuevo',
        correct: false,
        rationale:
          'El modelo ve el esquema nuevo, pero el resto del sistema no. La frontera es la que rompe.',
      },
      {
        id: 'c',
        text: 'Solo un aumento de latencia',
        correct: false,
        rationale:
          'No es rendimiento: es un cambio de contrato. Los fallos aparecen como errores de validación.',
      },
    ],
    explanation:
      'El esquema de una herramienta es un contrato con todo lo que la llama. Cambiarlo sin versión rompe a los consumidores en silencio, igual que cambiar una API pública.',
    referenceId: 'ref-anthropic-system',
  },

  // ── sandboxing-isolation ────────────────────────────────────────────────────
  {
    id: 'sb-why-isolate',
    competencyId: 'sandboxing-isolation',
    difficulty: 1,
    prompt: '¿Para qué sirve aislar la ejecución de un agente?',
    options: [
      {
        id: 'a',
        text: 'Para que un error no sea catastrófico',
        correct: true,
        rationale:
          'Correcto: el aislamiento acota el daño. El agente puede equivocarse sin poder destruir el sistema.',
      },
      {
        id: 'b',
        text: 'Para que el agente razone con más libertad',
        correct: false,
        rationale:
          'El aislamiento no cambia el razonamiento. Cambia lo que puede alcanzar un error.',
      },
      {
        id: 'c',
        text: 'Para reducir el coste por token de la ejecución',
        correct: false,
        rationale:
          'El coste del modelo no cambia. Lo que cambia es el alcance del daño posible.',
      },
    ],
    explanation:
      'Un agente con permisos amplios convierte cualquier error de razonamiento en un incidente real. El aislamiento no lo hace más listo: hace que equivocarse tenga un techo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sb-scoped-write',
    competencyId: 'sandboxing-isolation',
    difficulty: 2,
    prompt: 'El agente necesita escribir en un directorio de trabajo. ¿Qué permites?',
    options: [
      {
        id: 'a',
        text: 'Escritura solo en ese directorio',
        correct: true,
        rationale:
          'Correcto: mínimo privilegio. Lo que la tarea necesita, y nada más allá de su espacio.',
      },
      {
        id: 'b',
        text: 'Escritura en todo el disco, para evitar errores',
        correct: false,
        rationale:
          'Evita errores de permiso y abre la puerta a borrar cualquier cosa. El intercambio es pésimo.',
      },
      {
        id: 'c',
        text: 'Ninguna escritura, aunque la tarea la necesite',
        correct: false,
        rationale:
          'Si la tarea requiere escribir, negarlo la hace imposible. El criterio es el alcance necesario.',
      },
    ],
    explanation:
      'El mínimo privilegio se define por tarea: el directorio donde trabaja, los ficheros que necesita. Conceder el disco entero para evitar un error de permisos es resolver un síntoma creando un riesgo.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sb-network-limit',
    competencyId: 'sandboxing-isolation',
    difficulty: 2,
    prompt: '¿Por qué limitar el acceso a la red de un agente que ejecuta código?',
    options: [
      {
        id: 'a',
        text: 'Evitar que lo leído salga a un tercero',
        correct: true,
        rationale:
          'Correcto: con red abierta, cualquier contenido al que llegue el agente puede enviarse fuera.',
      },
      {
        id: 'b',
        text: 'Ahorrar ancho de banda en la infraestructura',
        correct: false,
        rationale:
          'El consumo es lo de menos. El riesgo es la salida de datos a un destino no controlado.',
      },
      {
        id: 'c',
        text: 'Mejorar la velocidad de ejecución del código',
        correct: false,
        rationale:
          'Limitar la red no acelera nada. Es una decisión de seguridad, no de rendimiento.',
      },
    ],
    explanation:
      'La red es el canal de salida. Si el agente puede leer datos sensibles y además tiene red sin restricción, el aislamiento de ficheros no impide que esos datos terminen fuera.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'sb-not-a-cure',
    competencyId: 'sandboxing-isolation',
    difficulty: 3,
    prompt: 'Con un sandbox estricto, ¿un prompt mal diseñado deja de ser un problema?',
    options: [
      {
        id: 'a',
        text: 'No: el sandbox acota el daño, no la intención',
        correct: true,
        rationale:
          'Correcto: el agente seguirá haciendo lo que el prompt le lleva a hacer, dentro de los límites.',
      },
      {
        id: 'b',
        text: 'Sí: si no puede salir, no puede hacer daño',
        correct: false,
        rationale:
          'Puede hacer daño dentro: borrar su directorio, gastar presupuesto o producir salidas falsas.',
      },
      {
        id: 'c',
        text: 'Sí, si el sandbox no tiene red ni escritura',
        correct: false,
        rationale:
          'Sin escritura ni red queda el coste y el resultado incorrecto, que también son fallos reales.',
      },
    ],
    explanation:
      'El sandbox es una barrera de contención, no una corrección. Sigue haciendo falta que el prompt, las herramientas y la validación sean correctos: cada capa cubre un fallo distinto.',
    referenceId: 'ref-rules-ml',
  },

  // ── checkpoints-recovery ────────────────────────────────────────────────────
  {
    id: 'cp-when-to-save',
    competencyId: 'checkpoints-recovery',
    difficulty: 1,
    prompt: '¿Cuándo conviene guardar un checkpoint?',
    options: [
      {
        id: 'a',
        text: 'Antes de una acción larga o irreversible',
        correct: true,
        rationale:
          'Correcto: es el punto donde perder el estado cuesta más y donde repetir el efecto es más peligroso.',
      },
      {
        id: 'b',
        text: 'En cada paso, para no perder nada',
        correct: false,
        rationale:
          'Guardar todo tiene su coste y no aporta: reanudar necesita el estado, no cada detalle.',
      },
      {
        id: 'c',
        text: 'Solo al terminar la tarea completa',
        correct: false,
        rationale:
          'Al terminar ya no hay nada que reanudar. El checkpoint sirve para el fallo intermedio.',
      },
    ],
    explanation:
      'El checkpoint es una inversión para el fallo, no para el éxito. Se coloca donde el fallo sería caro y donde volver a ejecutar tendría consecuencias.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'cp-idempotency',
    competencyId: 'checkpoints-recovery',
    difficulty: 2,
    prompt: 'Reanudas una tarea y vuelve a ejecutarse el cobro. ¿Qué faltaba?',
    options: [
      {
        id: 'a',
        text: 'Idempotencia o registro de lo ya ejecutado',
        correct: true,
        rationale:
          'Correcto: sin saber qué pasos se aplicaron, la recuperación repite los efectos.',
      },
      {
        id: 'b',
        text: 'Más contexto en el prompt de reanudación',
        correct: false,
        rationale:
          'El problema no es información del modelo, es que el sistema no sabe qué se hizo ya.',
      },
      {
        id: 'c',
        text: 'Un modelo más capaz para reanudar',
        correct: false,
        rationale:
          'La capacidad del modelo no evita un doble cobro. Es un problema de estado y de registro.',
      },
    ],
    explanation:
      'Recuperar es decidir qué falta por hacer. Sin idempotencia ni registro de efectos, no se puede distinguir «pendiente» de «ya hecho», y repetir acciones irreversibles es el resultado.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'cp-content',
    competencyId: 'checkpoints-recovery',
    difficulty: 2,
    prompt: '¿Qué debe contener un checkpoint para ser útil?',
    options: [
      {
        id: 'a',
        text: 'Lo mínimo para reanudar sin repetir efectos',
        correct: true,
        rationale:
          'Correcto: estado de la tarea y pasos aplicados. Ni la transcripción entera ni solo el último mensaje.',
      },
      {
        id: 'b',
        text: 'El historial completo de la conversación',
        correct: false,
        rationale:
          'Es mucho volumen y no dice qué se ejecutó. Razona el contexto, no reanuda la tarea.',
      },
      {
        id: 'c',
        text: 'Solo el último mensaje del usuario',
        correct: false,
        rationale:
          'Falta todo lo hecho antes. Sin estado acumulado, reanudar es empezar de nuevo.',
      },
    ],
    explanation:
      'Un checkpoint es estado accionable: qué se ha hecho, qué falta y qué restricciones siguen vigentes. Si no permite continuar sin repetir, es un log, no un checkpoint.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'cp-not-every-step',
    competencyId: 'checkpoints-recovery',
    difficulty: 3,
    prompt: '¿Por qué no se guarda un checkpoint en cada paso?',
    options: [
      {
        id: 'a',
        text: 'El coste de guardar supera el beneficio',
        correct: true,
        rationale:
          'Correcto: escribir estado en cada paso añade latencia y volumen sin mejorar la recuperación.',
      },
      {
        id: 'b',
        text: 'Porque técnicamente no es posible',
        correct: false,
        rationale:
          'Es posible. La cuestión es si aporta algo frente a su coste.',
      },
      {
        id: 'c',
        text: 'Porque los checkpoints son inseguros',
        correct: false,
        rationale:
          'Hay requisitos de seguridad, pero el motivo aquí es económico: frecuencia frente a utilidad.',
      },
    ],
    explanation:
      'La recuperación solo necesita volver al último punto seguro antes del fallo. Guardar en cada paso multiplica el coste y no reduce el trabajo perdido de forma significativa.',
    referenceId: 'ref-rules-ml',
  },

  // ── human-approval-gates ────────────────────────────────────────────────────
  {
    id: 'hg-where-to-place',
    competencyId: 'human-approval-gates',
    difficulty: 1,
    prompt: '¿Dónde se coloca una puerta de aprobación humana?',
    options: [
      {
        id: 'a',
        text: 'Antes de un efecto irreversible',
        correct: true,
        rationale:
          'Correcto: la aprobación tiene sentido antes de hacer algo que luego no se puede deshacer.',
      },
      {
        id: 'b',
        text: 'En cada paso del agente',
        correct: false,
        rationale:
          'Aprueba tanto que nadie lee. La fatiga de confirmación convierte la puerta en un trámite.',
      },
      {
        id: 'c',
        text: 'Al final del día, en un resumen',
        correct: false,
        rationale:
          'Cuando llega el resumen, los efectos ya ocurrieron. Aprobar después no es aprobar.',
      },
    ],
    explanation:
      'La puerta existe para impedir un efecto, así que va antes. Pocas, claras y en el punto de riesgo: si son muchas, la persona aprueba sin mirar y la protección desaparece.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'hg-approval-fatigue',
    competencyId: 'human-approval-gates',
    difficulty: 2,
    prompt: 'Todo requiere confirmación y el equipo aprueba sin leer. ¿Qué ha fallado?',
    options: [
      {
        id: 'a',
        text: 'La puerta se ha convertido en un trámite',
        correct: true,
        rationale:
          'Correcto: aprobar todo entrena a aprobar sin mirar. La protección existe en el papel y no en la práctica.',
      },
      {
        id: 'b',
        text: 'Nada: el proceso funciona como se diseñó',
        correct: false,
        rationale:
          'Funciona en apariencia. Un control que siempre se aprueba no distingue el caso peligroso.',
      },
      {
        id: 'c',
        text: 'Solo ha subido el coste operativo',
        correct: false,
        rationale:
          'El coste es lo visible. Lo importante es que la barrera dejó de informar.',
      },
    ],
    explanation:
      'La aprobación es un recurso escaso: la atención humana. Si se pide para todo, se gasta en lo irrelevante y falta justo cuando el caso es grave.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'hg-what-to-show',
    competencyId: 'human-approval-gates',
    difficulty: 2,
    prompt: '¿Qué debe mostrar la puerta de aprobación?',
    options: [
      {
        id: 'a',
        text: 'Qué va a pasar exactamente, sin adornos',
        correct: true,
        rationale:
          'Correcto: la persona decide sobre el efecto. Necesita el efecto, no las instrucciones que lo generaron.',
      },
      {
        id: 'b',
        text: 'El prompt completo que recibió el modelo',
        correct: false,
        rationale:
          'El prompt es el medio. Quien aprueba necesita saber qué se hará, no qué se le dijo al modelo.',
      },
      {
        id: 'c',
        text: 'El modelo y la versión usados',
        correct: false,
        rationale:
          'Es metadato técnico. No ayuda a decidir si ese cobro o ese borrado es correcto.',
      },
    ],
    explanation:
      'Una puerta sirve si la persona puede decidir en segundos. Eso exige el efecto concreto —a quién, cuánto, qué se borra— y no el contexto interno del sistema.',
    referenceId: 'ref-rules-ml',
  },
  {
    id: 'hg-after-effect',
    competencyId: 'human-approval-gates',
    difficulty: 3,
    prompt: 'La aprobación se pide después de ejecutar la acción. ¿Cuál es el problema?',
    options: [
      {
        id: 'a',
        text: 'Ya no hay nada que aprobar: el efecto ocurrió',
        correct: true,
        rationale:
          'Correcto: aprobar a posteriori es un aviso, no un control. La decisión llegó cuando ya no servía.',
      },
      {
        id: 'b',
        text: 'Ninguno, mientras quede registro',
        correct: false,
        rationale:
          'El registro sirve para auditar, no para impedir. La acción ya está hecha.',
      },
      {
        id: 'c',
        text: 'Solo que el flujo es más lento',
        correct: false,
        rationale:
          'La lentitud es lo de menos. El problema es que la barrera no impide nada.',
      },
    ],
    explanation:
      'Un control posterior es un registro, y los registros son útiles y no protegen. Si el efecto es irreversible, la aprobación tiene que estar antes o no es una puerta.',
    referenceId: 'ref-rules-ml',
  },
];
