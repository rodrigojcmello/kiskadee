import type {
  ClassNameByElementJSON,
  ColorClasses,
  ComponentStyleKeyMap,
  Schema
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import type { ToneMetadataByPalette } from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import { generateClassNamesMapSplit } from './generateClassNamesMap.ts';

describe('generateClassNamesMapSplit', () => {
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

  it('keeps shared palette style keys in the tone bucket declared by the current element', () => {
    const sharedColor = [0, 0, 0, 1] as const;
    const schema = {
      name: 'Test Design System',
      version: [1, 0, 0],
      author: 'Kiskadee',
      breakpoints: {
        'bp:all': 0
      },
      components: {
        button: {
          elements: {
            e2: {
              palettes: {
                default: {
                  light: {
                    textColor: {
                      primary: {
                        high: {
                          rest: sharedColor
                        }
                      }
                    }
                  }
                }
              }
            },
            e3: {
              palettes: {
                default: {
                  light: {
                    textColor: {
                      primary: {
                        medium: {
                          rest: sharedColor
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } satisfies Schema;

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const out = generateClassNamesMapSplit(
      styleKeys,
      {
        'textColor__[0,0,0,1]': 'txt'
      },
      toneMetadataByPalette
    );

    const button = out.palettes['default.light'].button as Record<string, ClassNameByElementJSON>;
    const e2Primary = button.e2.c?.primary as ColorClasses;
    const e3Primary = button.e3.c?.primary as ColorClasses;

    expect(e2Primary).toEqual({
      h: 'txt'
    });
    expect(e3Primary).toEqual({
      m: 'txt'
    });
  });

  it('groups border radius effects by size inside effect buckets', () => {
    const styleKeys = {
      button: {
        e1: {
          effects: {
            hover: [
              'borderRadiusRounded--hover__20',
              'borderRadiusRounded--hover++s:md:1__16',
              'borderRadiusRounded--hover++s:lg:1__12'
            ]
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const toneMetadataByPalette = new Map() as ToneMetadataByPalette;
    const out = generateClassNamesMapSplit(
      styleKeys,
      {} as ShortenCssClassNames,
      toneMetadataByPalette
    );

    const button = out.core.button as Record<string, ClassNameByElementJSON>;

    expect(button.e1.e).toEqual({
      rr: {
        all: 'borderRadiusRounded--hover__20',
        'md:1': 'borderRadiusRounded--hover++s:md:1__16',
        'lg:1': 'borderRadiusRounded--hover++s:lg:1__12'
      }
    });
  });
});
