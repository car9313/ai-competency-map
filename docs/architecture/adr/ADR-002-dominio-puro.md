# ADR-002 — Dominio puro separado de la interfaz

- **Estado:** aceptado
- **Ámbito:** arquitectura

## Contexto

La lógica de evaluación (planificación de repasos, proyección de estados, desbloqueo) es la parte del producto que realmente tiene reglas. Es también la parte más fácil de enredar con React: un `useEffect` que calcula el próximo repaso, un componente que decide si una competencia está consolidada, un `Date.now()` escondido en un helper.

En el proyecto anterior, la lógica de progreso vivía en un `Context` de React mezclada con `localStorage`. Consecuencia: la única forma de probarla era montar componentes, y el tiempo era siempre "ahora".

## Decisión

**Todo `features/*/domain` es TypeScript puro.** Sin React, sin Next, sin DOM, sin red, sin `Date.now()`. Se aplica con reglas de ESLint que rompen el build (D1, D2, D8 en [`dependency-rules.md`](../dependency-rules.md)).

El tiempo entra por el puerto `Clock`; el azar, por una semilla explícita.

## Alternativas consideradas

| Alternativa                              | A favor                                       | En contra                                                            |
| ---------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Lógica en contextos y hooks de React     | Menos archivos, "más directo"                 | Tests caros, tiempo no controlable, imposible reutilizar en Node      |
| Lógica en la capa de servicios genérica  | Estructura reconocible                          | Capa horizontal sin dominio real; acaba siendo funciones sueltas      |
| Clases con dependencias inyectadas       | Encaja con la jerga de "clean architecture"   | Ceremonia y estado; funciones puras bastan                            |

## Consecuencias

**Positivas**

- El planificador se prueba con una tabla de casos y se ejecuta en milisegundos.
- El determinismo hace posible el guion de demo: viajar en el tiempo es inyectar otro reloj.
- Si mañana cambian las reglas de estado, se reinterpreta el historial sin migrar datos.
- El dominio se puede leer como especificación.

**Negativas y costes**

- Hay un paso más de indirección: la UI no calcula, pide. Para un proyecto pequeño puede parecer ceremonia, y esa es la crítica legítima.
- Obliga a pasar el reloj y el almacenamiento como argumentos, lo que ensucia las firmas de las funciones de `application`.

## Criterio de revisión

No se revisa. Es la base del proyecto. Si alguna vez estorba, es señal de que una regla de negocio se está colando en la UI.
