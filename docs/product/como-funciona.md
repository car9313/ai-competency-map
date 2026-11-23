# Cómo funciona

Este documento explica el producto **tal y como está hoy**, sin promesas de futuro. Está escrito para alguien que abre la app sin contexto: qué hace el tiempo, qué pasa cuando respondes, qué se guarda y qué falta.

La especificación técnica vive en [assessment-engine.md](../domain/assessment-engine.md); aquí se cuenta el comportamiento, no las invariantes.

---

## La tesis en una frase

> Una plataforma normal guarda una casilla: «lección completada». Eso es una afirmación del usuario. Aquí una competencia **no tiene estado guardado**: su estado se calcula a partir del historial de intentos.

De ahí sale todo lo demás.

---

## Las tres piezas

| Pieza | ¿Se guarda? | Qué es |
|---|---|---|
| **Intento** | **Sí** | Un hecho inmutable: respondiste X, con esta confianza, en este instante |
| **Programación** | No, se calcula | Cuándo vuelve cada ítem (fase, intervalo, facilidad, fecha) |
| **Estado de competencia** | No, se calcula | Dominio actual: sin evidencia / en aprendizaje / a un ítem / consolidada / necesita repaso |

Se guarda **una sola entidad**. Si mañana cambian las reglas del planificador, no hay que migrar nada: los intentos son los mismos y el estado se recalcula distinto. Y como los intentos nunca se editan ni se borran, el historial no se puede falsificar hacia atrás.

---

## El tiempo

### Fases

Cada ítem está siempre en una de estas cuatro fases:

| Fase | Qué significa |
|---|---|
| `new` | Nunca se ha respondido |
| `learning` | Empezado, pero todavía no sostenido (típicamente por dudas) |
| `review` | En repaso: el intervalo crece con cada acierto |
| `relearning` | Se falló después de haberlo aprendido; toca recuperarlo |

### Las doce reglas

La fase siguiente, el intervalo y la facilidad dependen de tres cosas: **fase actual**, **acierto** y **confianza declarada**.

| Regla | Desde | Resultado | Si aciertas | Confianza | Intervalo siguiente |
|---|---|---|---|---|---|
| R1 | `new` | `review` | sí | segura | 3 días |
| R2 | `new` | `learning` | sí | con dudas | 1 día |
| R3 | `new` | `relearning` | no | — | 1 día |
| R4 | `learning` | `review` | sí | segura | 3 días |
| R5 | `learning` | `learning` | sí | con dudas | 2 días |
| R6 | `learning` | `relearning` | no | — | 1 día |
| R7 | `review` | `review` | sí | segura | intervalo × facilidad |
| R8 | `review` | `review` | sí | con dudas | intervalo × 1,2 |
| R9 | `review` | `relearning` | no | — | 1 día |
| R10 | `relearning` | `review` | sí | segura | 3 días |
| R11 | `relearning` | `learning` | sí | con dudas | 2 días |
| R12 | `relearning` | `relearning` | no | — | 1 día |

El intervalo nunca baja de **1 día** ni pasa de **180**. La facilidad empieza en **2,5** y se mueve entre **1,3** y **2,8**: cada acierto seguro la sube 0,05, cada fallo la baja 0,2. Los ítems difíciles acaban creciendo más despacio, solos.

### Ejemplo con fechas

Supón que hoy es **20 de noviembre de 2026** y aciertas con seguridad desde `new`:

| Día | Qué haces | Regla | Resultado |
|---|---|---|---|
| 20 nov | Aciertas, «seguro» | R1 | vuelve en **3 días** → 23 nov |
| 23 nov | Aciertas, «seguro» | R7 | 3 × 2,5 = 7,5 → **8 días** → 1 dic (facilidad 2,55) |
| 1 dic | Aciertas, «seguro» | R7 | 8 × 2,55 = 20,4 → **20 días** → 21 dic |

Esa curva —3 → 8 → 20→ 45…— es la repetición espaciada. No está configurada en ninguna parte: sale de multiplicar por la facilidad cada vez que aciertas.

### Por qué existe la confianza

Porque acertar por suerte y saber no son lo mismo, y el planificador no puede adivinarlo.

El mismo ítem, el mismo acierto, **hoy**:

- «Seguro» → vuelve en **3 días**.
- «Con dudas» → vuelve **mañana** (R2), y la facilidad baja.

La confianza es lo que permite tratar distinto a quien acierta sin saber. Sin ese eje, el sistema programaría repasos largos sobre conocimiento frágil.

