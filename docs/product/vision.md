# Visión

## El problema

Un desarrollador que ya sabe programar necesita construir con IA. Está rodeado de contenido y aun así no puede responder tres preguntas:

1. **¿Por dónde empiezo y qué viene después?** No hay orden. La gente salta a agentes y RAG sin saber qué es un token, y acaba copiando tutoriales que no puede depurar.
2. **¿Qué es criterio durable y qué es una herramienta de paso?** Un tutorial enseña un framework que cambia en tres meses. Lo que no cambia es el mecanismo: el contexto es un presupuesto finito, la recuperación falla de forma distinta si es léxica o semántica, un agente necesita una capa de política que no dependa de que el modelo se porte bien.
3. **¿Cómo sé que de verdad lo aprendí?** Leer parece aprender. Normalmente no lo es.

Lo que existe falla en al menos una: los cursos masivos dan volumen sin mapa; los roadmaps dan orden sin profundidad ni comprobación; los blogs dan profundidad sin secuencia; y casi todo mide interacción, no conocimiento.

## Para quién es

**Persona principal:** desarrollador frontend o full-stack con 2+ años de experiencia a quien le están pidiendo añadir funcionalidades de IA en el trabajo, o que se prepara para entrevistas donde AI Engineering ya se da por supuesto. Sabe leer código. No necesita motivación: necesita estructura y una forma de demostrarse progreso a sí mismo.

**No es para:** principiantes que aún aprenden a programar, investigadores que buscan profundidad matemática, ni gente buscando el tutorial de una herramienta.

## Propuesta de valor

> Un mapa de competencias de AI Engineering donde tu progreso es **evidencia que produjiste**, no una casilla que marcaste.

El diferenciador no es el volumen de contenido. Es el **modelo de evidencia**: cada competencia tiene un estado derivado de intentos registrados, cada ítem se reprograma con repaso espaciado, y el mapa se desbloquea a medida que demuestras comprensión.

## Lo que este producto no es

- No es un curso en vídeo ni una biblioteca de contenido. Las lecciones existen para alimentar la evaluación, no al revés.
- No es una plataforma de comunidad. Sin perfiles, comentarios ni clasificaciones en la v1.
- No es un playground para llamar modelos. No hay IA en la v1 — ver [ADR-005](../architecture/adr/ADR-005-sin-ia-en-v1.md).
- No es multi-idioma en la v1. Contenido en español, con costura para inglés.
- No es una certificación. La evidencia es para el alumno, no para una autoridad.

## El modelo de evidencia en un párrafo

El alumno lee una lección y después responde ítems. Cada respuesta se guarda como un `Attempt` inmutable con el orden de opciones que se presentó, si fue correcta, qué confianza declaró y cuándo ocurrió. El planificador convierte cada intento en una próxima fecha de repaso. El estado de la competencia se calcula a partir de esos intentos, bajo demanda, cada vez. Nada del progreso lo escribe el usuario: siempre se relee del historial. Esto permite revisar, recalcular y equivocarse en público sin corromper el modelo.

## El guion de demo

Es el **criterio de aceptación de la v1**. Si una escena no está en esta lista, no pertenece a la release. Todo cabe en cinco minutos y no requiere explicación previa.

| Momento   | Escena                                                                                                                    | Qué demuestra                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 0:00–0:30 | El mapa: ~37 competencias con cuatro estados visibles (bloqueada, disponible, en aprendizaje, consolidada).               | Esto es un mapa, no un catálogo.                      |
| 0:30–1:30 | Abrir una competencia disponible, leer una lección corta, empezar la comprobación.                                        | El contenido alimenta la evaluación.                  |
| 1:30–3:00 | Fallar un ítem y ver por qué **ese** distractor era tentador. Acertar otro con **mucha** confianza y otro con **poca**.    | El feedback es por distractor; la confianza cambia la calidad de la evidencia. |
| 3:00–3:30 | Comparar los dos aciertos: el seguro se reprograma a semanas, el dudoso a días.                                            | El planificador es real y explicable.                 |
| 3:30–4:30 | Avanzar el reloj a mañana: la cola de repaso contiene exactamente los ítems vencidos; al vaciarla se desbloquea una nueva competencia. | Repaso espaciado y progresión con puerta funcionan juntos. |
| 4:30–5:00 | Mostrar la suite del planificador y el linter fallando un ítem mal escrito a propósito.                                    | La calidad se verifica, no se declara.                |

## Señales de éxito

En orden de prioridad, y deliberadamente estrechas:

1. **Una demo de cinco minutos** que corre en local con `pnpm dev`, sin configuración, sin cuenta y sin clave.
2. **Un juego de documentación** que un ingeniero senior lea en quince minutos y concluya "esta persona modela dominios como es debido".
3. **Una publicación open-source** más adelante, cuando el núcleo esté estable. No antes.

No cuentan como métricas: número de lecciones, número de tecnologías, líneas de código.

## Restricciones (no negociables)

| Restricción                | Consecuencia                                                                      |
| -------------------------- | --------------------------------------------------------------------------------- |
| **Presupuesto cero**       | Sin APIs de pago, sin base de datos gestionada, sin hosting de pago. Solo estático. |
| **Sin integración de LLM** | La v1 sale sin IA. Existen el contrato y un adaptador de fixtures; nada llama a un proveedor. |
| **Solo español, por ahora**| Sin `next-intl` ni segmento `[locale]`. Se mantiene una costura para que el inglés sea aditivo. |
| **Desarrollo en solitario**| Cada fase tiene que producir algo demostrable por sí misma.                        |
| **Dominio puro**           | La lógica de evaluación tiene que correr sin navegador.                            |

## Decisiones abiertas

| Decisión           | Valor actual                      | Revisar cuando              |
| ------------------ | --------------------------------- | --------------------------- |
| Nombre del producto| "AI Competency Map" (provisional) | Antes del primer commit público |
| Idioma de la UI    | Español                           | Después de que la v1 sea demostrable |
| Hosting            | GitHub Pages o free tier de Vercel| Salida de la fase 1          |
| Licencia           | Sin decidir                       | Antes de abrir el código     |
