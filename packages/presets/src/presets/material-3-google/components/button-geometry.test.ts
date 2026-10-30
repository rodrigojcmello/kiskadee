import { validateButtonComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../material-3-google.schema.ts';

const button = schema.components.button!;
const catalog = schema.global!.iconSizes!;
const profiles = schema.global!.typography!.profiles;
const sizes = ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3'] as const;
type Size = (typeof sizes)[number];

const scaleAt = (scale: unknown, size: Size) => (scale as Record<Size, number>)[size];
const iconHeight = (iconSize: unknown, size: Size) =>
  catalog[(iconSize as Record<Size, keyof typeof catalog>)[size]]!;
const lineHeight = (typography: unknown, size: Size) => {
  const profile = (typography as Record<Size, keyof typeof profiles>)[size];
  return profiles[profile]!.scales.textHeight as number;
};

describe('Material Button geometry', () => {
  it('publishes a valid recipe and keeps the inline composition as its default', () => {
    expect(validateButtonComponentContract(button)).toEqual([]);
    expect(button.options!.iconLayout).toBe('inline');
  });

  it.each([
    ['s:sm:1', 32, 6, 12, 20, 4, 1],
    ['s:md:1', 40, 10, 16, 20, 8, 1],
    ['s:lg:1', 56, 16, 24, 24, 8, 1],
    ['s:lg:2', 96, 32, 48, 32, 12, 2],
    ['s:lg:3', 136, 48, 64, 40, 16, 3]
  ] as const)('fits %s text, icon and combined content in its natural %i px height', (size, height, verticalInset, horizontalInset, contentHeight, gap, border) => {
    const { e1: root, e2: label, e3: icon, e5: disclosure } = button.elements;
    const scales = root!.scales!;
    const textHeight = lineHeight(label!.typography, size);
    const glyphHeight = iconHeight(icon!.iconSize, size);
    const top = scaleAt(scales.paddingTop, size);
    const bottom = scaleAt(scales.paddingBottom, size);
    const borderWidth = scaleAt(scales.borderWidth, size);

    expect(scaleAt(scales._boxHeight, size)).toBe(height);
    expect(textHeight).toBe(contentHeight);
    expect(glyphHeight).toBe(contentHeight);
    expect(iconHeight(disclosure!.iconSize, size)).toBe(contentHeight);
    expect(top).toBe(verticalInset);
    expect(bottom).toBe(verticalInset);
    expect(scaleAt(scales.paddingLeft, size)).toBe(horizontalInset);
    expect(scaleAt(scales.paddingRight, size)).toBe(horizontalInset);
    expect(scaleAt(icon!.scales!.paddingRight, size)).toBe(gap);
    expect(borderWidth).toBe(border);

    // Builder deducts borders from authored insets before CSS emission.
    for (const content of [textHeight, glyphHeight, Math.max(textHeight, glyphHeight)]) {
      expect(content + (top - borderWidth) + (bottom - borderWidth) + 2 * borderWidth).toBe(height);
    }
  });

  it.each([
    ['s:sm:1', 52, 4, 12, 24, 16, 4],
    ['s:md:1', 64, 8, 16, 24, 16, 8],
    ['s:lg:1', 84, 12, 24, 32, 20, 8],
    ['s:lg:2', 108, 16, 32, 40, 24, 12],
    ['s:lg:3', 136, 24, 48, 48, 24, 16]
  ] as const)('fits %s stacked content in its natural %i px height', (size, height, verticalInset, horizontalInset, expectedIcon, expectedLine, expectedGap) => {
    const { e8: root, e9: label, e10: icon } = button.elements;
    const scales = root!.scales;
    const glyphHeight = iconHeight(icon!.iconSize, size);
    const textHeight = lineHeight(label!.typography, size);
    const top = scaleAt(scales.paddingTop, size);
    const bottom = scaleAt(scales.paddingBottom, size);
    const border = scaleAt(scales.borderWidth, size);
    const gap = scaleAt(label!.scales.marginTop, size);

    expect(scaleAt(scales._boxHeight, size)).toBe(height);
    expect(glyphHeight).toBe(expectedIcon);
    expect(textHeight).toBe(expectedLine);
    expect(gap).toBe(expectedGap);
    expect(top).toBe(verticalInset);
    expect(bottom).toBe(verticalInset);
    expect(scaleAt(scales.paddingLeft, size)).toBe(horizontalInset);
    expect(scaleAt(scales.paddingRight, size)).toBe(horizontalInset);
    expect(glyphHeight + textHeight + gap + (top - border) + (bottom - border) + 2 * border).toBe(
      height
    );
    expect(glyphHeight).toBeGreaterThan(iconHeight(button.elements.e3!.iconSize, size));
  });

  it('shares fixed corners and borders while restricting stacked geometry to Rounded and Square', () => {
    const inline = button.elements.e1!.scales!;
    const stacked = button.elements.e8!.scales;

    expect(stacked.borderWidth).toEqual(inline.borderWidth);
    expect(stacked.borderRadius.rounded).toBe(inline.borderRadius!.rounded);
    expect(stacked.borderRadius.square).toBe(inline.borderRadius!.square);
    expect(stacked.borderRadius).not.toHaveProperty('pill');
    expect(inline.borderRadius!.pill).toBeDefined();
    expect(inline.borderRadius!.rounded).toEqual({
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 28,
      's:lg:2': 48,
      's:lg:3': 68
    });
  });

  it('keeps height metadata separate from emitted dimensions and retains base paint ownership', () => {
    for (const name of ['e1', 'e8'] as const) {
      const scales = button.elements[name]!.scales!;
      expect(scales).not.toHaveProperty('boxHeight');
      expect(scales).not.toHaveProperty('boxWidth');
    }
    for (const name of ['e8', 'e9', 'e10'] as const) {
      expect(button.elements[name]).not.toHaveProperty('palettes');
      expect(button.elements[name]).not.toHaveProperty('effects');
    }
  });

  it('adds the 40 px catalog entry while preserving the existing public Icon sizes', () => {
    const glyph = schema.components.icon!.elements.e1!;
    const iconSizes = glyph.iconSize as Record<string, keyof typeof catalog>;

    expect(catalog['s:lg:4']).toBe(40);
    expect(catalog['s:lg:5']).toBe(48);
    expect(
      Object.fromEntries(
        Object.entries(iconSizes).map(([size, reference]) => [size, catalog[reference]])
      )
    ).toEqual({
      's:sm:2': 12,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 28,
      's:lg:3': 32,
      's:lg:4': 48
    });
  });
});
