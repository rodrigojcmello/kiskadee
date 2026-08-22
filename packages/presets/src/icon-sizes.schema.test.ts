import type { Schema } from '@kiskadee/core';
import { validateSchemaIconSizesContract } from '@kiskadee/core/icon-size-contract';
import { describe, expect, it } from 'vitest';
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

const schemas = [
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

describe('preset icon-size catalogs', () => {
  it.each(schemas)('$prefix publishes valid catalogs and references', (schema) => {
    expect(() => validateSchemaIconSizesContract(schema)).not.toThrow();
  });

  it('preserves Fluent Button responsive ownership while sharing the global values', () => {
    expect(fluent2Microsoft.components.button?.elements.e3?.iconSize).toEqual({
      's:sm:1': 's:md:1',
      's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
      's:lg:1': 's:lg:1'
    });
  });

  it('preserves the calibrated iOS 27 Button ramp while adding exact component profiles', () => {
    expect(ios27Apple.global?.iconSizes).toEqual({
      's:sm:5': 8,
      's:sm:4': 10,
      's:sm:3': 12,
      's:sm:2': 14,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 32
    });
    expect(ios27Apple.components.button?.elements.e3?.iconSize).toEqual({
      's:sm:1': 's:sm:1',
      's:md:1': 's:md:1',
      's:lg:1': 's:lg:1'
    });
    expect(ios27Apple.components.button?.elements.e3?.scales).toMatchObject({
      paddingRight: {
        's:sm:1': 3,
        's:md:1': 4,
        's:lg:1': 4
      }
    });
  });
});
