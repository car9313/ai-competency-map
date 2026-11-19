import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // El dominio es puro: no necesita DOM. Se añade jsdom cuando haya componentes.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
