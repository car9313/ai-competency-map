# Reglas de dependencias

La arquitectura solo existe si las dependencias se pueden verificar. Estas son las reglas, y así es como se imponen.

---

## 1. Dirección

```text
app  →  application  →  domain
          │
          └────────→  ports  ←────────  infrastructure
```

`domain` no importa nada de fuera de sí mismo salvo tipos neutrales de `shared/types`. `infrastructure` implementa los puertos que `domain` declara.

---

## 2. Reglas

| ID  | Regla                                                                                                     |
| --- | --------------------------------------------------------------------------------------------------------- |
| D1  | `features/*/domain` no importa React, Next, ni ningún módulo que toque `window`, `document` o `Date.now()`. |
| D2  | `features/*/domain` no importa de `infrastructure`. Define puertos; no los implementa.                      |
| D3  | `features/*/application` orquesta: puede importar su propio `domain`, sus puertos, y nada más.              |
| D4  | Una feature no importa el interior de otra feature. Si necesita algo, se compone en `app` o se expone un índice público. |
| D5  | `app/` contiene rutas finas: leen datos, componen componentes y delegan. Sin lógica de negocio.             |
| D6  | `shared/` solo contiene lo realmente neutral al dominio: UI, tiempo, tipos. Nunca reglas de negocio.       |
| D7  | El contenido (`src/content`) no importa código de UI. Es dato.                                             |
| D8  | Ningún módulo fuera de `shared/time` llama a `Date.now()` ni construye `new Date()` sin argumento.          |

---

## 3. Cómo se imponen

Con ESLint, porque es la puerta que ya existe y ya bloquea la fusión. No se añade `dependency-cruiser` para ocho reglas que caben en una configuración.

```jsonc
// eslint.config.mjs (extracto)
{
  files: ["src/features/*/domain/**/*.ts"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        { group: ["react", "react-dom", "next/*"], message: "D1: el dominio no conoce la UI." },
        { group: ["**/infrastructure/**"], message: "D2: el dominio declara puertos, no los implementa." },
        { group: ["@/shared/ui/**"], message: "D1: el dominio no conoce componentes." }
      ]
    }],
    "no-restricted-properties": ["error", {
      object: "Date", property: "now", message: "D8: inyecta el puerto Clock."
    }],
    "no-restricted-globals": ["error",
      { name: "window", message: "D1: el dominio corre en Node." },
      { name: "localStorage", message: "D2: usa el puerto AttemptStore." }
    ]
  }
}
```

Una violación no es un aviso: es un build roto. Y como el mismo `pnpm lint` corre en local, el error aparece en el editor, no en la revisión.

---

## 4. Ejemplo de violación

```ts
// src/features/assessment/domain/schedule.ts
import { useState } from 'react';           // ❌ D1

export function nextDue(schedule: ItemSchedule) {
  return new Date(Date.now() + ...);        // ❌ D8
}
```

```
error  D1: el dominio no conoce la UI
error  D8: inyecta el puerto Clock
```

La versión correcta:

```ts
// src/features/assessment/domain/schedule.ts
export function nextDue(schedule: ItemSchedule, now: IsoDate): IsoDate {
  return addDays(now, schedule.intervalDays);
}
```

El dominio se vuelve trivial de testear porque no tiene tiempo, ni navegador, ni almacenamiento.

---

## 5. Excepciones

Existen dos, y ambas están escritas:

1. **`shared/time/clock.ts`** puede usar `Date`. Es el único sitio del proyecto donde el tiempo es real.
2. **`app/`** puede importar de `features/*/presentation` directamente, porque las rutas son el punto de composición. Lo que no puede es importar `domain` para saltarse `application`.

Cualquier excepción nueva requiere un ADR. Si aparece una tercera excepción, la regla estaba mal formulada y hay que revisarla, no ampliarla.

---

## 6. Por qué estas reglas y no más

Cada regla de este documento existe por un fallo concreto que ya ocurrió en el proyecto anterior:

| Regla | Fallo que evita                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------ |
| D1–D2 | Un dominio que solo se puede probar arrancando la app entera                                            |
| D4    | Features acopladas en las que tocar la evaluación obliga a tocar el mapa                                |
| D5    | Rutas con lógica de negocio que no se reutiliza ni se prueba                                            |
| D6    | Un `shared/` que se convierte en el cajón de sastre donde nadie sabe qué vive                            |
| D8    | Tests que pasan o fallan según la hora a la que se ejecutan                                             |

No hay reglas para "que el código sea bonito". Solo para que sea verificable.
