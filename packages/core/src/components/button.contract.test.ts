import { describe, expect, it } from 'vitest';
import { validateButtonComponentContract } from './button.ts';

function createButton(options?: unknown) {
  return {
    ...(options === undefined ? {} : { options }),
    elements: {
      e1: {
        name: 'button'
      }
    }
  };
}

describe('Button component contract', () => {
  it('accepts logical icon layout defaults', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          iconLayout: 'inline',
          iconPlacement: 'leading'
        })
      )
    ).toEqual([]);

    expect(
      validateButtonComponentContract(
        createButton({
          iconLayout: 'edge',
          iconPlacement: 'trailing'
        })
      )
    ).toEqual([]);
  });

  it('rejects unknown icon layout options and values', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          iconLayout: 'stacked',
          iconPlacement: 'left',
          iconGap: 8
        })
      )
    ).toEqual([
      'components.button.options.iconGap: unrecognized key',
      'components.button.options.iconLayout: expected "inline" or "edge"',
      'components.button.options.iconPlacement: expected "leading" or "trailing"'
    ]);
  });
});
