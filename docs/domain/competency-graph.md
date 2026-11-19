# Grafo de competencias

El mapa del producto. 39 competencias en 8 áreas, con su capa y sus prerrequisitos. Es el insumo del linter (reglas R4 y R5) y de la autoría de contenido.

---

## 1. La regla de granularidad

> **Una competencia es una cosa que se puede demostrar en 10 minutos con 3 a 8 preguntas.**

Se aplica en los dos sentidos:

| Si es demasiado amplia                                   | Si es demasiado estrecha                                   |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| "LLMs" → se divide en tokens, tokenización, atención, embeddings, inferencia | "Qué significa la sigla GPT" → no hay nada que demostrar    |
| "RAG" → chunking, recuperación híbrida, grounding          | "Cuántas capas tiene un transformer" → dato, no competencia |

Una buena prueba: **si no sabes cuál es el error típico que comete la gente, todavía no es una competencia.** Una competencia existe porque alguien se equivoca en algo concreto.

---

## 2. Cómo se lee una competencia

| Campo            | Significado                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `id`             | Identificador estable en inglés, kebab-case. **Nunca cambia**, aunque cambie el título |
| Competencia      | Título en español, el que ve el alumno                                       |
| Qué demuestra    | La frase que resumiría la evidencia. Si no cabe en una línea, es muy amplia   |
| Capa             | Dónde vive el trabajo: `núcleo`, `servicio` o `interfaz` (ver §3)             |
| Prerrequisitos   | Aristas `from → to`. Se debe tener evidencia en `from` para desbloquear `to`   |
| Nivel            | 1 inicial · 2 intermedio · 3 avanzado. Orienta el orden, no bloquea            |

**El desbloqueo solo mira evidencia, nunca dominio** ([ADR-003](../architecture/adr/ADR-003-progreso-derivado.md)): quien falla un repaso no vuelve a bloquear lo que ya alcanzó.

---

## 3. El eje por capa

Cada competencia se etiqueta con la capa donde vive la mayor parte del trabajo:

| Capa         | Significado                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| **núcleo**   | Concepto que se entiende igual en cualquier capa. Base para dialogar con cualquiera |
| **servicio** | Se implementa y se opera en servidor, en el proveedor o en el pipeline de datos     |
| **interfaz** | Se resuelve en el navegador: lo que la persona ve y toca                           |

**El eje tiene dos usos:**

1. **Filtro por rol en el mapa.** Un perfil de frontend puede ver solo `interfaz` + `núcleo` y obtener una ruta coherente sin perderse entre retrieval, evals y observabilidad.
2. **Diagnóstico editorial.** Si un área entera resulta ser `servicio`, quizá no interese a media audiencia.

### Y un hallazgo que conviene decir en voz alta

El reparto real es: **22 de servicio, 14 de núcleo y 1 de interfaz.**

Eso no es un defecto del reparto: es la verdad sobre la disciplina. La ingeniería de IA es mayoritariamente trabajo de servicio. Lo que un perfil frontend necesita de verdad es:

- la **capa de interfaz** (`streaming-ux`), que es donde su trabajo se nota;
- los **14 conceptos de núcleo**, para poder discutir con quien construye el servicio sin aceptar magia como explicación;
- del resto, **saber que existen**, no implementarlos.

Vender lo contrario —"aprende a hacer RAG en el navegador"— llenaría el mapa y vaciaría el criterio.

---

## 4. Área 01 — Fundamentos de IA

| ID                        | Competencia                                            | Qué demuestra                                                                 | Capa    | Prerrequisitos |
| ------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------- | ------- | -------------- |
| `ai-ml-dl-boundaries`     | Fronteras entre IA, ML y deep learning                 | Distinguir los tres niveles y qué implica cada uno en una decisión técnica      | núcleo  | — (raíz)       |
| `supervised-vs-unsupervised` | Supervisado, no supervisado y refuerzo              | Elegir el paradigma según el dato disponible y el objetivo                       | núcleo  | `ai-ml-dl-boundaries` |
| `generalization-overfitting` | Generalización, sobreajuste y partición de datos    | Explicar por qué un modelo que acierta en entrenamiento puede fallar en producción | núcleo | `supervised-vs-unsupervised` |
| `deterministic-vs-learned` | Código determinista frente a inferencia aprendida      | Decidir cuándo un `if`, un SQL o una expresión regular es mejor que un modelo   | núcleo  | `ai-ml-dl-boundaries` |

**Nivel:** 1–2 · **Error típico que detecta:** usar un LLM donde bastaba una regla; tratar una salida probabilística como una garantía.

---

## 5. Área 02 — IA generativa y LLMs

