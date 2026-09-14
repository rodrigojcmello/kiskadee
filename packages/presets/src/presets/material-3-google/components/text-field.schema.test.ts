import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleTextFieldSchema } from './text-field.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
const textField = createMaterial3GoogleTextFieldSchema({
  c,
  segmentNames: ['default', 'dynamic'],
  transparent: c('default', 'l', 'primitive.black.v1', 100, 0)
});

type SurfacePalette = {
  onSubtle?: unknown;
  onVivid?: unknown;
};
type PaletteElement = {
  palettes?: Record<string, Record<string, SurfacePalette>>;
};
type Mode = {
  elements?: Record<string, PaletteElement>;
};
type Variant = {
  modes?: Record<string, Mode>;
};

it('publishes every TextField mode palette for both segments, themes and surface contexts', () => {
  const variants = textField.variants as unknown as Record<string, Variant>;
  for (const variant of Object.values(variants))
    for (const mode of Object.values(variant.modes ?? {}))
      for (const element of Object.values(mode.elements ?? {}))
        for (const segment of ['default', 'dynamic'] as const)
          for (const theme of ['light', 'dark'] as const) {
            const palette = element.palettes?.[segment]?.[theme];
            if (!palette) continue;
            expect(palette.onSubtle).toBeDefined();
            expect(palette.onVivid).toBeDefined();
          }
});

it('resolves borderless light surfaces through the approved primitive palette', () => {
  const control = textField.variants?.standard?.modes?.borderless?.elements?.e3?.palettes?.default
    ?.light?.onSubtle as {
    boxColor?: { neutral?: { medium?: { rest?: string } } };
  };

  expect(control.boxColor?.neutral?.medium?.rest).toBe(c('default', 'l', 'primitive.black.v1', 4));
});

it('uses light field content and state layers on vivid surfaces', () => {
  const label = textField.variants?.standard?.modes?.outline?.elements?.e2?.palettes?.default?.light
    ?.onVivid as {
    textColor?: { neutral?: { medium?: { rest?: string } } };
  };
  const message = textField.variants?.standard?.modes?.outline?.elements?.e5?.palettes?.default
    ?.light?.onVivid as {
    textColor?: { neutral?: { medium?: { rest?: string } } };
  };

  expect(label.textColor?.neutral?.medium?.rest).toBe(c('default', 'l', 'primitive.black.v1', 0));
  expect(message.textColor?.neutral?.medium?.rest).toBe(c('default', 'l', 'primitive.black.v1', 0));
});

type PaintStates = {
  rest: string;
  hover?: { ref: string };
  focus?: { ref: string };
  readOnly?: { ref: string };
};
type IntentPaint = Record<'neutral' | 'error' | 'warning', { medium: PaintStates }>;
type FieldPaint = { boxColor: IntentPaint; borderColor: IntentPaint; textColor: IntentPaint };

it('keeps semantic hover and read-only deltas on vivid fields in both themes and segments', () => {
  for (const segment of ['default', 'dynamic'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const intent of ['error', 'warning'] as const) {
        const palette = textField.variants?.standard?.modes?.outline?.elements?.e3?.palettes?.[
          segment
        ]?.[theme]?.onVivid as unknown as FieldPaint;
        const edge = palette.borderColor[intent].medium;
        const role = intent === 'error' ? 'textField.error' : 'textField.warning';
        expect(edge.rest).toBe(c.ref(segment, 'l', role, 'vivid'));
        expect(edge.hover?.ref).toBe(c.ref(segment, 'l', role, 'vivid', -1));
        expect(edge.hover?.ref).not.toBe(edge.rest);
        expect(edge.readOnly?.ref).toBe(c.ref(segment, 'l', role, 'vivid', 1));
        expect(edge.readOnly?.ref).not.toBe(edge.rest);
        expect(edge.focus?.ref).toBe(edge.rest);
      }
});

it('authors transparent shells and borders explicitly with the production cap', () => {
  const transparent = c('default', 'l', 'primitive.black.v1', 100, 0);
  for (const theme of ['light', 'dark'] as const) {
    const modes = textField.variants?.standard?.modes;
    const outline = modes?.outline?.elements?.e3?.palettes?.default?.[theme]
      ?.onVivid as unknown as FieldPaint;
    const borderless = modes?.borderless?.elements?.e3?.palettes?.default?.[theme]
      ?.onVivid as unknown as FieldPaint;
    for (const intent of ['neutral', 'error', 'warning'] as const) {
      expect(outline.boxColor[intent].medium.rest).toBe(transparent);
      expect(outline.boxColor[intent].medium.focus?.ref).toBe(transparent);
      expect(outline.boxColor[intent].medium.hover?.ref).not.toBe(transparent);
      expect(borderless.borderColor[intent].medium).toEqual({ rest: transparent });
      expect(borderless.boxColor[intent].medium.hover?.ref).not.toBe(
        borderless.boxColor[intent].medium.rest
      );
      expect(borderless.boxColor[intent].medium.focus?.ref).not.toBe(
        borderless.boxColor[intent].medium.rest
      );
    }
  }
});

it('does not mistake opaque black source paint for a transparent inverse surface', () => {
  const opaqueBlack = c('default', 'l', 'primitive.black.v1', 100);
  const sourceWithBlackInk = new Proxy(c, {
    apply(target, thisArg, args) {
      return args[2] === 'neutral.v2' ? opaqueBlack : Reflect.apply(target, thisArg, args);
    }
  });
  const field = createMaterial3GoogleTextFieldSchema({
    c: sourceWithBlackInk,
    segmentNames: ['default', 'dynamic'],
    transparent: c('default', 'l', 'primitive.black.v1', 100, 0)
  });
  const label = field.variants?.standard?.modes?.outline?.elements?.e2?.palettes?.default?.light;
  expect((label?.onSubtle as unknown as FieldPaint).textColor.neutral.medium.rest).toBe(
    opaqueBlack
  );
  expect((label?.onVivid as unknown as FieldPaint).textColor.neutral.medium.rest).toBe(
    c('default', 'l', 'primitive.black.v1', 0)
  );
});

it('limits inverse Rest-equal focus to documented resets of an actual Hover delta', () => {
  const visit = (value: unknown, inverse = false) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (inverse && 'rest' in record) {
      for (const state of ['hover', 'focus', 'pressed']) {
        const entry = record[state] as { ref?: unknown } | undefined;
        if (entry?.ref !== record.rest) continue;
        expect(state).toBe('focus');
        expect((record.hover as { ref?: unknown } | undefined)?.ref).toBeDefined();
        expect((record.hover as { ref?: unknown }).ref).not.toBe(record.rest);
      }
    }
    for (const [key, child] of Object.entries(record)) visit(child, inverse || key === 'onVivid');
  };
  visit(textField);
});
