import { validateSchemaComponentContracts } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleSliderSchema } from './slider.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic'>({ colors: schemaColors });
const sliderSchema = createMaterial3GoogleSliderSchema({
  c,
  segmentNames: ['default', 'dynamic'],
  transparent: c('default', 'l', 'primitive.black.v1', 100, 0)
});
const base = sliderSchema.variants?.standard?.modes?.base;
const refValue = (value: unknown) =>
  typeof value === 'object' && value !== null && 'ref' in value
    ? (value as { ref?: unknown }).ref
    : undefined;

function contrastRatio(first: string, second: string) {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5]
      .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((channel) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      );
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

it('maps the inspected Material slider geometry to the existing element contract', () => {
  expect(base?.elements.e4?.scales?.boxHeight).toEqual({ 's:sm:1': 44, 's:md:1': 52 });
  expect(base?.elements.e8?.scales?.boxHeight).toEqual({ 's:sm:1': 24, 's:md:1': 40 });
  expect(base?.elements.e8?.scales?.boxWidth).toBe(100);
  expect(base?.elements.e10?.scales?.boxWidth).toEqual({ 's:sm:1': 4, 's:md:1': 4 });
  expect(base?.elements.e10?.scales?.boxHeight).toEqual({ 's:sm:1': 44, 's:md:1': 52 });
  expect(base?.elements.e14?.scales?.boxHeight).toEqual({ 's:sm:1': 44, 's:md:1': 44 });
  expect(base?.elements.e15?.scales?.boxWidth).toEqual({ 's:sm:1': 4, 's:md:1': 4 });
  expect(base?.elements.e19?.iconSize).toEqual({ 's:sm:1': 's:md:1', 's:md:1': 's:lg:1' });
});

it('keeps the Material density and behavior options within the existing contract', () => {
  expect(sliderSchema.options).toMatchObject({
    density: { compact: 's:sm:1', spacious: 's:md:1' },
    variant: 'standard',
    valueDisplay: 'none',
    marks: 'none',
    edgeMarks: 'exclude',
    fillOrigin: 'min'
  });
  expect(base?.elements).toEqual(
    expect.objectContaining({
      e1: expect.anything(),
      e2: expect.anything(),
      e3: expect.anything(),
      e4: expect.anything(),
      e5: expect.anything(),
      e6: expect.anything(),
      e7: expect.anything(),
      e8: expect.anything(),
      e9: expect.anything(),
      e10: expect.anything(),
      e11: expect.anything(),
      e12: expect.anything(),
      e13: expect.anything(),
      e14: expect.anything(),
      e15: expect.anything(),
      e16: expect.anything(),
      e17: expect.anything(),
      e18: expect.anything(),
      e19: expect.anything(),
      e20: expect.anything()
    })
  );
});

it('publishes neutral and primary palettes across segments, themes and surface contexts', () => {
  for (const segment of ['default', 'dynamic'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const rail = base?.elements.e8?.palettes?.[segment]?.[theme]?.[surface];
        const active = base?.elements.e9?.palettes?.[segment]?.[theme]?.[surface];
        const thumb = base?.elements.e10?.palettes?.[segment]?.[theme]?.[surface];
        const indicator = base?.elements.e14?.palettes?.[segment]?.[theme]?.[surface];

        expect(rail?.boxColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), primary: expect.anything() })
        );
        expect(active?.boxColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), primary: expect.anything() })
        );
        expect(thumb?.boxColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), primary: expect.anything() })
        );
        expect(indicator?.textColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), primary: expect.anything() })
        );
      }
});

it('resolves approved Material families and keeps disabled and interaction precedence explicit', () => {
  const light = base?.elements.e8?.palettes?.default?.light?.onSubtle;
  const active = base?.elements.e9?.palettes?.default?.light?.onSubtle;
  const vivid = base?.elements.e8?.palettes?.default?.light?.onVivid;

  expect(light?.boxColor?.neutral?.medium?.rest).toBe(
    c.ref('default', 'l', 'slider.neutral', 'subtle')
  );
  expect(active?.boxColor?.primary?.medium?.rest).toBe(
    c.ref('default', 'l', 'slider.primary', 'vivid')
  );
  expect(refValue(active?.boxColor?.primary?.medium?.hover)).toBe(
    c.ref('default', 'l', 'slider.primary', 'vivid', 1)
  );
  expect(refValue(light?.boxColor?.neutral?.medium?.disabled)).toBe(
    c('default', 'l', 'primitive.black.v1', 100, 10)
  );
  expect(vivid?.boxColor?.primary?.medium?.rest).toBe(
    c('default', 'l', 'primitive.black.v1', 0, 24)
  );
  expect(JSON.stringify(sliderSchema)).not.toContain('#615690');
  expect(c.ref('default', 'l', 'slider.primary', 'vivid')).toBe('#0b57d0');
});

it('keeps dark indicator text readable and separates the active and inactive rails', () => {
  const darkSubtle = base?.elements.e8?.palettes?.default?.dark?.onSubtle;
  const darkActive = base?.elements.e9?.palettes?.default?.dark?.onSubtle;
  const darkIndicator = base?.elements.e14?.palettes?.default?.dark?.onSubtle;
  const darkRailColor = darkSubtle?.boxColor?.primary?.medium?.rest;
  const darkActiveColor = darkActive?.boxColor?.primary?.medium?.rest;
  const darkIndicatorColor = darkIndicator?.boxColor?.neutral?.medium?.rest;
  const darkIndicatorText = darkIndicator?.textColor?.neutral?.medium?.rest;

  expect(typeof darkRailColor).toBe('string');
  expect(typeof darkActiveColor).toBe('string');
  expect(typeof darkIndicatorColor).toBe('string');
  expect(typeof darkIndicatorText).toBe('string');
  expect(
    contrastRatio(darkIndicatorColor as string, darkIndicatorText as string)
  ).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(darkRailColor as string, darkActiveColor as string)).toBeGreaterThanOrEqual(
    3
  );
  expect(
    base?.elements.e10?.palettes?.default?.dark?.onSubtle?.boxColor?.primary?.medium?.rest
  ).toBe(darkActiveColor);
});

it('keeps the active interval visible on a same-family vivid parent', () => {
  for (const theme of ['light', 'dark'] as const) {
    const active =
      base?.elements.e9?.palettes?.default?.[theme]?.onVivid?.boxColor?.primary?.medium;
    const parent = c.ref('default', 'l', 'primary', 'vivid');
    expect(contrastRatio(active?.rest as string, parent)).toBeGreaterThanOrEqual(3);
    expect(refValue(active?.disabled)).toBe(c('default', 'l', 'primitive.black.v1', 0, 38));
  }
});

it('satisfies the shared slider contract', () => {
  expect(() =>
    validateSchemaComponentContracts({ components: { slider: sliderSchema } })
  ).not.toThrow();
});

it('emits only actual transient paint deltas, including scope references', () => {
  const duplicates: string[] = [];
  const resolve = (value: unknown): unknown =>
    value && typeof value === 'object' && 'ref' in value ? value.ref : value;
  const visit = (value: unknown, path: string) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if ('rest' in record) {
      for (const state of ['hover', 'focus', 'pressed']) {
        if (state in record && resolve(record[state]) === resolve(record.rest)) {
          duplicates.push(`${path}.${state}`);
        }
      }
    }
    for (const [key, child] of Object.entries(record)) visit(child, `${path}.${key}`);
  };
  visit(sliderSchema, 'slider');
  expect(duplicates).toEqual([]);
});