| ID                          | Competencia                                    | Qué demuestra                                                                    | Capa    | Prerrequisitos |
| --------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------- | ------- | -------------- |
| `tokens-and-context-window` | Tokens y ventana de contexto                   | Calcular un presupuesto de contexto y explicar por qué se agota                   | núcleo  | `ai-ml-dl-boundaries` |
| `tokenization-mechanics`    | Tokenización y sus efectos                     | Predecir por qué la misma frase ocupa tokens distintos en dos idiomas o formatos   | núcleo  | `tokens-and-context-window` |
| `attention-and-transformers`| Atención y transformer autorregresivo          | Explicar cómo se genera el siguiente token y qué implica "atención"               | núcleo  | `tokens-and-context-window` |
| `embeddings-and-vectors`    | Embeddings y similitud vectorial               | Medir similitud y saber cuándo la distancia semántica engaña                      | servicio| `tokens-and-context-window` |
| `inference-latency-cost`    | Inferencia: latencia, coste y no-determinismo  | Estimar coste y latencia, y explicar por qué la misma entrada no da la misma salida | núcleo  | `tokens-and-context-window`, `attention-and-transformers` |
| `generation-controls`       | Temperatura, top-p y criterios de parada      | Elegir parámetros de muestreo y explicar por qué la misma entrada da salidas distintas | núcleo  | `tokens-and-context-window` |

**Nivel:** 1–2 · **Error típico:** asumir que 1 palabra = 1 token; ignorar la degradación de la atención en el centro del contexto.

---

## 6. Área 03 — Prompt y context engineering

| ID                            | Competencia                              | Qué demuestra                                                                  | Capa     | Prerrequisitos |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- | -------- | -------------- |
| `system-instructions-contract` | Instrucciones de sistema como contrato   | Escribir un contrato estable que no se rompa con entradas hostiles               | núcleo   | `tokens-and-context-window` |
| `few-shot-examples`           | Ejemplos few-shot y su coste             | Decidir cuándo los ejemplos ayudan y cuándo solo gastan contexto                 | núcleo   | `system-instructions-contract` |
| `context-budgeting`           | Presupuesto de contexto                   | Repartir contexto entre instrucciones, recuperación y salida reservada           | núcleo   | `tokens-and-context-window` |
| `structured-outputs`          | Salidas estructuradas y validación       | Forzar formato y validarlo en lugar de confiar en el prompt                      | servicio | `system-instructions-contract` |
| `prompt-evaluation`           | Evaluar un prompt y detectar regresiones | Medir si un cambio de prompt mejora o empeora, con casos fijos                   | servicio | `structured-outputs` |
| `finetuning-vs-prompting`     | Cuándo ajustar un modelo y cuándo basta el prompt | Decidir entre prompt, ejemplos y ajuste fino según coste, datos y estabilidad | servicio | `system-instructions-contract` |

**Nivel:** 1–3 · **Error típico:** "ha funcionado tres veces, luego funciona siempre"; validar la salida como si el prompt la garantizara.

---

## 7. Área 04 — Aplicaciones de IA y RAG

| ID                          | Competencia                                    | Qué demuestra                                                                  | Capa     | Prerrequisitos |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- | -------- | -------------- |
| `function-calling-contracts`| Function calling y contratos de herramientas   | Definir una herramienta con esquema y manejar sus fallos                        | servicio | `structured-outputs`, `system-instructions-contract` |
| `streaming-ux`              | Streaming y respuesta parcial                  | Diseñar la interfaz cuando la respuesta llega por trozos                         | **interfaz** | `tokens-and-context-window` |
| `chunking-and-overlap`      | Chunking y solapamiento                        | Elegir tamaño de trozo y solapamiento según el contenido                        | servicio | `embeddings-and-vectors` |
| `hybrid-retrieval`          | Recuperación híbrida: léxica y vectorial       | Explicar por qué una búsqueda sola falla y cómo combinarlas                     | servicio | `chunking-and-overlap` |
| `grounding-and-citations`   | Grounding, citas y control de alucinación      | Anclar una respuesta a fuentes verificables y detectar cuándo no lo está         | núcleo   | `hybrid-retrieval` |

**Nivel:** 2–3 · **Error típico:** recuperar por similitud cuando se buscaba un código de error exacto; citar sin verificar que la cita existe.

---

## 8. Área 05 — Ingeniería agéntica

