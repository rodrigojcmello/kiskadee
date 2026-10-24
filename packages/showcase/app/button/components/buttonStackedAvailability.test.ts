import { describe, expect, it } from 'vitest';
import { supportsStackedButtonSize } from './buttonStackedAvailability';

describe('Stacked Button availability in Showcase', () => {
  const sizes = ['sm:1', 'md:1', 'lg:1', 'lg:2'];
  it('requires container, label, and icon recipes at the actual fixed size', () => {
    const elements = {
      e8: {
        s: { 'md:1': 'stacked-padding', 'lg:1': 'stacked-large-padding' },
        rr: { all: 'rounded' }
      },
      e9: { s: { 'md:1': 'stacked-type', 'lg:1': 'stacked-large-type' } },
      e10: { s: { 'md:1': 'stacked-icon' } }
    };
    expect(supportsStackedButtonSize(elements, 's:md:1', sizes, 'rounded')).toBe(true);
    expect(supportsStackedButtonSize(elements, 's:lg:1', sizes, 'rounded')).toBe(false);
    expect(supportsStackedButtonSize(elements, 's:sm:1', sizes, 'rounded')).toBe(false);
    expect(
      supportsStackedButtonSize({ ...elements, e9: undefined }, 's:md:1', sizes, 'rounded')
    ).toBe(false);
    expect(supportsStackedButtonSize(undefined, 's:md:1', sizes, 'rounded')).toBe(false);
  });

  it('accepts published shared recipes and ignores inspection-only data or empty classes', () => {
    expect(
      supportsStackedButtonSize(
        {
          e8: { s: { all: 'padding' }, rr: { all: 'rounded' } },
          e9: { s: { all: 'type' } },
          e10: { s: { all: 'icon' } }
        },
        's:lg:2',
        sizes,
        'rounded'
      )
    ).toBe(true);
    expect(
      supportsStackedButtonSize(
        {
          e8: { s: { all: 'padding' }, rr: { all: 'rounded' } },
          e9: { s: { all: 'type' } },
          e10: {}
        },
        's:md:1',
        sizes,
        'rounded'
      )
    ).toBe(false);
    expect(
      supportsStackedButtonSize(
        {
          e8: { s: { all: 'padding' }, rr: { all: 'rounded' } },
          e9: { s: { all: 'type' } },
          e10: { s: { 'md:1': '' } }
        },
        's:md:1',
        sizes,
        'rounded'
      )
    ).toBe(false);
  });

  it('requires derived metadata even when all three elements have shared classes', () => {
    const elements = {
      e8: { s: { all: 'border-only' }, rr: { all: 'rounded' } },
      e9: { s: { all: 'gap-only' } },
      e10: { s: { all: 'icon' } }
    };
    expect(supportsStackedButtonSize(elements, 's:md:1', ['md:1'], 'rounded')).toBe(true);
    expect(supportsStackedButtonSize(elements, 's:sm:1', ['md:1'], 'rounded')).toBe(false);
    expect(supportsStackedButtonSize(elements, 's:md:1', [], 'rounded')).toBe(false);
    expect(supportsStackedButtonSize(elements, 's:md:1', undefined, 'rounded')).toBe(false);
  });

  it('requires the effective radius bucket at the actual size, including shared recipes', () => {
    const elements = {
      e8: {
        s: { all: 'container' },
        rr: { 'lg:1': 'rounded-large' },
        rp: { 'md:1': 'pill-medium' },
        rs: { all: 'square' }
      },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    };
    expect(supportsStackedButtonSize(elements, 's:md:1', sizes, 'rounded')).toBe(false);
    expect(supportsStackedButtonSize(elements, 's:md:1', sizes, 'pill')).toBe(true);
    expect(supportsStackedButtonSize(elements, 's:lg:1', sizes, 'pill')).toBe(false);
    expect(supportsStackedButtonSize(elements, 's:lg:1', sizes, 'rounded')).toBe(true);
    expect(supportsStackedButtonSize(elements, 's:md:1', sizes, 'square')).toBe(true);
    expect(
      supportsStackedButtonSize(
        { ...elements, e8: { ...elements.e8, rp: { 'md:1': '' } } },
        's:md:1',
        sizes,
        'pill'
      )
    ).toBe(false);
  });
});
