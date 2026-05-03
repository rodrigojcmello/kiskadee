import {
  CssDecorationProperty,
  CssTextDecorationValue,
  type TextLineTypeProperty,
  type TextLineTypeValue
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformTextLineTypeKeyToCss } from './transformTextLineTypeKeyToCss.ts';

const propertyName: TextLineTypeProperty = 'textLineType';
const { textLineType } = CssDecorationProperty;
const { lineThrough, underline, none } = CssTextDecorationValue;

describe('transformTextLineTypeKeyToCss', () => {
  describe('Successful operation', () => {
    it('should return CSS for text line type "underline"', () => {
      const textLineTypeValue: TextLineTypeValue = 'underline';
      const styleKey = `${propertyName}__${textLineTypeValue}`;
      const className = styleKey;
      const expectedRule = `.${className} { ${textLineType}: ${underline} }`;
      const result = transformTextLineTypeKeyToCss(styleKey, className);

      expect(result).toBe(expectedRule);
    });

    it('should return CSS for text line type "lineThrough"', () => {
      const textLineTypeValue: TextLineTypeValue = 'lineThrough';
      const styleKey = `${propertyName}__${textLineTypeValue}`;
      const className = styleKey;
      const expectedRule = `.${className} { ${textLineType}: ${lineThrough} }`;
      const result = transformTextLineTypeKeyToCss(styleKey, className);

      expect(result).toBe(expectedRule);
    });

    it('should return CSS for text line type "none"', () => {
      const textLineTypeValue: TextLineTypeValue = 'none';
      const styleKey = `${propertyName}__${textLineTypeValue}`;
      const className = styleKey;
      const expectedRule = `.${className} { ${textLineType}: ${none} }`;
      const result = transformTextLineTypeKeyToCss(styleKey, className);

      expect(result).toBe(expectedRule);
    });
  });

  describe('Error handling', () => {
    describe('Unsupported property errors', () => {
      it('throws error if style key prefix is incorrect', () => {
        const invalidProperty = 'invalidProperty';
        const styleKey = `${invalidProperty}__underline`;
        const className = styleKey;
        const expectedMessage = UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey);

        let caught: unknown;
        try {
          transformTextLineTypeKeyToCss(styleKey, className);
        } catch (err) {
          caught = err;
        }

        expect(caught).toBeInstanceOf(Error);
        const error = caught as Error;
        expect(error.message).toBe(expectedMessage);
      });

      it('throws error if style key format is invalid', () => {
        const styleKey = 'textLineType-underline';
        const className = styleKey;
        const expectedMessage = UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey);

        let caught: unknown;
        try {
          transformTextLineTypeKeyToCss(styleKey, className);
        } catch (err) {
          caught = err;
        }

        expect(caught).toBeInstanceOf(Error);
        const error = caught as Error;
        expect(error.message).toBe(expectedMessage);
      });
    });

    describe('Unsupported value errors', () => {
      it('throws error if the value part is missing', () => {
        const styleKey = `${propertyName}__`;
        const className = styleKey;
        const expectedMessage = UNSUPPORTED_VALUE(propertyName, '', styleKey);

        let caught: unknown;
        try {
          transformTextLineTypeKeyToCss(styleKey, className);
        } catch (err) {
          caught = err;
        }

        expect(caught).toBeInstanceOf(Error);
        const error = caught as Error;
        expect(error.message).toBe(expectedMessage);
      });

      it('throws error if value contains unexpected separators', () => {
        const invalidValue = 'underline__dotted';
        const styleKey = `${propertyName}__${invalidValue}`;
        const className = styleKey;
        const expectedMessage = UNSUPPORTED_VALUE(propertyName, invalidValue, styleKey);

        let caught: unknown;
        try {
          transformTextLineTypeKeyToCss(styleKey, className);
        } catch (err) {
          caught = err;
        }

        expect(caught).toBeInstanceOf(Error);
        const error = caught as Error;
        expect(error.message).toBe(expectedMessage);
      });

      it('throws error if value is unsupported', () => {
        const invalidValue = 'overline';
        const styleKey = `${propertyName}__${invalidValue}`;
        const className = styleKey;
        const expectedMessage = UNSUPPORTED_VALUE(propertyName, invalidValue, styleKey);

        let caught: unknown;
        try {
          transformTextLineTypeKeyToCss(styleKey, className);
        } catch (err) {
          caught = err;
        }

        expect(caught).toBeInstanceOf(Error);
        const error = caught as Error;
        expect(error.message).toBe(expectedMessage);
      });
    });
  });
});
