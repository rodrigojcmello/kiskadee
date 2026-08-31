import type { ClassNameByElementJSON, Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import {
  buildTextTypographyClassMap,
  buildTypographyArtifact
} from '../typography/compileTypography.ts';

const schema = {
  name: 'Foreground pipeline',
  prefix: 'fg-',
  version: [1, 0, 0],
  author: 'Kiskadee',
  breakpoints: { 'bp:all': 0 },
  global: {
    typography: {
      profiles: {
        'body-medium': {
          decorations: { textFont: 'body', textWeight: 'normal' },
          scales: { textSize: 14, textHeight: 20 }
        }
      }
    },
    foregrounds: {
      profiles: {
        neutral: {
          palettes: {
            default: {
              light: {
                onSubtle: {
                  medium: { rest: '#333333' },
                  low: { rest: '#555555' },
                  lowest: { rest: '#777777' }
                },
                onVivid: {
                  medium: { rest: '#ffffffd6' },
                  low: { rest: '#ffffffad' },
                  lowest: { rest: '#ffffff99' }
                }
              }
            }
          }
        },
        red: {
          palettes: {
            default: {
              light: {
                onSubtle: {
                  medium: { rest: '#811819' },
                  low: { rest: '#811819ad' },
                  lowest: { rest: '#8118193d' }
                },
                onVivid: {
                  medium: { rest: '#ffdbd7' },
                  low: { rest: '#ffdbd7ad' },
                  lowest: { rest: '#ffdbd73d' }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    text: {
      elements: {
        e1: {
          name: 'foreground',
          foreground: { neutral: 'neutral', red: 'red' }
        }
      }
    }
  }
} as const satisfies Schema;

describe('foreground Web pipeline', () => {
  it('emits color through c.s/c.v without replacing the typography channel', async () => {
    const { styleKeys, toneMetadataByPalette, typographyBuild } =
      convertElementSchemaToStyleKeys(schema);
    if (!typographyBuild) throw new Error('Expected typography build.');

    const usage = mapStyleKeyUsage(styleKeys, {
      additionalStyleKeys: typographyBuild.additionalCoreStyleKeys
    });
    const shortenMap = shortenCssClassNames(usage, { prefix: 'fg-' });
    const css = await generateCssSplit(styleKeys, shortenMap, {
      breakpoints: schema.breakpoints,
      additionalCoreStyleKeys: typographyBuild.additionalCoreStyleKeys
    });
    const classMaps = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette);
    const text = classMaps.palettes['default.light']?.text as
      | Record<string, ClassNameByElementJSON>
      | undefined;

    expect(text?.e1.c?.s?.neutral).toEqual({
      m: shortenMap['textColor__#333333'],
      l: shortenMap['textColor__#555555'],
      ll: shortenMap['textColor__#777777']
    });
    expect(text?.e1.c?.v?.neutral).toEqual({
      m: shortenMap['textColor__#ffffffd6'],
      l: shortenMap['textColor__#ffffffad'],
      ll: shortenMap['textColor__#ffffff99']
    });
    expect(text?.e1.c?.s?.red).toEqual({
      m: shortenMap['textColor__#811819'],
      l: shortenMap['textColor__#811819ad'],
      ll: shortenMap['textColor__#8118193d']
    });
    expect(text?.e1.c?.v?.red).toEqual({
      m: shortenMap['textColor__#ffdbd7'],
      l: shortenMap['textColor__#ffdbd7ad'],
      ll: shortenMap['textColor__#ffdbd73d']
    });
    expect(css.palettes['default.light']).toContain('color: #333');
    expect(text?.e1).not.toHaveProperty('t');

    const typographyArtifact = buildTypographyArtifact(typographyBuild, shortenMap);
    expect(buildTextTypographyClassMap(typographyArtifact).e1.t).toHaveProperty('bm');
  });
});
