import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireCardSurfaceElement() {
  const element = schema.components.card?.elements.e1;
  if (!element?.palettes) throw new Error('Fluent Card surface schema is missing');
  return { ...element, palettes: element.palettes };
}

describe('Fluent 2 Card canonical surfaces', () => {
  it('uses the tinted Fluent neutral family without replacing absolute white and black', () => {
    const palettes = requireCardSurfaceElement().palettes.default;

    expect(palettes?.light?.default.boxColor?.neutral).toMatchObject({
      lowest: { rest: '#ffffff00' },
      low: { rest: '#ffffff' },
      medium: { rest: '#f9fbff' },
      high: { rest: '#f4f6fe' }
    });
    expect(palettes?.light?.default.boxColor?.neutral).not.toHaveProperty('highest');

    expect(palettes?.dark?.default.boxColor?.neutral).toMatchObject({
      lowest: { rest: '#00000000' },
      low: { rest: '#262a33' },
      medium: { rest: '#1d1f28' },
      high: { rest: '#11131c' }
    });
    expect(palettes?.dark?.default.boxColor?.neutral).not.toHaveProperty('highest');

    expect(palettes?.darker?.default.boxColor?.neutral).toMatchObject({
      lowest: { rest: '#00000000' },
      low: { rest: '#262a33' },
      medium: { rest: '#1d1f28' },
      high: { rest: '#11131c' },
      highest: { rest: '#000000' }
    });
  });

  it('keeps adjacent Neutral Background stops as state deltas instead of duplicate surfaces', () => {
    const light = requireCardSurfaceElement().palettes.default?.light?.default.boxColor?.neutral;
    const dark = requireCardSurfaceElement().palettes.default?.dark?.default.boxColor?.neutral;

    expect(light?.high).toMatchObject({
      rest: '#f4f6fe',
      hover: '#e9edfa',
      pressed: '#d2d6e2',
      disabled: '#eef2fc',
      selected: { rest: '#dce0ed' }
    });
    expect(dark?.high).toMatchObject({
      rest: '#11131c',
      hover: '#262a33',
      pressed: '#05060d',
      selected: { rest: '#21242d' }
    });
  });
});
