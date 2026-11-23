# Retrospectiva

Lo que se construyó, lo que costó y lo que haría distinto. Escrito para quien
evalúe el proyecto, no para quien lo celebre.

---

## Estado final

| | |
|---|---|
| Competencias publicadas | 39 de 39, en 8 áreas |
| Lecciones | 39 |
| Ítems de evaluación | 312, con justificación por distractor |
| Tests | 186 |
| Gates en CI | 6 (tipos, lint, tests, contenido, build, accesibilidad) |
| Páginas estáticas | 85 |
| Coste de infraestructura | 0 |
| Backend, cuentas, claves de API | Ninguno, por diseño |

---

## Las cinco decisiones que sostienen el producto

### 1. El progreso se deriva, no se guarda

La única entidad persistida es el registro append-only de intentos. El estado de
una competencia, la cola de repaso y las fechas son **proyecciones** que se
calculan cada vez.

Consecuencia práctica: cambiar las reglas del planificador no corrompe a nadie.
Se despliegan las reglas nuevas y el historial se reinterpreta solo. Con una
casilla guardada, ese mismo cambio exigiría una migración y una decisión sobre
qué hacer con los datos viejos.

### 2. La unidad de evaluación es el ítem, no la lección

Una competencia no se marca como sabida. Se comprueba ítem a ítem, y solo se
considera consolidada cuando **todos** sus ítems tienen el último intento
correcto. No hay porcentaje: un 75 % puede significar «falló el fácil» o «falló
el que importa», y son estados opuestos.

### 3. La confianza es un eje, no un adorno

Acentuar con dudas vuelve antes (al día siguiente) que acentuar con seguridad (a
los tres días). Es la diferencia entre recordar y saber, y es lo que separa un
sistema de repaso de un contador de aciertos.

### 4. Leer nunca se bloquea; comprobar sí

Solo la comprobación exige evidencia en los prerrequisitos. La lectura es libre.
Al principio se planteó bloquear por temas completos; el análisis del grafo lo
descartó: **20 de 49 aristas (41 %) cruzan áreas** y solo 1 de 8 áreas es
autocontenida. Bloquear por tema habría dejado el mapa intransitable.

### 5. El contenido es dato validado, no maquetación

Lecciones e ítems son registros comprobados por un linter (R1–R7) en CI. `published:
true` es una promesa contractual: si falta la lección o los ítems, el build falla.

Durante la construcción esto se demostró solo: al publicar doce competencias antes
de conectar sus archivos, el linter saltó con **24 errores**. Ninguna herramienta
de las que había antes lo habría visto.

---

## Lo que costó más

### El SEO del mapa, y no por SEO

La primera versión ponía el mapa entero detrás de un componente de cliente con
`useSearchParams`. El resultado: `out/mapa.html` pesaba **14,7 KB** con un
esqueleto vacío y el grafo se montaba al hidratar. El fallo se detectó al mirar el
tamaño del HTML generado, no al navegar.

La corrección fue separar el contenido en servidor (`MapContent`) y dejar una isla
de cliente solo para el diagrama. El HTML pasó a **101,7 KB** con el grafo dentro.

Lección: la verificación que importa no es «se ve bien en el navegador», es «qué
recibe exactamente quien no ejecuta JavaScript».

### Los nodos del SVG no respondían al ratón

Dos fallos superpuestos: `setPointerCapture` entregaba el `click` al SVG en lugar
del enlace, y el área pulsable era un círculo de 11 px. Se arregló con un
`<rect>` transparente de 112×58 por nodo y comprobando que el evento no venía de
un enlace.

Ningún test unitario lo habría detectado. Lo detectó un clic real en un navegador
real.

### La accesibilidad destapó dieciséis problemas

Ninguno era visible a simple vista. El más interesante: el violeta de marca
(`#8b5cf6`) hacía dos trabajos incompatibles —texto sobre el fondo y relleno bajo
texto blanco—. Blanco sobre ese violeta da **3,5:1** y el mínimo es 4,5. Aclararlo
para que funcionara como texto habría empeorado el relleno. Hubo que separarlo en
dos tokens.

Y uno que solo aparece con los dedos: **el enlace de salto estaba roto en
silencio**. El navegador desplazaba la vista, pero el foco se quedaba en `body`, así
que el siguiente `Tab` volvía al principio. axe lo daba por correcto porque el
enlace es válido.

---

## Lo que haría distinto

### Empezar el contenido antes

La infraestructura se terminó antes que el contenido, y eso dejó el producto
enseñando 36 nodos grises durante semanas. Funcionaba, pero no convencía.

Aprendido: en un producto cuyo valor es el currículo, **la infraestructura sin
contenido no demuestra nada**. Debí escribir dos áreas completas antes de pulir
el quinto detalle del mapa.

### Escribir el texto junto al comportamiento, no después

Dos veces escribí una frase que el sistema no cumplía:

- «Practicar ahora no adelanta nada» — falso: cada intento recalcula la fecha.
- «Las demás aparecen como próximas» — falso cuando ya estaban publicadas las 39.

Las dos las detecté **al releer el texto**, no al probar. Escribir la frase forma
parte de implementar el comportamiento; si la frase no se puede escribir con
verdad, falta comportamiento o sobra promesa.

### Gates intermitentes: arreglarlos el primer día

La auditoría de accesibilidad falló tres veces por el entorno, no por el código.
Cada vez lo anoté como «flaky» y seguí. Un gate que falla al azar no protege: se
acaba ignorando. La corrección fue trivial —reintento por ruta y `waitUntil:
'load'` en lugar de `networkidle`— y hubiera costado lo mismo la primera vez.

---

## Lo que no se hizo, y por qué

| No hecho | Motivo |
|---|---|
| Racha y meta diaria | Miden constancia, no evidencia. Premiar días seguidos es la lógica de la que el producto se aparta |
| Porcentaje de acierto por lección | Ignora la confianza, la antigüedad y no dice qué hacer. Se sustituyó por el estado de cada ítem |
| IA en el producto | El motor es determinista a propósito: un sistema que evalúa no debería ser un oráculo |
| Backend y cuentas | El objetivo era un producto con coste cero y sin superficie de datos personales |
| Inglés | El público de la v1 es hispanohablante; se decide después, no antes |
| Superficie MCP | Interesante para portfolio, pero no resuelve nada que el producto necesite hoy |

---

## Lo que queda

1. **Guion de demo grabado.** El guion escrito está en [`demo-script.md`](demo-script.md); falta la toma.
2. **Despliegue público.** El repositorio ya es público; falta publicar la build estática en Vercel para tener una URL que enseñar sin clonar.
3. **Lectores de pantalla reales.** axe verifica nombres y roles; no verifica si el orden de lectura tiene sentido al escucharlo.
4. **Zoom al 200 % y `prefers-contrast`.** Comprobado que no hay desborde a 375 px, que no es lo mismo.

---

## Qué demuestra este proyecto

No que se pueda construir un mapa de competencias: eso es la parte fácil.

Demuestra que se puede **tomar una decisión de dominio y sostenerla hasta el
final** —el progreso se deriva— y que esa decisión se nota en cada esquina: en
que las fechas se justifican, en que el estado no se puede escribir, en que
cambiar las reglas no corrompe a nadie.

Y demuestra, sobre todo, que el trabajo honesto incluye lo que no se hizo: las
rachas que sobran, el porcentaje que engaña, el texto que mentía y hubo que
reescribir.
