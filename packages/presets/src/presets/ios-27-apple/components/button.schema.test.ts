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
