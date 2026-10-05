import type { ElementSizeValue, ShadowEffectSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schemas } from '../test-schemas.ts';
import { schema as carbon } from './carbon-ibm/carbon-ibm.schema.ts';
import { schema as elegant } from './elegant/elegant.schema.ts';
import { schema as fluentKiskadee } from './fluent-2-kiskadee/fluent-2-kiskadee.schema.ts';
import { schema as fluent } from './fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios } from './ios-27-apple/ios-27-apple.schema.ts';
import { schema as material } from './material-3-google/material-3-google.schema.ts';

describe('preset shadow handoff', () => {
  it('keeps every published Button free of legacy local shadow geometry', () => {
    for (const schema of schemas) {
      const button = schema.components.button;
      if (!button) continue;
      expect(
        button.elements.e1?.effects?.shadow,
        `${schema.name}/${schema.author}`
      ).toBeUndefined();
    }
  });

  it('resolves every component state and fixed shadow level in its global catalog', () => {
    for (const schema of schemas) {
      for (const [name, component] of Object.entries(schema.components)) {
        const effects = (component && 'effects' in component ? component.effects : undefined) as
          | { shadow?: ShadowEffectSchema }
          | undefined;
        for (const [element, recipe] of Object.entries(effects?.shadow ?? {})) {
          if (!recipe) continue;
          const levels = schema.global?.effects?.shadow?.[recipe.kind]?.levels;
          const references = [...Object.values(recipe.states ?? {}), ...(recipe.fixedLevels ?? [])];
          for (const reference of references) {
            if (reference === false) continue;
            expect(
              levels?.[reference as ElementSizeValue],
              `${schema.name}/${name}/${element}/${reference}`
            ).toBeDefined();
          }
        }
      }
    }
  });

  it('uses global Button shadows with explicit terminal removal and independent focus', () => {
    for (const schema of [fluent, fluentKiskadee, elegant, material]) {
      const button = schema.components.button!;
      expect(button.elements.e1?.effects?.shadow).toBeUndefined();
      const states = button.effects?.shadow?.e1?.states;
      expect(states?.rest).toBe('s:sm:1');
      expect(states?.hover).toBe('s:md:1');
      expect(states?.pending).toBe(false);
      expect(states?.disabled).toBe(false);
      expect(states?.focus).toBeUndefined();
      expect(states?.selected).toBeUndefined();
    }
    expect(material.components.button?.effects?.shadow?.e1?.states?.pressed).toBe('s:sm:1');
    for (const schema of [fluent, fluentKiskadee, elegant])
      expect(schema.components.button?.effects?.shadow?.e1?.states?.pressed).toBe(false);
    for (const schema of [carbon, ios]) {
      expect(schema.components.button?.effects?.shadow).toBeUndefined();
      expect(schema.components.button?.elements.e1?.effects?.shadow).toBeUndefined();
    }
  });

  it('preserves both official Material elevation layers at all five levels', () => {
    const levels = material.global?.effects?.shadow?.outer?.levels;
    const geometries = [
      ['s:sm:1', [1, 2, 0], [1, 3, 1]],
      ['s:md:1', [1, 2, 0], [2, 6, 2]],
      ['s:lg:1', [1, 3, 0], [4, 8, 3]],
      ['s:lg:2', [2, 3, 0], [6, 10, 4]],
      ['s:lg:3', [4, 4, 0], [8, 12, 6]]
    ] as const;
    for (const [level, key, ambient] of geometries) {
      expect(levels?.[level]).toEqual([
        { x: 0, y: key[0], blur: key[1], spread: key[2], color: '#0000004d' },
        { x: 0, y: ambient[0], blur: ambient[1], spread: ambient[2], color: '#00000026' }
      ]);
    }
  });

  it('keeps Material floating surfaces on their existing global elevation levels', () => {
    expect(material.components.dropdown?.effects?.shadow?.e1).toEqual({
      kind: 'outer',
      states: { rest: 's:md:1' },
      fixedLevels: ['s:md:1']
    });
    expect(material.components.bottomSheet?.effects?.shadow?.e2).toEqual({
      kind: 'outer',
      states: { rest: 's:lg:1' },
      fixedLevels: ['s:lg:1']
    });
  });
});
