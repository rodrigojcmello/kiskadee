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
          { intent: 'neutral', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
          { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
          { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
          { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
          { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' }
        ],
        dark: [
          { intent: 'neutral', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
          { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
          { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
          { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
          { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' }
        ],
        darker: [
          { intent: 'neutral', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
          { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
          { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
          { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
          { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' },
          { intent: 'neutral', emphasis: 'highest', contentSurfaceContext: 'onSubtle' }
        ]
      }
    });
  });

  it('uses the tinted Fluent neutral family without replacing absolute white and black', () => {
    const palettes = requireCardSurfaceElement().palettes.default;

    expect(palettes?.light?.onSubtle.boxColor?.neutral).toMatchObject({
      lowest: { rest: '#ffffff' },
      low: { rest: '#f9fbff' },
      medium: { rest: '#eef2fc' }
    });
    expect(palettes?.light?.onSubtle.boxColor?.neutral).not.toHaveProperty('highest');

    expect(palettes?.dark?.onSubtle.boxColor?.neutral).toMatchObject({
      lowest: { rest: '#262a33' },
      low: { rest: '#1d1f28' },
      medium: { rest: '#11131c' }
    });
    expect(palettes?.dark?.onSubtle.boxColor?.neutral).not.toHaveProperty('highest');

    expect(palettes?.darker?.onSubtle.boxColor?.neutral).toMatchObject({
      lowest: { rest: '#262a33' },
      low: { rest: '#1d1f28' },
      medium: { rest: '#11131c' },
      highest: { rest: '#000000' }
    });
  });

  it('uses Background 4 for Light Medium while preserving the existing state colors', () => {
    const light = requireCardSurfaceElement().palettes.default?.light?.onSubtle.boxColor?.neutral;
    const dark = requireCardSurfaceElement().palettes.default?.dark?.onSubtle.boxColor?.neutral;

    expect(light?.medium).toMatchObject({
      rest: '#eef2fc',
      hover: '#e9edfa',
      pressed: '#d2d6e2',
      disabled: '#eef2fc',
      selected: { rest: '#dce0ed' }
    });
    expect(dark?.medium).toMatchObject({
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

    expect(palettes?.dark?.onSubtle.boxColor?.primary?.medium).toMatchObject(expectedPrimaryMedium);
    expect(palettes?.darker?.onSubtle.boxColor?.primary?.medium).toMatchObject(
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

    for (const theme of ['light', 'dark', 'darker'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const palette = palettes?.[theme]?.[context];
        expect(Object.keys(palette?.boxColor?.neutral ?? {})).toEqual(
          theme === 'darker' ? ['lowest', 'low', 'medium', 'highest'] : ['lowest', 'low', 'medium']
        );
        expect(Object.keys(palette?.boxColor?.primary ?? {})).toEqual([
          'lowest',
          'medium',
          'highest'
        ]);
        expect(palette?.boxColor?.primary?.lowest).toEqual(palette?.boxColor?.neutral?.lowest);
        expect(palette?.boxColor?.neutral?.lowest?.rest).not.toMatch(/00$/);
        expect(
          schema.components.card?.contentSurfaceContext?.default?.[theme]?.[context]?.neutral
            ?.lowest
        ).toEqual({ rest: 'onSubtle' });
        expect(
          schema.components.card?.contentSurfaceContext?.default?.[theme]?.[context]?.primary
            ?.lowest
        ).toEqual({ rest: 'onSubtle' });
        expect(palette?.borderColor?.neutral).not.toHaveProperty('high');
        expect(palette?.borderColor?.primary).not.toHaveProperty('low');
      }
    }

    expect(palettes?.light?.onSubtle.boxColor?.primary).not.toHaveProperty('high');
    expect(palettes?.light?.onSubtle.boxColor?.primary?.highest).toMatchObject(
      expectedLightPrimaryHighest
    );

    expect(palettes?.dark?.onSubtle.boxColor?.primary).not.toHaveProperty('high');
    expect(palettes?.dark?.onSubtle.boxColor?.primary?.highest).toMatchObject(
      expectedDarkPrimaryHighest
    );

    expect(palettes?.darker?.onSubtle.boxColor?.primary).not.toHaveProperty('high');
    expect(palettes?.darker?.onSubtle.boxColor?.primary?.highest).toMatchObject(
      expectedDarkPrimaryHighest
    );
  });
});
