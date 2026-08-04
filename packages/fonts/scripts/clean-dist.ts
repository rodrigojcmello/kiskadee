import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.resolve(packageRoot, 'dist');
const tsBuildInfoPath = path.resolve(
  packageRoot,
  'node_modules',
  '.cache',
  'tsc',
  'build.tsbuildinfo'
);

if (path.basename(distDir) !== 'dist' || path.dirname(distDir) !== packageRoot) {
  throw new Error(`Refusing to clean unexpected directory: ${distDir}`);
}

export async function cleanDist(): Promise<void> {
  await Promise.all([
    rm(distDir, { recursive: true, force: true }),
    rm(tsBuildInfoPath, { force: true })
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cleanDist().catch((error) => {
    console.error('[fonts] Failed to clean dist:', error);
    process.exitCode = 1;
  });
}
