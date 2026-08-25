import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireIconElement() {
  const element = schema.components.icon?.elements.e1;
  if (!element?.palettes || !element.iconSize) {
    throw new Error('Fluent Icon schema is missing');
  }
  return element;
}

describe('Fluent 2 Icon', () => {
  it('publishes the approved discrete icon sizes', () => {
    expect(schema.global?.iconSizes).toEqual({
      's:sm:5': 6,
      's:sm:4': 8,
      's:sm:3': 10,
      's:sm:2': 12,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 28,
      's:lg:3': 32,
      's:lg:4': 48
    });
    expect(requireIconElement().iconSize).toEqual({
      's:sm:2': 's:sm:2',
      's:sm:1': 's:sm:1',
      's:md:1': 's:md:1',
      's:lg:1': 's:lg:1',
      's:lg:2': 's:lg:2',
      's:lg:3': 's:lg:3',
      's:lg:4': 's:lg:4'
    });
  });

  it('keeps monochrome colors theme-aware on subtle surfaces', () => {
    const palettes = requireIconElement().palettes.default;

    expect(palettes?.light?.onSubtle.textColor).toEqual({
      neutral: { medium: { rest: '#21242d' } },
      primary: { medium: { rest: '#0064b4' } }
    });
    expect(palettes?.dark?.onSubtle.textColor).toEqual({
      neutral: { medium: { rest: '#d2d6e3' } },
      primary: { medium: { rest: '#0064b4' } }
    });
    expect(palettes?.darker?.onSubtle).toEqual(palettes?.dark?.onSubtle);
  });

  it('uses absolute neutral white and a physically light primary on vivid surfaces', () => {
    const palettes = requireIconElement().palettes.default;
    const expected = {
      textColor: {
        neutral: { medium: { rest: '#ffffff' } },
        primary: { medium: { rest: '#c1deff' } }
      }
    };

    expect(palettes?.light?.onVivid).toEqual(expected);
    expect(palettes?.dark?.onVivid).toEqual(expected);
    expect(palettes?.darker?.onVivid).toEqual(expected);
  });
});
