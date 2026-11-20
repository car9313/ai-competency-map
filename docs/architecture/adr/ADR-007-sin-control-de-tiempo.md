# ADR-007 — Sin control de tiempo en el producto

- **Estado:** aceptado (sustituye a una decisión anterior que sí lo incluía)
- **Ámbito:** dominio, desarrollo, integridad del historial
- **Relacionado con:** [ADR-003](ADR-003-progreso-derivado.md) (progreso derivado), [ADR-004](ADR-004-opcion-multiple-repaso-espaciado.md) (repaso espaciado)

## Contexto

El producto se sostiene sobre el tiempo: un intento correcto devuelve el ítem a los 3 días, después a los 8, después a los 20. Para comprobar que eso funciona hay que **esperar días**, y eso hace insoportable el desarrollo de la cola de repaso y hace imposible enseñar el ciclo en una demostración de cinco minutos.

La solución habitual es un parámetro tipo `?devtime=2026-12-01` que sustituye «hoy» por la fecha indicada. Se llegó a implementar: un reloj fijo, una aserción en CI que comprobaba que la cadena no aparecía en el bundle, y una nota en la interfaz.

Funcionaba. Y aun así se retiró.

## Decisión

**No hay control de tiempo en el producto.** El reloj es siempre el del sistema.

```ts
// No existe resolveClock(), ni ?devtime=, ni ninguna bandera equivalente.
export const systemClock: Clock = { today: localToday, now: () => new Date().toISOString(), ... };
```

Para ejercitar la cola de repaso se **siembran intentos con fechas pasadas**, que es exactamente lo que le ocurrió a alguien que respondió hace cuatro días. El procedimiento está documentado en `docs/development-workflow.md` y no añade una sola línea de código al producto.

El reloj sigue entrando en el dominio como argumento (`today: IsoDate`), así que los tests mantienen el control total con `fixedClock` sin necesitar ninguna puerta trasera.

## Motivos

1. **El daño sería permanente.** Los intentos son append-only y nunca se editan (invariante I8). Un intento respondido con el reloj manipulado queda grabado con una fecha del futuro para siempre, y la programación de ese ítem se calcula a partir de ahí. En una app normal se arregla borrando una fila; aquí, por diseño, no se puede.
2. **El reloj no es cosmético.** Decide qué está vencido (`buildReviewQueue`), qué está consolidado (`projectState`) y cuándo vuelve cada ítem (`scheduleNext`). Mentir sobre «hoy» es mentir sobre todo.
3. **Rompe la premisa del producto.** Si cualquiera puede mover el reloj, puede fabricar una captura con todo consolidado sin haber respondido nada.
4. **La protección era más compleja que el problema.** Mantenerlo exigía un archivo, un gate de CI y un `if` en la interfaz. La forma más segura de que un control de tiempo no llegue a producción es que no exista.
5. **El reemplazo es mejor, no solo equivalente.** Sembrar intentos pasados reproduce el caso real; desplazar «hoy» reproduce un caso que nunca ocurre.

## Alternativas consideradas

| Alternativa | A favor | En contra |
|---|---|---|
| `?devtime` en producción | Trivial de usar | Riesgo de historial corrupto irreversible |
| `?devtime` tras `NODE_ENV` + gate de CI | Sin riesgo en el bundle (verificado) | Tres piezas para una comodidad; sigue existiendo la tentación de aflojar el gate |
| Bandera en `localStorage` | No toca la URL | **Sobrevive al build**: llega a producción |
| Cambiar la hora del sistema operativo | Sin código | No sirve para enseñar desde otro equipo |
| Build separado «solo demo» | Aislamiento real | Duplica el artefacto y el riesgo de desplegar el equivocado |
| **Sembrar intentos con fechas pasadas** | Cero código; reproduce el caso real | Requiere consola del navegador (documentado) |

## Consecuencias

**Positivas**

- Una clase entera de fallos desaparece: no hay forma de escribir un intento con fecha falsa.
- Menos código y un concepto menos que explicar.
- El argumento para una entrevista es más limpio: *«el reloj entra como argumento en el dominio y no se puede sustituir desde fuera»*.

**Negativas y costes**

- Enseñar el ciclo completo en el navegador exige preparar datos antes; ya no es cambiar una URL.
- Quien visite el sitio no podrá ver la repetición espaciada «en vivo» sin responder ítems y esperar. Se acepta: la demo muestra el flujo de comprobación, y el planificador se demuestra con sus tests.

## Criterio de revisión

Si se quiere que un visitante *vea* el ciclo sin esperar, la respuesta correcta **no** es reintroducir un override silencioso, sino una **ruta de simulación explícita** (`/simulacion`) que use datos de ejemplo etiquetados como tales y no toque el historial del usuario. Cambiar el reloj sería otra vez la solución equivocada.
