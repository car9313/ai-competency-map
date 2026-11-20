/**
 * Identificador estable del dispositivo.
 *
 * Cada intento lo lleva para que una futura sincronización sepa de dónde vino. Se genera
 * una vez y se guarda; si el almacenamiento no está disponible, se genera uno nuevo por
 * sesión, que es lo único honesto que se puede hacer sin memoria.
 */
const DEVICE_KEY = 'acm:device:v1';

export function getDeviceId(storage: Storage | undefined = safeStorage()): string {
  const generated = `dev-${randomId()}`;

  if (!storage) return generated;

  try {
    const existing = storage.getItem(DEVICE_KEY);

    if (existing) return existing;

    storage.setItem(DEVICE_KEY, generated);

    return generated;
  } catch {
    return generated;
  }
}

/** UUID v4 con degradación: `crypto.randomUUID` no existe en navegadores antiguos. */
export function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
