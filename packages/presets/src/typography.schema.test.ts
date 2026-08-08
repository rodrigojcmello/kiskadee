import type { Schema, TypographyProfileId } from '@kiskadee/core';
import { validateSchemaTypographyContract } from '@kiskadee/core/typography-contract';
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

const INLINE_TYPOGRAPHY_KEYS = new Set([
  'textFont',
  'textWeight',
  'textSize',
  'textHeight',
  'textLetterSpacing'
]);

function visit(value: unknown, onEntry: (key: string, value: unknown) => void): void {
  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    onEntry(key, child);
    visit(child, onEntry);
  }
}

function collectTypographyReferences(components: Schema<string>['components']) {
  const references: TypographyProfileId[] = [];

  visit(components, (key, value) => {
    if (key !== 'typography' || !value || typeof value !== 'object') return;

    for (const selection of Object.values(value)) {
      if (typeof selection === 'string') {
        references.push(selection);
        continue;
      }

      if (selection && typeof selection === 'object') {
        references.push(
          ...Object.values(selection).filter((id): id is string => typeof id === 'string')
        );
      }
    }
  });

  return references;
}

describe('preset typography catalogs', () => {
  it.each(schemas)('$prefix publishes a complete, referenced catalog', (schema) => {
    expect(() => validateSchemaTypographyContract(schema)).not.toThrow();

    const profiles = schema.global?.typography?.profiles;
    expect(profiles).toBeDefined();

    const profileIds = Object.keys(profiles ?? {});
    expect(profileIds.length).toBeGreaterThan(0);
    expect(profileIds.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);

    const references = collectTypographyReferences(schema.components);
    expect(references.length).toBeGreaterThan(0);
    expect(new Set(references)).toEqual(new Set(profileIds));
  });

  it.each(
    schemas
  )('$prefix keeps typography primitives out of component element styles', (schema) => {
    const inlineKeys: string[] = [];

    visit(schema.components, (key) => {
      if (INLINE_TYPOGRAPHY_KEYS.has(key)) inlineKeys.push(key);
    });

    expect(inlineKeys).toEqual([]);
  });
});
