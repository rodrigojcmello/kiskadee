import { compileDensityMap, resolveDensityScale, resolveSupportedSize } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

it('selects Medium for every global density while preserving explicit Small geometry', () => {
  const slider = schema.components.slider!;
  expect(slider.options?.density).toEqual({ regular: 's:md:1' });
  const density = compileDensityMap(slider.options!.density!);
  for (const mode of ['compact', 'regular', 'spacious'] as const) {
    expect(resolveDensityScale(mode, density)).toBe('md:1');
  }
  const thumb = slider.variants?.standard?.modes?.base?.elements.e10?.scales?.boxWidth;
  expect(thumb).toEqual({ 's:sm:1': 14, 's:md:1': 18 });
  expect(resolveSupportedSize('sm:1', Object.keys(thumb!))).toBe('sm:1');
});

it('enlarges only the Medium icon thumb while preserving the control lane and plain thumb', () => {
  const elements = schema.components.slider!.variants!.standard!.modes!.base!.elements;
  expect(elements.e12?.scales?.boxWidth).toEqual({ 's:sm:1': 14, 's:md:1': 30 });
  expect(elements.e12?.scales?.boxHeight).toEqual(elements.e12?.scales?.boxWidth);
  expect(elements.e13?.scales?.boxWidth).toEqual({ 's:sm:1': 10, 's:md:1': 24 });
  expect(elements.e13?.scales?.boxHeight).toEqual(elements.e13?.scales?.boxWidth);
  expect(elements.e19?.iconSize).toEqual({ 's:sm:1': 's:sm:4', 's:md:1': 's:sm:1' });
  expect(elements.e10?.scales?.boxHeight).toEqual({ 's:sm:1': 14, 's:md:1': 18 });
  expect(elements.e4?.scales?.boxHeight).toEqual({ 's:sm:1': 14, 's:md:1': 18 });
});

it('uses the lighter neutral rail on subtle without changing the selected rail', () => {
  const elements = schema.components.slider!.variants!.standard!.modes!.base!.elements;
  for (const segment of ['default', 'teams'] as const) {
    const rail = elements.e8!.palettes![segment]!.light!.onSubtle.boxColor!;
    expect(rail.neutral!.medium!.rest).toBe('#939393');
    expect(rail.primary!.medium!.rest).toBe('#939393');
    expect(rail.neutral!.medium!.hover).toEqual({ ref: '#939393' });
    expect(rail.neutral!.medium!.pressed).toEqual({ ref: '#c2c2c2' });
    expect(rail.primary!.medium!.pressed).toEqual({ ref: '#c2c2c2' });
    expect(elements.e6!.palettes![segment]!.light!.onSubtle.textColor!.neutral!.medium!.rest).toBe(
      '#616161'
    );
    expect(elements.e9!.palettes![segment]!.light!.onSubtle.boxColor!.neutral!.medium!.rest).toBe(
      elements.e11!.palettes![segment]!.light!.onSubtle.boxColor!.neutral!.medium!.rest
    );
  }
});

it('uses the Primary selected rail as the subtle thumb ring around the Neutral Low Card surface', () => {
  const elements = schema.components.slider!.variants!.standard!.modes!.base!.elements;
  const cardSurface = schema.components.container!.elements.e1!;
  for (const segment of ['default', 'teams'] as const) {
    const context = { light: 'light', onSubtle: 'onSubtle' } as const;
    const active =
      elements.e9!.palettes![segment]![context.light]![context.onSubtle].boxColor!.primary!.medium!;
    const outer = elements.e10!.palettes![segment]![context.light]![context.onSubtle];
    const inner =
      elements.e11!.palettes![segment]![context.light]![context.onSubtle].boxColor!.primary!
        .medium!;
    const icon =
      elements.e19!.palettes![segment]![context.light]![context.onSubtle].textColor!.primary!
        .medium!;
    const cardLow =
      cardSurface.palettes![segment]![context.light]![context.onSubtle].boxColor!.neutral!.low!
        .rest;
    for (const state of ['rest', 'hover', 'focus', 'pressed'] as const) {
      expect(outer.boxColor!.primary!.medium![state]).toEqual(active[state]);
      expect(outer.borderColor!.primary!.medium![state]).toEqual(active[state]);
      expect(inner[state]).toEqual(state === 'rest' ? cardLow : { ref: cardLow });
      expect(icon[state]).toEqual(active[state]);
    }
    expect(icon.disabled).toEqual({ ref: '#ffffff' });
    expect(outer.borderColor!.neutral!.medium!.rest).not.toEqual(active.rest);
    expect(outer.boxColor!.primary!.medium!.disabled).toEqual(
      outer.boxColor!.neutral!.medium!.disabled
    );
  }
});
