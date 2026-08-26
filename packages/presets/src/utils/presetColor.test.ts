import { KISKADEE_TONES, type KiskadeeHexScale, type SchemaColors } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { createPresetColorGetter } from './presetColor.ts';

const indexedScale = (theme: 'light' | 'dark') =>
  Object.fromEntries(
    KISKADEE_TONES.map((tone, index) => {
      if (tone === 0) return [tone, theme === 'light' ? '#ffffff' : '#000000'];
      if (tone === 100) return [tone, theme === 'light' ? '#000000' : '#ffffff'];
      const channel = index.toString(16).padStart(2, '0');
      return [tone, `#${channel}${channel}${channel}`];
    })
  ) as unknown as KiskadeeHexScale;

const asset = (lightVivid: 24 | 40, darkVivid: 30 | 45) => ({
  kind: 'static' as const,
  functionalReferences: {
    light: { subtle: 4 as const, vivid: lightVivid },
    dark: { subtle: 6 as const, vivid: darkVivid }
  },
  scales: { light: indexedScale('light'), dark: indexedScale('dark') }
});

const colors = {
  primitiveColors: {
    blue: { v1: asset(24, 30) },
    orange: { v1: asset(40, 45) },
    purple: { v1: asset(40, 45) }
  },
  globalSemantics: {
    light: {
      primary: { v1: 'primitive.blue.v1' },
      yellowLike: { v1: 'primitive.blue.v1', v2: 'primitive.orange.v1' }
    },
    dark: {
      primary: { v1: 'primitive.blue.v1' },
      yellowLike: { v1: 'primitive.blue.v1', v2: 'primitive.orange.v1' }
    }
  },
  globalSemanticsBySegment: {
    special: {
      meta: { name: 'Special' },
      themes: {
        light: { primary: { v1: 'primitive.purple.v1' } },
        dark: { primary: { v1: 'primitive.purple.v1' } }
      }
    }
  },
  componentIntents: {
    badge: { primary: 'primary', warning: 'yellowLike' }
  }
} as unknown as SchemaColors;

describe('createPresetColorGetter functional references', () => {
  const c = createPresetColorGetter<'default' | 'special'>({ colors });

  it('resolves global semantic and component-intent references through the active segment', () => {
    expect(c.ref('default', 'l', 'primary', 'vivid')).toBe('#111111');
    expect(c.ref('default', 'd', 'badge.primary', 'vivid')).toBe('#141414');
    expect(c.ref('special', 'l', 'badge.primary', 'vivid')).toBe('#161616');
  });

  it('resolves semantic variants before applying the functional reference', () => {
    expect(c.ref('default', 'l', 'badge.warning.v2', 'vivid')).toBe('#161616');
    expect(c.ref('default', 'd', 'badge.warning.v2', 'vivid')).toBe('#171717');
  });

  it('keeps exact-tone lookups independent from functional references', () => {
    expect(c('default', 'l', 'primary', 10)).toBe('#0a0a0a');
    expect(c.ref('default', 'l', 'primary', 'vivid')).toBe('#111111');
  });
});
