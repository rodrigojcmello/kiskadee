import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const srcDir = path.resolve(packageRoot, 'src');
const distDir = path.resolve(packageRoot, 'dist');

function isBuildableTypeScriptFile(filePath: string): boolean {
  if (!(filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) return false;
  if (filePath.endsWith('.d.ts')) return false;
  if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) return false;
  return true;
}

async function findTypeScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.resolve(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findTypeScriptFiles(entryPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!isBuildableTypeScriptFile(entryPath)) continue;

    files.push(entryPath);
  }

  return files.sort();
}

export async function buildAllJavaScript(): Promise<void> {
  const files = await findTypeScriptFiles(srcDir);

  await build({
    entryPoints: files,
    outbase: srcDir,
    outdir: distDir,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    bundle: false,
    jsx: 'automatic',
    sourcemap: false,
    logLevel: 'silent'
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAllJavaScript().catch((error) => {
    console.error('[icons] Failed to build JavaScript:', error);
    process.exitCode = 1;
  });
}
