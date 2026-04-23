import type { ClassNameByElementJSON, ComponentStyleKeyMap } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import type { ToneMetadataByPalette } from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy';
import { generateClassNamesMapSplit } from './generateClassNamesMap';

describe('generateClassNamesMapSplit (ripple)', () => {
  it('maps ripple effect style keys into compact ripple buckets', () => {
    const surfaceKey = 'ripple__{"mode":"surface","profile":{"fillToken":"surface"}}';
    const overflowKey = 'ripple__{"mode":"overflow","profile":{"fillToken":"overflow"}}';
    const overflowStaticKey =
      'ripple__{"mode":"overflow-static","profile":{"fillToken":"overflowStatic"}}';
    const pressedKey = 'ripplePressed__{"profile":{"fillToken":"surface"}}';

    const styleKeys = {
      button: {
        e1: {
          effects: {
            rest: [surfaceKey, overflowKey, overflowStaticKey, pressedKey]
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const shortenMap = {
      [surfaceKey]: 'ri_s',
      [overflowKey]: 'ri_o',
      [overflowStaticKey]: 'ri_x',
      [pressedKey]: 'ri_p'
    } as ShortenCssClassNames;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette);

    expect(out.core.button?.e1?.e).toEqual({
      ris: 'ri_s',
      rio: 'ri_o',
      rix: 'ri_x',
      rip: 'ri_p'
    });
  });

  it('throws when a ripple style key has an unsupported mode', () => {
    const invalidRippleKey = 'ripple__{"mode":"invalid","profile":{"fillToken":"unknown"}}';
    const styleKeys = {
      button: {
        e1: {
          effects: {
            rest: [invalidRippleKey]
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const shortenMap = {
      [invalidRippleKey]: 'ri_bad'
    } as ShortenCssClassNames;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;

    expect(() => generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette)).toThrow(
      `Unable to resolve ripple bucket for style key "${invalidRippleKey}". Expected mode: surface|overflow|overflow-static.`
    );
  });

  it('reuses the mirrored canonical class name for raw and mirrored scale consumers', () => {
    const styleKeys = {
      button: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      },
      card: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const shortenMap = {
      'borderWidth__2@@m': 'bw1'
    } as ShortenCssClassNames;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      collapseDirectIntoMirrored: true
    });

    const button = out.core.button as Record<string, ClassNameByElementJSON>;
    const card = out.core.card as Record<string, ClassNameByElementJSON>;

    expect(button.e1.s?.['md:1']).toBe('bw1');
    expect(card.e1.s?.['md:1']).toBe('bw1');
  });

  it('keeps raw and mirrored class names separate when collapse is disabled', () => {
    const styleKeys = {
      button: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      },
      card: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const shortenMap = {
      borderWidth__2: 'bw0',
      'borderWidth__2@@m': 'bw1'
    } as ShortenCssClassNames;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
    });

    const button = out.core.button as Record<string, ClassNameByElementJSON>;
    const card = out.core.card as Record<string, ClassNameByElementJSON>;

    expect(button.e1.s?.['md:1']).toBe('bw1');
    expect(card.e1.s?.['md:1']).toBe('bw0');
  });
});
