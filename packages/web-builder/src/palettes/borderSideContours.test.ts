import { contour, type ElementPalettes, type SchemaContours } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveContourReferences } from './resolveContourReferences.ts';

describe('side contour references', () => {
  it('resolves every physical side through the shared catalog', () => {
    const catalog: SchemaContours = {
      profiles: {
        neutral: {
          standard: {
            palettes: {
              default: { light: { onSubtle: { medium: { rest: '#dddddd' } } } }
            }
          }
        }
      }
    };
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
      const key = `border${side}Color` as const;
      const palettes: ElementPalettes = {
        default: {
          light: {
            onSubtle: {
              [key]: {
                neutral: { low: { rest: contour('neutral.standard.light.onSubtle.medium') } }
              }
            }
          }
        }
      };
      expect(
        resolveContourReferences(palettes, catalog).default?.light?.onSubtle[key]?.neutral?.low
          ?.rest
      ).toBe('#dddddd');
    }
  });
});
