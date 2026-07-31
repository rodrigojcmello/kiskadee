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
import { color, primitive } from './color.ts';

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
