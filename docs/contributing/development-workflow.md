# Flujo de desarrollo y convenciones

Un autor, pero con las mismas reglas que un equipo: no porque haya que coordinarse, sino porque **las convenciones son lo que hace legible un repositorio dentro de seis meses**.

---

## 1. El ciclo

```text
rama  →  commits atómicos  →  pnpm check  →  PR  →  CI verde  →  squash merge
```

Nunca se hace commit directamente a `main`. Ni siquiera el primer día: el hábito se instala o no se instala.

---

## 2. Ramas

| Prefijo     | Uso                                  | Ejemplo                        |
| ----------- | ------------------------------------ | ------------------------------ |
| `feat/`     | Funcionalidad nueva                  | `feat/s6-item-check`           |
| `fix/`      | Corrección de un fallo               | `fix/queue-order`              |
| `docs/`     | Solo documentación                   | `docs/navigation-map`          |
| `refactor/` | Cambio sin comportamiento nuevo      | `refactor/rules-table`         |
| `chore/`    | Tooling, dependencias, CI            | `chore/pnpm-setup`             |

Formato: `prefijo/slug-corto`. Una rama = una rebanada del [backlog](../product/backlog-phase-1.md) o una corrección concreta.

---

## 3. Commits

**Conventional Commits.** El tipo va en inglés (lo consumen herramientas); la descripción, en español, que es el idioma del autor y de la documentación.

```text
feat(scheduler): aplicar acotacion de ease en el limite superior
fix(content): rechazar items con dos respuestas correctas
docs(adr): añadir ADR-006 de persistencia local
refactor(domain): mover reglas R1-R12 a tabla de datos
chore(ci): anadir puerta de validate:content
```

**Scopes** (los que existen; no se inventan otros sin añadirlos aquí):

`scheduler` · `projection` · `content` · `storage` · `clock` · `map` · `check` · `queue` · `ui` · `ci` · `adr` · `docs` · `scaffold`

**Reglas**

1. Un commit = un cambio que se puede describir en una línea sin "y".
2. Si el mensaje necesita un párrafo, probablemente son dos commits.
3. El cuerpo, cuando existe, explica **por qué**, no qué (el diff ya dice qué).
4. Los commits rotos están prohibidos: si `pnpm check` no pasa, no se hace commit.

---

## 4. Pull requests

| Regla                         | Valor                                        |
| ----------------------------- | -------------------------------------------- |
| Tamaño objetivo                | ≤ 400 líneas de diff útil                     |
| Tamaño máximo                  | ~800; por encima, se parte                    |
| Título                         | Igual que el commit principal                 |
| Descripción                    | Qué · Por qué · Cómo se probó                 |
| Fusion                        | Squash, un commit por rebanada                |
| Requisito                      | CI verde y `pnpm check` en local              |

Plantilla de descripción:

```markdown
## Qué
## Por qué
## Cómo se probó
## Checklist
- [ ] El comportamiento nuevo tiene un test que fallaría sin el cambio
- [ ] No se añadieron dependencias sin justificar
- [ ] La documentación afectada está actualizada
```

**Auto-revisión obligatoria:** leer el propio diff completo antes de abrir el PR. Es donde aparecen los `console.log`, los archivos que no debían ir y las tres líneas que sobran.

---

## 5. Convenciones de código

| Elemento               | Convención                          | Ejemplo                        |
| ---------------------- | ----------------------------------- | ------------------------------ |
| Identificadores        | inglés, camelCase                   | `scheduleNext`, `attemptsByItem` |
| Tipos e interfaces     | inglés, PascalCase                  | `ItemSchedule`, `Clock`        |
| Constantes             | SCREAMING_SNAKE_CASE                | `MAX_INTERVAL_DAYS`            |
| Componentes React      | PascalCase en archivo PascalCase     | `ItemCard.tsx`                 |
| Hooks                  | `use` + PascalCase                  | `useReviewQueue.ts`            |
| Archivos no-componente | kebab-case                          | `assessment-engine.ts`         |
| Tests                  | junto al código, `*.test.ts`         | `schedule.test.ts`             |
| Contenido             | kebab-case, identificador del grafo  | `tokens-and-context-window.ts` |

