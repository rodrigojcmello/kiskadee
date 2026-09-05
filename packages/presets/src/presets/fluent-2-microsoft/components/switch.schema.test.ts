import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const themes = ['light', 'dark', 'darker'] as const;
const surfaceContexts = ['onSubtle', 'onVivid'] as const;
const intents = ['neutral', 'accent', 'polarity'] as const;

function requireSwitchElements() {
  const elements = schema.components.switch?.variants?.standard?.modes?.base?.elements;
  if (!elements) throw new Error('Fluent Switch base elements are missing');
  return elements;
}

function collectValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(collectValues);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectValues);
  }
  return [value];
}

describe('Fluent 2 Switch architecture', () => {
  it('publishes the canonical slot, typography, and context-driven feedback contracts', () => {
    const elements = requireSwitchElements();
    const tone = schema.components.switch?.effects?.activationFeedback?.visual?.tone;

    expect(elements.e1).toEqual({ name: 'switch' });
    expect(elements.e4?.typography).toEqual({ 's:md:1': 'body-medium' });
    expect(elements.e5?.typography).toEqual({ 's:md:1': 'body-medium' });
    expect(elements.e6?.iconSize).toEqual({ 's:md:1': 's:sm:3' });
    expect(tone).toEqual({
      default: 'subtle',
      bySurfaceContext: {
        onSubtle: 'subtle',
        onVivid: 'vivid'
      }
    });
  });

  it('publishes Medium explicitly for every theme, context, and supported intent', () => {
    const elements = requireSwitchElements();

    for (const theme of themes) {
      for (const element of [elements.e2, elements.e3, elements.e4, elements.e5, elements.e6]) {
        const contexts = element?.palettes?.default?.[theme];
        for (const properties of Object.values(contexts ?? {})) {
          for (const palette of Object.values(properties)) {
            expect(Object.keys(palette).sort()).toEqual([...intents].sort());
          }
        }
        for (const palette of Object.values(contexts?.onSubtle ?? {})) {
          expect(palette.accent).toEqual(palette.neutral);
        }
      }
      for (const surfaceContext of surfaceContexts) {
        for (const intent of intents) {
          expect(
            elements.e2?.palettes?.default?.[theme]?.[surfaceContext]?.boxColor?.[intent]?.medium
          ).toBeDefined();
          expect(
            elements.e3?.palettes?.default?.[theme]?.[surfaceContext]?.boxColor?.[intent]?.medium
          ).toBeDefined();
          expect(
            elements.e4?.palettes?.default?.[theme]?.[surfaceContext]?.textColor?.[intent]?.medium
          ).toBeDefined();
          expect(
            elements.e5?.palettes?.default?.[theme]?.[surfaceContext]?.textColor?.[intent]?.medium
          ).toBeDefined();
          expect(
            elements.e6?.palettes?.default?.[theme]?.[surfaceContext]?.textColor?.[intent]?.medium
          ).toBeDefined();

          expect(
            elements.e2?.palettes?.default?.[theme]?.[surfaceContext]?.boxColor?.[intent]?.low
          ).toBeUndefined();
        }
      }
    }
  });

  it('keeps Light onSubtle anchors and promotes the former on-primary recipe to onVivid', () => {
    const elements = requireSwitchElements();
    const track = elements.e2?.palettes?.default?.light;
    const thumb = elements.e3?.palettes?.default?.light;

    expect(track?.onSubtle?.boxColor?.neutral?.medium?.selected).toEqual({
      rest: { ref: '#045091' },
      hover: { ref: '#123f6b' },
      pressed: { ref: '#142e49' }
    });
    expect(track?.onSubtle?.borderColor?.neutral?.medium).toMatchObject({
      rest: '#616161',
      hover: { ref: '#585858' },
      pressed: { ref: '#4f4f4f' },
      disabled: { ref: '#e0e0e0' }
    });
    expect(thumb?.onSubtle?.boxColor?.polarity?.medium?.rest).toBe('#c50f1f');
    expect(track?.onSubtle?.boxColor?.polarity?.medium?.selected?.rest).toEqual({
      ref: '#107c10'
    });

    expect(track?.onVivid?.boxColor?.neutral?.medium).toMatchObject({
      rest: '#ffffff24',
      hover: { ref: '#ffffff33' },
      pressed: { ref: '#ffffff47' },
      selected: { rest: { ref: '#ffffff' } }
    });
    expect(thumb?.onVivid?.boxColor?.neutral?.medium).toMatchObject({
      rest: '#ffffff',
      selected: { rest: { ref: '#045091' } }
    });

    expect(track?.onVivid?.boxColor?.accent?.medium).toEqual({
      rest: '#ffffff00',
      hover: { ref: '#ffffff14' },
      pressed: { ref: '#ffffff24' },
      selected: {
        rest: { ref: '#76b7ff' },
        hover: { ref: '#60a7f3' },
        pressed: { ref: '#4c97e5' }
      },
      disabled: { ref: '#ffffff1f' }
    });
    expect(thumb?.onVivid?.boxColor?.accent?.medium).toEqual({
      rest: '#ffffff',
      selected: { rest: { ref: '#000000' } },
      disabled: { ref: '#ffffff61' }
    });
  });

  it('publishes a physical Dark track while preserving a physical-Light onVivid recipe', () => {
    const elements = requireSwitchElements();
    const darkTrack = elements.e2?.palettes?.default?.dark;
    const darkerTrack = elements.e2?.palettes?.default?.darker;

    expect(darkTrack?.onSubtle?.boxColor?.neutral?.medium).toMatchObject({
      rest: '#2a2a2a',
      selected: {
        rest: { ref: '#4a95e4' },
        hover: { ref: '#79b9ff' },
        pressed: { ref: '#3685d6' }
      },
      disabled: { ref: '#141414' }
    });
    expect(darkTrack?.onSubtle?.borderColor?.neutral?.medium).toMatchObject({
      rest: '#b0b4c0',
      hover: { ref: '#c1c5d1' },
      disabled: { ref: '#424242' }
    });
    expect(darkTrack?.onVivid).toEqual(darkerTrack?.onVivid);
    expect(darkTrack?.onVivid?.boxColor?.accent).toEqual(
      elements.e2?.palettes?.default?.light?.onVivid?.boxColor?.accent
    );
    expect(darkTrack?.onVivid?.boxColor?.neutral?.medium?.rest).toBe('#ffffff24');
  });

  it('authors every textColor through global foreground coordinates and omits Focus paint', () => {
    const elements = requireSwitchElements();

    for (const element of [elements.e4, elements.e5, elements.e6]) {
      const palettes = element?.palettes?.default;
      const serialized = JSON.stringify(palettes);
      expect(serialized).not.toContain('"focus"');

      const values = collectValues(palettes);
      for (const value of values) {
        if (typeof value !== 'string') continue;
        expect(value.startsWith('fg:')).toBe(true);
      }
    }

    expect(elements.e4?.palettes?.default?.light?.onSubtle?.textColor?.neutral?.medium).toEqual({
      rest: 'fg:neutral.standard.light.onSubtle.medium',
      disabled: {
        parentState: 'fg:neutral.deep.light.onSubtle.lowest.disabled'
      }
    });
    expect(
      elements.e6?.palettes?.default?.light?.onVivid?.textColor?.polarity?.medium
    ).toMatchObject({
      rest: 'fg:red.standard.light.onSubtle.medium',
      selected: {
        rest: { parentState: 'fg:neutral.standard.light.onVivid.medium.rest' }
      },
      disabled: {
        parentState: 'fg:neutral.deep.light.onSubtle.low.rest'
      }
    });

    expect(elements.e6?.palettes?.default?.dark?.onSubtle?.textColor?.accent?.medium).toMatchObject(
      {
        rest: 'fg:neutral.deep.light.onSubtle.medium',
        selected: {
          rest: { parentState: 'fg:blue.standard.light.onSubtle.medium.rest' }
        },
        disabled: {
          parentState: 'fg:neutral.standard.dark.onSubtle.low.rest'
        }
      }
    );
  });

  it('keeps polarity states sparse when Hover and Pressed equal Rest', () => {
    const elements = requireSwitchElements();
    const track = elements.e2?.palettes?.default?.light?.onSubtle?.boxColor?.polarity?.medium;
    const thumb = elements.e3?.palettes?.default?.light?.onVivid?.boxColor?.polarity?.medium;
    const icon = elements.e6?.palettes?.default?.light?.onVivid?.textColor?.polarity?.medium;

    expect(track?.selected).toEqual({ rest: { ref: '#107c10' } });
    expect(thumb?.selected).toEqual({ rest: { ref: '#107c10' } });
    expect(icon).not.toHaveProperty('hover');
    expect(icon).not.toHaveProperty('pressed');
  });
});
