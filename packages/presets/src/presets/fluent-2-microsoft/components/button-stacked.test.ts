import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const sizes = ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2'] as const;

describe('Fluent stacked Button recipe', () => {
  it('accounts for its reference height with independent icon, line, gap and insets', () => {
    const { e8: root, e9: label, e10: icon } = schema.components.button!.elements;
    const icons = schema.global!.iconSizes!;
    const profiles = schema.global!.typography!.profiles;
    const typography = label!.typography as Record<string, keyof typeof profiles>;
    const iconSize = icon!.iconSize as Record<string, keyof typeof icons>;
    const inlineIconSize = schema.components.button!.elements.e3!.iconSize as Record<
      string,
      keyof typeof icons
    >;

    for (const size of sizes) {
      const profile = profiles[typography[size]!]!;
      const lineHeight = profile.scales.textHeight as number;
      const iconHeight = icons[iconSize[size]!]!;
      const reference = (root!.scales!._boxHeight as Record<string, number>)[size]!;
      const top = (root!.scales!.paddingTop as Record<string, number>)[size]!;
      const bottom = (root!.scales!.paddingBottom as Record<string, number>)[size]!;
      const border = (root!.scales!.borderWidth as Record<string, number>)[size]!;
      const gap = (label!.scales!.marginTop as Record<string, number>)[size]!;

      // Builder deducts each border from the authored inset before CSS emission.
      expect(iconHeight + lineHeight + gap + (top - border) + (bottom - border) + 2 * border).toBe(
        reference
      );
      expect(iconHeight).toBeGreaterThan(icons[inlineIconSize[size]!]!);
    }
  });

  it('shares the border and fixed corner recipes without changing horizontal sizes', () => {
    const { e1: horizontal, e8: stacked } = schema.components.button!.elements;
    const horizontalRadii = horizontal!.scales!.borderRadius!;
    const stackedRadii = stacked!.scales!.borderRadius!;

    expect(stacked!.scales!.borderWidth).toEqual(horizontal!.scales!.borderWidth);
    expect(stackedRadii.rounded).toBe(horizontalRadii.rounded);
    expect(stackedRadii.square).toBe(horizontalRadii.square);
    expect(horizontal!.scales!._boxHeight).toEqual({
      's:sm:1': 24,
      's:md:1': 32,
      's:lg:1': 40,
      's:lg:2': 48
    });
    for (const size of sizes) {
      expect((stackedRadii.pill as Record<string, number>)[size]! * 2).toBe(
        (stacked!.scales!._boxHeight as Record<string, number>)[size]
      );
    }
  });

  it('shares the small caption between Small and Medium without reducing their icons or spacing', () => {
    const {
      e2: horizontalLabel,
      e8: root,
      e9: label,
      e10: icon
    } = schema.components.button!.elements;
    const icons = schema.global!.iconSizes!;
    const profiles = schema.global!.typography!.profiles;
    const typography = label!.typography as Record<string, keyof typeof profiles>;
    const mediumProfile = profiles[typography['s:md:1']!]!;
    const smallProfile = profiles[typography['s:sm:1']!]!;
    const iconSize = icon!.iconSize as Record<string, keyof typeof icons>;

    expect(mediumProfile.scales).toEqual({ textSize: 10, textHeight: 14 });
    expect(smallProfile).toEqual(mediumProfile);
    expect(icons[iconSize['s:sm:1']!]!).toBe(20);
    expect((root!.scales!.paddingTop as Record<string, number>)['s:sm:1']).toBe(4);
    expect((root!.scales!.paddingBottom as Record<string, number>)['s:sm:1']).toBe(4);
    expect((root!.scales!.paddingLeft as Record<string, number>)['s:sm:1']).toBe(8);
    expect((root!.scales!.paddingRight as Record<string, number>)['s:sm:1']).toBe(8);
    expect((label!.scales!.marginTop as Record<string, number>)['s:sm:1']).toBe(4);
    expect((root!.scales!._boxHeight as Record<string, number>)['s:sm:1']).toBe(46);
    expect(icons[iconSize['s:md:1']!]!).toBe(24);
    expect((root!.scales!.paddingTop as Record<string, number>)['s:md:1']).toBe(6);
    expect((root!.scales!.paddingBottom as Record<string, number>)['s:md:1']).toBe(6);
    expect((root!.scales!.paddingLeft as Record<string, number>)['s:md:1']).toBe(12);
    expect((root!.scales!.paddingRight as Record<string, number>)['s:md:1']).toBe(12);
    expect((label!.scales!.marginTop as Record<string, number>)['s:md:1']).toBe(4);
    expect(horizontalLabel!.typography).toEqual({
      's:sm:1': 'caption-medium',
      's:md:1': 'body-medium-strong',
      's:lg:1': 'label-large',
      's:lg:2': 'label-large'
    });
    expect(typography['s:sm:1']).toBe('caption-small');
    expect(typography['s:lg:1']).toBe('body-medium');
    expect(typography['s:lg:2']).toBe('body-medium');
  });

  it('does not duplicate colors or switch the default horizontal composition', () => {
    const button = schema.components.button!;
    expect(button.options!.iconLayout).toBe('inline');
    for (const name of ['e8', 'e9', 'e10'] as const) {
      expect(button.elements[name]).not.toHaveProperty('palettes');
      expect(button.elements[name]).not.toHaveProperty('effects');
    }
    expect(button.elements.e8!.scales).not.toHaveProperty('boxHeight');
    expect(button.elements.e8!.scales).not.toHaveProperty('boxWidth');
  });
});
