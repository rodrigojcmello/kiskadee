import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schema as carbonIbmSchema } from '../../../presets/src/presets/carbon-ibm/carbon-ibm.schema.ts';
import { schema as fluent2MicrosoftSchema } from '../../../presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios26AppleSchema } from '../../../presets/src/presets/ios-26-apple/ios-26-apple.schema.ts';
import { schema as material3GoogleSchema } from '../../../presets/src/presets/material-3-google/material-3-google.schema.ts';
import { schema as material3KiskadeeSchema } from '../../../presets/src/presets/material-3-kiskadee/material-3-kiskadee.schema.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const resourcesDir = resolve(scriptDir, '..', 'Examples', 'KiskadeeIOSShowcase', 'KiskadeeIOSShowcase', 'Resources');

const fixtures = [
  {
    fileName: 'carbon-ibm-switch.schema.json',
    schema: carbonIbmSchema
  },
  {
    fileName: 'fluent-2-microsoft-switch.schema.json',
    schema: fluent2MicrosoftSchema
  },
  {
    fileName: 'ios-26-apple-switch.schema.json',
    schema: ios26AppleSchema
  },
  {
    fileName: 'material-3-google-switch.schema.json',
    schema: material3GoogleSchema
  },
  {
    fileName: 'material-3-kiskadee-switch.schema.json',
    schema: material3KiskadeeSchema
  }
];

function buildSwitchFixture(schema: (typeof fixtures)[number]['schema']) {
  const { name, prefix, version, author, global, themeTokens, components } = schema;

  if (!components?.switch) {
    throw new Error(`Preset "${name}" does not define components.switch.`);
  }

  return {
    name,
    prefix,
    version,
    author,
    global,
    themeTokens,
    components: {
      switch: components.switch
    }
  };
}

await mkdir(resourcesDir, { recursive: true });

for (const { fileName, schema } of fixtures) {
  const fixture = buildSwitchFixture(schema);
  await writeFile(resolve(resourcesDir, fileName), `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
}

console.log(`[kiskadee-ios] Generated ${fixtures.length} switch schema fixtures.`);
