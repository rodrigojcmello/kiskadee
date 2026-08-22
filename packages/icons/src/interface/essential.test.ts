import { describe, expect, it } from 'vitest';
import { DEFAULT_ESSENTIAL_ICONS, type EssentialIconMap } from './essential.ts';

describe('essential icon contract', () => {
  it('publishes the complete default identity map', () => {
    expect(DEFAULT_ESSENTIAL_ICONS).toEqual({
      check: 'check',
      'radio-selected': 'radio-selected',
      'chevron-down': 'chevron-down',
      'chevron-up': 'chevron-up',
      'chevron-left': 'chevron-left',
      'chevron-end': 'chevron-end',
      close: 'close'
    });
    expect(Object.isFrozen(DEFAULT_ESSENTIAL_ICONS)).toBe(true);
  });

  it('accepts partial and custom namespaced mappings', () => {
    const icons: EssentialIconMap = { check: 'acme:confirmed' };
    expect(icons).toEqual({ check: 'acme:confirmed' });
  });
});
