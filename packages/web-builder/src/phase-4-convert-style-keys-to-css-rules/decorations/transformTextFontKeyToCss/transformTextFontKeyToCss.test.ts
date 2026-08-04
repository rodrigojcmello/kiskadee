import { describe, expect, it } from 'vitest';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformTextFontKeyToCss } from './transformTextFontKeyToCss.ts';

const propertyName = 'textFont';

describe('transformTextFontKeyToCss', () => {
  describe('Semantic Tokens', () => {
    it('should generate var(--k-font-heading) for heading token', () => {
      const styleKey = 'textFont__heading';
      const className = 'test-class';
      const result = transformTextFontKeyToCss(styleKey, className);
      expect(result).toBe(
        '.test-class { font-family: var(--k-font-heading, var(--k-font-body, inherit)) }'
      );
    });

    it('should generate var(--k-font-body) for body token', () => {
      const styleKey = 'textFont__body';
      const className = 'test-class';
      const result = transformTextFontKeyToCss(styleKey, className);
      expect(result).toBe('.test-class { font-family: var(--k-font-body, inherit) }');
    });

    it('should generate var(--k-font-code) for code token', () => {
      const styleKey = 'textFont__code';
      const className = 'test-class';
      const result = transformTextFontKeyToCss(styleKey, className);
      expect(result).toBe(
        '.test-class { font-family: var(--k-font-code, ui-monospace, SFMono-Regular, Menlo, ' +
          'Monaco, Consolas, "Liberation Mono", "Courier New", monospace) }'
      );
    });
  });

  describe('Error handling', () => {
    it('should throw an error when the key does not start with "textFont__"', () => {
      const styleKey = 'wrongProp__body';
      expect(() => transformTextFontKeyToCss(styleKey, 'cls')).toThrowError(
        UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey)
      );
    });

    it('should throw an error for unsupported token values', () => {
      const unsupported = 'unsupported';
      const styleKey = `${propertyName}__${unsupported}`;
      expect(() => transformTextFontKeyToCss(styleKey, 'cls')).toThrowError(
        UNSUPPORTED_VALUE(propertyName, unsupported, styleKey)
      );
    });
  });
});
