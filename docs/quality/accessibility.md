# Accesibilidad

Pasada automática y manual sobre la fase 1. Este documento registra **qué se midió, qué estaba mal, qué se cambió y qué queda fuera del alcance de una herramienta**.

## Cómo se comprueba

```powershell
pnpm build
pnpm a11y
```

`scripts/a11y-check.ts` levanta la build estática, abre cada ruta en un navegador real con Playwright e inyecta axe-core 4.14.1. Falla si aparece un problema de impacto **critical** o **serious**. Se ejecuta en CI como gate **G6**.

- **7 rutas** × **2 temas** (oscuro y claro) = 14 auditorías.
- Rutas: `/`, `/mapa`, `/mapa/tarjetas`, una lección, una comprobación, `/repaso`, `/acerca`.
- Se siembra un historial en `localStorage` para que axe revise la pantalla de pregunta y la cola **en su estado real**, no los estados vacíos.
- Usa un navegador ya instalado en la máquina (`msedge` → `chrome` → chromium de Playwright). No hace falta descargar nada: la descarga del navegador de Playwright falla en entornos restringidos y añade minutos en CI.

## Resultado

```
Antes:  16 problemas (críticos o serios)
Ahora:  ✓ Sin violaciones en 7 rutas × 2 temas
```

## Qué estaba mal y qué se hizo

| Problema | Causa real | Arreglo |
|---|---|---|
| `color-contrast` en botones y badges | Blanco sobre `#8b5cf6` = **3,5:1** (mínimo 4,5) | El acento se separa en dos tokens: `--accent` para texto y `--accent-bg` para relleno. Blanco sobre `#6d28d9` ≈ **6,9:1** |
| `color-contrast` en texto atenuado (tema claro) | `#64748b` sobre `#f1f5f9` = **4,3:1** | `--text-muted` baja a `#475569` ≈ **5,9:1** |
| `color-contrast` en verde y ámbar (tema claro) | `emerald-600` / `amber-600` no llegan a 4,5 sobre fondo claro | Pasan a `-700`; en oscuro se mantiene `dark:-300` |
| `color-contrast` en etiquetas de acento | `#8b5cf6` como texto sobre el fondo oscuro | En oscuro el acento sube a `#a78bfa` ≈ **7:1** |
| `label-content-name-mismatch` en los enlaces del SVG | El `aria-label` no contenía el texto visible, que acaba en «…» (WCAG 2.5.3) | Ver la decisión sobre el SVG, abajo |

### El acento hacía dos trabajos incompatibles

Un solo color no puede ser **texto sobre el fondo** y **relleno bajo texto blanco**: lo que mejora uno empeora el otro. Blanco sobre el violeta de marca daba 3,5:1; aclararlo para que funcionara como texto habría empeorado el relleno. Por eso `--accent-bg` existe.

## La decisión que cambié

**El SVG del mapa ya no es navegable con teclado.**

Antes defendí lo contrario: nodos enlazables y recorribles con `Tab`. La auditoría demostró dos cosas:

1. **39 paradas de tabulación** para atravesar el gráfico. Un usuario de teclado tiene que pulsar `Tab` cuarenta veces antes de llegar a lo siguiente.
2. El nombre accesible de cada enlace **no podía coincidir** con una etiqueta truncada, lo que viola WCAG 2.5.3 (el texto visible debe formar parte del nombre accesible).

Ahora el SVG es `aria-hidden` con enlaces `tabIndex={-1}`: **se puede pulsar con el ratón**, pero la versión navegable es la vista de tarjetas, enlazada justo debajo del gráfico. Es la alternativa textual completa, que es lo que pide WCAG para contenido gráfico.

Sigue siendo una pérdida real para quien navegue con teclado y quiera explorar el grafo: puede leerlo, pero no recorrerlo nodo a nodo. Se acepta a cambio de no imponer cuarenta paradas.

## Teclado: lo que axe no comprueba

Verificado con pulsaciones reales en el navegador:

| Comprobación | Resultado |
|---|---|
| Primer `Tab` de la página | «Saltar al contenido» |
| `Enter` en el enlace de salto | El foco pasa a `main#contenido` |
| Indicador de foco | Contorno propio de 2 px con `--accent`, visible en los dos temas |
| Nodos del SVG en el orden de tabulación | **0** (fuera, como se decidió) |
| Grupo de opciones | `ArrowDown` mueve y selecciona; un solo `Tab` para entrar y salir del grupo |
| Confianza | Igual: flechas dentro del grupo |
| `Tab` hasta el botón y `Enter` | Envía |
| Foco tras enviar | Se mueve al bloque de resultado (se anuncia) |
| ¿Trampa de teclado? | No: el siguiente `Tab` alcanza «Siguiente de la cola» |

El enlace de salto estaba **roto de forma silenciosa**: el navegador desplazaba la vista pero el foco se quedaba en `body`, así que el siguiente `Tab` volvía al principio. Se arregló con `tabIndex={-1}` en `main`. Ninguna herramienta automática detecta esto.

## Fuera de alcance de esta pasada

Sé honesto con lo que esto **no** cubre:

- **Lectores de pantalla reales** (NVDA, VoiceOver, TalkBack). axe verifica nombres y roles, no si el orden de lectura tiene sentido al escucharlo.
- **Zoom al 200 %** y reflow a 320 px de ancho (WCAG 1.4.10). Se comprobó que no hay desborde horizontal a 375 px, que no es lo mismo.
- **`prefers-contrast: more`** y modo de alto contraste de Windows.
- **Contraste de los estados del grafo**: los colores de estado (ámbar, verde, rosa) codifican información y no se ha verificado que sobrevivan a una simulación de daltonismo. La forma y la etiqueta sí cambian, así que la información no depende solo del color.
- **Contenido en otros idiomas.**

Si alguna de estas se quiere cerrar, el siguiente paso natural es un lector de pantalla en las cuatro pantallas del guion, no más automatización.
