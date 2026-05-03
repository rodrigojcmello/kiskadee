import type { TextItalicKeyToken } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformTextItalicKeyToCss } from './transformTextItalicKeyToCss.ts';

const className = 'abc';

describe('transformTextItalicKeyToCss function', () => {
  describe('Successful operation', () => {
    it('should return a CSS string for italic text "true"', () => {
      const styleKey = 'textItalic__true';

      const result = transformTextItalicKeyToCss(styleKey, className);

      expect(result).toEqual('.abc { font-style: italic; }');
    });

    it('should return a CSS string for italic text "false"', () => {
      const styleKey = 'textItalic__false';

      const result = transformTextItalicKeyToCss(styleKey, className);

      expect(result).toEqual('.abc { font-style: normal; }');
    });
  });

  describe('Error handling', () => {
    it('should throw an error for style keys that do not start with "textItalic__"', () => {
      const invalidProperty = 'notTextItalic';
      const textItalicValue: TextItalicKeyToken = 'true';
      const styleKey = `${invalidProperty}__${textItalicValue}`;
      const result = (): string => transformTextItalicKeyToCss(styleKey, className);

      expect(result).toThrowError(UNSUPPORTED_PROPERTY_NAME('textItalic', styleKey));
    });

    it('should throw an error for style keys that are not correctly separated', () => {
      const styleKey = 'textItalictrue';
      const result = (): string => transformTextItalicKeyToCss(styleKey, className);

      expect(result).toThrowError(UNSUPPORTED_PROPERTY_NAME('textItalic', styleKey));
    });

    it('should throw an error for unsupported values', () => {
      const invalidValue = 'center';
      const styleKey = `textItalic__${invalidValue}`;
      const result = (): string => transformTextItalicKeyToCss(styleKey, className);

      expect(result).toThrowError(UNSUPPORTED_VALUE('textItalic', invalidValue, styleKey));
    });

    it('should throw an error for keys with extra segments', () => {
      const validValue: TextItalicKeyToken = 'true';
      const extraSegment = 'extra';
      const styleKey = `textItalic__${validValue}__${extraSegment}`;
      const transform = (): string => transformTextItalicKeyToCss(styleKey, className);

      expect(transform).toThrowError(
        UNSUPPORTED_VALUE('textItalic', `${validValue}__${extraSegment}`, styleKey)
      );
    });

    it('should throw an error for keys with empty value segment', () => {
      const key = 'textItalic__';
      const transform = (): string => transformTextItalicKeyToCss(key, className);

      expect(transform).toThrowError(UNSUPPORTED_VALUE('textItalic', '', key));
    });

    it('should throw an error for an empty style key', () => {
      const styleKey = '';
      const transform = (): string => transformTextItalicKeyToCss(styleKey, className);

      expect(transform).toThrowError(UNSUPPORTED_PROPERTY_NAME('textItalic', styleKey));
    });
  });
});
