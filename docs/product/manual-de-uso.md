# Manual de uso

Para quien abre la app por primera vez y **no programa**. No hace falta saber nada técnico:
aquí solo se explica qué botones hay y qué ocurre al pulsarlos.

La misma guía está dentro de la app, en `/guia`, por si prefieres leerla allí o enviarla a
alguien.

---

## 1. Para qué sirve

Es un mapa de **39 competencias de ingeniería de IA**, agrupadas en ocho áreas. Cada
competencia tiene una lección corta y ocho preguntas de opción múltiple.

La diferencia con casi cualquier otra app de estudio: **aquí no marcas casillas.** No existe
un botón de «lección completada». Tu nivel en cada competencia se calcula a partir de lo que
has respondido, cuántas veces y con cuánta seguridad.

Si aciertas los ocho ítems, la competencia queda consolidada. Si fallas algo que ya sabías,
baja a «en riesgo». Nunca se bloquea nada que ya hubieras alcanzado.

---

## 2. Empezar en tres pasos

1. **Decide por dónde entrar.** Si ya sabes algo del tema, ve a **Diagnóstico** y responde
   doce preguntas repartidas por todo el mapa. Lo que aciertes abre lo que dependa de ello.
2. **Si empiezas de cero**, abre el **Mapa** y busca la competencia que tiene el botón
   «Empezar». Es la raíz del grafo.
3. **Lee la lección y pulsa «Comprobar».** Son ocho preguntas sobre lo que acabas de leer.
   No hace falta memorizar: la app te las volverá a preguntar en el momento adecuado.

Cada competencia necesita que tengas *alguna* evidencia en las que dependen de ella. No hace
falta dominarlas: responder bien una sola pregunta de un prerrequisito ya la desbloquea.

---

## 3. Responder una pregunta

Cada pregunta tiene tres partes:

1. **Elige una opción.** Solo hay una correcta.
2. **Di cómo de seguro estás**: «Seguro» o «Con dudas». No es decorativo: acertar con dudas
   hace que la pregunta vuelva antes que acertar con seguridad. La app desconfía de los
   aciertos por suerte.
3. **Pulsa «Comprobar».**

Después verás si has acertado, por qué tu opción era o no era la correcta, y cuándo volverá
esa pregunta. El orden de las opciones cambia cada vez, así que no sirve memorizar «la
segunda».

Fallar no bloquea nada: la pregunta vuelve a la cola y puedes seguir practicando en ese
mismo momento.

---

## 4. Si no lo sabes: pistas graduadas

Debajo de las opciones hay dos ayudas, de menos a más:

| Pista | Qué hace |
|---|---|
| **Pedir una pista** | Muestra el error típico de esa competencia. No dice cuál es la respuesta |
| **Descartar una opción** | Tacha una opción incorrecta y explica por qué ese razonamiento no vale |

No hay más pistas después de esas dos. El uso de pistas queda anotado en el intento: acertar
con ayuda no es lo mismo que acertar solo.

---

## 5. Qué significan los estados

| Estado | Qué significa |
|---|---|
| **Sin evidencia** | No has respondido nada de esta competencia. No dice que no sepas: dice que no hay datos |
| **En aprendizaje** | Has empezado y aún falla algo. Es el estado normal al principio |
| **Casi** | Has acertado casi todo: te falta un ítem para consolidar |
| **Consolidada** | Has demostrado los ocho ítems con aciertos repartidos en el tiempo |
| **En riesgo** | Ya la dominabas y has fallado algo reciente. No pierdes nada: vuelve a la cola antes |

---

## 6. Por qué te vuelve a preguntar

La pantalla **Hoy** es tu cola de repaso: las preguntas que toca revisar hoy. Aparecen
cuando están a punto de olvidarse, no cuando tú decides.

Cada acierto espacia la siguiente pregunta un poco más: tres días, luego una semana, luego
más. Cada fallo la trae de vuelta mañana. Es la idea del repaso espaciado.

No hay rachas, ni metas diarias, ni puntos. Si un día no entras, no pasa nada: la cola sigue
ahí esperándote.

---

## 7. Repasar solo tus fallos

En **Repaso** hay dos pestañas:

- **La cola de hoy**: lo que vence.
- **Solo mis fallos**: las preguntas cuyo último intento fue incorrecto, sin esperar a que
  venzan.

Útil cuando tienes cinco minutos y prefieres cerrar huecos. El número de fallos pendientes
aparece también en la barra lateral.

---

## 8. Tus notas

Al final de cada lección hay un cuadro de texto. Se guarda solo, un segundo después de que
dejes de escribir, y verás «guardado a las 17:15».

Las notas **no cuentan como evidencia**: no cambian tu nivel ni adelantan repasos. Son para
ti. Viajan en el archivo de progreso al exportar.

---

## 9. El mapa

Dos vistas, con las pestañas de arriba:

- **Mapa**: el grafo. Cada círculo es una competencia y cada flecha dice «esto depende de
  aquello». Arrastra para moverlo, rueda para acercar.
