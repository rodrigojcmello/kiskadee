import { validateSchemaComponentContracts } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const paint = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value), (_key, entry) =>
    entry && typeof entry === 'object' && 'ref' in entry ? entry.ref : entry
  );
const select = schema.components.select!;
it('publishes independent Select elements across modes, themes and segments', () => {
  expect(select.options?.mode).toBe('outline');
  for (const mode of ['outline', 'underline', 'borderless'] as const) {
    const configuredMode = select.variants.standard.modes[mode]!;
    expect(configuredMode.options).toEqual({
      focusIndicator: 'underline',
      focusRingColorSource: 'component'
    });
    const elements = configuredMode.elements;
    expect(elements.e12!.separator).toEqual({ 's:all': 'subtle' });
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const)
        for (const surface of ['onSubtle', 'onVivid'] as const) {
          expect(elements.e3!.palettes![segment]![theme]![surface]!.standard).toBeDefined();
          const field = schema.components.textField!.variants!.standard!.modes[mode]!.elements;
          if (mode !== 'outline')
            expect(
              paint(elements.e3!.palettes![segment]![theme]![surface]!.standard.boxColor?.neutral)
            ).toEqual(
              paint(
                field.e3!.palettes![segment]![theme]![surface]!.standard.boxColor?.neutral &&
                  Object.fromEntries(
                    Object.entries(
                      field.e3!.palettes![segment]![theme]![surface]!.standard.boxColor!.neutral!
                    ).map(([k, v]) => [
                      k,
                      Object.fromEntries(
                        Object.entries(v!).filter(([state]) => state !== 'readOnly')
                      )
                    ])
                  )
              )
            );
          expect(elements.e3!.scales?.boxHeight).toEqual(field.e3!.scales?.boxHeight);
        }
  }
});

it('pairs solid Outline surfaces with their own interior colors in both ambient contexts', () => {
  const elements = select.variants.standard.modes.outline!.elements;
  const underline = select.variants.standard.modes.underline!.elements;
  const field = schema.components.textField!.variants!.standard!.modes.outline!.elements;
  for (const segment of ['default', 'teams'] as const)
    for (const theme of ['light', 'dark', 'darker'] as const) {
      const expectedSurface =
        schema.components.container!.elements!.e1!.palettes![segment]![theme]!.onSubtle!.standard
          .boxColor!.neutral!.low!.rest;
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const background =
          elements.e3!.palettes![segment]![theme]![context]!.standard.boxColor!.neutral!.medium!;
        expect(background.rest).toBe(expectedSurface);
        for (const state of ['focus', 'pressed', 'disabled'] as const)
          expect(background[state]).toBe(background.rest);
        expect(background.hover).toBe(
          paint(
            field.e3!.palettes![segment]![theme]!.onSubtle!.standard.boxColor!.neutral!.medium!
              .hover
          )
        );
        expect(background.hover).not.toBe(background.rest);
        expect(background.rest).toMatch(/^#[0-9a-f]{6}$/i);
        expect(background.hover).toMatch(/^#[0-9a-f]{6}$/i);
        for (const external of ['e2', 'e10'] as const)
          expect(elements[external]!.palettes![segment]![theme]![context]!.standard).toEqual(
            underline[external]!.palettes![segment]![theme]![context]!.standard
          );
      }
      for (const interior of ['e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e11'] as const)
        expect(elements[interior]!.palettes![segment]![theme]!.onVivid!.standard).toEqual(
          elements[interior]!.palettes![segment]![theme]!.onSubtle!.standard
        );
    }
});

it('pairs disabled Borderless content with its own fill on vivid surfaces', () => {
  const value = select.variants.standard.modes.borderless!.elements.e5!;
  const field = schema.components.textField!.variants!.standard!.modes.borderless!.elements.e4!;
  for (const theme of ['light', 'dark', 'darker'] as const) {
    expect(
      value.palettes!.default![theme]!.onVivid!.standard.textColor!.neutral!.medium!.disabled
    ).toEqual(
      field.palettes!.default![theme]!.onVivid!.standard.textColor!.neutral!.medium!.disabled
    );
  }
});

it('publishes component focus paint on each independent presentation host', () => {
  for (const mode of ['outline', 'underline', 'borderless'] as const) {
    const elements = select.variants.standard.modes[mode]!.elements;
    expect(elements.e4!.scales?.borderWidth).toBe(0);
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const)
        for (const surface of ['onSubtle', 'onVivid'] as const) {
          const outer =
            elements.e3!.palettes![segment]![theme]![surface]!.standard.borderColor!.neutral!
              .medium!;
          const inner =
            elements.e4!.palettes![segment]![theme]![surface]!.standard.borderColor!.neutral!
              .medium!;
          const indicator =
            elements.e7!.palettes![segment]![theme]![surface]!.standard.boxColor!.neutral!.medium!;
          expect(outer.focus).toBeDefined();
          expect(outer.focus).toEqual(paint(indicator.focus));
          expect(inner.focus).toEqual(paint(indicator.focus));
          expect(indicator.focus).toEqual({ ref: outer.focus });
          expect(paint(inner.rest)).toEqual(paint(inner.disabled));
          expect(paint(inner.rest)).toEqual(
            paint(
              elements.e4!.palettes![segment]![theme]![surface]!.standard.boxColor!.neutral!.medium!
                .rest
            )
          );
        }
  }
});

it('owns hover and individually disabled paint on sequential buttons', () => {
  for (const mode of Object.values(select.variants.standard.modes)) {
    const elements = mode!.elements;
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const)
        for (const context of ['onSubtle', 'onVivid'] as const) {
          const contentDisabled = paint(
            elements.e5!.palettes![segment]![theme]![context]!.standard.textColor!.neutral!.medium!
              .disabled
          );
          for (const step of ['e8', 'e9'] as const) {
            const colors = elements[step]!.palettes![segment]![theme]![context]!.standard;
            expect(typeof colors.boxColor!.neutral!.medium!.hover).toBe('string');
            expect(colors.textColor!.neutral!.medium!.disabled).toEqual(contentDisabled);
          }
        }
  }
});

it('validates every published mode against the slot-specific Core grammar', () => {
  const recipe = select;
  expect(() => validateSchemaComponentContracts({ components: { select: recipe } })).not.toThrow();
  for (const mode of Object.values(recipe.variants.standard.modes)) {
    for (const key of ['e4', 'e8', 'e9'] as const) {
      expect(mode!.elements[key]!.scales).not.toHaveProperty('boxHeight');
    }
  }
});

it('owns placeholder attenuation and anchored geometry in every mode', () => {
  const recipe = select;
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
          const colors = context!.standard.textColor!.neutral!.medium!;
          expect(colors.rest).toMatch(/^color-mix\(in srgb, .+ 62%, transparent\)$/);
          const disabled =
            typeof colors.disabled === 'object' ? colors.disabled.ref : colors.disabled;
          expect(disabled).toMatch(/^color-mix\(in srgb, .+ 62%, transparent\)$/);
        }
  }
});
