# Guion de demo

Cuatro minutos, siete escenas, una sola toma y sin sembrar datos. Es el recorrido que se graba
para portfolio, y también la prueba de que el producto se sostiene solo.

**Qué ha cambiado respecto al guion anterior:** al fallar a propósito un ítem, la cola de
fallos queda con contenido de inmediato, así que las escenas ya no necesitan dos historiales
distintos ni una pausa para pegar código en la consola. Lo que antes era un corte ahora es una
toma.

**Antes de grabar:**

1. `/acerca` → **Borrar** y recarga.
2. Cambia el tema y vuelve: confirma que responde antes de dar al récord.
3. Comprueba que la instancia es la de producción, no el servidor local.

Si prefieres grabar con progreso previo (para que el mapa tenga color), ve al apéndice: siembra
tres intentos correctos y haz las escenas 1 y 2 con ese estado.

---

## 0:00 – 0:15 · El problema

**Pantalla:** `/`

> «Casi todas las plataformas de aprendizaje guardan una casilla: "lección completada". Eso es
> una afirmación del usuario. Aquí no hay casilla: el estado se calcula a partir de lo que has
> respondido.»

**Qué se ve:** «Nada vence hoy» y la sesión vacía. Es el punto de partida honesto, no un fallo.

---

## 0:15 – 0:50 · El mapa

**Pantalla:** `/mapa`

> «Cincuenta y tres competencias, diez áreas, ordenadas por prerrequisitos. No es una lista: es
> un grafo. Cada nivel depende del anterior, y el mapa te dice qué falta para poder comprobar
> cada nodo.»

**Haz:** pasa el cursor por un nodo de nivel 2.

> «Al pasar por encima se resaltan sus prerrequisitos y sus dependencias.»

**Haz:** clic en **Tarjetas**.

> «La misma información en texto, porque un grafo no es accesible para todo el mundo. Esta vista
> es la versión completa, no un resumen.»

---

## 0:50 – 1:40 · Comprobar, y fallar a propósito

**Haz:** abre **Fronteras entre IA, ML y deep learning** y baja a **Comprobar**.

**Haz:** lee la pregunta en alto y **elige a propósito la opción equivocada** —la del modelo—.

> «Voy a fallar a propósito, porque el fallo es donde se ve lo que hace distinto a esto.»

**Pulsa Comprobar y señala el bloque de feedback.**

> «No me dice solo "incorrecto". Me dice por qué esa opción es un error de razonamiento, y por
> qué la correcta lo es. Cada distractor tiene su propia explicación, en los cuatrocientos
> veintiséis ítems.»

> «Y vuelve mañana, no en tres días: el intervalo depende de si acerté y de cuánto confiaba.»

---

## 1:40 – 2:05 · Solo mis fallos

**Pantalla:** `/repaso?modo=fallos`

> «Ese fallo que acabo de cometer está aquí ya. No hace falta esperar a que venza: los fallos se
> pueden repasar en cuanto ocurren.»

**Haz:** señala el contador de fallos pendientes.

> «Cuando lo acierte, saldrá de esta cola y volverá a su fecha normal.»

---

## 2:05 – 2:30 · El estado se calcula solo

**Pantalla:** `/mapa/tarjetas`

> «No he marcado nada como completado. El nodo ha cambiado solo, porque el estado es una
> proyección de los intentos, no un campo que se guarde.»

**Haz:** señala el chip del nodo que acabas de tocar.

> «Y los siguientes se han abierto solos: basta con haber empezado un prerrequisito, no hace
> falta dominarlo. Fallar también cuenta como haber empezado, y eso es deliberado: el desbloqueo
> no depende del acierto, para que un fallo no te encierre.»

---

## 2:30 – 3:20 · El taller

**Pantalla:** `/talleres`

> «Hasta aquí, leer y comprobar. Esto es lo otro: talleres que producen un artefacto.»

**Haz:** baja al taller del harness y señala el bloque de entregable.

> «Montar un harness mínimo alrededor de un agente: registro que deniega por defecto, carpeta
> propia, topes, y una puerta antes del efecto irreversible. El entregable no es un resumen: es
> el harness funcionando y una nota de qué barrera detuvo cada intento de salirse.»

**Haz:** señala las trampas.

> «Y las trampas son de las que aparecen de verdad. Un sandbox sin registro de efectos reanuda a
> ciegas: te protege de escapar, no de duplicar un envío.»

**Haz:** señala la fecha de verificación del taller de skills.

