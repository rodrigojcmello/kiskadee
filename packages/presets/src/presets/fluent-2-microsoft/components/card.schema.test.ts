import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireCardSurfaceElement() {
  const element = schema.components.card?.elements.e1;
  if (!element?.palettes) throw new Error('Fluent Card surface schema is missing');
  return { ...element, palettes: element.palettes };
}

describe('Fluent 2 Card canonical surfaces', () => {
  it('declares the ordered canonical catalog and its descendant surface contexts', () => {
    expect(schema.components.card?.options?.canonicalSurfaces).toEqual({
      default: {
        light: [
          { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'default' },
          { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'default' },
          { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'default' },
          { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'default' },
          { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'inverse' }
        ],
        dark: [
          { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'default' },
          { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'default' },
          { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'default' },
          { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'default' },
          { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'inverse' }
        ],
        darker: [
          { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'default' },
          { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'default' },
          { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'default' },
          { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'default' },
          { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'inverse' },
          { intent: 'neutral', emphasis: 'highest', contentSurfaceContext: 'default' }
        ]
      }
    });
  });

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

  it('keeps the approved dark-blue Primary Medium progression in Dark and Darker', () => {
    const palettes = requireCardSurfaceElement().palettes.default;
    const expectedPrimaryMedium = {
      rest: '#142d48',
      hover: '#143a61',
      pressed: '#13273e',
      selected: { rest: '#153251' },
      disabled: '#11131c'
    };

    expect(palettes?.dark?.default.boxColor?.primary?.medium).toMatchObject(expectedPrimaryMedium);
    expect(palettes?.darker?.default.boxColor?.primary?.medium).toMatchObject(
      expectedPrimaryMedium
    );
  });

  it('publishes the vivid Primary surface as Highest and leaves High intentionally absent', () => {
    const palettes = requireCardSurfaceElement().palettes.default;
    const expectedLightPrimaryHighest = {
      rest: '#0064b4',
      hover: '#0059a1',
      pressed: '#14375a',
      selected: { rest: '#045091' },
      disabled: '#eef2fc'
    };
    const expectedDarkPrimaryHighest = {
      rest: '#005ba4',
      hover: '#0064b4',
      pressed: '#14375b',
      selected: { rest: '#074d89' },
      disabled: '#11131c'
    };

    expect(palettes?.light?.default.boxColor?.primary).not.toHaveProperty('high');
    expect(palettes?.light?.default.boxColor?.primary?.highest).toMatchObject(
      expectedLightPrimaryHighest
    );

    expect(palettes?.dark?.default.boxColor?.primary).not.toHaveProperty('high');
    expect(palettes?.dark?.default.boxColor?.primary?.highest).toMatchObject(
      expectedDarkPrimaryHighest
    );

    expect(palettes?.darker?.default.boxColor?.primary).not.toHaveProperty('high');
    expect(palettes?.darker?.default.boxColor?.primary?.highest).toMatchObject(
      expectedDarkPrimaryHighest
    );
  });
});