| ID                          | Competencia                                | Qué demuestra                                                                  | Capa     | Prerrequisitos |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- | -------- | -------------- |
| `bounded-agent-loop`        | Ciclo de agente acotado                    | Describir percibir → planificar → actuar → observar, y sus límites              | servicio | `function-calling-contracts` |
| `tool-schemas-and-selection`| Esquemas de herramientas y selección       | Diseñar herramientas que el modelo elija bien y usar correctamente               | servicio | `function-calling-contracts`, `bounded-agent-loop` |
| `agent-memory`              | Memoria y compactación                     | Decidir qué recordar, qué resumir y qué descartar entre turnos                   | servicio | `context-budgeting`, `bounded-agent-loop` |
| `multi-agent-delegation`    | Delegación multiagente y sus costes        | Justificar cuándo delegar a varios agentes y cuándo es peor que uno solo         | servicio | `bounded-agent-loop`, `tool-schemas-and-selection` |
| `mcp-protocol`              | MCP: interoperabilidad de herramientas     | Explicar qué resuelve un protocolo común frente a integraciones ad hoc           | servicio | `tool-schemas-and-selection` |
| `agent-skills`              | Skills: capacidades empaquetadas bajo demanda | Explicar cómo un agente descubre, carga y usa instrucciones empaquetadas sin meterlas todas en el contexto | servicio | `tool-schemas-and-selection` |

**Nivel:** 3 · **Error típico:** agentes sin límite de pasos; delegar por moda sin medir el coste de coordinación; cargar todas las instrucciones siempre porque "por si acaso".

> **Por qué `agent-skills` está separada de `mcp-protocol`.** MCP resuelve *por dónde* viajan las herramientas; las skills resuelven *cómo* se empaqueta el conocimiento para que el agente lo cargue cuando le hace falta. Son complementarias y se confunden mucho.

---

## 9. Área 06 — Harness engineering

| ID                          | Competencia                        | Qué demuestra                                                              | Capa     | Prerrequisitos |
| --------------------------- | ---------------------------------- | --------------------------------------------------------------------------- | -------- | -------------- |
| `tool-registry-allowlist`   | Tool registry y lista de permitidos | Impedir que el agente invoque herramientas que no existen en el registro     | servicio | `tool-schemas-and-selection` |
| `sandboxing-isolation`      | Sandboxing y aislamiento           | Delimitar qué puede tocar una herramienta y con qué privilegios              | servicio | `tool-registry-allowlist` |
| `checkpoints-recovery`      | Checkpoints y recuperación         | Reanudar tras un fallo sin repetir efectos ya aplicados                       | servicio | `bounded-agent-loop`, `tool-registry-allowlist` |
| `human-approval-gates`      | Puertas de aprobación humana       | Clasificar operaciones por riesgo y pausar solo las que lo merecen           | servicio | `tool-registry-allowlist` |

**Nivel:** 3 · **Error típico:** confiar en que el modelo "decida bien"; ejecutar escrituras sin puerta de aprobación; no tener checkpoints y duplicar efectos al reintentar.

---

## 10. Área 07 — Arquitectura de software IA

| ID                        | Competencia                            | Qué demuestra                                                                     | Capa    | Prerrequisitos |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- | ------- | -------------- |
| `provider-abstraction`    | Contratos propios y desacoplamiento    | Diseñar casos de uso que no importan de qué proveedor vienen                       | servicio| `structured-outputs`, `inference-latency-cost` |
| `model-routing`           | Enrutado de modelos                    | Elegir modelo por tarea, coste y latencia, y justificarlo                          | servicio| `provider-abstraction` |
| `orchestration-patterns`  | Orquestación y límites del sistema     | Decidir dónde vive la lógica y qué queda dentro del modelo                        | servicio| `bounded-agent-loop`, `provider-abstraction` |
| `resilience-fallback`     | Resiliencia: timeout, reintento, fallback | Diseñar qué pasa cuando el proveedor falla o tarda demasiado                    | núcleo  | `provider-abstraction`, `model-routing` |

**Nivel:** 3 · **Error típico:** llamar al SDK del proveedor desde la interfaz; reintentar sin idempotencia; un único proveedor como punto de fallo.

---

## 11. Área 08 — Calidad y producción

| ID                          | Competencia                              | Qué demuestra                                                                  | Capa     | Prerrequisitos |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- | -------- | -------------- |
| `reproducible-evals`        | Evals reproducibles                      | Construir un conjunto de casos que detecte regresiones al cambiar prompt o modelo | servicio | `prompt-evaluation` |
| `guardrails-io`             | Guardrails de entrada y salida           | Filtrar lo que entra y lo que sale, sin romper la experiencia                    | núcleo   | `grounding-and-citations`, `tool-registry-allowlist` |
| `observability-cost`        | Observabilidad de latencia, tokens y coste | Trazar una ejecución y atribuir su coste                                       | servicio | `inference-latency-cost` |
| `prompt-injection-defense`  | Defensa ante prompt injection            | Detectar y contener contenido que intenta secuestrar instrucciones               | servicio | `tool-registry-allowlist`, `guardrails-io` |

**Nivel:** 2–3 · **Error típico:** evaluar de memoria en vez de con un conjunto fijo; medir coste por petición cuando lo que importa es por resultado aceptado.

---

## 12. Forma del grafo

