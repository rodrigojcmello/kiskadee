import { type Schema, type TypographyProfileId, typographyProfileBuckets } from '@kiskadee/core';
import { validateSchemaTypographyContract } from '@kiskadee/core/typography-contract';
import { describe, expect, it } from 'vitest';
import { schemas } from './test-schemas.ts';

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
  it.each(schemas)('$prefix publishes a valid catalog with resolvable references', (schema) => {
    expect(() => validateSchemaTypographyContract(schema)).not.toThrow();

    const profiles = schema.global?.typography?.profiles;
    expect(profiles).toBeDefined();

    const profileIds = Object.keys(profiles ?? {});
    expect(profileIds.length).toBeGreaterThan(0);
    expect(profileIds.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
    expect(profileIds.every((id) => Object.hasOwn(typographyProfileBuckets, id))).toBe(true);

    const references = collectTypographyReferences(schema.components);
    expect(references.length).toBeGreaterThan(0);
    expect(references.every((reference) => profileIds.includes(reference))).toBe(true);
    expect(profileIds.some((id) => id.includes('stronger'))).toBe(false);
    expect(profileIds.some((id) => id.includes('compact') || id.includes('relaxed'))).toBe(false);
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
