import { validateDropdownComponentContract, validateSchemaPresenceContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema as fluent2Microsoft } from './presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios27Apple } from './presets/ios-27-apple/ios-27-apple.schema.ts';
import { schema as material3Google } from './presets/material-3-google/material-3-google.schema.ts';
import { schema as material3Kiskadee } from './presets/material-3-kiskadee/material-3-kiskadee.schema.ts';

describe('official preset Dropdown schemas', () => {
  it.each([
    fluent2Microsoft,
    ios27Apple,
    material3Google
  ])('$prefix publishes the complete shared visual topology', (schema) => {
    expect(validateDropdownComponentContract(schema.components.dropdown)).toEqual([]);
    expect(schema.components.dropdown?.elements.e8).toBeDefined();
    expect(schema.components.dropdown?.elements.e9).toBeDefined();
    expect(schema.components.dropdown?.elements.e10).toBeDefined();
  });

  it.each([
    [fluent2Microsoft, 's:md:1', 4],
    [ios27Apple, 's:sm:1', 10],
    [material3Google, 's:lg:1', 12]
  ] as const)('$prefix publishes the dedicated selected-item checkmark geometry', (schema, iconSize, paddingRight) => {
    const elements = schema.components.dropdown?.elements;

    expect(elements?.e10).toMatchObject({
      name: 'dropdown-checkmark',
      iconSize: { 's:all': iconSize },
      scales: { paddingRight }
    });
    expect(elements?.e10.palettes).toEqual(elements?.e3.palettes);
  });

  it('keeps the solid Fluent surface borderless and maps the source geometry', () => {
    const elements = fluent2Microsoft.components.dropdown?.elements;

    expect(elements?.e1.decorations).toBeUndefined();
    expect(elements?.e1.scales?.borderWidth).toBeUndefined();
    expect(elements?.e1.palettes?.default?.light?.onSubtle.borderColor).toBeUndefined();
    expect(elements?.e2.scales).toMatchObject({
      paddingTop: 6,
      paddingRight: 2,
      paddingBottom: 6,
      paddingLeft: 6,
      marginBottom: 2
    });
    expect(elements?.e3.scales?.paddingRight).toBe(4);
    expect(elements?.e6.iconSize).toEqual({ 's:all': 's:md:1' });
    expect(elements?.e8.typography).toEqual({ 's:all': 'caption-medium' });
    expect(elements?.e8.scales).toEqual({ paddingRight: 6, paddingLeft: 10 });
    expect(elements?.e8.palettes).toMatchObject({
      default: {
        light: {
          onSubtle: { textColor: { neutral: { medium: { rest: '#5d616b' } } } }
        },
        dark: {
          onSubtle: { textColor: { neutral: { medium: { rest: '#8d919c' } } } }
        }
      }
    });
    expect(elements?.e8.palettes).toMatchObject({
      default: {
        light: {
          onSubtle: {
            textColor: {
              destructive: { medium: { rest: '#5d616b' } }
            }
          }
        },
        dark: {
          onSubtle: {
            textColor: {
              destructive: { medium: { rest: '#8d919c' } }
            }
          }
        }
      }
    });
    expect(elements?.e9.typography).toEqual({ 's:all': 'caption-medium-strong' });
    expect(elements?.e9.palettes).toMatchObject({
      default: {
        light: {
          onSubtle: { textColor: { neutral: { medium: { rest: '#32353f' } } } }
        },
        dark: {
          onSubtle: { textColor: { neutral: { medium: { rest: '#c1c5d1' } } } }
        }
      }
    });
  });

  it('publishes presence only for Fluent and resolves its Dropdown default', () => {
    expect(() => validateSchemaPresenceContract(fluent2Microsoft)).not.toThrow();
    expect(fluent2Microsoft.global?.effects?.presence).toEqual({
      profiles: {
        'fade-translate': {
          distancePx: 12,
          enterDurationMs: 240,
          exitDurationMs: 120,
          enterEasing: 'ease-out',
          exitEasing: 'ease-in'
        },
        'grow-height': {
          enterDurationMs: 180,
          exitDurationMs: 120,
          enterEasing: 'ease-out',
          exitEasing: 'ease-in'
        }
      }
    });
    expect(fluent2Microsoft.components.dropdown?.effects?.presence).toEqual({
      profile: 'fade-translate'
    });

    for (const schema of [ios27Apple, material3Google, material3Kiskadee]) {
      expect(schema.global?.effects?.presence).toBeUndefined();
      expect(schema.components.dropdown?.effects?.presence).toBeUndefined();
    }
  });

  it('keeps Dropdown unavailable in Material Kiskadee', () => {
    expect(material3Kiskadee.components.dropdown).toBeUndefined();
  });
});
