import { describe, expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schema } from '../ios-27-apple.schema.ts';
import {
  createIos27AppleBrandButtonOnVividIntent,
  type Ios27AppleButtonTonalFamily
} from './button-color-formula.ts';

const c = createPresetColorGetter({ colors: schema.colors! });
const themes = ['light', 'dark', 'darker'] as const;
const contexts = ['onSubtle', 'onVivid'] as const;
const switchElements = schema.components.switch!.variants!.standard.modes.base.elements;
const sliderElements = schema.components.slider!.variants!.standard.modes.base.elements;
const buttonElements = schema.components.button!.elements;

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}
function composite(foreground: string, background: string) {
  const alpha = foreground.length === 9 ? Number.parseInt(foreground.slice(7), 16) / 255 : 1;
  return `#${[1, 3, 5]
    .map((offset) =>
      Math.round(
        Number.parseInt(foreground.slice(offset, offset + 2), 16) * alpha +
          Number.parseInt(background.slice(offset, offset + 2), 16) * (1 - alpha)
      )
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

describe('iOS 27 control appearance coverage', () => {
  it('provides every painted control slot in all themes and Surface Contexts', () => {
    for (const elements of [switchElements, sliderElements, buttonElements]) {
      for (const element of Object.values(elements)) {
        if (!element || !('palettes' in element) || !element.palettes) continue;
        for (const theme of themes) {
          for (const context of contexts) {
            const palette = element.palettes?.default?.[theme]?.[context];
            expect(palette, `${element.name} ${theme} ${context}`).toBeDefined();
            expect(Object.keys(palette ?? {}).length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('uses independent native Light/Dark tonal references for selected switches', () => {
    for (const theme of themes) {
      const scale = theme === 'light' ? 'l' : 'd';
      const palette = switchElements.e2!.palettes?.default?.[theme]?.onSubtle?.boxColor;
      expect(palette?.neutral?.medium?.rest).toBe(
        c('default', scale, 'neutral', theme === 'light' ? 70 : 95, 30)
      );
      expect(palette?.neutral?.medium?.selected?.rest).toEqual({
        ref: c.ref('default', scale, 'greenLike', 'vivid')
      });
      expect(palette?.primary?.medium?.selected?.rest).toEqual({
        ref: c.ref('default', scale, 'switch.primary', 'vivid')
      });
      expect(palette?.neutral?.medium?.focus).toBeUndefined();
      expect(palette?.neutral?.medium?.hover).toBeUndefined();
      expect(palette?.neutral?.medium?.pressed).toBeUndefined();
      expect(palette?.neutral?.medium?.disabled).toHaveProperty('ref');
    }
  });

  it('uses the iOS 27 slider fill/rail and opaque Idle thumb without a false stroke', () => {
    for (const theme of themes) {
      const scale = theme === 'light' ? 'l' : 'd';
      const rail = sliderElements.e8!.palettes?.default?.[theme]?.onSubtle?.boxColor;
      const fill = sliderElements.e9!.palettes?.default?.[theme]?.onSubtle?.boxColor;
      const thumb = sliderElements.e10!.palettes?.default?.[theme]?.onSubtle?.boxColor;
      expect(rail?.neutral?.medium?.rest).toBe(
        c('default', scale, 'neutral', theme === 'light' ? 35 : 55, theme === 'light' ? 20 : 36)
      );
      expect(fill?.neutral?.medium?.rest).toBe(c.ref('default', scale, 'slider.primary', 'vivid'));
      expect(fill?.primary?.medium?.rest).toBe(fill?.neutral?.medium?.rest);
      expect(fill?.neutral?.medium?.focus).toBeUndefined();
      expect(thumb?.neutral?.medium?.rest).toBe(c('default', 'l', 'neutral', 0));
      expect(thumb?.neutral?.medium?.disabled).toHaveProperty('ref');
    }
    expect(sliderElements.e10!.scales?.borderWidth).toBe(0);
  });

  it('resets selected onSubtle Medium, Low and Lowest to their disabled appearances', () => {
    for (const theme of themes) {
      const surfaces = buttonElements.e1!.palettes?.default?.[theme]?.onSubtle?.boxColor;
      const scale = theme === 'light' ? 'l' : 'd';
      const tertiaryFill = c(
        'default',
        scale,
        'neutral',
        theme === 'light' ? 40 : 55,
        theme === 'light' ? 12 : 24
      );
      for (const intent of ['primary', 'neutral', 'destructive', 'positive'] as const) {
        const medium = surfaces?.[intent]?.medium;
        const low = surfaces?.[intent]?.low;
        const lowest = surfaces?.[intent]?.lowest;
        expect(medium?.selected?.rest).not.toBe(tertiaryFill);
        expect(medium?.disabled).toBe(tertiaryFill);
        expect(low?.rest).toBe(tertiaryFill);
        expect(low?.disabled).toBe(tertiaryFill);
        expect(lowest?.selected?.rest).not.toBe(lowest?.rest);
        expect(lowest?.disabled).toBe(lowest?.rest);
      }
    }
  });

  it('resets selected Low Button surfaces when disabled', () => {
    for (const theme of themes) {
      const surfaces = buttonElements.e1!.palettes?.default?.[theme]?.onVivid?.boxColor;
      for (const intent of ['primary', 'neutral', 'destructive', 'positive'] as const) {
        for (const emphasis of ['low', 'lowest'] as const) {
          const palette = surfaces?.[intent]?.[emphasis];
          expect(palette?.selected?.rest).not.toBe(palette?.rest);
          expect(palette?.disabled).toBe(
            emphasis === 'low' ? c('default', 'l', 'neutral', 0, 12) : palette?.rest
          );
        }
      }
    }
  });

  it.each([
    'primary',
    'neutral'
  ] as const)('resets selected Brand onVivid Low and Lowest with the %s family', (role) => {
    const createFamily = (role: 'primary' | 'neutral'): Ios27AppleButtonTonalFamily => ({
      color: (scale, tone, alpha) => c('default', scale, role, tone, alpha),
      reference: (scale, reference, offset, alpha) =>
        c.ref('default', scale, role, reference, offset, alpha)
    });
    const palette = createIos27AppleBrandButtonOnVividIntent({
      family: createFamily(role),
      neutralFamily: createFamily('neutral')
    });
    for (const emphasis of ['low', 'lowest'] as const) {
      const surface = palette.boxColor[emphasis];
      expect(surface.selected.rest).not.toBe(surface.rest);
      expect(surface).toHaveProperty(
        'disabled',
        emphasis === 'low' ? c('default', 'l', 'neutral', 0, 12) : surface.rest
      );
    }
  });

  it('keeps every selected onVivid Switch thumb distinct from its composited rail', () => {
    const canvas = c.ref('default', 'l', 'primary', 'vivid', 4) as string;
    for (const theme of themes) {
      const rails = switchElements.e2!.palettes?.default?.[theme]?.onVivid?.boxColor;
      const thumbs = switchElements.e3!.palettes?.default?.[theme]?.onVivid?.boxColor;
      for (const intent of ['neutral', 'primary', 'polarity'] as const) {
        for (const emphasis of ['medium', 'low'] as const) {
          const thumb = thumbs?.[intent]?.[emphasis]?.selected?.rest as { ref: string };
          const rail = rails?.[intent]?.[emphasis]?.selected?.rest as { ref: string };
          const l1 = luminance(thumb.ref);
          const l2 = luminance(composite(rail.ref, canvas));
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          expect(ratio, `${theme}/${intent}/${emphasis}`).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('keeps enabled onVivid Button labels readable over the canonical strong canvas', () => {
    const canvas = c.ref('default', 'l', 'primary', 'vivid', 4) as string;
    for (const theme of themes) {
      const surfaces = buttonElements.e1!.palettes?.default?.[theme]?.onVivid?.boxColor;
      const labels = buttonElements.e2!.palettes?.default?.[theme]?.onVivid?.textColor;
      for (const intent of ['primary', 'neutral', 'destructive', 'positive'] as const) {
        for (const emphasis of ['high', 'medium', 'low', 'lowest'] as const) {
          const foreground = labels?.[intent]?.[emphasis]?.rest as string;
          for (const state of ['rest', 'hover', 'pressed'] as const) {
            const surface = surfaces?.[intent]?.[emphasis]?.[state] as string;
            const background = composite(surface, canvas);
            const l1 = luminance(foreground);
            const l2 = luminance(background);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
            expect(ratio, `${theme}/${intent}/${emphasis}/${state}`).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });
});
