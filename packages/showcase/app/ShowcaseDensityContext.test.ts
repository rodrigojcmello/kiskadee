import { expect, it } from 'vitest';
import { resolveDisplayedDensity } from './ShowcaseDensityContext';

const all = { c: 'sm:1', r: 'md:1', s: 'md:1' };

it.each([
  [767, 'spacious'],
  [768, 'regular'],
  [1151, 'regular'],
  [1152, 'compact']
])('resolves the automatic platform at width %i', (width, expected) => {
  expect(resolveDisplayedDensity(all, Number(width))).toBe(expected);
});
it('matches fixed and sparse map fallbacks without selecting disabled options', () => {
  for (const width of [390, 900, 1500])
    expect(resolveDisplayedDensity({ r: 'md:1' }, width)).toBe('regular');
  expect(resolveDisplayedDensity({ c: 'sm:1', s: 'lg:1' }, 900)).toBe('spacious');
  expect(resolveDisplayedDensity({ c: 'sm:1', r: 'md:1' }, 390)).toBe('regular');
  expect(resolveDisplayedDensity({ r: 'md:1', s: 'lg:1' }, 1500)).toBe('regular');
});
it('keeps a manual selection through viewport changes and resolves again after reset', () => {
  expect(resolveDisplayedDensity(all, 1500, 'spacious')).toBe('spacious');
  expect(resolveDisplayedDensity(all, 390, 'compact')).toBe('compact');
  expect(resolveDisplayedDensity(all, 1500, undefined)).toBe('compact');
  expect(resolveDisplayedDensity({ r: 'md:1' }, 390, 'compact')).toBe('regular');
});
