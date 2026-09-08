import { validateButtonComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schema } from '../ios-27-apple.schema.ts';

describe('iOS 27 Button divider', () => {
  it('publishes connected-group defaults and a Rest-only subtle line', () => {
    const button = schema.components.button;
    const divider = button?.elements.e6;

    expect(button?.options).toMatchObject({
      groupDivider: true,
      disclosureDivider: false
    });
    expect(divider?.scales).toEqual({
      boxWidth: {
        's:sm:1': 1,
        's:md:1': 1,
        's:lg:1': 1
      },
      boxHeight: {
        's:sm:1': 16,
        's:md:1': 20,
        's:lg:1': 24
      }
    });

    for (const [theme, rest] of [
      ['light', '#d1d1d4'],
      ['dark', '#38383b']
    ] as const) {
      expect(divider?.palettes.default?.[theme]?.onSubtle.boxColor).toEqual({
        neutral: {
          medium: { rest }
        }
      });
    }
  });

  it('satisfies the shared Button contract', () => {
    expect(validateButtonComponentContract(schema.components.button)).toEqual([]);
  });
});

describe('iOS 27 borderless emphasis hierarchy', () => {
  const c = createPresetColorGetter({ colors: schema.colors! });
  const root = schema.components.button!.elements.e1!;

  it.each([
    'light',
    'dark',
    'darker'
  ] as const)('uses tonal Medium and neutral Low for every %s intent', (theme) => {
    const scale = theme === 'light' ? 'l' : 'd';
    for (const context of ['onSubtle', 'onVivid'] as const) {
      const palette = root.palettes!.default![theme]![context]!;
      for (const intent of ['primary', 'neutral', 'destructive', 'positive'] as const) {
        const role = `button.${intent}` as const;
        expect(palette.boxColor![intent]!.medium!.rest).toBe(
          c.ref('default', context === 'onVivid' ? 'l' : scale, role, 'subtle')
        );
        expect(palette.boxColor![intent]!.low!.rest).toBe(
          context === 'onVivid'
            ? c('default', 'l', 'neutral', 100, 12)
            : c(
                'default',
                scale,
                'neutral',
                theme === 'light' ? 40 : 55,
                theme === 'light' ? 12 : 24
              )
        );
        for (const emphasis of ['high', 'medium', 'low', 'lowest'] as const) {
          const border = palette.borderColor![intent]![emphasis]!;
          expect(String(border.rest).slice(-2)).toBe('00');
          expect(border.selected).toBeUndefined();
          expect(border.hover).toBeUndefined();
        }
      }
    }
  });
});

describe('Apple compact Button and macOS feedback', () => {
  const button = schema.components.button!;
  const c = createPresetColorGetter({ colors: schema.colors! });

  it('derives compact 24px geometry from typography and padding while preserving larger sizes', () => {
    const root = button.elements.e1!.scales!;
    const profiles = schema.global!.typography!.profiles;
    const typography = button.elements.e2!.typography!;
    for (const [scale, height] of [
      ['s:sm:1', 24],
      ['s:md:1', 34],
      ['s:lg:1', 50]
    ] as const) {
      const profile = profiles[typography[scale] as string]!;
      const top = (root.paddingTop as Record<string, number>)[scale]!;
      const bottom = (root.paddingBottom as Record<string, number>)[scale]!;
      expect(Number(profile.scales.textHeight) + top + bottom).toBe(height);
    }
    expect(root.borderRadius).toEqual({ rounded: 6, pill: 25, square: 0 });
    expect(profiles['body-extra-small']!.scales).toMatchObject({ textSize: 13, textHeight: 16 });
  });

  it.each([
    'light',
    'dark',
    'darker'
  ] as const)('keeps %s neutral feedback achromatic across chromatic intents', (theme) => {
    const palette = button.elements.e1!.palettes!.default![theme]!.onSubtle.boxColor!;
    const track = theme === 'light' ? 'l' : 'd';
    for (const intent of ['primary', 'destructive', 'positive'] as const) {
      for (const state of ['hover', 'pressed'] as const) {
        expect(palette[intent]!.low![state]).toBe(palette.neutral!.low![state]);
        expect(palette[intent]!.lowest![state]).toBe(palette.neutral!.lowest![state]);
        expect(palette[intent]!.low![state]).not.toBe(palette[intent]!.low!.rest);
      }
      expect(palette[intent]!.lowest!.pressed).toBe(c('default', track, 'neutral', 100, 15));
      expect(palette[intent]!.high!.rest).toBe(
        c.ref('default', track, `button.${intent}`, 'vivid')
      );
      expect(palette[intent]!.high!.pressed).not.toBe(palette[intent]!.high!.hover);
      expect(palette[intent]!.lowest!.disabled).toBe(palette[intent]!.lowest!.rest);
    }
  });
});
