import type { FontStack } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { SYSTEM_MONOSPACE_FONT_STACK, toCssFontFamily } from './fontFamily.ts';

describe('toCssFontFamily', () => {
  it('supports a stack with one family', () => {
    expect(toCssFontFamily(['Roboto'])).toBe('Roboto');
  });

  it('supports arbitrary fallbacks and quotes names only when CSS requires it', () => {
    const stack = ['Acme Sans', 'Arial', 'system-ui', 'sans-serif'] as const satisfies FontStack;

    expect(toCssFontFamily(stack)).toBe('"Acme Sans", Arial, system-ui, sans-serif');
  });

  it('preserves explicitly quoted family names', () => {
    expect(toCssFontFamily(['"Already Quoted"', 'serif'])).toBe('"Already Quoted", serif');
  });

  it('quotes CSS-wide keywords and escapes unsafe family-name content', () => {
    expect(toCssFontFamily(['inherit', 'Acme!', 'Bad; color:red', 'A" B'])).toBe(
      '"inherit", "Acme!", "Bad; color:red", "A\\" B"'
    );
  });

  it('escapes control characters inside quoted family names', () => {
    expect(toCssFontFamily(['Line\nBreak'])).toBe('"Line\\a Break"');
  });

  it('provides the canonical code fallback stack', () => {
    expect(toCssFontFamily(SYSTEM_MONOSPACE_FONT_STACK)).toBe(
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    );
  });
});
