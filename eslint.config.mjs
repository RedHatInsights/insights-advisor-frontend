import { defineConfig, globalIgnores } from "eslint/config";
import fecPlugin from '@redhat-cloud-services/eslint-config-redhat-cloud-services';
import pluginCypress from 'eslint-plugin-cypress/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

const flatPlugins = [
  fecPlugin,
  pluginCypress.configs.recommended,
  reactHooks.configs['recommended-latest'],
  testingLibrary.configs['flat/react'],
  jestDom.configs['flat/recommended'],
];

export default defineConfig([
  globalIgnores(['node_modules/*', 'static/*', 'dist/*']),
  ...flatPlugins,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'testing-library/no-node-access': 'off',
      // Add other TypeScript-specific rules here
    },
  },
  {
    rules: {
      'rulesdir/disallow-fec-relative-imports': 'off',
      'rulesdir/forbid-pf-relative-imports': 'off',
      'testing-library/no-node-access': 'off',
      // Add other non-TypeScript specific rules here
    },
  },
]);