**Idioma:** identificadores, tipos y comentarios de código en **inglés**. Textos visibles y contenido en **español**. Documentación en **español**. No se mezcla dentro de la misma capa.

---

## 6. Issues y etiquetas

Cada rebanada del backlog es una issue; las subdiviones, solo si la rebanada supera el tamaño máximo de PR.

| Etiqueta            | Significado                          |
| ------------------- | ------------------------------------ |
| `slice:s1`…`slice:s8` | A qué rebanada pertenece           |
| `domain`            | Dominio puro (núcleo del producto)   |
| `content`           | Lecciones e ítems                    |
| `ui`                | Interfaz                             |
| `quality`           | Tests, CI, linter de contenido        |
| `blocked`           | Espera una decisión                  |

Un issue sin etiqueta de rebanada no se empieza.

---

## 7. Versiones e hitos

Sin releases durante la fase 1. Se etiqueta cuando se cierra un hito del [roadmap](../product/roadmap.md):

```bash
git tag -a m1-demoable -m "Núcleo demostrable: guion de demo completo"
```

El `CHANGELOG` no se escribe a mano: se genera desde los commits convencionales cuando llegue a la fase 3.

---

## 8. Cuándo se documenta

| Situación                                    | Qué se escribe                                        |
| -------------------------------------------- | ----------------------------------------------------- |
| Se revierte una decisión costosa              | Un ADR nuevo que sustituye; el anterior se marca       |
| Se añade una regla al linter                  | La regla, su severidad y su fixture negativo           |
| Se añade una competencia                      | Su fila en el grafo, con prerrequisito y capa          |
| Se cambia el flujo de trabajo                 | Este documento                                          |
| Se arregla un bug no obvio                    | Un comentario en el código, con el porqué              |
| Todo lo demás                                 | Nada. El código legible no necesita un ensayo al lado  |

## 9. Trabajar con el reloj

La app usa siempre el reloj del sistema. **No hay `?devtime` ni ninguna bandera equivalente** (ADR-007): los intentos son append-only, así que un intento grabado con una fecha falsa no se puede corregir después.

Para ver la cola de repaso sin esperar días, se siembran intentos **con fechas pasadas**. Es lo que de verdad le ocurrió a alguien que respondió hace cuatro días, y no añade código al producto.

Pega esto en la consola del navegador (con la app abierta) y recarga:

```js
// Siembra intentos de hace N días para el ítem indicado.
// Los ids de ítem están en src/content/items.ts (campo `id`).
(() => {
  const hace = (dias) => new Date(Date.now() - dias * 86400000).toISOString();
  const intento = (id, itemId, dias) => ({
    id,
    deviceId: 'dev',
    itemId,
    answeredAt: hace(dias),
    selectedOptionId: 'opcion-correcta',
    correct: true,
    confidence: 'confident',
    presentedOptionIds: ['opcion-correcta', 'opcion-b', 'opcion-c'],
    durationMs: 4000,
  });

  localStorage.setItem(
    'acm:attempts:v1',
    JSON.stringify([
      intento('seed-1', 'ctx-token-unit', 5),   // venció hace 2 días
      intento('seed-2', 'ctx-at-limit', 1),     // todavía no vence
    ]),
  );

  location.reload();
})();
```

Reglas de uso:

- **Solo en tu navegador.** Borra con el botón «Borrar» de `/acerca` cuando termines.
- **No lo conviertas en datos de ejemplo del producto.** Sembrar intentos falsos en la app que ve un visitante sería fabricar evidencia, justo lo que el producto promete no hacer.
- **Los tests no usan esto.** El dominio recibe `today` como argumento, así que las pruebas inyectan `fixedClock` y no necesitan sembrar nada.

Si algún día hace falta que un visitante *vea* el ciclo, la respuesta es una ruta de simulación explícita, no un reloj sustituido (criterio de revisión de ADR-007).
