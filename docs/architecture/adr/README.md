# Architecture Decision Records

Un ADR registra una decisión, sus alternativas y sus consecuencias. Se escribe cuando la decisión es **costosa de revertir** o **sorprendente para quien llega nuevo**. No se escribe para documentar lo obvio.

## Formato

```markdown
# ADR-00N — Título en una línea

- Estado: propuesto | aceptado | sustituido por ADR-00M | rechazado
- Ámbito: ...

## Contexto       — qué fuerzas obligan a decidir
## Decisión       — qué se decide, en imperativo
## Alternativas   — qué se consideró y por qué se descartó
## Consecuencias  — lo bueno, y sobre todo lo que cuesta
## Criterio de revisión — qué tendría que pasar para reabrirla
```

El apartado que casi nadie escribe y es el que más valor tiene: **consecuencias negativas** y **criterio de revisión**. Una decisión sin coste declarado es una decisión no pensada.

## Índice

| ADR                                                    | Decisión                                            | Estado   |
| ------------------------------------------------------ | --------------------------------------------------- | -------- |
| [ADR-001](ADR-001-nextjs-estatico.md)                   | Next.js con exportación estática                    | aceptado |
| [ADR-002](ADR-002-dominio-puro.md)                      | Dominio puro separado de la interfaz                | aceptado |
| [ADR-003](ADR-003-progreso-derivado.md)                 | El progreso se deriva, nunca se almacena            | aceptado |
| [ADR-004](ADR-004-opcion-multiple-repaso-espaciado.md)  | Opción múltiple con confianza y repaso espaciado    | aceptado |
| [ADR-005](ADR-005-sin-ia-en-v1.md)                      | Sin IA en la v1                                     | aceptado |
| [ADR-006](ADR-006-persistencia-local.md)                | Persistencia local con puerto preparado para cuentas | aceptado |
| [ADR-007](ADR-007-sin-control-de-tiempo.md)             | Sin control de tiempo en el producto                | aceptado |

## Pendientes de escribir cuando toque

| Tema                            | Se escribe en…                                    |
| ------------------------------- | ------------------------------------------------- |
| Formato de contenido (TS vs MDX)| Antes de la fase 2, con las primeras 10 lecciones  |
| Gráfico del mapa en SVG propio  | Al empezar la vista de mapa (fase 1)              |
| Puerto de almacenamiento        | Al implementar `AttemptStore` (fase 1)            |
| Estrategia de accesibilidad     | Al cerrar el diseño de las cuatro pantallas       |
| Licencia y apertura del código  | Fase 3                                            |
| Superficie MCP para agentes     | Fase 3, tras cerrar el contenido  |

## Reglas

1. **Un ADR no se edita para cambiar la decisión.** Se escribe uno nuevo que la sustituye, y el anterior se marca como sustituido.
2. **Si una decisión se puede revertir en una tarde, no necesita ADR.** Va en un comentario del código o en la descripción del PR.
3. **Un ADR de rechazo es tan válido como uno de aceptación.** "Elegimos no hacer X" es una decisión.
