import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertJsonValue, type InspectionConfiguration } from '../node/dataset.ts';
import type { JsonValue } from '../src/model/inspection.ts';

const packageDirectory = fileURLToPath(new URL('../', import.meta.url));
const presetFile = path.resolve(
  packageDirectory,
  '../presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts'
);

export async function loadFluentButtonReference(): Promise<JsonValue> {
  // This is the only Kiskadee-specific adapter. Type extraction never runs this import.
  const { schema } = await import(presetFile);
  assertJsonValue(schema.components.button);
  return JSON.parse(JSON.stringify(schema.components.button)) as JsonValue;
}

export const fluentButtonConfig: InspectionConfiguration = {
  file: presetFile,
  exportName: 'schema',
  path: ['components', 'button'],
  tsconfig: path.resolve(packageDirectory, '../presets/tsconfig.json'),
  referenceAdapter: loadFluentButtonReference,
  secondaryLabelField: 'name'
};
