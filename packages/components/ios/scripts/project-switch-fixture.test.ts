import { describe, expect, it } from 'vitest';
import { projectSwitchFixturePalettes } from './project-switch-fixture.ts';

describe('native Switch fixture projection', () => {
  it('selects onSubtle Standard while preserving every segment, theme and non-palette field', () => {
    const palettes = Object.fromEntries(
      ['default', 'teams'].map((segment) => [
        segment,
        Object.fromEntries(
          ['light', 'dark', 'darker'].map((theme) => [
            theme,
            {
              onSubtle: {
                standard: {
                  boxColor: {
                    primary: {
                      medium: {
                        rest: `${segment}/${theme}`,
                        hover: { ref: 'fg:neutral.standard.light.onSubtle.high' }
                      }
                    }
                  }
                },
                alternative: { boxColor: 'alternative' }
              },
              onVivid: { standard: { boxColor: 'vivid' } }
            }
          ])
        )
      ])
    );
    const source = {
      options: { density: 'regular' },
      variants: {
        standard: {
          modes: {
            base: {
              elements: { e1: { scales: { boxWidth: 20 }, palettes } }
            }
          }
        }
      }
    };
    const before = structuredClone(source);
    const projected = projectSwitchFixturePalettes(source);
    const element = projected.variants.standard.modes.base.elements.e1;
    expect(element.scales).toEqual(source.variants.standard.modes.base.elements.e1.scales);
    expect(projected.options).toEqual(source.options);
    for (const [segment, themes] of Object.entries(palettes)) {
      for (const [theme, contexts] of Object.entries(themes)) {
        expect(element.palettes[segment]![theme]).toEqual(contexts.onSubtle.standard);
        expect(element.palettes[segment]![theme]).not.toBe(contexts.onSubtle.standard);
      }
    }
    expect(source).toEqual(before);
  });

  it('rejects missing canonical Standard paint instead of falling back to another context', () => {
    expect(() =>
      projectSwitchFixturePalettes({
        elements: {
          e1: {
            palettes: {
              default: { light: { onVivid: { standard: {} } } }
            }
          }
        }
      })
    ).toThrow('missing onSubtle.standard');
  });
});
