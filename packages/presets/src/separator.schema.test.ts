import type { Schema } from '@kiskadee/core';
import { validateSchemaSeparatorsContract } from '@kiskadee/core/separator-contract';
import { describe, expect, it } from 'vitest';
import { schema as fluent2Microsoft } from './presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios27Apple } from './presets/ios-27-apple/ios-27-apple.schema.ts';
import { schema as material3Google } from './presets/material-3-google/material-3-google.schema.ts';
import { schema as material3Kiskadee } from './presets/material-3-kiskadee/material-3-kiskadee.schema.ts';

const schemas = [
  fluent2Microsoft,
  ios27Apple,
  material3Google,
  material3Kiskadee
] as const satisfies readonly Schema<string>[];

describe('official preset separator recipes', () => {
  it.each(schemas)('$prefix publishes a valid catalog with resolvable references', (schema) => {
    expect(() => validateSchemaSeparatorsContract(schema)).not.toThrow();
  });

  it('preserves the Fluent Dropdown colors in the shared subtle recipe', () => {
    const subtle = fluent2Microsoft.global?.separators?.profiles.subtle;

    expect(subtle?.scales).toEqual({ boxWidth: 1 });
    expect(subtle?.palettes.default?.light?.onSubtle.boxColor.neutral.medium.rest).toBe('#cdd1de');
    expect(subtle?.palettes.default?.dark?.onSubtle.boxColor.neutral.medium.rest).toBe('#353842');
    expect(subtle?.palettes.default?.darker?.onSubtle.boxColor.neutral.medium.rest).toBe('#2e313a');
    expect(fluent2Microsoft.components.separator?.elements.e1.separator).toEqual({
      's:all': 'subtle'
    });
    expect(fluent2Microsoft.components.dropdown?.elements.e7).toEqual({
      name: 'dropdown-separator',
      separator: { 's:all': 'subtle' }
    });
  });

  it('preserves the iOS Dropdown colors in the shared subtle recipe', () => {
    const subtle = ios27Apple.global?.separators?.profiles.subtle;

    expect(subtle?.scales).toEqual({ boxWidth: 1 });
    expect(subtle?.palettes.default?.light?.onSubtle.boxColor.neutral.medium.rest).toBe('#d1d1d4');
    expect(subtle?.palettes.default?.dark?.onSubtle.boxColor.neutral.medium.rest).toBe('#38383b');
    expect(ios27Apple.components.separator?.elements.e1.separator).toEqual({
      's:all': 'subtle'
    });
    expect(ios27Apple.components.dropdown?.elements.e7).toEqual({
      name: 'dropdown-separator',
      separator: { 's:all': 'subtle' }
    });
  });

  it('preserves Material Dropdown output and its Kiskadee inheritance', () => {
    const subtle = material3Google.global?.separators?.profiles.subtle;

    expect(subtle?.scales).toEqual({ boxWidth: 1 });
    expect(subtle?.palettes.default?.light?.onSubtle.boxColor.neutral.medium.rest).toBe(
      '#c9c5cd1f'
    );
    expect(subtle?.palettes.dynamic?.light?.onSubtle.boxColor.neutral.medium.rest).toBe(
      '#c9c5cd1f'
    );
    expect(material3Google.components.separator?.elements.e1.separator).toEqual({
      's:all': 'subtle'
    });
    expect(material3Google.components.dropdown?.elements.e7).toEqual({
      name: 'dropdown-separator',
      separator: { 's:all': 'subtle' }
    });
    expect(material3Kiskadee.global?.separators).toEqual(material3Google.global?.separators);
    expect(material3Kiskadee.components.separator).toEqual(material3Google.components.separator);
  });
});
