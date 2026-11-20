# Estado del contenido

Generado desde el catálogo. **No editar a mano**: cambia el contenido y ejecuta `pnpm content:status`.

## Resumen

| | |
|---|---|
| Competencias publicadas | **11 / 39** |
| Pendientes | 28 |
| Lecciones escritas | 11 |
| Ítems escritos | **44** (objetivo ~156) |
| Áreas completas | 2 / 8 |

Una competencia cuenta como publicada solo si tiene lección e ítems, y eso lo verifica el
linter de contenido (regla R4) en CI: `pnpm validate:content`.

## Qué significa «publicada»

| Regla | Exige |
|---|---|
| R1 | Identificadores únicos en todo el catálogo |
| R2 | Enunciado, explicación y referencias presentes |
| R3 | Entre 3 y 4 opciones por ítem, y exactamente una correcta |
| R4 | Cada competencia publicada: 1 lección y ≥3 ítems |
| R5 | Los prerrequisitos existen y el grafo no tiene ciclos |
| R6 | Las opciones de un ítem no delatan la correcta por longitud |
| R7 | La referencia citada existe |

Una competencia con `published: false` aparece en el mapa como «próximamente» y el linter
no le exige contenido. Es la forma de publicar el grafo completo sin mentir sobre lo que hay.

## Por área

### 01 · Fundamentos de IA — 4/4

- ✅ `ai-ml-dl-boundaries` — lección y 4 ítems
- ✅ `supervised-vs-unsupervised` — lección y 4 ítems
- ✅ `generalization-overfitting` — lección y 4 ítems
- ✅ `deterministic-vs-learned` — lección y 4 ítems

<sub>16 ítems en el área · objetivo 16</sub>

### 02 · IA generativa y LLMs — 6/6

- ✅ `tokens-and-context-window` — lección y 4 ítems
- ✅ `tokenization-mechanics` — lección y 4 ítems
- ✅ `attention-and-transformers` — lección y 4 ítems
- ✅ `embeddings-and-vectors` — lección y 4 ítems
- ✅ `inference-latency-cost` — lección y 4 ítems
- ✅ `generation-controls` — lección y 4 ítems

<sub>24 ítems en el área · objetivo 24</sub>

### 03 · Prompt y context engineering — 1/6

- ✅ `system-instructions-contract` — lección y 4 ítems
- ⬜ `few-shot-examples` — falta lección y 4 ítems
- ⬜ `context-budgeting` — falta lección y 4 ítems
- ⬜ `structured-outputs` — falta lección y 4 ítems
- ⬜ `prompt-evaluation` — falta lección y 4 ítems
- ⬜ `finetuning-vs-prompting` — falta lección y 4 ítems

<sub>4 ítems en el área · objetivo 24</sub>

### 04 · Aplicaciones de IA y RAG — 0/5

- ⬜ `function-calling-contracts` — falta lección y 4 ítems
- ⬜ `streaming-ux` — falta lección y 4 ítems
- ⬜ `chunking-and-overlap` — falta lección y 4 ítems
- ⬜ `hybrid-retrieval` — falta lección y 4 ítems
- ⬜ `grounding-and-citations` — falta lección y 4 ítems

<sub>0 ítems en el área · objetivo 20</sub>

### 05 · Ingeniería agéntica — 0/6

- ⬜ `bounded-agent-loop` — falta lección y 4 ítems
- ⬜ `tool-schemas-and-selection` — falta lección y 4 ítems
- ⬜ `agent-memory` — falta lección y 4 ítems
- ⬜ `multi-agent-delegation` — falta lección y 4 ítems
- ⬜ `mcp-protocol` — falta lección y 4 ítems
- ⬜ `agent-skills` — falta lección y 4 ítems

<sub>0 ítems en el área · objetivo 24</sub>

### 06 · Harness engineering — 0/4

- ⬜ `tool-registry-allowlist` — falta lección y 4 ítems
- ⬜ `sandboxing-isolation` — falta lección y 4 ítems
- ⬜ `checkpoints-recovery` — falta lección y 4 ítems
- ⬜ `human-approval-gates` — falta lección y 4 ítems

<sub>0 ítems en el área · objetivo 16</sub>

### 07 · Arquitectura de software IA — 0/4

- ⬜ `provider-abstraction` — falta lección y 4 ítems
- ⬜ `model-routing` — falta lección y 4 ítems
- ⬜ `orchestration-patterns` — falta lección y 4 ítems
- ⬜ `resilience-fallback` — falta lección y 4 ítems

<sub>0 ítems en el área · objetivo 16</sub>

### 08 · Calidad y producción — 0/4

- ⬜ `reproducible-evals` — falta lección y 4 ítems
- ⬜ `guardrails-io` — falta lección y 4 ítems
- ⬜ `observability-cost` — falta lección y 4 ítems
- ⬜ `prompt-injection-defense` — falta lección y 4 ítems

<sub>0 ítems en el área · objetivo 16</sub>

## Qué falta, en orden

Quedan **28 competencias** y unos **112 ítems**. El orden recomendado sigue las dependencias del grafo: primero las áreas cuyos prerrequisitos ya tienen contenido, para que el desbloqueo sea demostrable.

1. Área 03 · Prompt y context engineering (5 pendientes)
2. Área 04 · Aplicaciones y RAG (5)
3. Área 05 · Ingeniería agéntica (6)
4. Área 06 · Harness engineering (4)
5. Área 07 · Arquitectura de software IA (4)
6. Área 08 · Calidad y producción (4)

## Criterio de cierre de la fase 2

- [ ] Las 39 competencias publicadas.
- [ ] ~156 ítems, con justificación por distractor.
- [ ] `pnpm validate:content` en cero, ejecutándose en CI.
- [ ] Ningún nodo del mapa queda como «próximamente».
