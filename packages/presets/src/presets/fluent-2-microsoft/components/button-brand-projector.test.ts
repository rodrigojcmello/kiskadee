import { KISKADEE_TONES, type KiskadeeTone } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  createFluent2MicrosoftBrandButtonProjection,
  type FluentBrandTonalFamilyInput
} from './button-brand-projector.ts';

function createScale(hex: string): Record<KiskadeeTone, string> {
  return Object.fromEntries(KISKADEE_TONES.map((tone) => [tone, hex])) as Record<
    KiskadeeTone,
    string
  >;
}

function readHighForeground(
  projection: ReturnType<typeof createFluent2MicrosoftBrandButtonProjection>,
  theme: 'light' | 'dark' | 'darker',
  intent: string
): unknown {
  const palettes = projection.elements.e2.palettes as {
    default: Record<
      string,
      {
        onSubtle: {
          textColor: Record<string, { high: { rest: unknown } }>;
        };
      }
    >;
  };

  return palettes.default[theme]?.onSubtle.textColor[intent]?.high.rest;
}

function createBrand({
  id,
  darkVividSource
}: {
  id: string;
  darkVividSource: 'generated-anchor' | 'contrast-mirror';
}): FluentBrandTonalFamilyInput {
  return {
    id,
    contentPolarity: 'light',
    scales: {
      light: createScale('#222222'),
      dark: createScale('#dddddd')
    },
    functionalReferences: {
      light: {
        subtle: { tone: 4, hex: '#eeeeee', source: 'surface-relative' },
        vivid: { tone: 85, hex: '#222222', source: 'cap-fallback' }
      },
      dark: {
        subtle: { tone: 4, hex: '#191919', source: 'contrast-mirror' },
        vivid: { tone: 90, hex: '#dddddd', source: darkVividSource }
      }
    }
  };
}

describe('createFluent2MicrosoftBrandButtonProjection', () => {
  it('mirrors foreground polarity only for a contrast-mirrored vivid reference', () => {
    const projection = createFluent2MicrosoftBrandButtonProjection([
      createBrand({ id: 'black-cap', darkVividSource: 'contrast-mirror' }),
      createBrand({ id: 'regular', darkVividSource: 'generated-anchor' })
    ]);

    expect(readHighForeground(projection, 'light', 'brand.black-cap')).toBe('#ffffff');
    expect(readHighForeground(projection, 'dark', 'brand.black-cap')).toBe('#000000');
    expect(readHighForeground(projection, 'darker', 'brand.black-cap')).toBe('#000000');
    expect(readHighForeground(projection, 'dark', 'brand.regular')).toBe('#ffffff');
  });

  it('shares the resolved high foreground between the label and icon elements', () => {
    const projection = createFluent2MicrosoftBrandButtonProjection([
      createBrand({ id: 'light-content', darkVividSource: 'generated-anchor' })
    ]);

    expect(projection.elements.e3.palettes).toEqual(projection.elements.e2.palettes);
  });
});
