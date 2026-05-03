import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(packageRoot, 'dist');

if (path.basename(distDir) !== 'dist' || path.dirname(distDir) !== packageRoot) {
  throw new Error(`Refusing to clean unexpected directory: ${distDir}`);
}

export function cleanDist(): Promise<void> {
  return rm(distDir, { recursive: true, force: true });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cleanDist().catch((error) => {
    console.error('[react-components] Failed to clean dist:', error);
    process.exitCode = 1;
  });
}
