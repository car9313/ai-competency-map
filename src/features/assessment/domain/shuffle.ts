/**
 * Barajado determinista con semilla.
 *
 * Por qué existe: si el orden de las opciones fuera aleatorio sin control, un intento
 * no se podría reproducir y los tests no serían deterministas. La semilla se guarda
 * junto con `presentedOptionIds` en el intento (invariante I11).
 *
 * El PRNG es Mulberry32: rápido, pequeño y **no criptográfico**. Aquí no hay nada que
 * proteger: solo hace falta que sea determinista y que reparta razonablemente.
 */

/** PRNG de 32 bits. Documentado como no criptográfico a propósito. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** FNV-1a de 32 bits: convierte un texto (por ejemplo un id) en una semilla estable. */
export function hashSeed(text: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/**
 * Devuelve una permutación determinista de `items`.
 *
 * No modifica la entrada. Con la misma semilla y la misma lista, el resultado es
 * siempre el mismo, en cualquier máquina y en cualquier orden de ejecución.
 */
export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const remaining = [...items];
  const shuffled: T[] = [];
  const random = mulberry32(seed);

  while (remaining.length > 0) {
    const index = Math.floor(random() * remaining.length);
    const [picked] = remaining.splice(index, 1);

    // `splice` devuelve un array; con noUncheckedIndexedAccess hay que comprobarlo.
    if (picked !== undefined) {
      shuffled.push(picked);
    }
  }

  return shuffled;
}

/** Baraja los ids de las opciones de un ítem, que es el uso real del módulo. */
export function shuffleOptionIds(options: readonly { id: string }[], seed: number): string[] {
  return shuffleWithSeed(
    options.map((option) => option.id),
    seed,
  );
}