### Cuando fallas

Un fallo te devuelve a `relearning` con **1 día**, y la facilidad baja 0,2. No es un castigo: es información. El intervalo vuelve a empezar porque el anterior estaba basado en un acierto que ya no se sostiene.
### ¿Por qué vuelve mañana y no ahora mismo?

Porque el intervalo mínimo del planificador es **1 día**, y por una razón práctica: repetir el mismo ítem en la misma sesión mide memoria inmediata, no aprendizaje. Volver al día siguiente obliga a que pase una noche de por medio, que es cuando el olvido empieza a hacer su trabajo.

Una aclaración honesta: **«vuelve mañana» describe la cola de repaso, no un bloqueo.** Puedes seguir practicando ahora —la comprobación te deja— y cada intento se guarda. Lo que no hace es adelantar la programación: el ítem sigue vencido mañana, y ese repaso es el que cuenta.

### ¿Cuándo terminan las preguntas?

En **`/repaso`** terminan solas: cuando la cola se vacía, la pantalla lo dice y propone seguir por el mapa.

En **la comprobación de una competencia** terminan cuando has respondido **todos sus ítems**. Ahí aparece un resumen —cuántos tienes con el último intento correcto y cuándo vuelve el primero— y, si quieres, un botón para seguir practicando. Antes la pantalla volvía a empezar en silencio, sin decirte que ya habías terminado.

### Lo que el tiempo **no** hace

- No hay racha de días consecutivos (todavía).
- No hay meta diaria (todavía).
- No hay «lección completada». Nunca la habrá: sería volver al problema del que salimos.
- No se puede viajar en el tiempo: el reloj es siempre el del sistema, sin atajos ([ADR-007](../architecture/adr/ADR-007-sin-control-de-tiempo.md)).

---

## La pregunta

### Anatomía de un ítem

```ts
{
  id: 'ctx-token-unit',
  difficulty: 1,                       // 1 a 3
  prompt: '¿En qué unidad se mide la ventana de contexto?',
  options: [
    { id: 'a', text: 'En tokens', correct: true,
      rationale: 'Es la unidad que el modelo procesa al leer y generar.' },
    { id: 'b', text: 'En caracteres', correct: false,
      rationale: 'El token no equivale a un carácter: en español, una palabra puede ser 2 o 3.' },
    …
  ],
  explanation: 'La ventana es un presupuesto de tokens que se reparte entre…'
}
```

Lo importante no es el enunciado: es que **cada opción, incluida la incorrecta, lleva su propia justificación**. Un feedback genérico («incorrecto, la respuesta correcta era B») enseña cuál es la respuesta, no por qué la otra era una trampa razonable.

### El recorrido

1. La app elige el ítem: primero lo que nunca has visto; después lo que antes vence.
2. **Baraja las opciones** con una semilla derivada del id del intento. No es aleatorio sin control: el orden exacto que viste queda guardado.
3. Eliges una opción y declaras confianza. El botón de enviar está deshabilitado hasta que hayas hecho las dos cosas.
4. Al enviar, el navegador guarda **un intento** y recalcula la programación del ítem.
5. La app te muestra: si acertaste, **por qué** esa opción lo era; si fallaste, **por qué** tu opción era una trampa y cuál era la correcta; y la explicación completa.
6. Y te dice cuándo vuelve: «vuelve en 8 días», «te toca hoy», «vuelve mañana».

### Qué queda guardado

Esto, y nada más:

```json
{
  "id": "9f2c…",
  "deviceId": "acm-device…",
  "itemId": "ctx-token-unit",
  "answeredAt": "2026-11-20T15:42:10.000Z",
  "selectedOptionId": "a",
  "correct": true,
  "confidence": "confident",
  "presentedOptionIds": ["c", "a", "b"],
  "durationMs": 8123
}
```

Nueve campos. Ni una fecha de repaso, ni una fase, ni un estado. Todo eso se calcula al leer.

### Repetir siempre

Puedes volver a intentar cualquier ítem en cualquier momento, **también cuando la competencia ya está consolidada**. No hay estado final y no hay nada que «reabrir»: cada repaso añade un intento y el estado se recalcula. Si el repaso sale mal, la competencia pasa a «necesita repaso», y eso también es información.

---

## Los cinco estados de una competencia

Se evalúan en este orden; gana el primero que se cumpla:

