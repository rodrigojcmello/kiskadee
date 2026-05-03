import { describe, expect, it } from 'vitest';
import {
  INVALID_SHADOW_COLOR_VALUE,
  UNSUPPORTED_INTERACTION_STATE,
  UNSUPPORTED_PROPERTY_NAME,
  UNSUPPORTED_VALUE
} from '../../errorMessages.ts';
import { transformShadowKeyToCss } from './transformShadowKeyToCss.ts';

const className = 'abc';

describe('transformShadowKeyToCss', () => {
  describe('Successful operation', () => {
    it('should transform default state shadow key using hex color conversion', () => {
      const styleKey = 'shadow__[2,4,5,[0,0,0,1]]';
      const result = transformShadowKeyToCss(styleKey, className);

      expect(result).toEqual('.abc.-e { box-shadow: 2px 4px 5px #000 }');
    });

    it('should transform a hover state shadow key with pseudo-selector', () => {
      const styleKey = 'shadow--hover__[6,8,10,[0,0,0,0.5]]';
      const result = transformShadowKeyToCss(styleKey, className);

      expect(result).toEqual('.abc.-e:hover { box-shadow: 6px 8px 10px #00000080 }');
    });

    it('should transform a pressed state shadow key to use :active pseudo-selector', () => {
      const styleKey = 'shadow--pressed__[3,3,3,[0,0,0,1]]';
      const result = transformShadowKeyToCss(styleKey, className);

      expect(result).toEqual('.abc.-e:active { box-shadow: 3px 3px 3px #000 }');
    });

    it('should abbreviate zero pixel values to 0', () => {
      const styleKey = 'shadow__[0,4,5,[0,0,0,1]]';
      const result = transformShadowKeyToCss(styleKey, className);

      expect(result).toEqual('.abc.-e { box-shadow: 0 4px 5px #000 }');
    });
  });

  describe('Error handling', () => {
    it('should throw an error when key does not start with "shadow" or format is invalid', () => {
      const invalidKey1 = 'notShadow__[2,4,5,[0,0,0,1]]';
      const fn1 = (): string => transformShadowKeyToCss(invalidKey1, className);
      expect(fn1).toThrowError(UNSUPPORTED_PROPERTY_NAME('shadow', invalidKey1));

      const invalidKey2 = 'shadow__2,4,5,[0,0,0,1]';
      const fn2 = (): string => transformShadowKeyToCss(invalidKey2, className);
      expect(fn2).toThrowError(UNSUPPORTED_PROPERTY_NAME('shadow', invalidKey2));
    });

    it('should throw an error when the shadow values cannot be parsed', () => {
      const invalidKey = 'shadow__[2,4,"invalid"]';
      const fn = (): string => transformShadowKeyToCss(invalidKey, className);
      expect(fn).toThrowError(UNSUPPORTED_VALUE('shadow', '2,4,"invalid"', invalidKey));
    });

    it('should throw an error for an unsupported interaction state', () => {
      const invalidKey = 'shadow--unknown__[1,1,1,[0,0,0,1]]';
      const fn = (): string => transformShadowKeyToCss(invalidKey, className);
      expect(fn).toThrowError(UNSUPPORTED_INTERACTION_STATE('unknown', invalidKey));
    });

    it('should throw an error for an invalid color value', () => {
      const styleKey = 'shadow__[10,20,30,blue]';
      const fn = (): string => transformShadowKeyToCss(styleKey, className);
      expect(fn).toThrowError(INVALID_SHADOW_COLOR_VALUE);
    });
  });
});
