# Cómo contribuir

Gracias por pasar. Este documento está pensado para que **alguien que no ha visto
el repositorio nunca** pueda añadir una competencia, corregir un ítem o proponer
una mejora sin preguntar nada.

Si algo de aquí no te cuadra o falta, eso también es un error del documento:
abre una incidencia.

---

## Antes de nada: arrancarlo

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Requisitos: Node 22 o superior y pnpm. No hace falta cuenta, ni base de datos, ni
claves de API: **el producto no tiene backend**.

Comandos que vas a usar:

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm test` | Tests del dominio (Vitest) |
| `pnpm validate:content` | Linter de contenido (R1–R7) |
| `pnpm check` | Todo lo anterior + tipos + lint + build + accesibilidad |
| `pnpm content:status` | Regenera el documento de estado del contenido |

`pnpm check` es lo mismo que ejecuta CI. Si pasa en tu máquina, pasa en la nube.

---

## Añadir una competencia, paso a paso

Este es el recorrido completo. Tardarás menos en hacerlo que en leerlo.

### 1. Declara la competencia

En `src/content/competencies.ts`, dentro del área que le corresponda:

```ts
{
  id: 'my-new-competency',        // kebab-case, en inglés, estable para siempre
  areaId: 'area-03',
  title: 'Título en español',
  description: 'Una frase: qué sabrá hacer quien la domine.',
  level: 2,                        // 1 fundamentos · 2 aplicación · 3 criterio
  layer: 'nucleo',
  published: false,                // ver paso 4
},
```

Si depende de otra competencia, añade la arista en `PREREQUISITES` (mismo archivo).
El grafo no admite ciclos: el linter lo comprueba.

### 2. Escribe la lección

En el archivo del área, `src/content/area-NN-*.ts`:

```ts
{
  competencyId: 'my-new-competency',
  whatIs: 'Qué es, en dos o tres frases, sin jerga.',
  problem: 'Qué se rompe cuando se hace mal. Aquí va el porqué, no la definición.',
  internals: ['Cuatro ideas que explican cómo funciona por dentro.'],
  whenToUse: ['Cuándo sí.'],
  whenNotToUse: ['Cuándo no.'],
  pitfalls: [{ title: 'Error frecuente', detail: 'Por qué ocurre y cómo se detecta.' }],
  referenceIds: ['ref-isl'],
}
```

La lección es el **preámbulo de la evaluación**, no un artículo. Si ocupa más de
una pantalla, probablemente sobra la mitad.

### 3. Escribe cuatro ítems

En el mismo archivo. Cuatro por competencia: tres o cuatro opciones, **una sola
correcta**, y cada distractor con su propia justificación.

```ts
{
  id: 'my-item-id',
  competencyId: 'my-new-competency',
  difficulty: 2,
  prompt: 'Una situación concreta, no una definición que pedir.',
  options: [
    { id: 'a', text: 'La respuesta correcta', correct: true, rationale: 'Correcto: por qué lo es.' },
    { id: 'b', text: 'Un error plausible', correct: false, rationale: 'Nombra el razonamiento equivocado, no la respuesta buena.' },
    { id: 'c', text: 'Otro error plausible', correct: false, rationale: 'Igual: describe el razonamiento que lleva ahí.' },
  ],
  explanation: 'Qué hay detrás, para quien acertó o falló.',
  referenceId: 'ref-isl',
}
```

**Tres reglas que el linter comprueba y que importan:**

- **La justificación del distractor describe el error, no la respuesta correcta.**
  Es la diferencia entre «no es esa» y «pensaste que X, y X no se sostiene».
- **Las opciones deben tener longitudes parecidas.** Si la correcta es la más
  larga, se acierta por forma y no por conocimiento.
- **El enunciado plantea una situación**, no pide recitar una definición.

### 4. Publica

Cambia `published: false` a `true` y ejecuta:

```bash
pnpm validate:content
```

Si la competencia no tiene lección o le faltan ítems, **el linter falla**. Es a
propósito: `published: true` es una promesa de que hay contenido, y el mapa no
puede mostrar un nodo que promete algo que no existe.

### 5. Comprueba el resultado

```bash
pnpm dev
```

- `/mapa` — el nodo aparece y se conecta con sus prerrequisitos.
- `/c/tu-id` — la lección se ve.
- `/c/tu-id/comprobar` — la pregunta sale con las opciones barajadas.

---

## Corregir un ítem existente

Los ítems son datos: edita el objeto y vuelve a ejecutar `pnpm validate:content`.

Un ítem publicado **no se renombra ni se borra**: los intentos guardados lo
referencian por `id`. Si sobran opciones, retira el texto y deja el `id`, o marca
el ítem como no publicado y añade uno nuevo.

---

## Estilo

- **Código e identificadores en inglés.** El dominio se lee como cualquier librería.
- **Prosa, contenido y comentarios en español.** Se leen como el usuario.
- Comentarios que explican **por qué**, no qué. Si el código necesita explicar el
  qué, el código está mal.
- Commits en español, con el formato `tipo(alcance): descripción`.
  Ejemplo: `fix(check): el botón deshabilitado no decía qué faltaba`.

## Reglas de dependencia

`app → application → domain → infrastructure`. El dominio es puro: sin React, sin
DOM, sin red, sin `Date.now()`. Las capas están impuestas por ESLint, no por
buena voluntad: si las cruzas, `pnpm lint` falla.

Los motivos están en [`docs/architecture/dependency-rules.md`](../docs/architecture/dependency-rules.md).

## Antes de abrir un pull request

1. `pnpm check` en verde.
2. Si tocaste contenido, `pnpm content:status` y confirma que el cambio se refleja.
3. Si tocaste la interfaz, revisa el teclado: `Tab` por la pantalla completa.
4. Cuenta **qué problema resuelve** el cambio, no solo qué archivos toca.

Los pull requests que solo reformatean código sin motivo se devuelven: el ruido
en el historial cuesta más de lo que ahorra.

---

## Si vas a aportar contenido

Esas son las aportaciones más valiosas y las más fáciles de hacer mal. Dos cosas:

- **Escribe para quien se está equivocando**, no para quien ya sabe. El valor del
  ítem está en el distractor.
- **Una fuente por afirmación.** Si el contenido dice algo concreto, necesita una
  referencia en `src/content/references.ts` con su fecha de revisión.

---

## Licencia de tu aportación

Al enviar una aportación aceptas que se publique bajo las licencias del
repositorio: MIT para el código y CC BY-SA 4.0 para el contenido. Ver `LICENSE` y
`LICENSE-CONTENT`.
