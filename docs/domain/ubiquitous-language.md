# Lenguaje ubicuo

El vocabulario de este proyecto forma parte de su diseño, no es decoración documental. La misma palabra debe significar lo mismo en el roadmap, en el código, en los tests y en la interfaz.

> **Regla de la casa:** los términos de dominio se escriben en **inglés en el código** (identificadores, tipos, nombres de tabla) y se muestran en **español en la interfaz y el contenido**. Este glosario es el puente entre ambos.

---

## Conceptos centrales

| Español (UI / docs) | Identificador (código) | Definición                                                                                                     | No confundir con                                                  |
| ------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Área                | `Area`                 | Agrupación de competencias solo para navegar. Nunca bloquea ni desbloquea nada.                                 | Competencia                                                        |
| Competencia         | `Competency`           | La unidad atómica de conocimiento que se puede demostrar. Un nodo del grafo.                                    | Lección, Ítem                                                      |
| Prerrequisito       | `Prerequisite`         | Arista dirigida `from → to`: "necesitas evidencia en `from` antes de que `to` se desbloquee".                  | Orden de lectura recomendado                                       |
| Lección             | `Lesson`               | Contenido explicativo asociado a exactamente una competencia. Insumo para aprender, nunca prueba de haber aprendido. | Competencia (una competencia puede tener lección, nunca cero ítems) |
| Ítem                | `Item`                 | Una pregunta que produce evidencia. Pertenece a exactamente una competencia.                                    | Lección, Intento                                                   |
| Opción              | `Option`               | Una respuesta posible a un ítem. Exactamente una por ítem es correcta.                                          | Distractor                                                         |
| Distractor          | `Distractor`           | Una opción incorrecta. Lleva **su propia** justificación explicando por qué resulta tentadora.                  | Opción (todo distractor es opción, no toda opción es distractor)    |
| Explicación         | `Explanation`          | Texto que se muestra tras cualquier respuesta, acierte o no. Explica el concepto, no el error.                  | Justificación                                                      |
| Justificación       | `Rationale`            | Texto asociado a una opción concreta, explicando por qué es correcta o por qué es un error tentador.            | Explicación                                                        |
| Intento             | `Attempt`              | Registro inmutable: qué ítem, qué opción, si acertó, confianza declarada, momento y orden presentado.           | Evidencia                                                          |
| Evidencia           | `Evidence`             | El conjunto acumulado de intentos que justifica el estado de una competencia. Es una vista, nunca una fila aparte. | Intento (un intento es un registro; la evidencia es el agregado)  |

## Planificación

| Español            | Identificador   | Definición                                                                                       |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------ |
| Programación       | `ItemSchedule`  | Estado de planificación por ítem: fase, intervalo, facilidad, lapsos y fecha de vencimiento. **Derivado**: se pliega de los intentos, nunca se persiste.      |
| Fase               | `Phase`         | `new` → `learning` → `review`, o `relearning` después de un fallo.                                |
| Intervalo          | `intervalDays`  | Días hasta que el ítem vuelve a estar vencido. Nunca disminuye tras un acierto con confianza.     |
| Facilidad          | `ease`          | Multiplicador aplicado al intervalo tras un repaso exitoso. Acotado a `[1.3, 2.8]`.               |
| Lapso              | `lapses`        | Cuántas veces ha fallado el ítem **después** de estar aprendido. Monótono, nunca disminuye.       |
| Vencimiento        | `dueAt`         | Fecha en que el ítem pasa a estar vencido. Se calcula como `answeredAt + intervalDays`.           |
| Repaso             | `Review`        | Un intento sobre un ítem cuya `dueAt` ya pasó.                                                   |
| Cola de repaso     | `ReviewQueue`   | Derivada, nunca almacenada: los ítems con `dueAt <= hoy`, ordenados por `dueAt`. Es la pantalla de inicio. |

## Estado y progresión

| Español               | Identificador     | Definición                                                                                              |
| --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| Estado de competencia | `CompetencyState` | Uno de `no_evidence`, `learning`, `almost`, `consolidated`, `at_risk`. **Siempre derivado**, nunca persistido. |
| Desbloqueo            | `Unlocked`        | Una competencia está desbloqueada cuando **todos** sus prerrequisitos tienen alguna evidencia (`state !== no_evidence`). |
| Consolidada           | `consolidated`    | Todos los ítems intentados, todos los últimos intentos correctos y ningún ítem en `relearning`.           |
| En riesgo             | `at_risk`         | Estuvo consolidada alguna vez y ahora al menos un ítem está fallado o en `relearning`.                    |
| Proyección            | `Projection`      | Función pura del registro de intentos a un modelo de lectura (estado, desbloqueo, cola). No hay vistas almacenadas. |

## Infraestructura del diseño

| Español                 | Identificador            | Definición                                                                                              |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Reloj                   | `Clock`                  | Fuente de tiempo inyectada. El dominio nunca llama a `Date.now()`, así los tests y la demo controlan "hoy". |
| Semilla                 | `seed`                   | Entrada determinista para barajar el orden de opciones. Se guarda en el intento para poder reproducirlo.  |
| Adaptador de fixtures   | `FixtureItemGenerator`   | Sustituto determinista de un futuro proveedor de autoría con IA. Sin red, sin clave, sin coste.          |
| Linter de contenido     | `ContentLinter`          | Conjunto de reglas (R1–R7) que valida lecciones, ítems y forma del grafo en CI. Rompe el build, no al revisor. |
| Fixture                 | `Fixture`                | Dato de muestra grabado y versionado, usado por los tests y por el harness de evaluación.                |
| Dispositivo             | `deviceId`               | Navegador que produjo el intento. Constante en la v1; habilita la sincronización y la depuración entre dispositivos. |

---

## Palabras que no usamos

El vocabulario ambiguo produce código ambiguo. Estas están prohibidas a propósito:

| Prohibida              | Por qué                                                                | Usar en su lugar                                 |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| "completado"           | Implica un booleano almacenado que el usuario activa. Aquí no existe.  | `consolidated`, o "tiene evidencia"              |
| "progreso"             | Significa cuatro cosas distintas según la pantalla.                    | decir cuál: `state`, `unlocked`, `review queue`  |
| "quiz" / "cuestionario"| Sugiere un evento puntuado, no una fuente de evidencia planificada.    | `Item`, `Attempt`, `Review`                      |
| "puntaje"              | Oculta si es por intento o por competencia.                            | `correct` (por intento), `mastery` (derivado)     |

---

## Reglas de nomenclatura

1. **Un concepto, una palabra.** Si dos pantallas necesitan etiquetas distintas para lo mismo, el concepto está mal, no la etiqueta.
2. **Fecha es fecha, instante es instante.** `dueAt` es una fecha de calendario; `answeredAt` es un instante. Nunca se mezclan en aritmética sin conversión explícita.
3. **`state` siempre es derivado.** Cualquier función que devuelva `CompetencyState` debe ser pura y recibir los intentos como entrada.
4. **Los textos de contenido no aparecen como literales en el código.** Viven en registros de contenido, indexados por identificadores estables.
