import { describe, expect, it } from 'vitest';
import { convertHslaToHex } from '../convertHslaToHex';
import type { HSLA } from '@kiskadee/core';

describe('convertHslaToHex', () => {
  describe('Successful operation', () => {
    it('should convert pure red with full opacity to 3-digit hex', () => {
      // Pure red: h=0, s=100, l=50, alpha=1 -> "#FF0000" shortened to "#F00"
      const hsla: HSLA = [0, 100, 50, 1];
      expect(convertHslaToHex(hsla)).toBe('#F00');
    });

    it('should convert pure green with full opacity to 3-digit hex', () => {
      // Pure green: h=120, s=100, l=50, alpha=1 -> "#00FF00" shortened to "#0F0"
      const hsla: HSLA = [120, 100, 50, 1];
      expect(convertHslaToHex(hsla)).toBe('#0F0');
    });

    it('should convert pure blue with full opacity to 3-digit hex', () => {
      // Pure blue: h=240, s=100, l=50, alpha=1 -> "#0000FF" shortened to "#00F"
      const hsla: HSLA = [240, 100, 50, 1];
      expect(convertHslaToHex(hsla)).toBe('#00F');
    });

    it('should convert an orange color to valid hex with full opacity', () => {
      // Orange: h=30, s=100, l=50, alpha=1 -> "#FF8000" (cannot be shortened)
      const hsla: HSLA = [30, 100, 50, 1];
      expect(convertHslaToHex(hsla)).toBe('#FF8000');
    });

    it('should include alpha in hex when alpha is not 1, returning an 8-digit hex', () => {
      // Pure red with half-transparency: h=0, s=100, l=50, alpha=0.5 -> "#FF000080"
      const hsla: HSLA = [0, 100, 50, 0.5];
      expect(convertHslaToHex(hsla)).toBe('#FF000080');
    });

    it('should correctly handle hues near the upper boundary with alpha', () => {
      // For h=359, s=100, l=50, alpha=0.3 -> "#FF00044D"
      const hsla: HSLA = [359, 100, 50, 0.3];
      expect(convertHslaToHex(hsla)).toBe('#FF00044D');
    });

    it('should convert black color to hex properly and shorten it when possible', () => {
      // Black: any h, s=0, l=0, alpha=1 -> "#000000" shortened to "#000"
      const hsla: HSLA = [0, 0, 0, 1];
      expect(convertHslaToHex(hsla)).toBe('#000');
    });
  });

  describe('Error handling', () => {
    it('should throw an error when hsla is null', () => {
      const errorMessage = 'Invalid hsla value: expected an array, received object';
      expect(() => convertHslaToHex(null as unknown as HSLA)).toThrowError(errorMessage);
    });

    it('should throw an error when hsla is not an array', () => {
      const errorMessage = 'Invalid hsla value: expected an array, received object';
      expect(() => convertHslaToHex({} as unknown as HSLA)).toThrowError(errorMessage);
    });

    it('should throw an error when hsla array has less than 3 items', () => {
      const invalidHsla = [0, 100] as unknown as HSLA;
      const errorMessage = 'Invalid hsla array length: expected 3 or 4, received 2';
      expect(() => convertHslaToHex(invalidHsla)).toThrowError(errorMessage);
    });

    it('should throw an error when hsla array has more than 4 items', () => {
      const invalidHsla = [0, 100, 50, 1, 0] as unknown as HSLA;
      const errorMessage = 'Invalid hsla array length: expected 3 or 4, received 5';
      expect(() => convertHslaToHex(invalidHsla)).toThrowError(errorMessage);
    });

    it('should throw an error when hsla array contains non-numeric values', () => {
      const invalidHsla = ['0', '100', '50', '1'] as unknown as HSLA;
      const errorMessage = 'Invalid hsla value at index 0: expected a number, received 0';
      expect(() => convertHslaToHex(invalidHsla)).toThrowError(errorMessage);
    });

    it('should throw an error when alpha is undefined', () => {
      // Now that no hsla value can be undefined or null, this should throw.
      const invalidHsla = [30, 100, 50, undefined] as unknown as HSLA;
      const errorMessage = 'Invalid hsla value at index 3: expected a number, received undefined';
      expect(() => convertHslaToHex(invalidHsla)).toThrowError(errorMessage);
    });
  });
});
