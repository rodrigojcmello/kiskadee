import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.resolve(packageRoot, 'src');
const distDir = path.resolve(packageRoot, 'dist');

async function findTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findTypeScriptFiles(entryPath)));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.d.ts') &&
      !entry.name.endsWith('.test.ts')
    ) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export async function buildAllJavaScript(): Promise<void> {
  await build({
    entryPoints: await findTypeScriptFiles(srcDir),
    outbase: packageRoot,
    outdir: distDir,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    bundle: false,
    sourcemap: false,
    logLevel: 'silent'
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAllJavaScript().catch((error) => {
    console.error('[fonts] Failed to build JavaScript:', error);
    process.exitCode = 1;
  });
}
