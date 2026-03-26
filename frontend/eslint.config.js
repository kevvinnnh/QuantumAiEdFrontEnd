import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // ── React ──────────────────────────────────────────────────────
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ── Type assertions & escape hatches — BANNED ─────────────────
      // Ban `as` type assertions entirely (forces proper typing)
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      // Ban @ts-ignore (use @ts-expect-error with a description if truly needed)
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ],
      // Ban `!` non-null assertions (another form of type escape)
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Ban explicit `any` (forces proper types)
      '@typescript-eslint/no-explicit-any': 'error',
      // Ban `any` leaking from unsafe operations
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // ── Async safety (agents forget to await) ─────────────────────
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // ── Exhaustiveness & correctness ──────────────────────────────
      // Force handling every case in switch on union/enum types
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      // Catch implicit truthy/falsy coercions (0, "", NaN bugs)
      '@typescript-eslint/strict-boolean-expressions': 'warn',

      // ── Code quality ──────────────────────────────────────────────
      // Strict equality only
      'eqeqeq': ['error', 'always'],
      // No var — const/let only
      'no-var': 'error',
      // Prefer const when not reassigned
      'prefer-const': 'error',
      // Catch accidental debug artifacts
      'no-debugger': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      // Prevent unused variables (allow _ prefix for intentional ignores)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Ban eslint-disable without specific rule name (prevents blanket disables)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SequenceExpression',
          message: 'Comma operator is confusing and error-prone.',
        },
      ],

      // ── Unused/dead code ──────────────────────────────────────────
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',

      // ── Strictness overrides (relax where strictTypeChecked is too noisy) ──
      // Allow void returns in JSX event handlers (onClick={() => doAsync()})
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // Template literal types are fine
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
    },
  },
)
