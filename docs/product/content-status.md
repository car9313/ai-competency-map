# Estado del contenido

Generado desde el catálogo. **No editar a mano**: cambia el contenido y ejecuta `pnpm content:status`.

## Resumen

| | |
|---|---|
| Competencias publicadas | **39 / 39** |
| Pendientes | 0 |
| Lecciones escritas | 39 |
| Ítems escritos | **312** (objetivo ~312) |
| Áreas completas | 8 / 8 |

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

- ✅ `ai-ml-dl-boundaries` — lección y 8 ítems
- ✅ `supervised-vs-unsupervised` — lección y 8 ítems
- ✅ `generalization-overfitting` — lección y 8 ítems
- ✅ `deterministic-vs-learned` — lección y 8 ítems

<sub>32 ítems en el área · objetivo 32</sub>

### 02 · IA generativa y LLMs — 6/6

- ✅ `tokens-and-context-window` — lección y 8 ítems
- ✅ `tokenization-mechanics` — lección y 8 ítems
- ✅ `attention-and-transformers` — lección y 8 ítems
- ✅ `embeddings-and-vectors` — lección y 8 ítems
- ✅ `inference-latency-cost` — lección y 8 ítems
- ✅ `generation-controls` — lección y 8 ítems

<sub>48 ítems en el área · objetivo 48</sub>

### 03 · Prompt y context engineering — 6/6

- ✅ `system-instructions-contract` — lección y 8 ítems
- ✅ `few-shot-examples` — lección y 8 ítems
- ✅ `context-budgeting` — lección y 8 ítems
- ✅ `structured-outputs` — lección y 8 ítems
- ✅ `prompt-evaluation` — lección y 8 ítems
- ✅ `finetuning-vs-prompting` — lección y 8 ítems

<sub>48 ítems en el área · objetivo 48</sub>

### 04 · Aplicaciones de IA y RAG — 5/5

- ✅ `function-calling-contracts` — lección y 8 ítems
- ✅ `streaming-ux` — lección y 8 ítems
- ✅ `chunking-and-overlap` — lección y 8 ítems
- ✅ `hybrid-retrieval` — lección y 8 ítems
- ✅ `grounding-and-citations` — lección y 8 ítems

<sub>40 ítems en el área · objetivo 40</sub>

### 05 · Ingeniería agéntica — 6/6

- ✅ `bounded-agent-loop` — lección y 8 ítems
- ✅ `tool-schemas-and-selection` — lección y 8 ítems
- ✅ `agent-memory` — lección y 8 ítems
- ✅ `multi-agent-delegation` — lección y 8 ítems
- ✅ `mcp-protocol` — lección y 8 ítems
- ✅ `agent-skills` — lección y 8 ítems

<sub>48 ítems en el área · objetivo 48</sub>

### 06 · Harness engineering — 4/4

- ✅ `tool-registry-allowlist` — lección y 8 ítems
- ✅ `sandboxing-isolation` — lección y 8 ítems
- ✅ `checkpoints-recovery` — lección y 8 ítems
- ✅ `human-approval-gates` — lección y 8 ítems

<sub>32 ítems en el área · objetivo 32</sub>

### 07 · Arquitectura de software IA — 4/4

- ✅ `provider-abstraction` — lección y 8 ítems
- ✅ `model-routing` — lección y 8 ítems
- ✅ `orchestration-patterns` — lección y 8 ítems
- ✅ `resilience-fallback` — lección y 8 ítems

<sub>32 ítems en el área · objetivo 32</sub>

### 08 · Calidad y producción — 4/4

- ✅ `reproducible-evals` — lección y 8 ítems
- ✅ `guardrails-io` — lección y 8 ítems
- ✅ `observability-cost` — lección y 8 ítems
- ✅ `prompt-injection-defense` — lección y 8 ítems

<sub>32 ítems en el área · objetivo 32</sub>

## Qué falta, en orden

Nada: todas las competencias están publicadas.

## Criterio de cierre de la fase 2

- [ ] Las 39 competencias publicadas.
- [ ] ~312 ítems, con justificación por distractor.
- [ ] `pnpm validate:content` en cero, ejecutándose en CI.
- [ ] Ningún nodo del mapa queda como «próximamente».
