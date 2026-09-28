import { describe, expect, it } from 'vitest';
import red from '../colors/r.red.v1.ts';
import orange from '../colors/yr.orange.v1.ts';
import { schema } from '../fluent-2-microsoft.schema.ts';

const field = schema.components.textField!;
const modes = [
  ...Object.values(field.variants!.standard!.modes),
  ...Object.values(field.variants!.floating!.modes)
];

describe('Fluent TextField Light onSubtle', () => {
  it('publishes all five compositions with complete light palettes for both segments', () => {
    expect(modes).toHaveLength(5);
    for (const mode of modes) {
      for (const slot of ['e2', 'e3', 'e4', 'e5'] as const) {
        for (const segment of ['default', 'teams'] as const) {
          const palettes = mode.elements[slot]!.palettes![segment]!;
          expect(palettes.light?.onSubtle).toBeDefined();
          expect(palettes.light?.onVivid).toBeUndefined();
          expect(palettes.dark?.onSubtle).toBeDefined();
          expect(palettes.dark?.onVivid).toBeUndefined();
          expect(palettes.darker).toBeUndefined();
          for (const paint of Object.values(palettes.light!.onSubtle)) {
            for (const intent of ['neutral', 'error', 'warning']) {
              expect(
                (paint as Record<string, { medium: { rest: string } }>)[intent]!.medium.rest
              ).toMatch(/^#[0-9a-f]{6,8}$/i);
            }
          }
        }
      }
    }
  });

  it('keeps neutral surfaces stable while focused brand color follows the active segment', () => {
    const elements = field.variants!.standard!.modes.underline!.elements;
    const line = elements.e6!.palettes!;
    const defaultPaint = line.default!.light!.onSubtle.boxColor!.neutral!.medium!;
    const teamsPaint = line.teams!.light!.onSubtle.boxColor!.neutral!.medium!;
    expect(defaultPaint.rest).toBe('#616161');
    expect(defaultPaint.hover).toEqual({ ref: '#585858' });
    expect(teamsPaint.rest).toBe(defaultPaint.rest);
    expect(defaultPaint.focus).toEqual({ ref: '#0064b4' });
    expect(teamsPaint.focus).toEqual({ ref: '#5b5fc7' });
    expect(defaultPaint.disabled).toEqual({ ref: '#e0e0e0' });
    expect(elements.e3!.palettes!.default!.light!.onSubtle.boxColor!.neutral!.medium).toEqual({
      rest: '#ffffff00'
    });
  });

  it('keeps validation out of input text and preserves the Rest-only placeholder contract', () => {
    for (const mode of modes) {
      const control = mode.elements.e3!.palettes!.default!.light!.onSubtle;
      const input = mode.elements.e4!.palettes!.default!.light!.onSubtle.textColor!;
      const message = mode.elements.e5!.palettes!.default!.light!.onSubtle.textColor!;
      for (const intent of ['neutral', 'error', 'warning'] as const) {
        expect(Object.keys(control.textColor![intent]!.medium!)).toEqual(['rest']);
        expect(input[intent]!.medium).toEqual(input.neutral!.medium);
      }
      expect(message.error!.medium!.rest).not.toBe(message.neutral!.medium!.rest);
      expect(message.warning!.medium!.rest).not.toBe(message.neutral!.medium!.rest);
    }
  });

  it('keeps Borderless neutral edges transparent and resets the transient indicator', () => {
    const elements = field.variants!.standard!.modes.borderless!.elements;
    const border = elements.e3!.palettes!.default!.light!.onSubtle.borderColor!;
    const line = elements.e6!.palettes!.default!.light!.onSubtle.boxColor!;
    expect(border.neutral!.medium!.rest).toBe('#ffffff00');
    expect(border.neutral!.medium!.focus).toBeUndefined();
    expect(elements.e3!.scales!.borderWidth).toBe(1);
    for (const intent of ['neutral', 'error', 'warning'] as const) {
      const state = line[intent]!.medium!;
      expect(state.rest).toBe('#ffffff00');
      expect(state.focus).not.toEqual({ ref: state.rest });
      expect(state.pressed).toEqual(state.focus);
      expect(state.disabled).toEqual({ ref: state.rest });
      expect(state.readOnly).toEqual({ ref: state.rest });
    }
  });

  it('uses Medium geometry on Desktop and keeps the Outline bottom indicator independent', () => {
    expect(field.options!.density!.compact).toBe('s:md:1');
    for (const mode of Object.values(field.variants!.standard!.modes)) {
      expect(mode.elements.e3!.scales!.boxHeight).toEqual({
        's:sm:1': 24,
        's:md:1': 32,
        's:lg:1': 40
      });
    }
    const outline = field.variants!.standard!.modes.outline!.elements;
    const underline = field.variants!.standard!.modes.underline!.elements;
    expect(outline.e6!.scales).toEqual(underline.e6!.scales);
    expect(outline.e6!.palettes!.default!.light!.onSubtle.boxColor!.neutral!.medium!.rest).toBe(
      '#cbcbcb'
    );
    expect(outline.e6!.scales!.boxHeight).toBe(1);
    expect(
      outline.e3!.palettes!.default!.light!.onSubtle.borderColor!.neutral!.medium!.rest
    ).not.toBe(outline.e6!.palettes!.default!.light!.onSubtle.boxColor!.neutral!.medium!.rest);
    expect(field.options!.mode).toBe('outline');
    expect(field.variants!.standard!.options!.mode).toBe('outline');
  });

  it('retains neutral Outline contours on focus while preserving validation edges', () => {
    const elements = field.variants!.standard!.modes.outline!.elements;
    for (const segment of ['default', 'teams'] as const) {
      const border = elements.e3!.palettes![segment]!.light!.onSubtle.borderColor!;
      const line = elements.e6!.palettes![segment]!.light!.onSubtle.boxColor!;
      expect(border.neutral!.medium!.focus).toBeUndefined();
      expect(border.neutral!.medium!.hover).toBeUndefined();
      expect(border.neutral!.medium!.pressed).toBeUndefined();
      expect(line.neutral!.medium!.focus).not.toEqual(border.neutral!.medium!.focus);
      for (const intent of ['error', 'warning'] as const) {
        expect(border[intent]!.medium!.rest).toBe(line[intent]!.medium!.rest);
        expect(border[intent]!.medium!.focus).toBeUndefined();
      }
    }
  });
  it('keeps Standard sizes and explicitly shifts Floating heights to larger buttons', () => {
    const standardSizes = ['s:sm:1', 's:md:1', 's:lg:1'];
    for (const mode of Object.values(field.variants!.standard!.modes)) {
      expect(Object.keys(mode.elements.e4!.typography!)).toEqual(standardSizes);
    }
    for (const mode of Object.values(field.variants!.floating!.modes)) {
      expect(Object.keys(mode.elements.e4!.typography!)).toEqual(['s:md:1', 's:lg:1']);
      expect(mode.elements.e3!.scales!.boxHeight).toEqual({ 's:md:1': 40, 's:lg:1': 48 });
    }
    const button = schema.components.button!;
    expect(Object.keys(button.elements!.e2!.typography!)).toEqual([...standardSizes, 's:lg:2']);
    expect(button.elements!.e1!.scales!.paddingTop).toMatchObject({ 's:lg:2': 13 });
    expect(button.elements!.e1!.scales!.paddingBottom).toMatchObject({ 's:lg:2': 13 });
  });
});

// Cross-component visual contracts intentionally share resolved colors, not runtime components.
describe('Fluent TextField canonical surfaces', () => {
  it('reuses the Card neutral medium surface for Borderless', () => {
    for (const segment of ['default', 'teams'] as const) {
      const fieldPaint =
        field.variants!.standard!.modes.borderless!.elements.e3!.palettes![segment]!.light!
          .onSubtle;
      const cardPaint =
        schema.components.container!.elements!.e1!.palettes![segment]!.light!.onSubtle;
      expect(fieldPaint.boxColor!.neutral!.medium!.rest).toEqual(
        cardPaint.boxColor!.neutral!.medium!.rest
      );
    }
  });
  it('uses the low neutral Button contour and transparent surface for Outline', () => {
    for (const segment of ['default', 'teams'] as const) {
      const fieldPaint =
        field.variants!.standard!.modes.outline!.elements.e3!.palettes![segment]!.light!.onSubtle;
      const buttonPaint =
        schema.components.button!.elements!.e1!.palettes![segment]!.light!.onSubtle;
      expect(fieldPaint.borderColor!.neutral!.medium!.rest).toEqual(
        buttonPaint.borderColor!.neutral!.low!.rest
      );
      expect(fieldPaint.boxColor!.neutral!.medium!.rest).toEqual(
        buttonPaint.boxColor!.neutral!.low!.rest
      );
    }
  });
});

describe('Fluent Outline bottom contour', () => {
  it('matches the persistent indicator at rest and terminal states without affecting other modes', () => {
    for (const segment of ['default', 'teams'] as const) {
      const outline = field.variants!.standard!.modes.outline!.elements;
      const bottom = outline.e3!.palettes![segment]!.light!.onSubtle.borderBottomColor!;
      const indicator = outline.e6!.palettes![segment]!.light!.onSubtle.boxColor!;
      for (const intent of ['neutral', 'error', 'warning'] as const) {
        for (const state of ['rest', 'disabled', 'readOnly'] as const) {
          expect(bottom[intent]!.medium![state]).toEqual(indicator[intent]!.medium![state]);
        }
      }
      expect(bottom.neutral!.medium!.hover).toEqual(indicator.neutral!.medium!.hover);
      expect(bottom.neutral!.medium!.hover).not.toEqual({ ref: bottom.neutral!.medium!.rest });
      expect(bottom.neutral!.medium!.focus).toEqual({ ref: bottom.neutral!.medium!.rest });
      expect(indicator.neutral!.medium!.focus).not.toEqual(indicator.neutral!.medium!.hover);
      expect(bottom.error!.medium!.hover).toBeUndefined();
      expect(bottom.warning!.medium!.hover).toBeUndefined();
      for (const mode of ['underline', 'borderless'] as const) {
        expect(
          field.variants!.standard!.modes[mode]!.elements.e3!.palettes![segment]!.light!.onSubtle
            .borderBottomColor
        ).toBeUndefined();
      }
    }
  });
});

describe('Fluent TextField Dark onSubtle', () => {
  it('uses Button contours and canonical Card surfaces while preserving focus and terminal states', () => {
    for (const segment of ['default', 'teams'] as const) {
      const standard = field.variants!.standard!.modes;
      const outline = standard.outline!.elements;
      const paint = outline.e3!.palettes![segment]!.dark!.onSubtle;
      const button = schema.components.button!.elements!.e1!.palettes![segment]!.dark!.onSubtle;
      expect(paint.borderColor!.neutral!.medium!.rest).toEqual(
        button.borderColor!.neutral!.low!.rest
      );
      expect(
        standard.borderless!.elements.e3!.palettes![segment]!.dark!.onSubtle.boxColor!.neutral!
          .medium!.rest
      ).toEqual(
        schema.components.container!.elements!.e1!.palettes![segment]!.dark!.onSubtle.boxColor!
          .neutral!.medium!.rest
      );
      const line = outline.e6!.palettes![segment]!.dark!.onSubtle.boxColor!.neutral!.medium!;
      expect(line.rest).toBe('#b4b4b4');
      expect(line.hover).toEqual({ ref: '#d7d7d7' });
      expect(line.focus).not.toEqual(line.hover);
      expect(line.disabled).toEqual(line.readOnly);
      for (const mode of modes) {
        expect(
          mode.elements.e4!.palettes![segment]!.dark!.onSubtle.textColor!.neutral!.medium!.rest
        ).toBe('#ffffff');
      }
    }
  });
});

describe('Fluent validation family anchors', () => {
  it('uses each family Vivid reference for contours and messages in both themes and segments', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const segment of ['default', 'teams'] as const) {
        for (const [intent, asset] of [
          ['error', red],
          ['warning', orange]
        ] as const) {
          const expected = asset.scales[theme][asset.functionalReferences[theme].vivid];
          for (const mode of modes) {
            const control = mode.elements.e3!.palettes![segment]![theme]!.onSubtle;
            const message = mode.elements.e5!.palettes![segment]![theme]!.onSubtle;
            expect(control.borderColor![intent]!.medium!.rest).toBe(expected);
            expect(message.textColor![intent]!.medium!.rest).toBe(expected);
          }
        }
      }
    }
  });
});
