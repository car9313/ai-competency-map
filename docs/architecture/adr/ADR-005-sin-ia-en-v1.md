# ADR-005 — Sin IA en la v1

- **Estado:** aceptado
- **Ámbito:** producto, arquitectura, coste
- **Sustituye a:** la asunción (heredada del plan inicial) de que la plataforma debía integrar modelos

## Contexto

El proyecto nace como una academia de AI Engineering, y la expectativa obvia es que use IA. Hay dos razones para quererlo:

1. **Pedagógica:** explicar al alumno por qué falló, adaptar dificultad, generar preguntas nuevas.
2. **De portfolio:** demostrar criterio de AI engineering, no solo de frontend.

En contra, tres restricciones duras del proyecto: **presupuesto cero** (no hay dinero para APIs, ni hardware para modelos locales), **determinismo** (todo el motor es verificable y testeable) y **superficie mínima** (sin backend, sin claves, sin rate limiting, sin datos personales).

Además, con opción múltiple y justificación por distractor ya escrita a mano, un modelo explicando el error aportaría poco y con peores garantías que el texto curado.

## Decisión

**La v1 no integra ningún modelo.** Ni en el producto, ni en el build, ni en CI.

Se conservan tres artefactos que dejan el hueco preparado, sin coste:

1. **El contrato**, en el dominio de autoría:

   ```ts
   export interface ItemGeneratorPort {
     generateCandidates(input: LessonInput): Promise<ItemCandidate[]>;
   }
   ```

2. **Un adaptador de fixtures**, determinista, sin red y sin claves, que devuelve candidatos grabados:

   ```ts
   export class FixtureItemGenerator implements ItemGeneratorPort {
     constructor(private readonly fixtures: ItemCandidate[]) {}
     async generateCandidates(input: LessonInput) {
       return this.fixtures.filter(f => f.lessonId === input.lessonId);
     }
   }
   ```

3. **Un harness de evaluación sobre fixtures** que se ejecuta en CI: comprueba propiedades esperadas (pasa el linter, la respuesta correcta es coherente con la lección, los distractores son plausibles, no hay duplicados). Sin una sola llamada.

**Dónde viviría la IA si se activara:** en una herramienta de autoría local (`pnpm ai:items`), no en el producto. El modelo propone, un verificador determinista dispone, el autor revisa y hace commit. La web sigue siendo estática y sin claves.

## Alternativas consideradas

| Alternativa                                   | A favor                                        | En contra                                                                                          |
| --------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Integrar un LLM en el producto en la v1        | Demostración visible de IA                     | Rompe determinismo, añade backend, clave, coste, latencia y superficie de ataque; se solapa con feedback ya escrito |
| IA solo en desarrollo, sin contrato            | Menos código                                    | Sin contrato no hay sustitución posible, y la IA se filtra al dominio                              |
| IA generando ítems directamente en CI          | Contenido "infinito"                            | Coste por build, resultados no reproducibles, y el linter aprobaría ruido con buena forma          |
| No mencionar la IA en absoluto                 | Menos documentos                               | Pierdes el argumento de criterio, que es justo lo que se quiere demostrar                          |

## Consecuencias

**Positivas**

- Coste de operación nulo y despliegue estático.
- El proyecto se puede demostrar sin conexión y sin configuración.
- La decisión, documentada con su criterio de activación, demuestra más criterio que una integración a medias.
- El día que haya presupuesto, el cambio es un adaptador nuevo: el dominio y los tests no se tocan.

**Negativas y costes**

- La demo no impresiona por "tener IA". Se compensa con la profundidad del motor y con este ADR.
- El pipeline de fixtures hay que mantenerlo sin que aporte valor inmediato. Es deuda pequeña y consciente.
- Un revisor superficial puede leerlo como "no sabe integrar modelos". La mitigación es el contrato y el harness, que existen.

## Criterio de revisión

Se reconsidera cuando se cumplan **las tres**:

1. Los ~120 ítems escritos a mano existen y el linter está en verde.
2. Existe el harness de evaluación con fixtures, y sus umbrales están definidos.
3. Hay presupuesto (propio o un free tier sostenible) y el coste por ítem aceptado se ha medido.

Si se activa, la primera función es **autoría de ítems**, nunca un chat.
