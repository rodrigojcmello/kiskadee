import { validateSchemaContoursContract } from '@kiskadee/core/contour-contract';
import { validateSchemaForegroundsContract } from '@kiskadee/core/foreground-contract';
import { validateSchemaSeparatorsContract } from '@kiskadee/core/separator-contract';
import { describe, expect, it } from 'vitest';
import { schema } from '../ios-27-apple.schema.ts';

const themes = ['light', 'dark', 'darker'] as const;
const contexts = ['onSubtle', 'onVivid'] as const;
const card = schema.components.card!;
const foreground = schema.global!.foregrounds!.profiles.neutral.standard.palettes.default!;

function luminance(hex: string) {
  const rgb = hex
    .slice(1, 7)
    .match(/../g)!
    .map((channel) => {
      const value = Number.parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (values[1]! + 0.05) / (values[0]! + 0.05);
}

describe('iOS 27 composition foundations', () => {
  it('resolves the shared foreground, contour and separator contracts', () => {
    expect(() => validateSchemaForegroundsContract(schema)).not.toThrow();
    expect(() => validateSchemaContoursContract(schema)).not.toThrow();
    expect(() => validateSchemaSeparatorsContract(schema)).not.toThrow();
  });

  it.each(
    themes
  )('publishes legible canonical %s surfaces and explicit descendant contexts', (theme) => {
    const palette = card.elements.e1!.palettes!.default![theme]!;
    const canonical = card.options!.canonicalSurfaces!.default![theme]!;
    expect(
      canonical.some((surface) => surface.intent === 'neutral' && surface.emphasis === 'low')
    ).toBe(true);
    expect(
      canonical.some((surface) => surface.intent === 'neutral' && surface.emphasis === 'medium')
    ).toBe(theme !== 'darker');
    for (const surface of canonical) {
      const color = palette.onSubtle.boxColor![surface.intent]![surface.emphasis]!.rest!;
      const ink = foreground[theme]![surface.contentSurfaceContext]!.medium.rest;
      expect(contrast(color as string, ink as string)).toBeGreaterThanOrEqual(4.5);
      for (const context of contexts) {
        expect(palette[context]!.boxColor![surface.intent]![surface.emphasis]!.rest).toBe(color);
        expect(
          card.contentSurfaceContext!.default![theme]![context]![surface.intent]![surface.emphasis]!
            .rest
        ).toBe(surface.contentSurfaceContext);
      }
    }
  });

  it.each(
    themes
  )('switches selected opaque %s Cards to a vivid surface and matching content', (theme) => {
    for (const context of contexts) {
      const colors = card.elements.e1!.palettes!.default![theme]![context]!.boxColor!;
      for (const emphasis of ['lowest', 'low', 'medium'] as const) {
        expect(colors.neutral![emphasis]!.selected!.rest).toBe(colors.primary!.high!.rest);
        expect(
          card.contentSurfaceContext!.default![theme]![context]!.neutral![emphasis]!.selected
        ).toBe('onVivid');
      }
      expect(colors.primary!.medium!.selected!.rest).toBe(colors.primary!.high!.rest);
      expect(card.contentSurfaceContext!.default![theme]![context]!.primary!.medium!.selected).toBe(
        'onVivid'
      );
    }
  });

  it('distinguishes the dark elevated canvas from darker base without changing its label polarity', () => {
    const palettes = card.elements.e1!.palettes!.default!;
    expect(palettes.dark!.onSubtle.boxColor!.neutral!.low!.rest).toBe('#1c1c1e');
    expect(palettes.darker!.onSubtle.boxColor!.neutral!.low!.rest).toBe('#000000');
    expect(foreground.darker!.onSubtle).toEqual(foreground.dark!.onSubtle);
  });
});
