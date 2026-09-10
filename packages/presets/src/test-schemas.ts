import type { Schema } from '@kiskadee/core';
import { schema as carbonIbm } from './presets/carbon-ibm/carbon-ibm.schema.ts';
import { schema as elegant } from './presets/elegant/elegant.schema.ts';
import { schema as fluent2Kiskadee } from './presets/fluent-2-kiskadee/fluent-2-kiskadee.schema.ts';
import { schema as fluent2Microsoft } from './presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios18Apple } from './presets/ios-18-apple/ios-18-apple.schema.ts';
import { schema as ios27Apple } from './presets/ios-27-apple/ios-27-apple.schema.ts';
import { schema as material3Google } from './presets/material-3-google/material-3-google.schema.ts';
import { schema as material3Kiskadee } from './presets/material-3-kiskadee/material-3-kiskadee.schema.ts';
import { schema as sandbox } from './presets/sandbox/sandbox.schema.ts';
import { schema as sandbox2 } from './presets/sandbox-2/sandbox-2.schema.ts';
import { schema as sandbox3 } from './presets/sandbox-3/sandbox-3.schema.ts';

export const schemas = [
  carbonIbm,
  elegant,
  fluent2Kiskadee,
  fluent2Microsoft,
  ios18Apple,
  ios27Apple,
  material3Google,
  material3Kiskadee,
  sandbox,
  sandbox2,
  sandbox3
] as const satisfies readonly Schema<string>[];
