import {
  componentEmphasisBuckets,
  resolveCardSurfaceSource,
  surfaceContextBuckets,
  validateCardComponentContract
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../../../presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';

const resolvedCard = resolveCardSurfaceSource(schema).components.card!;

describe('Card border pipeline', () => {
  it.each([
    ['default', 'invalid'],
    ['default', 'light', 'invalid'],
    ['default', 'light', 'onSubtle', 'invalid'],
    ['default', 'light', 'onSubtle', 'neutral', 'highest'],
    ['missing', 'light', 'onSubtle', 'neutral', 'medium']
  ])('rejects unknown or unpublished coordinate %j', (...keys: string[]) => {
    const border = keys.reduceRight<unknown>((value, key) => ({ [key]: value }), false);
    const invalid = { ...resolvedCard, options: { border } };
    expect(validateCardComponentContract(invalid).length).toBeGreaterThan(0);
  });
  it('validates every declared recipe and rejects missing coverage', () => {
    expect(validateCardComponentContract(resolvedCard)).toEqual([]);
    const invalid = structuredClone(resolvedCard);
    delete invalid.elements.e1!.scales!.borderWidth;
    expect(
      validateCardComponentContract(invalid).some((issue) => issue.includes('borderWidth'))
    ).toBe(true);
  });

  it('keeps Rest paint opt-in and all CardAction deltas in the regular palette', () => {
    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys({
      ...schema,
      components: { card: resolvedCard }
    });
    const usage = mapStyleKeyUsage(styleKeys, {
      additionalStyleKeys: ['borderColor__#00000000']
    });
    const names = shortenCssClassNames(usage);
    const result = generateClassNamesMapSplit(styleKeys, names, toneMetadataByPalette, {
      cardBorderDefaults: resolvedCard.options?.border
    });
    for (const theme of ['light', 'dark', 'darker'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        for (const intent of ['neutral', 'primary'] as const) {
          const levels = resolvedCard.options!.border!.default![theme]![context]![intent]!;
          const element = result.palettes[`default.${theme}`].card as {
            e1: import('@kiskadee/core').ClassNameByElementJSON;
          };
          for (const [emphasis, enabled] of Object.entries(levels)) {
            const bucket =
              componentEmphasisBuckets[emphasis as keyof typeof componentEmphasisBuckets];
            const recipe = element.e1.b![surfaceContextBuckets[context]]![intent]![bucket]!;
            expect(recipe.default).toBe(enabled);
            expect(recipe.off).toBe(names['borderColor__#00000000']);
            expect(recipe.on).not.toContain('__');
            expect(
              element.e1.c![surfaceContextBuckets[context]]![intent]![bucket]?.split(' ')
            ).not.toContain(recipe.on);
          }
        }
      }
    }
  });
});
