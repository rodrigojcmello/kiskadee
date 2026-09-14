import { validateSchemaComponentContracts } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleSwitchSchema } from './switch.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
const switchSchema = createMaterial3GoogleSwitchSchema({
  c,
  segmentNames: ['default', 'dynamic', 'purple'],
  transparent: c('default', 'l', 'primitive.black.v1', 100, 0)
});
const base = switchSchema.variants?.standard?.modes?.base;
const refValue = (value: unknown) =>
  typeof value === 'object' && value !== null && 'ref' in value
    ? (value as { ref?: unknown }).ref
    : undefined;

it('keeps the Material switch geometry source-backed', () => {
  const track = base?.elements.e2;
  const thumb = base?.elements.e3;

  expect(track?.scales?.boxWidth).toEqual({ 's:sm:1': 36, 's:md:1': 52 });
  expect(track?.scales?.boxHeight).toEqual({ 's:sm:1': 24, 's:md:1': 32 });
  expect(track?.scales?.borderWidth).toBe(2);
  expect(track?.scales?.paddingTop).toEqual({ 's:sm:1': 4, 's:md:1': 4 });
  expect(track?.scales?.paddingRight).toEqual({ 's:sm:1': 4, 's:md:1': 4 });
  expect(track?.scales?.paddingBottom).toEqual({ 's:sm:1': 4, 's:md:1': 4 });
  expect(track?.scales?.paddingLeft).toEqual({ 's:sm:1': 4, 's:md:1': 4 });
  expect(thumb?.scales?.boxWidth).toEqual({ 's:sm:1': 16, 's:md:1': 24 });
  expect(thumb?.scales?.boxHeight).toEqual({ 's:sm:1': 16, 's:md:1': 24 });
  expect(thumb?.effects?.thumbShrink?.rest).toEqual({
    boxWidth: { 's:md:1': 16 },
    boxHeight: { 's:md:1': 16 }
  });
  expect(base?.elements.e6?.iconSize).toEqual({ 's:sm:1': 's:sm:2', 's:md:1': 's:sm:1' });
});

it('publishes both intents and both surface contexts for every Material segment and theme', () => {
  for (const segment of ['default', 'dynamic'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const track = base?.elements.e2?.palettes?.[segment]?.[theme]?.[surface];
        const thumb = base?.elements.e3?.palettes?.[segment]?.[theme]?.[surface];
        const label = base?.elements.e4?.palettes?.[segment]?.[theme]?.[surface];
        const icon = base?.elements.e6?.palettes?.[segment]?.[theme]?.[surface];

        expect(track?.boxColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), polarity: expect.anything() })
        );
        expect(track?.borderColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), polarity: expect.anything() })
        );
        expect(thumb?.boxColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), polarity: expect.anything() })
        );
        expect(label?.textColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), polarity: expect.anything() })
        );
        expect(icon?.textColor).toEqual(
          expect.objectContaining({ neutral: expect.anything(), polarity: expect.anything() })
        );
      }
});

it('resolves approved Material blue, red and green families without the legacy purple', () => {
  const lightSubtle = base?.elements.e2?.palettes?.default?.light?.onSubtle;
  const lightVivid = base?.elements.e2?.palettes?.default?.light?.onVivid;
  const vividThumb = base?.elements.e3?.palettes?.default?.light?.onVivid;

  expect(lightSubtle?.boxColor?.neutral?.medium?.selected?.rest).toEqual({
    ref: c.ref('default', 'l', 'switch.neutral', 'vivid')
  });
  expect(lightSubtle?.boxColor?.polarity?.medium?.rest).toBe(
    c.ref('default', 'l', 'redLike', 'subtle')
  );
  expect(lightSubtle?.boxColor?.polarity?.medium?.selected?.rest).toEqual({
    ref: c.ref('default', 'l', 'greenLike', 'vivid')
  });
  expect(lightVivid?.boxColor?.neutral?.medium?.selected?.rest).toEqual({
    ref: c('default', 'l', 'primitive.black.v1', 0)
  });
  expect(vividThumb?.boxColor?.neutral?.medium?.selected?.rest).toEqual({
    ref: c.ref('default', 'l', 'switch.neutral', 'vivid')
  });
  expect(JSON.stringify(switchSchema)).not.toContain('#615690');
  expect(c.ref('default', 'l', 'switch.neutral', 'vivid')).toBe('#0b57d0');
});

it('keeps interaction maps sparse and preserves selected precedence', () => {
  const subtleTrack =
    base?.elements.e2?.palettes?.default?.light?.onSubtle?.boxColor?.neutral?.medium;
  const vividBorder =
    base?.elements.e2?.palettes?.default?.light?.onVivid?.borderColor?.neutral?.medium;
  const darkThumb = base?.elements.e3?.palettes?.default?.dark?.onSubtle?.boxColor?.neutral?.medium;

  expect(subtleTrack?.hover).toBeUndefined();
  expect(subtleTrack?.focus).toBeUndefined();
  expect(subtleTrack?.selected).toEqual({
    rest: { ref: c.ref('default', 'l', 'switch.neutral', 'vivid') }
  });
  expect(vividBorder?.selected).toEqual({
    rest: { ref: c('default', 'l', 'primitive.black.v1', 100, 0) },
    hover: { ref: c('default', 'l', 'primitive.black.v1', 100, 0) },
    pressed: { ref: c('default', 'l', 'primitive.black.v1', 100, 0) }
  });
  expect(refValue(darkThumb?.disabled)).toBe(c('default', 'l', 'primitive.black.v1', 0, 38));
});

it('satisfies the shared switch contract', () => {
  expect(() =>
    validateSchemaComponentContracts({ components: { switch: switchSchema } })
  ).not.toThrow();
});

it('keeps control text styled but disabled by default and strengthens the light off control', () => {
  expect(switchSchema.options?.controlTextVisibility).toBe('none');
  expect(base?.elements.e5?.scales?.marginRight).toEqual({ 's:sm:1': 8, 's:md:1': 8 });
  for (const segment of ['default', 'dynamic', 'purple'] as const) {
    const track = base?.elements.e2?.palettes?.[segment]?.light?.onSubtle;
    const thumb = base?.elements.e3?.palettes?.[segment]?.light?.onSubtle;
    expect(track?.borderColor?.neutral?.medium?.rest).toBe(
      c.ref(segment, 'l', 'neutral', 'medium', 4)
    );
    expect(thumb?.boxColor?.neutral?.medium?.rest).toBe(
      c.ref(segment, 'l', 'neutral', 'medium', 4)
    );
    expect(thumb?.boxColor?.neutral?.medium?.disabled).not.toEqual({
      ref: thumb?.boxColor?.neutral?.medium?.rest
    });
  }
});
