import { describe, expect, it } from 'vitest';
import { KISKADEE_TONES, type KiskadeeHexScale } from '../types/colors/colors.types.ts';
import {
  assertKiskadeeCssScale,
  assertKiskadeeHexScale,
  normalizeCssColorReference,
  normalizeHexColor
} from './hexColor.ts';
import { withAlpha } from './withAlpha.ts';

function makeScale(theme: 'light' | 'dark'): KiskadeeHexScale {
  const values = Object.fromEntries(KISKADEE_TONES.map((tone) => [tone, '#123456']));
  values[0] = theme === 'light' ? '#ffffff' : '#000000';
  values[100] = theme === 'light' ? '#000000' : '#ffffff';
  return values as KiskadeeHexScale;
}

describe('canonical color contract', () => {
  it.each([
    ['#ABC', '#aabbcc'],
    ['#ABCD', '#aabbccdd'],
    ['#AABBCC', '#aabbcc'],
    ['#AABBCCDD', '#aabbccdd']
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeHexColor(input)).toBe(expected);
  });

  it.each(['red', '#12', '#12345', '#gggggg'])('rejects invalid HEX %s', (input) => {
    expect(() => normalizeHexColor(input)).toThrow(/Invalid HEX color/);
  });

  it('overwrites alpha without changing RGB', () => {
    expect(withAlpha('#abcdef80', 100)).toBe('#abcdef');
    expect(withAlpha('#abcdef', 50)).toBe('#abcdef80');
  });

  it('uses a valid color-mix expression for dynamic references', () => {
    expect(withAlpha('var(--k-p-light-24)', 40)).toBe(
      'color-mix(in srgb, var(--k-p-light-24) 40%, transparent)'
    );
    expect(normalizeCssColorReference('var(--k-p-light-24)')).toBe('var(--k-p-light-24)');
    expect(() => normalizeCssColorReference('hsl(var(--k-p-light-24))')).toThrow(
      /Invalid CSS color reference/
    );
  });

  it('accepts complete Light and Dark scales with canonical caps', () => {
    expect(() => assertKiskadeeHexScale(makeScale('light'), 'light')).not.toThrow();
    expect(() => assertKiskadeeHexScale(makeScale('dark'), 'dark')).not.toThrow();
  });

  it('rejects missing, unknown and incorrectly oriented scale positions', () => {
    const missing = { ...makeScale('light') } as Record<number, string>;
    delete missing[24];
    expect(() => assertKiskadeeHexScale(missing, 'light')).toThrow(/Missing: 24/);

    const unknown = { ...makeScale('light'), 11: '#123456' };
    expect(() => assertKiskadeeHexScale(unknown, 'light')).toThrow(/Unknown: 11/);

    expect(() => assertKiskadeeHexScale(makeScale('light'), 'dark')).toThrow(
      /Invalid dark scale caps/
    );
  });

  it('rejects legacy subtle/vivid scales and incomplete CSS scales', () => {
    expect(() => assertKiskadeeHexScale({ subtle: {}, vivid: {} }, 'light')).toThrow();
    expect(() => assertKiskadeeCssScale({ 0: 'var(--k-p-light-0)' })).toThrow(/Missing:/);
  });
});
