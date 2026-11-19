# Patrones de diseño

Cada patrón de este documento se eligió porque resuelve un problema concreto de **este** producto. Cada uno trae además su **condición de salida**: si el problema desaparece, el patrón se va. Un patrón sin condición de salida es ceremonia.

---

## 1. Núcleo funcional, cáscara imperativa

**Problema:** mezclar reglas de negocio con React hace que la lógica solo se pueda probar arrancando la aplicación.

**Aplicación:** todo `features/*/domain` son funciones puras. La cáscara (rutas, componentes, almacenamiento) hace la E/S y llama al núcleo.

```ts
// puro: entra un valor, sale un valor
export function scheduleNext(s: ItemSchedule, a: Attempt, now: IsoDate): ItemSchedule

// impuro: la cáscara orquesta
const attempt = createAttempt(item, selected, confidence, clock.now());
const schedule = scheduleNext(previous, attempt, clock.today());
await store.commit(attempt, schedule);
```

**Condición de salida:** ninguna. Es la base del proyecto.

---

## 2. Puertos y adaptadores (en su versión mínima)

**Problema:** tres cosas del sistema son impuras y hay que poder sustituirlas: el tiempo, el almacenamiento y (a futuro) la generación de contenido.

**Aplicación:** exactamente **tres** puertos. Ni uno más.

| Puerto              | Implementación v1              | Sustituto futuro        | Por qué existe                       |
| ------------------- | ------------------------------ | ----------------------- | ------------------------------------ |
| `Clock`             | reloj del sistema              | reloj fijo en tests/demo| Sin él, los tests dependen de la hora |
| `AttemptStore`      | `localStorage`                 | Postgres                | Sin él, los tests escriben en el navegador |
| `ItemGeneratorPort` | `FixtureItemGenerator`         | proveedor de IA         | Sin él, la IA se filtra al dominio    |

**Dónde NO se usa:** no hay un repositorio por entidad, ni un puerto para el contenido, ni interfaces para las utilidades de fecha. El contenido es estático y validado en build; envolverlo en un repositorio sería ceremonia.

**Condición de salida:** si un puerto termina con una sola implementación posible para siempre, se elimina y se importa la implementación directamente.

---

## 3. Proyección sobre un registro append-only

**Problema:** guardar "el estado" obliga a migrarlo cada vez que cambia una regla, y permite que el estado contradiga al historial.

**Aplicación:** se guardan solo `Attempt`, en un registro que solo crece. Todo lo demás —programación por ítem, estado de competencia, desbloqueo, cola de repaso— se **calcula**.

```ts
// nunca se guarda esto
const state: CompetencyState = projectState(competencyId, attempts, items);
```

**Lo que esto NO es:** no es event sourcing. No hay bus de eventos, ni versionado de eventos, ni replay histórico, ni snapshots. Se toma el único beneficio que se necesita (derivar en vez de almacenar) sin el aparato.

**Condición de salida:** si el volumen de intentos hiciera el cálculo perceptiblemente lento (≈ decenas de miles), se añadiría una caché derivada. Aun así no se guardaría "el estado" como fuente de verdad.

---

## 4. Reglas como tabla, no como cadena de `if`

**Problema:** doce transiciones en un `if/else if` son ilegibles, difíciles de cubrir con tests y propensas a huecos.

**Aplicación:** una tabla de datos, y una función que la interpreta. Los tests recorren la tabla.

```ts
const RULES: Rule[] = [
  { phase: 'new',  correct: true,  confidence: 'confident', next: 'review',     interval: 3, easeDelta: 0,    lapse: false },
  // ...
];

export function scheduleNext(s: ItemSchedule, a: Attempt, now: IsoDate): ItemSchedule {
  const rule = RULES.find(r => r.phase === s.phase && r.correct === a.correct
                            && (r.confidence === null || r.confidence === a.confidence));
  if (!rule) throw new Error(`Sin regla para ${s.phase}/${a.correct}/${a.confidence}`);
  // aplicar, acotar, calcular dueAt
}
```

El `throw` es deliberado: un hueco en la tabla debe fallar ruidosamente en el primer test, no devolver algo plausible.

**Condición de salida:** ninguna. Es lo que hace verificable el algoritmo.

---

## 5. Máquina de estados explícita

**Problema:** las fases (`new`, `learning`, `review`, `relearning`) tienen transiciones válidas y no válidas. Sin declararlas, cualquier combinación acaba siendo posible.

