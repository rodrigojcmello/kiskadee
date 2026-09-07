import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireCardSurfaceElement() {
  const element = schema.components.card?.elements.e1;
  if (!element?.palettes) throw new Error('Fluent Card surface schema is missing');
  return { ...element, palettes: element.palettes };
}

describe('Fluent 2 Card canonical surfaces', () => {
  it('uses moderated solid brand borders without changing Highest or interactive deltas', () => {
    const palettes = requireCardSurfaceElement().palettes.default;
    for (const [theme, color] of [
      ['dark', '#0e467b'],
      ['darker', '#143a61']
    ] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const borders = palettes?.[theme]?.[context]?.borderColor?.primary;
        expect(borders?.lowest?.rest).toBe(color);
        expect(borders?.medium?.rest).toBe(color);
        expect(borders?.highest?.rest).toBe(`contour:neutral.standard.${theme}.onVivid.medium`);
      }
      expect(palettes?.[theme]?.onSubtle?.borderColor?.primary?.lowest).toMatchObject({
        hover: '#0064b4',
        pressed: '#14375b',
        selected: { rest: '#074d89' }
      });
    }
    expect(palettes?.light?.onSubtle?.borderColor?.primary?.lowest?.rest).toBe('#0064b4');
  });

  it('keeps Dark neutral contour and reduces only Darker neutral Rest opacity', () => {
    const palettes = requireCardSurfaceElement().palettes.default;
    for (const theme of ['dark', 'darker'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        for (const states of Object.values(
          palettes?.[theme]?.[context]?.borderColor?.neutral ?? {}
        )) {
          expect(states.rest).toBe(
            theme === 'darker' ? '#ffffff1a' : 'contour:neutral.standard.light.onVivid.medium'
          );
        }
      }
    }
    expect(palettes?.light?.onSubtle?.borderColor?.neutral?.lowest?.rest).toBe(
      'contour:neutral.standard.light.onSubtle.medium'
    );
  });

  it('darkens every shared Darker surface state without introducing translucency', () => {
    const palettes = requireCardSurfaceElement().palettes.default;
    const luminance = (hex: string) => {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
      const rgb = [1, 3, 5].map((offset) => {
        const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    for (const context of ['onSubtle', 'onVivid'] as const) {
      const dark = palettes?.dark?.[context]?.boxColor;
      const darker = palettes?.darker?.[context]?.boxColor;
      for (const intent of ['neutral', 'primary'] as const) {
        for (const emphasis of ['lowest', 'low', 'medium', 'highest'] as const) {
          const before = dark?.[intent]?.[emphasis];
          const after = darker?.[intent]?.[emphasis];
          if (!before || !after) continue;
          for (const state of ['rest', 'hover', 'pressed', 'disabled'] as const) {
            if (typeof before[state] === 'string' && typeof after[state] === 'string') {
              expect(luminance(after[state])).toBeLessThan(luminance(before[state]));
            }
          }
          if (
            typeof before.selected?.rest === 'string' &&
            typeof after.selected?.rest === 'string'
          ) {
            expect(luminance(after.selected.rest)).toBeLessThan(luminance(before.selected.rest));
          }
        }
      }
      expect(darker?.neutral?.highest?.rest).toBe('#000000');
    }
  });

  it('keeps the adjusted Light hierarchy exclusive to onVivid', () => {
    const colors = requireCardSurfaceElement().palettes.default?.light?.onVivid?.boxColor;
    expect(colors?.neutral?.lowest?.rest).toBe('#ffffff');
    expect(colors?.primary?.lowest?.rest).toBe('#ffffff');
    expect(colors?.neutral?.low).toMatchObject({
      rest: '#f4f6fe',
      hover: '#e9edfa',
      pressed: '#d2d6e2',
      selected: { rest: '#dce0ed' }
    });
    expect(colors?.neutral?.medium).toMatchObject({
      rest: '#dce0ed',
      hover: '#d6dbe7',
      pressed: '#bec2ce',
      selected: { rest: '#c6cbd7' }
    });
    expect(colors?.primary?.medium).toMatchObject({
      rest: '#b9daff',
      hover: '#94c7ff',
      pressed: '#76b7ff',
      selected: { rest: '#85bfff' }
    });
  });

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
      lowest: { rest: '#11131c' },
      low: { rest: '#0b0d15' },
      medium: { rest: '#05060d' },
      highest: { rest: '#000000' }
    });
  });

  it('preserves the original onSubtle Light and Dark state colors', () => {
    const light = requireCardSurfaceElement().palettes.default?.light?.onSubtle.boxColor?.neutral;
    const dark = requireCardSurfaceElement().palettes.default?.dark?.onSubtle.boxColor?.neutral;

    expect(light?.low).toMatchObject({
      rest: '#f9fbff',
      hover: '#eef2fc',
      pressed: '#d6dbe7',
      selected: { rest: '#e0e5f1' },
      disabled: '#eef2fc'
    });
    expect(
      requireCardSurfaceElement().palettes.default?.light?.onSubtle.boxColor?.primary?.medium
    ).toMatchObject({
      rest: '#e1efff',
      hover: '#c1deff',
      pressed: '#a4cfff',
      selected: { rest: '#b1d5ff' },
      disabled: '#eef2fc'
    });
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

  it('keeps Dark Primary Medium and applies the deeper opaque Darker progression', () => {
    const palettes = requireCardSurfaceElement().palettes.default;
    const expectedPrimaryMedium = {
      rest: '#142d48',
      hover: '#143a61',
      pressed: '#13273e',
      selected: { rest: '#153251' },
      disabled: '#11131c'
    };

    expect(palettes?.dark?.onSubtle.boxColor?.primary?.medium).toMatchObject(expectedPrimaryMedium);
    expect(palettes?.darker?.onSubtle.boxColor?.primary?.medium).toMatchObject({
      rest: '#0e1d2e',
      hover: '#142a43',
      pressed: '#061423',
      selected: { rest: '#122438' },
      disabled: '#05060d'
    });
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
    expect(palettes?.darker?.onSubtle.boxColor?.primary?.highest).toMatchObject({
      rest: '#133d68',
      hover: '#104375',
      pressed: '#13273e',
      selected: { rest: '#14375b' },
      disabled: '#05060d'
    });
  });
});
