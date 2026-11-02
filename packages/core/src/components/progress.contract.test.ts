import { describe, expect, it } from 'vitest';
import { ProgressIntentKeys } from '../types/colors/colors.types.ts';
import { type ProgressElements, validateProgressComponentContract } from './progress.ts';

function progress() {
  const indicator = Object.fromEntries(
    Object.keys(ProgressIntentKeys).map((intent) => [intent, { medium: { rest: '#0055aa' } }])
  );
  return {
    elements: {
      e1: { name: 'progress' },
      e2: {
        name: 'track',
        scales: { boxHeight: { 's:md:1': 2, 's:lg:1': 4 }, borderRadius: { pill: 2 } },
        palettes: {
          default: {
            light: {
              onSubtle: {
                standard: { boxColor: { neutral: { medium: { rest: '#aaaaaa' } } } }
              }
            }
          }
        }
      },
      e3: {
        name: 'indicator',
        scales: { borderRadius: { pill: 2 } },
        palettes: {
          default: {
            light: {
              onSubtle: {
                standard: { boxColor: indicator },
                alternative: { boxColor: { primary: { medium: { rest: '#44bbff' } } } }
              }
            }
          }
        }
      }
    }
  };
}

describe('Progress sparse color variants', () => {
  it('validates only authored Alternative intents while requiring full Standard coverage', () => {
    const value = progress();
    expect(validateProgressComponentContract(value)).toEqual([]);
    delete value.elements.e3.palettes.default.light.onSubtle.standard.boxColor.neutral;
    expect(validateProgressComponentContract(value)).toContain(
      'components.progress.elements.e3.palettes.default.light.onSubtle.standard.boxColor.neutral: required intent'
    );
  });
  it('keeps authored Alternative leaves Rest-only at Medium emphasis', () => {
    const value = progress() as any;
    value.elements.e3.palettes.default.light.onSubtle.alternative.boxColor.primary = {
      medium: { hover: '#ffffff' },
      high: { rest: '#ffffff' }
    };
    expect(validateProgressComponentContract(value)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('.alternative.boxColor.primary.medium.rest: required state'),
        expect.stringContaining('.alternative.boxColor.primary.medium.hover: unrecognized key'),
        expect.stringContaining('.alternative.boxColor.primary.high: unrecognized emphasis')
      ])
    );
  });
  it('types Alternative coverage independently from required Standard intents', () => {
    const alternative: NonNullable<ProgressElements['e3']['palettes']['default']>['light'] = {
      onSubtle: {
        standard: {
          boxColor: {
            neutral: { medium: { rest: '#000000' } },
            primary: { medium: { rest: '#000000' } },
            destructive: { medium: { rest: '#000000' } },
            warning: { medium: { rest: '#000000' } },
            positive: { medium: { rest: '#000000' } }
          }
        },
        alternative: { boxColor: { primary: { medium: { rest: '#ffffff' } } } }
      }
    };
    expect(alternative?.onSubtle.alternative?.boxColor.primary?.medium?.rest).toBe('#ffffff');
  });
});
