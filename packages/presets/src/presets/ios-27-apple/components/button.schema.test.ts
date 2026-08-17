import { validateButtonComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
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
