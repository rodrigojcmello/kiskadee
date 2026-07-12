import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createTonalArtifactBundle } from '../src/export/tonal-artifacts.ts';
import { writeTonalArtifactBundle } from '../src/export/write-tonal-artifact-bundle.node.ts';
import { generateKiskadeeTonalSystem } from '../src/tonal-system.ts';

const [sourceArgument, outputArgument] = process.argv.slice(2);

if (!sourceArgument || !outputArgument) {
  fail('Usage: pnpm export <tonal-system.source.json> <new-output-directory>');
}

try {
  const sourcePath = resolve(sourceArgument);
  const outputDirectory = resolve(outputArgument);
  const source = JSON.parse(await readFile(sourcePath, 'utf8')) as unknown;
  const system = generateKiskadeeTonalSystem(source);

  if (!system.valid) {
    fail(
      system.issues
        .map((issue) => `${issue.code} ${issue.path || '/'}: ${issue.message}`)
        .join('\n')
    );
  }

  const bundle = await createTonalArtifactBundle(system);
  await writeTonalArtifactBundle(bundle, outputDirectory);
  console.log(`Wrote ${bundle.files.size} canonical tonal artifacts to ${outputDirectory}`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