- **Raíz única:** `ai-ml-dl-boundaries`. Todo lo demás es alcanzable desde ella.
- **Aciclico por construcción:** cada arista apunta de un nodo a otro posterior en el orden de este documento. El linter (R5) lo verifica con orden topológico, el mismo que dibuja el mapa.
- **Profundidad máxima:** 8 niveles (`ai-ml-dl-boundaries` → `tokens-and-context-window` → `system-instructions-contract` → `structured-outputs` → `function-calling-contracts` → `bounded-agent-loop` → `tool-schemas-and-selection` → `tool-registry-allowlist` → `sandboxing-isolation`).

```text
fundamentos → LLMs → prompt → apps/RAG → agéntico → harness
                 ↘ arquitectura ↘
                        calidad ↗
```

Áreas 07 y 08 no son una etapa final: son transversales y se desbloquean en paralelo cuando sus prerrequisitos están cubiertos.

---

## 13. Rutas sugeridas

No son requisito del producto (el grafo ya define el orden), pero sirven de guía y de escena de demo.

| Ruta                   | Secuencia                                                                                                                                                                    | Para quién                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **Fundamentos**        | `ai-ml-dl-boundaries` → `supervised-vs-unsupervised` → `generalization-overfitting` → `deterministic-vs-learned` → `tokens-and-context-window` → `tokenization-mechanics` → `attention-and-transformers` | Quien empieza               |
| **Perfil frontend**    | `ai-ml-dl-boundaries` → `deterministic-vs-learned` → `tokens-and-context-window` → `system-instructions-contract` → `context-budgeting` → `structured-outputs` → `streaming-ux` → `grounding-and-citations` | Frontend y full-stack       |
| **Primera aplicación** | `tokens-and-context-window` → `system-instructions-contract` → `structured-outputs` → `context-budgeting` → `embeddings-and-vectors` → `chunking-and-overlap` → `hybrid-retrieval` → `grounding-and-citations` | Quien va a construir con RAG |
| **Sistemas agénticos** | `function-calling-contracts` → `bounded-agent-loop` → `tool-schemas-and-selection` → `mcp-protocol` → `agent-skills` → `tool-registry-allowlist` → `human-approval-gates` → `checkpoints-recovery` → `sandboxing-isolation` → `prompt-injection-defense` | Quien opera agentes         |

---

## 14. Volumen de contenido

| Concepto                  | Cifra                    |
| ------------------------- | ------------------------ |
| Competencias              | 39                       |
| Lecciones                 | 39 (una por competencia) |
| Ítems mínimos (regla R4)  | 3 por competencia = 117  |
| Ítems objetivo            | 4 por competencia = 156  |
| Ítems por ruta completa   | ~40                      |

Con 156 ítems el producto es útil de verdad; con los 117 mínimos, funcional pero repetitivo. El techo razonable son 6 por competencia: más suele indicar que la competencia debería dividirse.

---

## 15. Lo que queda fuera, y por qué

| Excluido                                       | Motivo                                                                    | Condición para reconsiderarlo            |
| ---------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| Fine-tuning                                     | Requiere datos y presupuesto; poco frecuente en el perfil objetivo         | Si se pide de forma repetida por usuarios |
| Visión por computador, voz                      | Otra rama entera; diluye la tesis                                          | Nunca en este producto                   |
| Modelos locales (Ollama, GGUF)                   | Hardware y otra disciplina                                                  | Área nueva si hay interés real            |
| IA en el ciclo de vida del desarrollo (copilotos) | Es un tema de productividad, no de ingeniería de sistemas                  | Si el producto crece más allá del MVP     |
| Ética y regulación (AI Act)                      | Importante, pero es otra audiencia                                          | Publicación específica, no un nodo del grafo |

---

## 16. Preguntas abiertas

1. **¿Una sola raíz es demasiado estrecha?** Un alumno con experiencia debe recorrer fundamentos antes de llegar a lo que necesita. Mitigación posible: una **evaluación de entrada** que, respondiendo 3–4 ítems, marque la competencia con evidencia y la salte. Es funcionalidad nueva, no contenido: se decide en la fase 2.
2. **¿Las áreas 05 y 06 deben ser dos?** Agentes (razonamiento y herramientas) y harness (política y contención) son disciplinas distintas, pero comparten vocabulario. Se mantienen separadas porque el harness es sobre **límites**, no sobre capacidades.
3. **Una sola competencia de interfaz, ¿es suficiente?** Es el reparto honesto, no una omisión. Si al escribir el contenido aparecen más temas genuinamente de cliente (estados de error, percepción de latencia, incertidumbre en la UI), se añaden; rellenar por simetría sería peor.
4. **¿37 es el número correcto?** Es una propuesta, no una medida. Se valida escribiendo los primeros 10 ítems de tres competencias: si cuesta llegar a 3, la competencia era demasiado estrecha; si sobran ideas, era demasiado amplia.
