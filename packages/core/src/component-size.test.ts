import { describe, expect, it } from 'vitest';
import { elementSizeValues } from './breakpoints.ts';
import {
  componentScaleToSize,
  componentSizeScales,
  componentSizeToScale
} from './component-size.ts';

describe('public component sizes', () => {
  it('covers every canonical scale exactly once in ascending order', () => {
    expect(Object.values(componentSizeScales)).toEqual(elementSizeValues);
    expect(new Set(Object.values(componentSizeScales)).size).toBe(elementSizeValues.length);
  });

  it('preserves numbered levels on both sides of medium', () => {
    expect(componentSizeToScale('sm2')).toBe('s:sm:2');
    expect(componentSizeToScale('md')).toBe('s:md:1');
    expect(componentSizeToScale('lg2')).toBe('s:lg:2');
  });

  it('round trips preset catalog sizes without turning absence into an explicit size', () => {
    for (const scale of elementSizeValues) {
      expect(componentSizeToScale(componentScaleToSize(scale))).toBe(scale);
    }
    expect(componentScaleToSize(undefined)).toBeUndefined();
  });
});
