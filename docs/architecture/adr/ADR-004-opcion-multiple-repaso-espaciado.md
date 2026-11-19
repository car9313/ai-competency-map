# ADR-004 — Opción múltiple con confianza y repaso espaciado

- **Estado:** aceptado
- **Ámbito:** evaluación

## Contexto

La evaluación tiene que ser determinista, ejecutable sin servicios externos, sin coste y comprobable con tests. A la vez, el producto promete "dominio real", no un quiz de una sola pasada.

Restricciones: presupuesto cero (descarta cualquier puntuación con modelo), desarrollo en solitario (descarta tipologías de pregunta que necesiten revisión humana), y ~120 ítems escritos a mano.

## Decisión

**Un solo tipo de ítem: opción múltiple (3–4 opciones, una correcta), con dos añadidos:**

1. **Justificación por opción.** Cada distractor lleva su propio texto explicando por qué es tentador. No hay feedback genérico.
2. **Confianza declarada.** Tras (o junto a) la respuesta, el alumno marca si se sentía seguro o dudoso. Genera un 2×2 con la corrección.

**Repaso espaciado** con un planificador propio de 12 reglas, publicadas en [`assessment-engine.md`](../../domain/assessment-engine.md#4-el-planificador), con `ease` acotada en `[1.3, 2.8]` e intervalos en `[1, 180]` días.

## Alternativas consideradas

| Alternativa                | A favor                                              | En contra                                                                                  |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Sin repaso (una pasada)**| Simple                                               | No hay "dominio real"; el usuario olvida y el mapa miente                                   |
| **SM-2 literal**           | Estándar de facto, probado                           | Asume una nota de calidad de 0 a 5 que no recogemos; inventar esa nota sería falsa precisión |
| **FSRS**                   | Estado del arte en precisión                          | Modelo ajustado con parámetros entrenados; inexplicable al usuario e intuneable con n≈120   |
| **IRT / Elo**              | Fundamentación psicométrica                           | Requiere cientos de intentos por ítem para calibrar; a esta escala no existe                 |
| **Texto libre con rúbrica**| Evalúa comprensión profunda                           | Corrección manual (no escala) o por LLM (descartado por coste y no-determinismo)              |
| **Intervalos fijos**       | Trivial                                               | O repasas para siempre o olvidas en silencio                                                 |

## Consecuencias

**Positivas**

- Todo el motor es determinista, testeable y explicable en una frase por celda de la tabla.
- La confianza añade información real sin coste de implementación.
- La justificación por distractor convierte cada error en una lección, que es el punto pedagógico.
- Sin dependencias externas ni servicios.

**Negativas y costes**

- La opción múltiple tiene techo pedagógico: reconoce, no produce. Se mitiga con distractores bien diseñados, no con más tipos de pregunta.
- Memoria de posición: se mitiga barajando con semilla.
- Aprendizaje de la forma de la pregunta ("la más larga suele ser la correcta"): riesgo real, se mitiga con reglas del linter sobre longitud y estructura de opciones.
- Doce reglas son muchas para un modelo "simple": se aceptan porque están tabuladas y testeadas una a una.

## Criterio de revisión

Se revisa si (a) el volumen de intentos permite calibrar algo más serio, o (b) el abandono por aburrimiento de la opción múltiple se demuestra como problema real. No se revisa "porque exista un algoritmo mejor".
