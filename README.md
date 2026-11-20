# AI Competency Map

> **Nombre provisional.** Un mapa de competencias de AI Engineering donde el progreso se **deriva de evidencia**, no se declara.

**Estado:** Fase 0 — definición de producto y arquitectura. Todavía no hay código de aplicación, y es intencionado.

---

## Qué es

Una herramienta de aprendizaje para desarrolladores que necesitan construir con IA y no tienen un mapa mental del campo. Tiene dos mitades que solo tienen sentido juntas:

- Un **grafo de competencias**, ordenado por prerrequisitos, que responde a _"¿qué aprendo y en qué orden?"_
- Un **motor de evaluación** que responde a _"¿lo sé de verdad, y cuándo tengo que repasarlo?"_

## La decisión que define el proyecto

> El progreso es una **proyección de los intentos registrados**. Nunca es un valor que el usuario escribe.

La mayoría de plataformas guardan una casilla: _"lección completada"_. Eso es una afirmación del usuario. Aquí una competencia no tiene estado almacenado: su estado se calcula a partir del registro append-only de intentos, con las reglas de [`docs/domain/assessment-engine.md`](docs/domain/assessment-engine.md).

Todo lo demás se deriva de ahí: repaso espaciado, cola de repaso, reglas de desbloqueo, y la posibilidad de recalcular el historial cuando cambia el contenido.

## Principios

1. **Evidencia por encima de afirmación.** Nada se "completa" haciendo clic. Se completa porque respondiste.
2. **El dominio es puro.** La lógica de evaluación es TypeScript sin React, sin DOM y sin red. Corre en Node y tiene tests.
3. **Explicable antes que ingenioso.** Cada nota y cada fecha que ve el usuario se justifican en una frase. Sin cajas negras.
4. **El contenido es dato, no maquetación.** Lecciones e ítems son registros validados, comprobados por un linter en CI.
5. **Infraestructura cero.** Sin backend, sin base de datos, sin cuentas, sin claves de API, sin coste.
6. **Código en inglés, documentación y contenido en español.** Los identificadores se leen como cualquier librería; la prosa se lee como el usuario.

## Fuera de alcance en la v1

Autenticación, base de datos, contenido generado por IA, sandboxes de ejecución de código, interfaz multi-idioma, funciones de comunidad, vídeos. Ver [`docs/product/vision.md`](docs/product/vision.md).

## Mapa del repositorio

```text
docs/
├── product/          visión, alcance, roadmap, guion de demo
├── domain/           lenguaje ubicuo, grafo de competencias, motor de evaluación
├── architecture/     visión general, reglas de dependencias, patrones, stack
└── quality/          linter de contenido, harness de ingeniería
```

## Por dónde empezar

| Si quieres saber…                              | Lee                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Por qué existe este proyecto                   | [`docs/product/vision.md`](docs/product/vision.md)                             |
| **Cómo funciona, en lenguaje llano**            | [`docs/product/como-funciona.md`](docs/product/como-funciona.md)               |
| Qué significa cada palabra                     | [`docs/domain/ubiquitous-language.md`](docs/domain/ubiquitous-language.md)     |
| Cómo funcionan el dominio y el repaso          | [`docs/domain/assessment-engine.md`](docs/domain/assessment-engine.md)         |
| Qué competencias hay y cómo se conectan        | [`docs/domain/competency-graph.md`](docs/domain/competency-graph.md)           |
| Cómo está organizado el código                 | [`docs/architecture/overview.md`](docs/architecture/overview.md)               |
| Qué patrones se usan y por qué                 | [`docs/architecture/design-patterns.md`](docs/architecture/design-patterns.md) |
| Qué herramientas y por qué                     | [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md)           |
| Qué se construye y en qué orden                | [`docs/product/roadmap.md`](docs/product/roadmap.md)                           |
| Qué se construye primero                      | [`docs/product/backlog-phase-1.md`](docs/product/backlog-phase-1.md)           |
| Cómo se navega el producto                     | [`docs/product/navigation.md`](docs/product/navigation.md)                     |
| Cómo se trabaja en el repo                     | [`docs/contributing/development-workflow.md`](docs/contributing/development-workflow.md) |

## Cómo arrancarlo

Todavía no hay nada que ejecutar. El primer hito ejecutable está definido en el roadmap.
