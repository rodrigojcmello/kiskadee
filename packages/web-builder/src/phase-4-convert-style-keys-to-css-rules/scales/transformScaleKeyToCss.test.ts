import { breakpoints } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  ERROR_INVALID_CUSTOM_TOKEN,
  ERROR_INVALID_KEY_FORMAT,
  ERROR_INVALID_MEDIA_QUERY_PATTERN,
  ERROR_INVALID_MEDIA_TOKEN,
  ERROR_INVALID_STANDARD_PATTERN,
  ERROR_MISSING_VALUE,
  ERROR_NO_MATCHING_SCALE_PROPERTY,
  ERROR_NO_STANDARD_SCALE_KEY,
  transformScaleKeyToCss
} from './transformScaleKeyToCss.ts';

describe('transformScaleKeyToCss', () => {
  describe('Successful operation', () => {
    describe('Valid Properties (Unique Value)', () => {
      it("should convert 'textSize__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('textSize__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('font-size: 1rem');
      });

      it('normalizes fractional rem output to six decimal places', () => {
        const result = transformScaleKeyToCss('textSize__13.333333', breakpoints, 'abc');

        expect(result).toContain('font-size: 0.833333rem');
      });

      it("should convert 'paddingTop__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('paddingTop__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'compensated',
            shadowEmission: 'direct'
          }
        });

        expect(result).toContain('.abc {');
        expect(result).toContain('padding-top: max(0px, calc(var(--k-pdt) - var(--k-bdw, 0px)))');
      });

      it('mirrors Dropdown padding into a structural token without removing the CSS property', () => {
        const result = transformScaleKeyToCss('paddingTop__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'mirrored',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-pdt: 16px; padding-top: 16px }');
      });

      it("should convert 'marginLeft__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('marginLeft__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).not.toContain('--k-mgl');
        expect(result).toContain('margin-left: 16px');
      });

      it('should emit --k-mgl and margin-left when margin-left emission is mirrored', () => {
        const result = transformScaleKeyToCss('marginLeft__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            marginLeftEmission: 'mirrored',
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'direct',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-mgl: 16px; margin-left: 16px }');
      });

      it("should convert 'borderWidth__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('borderWidth__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('border-width: 16px');
      });

      it('should emit only --k-bdw when border-width emission is token', () => {
        const result = transformScaleKeyToCss('borderWidth__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'token',
            paddingEmission: 'direct',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-bdw: 16px }');
      });

      it("should convert 'boxWidth__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('boxWidth__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('width: 16px');
      });

      it('emits separator thickness only as --k-bxw in token mode', () => {
        const result = transformScaleKeyToCss('boxWidth__1', breakpoints, 'abc', {
          styleEmissionPolicy: {
            boxWidthEmission: 'token',
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'direct',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-bxw: 1px }');
      });

      it("should convert 'boxHeight__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('boxHeight__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('height: 16px');
      });

      it('should emit only --k-bxh when box-height emission is token', () => {
        const result = transformScaleKeyToCss('boxHeight__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            boxHeightEmission: 'token',
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'direct',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-bxh: 16px }');
      });

      it('should emit only --k-bdr when border-radius emission is token', () => {
        const result = transformScaleKeyToCss('borderRadius__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            borderRadiusEmission: 'token',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'direct',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-bdr: 16px }');
      });

      it('should emit --k-bdr and border-radius when border-radius emission is mirrored', () => {
        const result = transformScaleKeyToCss('borderRadius__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            borderRadiusEmission: 'mirrored',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'direct',
            shadowEmission: 'direct'
          }
        });

        expect(result).toBe('.abc { --k-bdr: 16px; border-radius: 16px }');
      });
    });

    describe('Valid Properties (Size Support)', () => {
      it("should convert 'textSize++s:sm:1__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('textSize++s:sm:1__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('font-size: 1rem');
      });

      it("should convert 'paddingRight++s:sm:1__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('paddingRight++s:sm:1__16', breakpoints, 'abc', {
          styleEmissionPolicy: {
            borderRadiusEmission: 'direct',
            borderColorEmission: 'direct',
            borderWidthEmission: 'direct',
            paddingEmission: 'compensated',
            shadowEmission: 'direct'
          }
        });

        expect(result).toContain('.abc {');
        expect(result).toContain('padding-right: max(0px, calc(var(--k-pdr) - var(--k-bdw, 0px)))');
      });

      it('supports a right-only padding token without changing the other padding edges', () => {
        const styleEmissionPolicy = {
          borderRadiusEmission: 'direct',
          borderColorEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          paddingRightEmission: 'token',
          shadowEmission: 'direct'
        } as const;

        expect(
          transformScaleKeyToCss('paddingRight++s:sm:1__16', breakpoints, 'abc', {
            styleEmissionPolicy
          })
        ).toBe('.abc { --k-pdr: 16px }');
        expect(
          transformScaleKeyToCss('paddingLeft++s:sm:1__16', breakpoints, 'abc', {
            styleEmissionPolicy
          })
        ).toBe('.abc { padding-left: 16px }');
      });

      it('supports a left-only padding token without changing the other padding edges', () => {
        const styleEmissionPolicy = {
          borderRadiusEmission: 'direct',
          borderColorEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          paddingLeftEmission: 'token',
          shadowEmission: 'direct'
        } as const;

        expect(
          transformScaleKeyToCss('paddingLeft++s:sm:1__16', breakpoints, 'abc', {
            styleEmissionPolicy
          })
        ).toBe('.abc { --k-pdl: 16px }');
        expect(
          transformScaleKeyToCss('paddingRight++s:sm:1__16', breakpoints, 'abc', {
            styleEmissionPolicy
          })
        ).toBe('.abc { padding-right: 16px }');
      });

      it("should convert 'marginLeft++s:sm:1__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('marginLeft++s:sm:1__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).not.toContain('--k-mgl');
        expect(result).toContain('margin-left: 16px');
      });

      it("should convert 'borderWidth++s:sm:1__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('borderWidth++s:sm:1__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('border-width: 16px');
      });

      it("should convert 'boxWidth++s:sm:1__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('boxWidth++s:sm:1__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('width: 16px');
      });

      it("should convert 'boxHeight++s:sm:1__16' into a valid CSS rule", () => {
        const result = transformScaleKeyToCss('boxHeight++s:sm:1__16', breakpoints, 'abc');

        expect(result).toContain('.abc {');
        expect(result).toContain('height: 16px');
      });
    });

    describe('Valid Properties (Media Query Support)', () => {
      it("should convert 'paddingTop++s:sm:1::bp:lg:1__16' into a valid CSS rule with media query", () => {
        const result = transformScaleKeyToCss(
          'paddingTop++s:sm:1::bp:lg:1__16',
          breakpoints,
          'abc',
          {
            styleEmissionPolicy: {
              borderRadiusEmission: 'direct',
              borderColorEmission: 'direct',
              borderWidthEmission: 'direct',
              paddingEmission: 'compensated',
              shadowEmission: 'direct'
            }
          }
        );

        const bpValue = breakpoints['bp:lg:1'];
        expect(result).toContain(`@media (min-width: ${bpValue}px)`);
        expect(result).toContain('.abc {');
        expect(result).toContain('padding-top: max(0px, calc(var(--k-pdt) - var(--k-bdw, 0px)))');
      });

      it("should convert 'textSize++s:sm:1::bp:lg:1__16' into a valid CSS rule with media query and rem unit", () => {
        const result = transformScaleKeyToCss('textSize++s:sm:1::bp:lg:1__16', breakpoints, 'abc');

        const bpValue = breakpoints['bp:lg:1'];
        expect(result).toContain(`@media (min-width: ${bpValue}px)`);
        expect(result).toContain('.abc {');
        expect(result).toContain('font-size: 1rem');
      });

      it("supports the component-wide 's:all' token for responsive scales", () => {
        const result = transformScaleKeyToCss(
          'textSize++s:all::bp:lg:1__14',
          { 'bp:all': 0, 'bp:lg:1': 1200 },
          'abc'
        );

        expect(result).toBe('@media (min-width: 1200px) { .abc { font-size: 0.875rem } }');

        expect(
          transformScaleKeyToCss(
            'boxWidth++s:all::bp:lg:1__2',
            { 'bp:all': 0, 'bp:lg:1': 1200 },
            'def',
            {
              styleEmissionPolicy: {
                boxWidthEmission: 'token',
                borderRadiusEmission: 'direct',
                borderColorEmission: 'direct',
                borderWidthEmission: 'direct',
                paddingEmission: 'direct',
                shadowEmission: 'direct'
              }
            }
          )
        ).toBe('@media (min-width: 1200px) { .def { --k-bxw: 2px } }');
      });

      it('rejects s:all for scale properties without a component-wide recipe', () => {
        expect(() =>
          transformScaleKeyToCss(
            'paddingTop++s:all::bp:lg:1__16',
            { 'bp:all': 0, 'bp:lg:1': 1200 },
            'abc'
          )
        ).toThrowError(ERROR_INVALID_CUSTOM_TOKEN);
      });
    });
  });

  describe('Error handling', () => {
    it('Exception 1 - should throw error when no matching dimension key is found', () => {
      expect(() =>
        transformScaleKeyToCss('invalidKey++s:sm:1::bp:lg:1__16', breakpoints, 'abc')
      ).toThrowError(ERROR_NO_MATCHING_SCALE_PROPERTY);
    });

    it('Exception 2 - should throw error when the media query pattern has too many parts', () => {
      expect(() =>
        transformScaleKeyToCss('textSize++s:sm:1::bp:lg:1__16__extra', breakpoints, 'abc')
      ).toThrowError(ERROR_INVALID_MEDIA_QUERY_PATTERN);
    });

    it('Exception 3 - should throw error when the media query token format is invalid', () => {
      expect(() =>
        transformScaleKeyToCss('textSize++s:sm:1::lg:1__16', breakpoints, 'abc')
      ).toThrowError(ERROR_INVALID_MEDIA_TOKEN);
    });

    it('Exception 4 - should throw error when the custom token is not a valid size prop', () => {
      expect(() =>
        transformScaleKeyToCss('paddingTop++foo::bp:lg:1__16', breakpoints, 'abc')
      ).toThrowError(ERROR_INVALID_CUSTOM_TOKEN);
    });

    describe('Exception 5 - Invalid Format Cases for Custom Token and Missing Value', () => {
      it("should throw error when a non-valid custom token is provided for 'textSize'", () => {
        expect(() =>
          transformScaleKeyToCss('textSize++invalid__16', breakpoints, 'abc')
        ).toThrowError(ERROR_INVALID_CUSTOM_TOKEN);
      });

      it("should throw error when the custom token is missing (empty) for 'textSize'", () => {
        expect(() => transformScaleKeyToCss('textSize++__16', breakpoints, 'abc')).toThrowError(
          ERROR_INVALID_CUSTOM_TOKEN
        );
      });

      it("should throw error when the value part is missing for 'textSize'", () => {
        expect(() => transformScaleKeyToCss('textSize++s:sm:1', breakpoints, 'abc')).toThrowError(
          ERROR_MISSING_VALUE
        );
      });
    });

    describe('Exception 6 - Unrecognized Dimension Key', () => {
      it("should throw error when provided with an invalid dimension key (e.g. 'paddingCenter__16')", () => {
        expect(() => transformScaleKeyToCss('paddingCenter__16', breakpoints, 'abc')).toThrowError(
          ERROR_NO_STANDARD_SCALE_KEY
        );
      });
    });

    describe('Exception 7 - Dimension Key with Extra Separators', () => {
      it("should throw error when the dimension key has extra '__' delimiters (e.g. 'paddingTop__16__16')", () => {
        expect(() => transformScaleKeyToCss('paddingTop__16__16', breakpoints, 'abc')).toThrowError(
          ERROR_INVALID_STANDARD_PATTERN
        );
      });
    });

    describe('Exception 8 - Invalid Dimension Identifier Format', () => {
      it('should throw error when the dimension key does not include any expected delimiters', () => {
        expect(() => transformScaleKeyToCss('invalidKey', breakpoints, 'abc')).toThrowError(
          ERROR_INVALID_KEY_FORMAT
        );
      });

      it('should throw error when the dimension key is only partially formatted', () => {
        expect(() => transformScaleKeyToCss('textSize-16', breakpoints, 'abc')).toThrowError(
          ERROR_INVALID_KEY_FORMAT
        );
      });

      it('should throw error when provided with an empty string as the dimension key', () => {
        expect(() => transformScaleKeyToCss('', breakpoints, 'abc')).toThrowError(
          ERROR_INVALID_KEY_FORMAT
        );
      });
    });
  });
});
