import { describe, expect, it } from 'vitest';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformTextAlignKeyToCss } from './transformTextAlignKeyToCss.ts';

const className = 'abc';

describe('transformTextAlignKeyToCss', () => {
  describe('Successful operation', () => {
    it('should return GeneratedCss for "left"', () => {
      const result = transformTextAlignKeyToCss('textAlign__left', className);
      expect(result).toEqual('.abc { text-align: left }');
    });
    it('should return GeneratedCss for "center"', () => {
      const result = transformTextAlignKeyToCss('textAlign__center', className);
      expect(result).toEqual('.abc { text-align: center }');
    });
    it('should return GeneratedCss for "right"', () => {
      const result = transformTextAlignKeyToCss('textAlign__right', className);
      expect(result).toEqual('.abc { text-align: right }');
    });
    it('should return GeneratedCss for "justify"', () => {
      const result = transformTextAlignKeyToCss('textAlign__justify', className);
      expect(result).toEqual('.abc { text-align: justify }');
    });
  });

  describe('Error handling', () => {
    it('should throw an error for unsupported alignment value', () => {
      const call = (): string => transformTextAlignKeyToCss('textAlign__top', className);
      expect(call).toThrowError(UNSUPPORTED_VALUE('textAlign', 'top', 'textAlign__top'));
    });
    it('should throw an error for an invalid prefix', () => {
      const call = (): string => transformTextAlignKeyToCss('alignText__center', className);
      expect(call).toThrowError(UNSUPPORTED_PROPERTY_NAME('textAlign', 'alignText__center'));
    });
    it('should throw an error for extra separators', () => {
      const call = (): string => transformTextAlignKeyToCss('textAlign__center__extra', className);
      expect(call).toThrowError(
        UNSUPPORTED_VALUE('textAlign', 'center__extra', 'textAlign__center__extra')
      );
    });
    it('should throw an error for missing separators', () => {
      const call = (): string => transformTextAlignKeyToCss('textAlign-center', className);
      expect(call).toThrowError(UNSUPPORTED_PROPERTY_NAME('textAlign', 'textAlign-center'));
    });
  });
});
