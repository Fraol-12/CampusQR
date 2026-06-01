import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
];
