import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createKiskadeePostcssProcessor, type KiskadeePostcssOptions } from '@kiskadee/css-build';
import * as sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const packageRoot = path.resolve(__dirname, '..');
export const srcDir = path.resolve(packageRoot, 'src');
export const distDir = path.resolve(packageRoot, 'dist');

const rootStyleInput = path.join('shared', 'styles', 'style.kiskadee.scss');
const structuralCssOptions: KiskadeePostcssOptions = {
  autoprefix: true,
  combineMediaQueries: true,
  minify: true
};
type KiskadeePostcssProcessor = ReturnType<typeof createKiskadeePostcssProcessor>;

export function isBuildableScssFile(filePath: string): boolean {
  const fileName = path.basename(filePath);

  return (
    fileName.endsWith('.scss') && !fileName.endsWith('.module.scss') && !fileName.startsWith('_')
  );
}

export async function findScssFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.resolve(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findScssFiles(entryPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!isBuildableScssFile(entry.name)) continue;

    files.push(entryPath);
  }

  return files.sort();
}

export function resolveOutputPath(inputFile: string): string {
  const relativeInput = path.relative(srcDir, inputFile);

  if (relativeInput === rootStyleInput) {
    return path.resolve(distDir, 'style.kiskadee.css');
  }

  return path.resolve(distDir, relativeInput.replace(/\.scss$/, '.css'));
}

export async function buildStyle(
  inputFile: string,
  processor?: KiskadeePostcssProcessor
): Promise<void> {
  const cssProcessor = processor ?? createKiskadeePostcssProcessor(structuralCssOptions);
  const outputFile = resolveOutputPath(inputFile);
  const compiled = sass.compile(inputFile, {
    style: 'compressed',
    sourceMap: false
  });
  const processed = await cssProcessor.process(compiled.css, {
    from: inputFile,
    to: outputFile,
    map: false
  });

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, processed.css.trim(), 'utf8');
}

export async function buildAllStyles(): Promise<void> {
  const scssFiles = await findScssFiles(srcDir);
  const processor = createKiskadeePostcssProcessor(structuralCssOptions);

  await Promise.all(scssFiles.map((file) => buildStyle(file, processor)));

  console.log(`[react-components] CSS built: ${scssFiles.length} files`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAllStyles().catch((error) => {
    console.error('[react-components] Failed to build styles:', error);
    process.exitCode = 1;
  });
}
