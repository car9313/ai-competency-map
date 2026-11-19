# Linter de contenido

El contenido no se revisa a ojo. Se valida con reglas que rompen el build.

> **Principio:** un revisor humano no debería gastar atención en comprobar si hay exactamente una respuesta correcta. Eso lo hace la máquina. El humano juzga si la explicación es buena.

---

## 1. Por qué existe

Con ~120 ítems escritos por una sola persona a lo largo de meses, la calidad se degrada de forma silenciosa: una opción sin justificación, un ítem huérfano, un prerrequisito mal escrito. Ninguno rompe la aplicación; todos empeoran el producto.

El linter convierte esas degradaciones en **errores de build**, que es el único sitio donde alguien los va a ver.

---

## 2. Reglas

| ID  | Regla                     | Severidad | Qué comprueba                                                                                     |
| --- | ------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| R1  | Estructura del ítem       | error     | 3–4 opciones · exactamente una `correct: true` · ids únicos dentro del ítem                         |
| R2  | Justificación por opción  | error     | Toda opción tiene `rationale` ≥ 40 caracteres, y no es idéntica a la de otra opción del mismo ítem   |
| R3  | Explicación del ítem      | error     | `explanation` ≥ 80 caracteres y no repite literalmente ningún `rationale`                           |
| R4  | Cobertura                 | error     | Toda competencia tiene ≥ 1 lección y ≥ 3 ítems · todo `competencyId` existe · ningún ítem huérfano    |
| R5  | Forma del grafo           | error     | Acíclico · sin autorreferencias · todo prerrequisito existe · toda competencia alcanzable desde una raíz |
| R6  | Referencias               | warning   | Toda lección cita ≥ 1 referencia con URL `https` válida y `reviewedAt` no futura                     |
| R7  | Neutralidad de forma      | warning   | La opción correcta no es > 1.5× la media de las incorrectas en longitud · sin "todas las anteriores" · sin pistas de posición |

**Errores** rompen el build. **Avisos** se reportan y no bloquean, para no frenar la autoría por detalles estéticos.

---

## 3. Detalle de las reglas que no son obvias

### R2 — Justificación por opción

El valor pedagógico está en el distractor. Un ítem con explicación general pero distractores mudos enseña "esa no era", no "por qué esa parece correcta".

```ts
// ❌ inválido
{ id: 'b', text: '1024', correct: false, rationale: '' }

// ✅ válido
{
  id: 'b',
  text: '1024',
  correct: false,
  rationale: 'La ventana de contexto se mide en tokens, no en caracteres ni en kilobytes. Confundirla con memoria es el error más habitual.'
}
```

### R4 — Cobertura mínima

Una competencia con un solo ítem no puede estar consolidada nunca según el motor (su único ítem define todo el estado). El mínimo de 3 es una consecuencia del modelo, no una preferencia editorial.

### R5 — Forma del grafo

Se reutiliza el mismo orden topológico que dibuja el mapa (patrón 7 de [`design-patterns.md`](../architecture/design-patterns.md)). Si el grafo tiene un ciclo, el linter y el layout fallan en el mismo punto.

### R7 — Neutralidad de forma

El atajo más común para aprobar sin saber: la opción correcta es la más larga, la más específica o la que tiene más matices. La regla no lo prohíbe, lo **avisa**, porque a veces la correcta necesita más palabras. Lo que sí se prohíbe: "todas las anteriores" y "ninguna de las anteriores", que no miden conocimiento sino estrategia de examen.

---

## 4. Fase del pipeline

```text
content/*.ts
    │
    ├─ 1. Zod: estructura, tipos, formatos, campos obligatorios   → error de esquema
    ├─ 2. Linter: reglas semánticas R1–R7                          → error de regla
    └─ 3. Índice: construir mapas id → entidad                     → falla si hay ids duplicados
```

Zod comprueba la **forma**; el linter comprueba el **significado**. Están separados a propósito: un esquema que intentara validar "¿la explicación es buena?" sería un esquema que miente.

---

## 5. Los fixtures negativos

Por cada regla existe un fichero deliberadamente inválido en `content/__fixtures__/invalid/`, y un test que **exige** que el linter lo rechace.

| Fixture                        | Regla | Resultado esperado              |
| ------------------------------ | ----- | ------------------------------- |
| `two-correct-options.ts`       | R1    | rechazado                       |
| `empty-rationale.ts`           | R2    | rechazado                       |
| `explanation-copies-rationale.ts` | R3 | rechazado                       |
| `orphan-item.ts`               | R4    | rechazado                       |
| `graph-cycle.ts`               | R5    | rechazado                       |
| `missing-reference.ts`         | R6    | aceptado con aviso              |
| `longest-option-is-correct.ts` | R7    | aceptado con aviso              |

> Un linter que nunca ha rechazado nada es un linter que nadie ha probado. Los fixtures negativos son la diferencia entre "tenemos un linter" y "el linter funciona".

---

## 6. Lo que el linter no puede comprobar

Conviene decirlo:

- Si la explicación es **correcta** técnicamente.
- Si el distractor es plausible **para un humano concreto**.
- Si la competencia está bien ubicada en el grafo.
- Si la lección enseña lo que el ítem evalúa.

Eso es revisión humana, y por eso existe [`docs/contributing/content-authoring.md`](../contributing/content-authoring.md): la lista de comprobación para lo que ninguna regla automática alcanza.
