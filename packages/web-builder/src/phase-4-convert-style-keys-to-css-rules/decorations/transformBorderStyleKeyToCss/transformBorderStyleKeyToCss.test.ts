import { describe, expect, it } from 'vitest';
import { transformBorderStyleKeyToCss } from './transformBorderStyleKeyToCss.ts';

const className = 'abc';

describe('transformBorderStyleKeyToCss', () => {
  describe('when value is valid', () => {
    it.each([
      ['none', '.abc { border-style: none }'],
      ['dotted', '.abc { border-style: dotted }'],
      ['dashed', '.abc { border-style: dashed }'],
      ['solid', '.abc { border-style: solid }']
    ])('transforms "%s" into a CSS rule', (value, expected) => {
      // Given
      const styleKey = `borderStyle__${value}`;

      // When
      const result = transformBorderStyleKeyToCss(styleKey, className);

      // Then
      expect(result).toEqual(expected);
    });
  });
  describe('when key is invalid', () => {
    it('throws unsupported property error', () => {
      // Given
      const invalidKey = 'invalidProperty__solid';

      // When
      const act = (): string => transformBorderStyleKeyToCss(invalidKey, className);

      // Then
      expect(act).toThrowError(
        'Invalid style key "invalidProperty__solid". The property name must be "borderStyle".'
      );
    });

    it('throws unsupported value error for unknown value segment', () => {
      // Given
      const invalidKey = 'borderStyle__unknownValue';

      // When
      const act = (): string => transformBorderStyleKeyToCss(invalidKey, className);

      // Then
      expect(act).toThrowError(
        'Unsupported value "unknownValue" for property "borderStyle" in style key "borderStyle__unknownValue".'
      );
    });

    it('throws unsupported value error for missing value segment', () => {
      // Given
      const invalidKey = 'borderStyle';

      // When
      const act = (): string => transformBorderStyleKeyToCss(invalidKey, className);

      // Then
      expect(act).toThrowError(
        'Unsupported value "undefined" for property "borderStyle" in style key "borderStyle".'
      );
    });

    it('throws unsupported value error for multiple value segments', () => {
      // Given
      const invalidKey = 'borderStyle__solid__extra';

      // When
      const act = (): string => transformBorderStyleKeyToCss(invalidKey, className);

      // Then
      expect(act).toThrowError(
        'Unsupported value "solid__extra" for property "borderStyle" in style key "borderStyle__solid__extra".'
      );
    });
  });
});
