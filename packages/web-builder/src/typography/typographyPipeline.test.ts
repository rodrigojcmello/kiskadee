import type { ClassNameByElementJSON, Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { buildTypographyArtifact } from './compileTypography.ts';

const schema = {
  name: 'Typography pipeline',
  prefix: 'type',
  version: [1, 0, 0],
  author: 'Kiskadee',
  breakpoints: { 'bp:all': 0, 'bp:lg:1': 1200 },
  global: {
    typography: {
      profiles: {
        'label-small': {
          decorations: { textFont: 'body', textWeight: 'normal' },
          scales: { textSize: 12, textHeight: 16, textLetterSpacing: 0.12 }
        },
        'label-medium': {
          decorations: { textFont: 'body', textWeight: 'semiBold' },
          scales: { textSize: 14, textHeight: 20 }
        },
        'heading-large': {
          decorations: { textFont: 'heading', textWeight: 'bold' },
          scales: { textSize: 32, textHeight: 40 }
        }
      }
    }
  },
  components: {
    button: {
      elements: {
        e2: {
          name: 'button-text',
          typography: {
            's:sm:1': 'label-small',
            's:md:1': 'label-medium'
          }
        }
      }
    }
  }
} as const satisfies Schema;

describe('typography Web pipeline', () => {
  it('lowers profiles into d/s only and publishes reusable atomic profile classes', async () => {
    const { styleKeys, toneMetadataByPalette, typographyBuild } =
      convertElementSchemaToStyleKeys(schema);
    if (!typographyBuild) throw new Error('Expected typography build.');

    const usage = mapStyleKeyUsage(styleKeys, {
      additionalStyleKeys: typographyBuild.additionalCoreStyleKeys
    });
    const shortenMap = shortenCssClassNames(usage, { prefix: 'type-' });
    const css = await generateCssSplit(styleKeys, shortenMap, {
      breakpoints: schema.breakpoints,
      additionalCoreStyleKeys: typographyBuild.additionalCoreStyleKeys
    });
    const classMaps = generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette);
    const button = classMaps.core.button as Record<string, ClassNameByElementJSON> | undefined;
    const element = button?.e2;

    expect(element?.d).toBe(shortenMap.textFont__body);
    expect(element?.s?.['sm:1']).toContain(shortenMap.textWeight__normal);
    expect(element?.s?.['md:1']).toContain(shortenMap.textWeight__semiBold);
    expect(element).not.toHaveProperty('t');
    expect(css.coreCss).toContain('font-size: 0.75rem');
    expect(css.coreCss).toContain('line-height: 1.333333');
    expect(css.coreCss).toContain('letter-spacing: 0.01em');

    const artifact = buildTypographyArtifact(typographyBuild, shortenMap);
    expect(artifact.profiles['label-small']?.className.split(' ')).toEqual([
      shortenMap.textFont__body,
      shortenMap.textWeight__normal,
      shortenMap.textSize__12,
      shortenMap['textLineHeight__1.333333'],
      shortenMap['textLetterSpacing__0.01']
    ]);
    expect(artifact.usage['label-medium']).toEqual([
      {
        component: 'button',
        element: 'e2',
        elementName: 'button-text',
        scale: 's:md:1'
      }
    ]);
    expect(artifact.usage['heading-large']).toEqual([]);
    for (const className of artifact.profiles['heading-large']?.className.split(' ') ?? []) {
      expect(css.coreCss).toContain(`.${className}`);
    }
  });
});
