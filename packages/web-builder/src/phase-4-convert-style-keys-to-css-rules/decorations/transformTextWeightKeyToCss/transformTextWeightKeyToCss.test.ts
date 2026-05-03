import type { TextWeightValue } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformTextWeightKeyToCss } from './transformTextWeightKeyToCss.ts';

const propertyName = 'textWeight';

describe('transformTextWeightKeyToCss', () => {
  describe('Successful operation', () => {
    it('should return a CSS rule string for text weight "thin"', () => {
      const textWeightValue: TextWeightValue = 'thin';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 100 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "extraLight"', () => {
      const textWeightValue: TextWeightValue = 'extraLight';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 200 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "light"', () => {
      const textWeightValue: TextWeightValue = 'light';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 300 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "normal"', () => {
      const textWeightValue: TextWeightValue = 'normal';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 400 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "medium"', () => {
      const textWeightValue: TextWeightValue = 'medium';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 500 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "semiBold"', () => {
      const textWeightValue: TextWeightValue = 'semiBold';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 600 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "bold"', () => {
      const textWeightValue: TextWeightValue = 'bold';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 700 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "extraBold"', () => {
      const textWeightValue: TextWeightValue = 'extraBold';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 800 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });

    it('should return a CSS rule string for text weight "black"', () => {
      const textWeightValue: TextWeightValue = 'black';
      const styleKey = `${propertyName}__${textWeightValue}`;
      const className = styleKey;
      const expectedCssRule = `.${className} { font-weight: 900 }`;
      const result = transformTextWeightKeyToCss(styleKey, className);

      expect(result).toBe(expectedCssRule);
    });
  });

  describe('Error handling', () => {
    it('should throw an error when the key does not start with "textWeight__"', () => {
      const invalidProperty = 'invalidProperty';
      const textWeightValue: TextWeightValue = 'bold';
      const styleKey = `${invalidProperty}__${textWeightValue}`;
      const className = styleKey;
      const expectedError = UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey);
      const result = () => transformTextWeightKeyToCss(styleKey, className);

      expect(result).toThrowError(expectedError);
    });

    it('should throw an error when the value is not supported', () => {
      const unsupportedValue = 'unsupported' as TextWeightValue;
      const styleKey = `${propertyName}__${unsupportedValue}`;
      const className = styleKey;
      const expectedError = UNSUPPORTED_VALUE(propertyName, unsupportedValue, styleKey);
      const result = () => transformTextWeightKeyToCss(styleKey, className);

      expect(result).toThrowError(expectedError);
    });
  });
});