**Aplicación:** la fase es un tipo cerrado y las transiciones viven en la tabla del punto 4. El tipo impide estados imposibles:

```ts
type Phase = 'new' | 'learning' | 'review' | 'relearning';
```

**Condición de salida:** ninguna.

---

## 6. Registro validado en la carga

**Problema:** los ítems y lecciones se referencian por id entre sí. Con búsquedas lineales y sin validación, un id mal escrito es un error en tiempo de ejecución.

**Aplicación:** al cargar el contenido se construye un índice y se valida todo de una vez. Si algo no cuadra, falla antes de renderizar.

```ts
const catalog = buildCatalog(areas, competencies, lessons, items); // valida y indexa
catalog.itemsById.get('token-vs-word');                           // O(1)
```

**Condición de salida:** ninguna. Es lo que sostiene la promesa "no hay contenido inválido en producción".

---

## 7. Orden topológico para el grafo

**Problema:** el mapa necesita capas (niveles) para dibujarse legiblemente, y hay que detectar ciclos.

**Aplicación:** algoritmo de Kahn sobre los prerrequisitos. Produce niveles para el layout **y** valida el invariante I1 en el mismo paso.

```ts
const levels = topologicalLevels(prerequisites); // lanza si hay ciclo
```

**Condición de salida:** ninguna. Sirve a dos propósitos con una implementación.

---

## 8. Barajado con semilla

**Problema:** si el orden de opciones es aleatorio sin control, un intento no se puede reproducir y los tests no son deterministas.

**Aplicación:** PRNG determinista (xorshift o similar, documentando que **no** es criptográfico). La semilla se guarda en el `Attempt` junto con `presentedOptionIds`.

**Condición de salida:** ninguna, mientras haya tests.

---

## 9. `Result` en vez de excepciones para errores esperados

**Problema:** "el ítem no existe", "el intento está duplicado", "la respuesta no corresponde a ninguna opción" son fallos previsibles, no excepciones.

**Aplicación:**

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };
```

Las excepciones se reservan para violaciones de invariante (un bug), no para flujo normal.

**Condición de salida:** si la UI terminara tratando todos los errores igual, se simplifica.

---

## 10. Composición en lugar de herencia

**Problema:** la jerarquía de clases invita a crear `BaseItem`, `AbstractQuestion` y similares.

**Aplicación:** no hay ni una sola clase abstracta en el diseño. Los comportamientos son funciones y los datos son objetos planos.

**Condición de salida:** ninguna.

---

## Anti-patrones prohibidos

| Prohibido                                        | Por qué                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Contenedor de inyección de dependencias          | Tres puertos se pasan como argumentos. Un contenedor sería más código que solución. |
| Repositorio genérico `Repository<T>`             | No hay base de datos. Es el patrón más copiado sin motivo del sector.     |
| Clase abstracta "por si acaso"                   | Se añade cuando hay dos implementaciones, no antes.                       |
| Singleton global de estado                       | Rompe los tests y el renderizado en servidor.                             |
| Provider de React con todo el dominio dentro     | Convierte el contexto en un cajón de sastre y provoca re-renders masivos. |
| `index.ts` barrel en cada carpeta                | Solo se permite como API pública de una feature, nunca por comodidad.     |
| `as` / `any` en los límites del sistema          | El límite se valida con Zod; el `as` es una mentira que se paga luego.    |
| `try/catch` vacío o genérico                     | Oculta el fallo que luego aparece en producción.                          |

---

## Resumen

| Patrón                        | Problema que resuelve                 | Si desaparece el problema…       |
| ----------------------------- | ------------------------------------- | -------------------------------- |
| Núcleo funcional              | Tests imposibles sin navegador        | Nunca desaparece                 |
| Puertos y adaptadores         | Tiempo, almacenamiento, IA sustituibles | Se elimina el puerto sin segunda implementación |
| Proyección append-only        | Estado que contradice al historial    | Se añade caché, no se guarda estado |
| Reglas como tabla             | Doce transiciones legibles y testeables | Nunca desaparece               |
| Máquina de estados            | Fases imposibles                      | Nunca desaparece                 |
| Registro validado             | Ids mal escritos y contenido inválido | Nunca desaparece                 |
| Orden topológico              | Layout del grafo y detección de ciclos| Nunca desaparece                 |
| Barajado con semilla          | Tests y demo no reproducibles         | Nunca desaparece                 |
| `Result`                      | Errores previsibles como flujo        | Si la UI unifica el tratamiento  |
