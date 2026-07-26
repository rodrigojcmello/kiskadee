import { describe, expect, it } from 'vitest';
import { validateCardComponentContract } from './card.ts';

function createCard() {
  return {
    options: {
      canonicalSurfaces: {
        default: {
          light: [
            {
              intent: 'neutral',
              emphasis: 'low',
              contentSurfaceContext: 'onSubtle'
            },
            {
              intent: 'primary',
              emphasis: 'highest',
              contentSurfaceContext: 'onVivid'
            }
          ]
        }
      }
    },
    elements: {
      e1: {
        name: 'card',
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    low: { rest: '#ffffff' }
                  },
                  primary: {
                    highest: { rest: '#0064b4' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

describe('validateCardComponentContract', () => {
  it('accepts ordered canonical surfaces that resolve in the Card palette', () => {
    expect(validateCardComponentContract(createCard())).toEqual([]);
  });

  it('rejects duplicate and unresolved canonical surfaces', () => {
    const card = createCard();
    card.options.canonicalSurfaces.default.light.push({
      intent: 'primary',
      emphasis: 'highest',
      contentSurfaceContext: 'onVivid'
    });
    card.options.canonicalSurfaces.default.light.push({
      intent: 'primary',
      emphasis: 'high',
      contentSurfaceContext: 'onSubtle'
    });

    expect(validateCardComponentContract(card)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('duplicate canonical surface "primary.highest"'),
        expect.stringContaining('boxColor.primary.high.rest is missing')
      ])
    );
  });

  it('rejects invalid canonical surface vocabulary', () => {
    const card = createCard();
    card.options.canonicalSurfaces.default.light[0] = {
      intent: 'warning',
      emphasis: 'strong',
      contentSurfaceContext: 'automatic'
    };

    expect(validateCardComponentContract(card)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('.intent: expected Card intent'),
        expect.stringContaining('.emphasis: expected component emphasis'),
        expect.stringContaining('.contentSurfaceContext: expected "onSubtle" or "onVivid"')
      ])
    );
  });
});
