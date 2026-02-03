// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import i18next from 'eslint-plugin-i18next'; // Importe le plugin ici

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Configuration du plugin i18next
    plugins: {
      i18next: i18next,
    },
    rules: {
      ...i18next.configs.recommended.rules, // Charge les règles recommandées
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'i18next/no-literal-string': [
        'error',
        {
          markupOnly: true,
          ignore: ['Chat', 'MonAmiChef', 'Chef'],
        },
      ],
    },
  },
);
