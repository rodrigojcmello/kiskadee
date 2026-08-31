import { KISKADEE_TONES, type KiskadeeHexScale, type SchemaColors } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  bindPresetColorRole,
  createPresetColorGetter,
  createStrictPresetColorResolver
} from './presetColor.ts';

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
    black: { v1: asset(24, 30) },
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

describe('createStrictPresetColorResolver', () => {
  const exactEvidence = {
    'test.exact': {
      source: 'test fixture',
      rationale: 'Verifies an upstream tone that is intentionally independent from its anchors.'
    }
  } as const;
  const c = createStrictPresetColorResolver<'default' | 'special', typeof exactEvidence>({
    colors,
    exactEvidence
  });

  it('resolves both functional references through semantic and component-intent roles', () => {
    expect(
      c.resolve('default', 'l', {
        mode: 'reference',
        role: 'primary',
        reference: 'vivid'
      })
    ).toBe('#111111');
    expect(
      c.resolve('special', 'l', {
        mode: 'reference',
        role: 'badge.primary',
        reference: 'subtle',
        offset: 1
      })
    ).toBe('#050505');
  });

  it('keeps evidence-backed exact tones independent from the functional references', () => {
    expect(
      c.resolve('default', 'l', {
        mode: 'exact',
        role: 'primary',
        tone: 10,
        evidenceId: 'test.exact'
      })
    ).toBe('#0a0a0a');
  });

  it('resolves visual caps consistently across inverted theme scales', () => {
    expect(
      c.resolve('default', 'l', {
        mode: 'cap',
        primitive: 'primitive.black.v1',
        polarity: 'light'
      })
    ).toBe('#ffffff');
    expect(
      c.resolve('default', 'd', {
        mode: 'cap',
        primitive: 'primitive.black.v1',
        polarity: 'light',
        alpha: 0
      })
    ).toBe('#ffffff00');
    expect(
      c.resolve('default', 'l', {
        mode: 'cap',
        primitive: 'primitive.black.v1',
        polarity: 'dark'
      })
    ).toBe('#000000');
    expect(
      c.resolve('default', 'd', {
        mode: 'cap',
        primitive: 'primitive.black.v1',
        polarity: 'dark'
      })
    ).toBe('#000000');
  });

  it('rejects invalid alpha, grid overflow, and incomplete exact evidence', () => {
    expect(() =>
      c.resolve('default', 'l', {
        mode: 'reference',
        role: 'primary',
        reference: 'vivid',
        alpha: 101
      })
    ).toThrow('Preset color alpha must be between 0 and 100');

    expect(() =>
      c.resolve('default', 'l', {
        mode: 'reference',
        role: 'primary',
        reference: 'vivid',
        offset: 100
      })
    ).toThrow('Kiskadee tone offset leaves the public grid');

    expect(() =>
      createStrictPresetColorResolver({
        colors,
        exactEvidence: {
          incomplete: { source: '', rationale: '' }
        }
      })
    ).toThrow('Missing preset color evidence for exact locator: incomplete');
  });

  it('binds roles without changing absolute caps', () => {
    expect(bindPresetColorRole('primary', { mode: 'reference', reference: 'vivid' })).toEqual({
      mode: 'reference',
      role: 'primary',
      reference: 'vivid'
    });
    expect(
      bindPresetColorRole('primary', {
        mode: 'exact',
        tone: 10,
        evidenceId: 'test.exact'
      })
    ).toEqual({
      mode: 'exact',
      role: 'primary',
      tone: 10,
      evidenceId: 'test.exact'
    });
    const cap = {
      mode: 'cap' as const,
      primitive: 'primitive.black.v1' as const,
      polarity: 'light' as const
    };
    expect(bindPresetColorRole('primary', cap)).toBe(cap);
  });

  it('rejects unknown evidence, gradients, and every non-finite alpha path', () => {
    expect(() =>
      c.resolve('default', 'l', {
        mode: 'exact',
        role: 'primary',
        tone: 10,
        evidenceId: 'unknown' as 'test.exact'
      })
    ).toThrow('Missing preset color evidence for exact locator: unknown');

    expect(() =>
      c.resolve('default', 'l', {
        mode: 'reference',
        role: 'primitive.blue.gradient' as never,
        reference: 'vivid'
      })
    ).toThrow('Preset color locators support only solid roles');

    for (const alpha of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        c.resolve('default', 'l', {
          mode: 'reference',
          role: 'primary',
          reference: 'vivid',
          alpha
        })
      ).toThrow('Preset color alpha must be between 0 and 100');
    }
  });

  it('rejects malformed semantic roles instead of silently truncating their suffixes', () => {
    for (const role of ['primary.', 'primary.v1.extra', 'primary..v1']) {
      expect(() =>
        c.resolve('default', 'l', {
          mode: 'reference',
          role: role as never,
          reference: 'vivid'
        })
      ).toThrow();
    }
  });

  it('reports missing component-intent variants without throwing an incidental TypeError', () => {
    const withoutComponentIntents = createStrictPresetColorResolver({
      colors: { ...colors, componentIntents: undefined } as unknown as SchemaColors,
      exactEvidence
    });

    expect(() =>
      withoutComponentIntents.resolve('default', 'l', {
        mode: 'reference',
        role: 'badge.primary.v1',
        reference: 'vivid'
      })
    ).toThrow('Intent not mapped for role=badge.primary.v1');
  });

  it('rejects fractional functional-reference offsets outside the public tonal grid', () => {
    expect(() =>
      c.resolve('default', 'l', {
        mode: 'reference',
        role: 'primary',
        reference: 'vivid',
        offset: 0.5
      })
    ).toThrow('A Kiskadee tone offset must be an integer');
  });

  it('applies alpha to reference and exact locators independently', () => {
    expect(
      c.resolve('default', 'l', {
        mode: 'reference',
        role: 'primary',
        reference: 'vivid',
        alpha: 50
      })
    ).toBe('#11111180');
    expect(
      c.resolve('default', 'l', {
        mode: 'exact',
        role: 'primary',
        tone: 10,
        evidenceId: 'test.exact',
        alpha: 50
      })
    ).toBe('#0a0a0a80');
  });

  it('propagates anchor changes only to reference locators', () => {
    const changedColors = {
      ...colors,
      primitiveColors: {
        ...colors.primitiveColors,
        blue: { v1: asset(40, 30) }
      }
    } as unknown as SchemaColors;
    const changed = createStrictPresetColorResolver({
      colors: changedColors,
      exactEvidence
    });

    expect(
      changed.resolve('default', 'l', {
        mode: 'reference',
        role: 'primary',
        reference: 'vivid'
      })
    ).toBe('#161616');
    expect(
      changed.resolve('default', 'l', {
        mode: 'exact',
        role: 'primary',
        tone: 10,
        evidenceId: 'test.exact'
      })
    ).toBe('#0a0a0a');
    expect(
      changed.resolve('default', 'l', {
        mode: 'cap',
        primitive: 'primitive.black.v1',
        polarity: 'light'
      })
    ).toBe('#ffffff');
  });
});
