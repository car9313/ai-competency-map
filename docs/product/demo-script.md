# Guion de demo

Cinco minutos, seis escenas, sin tocar código. Es el recorrido que se graba para
portfolio y la prueba de que el producto se sostiene solo.

**Antes de grabar:** ventana a 1440 × 900, tema oscuro, historial limpio
(`/acerca` → Borrar). Recarga y confirma que la página responde (cambia el tema y
vuelve) antes de dar al récord.

---

## 0:00 – 0:20 · El problema

**Pantalla:** `/`

> «Casi todas las plataformas de aprendizaje guardan una casilla: "lección
> completada". Eso es una afirmación del usuario. Aquí no hay casilla: el estado
> se calcula a partir de lo que has respondido.»

**Qué se ve:** "Nada vence hoy" y la sesión vacía. Es el punto de partida honesto.

---

## 0:20 – 1:10 · El mapa

**Pantalla:** `/mapa`

> «Treinta y nueve competencias, ordenadas por prerrequisitos. No es una lista: es
> un grafo. Arriba está la raíz, y cada nivel depende del anterior.»

**Haz:** pasa el cursor por un nodo del segundo nivel.

> «Al pasar por encima se resaltan sus prerrequisitos y sus dependencias. Y el
> tooltip dice qué falta para poder comprobarla.»

**Haz:** clic en **Tarjetas**.

> «La misma información en texto, porque un grafo no es accesible para todo el
> mundo: esta vista es la versión completa.»

---

## 1:10 – 2:00 · Una lección

**Haz:** vuelve a Mapa, clic en **Fronteras entre IA, ML y deep learning**.

> «La lección es breve a propósito: es el preámbulo de la evaluación, no un
> artículo. Qué es, qué se rompe cuando se hace mal, y los errores típicos.»

**Haz:** baja despacio hasta las tarjetas de errores.

> «Cada error describe el razonamiento equivocado, no la respuesta correcta. Ese
> detalle se repite en las 156 preguntas.»

---

## 2:00 – 3:00 · La comprobación

**Haz:** clic en **Comprobar**. Lee la pregunta en alto.

> «Un equipo clasifica tickets con reglas que funcionan y son auditables. ¿Qué
> conviene hacer?»

**Haz:** elige **Mantener las reglas y no introducir un modelo**, marca **Seguro**,
pulsa **Comprobar**.

> «Correcto. Vuelve en tres días —el intervalo pasa de uno a tres— y me dice por
> qué esa opción y no las otras dos.»

**Señala el bloque de feedback.**

> «Esto es lo que ninguna plataforma hace: cada distractor tiene su propia
> explicación. Si hubiera fallado, me diría exactamente en qué razonamiento me
> equivoqué.»

> **Nota para ti:** si eliges a propósito la opción del LLM, la demo gana fuerza:
> «vuelve mañana» y el intervalo vuelve a empezar. Pero entonces no podrás
> enseñar la consolidación en la escena 5.

---

## 3:00 – 3:40 · El estado cambia

**Haz:** vuelve a `/mapa/tarjetas`.

> «No he marcado nada como completado. El nodo ha cambiado solo, porque el estado
> es una proyección de los intentos.»

**Haz:** señala el chip **«en aprendizaje»** en el nodo raíz.

> «Y entra en `/c/generalization-overfitting/comprobar` solo, porque su
> prerrequisito ya tiene evidencia. Basta con haber empezado: no se exige dominio
> para desbloquear.»

---

## 3:40 – 4:30 · El repaso (usuario que vuelve)

**Haz:** consola (`F12`) y pega:

```js
const mk = (id, itemId, dias) => ({
  id, deviceId: 'dev', itemId,
  answeredAt: new Date(Date.now() - dias * 86400000).toISOString(),
  selectedOptionId: 'a', correct: true, confidence: 'confident',
  presentedOptionIds: ['a','b','c'], durationMs: 3000,
});
localStorage.setItem('acm:attempts:v1', JSON.stringify([
  mk('d1', 'ml-rules-vs-model', 6), mk('d2', 'ctx-token-unit', 5),
]));
location.reload();
```

> «Esto simula un alumno que respondió hace casi una semana. La cola no se puede
> demostrar en directo sin esperar días, así que se siembra el historial.»

**Pantalla:** `/` → **Empezar el repaso**.

> «Dos ítems vencidos, agrupados por competencia, del más atrasado al menos.»

**Haz:** responde uno y pulsa **Siguiente de la cola**.

> «Y el contador baja. Cuando la cola se vacía, la sesión termina: no hay un bucle
> infinito.»

---

## 4:30 – 5:00 · Cierre

**Pantalla:** `/acerca` → **Exportar**.

> «Todo el progreso es un JSON: intentos append-only, sin cuentas y sin backend.
> Se puede exportar, importar y recalcular desde cero, porque el estado no está
> guardado en ningún sitio.»

> «El producto entero es estático, cuesta cero y no tiene claves de API. El código
> es MIT y el contenido CC BY-SA.»

---

## Cómo grabarlo

### Herramienta

| Opción | Cuándo | Notas |
|---|---|---|
| **Xbox Game Bar** (`Win + Alt + R`) | Lo más rápido | Ya viene en Windows. Graba la ventana activa con micrófono. MP4 directo |
| **OBS Studio** | Si quieres control | Gratis. Escena + fuente de ventana + micrófono + resaltado de clics |
| **Loom** | Si prefieres compartir sin editar | Tiene plan gratuito con límite de duración |

Para una demo de cinco minutos, Game Bar alcanza. Si acabas regrabando escenas, OBS ahorra tiempo.

### Ajustes antes de dar al récord

- **1080p** y navegador al **100 % de zoom**. Las etiquetas del mapa son de 11 px: a 720p no se leen.
- **Tema oscuro** y ventana a 1440 × 900.
- **Micrófono a un palmo**, y prueba de nivel de 10 segundos. El audio malo arruina más demos que la imagen.
- **Cursor visible**, y si puedes, resaltado de clic.
- **Notificaciones de Windows apagadas** (modo concentración).

### El orden de grabación no es el del guion

Las escenas 1 a 5 necesitan **historial vacío**; la 6 necesita **intentos sembrados**. Por eso:

1. Graba las escenas **0:00 – 3:40** con el historial limpio.
2. Para, siembra los intentos (el bloque de consola del guion).
3. Graba la escena **3:40 – 5:00**.
4. Une los dos fragmentos.

Grabar del tirón obliga a enseñar la consola en mitad del vídeo, y eso rompe la ilusión de producto.

### Después

- Revisa que se lea: pausa en el fotograma del mapa y comprueba que distingues los títulos.
- **No lo subas al repositorio**: GitHub corta en 100 MB. Súbelo a YouTube (no listado o público) y enlaza desde el README.
- Si lo pones público, activa subtítulos: mucha gente lo verá sin sonido.
## Lo que no se enseña (y por qué)

| No enseñar | Motivo |
|---|---|
| El `localStorage` a medias | Rompe la ilusión de producto y no aporta |
| El código | Es una demo de producto; el código habla en el repositorio |
| Los filtros del mapa | Interesantes, pero roban 20 segundos |
| La fase 3 sin hacer | Mejor decirlo en la retro que fingir |

## Errores que arruinan una toma

- **Scroll largo en la lección.** Se ve el hueco, no el contenido.
- **Leer el feedback entero en alto.** Son dos frases; el resto se resume.
- **Silencio mientras cargas.** Narra lo que va a pasar.
- **Enseñar la pantalla vacía más de 20 segundos.** Es el punto de partida, no el tema.
