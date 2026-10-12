import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import legacy from './.eslintrc.js';

const compat = new FlatCompat({ baseDirectory: fileURLToPath(new URL('.', import.meta.url)) });
const { root, ...config } = legacy;
export default [
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
  ...compat.config(config),
];
