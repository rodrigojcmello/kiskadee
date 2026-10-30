import { validateButtonComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { schema } from '../material-3-google.schema.ts';

const button = schema.components.button!;
const indicatorRecipes = { inside: button.elements.e11!, outside: button.elements.e12! };
const segments = ['default', 'dynamic', 'purple'] as const;
const themes = ['light', 'dark'] as const;
const contexts = ['onSubtle', 'onVivid'] as const;
const intents = ['primary', 'neutral', 'destructive', 'positive', 'support'] as const;
const emphases = ['high', 'medium', 'low', 'lowest'] as const;
const placements = ['inside', 'outside'] as const;
const c = createPresetColorGetter<(typeof segments)[number]>({ colors: schemaColors });

function resolvePaint(value: unknown): string {
  expect(value).toEqual({ ref: expect.stringMatching(/^#[0-9a-f]{6}$/i) });
  return (value as { ref: string }).ref;
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

describe('Material Button selected indicator', () => {
  it('publishes both placements with complete matrices and only ancestor Selected paint', () => {
    expect(validateButtonComponentContract(button)).toEqual([]);
    expect(button.options!.selectionEmphasis).toBe('lowest');
    expect(button.options).not.toHaveProperty('indicatorScope');
    for (const placement of placements) {
      for (const segment of segments) {
        for (const theme of themes) {
          for (const context of contexts) {
            const palette = indicatorRecipes[placement].palettes[segment]![theme]![context]!;
            expect(Object.keys(palette)).toEqual(['boxColor']);
            expect(Object.keys(palette.boxColor).sort()).toEqual([...intents].sort());
            for (const intent of intents) {
              expect(Object.keys(palette.boxColor[intent]!).sort()).toEqual([...emphases].sort());
              for (const emphasis of emphases) {
                const states = palette.boxColor[intent]![emphasis]!;
                expect(Object.keys(states)).toEqual(['selected']);
                expect(Object.keys(states.selected!)).toEqual(['rest']);
                resolvePaint(states.selected!.rest);
              }
            }
          }
        }
      }
    }
  });

  it('keeps the signal independent of intent while following each selected emphasis polarity', () => {
    for (const placement of placements) {
      for (const segment of segments) {
        for (const theme of themes) {
          for (const context of contexts) {
            const colors =
              indicatorRecipes[placement].palettes[segment]![theme]![context]!.boxColor;
            for (const emphasis of emphases) {
              const signal = colors.primary![emphasis]!.selected!.rest;
              for (const intent of intents) {
                expect(colors[intent]![emphasis]!.selected!.rest).toEqual(signal);
              }
              if (placement === 'inside' && context === 'onSubtle' && emphasis === 'high') {
                expect(resolvePaint(signal)).toBe(
                  c(segment, 'l', 'primitive.black.v1', theme === 'light' ? 0 : 100)
                );
              }
            }
            expect(colors.primary!.medium).toEqual(colors.primary!.low);
            expect(colors.primary!.medium).toEqual(colors.primary!.lowest);
          }
        }
      }
    }
  });

  it('resolves the brand signal through each segment primary and keeps inverse caps shared', () => {
    for (const theme of themes) {
      for (const context of contexts) {
        for (const placement of placements) {
          for (const emphasis of emphases) {
            const paint = (segment: (typeof segments)[number]) =>
              resolvePaint(
                indicatorRecipes[placement].palettes[segment]![theme]![context]!.boxColor.primary![
                  emphasis
                ]!.selected!.rest
              );
            expect(paint('default')).toBe(paint('dynamic'));
            const usesPrimary =
              (placement === 'inside' &&
                ((emphasis === 'high' && context === 'onVivid') ||
                  (emphasis !== 'high' && context === 'onSubtle'))) ||
              (placement === 'outside' && context === 'onSubtle');
            if (usesPrimary) {
              expect(paint('default')).not.toBe(paint('purple'));
              for (const segment of segments) {
                expect(paint(segment)).toBe(
                  placement === 'outside' && theme === 'light'
                    ? c.ref(segment, 'l', 'button.primary', 'vivid')
                    : placement === 'inside' && context === 'onVivid'
                      ? c(segment, 'l', 'button.primary', 65)
                      : c(
                          segment,
                          theme === 'light' ? 'l' : 'd',
                          'button.primary',
                          theme === 'light' ? 65 : 85
                        )
                );
              }
            } else {
              expect(paint('default')).toBe(paint('purple'));
            }
          }
        }
      }
    }
  });

  it('contrasts through selected interactions inside and with canonical ambient surfaces outside', () => {
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
              const host =
                button.elements.e1!.palettes![segment]![theme]![context]!.boxColor![intent]![
                  emphasis
                ]!;
              const selected = host.selected!;
              expect(selected.rest).toBe(host.pressed);
              for (const state of ['rest', 'hover', 'focus', 'pressed'] as const) {
                const surface = (selected[state] ?? selected.rest) as string;
                for (const placement of placements) {
                  const paint =
                    indicatorRecipes[placement].palettes[segment]![theme]![context]!.boxColor[
                      intent
                    ]![emphasis]!.selected!;
                  const background = placement === 'inside' ? composite(surface, ambient) : ambient;
                  const foreground = composite(
                    resolvePaint(paint[state] ?? paint.rest),
                    background
                  );
                  expect
                    .soft(
                      contrastRatio(foreground, background),
                      `${segment}/${theme}/${context}/${intent}/${emphasis}/${placement}/${state}`
                    )
                    .toBeGreaterThanOrEqual(3);
                }
              }
            }
          }
        }
      }
    }
  });

  it('contrasts over ordinary High states used by high selection emphasis without Selected paint', () => {
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
            const host =
              button.elements.e1!.palettes![segment]![theme]![context]!.boxColor![intent]!.high!;
            for (const state of ['rest', 'hover', 'focus', 'pressed'] as const) {
              const surface = (host[state] ?? host.rest) as string;
              for (const placement of placements) {
                const paint =
                  indicatorRecipes[placement].palettes[segment]![theme]![context]!.boxColor[intent]!
                    .high!.selected!.rest;
                const background = placement === 'inside' ? composite(surface, ambient) : ambient;
                const foreground = composite(resolvePaint(paint), background);
                expect
                  .soft(
                    contrastRatio(foreground, background),
                    `${segment}/${theme}/${context}/${intent}/high-rest/${placement}/${state}`
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
