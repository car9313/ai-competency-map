# Harness de ingeniería

> **Nota sobre la palabra.** "Harness" aparece dos veces en este proyecto con significados distintos. Este documento es el **harness de ingeniería**: el sistema automático que comprueba el código y el contenido. El otro significado — *Harness Engineering* como tema de estudio — es una competencia del grafo, con su propia lección.

El propósito del harness es hacer la calidad **barata y automática**, para que la revisión humana se dedique a lo que una máquina no puede juzgar: si una explicación es realmente clara y correcta.

---

## 1. El bucle

```text
editar  →  typecheck  →  lint  →  test  →  validate:content  →  build  →  commit
```

Todo corre en local con un comando y exactamente igual en CI. Si una comprobación solo existe en CI, a efectos prácticos no existe.

```bash
pnpm check
```

---

## 2. Scripts

| Script                  | Ejecuta                                              | Falla cuando                                  |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pnpm dev`              | Servidor de desarrollo de Next.js                    | —                                             |
| `pnpm build`            | Exportación estática                                 | Errores de tipo, contenido inválido, import mal puesto |
| `pnpm typecheck`        | `tsc --noEmit`                                       | Cualquier error de tipo                        |
| `pnpm lint`             | ESLint                                               | Cualquier violación de regla                   |
| `pnpm test`             | Vitest (dominio, unidad, componentes)                | Cualquier test rojo                            |
| `pnpm test:e2e`         | Playwright                                           | Cualquier flujo roto                           |
| `pnpm validate:content` | Linter de contenido sobre lecciones, ítems y grafo   | Cualquier regla R1–R7 violada (ver [`quality/content-linter.md`](../quality/content-linter.md)) |
| `pnpm check`            | typecheck + lint + test + validate:content + build   | Cualquiera de los anteriores                   |

---

## 3. Puertas de calidad

CI ejecuta las mismas puertas, en este orden, y se detiene en el primer fallo (la retroalimentación rápida vale más que el informe exhaustivo).

| Puerta | Comprobación        | Bloquea la fusión |
| ------ | ------------------- | ----------------- |
| G1     | `typecheck`         | ✅                 |
| G2     | `lint`              | ✅                 |
| G3     | `test`              | ✅                 |
| G4     | `validate:content`  | ✅                 |
| G5     | `build`             | ✅                 |
| G6     | `test:e2e`          | ✅                 |

**Sin umbral de cobertura.** Perseguir un número produce tests que existen para subirlo. Se espera cubrir casi por completo el módulo de dominio, porque es puro y barato de probar; los componentes de UI no, y fingir lo contrario es teatro.

---

## 4. Estrategia de pruebas

La pirámide está invertida a propósito: casi todo el esfuerzo va al dominio puro, casi nada a la UI.

| Nivel                      | Qué se prueba                                                                                  | Volumen objetivo |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| **Dominio (unitario)**     | Reglas R1–R12, acotaciones, proyección de estado, lógica de desbloqueo, invariantes I1–I14        | ~60 casos        |
| **Propiedades**            | Secuencias largas de intentos generadas que nunca deben romper I12–I14                            | ~5 propiedades   |
| **Validación de contenido**| Reglas R1–R7 sobre el contenido real, más un fixture roto a propósito por cada regla              | ~10 casos        |
| **Integración**            | Ida y vuelta del adaptador de almacenamiento; carga del grafo; pipeline intento → programación → cola | ~8 casos     |
| **Componentes**            | Renderizado de ítem, feedback, selección con teclado                                             | ~6 casos         |
| **E2E**                    | El camino de la demo: mapa → lección → responder → reprogramar → cola → desbloquear               | 1–2 flujos       |

### Reglas de determinismo

No son preferencias; violarlas es un bug.

1. **Ningún `Date.now()` fuera del adaptador de reloj.** Impuesto con una restricción de ESLint:

   ```jsonc
   // prohibido en todo el proyecto excepto en src/shared/time/clock.ts
   "no-restricted-properties": [
     "error",
     { "object": "Date", "property": "now", "message": "Inyecta el puerto Clock." }
   ]
   ```

2. **Ninguna aleatoriedad fuera del barajador con semilla.** El orden de opciones sale de una semilla guardada en el intento.
3. **Ninguna red en los tests.** El futuro adaptador de IA se sustituye por el de fixtures; nada más puede salir.
4. **Los tests no dependen del idioma ni de la zona horaria de la máquina.** Las fechas son cadenas explícitas.

---

## 5. El contenido se verifica como el código

El conjunto de contenido (`content/**`) no son "datos que esperamos que estén bien". Es entrada de un validador que rompe el build:

- Validación de esquema con Zod en el límite (estructura, campos obligatorios, formatos).
- Validación de reglas con el linter de contenido (reglas semánticas: una sola opción correcta, todo distractor con justificación, ningún ítem huérfano, grafo sin ciclos, competencias con ítems suficientes).
- **Un fixture negativo por regla**, comprobado para fallar. Un linter que nunca ha rechazado nada es un linter que nadie ha probado.

El flujo es por tanto: escribir contenido → `pnpm validate:content` → corregir → commit. Un revisor nunca tiene que comprobar "¿hay exactamente una respuesta correcta?"; la máquina ya lo hizo.

---

## 6. El harness de la demo

La demo depende de viajar en el tiempo (responder hoy, repasar mañana). Eso exige un reloj controlado:

- Producción y uso normal: reloj del sistema, siempre. No hay override.
- Los tests inyectan `fixedClock`, que es lo que hace determinista al planificador.
- Para ver la cola de repaso en el navegador se siembran intentos con fechas pasadas (ver ADR-007), no se mueve «hoy».

**Regla:** el puerto `Clock` es el único sitio donde se lee la hora real, y el producto no ofrece ninguna forma de sustituirla. Se probó a tener un `?devtime` de desarrollo y se retiró: los intentos son append-only, así que un intento grabado con una fecha falsa no se puede corregir después. La forma segura de que un control de tiempo no llegue a producción es que no exista.

---

## 7. Definición de verde

Un cambio se puede fusionar cuando **todo** esto se cumple:

1. `pnpm check` pasa en local.
2. CI está en verde sobre el mismo commit.
3. El comportamiento nuevo de dominio tiene un test que fallaría sin el cambio.
4. El contenido nuevo pasa el linter sin supresiones.
5. No se añadió ninguna dependencia sin una línea de justificación en la descripción del PR.

---

## 8. Excluido a propósito

| Excluido                                | Motivo                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| Storybook                               | El conjunto de componentes es pequeño y de un solo autor; cuesta más de lo que aporta |
| MSW o cualquier mock de HTTP            | No hay HTTP en la v1. Llega con el adaptador de IA, si llega                   |
| Umbrales de cobertura                   | Se pueden jugar. Ver §3.                                                       |
| Pruebas de regresión visual             | Solo tienen sentido con un diseño estable; revisar tras la fase 3              |
| Pruebas de mutación                     | Interesante, pero el dominio puro ya es barato de probar bien                  |
| Hooks de pre-commit con la suite completa| Los commits lentos se acaban saltando. El hook formatea y comprueba tipos; CI hace el resto |
