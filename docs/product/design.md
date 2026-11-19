# Diseño

Contrato visual de la interfaz. Es breve a propósito: fija **decisiones**, no maquetas.

> **Origen:** el lenguaje visual se hereda del proyecto anterior (`ai-engineering-academy`), que ya estaba resuelto y probado en pantalla. No se inventa una identidad nueva: se traslada y se simplifica.

---

## 1. Principios

1. **El contenido manda.** La interfaz no compite con el texto: fondos neutros, un solo acento.
2. **Un acento, no cinco.** El violeta marca acción y estado activo. Todo lo demás es escala de grises.
3. **Densidad legible.** El producto es de lectura y de responder: tipografía cómoda antes que compacta.
4. **Modo oscuro primero.** El tema oscuro es el que se diseña; el claro se deriva.
5. **El estado nunca se comunica solo con color.** Siempre color + forma o texto (daltonismo).

---

## 2. Tokens

| Token | Oscuro | Claro | Uso |
| --- | --- | --- | --- |
| `--bg` | `#0B0A1A` | `#F8FAFC` | Fondo de la aplicación |
| `--surface` | `#131129` | `#FFFFFF` | Tarjetas, superficies elevadas |
| `--surface-2` | `#191636` | `#F1F5F9` | Superficie dentro de tarjeta |
| `--border` | `rgba(255,255,255,0.10)` | `#E2E8F0` | Bordes y separadores |
| `--text` | `#F1F5F9` | `#0F172A` | Texto principal |
| `--text-muted` | `#94A3B8` | `#64748B` | Texto secundario y metadatos |
| `--accent` | `#8B5CF6` | `#7C3AED` | Acción principal y estado activo |
| `--accent-soft` | `rgba(139,92,246,0.15)` | `#EDE9FE` | Fondo de acento suave |

**Estados de competencia** (nunca solo color):

| Estado | Color | Forma | Etiqueta |
| --- | --- | --- | --- |
| Sin contenido | gris muy tenue | círculo hueco discontinuo | "próximamente" |
| Bloqueada | gris | círculo con candado | "bloqueada" |
| Disponible | acento | círculo relleno | "disponible" |
| En aprendizaje | ámbar | semicírculo | "en aprendizaje" |
| Consolidada | verde | círculo con check | "consolidada" |
| En riesgo | rojo | círculo con signo de exclamación | "necesita repaso" |

---

## 3. Tipografía

| Rol | Familia | Uso |
| --- | --- | --- |
| Títulos | Plus Jakarta Sans | `h1`, `h2`, nombre del producto |
| Cuerpo | DM Sans | Texto de lección y descripciones |
| Datos | JetBrains Mono | Identificadores, contadores, fechas, tokens |

Cargadas desde Google Fonts con `display=swap`. Escala: `h1` 2rem, `h2` 1.125rem, cuerpo 0.9375rem, metadatos 0.75rem. Interlineado 1.65 en cuerpo.

---

## 4. Estructura

```text
┌──────────────┬──────────────────────────────────────────────┐
│  marca       │  ruta actual        [tema] [acción]          │  ← topbar 56px
├──────────────┼──────────────────────────────────────────────┤
│  Hoy         │                                              │
│  Mapa        │   contenido (máx. 1280px, centrado)          │
│  Acerca      │                                              │
│              │                                              │
│  ─────────   │                                              │
│  racha       │                                              │
│  meta del día│                                              │
└──────────────┴──────────────────────────────────────────────┘
   256px
```

- Sidebar fija en escritorio (`lg`), cajón deslizante en móvil.
- La barra inferior de la sidebar muestra racha y meta diaria: son el hábito, y el hábito necesita verse.
- Un solo `<h1>` por pantalla. Enlace "saltar al contenido" como primera parada del tabulador.

---

## 5. El mapa

Es la pantalla que justifica el producto, y la más difícil.

- **Disposición:** columnas por nivel topológico (el nivel 0 a la izquierda), nodos centrados verticalmente dentro de cada columna. Nada de fuerzas ni física: posiciones deterministas y calculadas.
- **Aristas:** curvas suaves del prerrequisito al dependiente, con un trazo más tenue que los nodos.
- **Nodo:** círculo de 28 px con la forma del estado y etiqueta a la derecha en escritorio; en móvil, lista.
- **Accesibilidad:** el SVG es la representación visual, **la fuente de verdad de interacción es una lista** con los mismos nodos, navegable con teclado. El SVG tiene `aria-hidden="true"`.
- **Filtros:** área, capa y estado, siempre en la URL (`?area=`, `?capa=`, `?estado=`).

---

## 6. La pantalla de comprobación

- Una pregunta por pantalla. Enunciado grande, opciones como botones de ancho completo.
- La declaración de confianza va **después** de elegir y **antes** de enviar: preguntarla antes contamina la respuesta.
- Tras enviar: la opción elegida muestra **su** justificación; la correcta se marca; la explicación del concepto aparece al final.
- Nada de animaciones de "puntuación". El resultado es información, no premio.

---

## 7. Lo que no se hace

- Sin degradados decorativos ni sombras grandes.
- Sin animaciones que retrasen la lectura (`prefers-reduced-motion` respetado).
- Sin iconografía custom: Lucide.
- Sin ilustraciones generadas: el proyecto anterior tenía portadas para las áreas y se reutilizan si aportan; si no, no se ponen.
