import { describe, expect, it } from 'vitest';
import {
  getRecommendedBrandIconAppearance,
  getRecommendedBrandIconPresentation
} from './brand-icon-presentation';

describe('recommended brand icon presentation', () => {
  it('uses monochrome for high emphasis on subtle surfaces', () => {
    expect(getRecommendedBrandIconPresentation('onSubtle', 'high')).toBe('monochrome');
  });

  it.each([
    'medium',
    'low',
    'lowest'
  ] as const)('uses the brand presentation for %s emphasis on subtle surfaces', (emphasis) => {
    expect(getRecommendedBrandIconPresentation('onSubtle', emphasis)).toBe('brand');
  });

  it('uses the brand presentation for high emphasis on vivid surfaces', () => {
    expect(getRecommendedBrandIconPresentation('onVivid', 'high')).toBe('brand');
  });

  it.each([
    'medium',
    'low',
    'lowest'
  ] as const)('uses the monochrome presentation for %s emphasis on vivid surfaces', (emphasis) => {
    expect(getRecommendedBrandIconPresentation('onVivid', emphasis)).toBe('monochrome');
  });

  it.each([
    ['onSubtle', 'high', 'mark', 'monochrome'],
    ['onSubtle', 'medium', 'contained', 'brand'],
    ['onSubtle', 'low', 'contained', 'brand'],
    ['onSubtle', 'lowest', 'contained', 'brand'],
    ['onVivid', 'high', 'mark', 'monochrome'],
    ['onVivid', 'medium', 'mark', 'monochrome'],
    ['onVivid', 'low', 'mark', 'monochrome'],
    ['onVivid', 'lowest', 'mark', 'monochrome']
  ] as const)('uses Reddit %s/%s as %s.%s', (surfaceContext, emphasis, construction, presentation) => {
    expect(getRecommendedBrandIconAppearance('reddit', surfaceContext, emphasis, true)).toEqual({
      construction,
      presentation
    });
  });

  it('keeps single-construction brands on mark', () => {
    expect(getRecommendedBrandIconAppearance('google', 'onSubtle', 'medium', true)).toEqual({
      construction: 'mark',
      presentation: 'brand'
    });
    expect(getRecommendedBrandIconAppearance('apple', 'onVivid', 'high', false)).toEqual({
      construction: 'mark',
      presentation: 'monochrome'
    });
  });
});
