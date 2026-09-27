import { describe, expect, it } from 'vitest';
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
          expect(palettes.dark).toBeUndefined();
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
    expect(outline.e6).toEqual(underline.e6);
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
      expect(border.neutral!.medium!.focus).toEqual(border.neutral!.medium!.hover);
      expect(border.neutral!.medium!.pressed).toEqual(border.neutral!.medium!.focus);
      expect(line.neutral!.medium!.focus).not.toEqual(border.neutral!.medium!.focus);
      for (const intent of ['error', 'warning'] as const) {
        expect(border[intent]!.medium!.rest).toBe(line[intent]!.medium!.rest);
        expect(border[intent]!.medium!.focus).toBeUndefined();
      }
    }
  });
});
