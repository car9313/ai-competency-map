/**
 * Herramientas del ecosistema, como módulo aparte.
 *
 * Deliberadamente **fuera** de las competencias: una competencia debe seguir siendo cierta
 * cuando cambie el precio de una herramienta. Aquí se puede nombrar marcas y decir qué
 * ofrece cada una gratis, con una fecha para saber cuánto ha envejecido la ficha.
 *
 * `verifiedAt` es la fecha en la que alguien abrió la página del proveedor y confirmó la
 * capa gratuita y la de pago. `null` significa **sin comprobar en vivo**: es la situación
 * honesta de la primera tanda, escrita desde conocimiento general del ecosistema y no desde
 * una visita a cada proveedor. La ficha lo dice en la interfaz en lugar de fingir una fecha.
 *
 * Sin precios: un número caduca en semanas y además depende de país y de negociación. Lo que
 * se conserva es la forma de la oferta —hay capa gratuita, hay límite, es solo de pago—,
 * que es lo que decide si puedes empezar hoy.
 */
import type { IsoDate } from '@/shared/time/clock';

export interface ToolEntry {
  readonly name: string;
  /** Para qué sirve, en una línea. */
  readonly what: string;
  /** Qué ofrece sin pagar. `'—'` cuando no hay capa gratuita. */
  readonly free: string;
  /** Qué añade la versión de pago. */
  readonly paid: string;
  readonly url: string;
  /** Fecha de la última comprobación en vivo, o `null` si no se ha comprobado. */
  readonly verifiedAt: IsoDate | null;
}

export interface ToolCategory {
  readonly id: string;
  readonly title: string;
  readonly intro: string;
  readonly tools: readonly ToolEntry[];
}

