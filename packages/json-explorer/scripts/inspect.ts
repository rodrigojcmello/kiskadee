import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fluentButtonConfig } from '../examples/fluent-button.ts';
import { prepareDataset } from '../node/dataset.ts';

const packageDirectory = fileURLToPath(new URL('../', import.meta.url));

async function writeAtomically(destination: string, contents: string) {
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, contents, 'utf8');
  await rename(temporary, destination);
}

try {
  const dataset = await prepareDataset(fluentButtonConfig);
  const contents = JSON.stringify(dataset);
  const revision = createHash('sha256').update(contents).digest('hex');
  await writeAtomically(
    path.join(packageDirectory, 'public/inspection/fluent-button.json'),
    contents
  );
  // Updating this marker last lets native Next HMR refetch a complete data file.
  await writeAtomically(
    path.join(packageDirectory, 'generated/revision.ts'),
    `export const inspectionRevision = '${revision}';\n`
  );
  console.info(
    `Inspected ${dataset.model.root.name}: ${Object.keys(dataset.model.definitions).length} type definitions, ${dataset.model.diagnostics.length} diagnostics.`
  );
} catch (error) {
  console.error(
    `JSON Explorer inspection failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
}
