import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(packageRoot, 'dist');

if (path.basename(distDir) !== 'dist' || path.dirname(distDir) !== packageRoot) {
  throw new Error(`Refusing to clean unexpected directory: ${distDir}`);
}

rm(distDir, { recursive: true, force: true }).catch((error) => {
  console.error('[react-components] Failed to clean dist:', error);
  process.exitCode = 1;
});
