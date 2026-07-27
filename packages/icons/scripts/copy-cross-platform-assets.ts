import { copyFile, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

/**
 * What
 *     Publishes canonical SVG sources and their manifest alongside generated adapters.
 * Why
 *     Non-React consumers need the original cross-platform assets from the package distribution.
 */
export async function copyCrossPlatformAssets(): Promise<void> {
  const distDir = path.resolve(packageRoot, 'dist');
  const svgDir = path.resolve(distDir, 'svg');

  await mkdir(distDir, { recursive: true });
  await cp(path.resolve(packageRoot, 'assets'), svgDir, { recursive: true });
  await copyFile(
    path.resolve(packageRoot, 'metadata/icons.json'),
    path.resolve(distDir, 'icons.json')
  );
}