> «El taller de skills está escrito contra la documentación real de OpenCode, y lleva la fecha en
> la que la comprobé. Eso caduca, y el producto lo dice en vez de fingir que no.»

---

## 3:20 – 3:50 · Lo que no hace

**Pantalla:** `/repaso` sin ítems vencidos, o `/herramientas`.

> «Dos cosas que no hace, y prefiero decirlas yo: no corrige las prácticas ni los talleres —hay
> rúbrica, pero la comprobación es tuya— y las cincuenta y una fichas de herramientas siguen sin
> fecha de verificación, porque no he abierto cada página. El producto lo marca en vez de
> esconderlo.»

---

## 3:50 – 4:10 · Cierre técnico

**Pantalla:** `/acerca` → **Exportar**.

> «Todo el progreso es un JSON: intentos append-only, sin cuentas y sin backend. Se puede
> exportar, importar y recalcular desde cero, porque el estado no está guardado en ningún sitio.
> El producto entero es estático, cuesta cero y no tiene claves de API.»

---

# Cómo grabarlo

### Herramienta

| Opción | Cuándo | Notas |
|---|---|---|
| **Xbox Game Bar** (`Win + Alt + R`) | Lo más rápido | Ya viene en Windows. Graba la ventana activa con micrófono. MP4 directo |
| **OBS Studio** | Si quieres control | Gratis. Escena + fuente de ventana + micrófono + resaltado de clics |
| **Loom** | Si prefieres compartir sin editar | Plan gratuito con límite de duración |

Para cuatro minutos, Game Bar alcanza. Si acabas regrabando escenas, OBS ahorra tiempo.

### Ajustes antes de dar al récord

- **1080p** y navegador al **100 % de zoom**. Las etiquetas del mapa son de 11 px: a 720p no se leen.
- **Tema oscuro** y ventana a 1440 × 900.
- **Micrófono a un palmo**, con prueba de nivel de 10 segundos. El audio malo arruina más demos que la imagen.
- **Cursor visible**, y si puedes, resaltado de clic.
- **Notificaciones de Windows apagadas** (modo concentración).

### Después

- Pausa en el fotograma del mapa y comprueba que distingues los títulos.
- **No lo subas al repositorio**: GitHub corta en 100 MB. Súbelo a YouTube (no listado o público) y enlaza desde el README.
- Si lo pones público, activa subtítulos: mucha gente lo verá sin sonido.

---

# Lo que no se enseña (y por qué)

| No enseñar | Motivo |
|---|---|
| El `localStorage` y la consola | Rompe la ilusión de producto. Si necesitas datos, usa el apéndice y graba aparte |
| El código | Es una demo de producto; el código habla en el repositorio |
| Los filtros del mapa | Interesantes, pero roban veinte segundos |
| La PWA instalada | Vale la pena mencionarla, no enseñarla: son quince segundos de pantallas de sistema |

# Errores que arruinan una toma

- **Scroll largo en la lección.** Se ve el hueco, no el contenido.
- **Leer el feedback entero en alto.** Son dos frases; el resto se resume.
- **Silencio mientras cargas.** Narra lo que va a pasar.
- **Enseñar la pantalla vacía más de quince segundos.** Es el punto de partida, no el tema.
- **Fingir que el taller se corrige solo.** La rúbrica es para uno mismo; decirlo suma.

---

# Apéndice · Grabar con progreso previo

Si quieres que el mapa tenga color desde el primer segundo, siembra tres intentos correctos antes
de la toma. Consola (`F12`) en la página de producción:

```js
const intento = (id, itemId, dias) => ({
  id,
  deviceId: 'dev',
  itemId,
  answeredAt: new Date(Date.now() - dias * 86400000).toISOString(),
  selectedOptionId: 'a',
  correct: true,
  confidence: 'confident',
  presentedOptionIds: ['a', 'b', 'c'],
  durationMs: 3000,
});

localStorage.setItem(
  'acm:attempts:v1',
  JSON.stringify([
    intento('d1', 'ml-rules-vs-model', 6),
    intento('d2', 'ctx-token-unit', 5),
  ]),
);
location.reload();
```

Esto deja dos ítems vencidos y tres nodos con evidencia. Los identificadores están comprobados
contra el catálogo actual; si algún día cambian, `/repaso` saldrá vacío y sabrás por qué.

Si siembras, **no uses luego la escena de «solo mis fallos»**: sembrar aciertos no crea fallos, y
la cola aparecería vacía. Elige una de las dos formas de grabar, no las dos.
