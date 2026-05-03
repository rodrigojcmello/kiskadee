import { describe, it, expect } from 'vitest';
import { shortenCssClassNames } from './shortenCssClassNames.ts';
import type { StyleKeyUsageMap } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { getToken } from '../utils/index.ts';

describe('shortenCssClassNames', () => {
  it('should return an empty object when usage map is empty', () => {
    const usage: StyleKeyUsageMap = {};
    const result = shortenCssClassNames(usage);
    expect(result).toEqual({});
  });

  it('should map a single key to "a"', () => {
    const usage: StyleKeyUsageMap = { primary: 42 };
    const result = shortenCssClassNames(usage);
    expect(result).toEqual({ primary: 'a' });
  });

  it('should assign tokens in insertion order for multiple keys', () => {
    const keys: string[] = ['one', 'two', 'three', 'four', 'five'];
    const usage: StyleKeyUsageMap = {};
    // simulate a sorted usage map by insertion order
    for (const k of keys) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      usage[k as any] = 1;
    }

    const result = shortenCssClassNames(usage);
    const mappedKeys = Object.keys(result);

    expect(mappedKeys).toEqual(keys);
    mappedKeys.forEach((key, idx) => {
      expect(result[key]).toBe(getToken(idx));
    });
  });

  it('should produce correct tokens for alphabet boundaries', () => {
    const count = 28;
    const usage: StyleKeyUsageMap = {};
    // create 28 dummy keys k0...k27
    for (let i = 0; i < count; i++) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      usage[`k${i}` as any] = 1;
    }

    const result = shortenCssClassNames(usage);

    // check the first and last few mappings
    expect(result.k0).toBe('a'); // index 0
    expect(result.k25).toBe('z'); // index 25
    expect(result.k26).toBe('aa'); // index 26
    expect(result.k27).toBe('ab'); // index 27

    // full coverage: each key map to getToken of its index
    Object.keys(usage).forEach((key, idx) => {
      expect(result[key]).toBe(getToken(idx));
    });
  });
});
