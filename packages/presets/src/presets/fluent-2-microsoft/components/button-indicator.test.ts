import { parseForegroundReferenceToken, validateButtonComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const button = schema.components.button!;
const indicator = button.elements.e11!;
const indicatorRecipes = { inside: indicator, outside: button.elements.e12! };
const segments = ['default', 'teams'] as const;
const themes = ['light', 'dark', 'darker'] as const;
const contexts = ['onSubtle', 'onVivid'] as const;
const intents = ['primary', 'neutral', 'destructive', 'positive'] as const;
const emphases = ['high', 'medium', 'low', 'lowest'] as const;
const placements = ['inside', 'outside'] as const;

function resolveForeground(value: unknown, segment: (typeof segments)[number]): string {
  expect(value).toEqual({ parentState: expect.stringMatching(/^fg:/) });
  const token = (value as { parentState: string }).parentState;
  const coordinate = parseForegroundReferenceToken(token)!;
  expect(coordinate, token).toBeDefined();
  expect(coordinate.state).toBe('rest');
  expect(['blue', 'neutral']).toContain(coordinate.family);
  return schema.global!.foregrounds!.profiles[coordinate.family]![coordinate.profile]!.palettes[
    segment
  ]![coordinate.theme]![coordinate.surfaceContext]![coordinate.emphasis][
    coordinate.state
  ] as string;
}

function composite(foreground: string, background: string): string {
  const alpha = foreground.length === 9 ? Number.parseInt(foreground.slice(7, 9), 16) / 255 : 1;
  return `#${foreground
    .slice(1, 7)
    .match(/../g)!
    .map((channel, index) =>
      Math.round(
        Number.parseInt(channel, 16) * alpha +
          Number.parseInt(background.slice(1 + index * 2, 3 + index * 2), 16) * (1 - alpha)
      )
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [red = 0, green = 0, blue = 0] = hex
      .slice(1, 7)
      .match(/../g)!
      .map((channel) => {
        const value = Number.parseInt(channel, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe('Fluent Button selected indicator', () => {
  it('publishes one shared line geometry without modifying the Button size recipes', () => {
    expect(validateButtonComponentContract(button)).toEqual([]);
    expect(button.options!.indicatorPlacement).toBe('inside');
    expect(button.options!.indicatorScope).toBe('stacked');
    expect(indicator.scales).toEqual({
      boxWidth: { 's:sm:1': 24, 's:md:1': 30, 's:lg:1': 36, 's:lg:2': 36 },
      boxHeight: 2,
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 2,
      marginRight: 2,
      borderRadius: { rounded: 2, pill: 2, square: 0 }
    });
    expect(indicatorRecipes.outside.scales).toEqual(indicator.scales);
    for (const recipe of Object.values(indicatorRecipes)) {
      expect(recipe).not.toHaveProperty('effects');
      expect(recipe).not.toHaveProperty('placements');
    }
    expect(button.elements.e1!.scales!._boxHeight).toEqual({
      's:sm:1': 24,
      's:md:1': 32,
      's:lg:1': 40,
      's:lg:2': 48
    });
  });

  it('covers both placements and complete segment matrices with only ancestor Selected paint', () => {
    for (const placement of placements) {
      for (const segment of segments) {
        for (const theme of themes) {
          for (const context of contexts) {
            const palette = indicatorRecipes[placement].palettes[segment]![theme]![context]!;
            expect(Object.keys(palette)).toEqual(['boxColor']);
            expect(Object.keys(palette.boxColor!).sort()).toEqual([...intents].sort());
            for (const intent of intents) {
              expect(Object.keys(palette.boxColor![intent]!).sort()).toEqual([...emphases].sort());
              for (const emphasis of emphases) {
                const states = palette.boxColor![intent]![emphasis]!;
                expect(Object.keys(states)).toEqual(['selected']);
                expect(Object.keys(states.selected!)).toEqual(['rest']);
                resolveForeground(states.selected!.rest, segment);
              }
            }
          }
        }
      }
    }
  });

  it('keeps one brand signal across intents and changes only the necessary host polarity', () => {
    for (const placement of placements) {
      for (const segment of segments) {
        for (const theme of themes) {
          for (const context of contexts) {
            const colors =
              indicatorRecipes[placement].palettes[segment]![theme]![context]!.boxColor!;
            for (const emphasis of emphases) {
              for (const intent of ['destructive', 'positive'] as const) {
                expect(colors[intent]![emphasis]).toEqual(colors.primary![emphasis]);
              }
              const hasDifferentNeutralPolarity =
                placement === 'inside' &&
                context === 'onSubtle' &&
                emphasis === 'high' &&
                theme !== 'light';
              if (hasDifferentNeutralPolarity) {
                expect(colors.neutral![emphasis]).not.toEqual(colors.primary![emphasis]);
              } else {
                expect(colors.neutral![emphasis]).toEqual(colors.primary![emphasis]);
              }
            }
          }
        }
      }
    }
    const primaryPaint =
      indicatorRecipes.outside.palettes.default!.light!.onSubtle.boxColor!.primary!.high!.selected!
        .rest;
    expect(resolveForeground(primaryPaint, 'default')).not.toBe(
      resolveForeground(primaryPaint, 'teams')
    );
    const inversePaint =
      indicatorRecipes.outside.palettes.default!.light!.onVivid!.boxColor!.primary!.high!.selected!
        .rest;
    expect(resolveForeground(inversePaint, 'default')).toBe(
      resolveForeground(inversePaint, 'teams')
    );
  });

  it('contrasts with the selected Button surface inside and canonical ambient surface outside', () => {
    for (const segment of segments) {
      for (const theme of themes) {
        const container =
          schema.components.container!.elements.e1!.palettes![segment]![theme]!.onSubtle.boxColor!;
        for (const context of contexts) {
          const ambient = (
            context === 'onSubtle'
              ? container.neutral!.lowest!.rest
              : container.primary!.highest!.rest
          ) as string;
          for (const intent of intents) {
            for (const emphasis of emphases) {
              const selected = button.elements.e1!.palettes![segment]![theme]![context]!.boxColor![
                intent
              ]![emphasis]!.selected!.rest as string;
              for (const placement of placements) {
                const paint =
                  indicatorRecipes[placement].palettes[segment]![theme]![context]!.boxColor![
                    intent
                  ]![emphasis]!.selected!.rest;
                const background = placement === 'inside' ? composite(selected, ambient) : ambient;
                const foreground = composite(resolveForeground(paint, segment), background);
                expect
                  .soft(
                    contrastRatio(foreground, background),
                    `${segment}/${theme}/${context}/${intent}/${emphasis}/${placement}`
                  )
                  .toBeGreaterThanOrEqual(3);
              }
            }
          }
        }
      }
    }
  });
});