| Estado | Cuándo |
|---|---|
| **Sin evidencia** | No hay ningún intento sobre sus ítems |
| **Consolidada** | Todos sus ítems intentados, últimos intentos correctos y ninguno en `relearning` |
| **Necesita repaso** | Estuvo consolidada y ha dejado de estarlo |
| **A un ítem** | Todos intentados y solo uno sin el último acierto |
| **En aprendizaje** | Cualquier otro caso |

«A un ítem» existe por un problema concreto: con pocos ítems, fallar uno dejaba la competencia en «en aprendizaje», que se lee como *no sé nada* cuando en realidad casi todo estaba resuelto. **La regla de consolidación no se ha relajado** —sigue exigiendo los cuatro—, pero el estado deja de mentir sobre cuánto falta.

Detalle fino: «consolidada» **no** exige que todos los ítems estén en fase `review`. Un acierto con dudas deja el ítem en `learning` y sigue siendo un acierto válido. Se mide evidencia, no fases.

---

## Qué se bloquea y qué no

Son dos permisos distintos:

| | ¿Cuándo? | Por qué |
|---|---|---|
| **Leer** una competencia | Siempre que tenga contenido | El contenido no se gasta por leerlo antes de tiempo |
| **Comprobarla** con preguntas | Solo cuando cada prerrequisito tiene **alguna** evidencia | Medir sin base mide ruido, no conocimiento |

Se exige *haber empezado* el prerrequisito, no dominarlo. Y una vez dentro, la secuencia no se impone: el mapa recomienda, no obliga.

Se descartó bloquear por área temática porque el grafo no está particionado: **20 de las 49 aristas cruzan de área** y solo una de las ocho áreas es autocontenida.

---

## Qué está hecho

| Pieza | Estado |
|---|---|
| Planificador completo (12 reglas, 17 invariantes) con tests de propiedades | ✅ |
| Persistencia local de intentos, sin backend | ✅ |
| Lecciones, ítems con justificación por distractor y referencias | ✅ (3 de 39 competencias) |
| Mapa del grafo: 39 nodos, 8 áreas, dos vistas (grafo y tarjetas), zoom, tooltips | ✅ |
| Comprobación: opciones barajadas, confianza, feedback, reprogramación | ✅ |
| Exportar e importar progreso en JSON | ✅ |
| Estado de la competencia en la página de la lección | ✅ |
| Cola del día en la portada y sesión de repaso en `/repaso` | ✅ |
| El mapa muestra el estado real de cada nodo según tu historial | ✅ |

---

## Qué falta

### Fase 1 — cerrada salvo el guion de demo

**S8 · Cola de repaso y desbloqueo** ✅

- La portada «Hoy»: qué toca repasar, ordenado por atraso y dificultad.
- El mapa refleja **tu** progreso por nodo.
- El desbloqueo se calcula y se ve.
- **Racha y meta diaria: descartadas a propósito.** Miden constancia, no evidencia; premiar días seguidos por encima de saber es justo la lógica de la que este proyecto se aparta.

### Fase 2 — contenido

- Las 36 competencias que aún no tienen lección ni ítems.
- De 12 ítems a 312 (8 por competencia).
- Linter de contenido creciendo con el catálogo.

### Fase 3 — pitch y pulido

- Pasada de accesibilidad con axe y revisión de teclado en las cuatro pantallas.
- Guion de demo grabado.
- Apertura como proyecto open source: licencia, contribución, guías.
- Opcional: inglés, una competencia a la vez.
- Opcional: superficie MCP para que agentes consuman el dominio.

### Lo que no está planificado

No es «más adelante», es **diferido con condición**:

| Diferido | Se reconsidera cuando |
|---|---|
| Generar ítems con IA | Existan los 312 escritos a mano y el pipeline esté probado |
| Cuentas y servidor | Alguien que no es el autor lo use más de una semana |
| Contenido en inglés | Fase 3 cerrada y una razón que no sea simetría |

---

## Decisiones y por qué

| Decisión | Documento |
|---|---|
| El progreso se deriva, no se almacena | [ADR-003](../architecture/adr/ADR-003-progreso-derivado.md) |
| Opción múltiple con confianza y repaso espaciado | [ADR-004](../architecture/adr/ADR-004-opcion-multiple-repaso-espaciado.md) |
| Sin IA en la v1 | [ADR-005](../architecture/adr/ADR-005-sin-ia-en-v1.md) |
| Persistencia local con el puerto listo para cuentas | [ADR-006](../architecture/adr/ADR-006-persistencia-local.md) |
| Sin control de tiempo en el producto | [ADR-007](../architecture/adr/ADR-007-sin-control-de-tiempo.md) |
