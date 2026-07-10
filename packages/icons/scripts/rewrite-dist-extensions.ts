import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(packageRoot, 'dist');

const SOURCE_TO_OUTPUT_EXTENSION: Record<string, string> = {
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

  return TARGET_FILE_EXTENSIONS.has(path.extname(fileName));
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

    if (entry.isFile() && isTargetFile(entry.name)) files.push(entryPath);
  }

  return files;
}

function rewriteSpecifier(specifier: string): string {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) return specifier;

  for (const [sourceExtension, outputExtension] of Object.entries(SOURCE_TO_OUTPUT_EXTENSION)) {
    if (specifier.endsWith(sourceExtension)) {
      return specifier.slice(0, -sourceExtension.length) + outputExtension;
    }
  }

  return specifier;
}

const STATIC_IMPORT_RE =
  /((?:^|[\n;])\s*(?:import|export)\b[\s\S]*?\bfrom\s+)(['"])(\.\.?\/[^'"\n]+)\2/g;
const SIDE_EFFECT_IMPORT_RE = /((?:^|[\n;])\s*import\s+)(['"])(\.\.?\/[^'"\n]+)\2/g;
const DYNAMIC_IMPORT_RE = /(\bimport\s*\(\s*)(['"])(\.\.?\/[^'"\n]+)\2(\s*\))/g;
const BARE_EXPORT_RE = /((?:^|[\n;])\s*export\s+\*\s+from\s+)(['"])(\.\.?\/[^'"\n]+)\2/g;

function rewriteContent(content: string): { content: string; changes: number } {
  let changes = 0;
  const apply = (
    source: string,
    expression: RegExp,
    buildReplacement: (parts: string[]) => string
  ): string =>
    source.replace(expression, (...groups) => {
      const matchText = groups[0] as string;
      const captured = groups.slice(1, -2) as string[];
      const original = captured[2];
      const next = rewriteSpecifier(original);

      if (next === original) return matchText;

      changes++;
      captured[2] = next;
      return buildReplacement(captured);
    });

  let output = content;
  output = apply(output, STATIC_IMPORT_RE, ([prefix, quote, specifier]) => {
    return `${prefix}${quote}${specifier}${quote}`;
  });
  output = apply(output, BARE_EXPORT_RE, ([prefix, quote, specifier]) => {
    return `${prefix}${quote}${specifier}${quote}`;
  });
  output = apply(output, SIDE_EFFECT_IMPORT_RE, ([prefix, quote, specifier]) => {
    return `${prefix}${quote}${specifier}${quote}`;
  });
  output = apply(output, DYNAMIC_IMPORT_RE, ([prefix, quote, specifier, suffix]) => {
    return `${prefix}${quote}${specifier}${quote}${suffix}`;
  });

  return { content: output, changes };
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
    `[icons] Rewrote dist extensions: ${totalChanges} imports across ${filesChanged} files (of ${files.length} scanned).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  rewriteDistExtensions().catch((error) => {
    console.error('[icons] Failed to rewrite dist extensions:', error);
    process.exitCode = 1;
  });
}
