# Arquitectura

## 1. Estilo

**Monolito modular** con **Vertical Slice Architecture** y **núcleo funcional puro**.

Traducido: una sola aplicación desplegable, organizada por capacidad (no por tipo de archivo), donde cada capacidad tiene su propia lógica de dominio separada de toda la infraestructura.

No se usa microservicios, ni capas horizontales (`services/`, `controllers/`, `repositories/`), ni un contenedor de inyección de dependencias. Ninguna de las tres resuelve un problema que tengamos.

## 2. Capas

```text
                 ┌──────────────────────────────────────────┐
   navegador     │  app/                                    │
                 │  App Router · exportación estática       │
                 │  rutas finas: leen, componen, delegan    │
                 └───────────────┬──────────────────────────┘
                                 │ llama casos de uso
                 ┌───────────────▼──────────────────────────┐
                 │  features/*/application/                 │
                 │  orquestación: leer → calcular → escribir│
                 └───────┬──────────────────────┬───────────┘
                         │                      │
        ┌────────────────▼───────────┐  ┌───────▼──────────────────┐
        │  features/*/domain/        │  │  infrastructure/         │
        │  PURO                      │  │  adaptadores             │
        │  reglas, proyecciones      │  │  localStorage, fixtures, │
        │  sin React, sin IO, sin red│  │  reloj, semilla          │
        └────────────────────────────┘  └──────────────────────────┘
                         ▲                      │
                         └──── implementan ─────┘
                            los puertos del dominio
```

La dependencia **siempre apunta hacia dentro**: `app` conoce `application`, `application` conoce `domain`, y `domain` no conoce a nadie.

## 3. Estructura de carpetas

```text
src/
├── app/                      # rutas de Next.js (finas)
│   ├── page.tsx              # cola de repaso
│   ├── mapa/page.tsx         # el grafo
│   ├── c/[competencyId]/page.tsx
│   └── layout.tsx
│
├── features/
│   ├── assessment/
│   │   ├── domain/           # PURO: modelo, planificador, proyecciones
│   │   ├── application/      # casos de uso: answerItem, getTodayQueue…
│   │   └── infrastructure/   # AttemptStore (localStorage), seeded shuffle
│   │
│   ├── competency-graph/
│   │   ├── domain/           # orden topológico, recorrido, validación
│   │   ├── application/      # vistas del mapa
│   │   └── presentation/     # SVG del mapa
│   │
│   └── content/
│       ├── domain/           # esquemas Zod, tipos
│       ├── application/      # índice, búsqueda, resolución por id
│       └── infrastructure/   # carga de los registros de contenido
│
├── content/                  # los datos: áreas, competencias, lecciones, ítems
│   ├── areas.ts
│   ├── competencies.ts
│   ├── lessons/
│   └── items/
│
└── shared/
    ├── ui/                   # diseño: Button, Card, Callout, ProgressBar
    ├── time/                 # puerto Clock y sus adaptadores
    └── types/                # tipos neutrales compartidos
```

**Regla de crecimiento:** las carpetas se crean cuando hay algo dentro que las justifique. No se pre-crean capas vacías para funcionalidad futura.

## 4. Los dos flujos

### 4.1 Contenido (en build)

```text
content/*.ts  →  Zod  →  linter (R1–R7)  →  índice en memoria  →  páginas estáticas
```

Si el contenido no pasa, el build falla. Nunca hay contenido inválido en producción, porque no hay forma de desplegarlo.

### 4.2 Evidencia (en el navegador)

```text
el alumno responde
        │
        ▼
se crea un Attempt (inmutable)
        │
        ├─→ scheduleNext(schedule, attempt, clock)   [dominio puro]
        │
        ▼
Port AttemptStore  →  append(attempt)          ← lo único que se persiste
        │
        ▼
proyecciones puras: foldSchedule · estado de competencia · desbloqueo · cola de repaso
        │
        ▼
render
```

El paso clave: **las proyecciones se recalculan, no se guardan**. Si mañana cambian las reglas de estado, todo el historial se reinterpreta sin migración de datos.

## 5. Estrategia de renderizado

| Caso                                          | Elección                            | Por qué                                          |
| --------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| Páginas de competencia y lección              | Server Component, generado estático | SEO y primera carga sin JavaScript de datos       |
| Mapa, ítem, cola de repaso                    | Client Component                    | Necesitan interacción y almacenamiento local      |
| Filtros y navegación                          | Parámetros de URL                   | Compartibles y recargables sin estado global      |
| Todo lo demás                                  | Estático                            | El contenido no cambia entre peticiones           |

La aplicación se exporta como **sitio estático** (`output: 'export'`). No hay servidor en producción, así que no hay nada que escalar, proteger ni pagar.

## 6. Fronteras que no se cruzan

| Frontera                                  | Regla                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `domain` → todo lo demás                  | Prohibido. El dominio no importa React, ni Next, ni el almacenamiento.         |
| `feature` A → interior de `feature` B     | Prohibido. Solo se habla por contratos públicos o por composición en `app`.     |
| `app` → `domain` directamente             | Desaconsejado. `app` llama a `application`, que es donde vive la orquestación. |
| Contenido → UI                            | Prohibido. El contenido es dato; quien lo pinta es la UI.                      |

Detalle y mecanismo de aplicación en [`dependency-rules.md`](dependency-rules.md).

## 7. Qué no hay, y por qué

| Ausente            | Motivo                                                                 | Cuándo aparecería                          |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------ |
| Backend / API      | No hay datos que no quepan en el navegador del propio alumno            | Si hubiera cuentas o sincronización         |
| Base de datos      | Coste y operación sin beneficio en la v1                                | Con cuentas y uso multidispositivo          |
| Autenticación      | Consecuencia de lo anterior                                             | Igual                                       |
| Estado global      | Toda la información está en la URL o en un almacén derivado             | Nunca, mientras el diseño aguante           |
| Servicio de IA     | Presupuesto cero y decisión de diseño ([ADR-005](adr/ADR-005-sin-ia-en-v1.md)) | Si el pipeline de autoría se demuestra útil |

## 8. Puntos de extensión previstos

No se construyen, pero el diseño deja el hueco explícito:

- **Proveedor de IA**: puerto `ItemGeneratorPort` implementado hoy por `FixtureItemGenerator`. Cambiar de proveedor es cambiar un archivo.
- **Persistencia remota**: puerto `AttemptStore` implementado hoy por `LocalStorageAttemptStore`. Una cuenta futura es un adaptador nuevo, no una reescritura.
- **Inglés**: los identificadores de contenido son estables y no dependen del idioma; añadir `locale` es aditivo.

Ver [`design-patterns.md`](design-patterns.md) para el porqué de cada uno.
