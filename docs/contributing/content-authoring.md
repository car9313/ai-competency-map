# Cómo se escribe una lección y sus ítems

Procedimiento para añadir contenido que pase el linter a la primera y cumpla lo que ninguna regla automática puede comprobar.

---

## 1. Antes de escribir

1. **¿Existe ya una competencia para esto?** Si no, primero se añade la competencia y su prerrequisito. El contenido no crea nodos a escondidas.
2. **¿Es una competencia o dos?** La prueba: *¿se puede demostrar en 10 minutos con 3–8 preguntas?* Si no, se divide.
3. **¿Cuál es el error típico?** Toda competencia existe porque la gente se equivoca en algo concreto. Si no sabes cuál es ese error, todavía no puedes escribir buenos distractores.

---

## 2. La lección

Estructura fija. La brevedad es parte del diseño: una lección es el preámbulo de la evaluación, no un artículo.

| Campo       | Extensión objetivo | Qué debe lograr                                         |
| ----------- | ------------------ | ------------------------------------------------------- |
| `whatIs`    | 2–4 frases         | Definición en una frase que el alumno pueda repetir     |
| `problem`   | 2–4 frases         | Qué problema resuelve, no cómo funciona                 |
| `internals` | 3–5 puntos         | El mecanismo, suficiente para razonar sobre sus límites  |
| `whenToUse` / `whenNotTo` | 2–4 puntos cada uno | Criterio. Es la parte que caduca menos        |
| `pitfalls`  | 2–3 entradas       | Cada una con título y explicación del fallo real         |
| `references`| 1–3                | Oficiales. Con `reviewedAt`                              |

**Lo que se evita:** historia de la disciplina, entusiasmo, comparativas de herramientas, "en el futuro veremos…".

---

## 3. Los ítems

### 3.1 Escribir el distractor primero

El error común es escribir la pregunta y la respuesta correcta, y luego rellenar con opciones absurdas. Eso no evalúa nada.

**Método:**

1. Escribe el **error conceptual** que quieres detectar.
2. Convierte ese error en una opción que **parezca correcta a quien lo comete**.
3. Su `rationale` describe el razonamiento equivocado, no la respuesta correcta.
4. Repite con dos errores más, si existen.
5. Añade la respuesta correcta.

### 3.2 Ejemplo

```ts
{
  id: 'token-vs-char',
  competencyId: 'tokens-context-window',
  difficulty: 1,
  prompt: '¿Cómo se mide la ventana de contexto de un modelo?',
  options: [
    { id: 'a', text: 'En tokens', correct: true,
      rationale: 'Correcto: la ventana se expresa en tokens, la unidad que el modelo procesa.' },
    { id: 'b', text: 'En caracteres', correct: false,
      rationale: 'Tentador porque es fácil de medir en el editor, pero el modelo no ve caracteres: ' +
                 'la misma frase en español y en inglés ocupa tokens distintos.' },
    { id: 'c', text: 'En kilobytes', correct: false,
      rationale: 'Confunde el contexto con memoria o con el tamaño del fichero. ' +
                 'No hay bytes en juego: hay secuencias de tokens.' },
  ],
  explanation: 'La ventana es un presupuesto de tokens compartido entre instrucciones, ' +
               'contexto recuperado y salida reservada. Por eso se agota antes de lo que parece.',
  referenceId: 'ref-attention-2017',
}
```

Fíjate en que cada distractor enseña: quien elige "caracteres" aprende por qué su intuición de editor no aplica.

### 3.3 Cuántos ítems

| Situación                  | Ítems   |
| -------------------------- | ------- |
| Mínimo para el motor (R4)  | 3       |
| Objetivo por competencia   | 5–8     |
| Máximo razonable           | 10      |

Más de diez suele significar que la competencia debería dividirse.

---

## 4. Lista de comprobación antes del PR

- [ ] `pnpm validate:content` pasa sin errores ni avisos nuevos.
- [ ] Cada distractor corresponde a un error conceptual **real**, no a un relleno.
- [ ] La explicación explica el concepto, no la respuesta.
- [ ] He respondido los ítems yo mismo sin mirar la clave, y he fallado los que esperaba.
- [ ] Las referencias son oficiales y siguen vivas.
- [ ] La lección no menciona ninguna herramienta que vaya a caducar en seis meses.
- [ ] Si la competencia es nueva: tiene prerrequisito declarado y entra en el grafo sin ciclo.

---

## 5. Revisiones

- **Cada 6 meses**: revisar `reviewedAt` de las referencias. Si una URL murió, se reemplaza o se retira la referencia.
- **Cada vez que cambie una regla del motor**: revisar si algún ítem deja de ser válido por la nueva lógica.
- **Nunca**: reescribir un ítem para que "cuadre" con una estadística. Si la gente falla mucho, puede ser que el ítem discrimine bien.

## Patrón por área

A partir de la fase 2, el contenido se escribe **un archivo por área**:

```
src/content/area-01-fundamentals.ts   →  LESSONS_AREA_01 + ITEMS_AREA_01
src/content/area-02-generative-llms.ts →  LESSONS_AREA_02 + ITEMS_AREA_02
```

y se suma en `src/content/index.ts`:

```ts
lessons: [...LESSONS, ...LESSONS_AREA_01, ...LESSONS_AREA_02],
items: [...ITEMS, ...ITEMS_AREA_01, ...ITEMS_AREA_02],
```

Motivos:

- Una persona cierra un área completa, que es una unidad de trabajo con sentido.
- El archivo no crece sin límite: `items.ts` ya tenía 400 líneas con 12 ítems y no escala a 312.
- Activar un área es cambiar tres `published: false` a `true`; el linter hace el resto.

Al terminar un área:

```powershell
pnpm validate:content
```
