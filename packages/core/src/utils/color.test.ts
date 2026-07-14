import { describe, expect, it } from 'vitest';
import {
  KISKADEE_TONES,
  type KiskadeeHexScale,
  type SchemaColors
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
