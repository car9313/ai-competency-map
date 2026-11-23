import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// El plugin exporta su config de varias formas según la versión: se tolera cualquiera.
const hooksRules = reactHooks.configs?.recommended?.rules ?? {};

/**
 * Reglas D1, D2 y D8 (docs/architecture/dependency-rules.md).
 * Una violación aquí es un build roto, no un aviso.
 */
const DOMAIN_IMPORT_PATTERNS = [
  {
    group: ['react', 'react-dom', 'react/*', 'react-dom/*', 'next', 'next/*'],
    message: 'D1: el dominio no conoce la UI.',
  },
  {
    group: ['**/infrastructure/**', '**/presentation/**'],
    message: 'D2: el dominio declara puertos, no los implementa.',
  },
  {
    group: ['@/shared/ui/**', '@/app/**'],
    message: 'D1: el dominio no conoce componentes ni rutas.',
  },
];

export default tseslint.config(
  {
    // public/** son activos que se copian tal cual (entre ellos el service worker, que se
    // ejecuta en un contexto con sus propios globales). No se lintean como código fuente.
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'public/**',
      'next-env.d.ts',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...hooksRules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Scripts y configuración: corren en Node.
    files: ['scripts/**/*.{mjs,ts}', '*.config.mjs', '*.config.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    // Dominio puro: sin UI, sin infraestructura, sin tiempo ambiente.
    files: ['src/features/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: DOMAIN_IMPORT_PATTERNS }],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'D8: inyecta el puerto Clock.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'D8: inyecta el puerto Clock.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'D1: el dominio corre en Node.' },
        { name: 'document', message: 'D1: el dominio corre en Node.' },
        { name: 'localStorage', message: 'D2: usa el puerto AttemptStore.' },
        { name: 'sessionStorage', message: 'D2: usa el puerto AttemptStore.' },
      ],
    },
  },
);
