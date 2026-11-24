import io, re, sys

RUTA = "src/content/area-09-workflow-methodology.ts"
texto = io.open(RUTA, encoding="utf-8").read()

leccion = open("tmp-leccion.txt", encoding="utf-8").read()
items = open("tmp-items.txt", encoding="utf-8").read()

# 1. Lección: insertar antes del cierre del array de lecciones
marcaLec = "];\n\nexport const ITEMS_AREA_09: readonly Item[] = ["
assert marcaLec in texto, "no encuentro el cierre de LESSONS"
texto = texto.replace(marcaLec, leccion.strip() + "\n];\n\nexport const ITEMS_AREA_09: readonly Item[] = [", 1)

# 2. Ítems: insertar antes del cierre del array de ítems
marcaIte = "];\n\n/**\n * Prácticas del área."
assert marcaIte in texto, "no encuentro el cierre de ITEMS"
cuerpo = items.strip()
if cuerpo.endswith(","):
    cuerpo = cuerpo[:-1]
texto = texto.replace(marcaIte, cuerpo + "\n];\n\n/**\n * Prácticas del área.", 1)

io.open(RUTA, "w", encoding="utf-8", newline="\n").write(texto)
print("ok")
