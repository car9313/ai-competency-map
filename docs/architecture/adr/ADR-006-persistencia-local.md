# ADR-006 — Persistencia local en la v1, con el puerto preparado para cuentas

- **Estado:** aceptado
- **Ámbito:** persistencia, producto, coste
- **Relacionado con:** [ADR-003](ADR-003-progreso-derivado.md) (progreso derivado), [ADR-001](ADR-001-nextjs-estatico.md) (exportación estática)

## Contexto

En la v1 no hay cuentas: ni autenticación, ni servidor, ni base de datos, ni presupuesto. Pero hay evidencia que conservar entre visitas, porque sin historial no hay repaso espaciado y el producto no existe.

A la vez, el autor ha manifestado la intención de añadir autenticación y uso multiusuario «más adelante». Esa intención es razonable, pero construirla hoy significaría asumir coste, identidad, autorización, privacidad y borrado de datos **antes de tener un solo usuario**.

## Decisión

**La v1 persiste en `localStorage`, detrás del puerto `AttemptStore`.** La base de datos es un adaptador futuro, no una reescritura.

```ts
export interface AttemptStore {
  append(attempts: Attempt[]): Promise<void>; // idempotente por Attempt.id
  list(): Promise<Attempt[]>;
}

export class LocalStorageAttemptStore implements AttemptStore { /* ~20 líneas */ }
// futuro: export class ServerAttemptStore implements AttemptStore { ... }
```

Se guarda **una sola entidad** (`Attempt`), porque las programaciones y los estados son derivados ([ADR-003](ADR-003-progreso-derivado.md)).

Además, se incluye desde la v1:

- **Exportar e importar progreso** como JSON descargable. Es la mitigación del riesgo real de `localStorage`: que el usuario limpie los datos del navegador y pierda su historial.
- `Attempt.id` como UUID generado en el cliente y `Attempt.deviceId`, para que la futura sincronización sea una unión y no una migración.

## Alternativas consideradas

| Alternativa                        | A favor                                        | En contra                                                                 |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| **IndexedDB**                      | Más capacidad, asíncrono, estructurado          | API incómoda y asíncrona para unos kilobytes; no resuelve nada real aquí   |
| **Cookies**                        | Se envían al servidor (útil algún día)          | 4 KB y viajan en cada petición; no hay servidor al que enviarlas           |
| **Base de datos desde la v1**      | Multiusuario desde el principio                 | Coste, auth, autorización, privacidad, despliegue no estático: cinco problemas antes del primer usuario |
| **Sin persistencia (solo sesión)** | Cero complejidad                                | Sin historial no hay repaso espaciado; el producto pierde su tesis         |
| **Fichero local + CLI**            | Determinista, sin navegador                     | No es una aplicación web; mata la demo                                     |

## Consecuencias

**Positivas**

- Coste cero y despliegue estático.
- La demo funciona sin conexión, sin configuración y sin cuenta.
- Toda la persistencia está en un archivo; el resto del sistema no sabe dónde viven los datos.
- El día de las cuentas, el cambio es un adaptador y una línea de composición.

**Negativas y costes**

- Los datos son de un navegador. Cambiar de dispositivo no sincroniza nada.
- El usuario puede borrarlos sin querer. Mitigado con exportar/importar, no eliminado.
- Si el producto crece, habrá que **migrar** los intentos locales al servidor en el primer inicio de sesión. Es trabajo real, aunque acotado a una función.

## Riesgos de `localStorage` y mitigaciones

| Riesgo                                  | Impacto                                  | Mitigación                                                        |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| Cuota ~5 MB                             | Irrelevante: cientos de intentos son KB  | Ninguna; se vigila el crecimiento                                 |
| El usuario limpia los datos del navegador | Pérdida total del progreso              | Exportar/importar JSON, y aviso en la interfaz                    |
| Modo privado o almacenamiento bloqueado | La aplicación no persiste                | Detección al arrancar y aviso explícito; la sesión sigue funcionando |
| API síncrona                            | Bloquea el hilo principal                | Escrituras pequeñas y diferidas; el puerto es asíncrono por diseño |
| Accesible desde JavaScript de la página | Manipulable por el propio usuario        | Aceptable: los datos son suyos y no hay nada que proteger         |

## Condición de activación de cuentas

Se implementa autenticación cuando se cumplan **dos de estas tres**:

1. Alguien que no es el autor usa el producto **más de una semana**.
2. Se pide explícitamente usarlo en otro dispositivo.
3. El autor decide que la pieza necesita demostrar un backend para su objetivo profesional.

La tercera es la más probable, y conviene decirla en voz alta: si el motivo es el portfolio y no la necesidad, **el ADR que la justifica debe decirlo**, en lugar de fingir que era una necesidad del usuario.

## Criterio de revisión

Se sustituye por un ADR nuevo cuando se active la primera condición. La forma del puerto y la inmutabilidad de los intentos no deberían cambiar.
