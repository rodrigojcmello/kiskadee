import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireChip() {
  const chip = schema.components.chip;
  if (!chip) throw new Error('Fluent Chip schema is missing');
  return chip;
}

describe('Fluent 2 Chip', () => {
  it('maps the three scales to the subordinate Fluent Tag geometry', () => {
    const chip = requireChip();

    expect(chip.elements.e2.scales.boxHeight).toEqual({
      's:sm:1': 20,
      's:md:1': 24,
      's:lg:1': 32
    });
    expect(chip.elements.e3.typography).toEqual({
      's:sm:1': 'caption-medium',
      's:md:1': 'caption-medium',
      's:lg:1': 'body-medium'
    });
    expect(chip.elements.e4.iconSize).toEqual({
      's:sm:1': 's:sm:2',
      's:md:1': 's:sm:1',
      's:lg:1': 's:md:1'
    });
  });

  it('authors independent content, label, icon, remove, and Badge relation spacing', () => {
    const chip = requireChip();

    expect(chip.elements.e2.scales.paddingLeft).toEqual({
      's:sm:1': 5,
      's:md:1': 5,
      's:lg:1': 7
    });
    expect(chip.elements.e3.scales).toEqual({
      paddingLeft: { 's:sm:1': 2, 's:md:1': 2, 's:lg:1': 2 },
      paddingRight: { 's:sm:1': 2, 's:md:1': 2, 's:lg:1': 2 }
    });
    expect(chip.elements.e4.scales?.marginRight).toEqual({
      's:sm:1': 2,
      's:md:1': 2,
      's:lg:1': 4
    });
    expect(chip.elements.e5.scales.paddingLeft).toEqual({
      's:sm:1': 2,
      's:md:1': 2,
      's:lg:1': 4
    });
    expect(chip.elements.e7.scales.marginLeft).toEqual({
      's:sm:1': 4,
      's:md:1': 4,
      's:lg:1': 6
    });
  });

  it('keeps every authored Chip scale below the corresponding Button scale', () => {
    const chip = requireChip();
    const chipHeights = chip.elements.e2.scales.boxHeight as Record<string, number>;
    const officialButtonHeights = { 's:sm:1': 24, 's:md:1': 32, 's:lg:1': 40 };
    for (const [scale, buttonHeight] of Object.entries(officialButtonHeights)) {
      expect(chipHeights[scale]).toBeLessThan(buttonHeight);
    }
  });
});
