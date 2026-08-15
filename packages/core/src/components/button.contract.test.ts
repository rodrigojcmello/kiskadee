import { describe, expect, it } from 'vitest';
import { validateButtonComponentContract } from './button.ts';

function createButton(options?: unknown, includeIconRegion = false) {
  return {
    ...(options === undefined ? {} : { options }),
    elements: {
      e1: {
        name: 'button'
      },
      ...(includeIconRegion ? { e4: { name: 'button-icon-region' } } : {})
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

  it('accepts surfaced icon corner policies when the icon region exists', () => {
    expect(
      validateButtonComponentContract(
        createButton(
          {
            iconSurfaceCorners: 'edge'
          },
          true
        )
      )
    ).toEqual([]);

    expect(
      validateButtonComponentContract(
        createButton(
          {
            iconSurfaceCorners: 'all'
          },
          true
        )
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

  it('rejects invalid or unsupported surfaced icon corner defaults', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          iconSurfaceCorners: 'inner'
        })
      )
    ).toEqual([
      'components.button.options.iconSurfaceCorners: expected "edge" or "all"',
      'components.button.options.iconSurfaceCorners: surfaced corner defaults require components.button.elements.e4'
    ]);
  });

  it('accepts icon-size references only on the icon slot', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e3: {
            name: 'button-icon',
            iconSize: { 's:md:1': 's:md:1' }
          }
        }
      })
    ).toEqual([]);

    expect(
      validateButtonComponentContract({
        elements: {
          e1: {
            name: 'button',
            iconSize: { 's:md:1': 's:md:1' }
          },
          e3: {
            name: 'button-icon',
            scales: { boxWidth: { 's:md:1': 20 } }
          }
        }
      })
    ).toEqual(
      expect.arrayContaining([
        'components.button.elements.e1.iconSize: not allowed for this element',
        'components.button.elements.e3.scales.boxWidth: unrecognized key'
      ])
    );
  });

  it('accepts the optional trailing disclosure slot', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e5: {
            name: 'button-disclosure',
            iconSize: { 's:all': 's:sm:1' },
            scales: { paddingRight: 4, borderWidth: 0 }
          }
        }
      })
    ).toEqual([]);
  });
});
