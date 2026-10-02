import { validateSchemaComponentContracts } from '@kiskadee/core';
import { expect, it } from 'vitest';
import primary from '../colors/b.blue.v1.ts';
import { createSandboxSelectSchema } from './select.schema.ts';

it('reuses the Outline contour for actual focus without a second external ring', () => {
  const select = createSandboxSelectSchema();
  const mode = select.variants.standard.modes.outline!;
  expect(mode.options).toEqual({ focusIndicator: 'inner', focusRingColorSource: 'component' });
  const outline = mode.elements;
  expect(outline.e7!.scales?.boxHeight).toBe(0);
  const border = outline.e4!.palettes!.default!.light!.onSubtle!.borderColor!.neutral!.medium!;
  expect(border.rest).toBe('#3b82f6');
  expect(border.focus).toBe(primary.scales.light[40]);
  expect(border.focus).not.toEqual(border.rest);
  expect(border.selected).toBeUndefined();
  expect(outline.e3!.scales?.boxHeight).toEqual({ 's:sm:1': 32, 's:md:1': 40, 's:lg:1': 48 });
  const disabledText =
    outline.e5!.palettes!.default!.light!.onSubtle!.textColor!.neutral!.medium!.disabled;
  expect(disabledText).not.toEqual(
    outline.e4!.palettes!.default!.light!.onSubtle!.boxColor!.neutral!.medium!.rest
  );
});

it('uses one resting fill for Underline and Borderless across themes and surfaces', () => {
  const select = createSandboxSelectSchema();
  for (const modeName of ['underline', 'borderless'] as const) {
    const mode = select.variants.standard.modes[modeName]!;
    expect(mode.options).toEqual(
      modeName === 'underline'
        ? { focusIndicator: 'underline', focusRingColorSource: 'component' }
        : { focusIndicator: 'outer', focusRingColorSource: 'global' }
    );
    for (const theme of ['light', 'dark'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const rest = (element: 'e3' | 'e4' | 'e8' | 'e9') =>
          mode.elements[element]!.palettes!.default![theme]![context]!.boxColor!.neutral!.medium!
            .rest;
        expect(rest('e3')).toBe('#fffffff5');
        expect(rest('e4')).toBe('#ffffff00');
        expect(rest('e8')).toEqual(rest('e4'));
        expect(rest('e9')).toEqual(rest('e4'));
      }
    }
  }
  const borderless = select.variants.standard.modes.borderless!.elements;
  expect(borderless.e3!.scales?.borderWidth).toBe(0);
  expect(borderless.e4!.scales?.borderWidth).toBe(0);
  expect(borderless.e7!.scales?.boxHeight).toBe(0);
});

it('authors dormant underline focus paint in every mode for presentation overrides', () => {
  const select = createSandboxSelectSchema();
  for (const mode of ['outline', 'underline', 'borderless'] as const) {
    const indicator = select.variants.standard.modes[mode]!.elements.e7!;
    expect(indicator.scales?.boxHeight).toBe(mode === 'underline' ? 1 : 0);
    for (const theme of ['light', 'dark'] as const)
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const color = indicator.palettes!.default![theme]![context]!.boxColor!.neutral!.medium!;
        expect(color.focus).toEqual({ ref: primary.scales.light[40] });
        if (mode !== 'underline') expect(color.rest).toBe('#ffffff00');
      }
  }
});

it('publishes the same optional divider recipe without exceeding control heights', () => {
  const select = createSandboxSelectSchema();
  for (const mode of Object.values(select.variants.standard.modes)) {
    expect(mode!.elements.e12!.separator).toEqual({ 's:all': 'subtle' });
    expect(mode!.elements.e12!.scales?.boxHeight).toEqual({
      's:sm:1': 24,
      's:md:1': 32,
      's:lg:1': 40
    });
    expect(mode!.options?.showDividers).toBeUndefined();
  }
});

it('publishes outer component focus paint without introducing a Borderless rest contour', () => {
  const select = createSandboxSelectSchema();
  for (const mode of ['outline', 'underline', 'borderless'] as const) {
    const elements = select.variants.standard.modes[mode]!.elements;
    for (const theme of ['light', 'dark'] as const)
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const border =
          elements.e3!.palettes!.default![theme]![context]!.borderColor!.neutral!.medium!;
        expect(border.focus).toBe(primary.scales.light[40]);
        expect(border.rest).toBe(mode === 'borderless' ? '#ffffff00' : '#00000014');
        expect(border.disabled).toBeUndefined();
      }
  }
});

it('keeps trigger and step hover local and styles individually disabled steps', () => {
  const select = createSandboxSelectSchema();
  for (const mode of Object.values(select.variants.standard.modes)) {
    for (const theme of ['light', 'dark'] as const)
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const elements = mode!.elements;
        const trigger = elements.e4!.palettes!.default![theme]![context]!;
        expect(trigger.boxColor!.neutral!.medium!.hover).toBe('#ffffff');
        for (const step of ['e8', 'e9'] as const) {
          const paint = elements[step]!.palettes!.default![theme]![context]!;
          expect(paint.boxColor!.neutral!.medium!.hover).toBe('#ffffffb8');
          expect(paint.textColor!.neutral!.medium!.disabled).toBe('#a6adb8');
        }
        expect(
          elements.e5!.palettes!.default![theme]![context]!.textColor!.neutral!.medium!.disabled
        ).toEqual({ ref: '#a6adb8' });
      }
  }
});

it('validates every published mode against the slot-specific Core grammar', () => {
  const recipe = createSandboxSelectSchema();
  expect(() => validateSchemaComponentContracts({ components: { select: recipe } })).not.toThrow();
  for (const mode of Object.values(recipe.variants.standard.modes)) {
    for (const key of ['e4', 'e8', 'e9'] as const) {
      expect(mode!.elements[key]!.scales).not.toHaveProperty('boxHeight');
    }
  }
});

it('owns placeholder attenuation and anchored geometry in every mode', () => {
  const recipe = createSandboxSelectSchema();
  for (const mode of Object.values(recipe.variants.standard.modes)) {
    expect(mode!.elements.e13!.scales).toEqual({
      marginTop: 8,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8
    });
    for (const segment of Object.values(mode!.elements.e11!.palettes!))
      for (const theme of Object.values(segment!))
        for (const context of Object.values(theme!)) {
          const colors = context!.textColor!.neutral!.medium!;
          expect(colors.rest).toMatch(/^color-mix\(in srgb, .+ 62%, transparent\)$/);
          const disabled =
            typeof colors.disabled === 'object' ? colors.disabled.ref : colors.disabled;
          expect(disabled).toMatch(/^color-mix\(in srgb, .+ 62%, transparent\)$/);
        }
  }
});
