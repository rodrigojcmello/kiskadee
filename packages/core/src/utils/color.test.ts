import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type ButtonIntent,
  type ComponentIntents,
  type ExternalButtonIntent,
  KISKADEE_TONES,
  type KiskadeeHexScale,
  type PrimitiveColorName,
  type RoleButton,
  type SchemaColors,
  type SystemButtonIntent
} from '../types/colors/colors.types.ts';
import { color, colorByReference, primitive } from './color.ts';

const scale = Object.fromEntries(
  KISKADEE_TONES.map((tone) => [
    tone,
    tone === 0 ? '#ffffff' : tone === 100 ? '#000000' : '#123456'
  ])
) as unknown as KiskadeeHexScale;

function colorsFor(asset: unknown): SchemaColors {
  return {
    primitiveColors: { blue: { v1: asset } },
    globalSemantics: { light: {}, dark: {} },
    componentIntents: {}
  } as SchemaColors;
}

describe('color exact tone lookup', () => {
  it('resolves a canonical tone without snapping', () => {
    const colors = colorsFor({ kind: 'static', scales: { light: scale } });
    expect(color({ colors }, 'default', 'l', primitive('blue', 'v1'), 24)).toBe('#123456');
  });

  it('rejects an unknown numeric tone instead of snapping it', () => {
    const colors = colorsFor({ kind: 'static', scales: { light: scale } });
    expect(() => color({ colors }, 'default', 'l', primitive('blue', 'v1'), 11 as never)).toThrow(
      'Unknown Kiskadee tone: 11'
    );
  });

  it('rejects the legacy primitive asset shape', () => {
    const colors = colorsFor({ subtle: {}, vivid: {} });
    expect(() => color({ colors }, 'default', 'l', primitive('blue', 'v1'), 24)).toThrow();
  });
});

describe('color functional reference lookup', () => {
  const indexedScale = (theme: 'light' | 'dark') =>
    Object.fromEntries(
      KISKADEE_TONES.map((tone, index) => {
        if (tone === 0) return [tone, theme === 'light' ? '#ffffff' : '#000000'];
        if (tone === 100) return [tone, theme === 'light' ? '#000000' : '#ffffff'];
        const channel = index.toString(16).padStart(2, '0');
        return [tone, `#${channel}${channel}${channel}`];
      })
    ) as unknown as KiskadeeHexScale;

  const colors = {
    primitiveColors: {
      blue: {
        v1: {
          kind: 'static',
          functionalReferences: {
            light: { subtle: 4, vivid: 24 },
            dark: { subtle: 6, vivid: 30 }
          },
          scales: { light: indexedScale('light'), dark: indexedScale('dark') }
        }
      },
      purple: {
        v1: {
          kind: 'static',
          functionalReferences: {
            light: { subtle: 8, vivid: 40 },
            dark: { subtle: 10, vivid: 45 }
          },
          scales: { light: indexedScale('light'), dark: indexedScale('dark') }
        }
      }
    },
    globalSemantics: {
      light: { primary: { v1: 'primitive.blue.v1' } },
      dark: { primary: { v1: 'primitive.blue.v1' } }
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
    componentIntents: { badge: { primary: 'primary' } }
  } as unknown as SchemaColors;

  it('resolves primitive, semantic, component-intent, segment, and theme references', () => {
    expect(colorByReference({ colors }, 'default', 'l', primitive('blue', 'v1'), 'subtle')).toBe(
      '#040404'
    );
    expect(colorByReference({ colors }, 'default', 'l', 'badge.primary', 'vivid')).toBe('#111111');
    expect(colorByReference({ colors }, 'default', 'd', 'badge.primary', 'vivid')).toBe('#141414');
    expect(colorByReference({ colors }, 'special', 'l', 'badge.primary', 'vivid')).toBe('#161616');
  });

  it('moves offsets by public-grid position and applies alpha after resolution', () => {
    expect(colorByReference({ colors }, 'default', 'l', 'badge.primary', 'vivid', 1)).toBe(
      '#121212'
    );
    expect(colorByReference({ colors }, 'default', 'l', 'badge.primary', 'vivid', 0, 50)).toBe(
      '#11111180'
    );
  });

  it('fails when the functional reference is absent or its offset leaves the public grid', () => {
    const withoutReferences = colorsFor({
      kind: 'static',
      scales: { light: indexedScale('light') }
    });
    expect(() =>
      colorByReference(
        { colors: withoutReferences },
        'default',
        'l',
        primitive('blue', 'v1'),
        'vivid'
      )
    ).toThrow('missing the light.vivid functional reference');

    const terminalReference = colorsFor({
      kind: 'static',
      functionalReferences: { light: { subtle: 99, vivid: 100 } },
      scales: { light: indexedScale('light') }
    });
    expect(() =>
      colorByReference(
        { colors: terminalReference },
        'default',
        'l',
        primitive('blue', 'v1'),
        'vivid',
        1
      )
    ).toThrow('leaves the public grid');
  });
});

describe('qualified component color roles', () => {
  const colors = {
    primitiveColors: {
      blue: {
        v1: {
          kind: 'static',
          scales: { light: scale },
          gradient: {
            angle: 90,
            stops: [
              { primitive: 'primitive.blue.v1', position: 0 },
              { primitive: 'primitive.blue.v1', position: 100 }
            ]
          }
        }
      }
    },
    globalSemantics: { light: {}, dark: {} },
    componentIntents: {
      button: {
        'brand.facebook': 'primitive.blue.v1'
      }
    }
  } as unknown as SchemaColors;

  it('keeps a qualified brand namespace as the intent', () => {
    expect(color({ colors }, 'default', 'l', 'button.brand.facebook', 24)).toBe('#123456');
    expect(color({ colors }, 'default', 'l', 'button.brand.facebook.solid', 24)).toBe('#123456');
  });

  it('recognizes paint only from a supported trailing suffix', () => {
    expect(color({ colors }, 'default', 'l', 'button.brand.facebook.gradient', 24)).toEqual({
      kind: 'linear',
      angle: 90,
      stops: [
        { color: '#123456', position: 0 },
        { color: '#123456', position: 100 }
      ]
    });

    expect(() => color({ colors }, 'default', 'l', 'button.brand.facebook.tint', 24)).toThrow(
      'Intent not mapped for role=button.brand.facebook.tint'
    );
  });

  it('rejects empty role segments', () => {
    expect(() => color({ colors }, 'default', 'l', 'button..facebook', 24)).toThrow(
      'Invalid role format'
    );
  });
});

describe('button intent types', () => {
  it('separates system-authored intents from external public intents', () => {
    expectTypeOf<'primary'>().toMatchTypeOf<SystemButtonIntent>();
    expectTypeOf<'brand.google'>().toMatchTypeOf<ExternalButtonIntent>();
    expectTypeOf<'brand.google'>().toMatchTypeOf<ButtonIntent>();
    expectTypeOf<'button.brand.google'>().toMatchTypeOf<RoleButton>();
    expectTypeOf<'brand.google'>().not.toMatchTypeOf<SystemButtonIntent>();
    expectTypeOf<'facebook'>().not.toMatchTypeOf<PrimitiveColorName>();
    expectTypeOf<{
      button: { 'brand.google': 'primary' };
    }>().not.toMatchTypeOf<ComponentIntents>();
  });
});