- **Tarjetas**: lo mismo en lista, agrupado por área. Es la vista buena en pantallas
  pequeñas, donde el grafo no se lee.

En las dos puedes filtrar por **área**, por **capa** (núcleo, servicio, interfaz) y por
**estado**. Y hay un buscador que mira dentro del texto de las lecciones: sirve para
encontrar «idempotencia» sin saber en qué competencia vive.

> Un área no es un curso que se completa: es una etiqueta para navegar. El orden de verdad lo
> marca el grafo, que salta de un área a otra cuando hace falta.

---

## 10. Ir a un objetivo

Si tu meta es concreta —montar un asistente con tus documentos, por ejemplo—, en **Rutas**
eliges una competencia y ves el camino completo: qué hay que saber antes, en orden.

Cada paso de la ruta es una competencia que puedes abrir y comprobar. Es la forma de no
perderse en un mapa de 39 nodos.

---

## 11. El diagnóstico

Doce preguntas repartidas por todo el mapa, sin nota. Cada respuesta cuenta como un intento
normal: lo que aciertes desbloquea lo que dependa de ello y lo que falles vuelve mañana.

Sirve para no empezar por la raíz si ya sabes cosas. Con doce preguntas no se mide todo, así
que el resultado es un punto de partida, no un certificado.

---

## 12. Tu historial

Cada intento queda guardado: qué pregunta, qué contestaste, si acertaste, cuánta seguridad
declaraste y cuándo. En **Historial** ves la lista y, en cada competencia, la explicación de
por qué está en el estado en que está.

Es lo que permite que la app se justifique: ningún nivel aparece por arte de magia, se puede
rastrear hasta las respuestas que lo produjeron.

---

## 13. Tu copia de seguridad

El progreso se guarda **en tu navegador**, no en un servidor. Si borras los datos del
navegador, se pierde.

En **Acerca** hay tres botones:

| Botón | Qué hace |
|---|---|
| **Exportar** | Descarga un archivo con tus intentos y tus notas |
| **Importar** | Recupera ese archivo en este u otro navegador |
| **Borrar** | Elimina todo, sin vuelta atrás |

Conviene exportar de vez en cuando, y siempre antes de cambiar de ordenador o de limpiar el
navegador.

---

## 14. En el móvil y sin conexión

La app se puede instalar como una aplicación normal:

- **Chrome o Edge de escritorio**: icono de instalar en la barra de direcciones.
- **Android**: menú de tres puntos → «Instalar aplicación».
- **iPhone**: Compartir → «Añadir a pantalla de inicio».

Una vez instalada funciona sin conexión: las páginas que ya has abierto se guardan, y las
ocho secciones principales están disponibles desde la primera visita. Las competencias
concretas se guardan al visitarlas.

Si actualizan la app y ves algo raro, cierra y vuelve a abrir: la versión nueva se descarga
sola.

---

## 15. Teclado y lector de pantalla

- Todo se puede usar solo con teclado. Al principio de cada página hay un enlace «Saltar al
  contenido».
- Los cambios importantes (el resultado de una respuesta, el recuento del buscador) se
  anuncian con voz, sin mover el foco.
- Arriba a la derecha hay un botón para cambiar entre tema claro y oscuro.
- El zoom del navegador (`Ctrl` + `+`) aumenta el texto sin romper el diseño.

---

## 16. Lo que esta app no hace

- **No hay cuentas ni contraseñas.** No hay nada que registrar.
- **No se paga nada** y no hay versión de pago.
- **No hay rachas, ni puntos, ni medallas.** No se mide tu constancia; se mide lo que
  demuestras saber.
- **No hay certificados.** Lo que hay es evidencia de tus respuestas, que puedes exportar.
- **Las preguntas no las corrige una IA.** Son de opción múltiple con una explicación por
  cada opción: la misma respuesta se corrige igual siempre.

---

## 17. Dudas frecuentes

**¿Por qué no puedo hacer la comprobación de una competencia?**
Porque te falta alguna evidencia en las competencias de las que depende; la página te dice
cuáles. La lección se puede leer igualmente: lo que se bloquea es la comprobación, no el
acceso.

**¿Qué pasa si fallo una competencia que ya tenía consolidada?**
Baja a «en riesgo» y sus preguntas vuelven antes. No pierdes el acceso a nada ni vuelves a
empezar de cero.

**¿Cuántas preguntas hay?**
312, ocho por cada una de las 39 competencias. Cada una tiene tres opciones con su
justificación.

**¿Puedo hacer trampa mirando el código?**
Sí: el contenido es abierto y está publicado en `/contenido.json`. No es un examen, es
material de estudio. Si buscas la respuesta en lugar de pensarla, el único perjudicado es tu
repaso.

**¿Se guarda algo de mí en un servidor?**
No. No hay servidor ni analítica. Todo vive en el almacenamiento de tu navegador.

**¿Puedo usar el contenido en otro sitio?**
Sí, con licencia CC BY-SA 4.0: puedes reutilizarlo citando el origen y compartiendo las
obras derivadas con la misma licencia.
