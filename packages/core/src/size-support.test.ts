import { expect, it } from 'vitest';
import { resolveSupportedSize, selectSizeSupport } from './density.ts';

it('falls back to Medium for density or explicit sizes without fabricating recipes', () => {
  for (const requested of ['sm:1', 's:lg:1', 'md:1', 's:sm:3'])
    expect(resolveSupportedSize(requested, ['md:1'])).toBe('md:1');
  expect(resolveSupportedSize('s:sm:1', ['sm:1', 'md:1'])).toBe('sm:1');
  expect(resolveSupportedSize('s:lg:1', ['sm:1', 'md:1'])).toBe('md:1');
  expect(() => resolveSupportedSize('sm:1', ['sm:1', 'lg:1'])).toThrow('Medium');
  expect(resolveSupportedSize('lg:1', [])).toBe('md:1');
});
it('does not borrow support from another variant or mode', () => {
  const support = {
    variants: {
      first: { modes: { base: { sizes: ['md:1'] }, alternate: { sizes: ['md:1', 'lg:1'] } } },
      second: { sizes: ['sm:1', 'md:1'] }
    }
  };
  expect(
    resolveSupportedSize('lg:1', selectSizeSupport(support, { variant: 'first', mode: 'base' }))
  ).toBe('md:1');
  expect(
    resolveSupportedSize(
      'lg:1',
      selectSizeSupport(support, { variant: 'first', mode: 'alternate' })
    )
  ).toBe('lg:1');
});