export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  {
    id: 'agentes',
    title: 'Agentes en el editor y en el terminal',
    intro:
      'El sitio donde se pasa la mayor parte del tiempo. La diferencia práctica no es el modelo, es cuánto puede hacer el agente sin que le abras la puerta de par en par.',
    tools: [
      {
        name: 'Cline',
        what: 'Extensión de código abierto: agente con lectura de ficheros, comandos y diffs aprobables.',
        free: 'Extensión gratis; pagas el modelo aparte.',
        paid: '—',
        url: 'https://github.com/cline/cline',
        verifiedAt: null,
      },
      {
        name: 'Aider',
        what: 'Agente de terminal que trabaja sobre el repositorio y hace commits por su cuenta.',
        free: 'Código abierto; pagas el modelo aparte.',
        paid: '—',
        url: 'https://aider.chat',
        verifiedAt: null,
      },
      {
        name: 'Continue',
        what: 'Autocompletado y chat integrados en el editor, con modelos propios o locales.',
        free: 'Código abierto, con modelos locales.',
        paid: 'Capa de equipo con modelos gestionados.',
        url: 'https://continue.dev',
        verifiedAt: null,
      },
      {
        name: 'Gemini CLI',
        what: 'Agente de terminal de Google, con cuota gratuita generosa.',
        free: 'Capa gratuita con límite de peticiones.',
        paid: 'Cuotas mayores por API.',
        url: 'https://github.com/google-gemini/gemini-cli',
        verifiedAt: null,
      },
      {
        name: 'OpenAI Codex CLI',
        what: 'Agente de terminal publicado como código abierto.',
        free: 'CLI gratis; pagas el modelo aparte.',
        paid: 'Suscripción con cuota incluida.',
        url: 'https://github.com/openai/codex',
        verifiedAt: null,
      },
      {
        name: 'Claude Code',
        what: 'Agente de terminal con acceso al repositorio y ejecución de comandos.',
        free: '—',
        paid: 'Suscripción mensual o por uso de API.',
        url: 'https://www.anthropic.com/claude-code',
        verifiedAt: null,
      },
      {
        name: 'Cursor',
        what: 'Editor completo con agente integrado y contexto de repositorio.',
        free: 'Capa gratuita limitada y prueba.',
        paid: 'Suscripción mensual.',
        url: 'https://cursor.com',
        verifiedAt: null,
      },
      {
        name: 'GitHub Copilot',
        what: 'Autocompletado y agente dentro de VS Code, JetBrains y la web de GitHub.',
        free: 'Capa gratuita limitada; gratis para estudiantes y proyectos abiertos verificados.',
        paid: 'Suscripción por usuario.',
        url: 'https://github.com/features/copilot',
        verifiedAt: null,
      },
      {
        name: 'Windsurf',
        what: 'Editor con agente y flujo de cambios revisables.',
        free: 'Capa gratuita limitada.',
        paid: 'Suscripción mensual.',
        url: 'https://windsurf.com',
        verifiedAt: null,
      },
      {
        name: 'Zed',
        what: 'Editor rápido con asistencia integrada y soporte de modelos propios.',
        free: 'Editor gratis.',
        paid: 'Funciones de equipo.',
        url: 'https://zed.dev',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'especificacion',
    title: 'Especificación y contrato del repositorio',
    intro:
      'La parte que no depende de ninguna marca: convertir un requisito en criterios comprobables y dejar escrito cómo se trabaja en el proyecto.',
    tools: [
      {
        name: 'GitHub Spec Kit',
        what: 'Kit abierto que ordena el trabajo en cuatro fases: especificar, planificar, trocear e implementar, con puntos de control humanos.',
        free: 'Código abierto y sin coste.',
        paid: '—',
        url: 'https://github.com/github/spec-kit',
        verifiedAt: null,
      },
      {
        name: 'AGENTS.md',
        what: 'Formato abierto de instrucciones para agentes en el repositorio. Es un fichero, no un producto.',
        free: 'Especificación abierta.',
        paid: '—',
        url: 'https://agents.md',
        verifiedAt: null,
      },
      {
        name: 'GitHub Issues y Projects',
        what: 'Peticiones, criterios de aceptación y tablero, pegados al repositorio.',
        free: 'Incluido en repositorios públicos y en la capa gratuita.',
        paid: 'Funciones de proyecto y permisos avanzados.',
        url: 'https://github.com/features/issues',
        verifiedAt: null,
      },
      {
        name: 'Linear',
        what: 'Gestión de tareas con integración de agentes y estados claros.',
        free: 'Capa gratuita para equipos pequeños.',
        paid: 'Por usuario y mes.',
        url: 'https://linear.app',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'ci-calidad',
    title: 'Integración continua y calidad',
    intro:
      'Donde se garantiza lo que no puede fallar nunca. Si una regla depende de que alguien se acuerde, no está garantizada.',
    tools: [
      {
        name: 'GitHub Actions',
        what: 'Ejecuta pruebas, lint y escaneos en cada cambio.',
        free: 'Minutos gratuitos; sin coste en repositorios públicos.',
        paid: 'Minutos adicionales y ejecutores más grandes.',
        url: 'https://github.com/features/actions',
        verifiedAt: null,
      },
      {
        name: 'Dependabot',
        what: 'Actualiza dependencias y avisa de vulnerabilidades conocidas.',
        free: 'Incluido en GitHub.',
        paid: '—',
        url: 'https://github.com/dependabot',
        verifiedAt: null,
      },
      {
        name: 'Semgrep',
        what: 'Análisis estático con reglas propias: detecta patrones y secretos.',
        free: 'Motor abierto y capa gratuita en la nube.',
        paid: 'Reglas gestionadas y políticas de equipo.',
        url: 'https://semgrep.dev',
        verifiedAt: null,
      },
      {
        name: 'Trivy',
        what: 'Escaneo de dependencias, imágenes y configuraciones.',
        free: 'Código abierto.',
        paid: '—',
        url: 'https://trivy.dev',
        verifiedAt: null,
      },
      {
        name: 'Snyk',
        what: 'Vulnerabilidades de dependencias con arreglos sugeridos.',
        free: 'Capa gratuita con límite de pruebas.',
        paid: 'Por desarrollador.',
        url: 'https://snyk.io',
        verifiedAt: null,
      },
      {
        name: 'SonarQube',
        what: 'Calidad y deuda técnica con puertas de calidad.',
        free: 'Edición comunitaria autoalojada.',
        paid: 'Nube y análisis de ramas.',
        url: 'https://www.sonarsource.com',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'revision',
    title: 'Revisión de cambios',
    intro:
      'Un primer pase automático sirve para llegar antes a lo que importa. No sustituye la firma de una persona, que es donde está la responsabilidad.',
    tools: [
      {
        name: 'CodeRabbit',
        what: 'Revisión automática de pull requests con resumen y comentarios por línea.',
        free: 'Gratis en repositorios abiertos; capa gratuita limitada.',
        paid: 'Por repositorio y mes.',
        url: 'https://coderabbit.ai',
        verifiedAt: null,
      },
      {
        name: 'Graphite',
        what: 'Revisión por pilas de cambios pequeños y cola de revisión.',
        free: 'Capa gratuita personal.',
        paid: 'Por usuario en equipos.',
        url: 'https://graphite.dev',
        verifiedAt: null,
      },
      {
        name: 'Qodo',
        what: 'Revisión y generación de pruebas sobre el diff.',
        free: 'Capa gratuita limitada.',
        paid: 'Suscripción por usuario.',
        url: 'https://www.qodo.ai',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'evaluacion',
    title: 'Evaluación de prompts y respuestas',
    intro:
      'Sin un conjunto de casos y una línea base, cualquier cambio de prompt es una opinión con suerte.',
    tools: [
      {
        name: 'promptfoo',
        what: 'Compara prompts y modelos contra un conjunto de casos, con informe en consola o web.',
        free: 'Código abierto.',
        paid: 'Capa gestionada opcional.',
        url: 'https://promptfoo.dev',
        verifiedAt: null,
      },
      {
        name: 'DeepEval',
        what: 'Métricas de evaluación con integración en las pruebas del proyecto.',
        free: 'Código abierto.',
        paid: 'Plataforma gestionada.',
        url: 'https://deepeval.com',
        verifiedAt: null,
      },
      {
        name: 'Ragas',
        what: 'Métricas específicas para sistemas con recuperación de documentos.',
        free: 'Código abierto.',
        paid: '—',
        url: 'https://ragas.io',
        verifiedAt: null,
      },
      {
        name: 'LangSmith',
        what: 'Trazas y evaluación de aplicaciones con modelos.',
        free: 'Capa gratuita con límite de trazas.',
        paid: 'Por asiento y volumen.',
        url: 'https://www.langchain.com/langsmith',
        verifiedAt: null,
      },
      {
        name: 'Braintrust',
        what: 'Evaluación y experimentación con comparación entre versiones.',
        free: 'Capa gratuita limitada.',
        paid: 'Por uso.',
        url: 'https://www.braintrust.dev',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'observabilidad',
    title: 'Observabilidad',
    intro:
      'Qué pasó, cuánto costó y por qué. Sin trazas, un incidente se investiga adivinando.',
    tools: [
      {
        name: 'Langfuse',
        what: 'Trazas, coste y evaluación de llamadas a modelos.',
        free: 'Código abierto para autoalojar; capa gratuita en la nube.',
        paid: 'Nube con retención y asientos.',
        url: 'https://langfuse.com',
        verifiedAt: null,
      },
      {
        name: 'Arize Phoenix',
        what: 'Observabilidad y evaluación de aplicaciones con modelos.',
        free: 'Código abierto.',
        paid: 'Plataforma gestionada.',
        url: 'https://phoenix.arize.com',
        verifiedAt: null,
      },
      {
        name: 'OpenTelemetry',
        what: 'Estándar abierto de trazas y métricas; sirve también para LLM.',
        free: 'Estándar y bibliotecas abiertas.',
        paid: '—',
        url: 'https://opentelemetry.io',
        verifiedAt: null,
      },
      {
        name: 'Helicone',
        what: 'Proxy de observabilidad con coste y latencia por petición.',
        free: 'Capa gratuita con límite de peticiones.',
        paid: 'Por volumen.',
        url: 'https://www.helicone.ai',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'guardrails',
    title: 'Guardrails y seguridad',
    intro:
      'Filtros y validaciones que se ejecutan, no instrucciones que se piden. Un guardrail que depende del prompt es una sugerencia.',
    tools: [
      {
        name: 'Guardrails AI',
        what: 'Validación de salidas con esquemas y correctores.',
        free: 'Código abierto.',
        paid: 'Catálogo gestionado.',
        url: 'https://www.guardrailsai.com',
        verifiedAt: null,
      },
      {
        name: 'NeMo Guardrails',
        what: 'Restricciones de conversación y flujos definidos por políticas.',
        free: 'Código abierto.',
        paid: '—',
        url: 'https://github.com/NVIDIA/NeMo-Guardrails',
        verifiedAt: null,
      },
      {
        name: 'Llama Guard',
        what: 'Modelo clasificador para filtrar contenido de entrada y salida.',
        free: 'Modelo abierto, ejecutable en local.',
        paid: '—',
        url: 'https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'orquestacion',
    title: 'Orquestación y flujos',
    intro:
      'Cuando el trabajo dura más que una petición: hace falta estado, reintentos y puntos de control.',
    tools: [
      {
        name: 'LangGraph',
        what: 'Grafos de estados para flujos con agentes y bucles acotados.',
        free: 'Código abierto.',
        paid: 'Plataforma gestionada.',
        url: 'https://www.langchain.com/langgraph',
        verifiedAt: null,
      },
      {
        name: 'Vercel AI SDK',
        what: 'Utilidades para streaming, herramientas y modelos en TypeScript.',
        free: 'Código abierto.',
        paid: '—',
        url: 'https://sdk.vercel.ai',
        verifiedAt: null,
      },
      {
        name: 'Temporal',
        what: 'Ejecución duradera de flujos con reintentos e idempotencia.',
        free: 'Código abierto autoalojado.',
        paid: 'Nube gestionada.',
        url: 'https://temporal.io',
        verifiedAt: null,
      },
      {
        name: 'Inngest',
        what: 'Funciones duraderas por pasos, con eventos y reintentos.',
        free: 'Capa gratuita con límite de ejecuciones.',
        paid: 'Por volumen.',
        url: 'https://www.inngest.com',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'datos',
    title: 'Datos y búsqueda vectorial',
    intro:
      'Donde vive lo que el modelo consulta. La elección importa menos que el troceado y que medir si recuperas lo que responde.',
    tools: [
      {
        name: 'pgvector',
        what: 'Búsqueda por similitud dentro de PostgreSQL.',
        free: 'Extensión abierta.',
        paid: '—',
        url: 'https://github.com/pgvector/pgvector',
        verifiedAt: null,
      },
      {
        name: 'Qdrant',
        what: 'Base de datos vectorial con filtros y cuantización.',
        free: 'Código abierto autoalojado.',
        paid: 'Nube gestionada.',
        url: 'https://qdrant.tech',
        verifiedAt: null,
      },
      {
        name: 'Chroma',
        what: 'Base vectorial ligera para prototipos y proyectos pequeños.',
        free: 'Código abierto.',
        paid: 'Nube gestionada.',
        url: 'https://www.trychroma.com',
        verifiedAt: null,
      },
      {
        name: 'Pinecone',
        what: 'Servicio gestionado de búsqueda vectorial.',
        free: 'Capa gratuita limitada.',
        paid: 'Por uso e índice.',
        url: 'https://www.pinecone.io',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'modelos',
    title: 'Modelos y ejecución',
    intro:
      'La decisión que más cambia el coste. Empezar en local o con una capa gratuita permite medir antes de comprometerse.',
    tools: [
      {
        name: 'Ollama',
        what: 'Ejecuta modelos en tu máquina con un comando.',
        free: 'Código abierto, sin coste por uso.',
        paid: '—',
        url: 'https://ollama.com',
        verifiedAt: null,
      },
      {
        name: 'LM Studio',
        what: 'Aplicación de escritorio para probar modelos locales con interfaz.',
        free: 'Gratis para uso personal.',
        paid: 'Licencia comercial.',
        url: 'https://lmstudio.ai',
        verifiedAt: null,
      },
      {
        name: 'OpenRouter',
        what: 'Una sola API para muchos modelos, con comparación de precio.',
        free: 'Algunos modelos gratuitos con límite.',
        paid: 'Pago por uso.',
        url: 'https://openrouter.ai',
        verifiedAt: null,
      },
      {
        name: 'Groq',
        what: 'Inferencia muy rápida sobre modelos abiertos.',
        free: 'Capa gratuita con límite de peticiones.',
        paid: 'Pago por uso.',
        url: 'https://groq.com',
        verifiedAt: null,
      },
    ],
  },
  {
    id: 'despliegue',
    title: 'Despliegue',
    intro:
      'Publicar sin servidor propio. Para un producto estático, la capa gratuita suele bastar durante mucho tiempo.',
    tools: [
      {
        name: 'Vercel',
        what: 'Despliegue automático desde el repositorio, con vista previa por cambio.',
        free: 'Capa personal gratuita.',
        paid: 'Por equipo y ancho de banda.',
        url: 'https://vercel.com',
        verifiedAt: null,
      },
      {
        name: 'Cloudflare Pages',
        what: 'Sitios estáticos y funciones en el borde.',
        free: 'Capa gratuita amplia.',
        paid: 'Funciones y límites mayores.',
        url: 'https://pages.cloudflare.com',
        verifiedAt: null,
      },
      {
        name: 'Railway',
        what: 'Servicios con base de datos y despliegue desde el repositorio.',
        free: 'Prueba limitada.',
        paid: 'Por uso.',
        url: 'https://railway.app',
        verifiedAt: null,
      },
      {
        name: 'Fly.io',
        what: 'Máquinas pequeñas cerca del usuario.',
        free: 'Capa gratuita reducida.',
        paid: 'Por máquina y tráfico.',
        url: 'https://fly.io',
        verifiedAt: null,
      },
    ],
  },
];
