import type { ShadowSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementShadowToStyleKeys } from './convertElementShadowToStyleKeys.ts';

describe('convertElementShadowToStyleKeys', () => {
  describe('shadow handling', () => {
    it('generates style keys for rest and hover, inheriting missing values from rest', () => {
      // rest defines x, y, blur, color; hover defines only x
      const shadowEffect: ShadowSchema = {
        x: { rest: 10, hover: 20 },
        y: { rest: 15 },
        blur: { rest: 5 },
        color: { rest: [0, 0, 0, 0.5] }
      };
      const result = convertElementShadowToStyleKeys(shadowEffect);

      expect(result).toEqual({
        rest: ['shadow__[10,15,5,[0,0,0,0.5]]'],
        hover: ['shadow--hover__[20,15,5,[0,0,0,0.5]]']
      });
    });

    it('applies default shadow values when rest state is undefined', () => {
      // only hover.x is provided; rest should use defaults (0 offsets, no blur, opaque black)
      const shadowEffect: ShadowSchema = {
        x: { hover: 25 }
      };
      const result = convertElementShadowToStyleKeys(shadowEffect);

      expect(result).toEqual({
        rest: ['shadow__[0,0,0,[0,0,0,1]]'],
        hover: ['shadow--hover__[25,0,0,[0,0,0,1]]']
      });
    });

    it('handles multiple interaction states with proper fallback to rest values', () => {
      // rest provides full settings; focus overrides x and y; hover overrides y and color
      const shadowEffect: ShadowSchema = {
        x: { rest: 5, focus: 12 },
        y: { rest: 8, focus: 16, hover: 10 },
        blur: { rest: 3 },
        color: { rest: [10, 20, 30, 0.8], hover: [50, 60, 70, 0.9] }
      };
      const result = convertElementShadowToStyleKeys(shadowEffect);

      expect(result).toEqual({
        rest: ['shadow__[5,8,3,[10,20,30,0.8]]'],
        focus: ['shadow--focus__[12,16,3,[10,20,30,0.8]]'],
        hover: ['shadow--hover__[5,10,3,[50,60,70,0.9]]']
      });
    });
  });
});
