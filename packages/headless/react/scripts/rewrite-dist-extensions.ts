import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(packageRoot, 'dist');

const TS_TO_JS_EXTENSION: Record<string, string> = {
  '.ts': '.js',
  '.tsx': '.js',
  '.mts': '.mjs',
  '.cts': '.cjs'
};

const TARGET_FILE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.d.ts', '.d.mts', '.d.cts']);

function isTargetFile(fileName: string): boolean {
  if (fileName.endsWith('.d.ts') || fileName.endsWith('.d.mts') || fileName.endsWith('.d.cts')) {
    return true;
  }
  const ext = path.extname(fileName);
  return TARGET_FILE_EXTENSIONS.has(ext);
}

async function findTargetFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTargetFiles(entryPath)));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!isTargetFile(entry.name)) continue;
    files.push(entryPath);
  }
  return files;
}

function rewriteSpecifier(specifier: string): string {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) return specifier;
  for (const [tsExt, jsExt] of Object.entries(TS_TO_JS_EXTENSION)) {
    if (specifier.endsWith(tsExt)) {
      return specifier.slice(0, -tsExt.length) + jsExt;
    }
  }
  return specifier;
}

const STATIC_RE = /((?:^|[\n;])\s*(?:import|export)\b[\s\S]*?\bfrom\s+)(['"])(\.\.?\/[^'"\n]+)\2/g;
const SIDE_EFFECT_RE = /((?:^|[\n;])\s*import\s+)(['"])(\.\.?\/[^'"\n]+)\2/g;
const DYNAMIC_RE = /(\bimport\s*\(\s*)(['"])(\.\.?\/[^'"\n]+)\2(\s*\))/g;
const EXPORT_BARE_RE = /((?:^|[\n;])\s*export\s+\*\s+from\s+)(['"])(\.\.?\/[^'"\n]+)\2/g;

function rewriteContent(content: string): { content: string; changes: number } {
  let changes = 0;
  const apply = (
    src: string,
    re: RegExp,
    builder: (match: string, parts: string[]) => string
  ): string =>
    src.replace(re, (...groups) => {
      const matchText = groups[0] as string;
      const captured = groups.slice(1, -2) as string[];
      const original = captured[2];
      const next = rewriteSpecifier(original);
      if (next === original) return matchText;
      changes++;
      const replaced = [...captured];
      replaced[2] = next;
      return builder(matchText, replaced);
    });

  let out = content;
  out = apply(out, STATIC_RE, (_m, [pre, q, spec]) => `${pre}${q}${spec}${q}`);
  out = apply(out, EXPORT_BARE_RE, (_m, [pre, q, spec]) => `${pre}${q}${spec}${q}`);
  out = apply(out, SIDE_EFFECT_RE, (_m, [pre, q, spec]) => `${pre}${q}${spec}${q}`);
  out = apply(out, DYNAMIC_RE, (_m, [pre, q, spec, post]) => `${pre}${q}${spec}${q}${post}`);
  return { content: out, changes };
}

export async function rewriteDistExtensions(): Promise<void> {
  const files = await findTargetFiles(distDir);
  let totalChanges = 0;
  let filesChanged = 0;

  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const { content, changes } = rewriteContent(original);
    if (changes === 0) continue;
    await writeFile(file, content, 'utf8');
    totalChanges += changes;
    filesChanged++;
  }

  console.log(
    `[react-headless] Rewrote TS to JS extensions: ${totalChanges} imports across ${filesChanged} files (of ${files.length} scanned).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  rewriteDistExtensions().catch((error) => {
    console.error('[react-headless] Failed to rewrite dist extensions:', error);
    process.exitCode = 1;
  });
}
