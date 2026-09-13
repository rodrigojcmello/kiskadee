import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleTabsSchema } from './tabs.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic'>({ colors: schemaColors });
const tabs = createMaterial3GoogleTabsSchema({
  c,
  segmentNames: ['default', 'dynamic']
});

type SurfacePalette = {
  onSubtle?: unknown;
  onVivid?: unknown;
};
type PaletteElement = {
  palettes?: Record<string, Record<string, SurfacePalette>>;
};

it('publishes every authored Tabs variant for both segments, themes and surface contexts', () => {
  for (const variant of Object.values(tabs.variants ?? {}))
    for (const element of Object.values(variant?.elements ?? {}) as PaletteElement[])
      for (const segment of ['default', 'dynamic'] as const)
        for (const theme of ['light', 'dark'] as const) {
          const palette = element.palettes?.[segment]?.[theme];
          if (!palette) continue;
          expect(palette.onSubtle).toBeDefined();
          expect(palette.onVivid).toBeDefined();
        }
});

it('keeps selected tab backgrounds as explicit compound-state resets', () => {
  const line = tabs.variants?.line?.elements?.e2?.palettes?.default?.light?.onSubtle as {
    boxColor?: {
      neutral?: { medium?: { selected?: Record<string, unknown> } };
    };
  };
  const selected = line.boxColor?.neutral?.medium?.selected;

  expect(selected?.rest).toBeDefined();
  expect(selected?.hover).toBeDefined();
  expect(selected?.pressed).toBeDefined();
});

it('uses light foreground layers for transparent tabs on vivid surfaces', () => {
  const subtle = tabs.variants?.line?.elements?.e3?.palettes?.default?.light?.onSubtle as {
    textColor?: { neutral?: { medium?: { rest?: string } } };
  };
  const vivid = tabs.variants?.line?.elements?.e3?.palettes?.default?.light?.onVivid as {
    textColor?: { neutral?: { medium?: { rest?: string } } };
  };

  expect(vivid.textColor?.neutral?.medium?.rest).toBe(c('default', 'l', 'primitive.black.v1', 0));
  expect(vivid.textColor?.neutral?.medium?.rest).not.toBe(subtle.textColor?.neutral?.medium?.rest);
});

it('maps bridge colors through approved Material families', () => {
  const bridge = tabs.variants?.bridge?.elements?.e2?.palettes?.default?.light?.onSubtle as {
    boxColor?: { neutral?: { medium?: { rest?: string } } };
  };
  const rest = bridge.boxColor?.neutral?.medium?.rest;

  expect(rest).toBe(c('default', 'l', 'yellowLike', 14));
});

it('keeps labels and icons readable against their actual filled tab surface', () => {
  const solid = (value: unknown): string =>
    typeof value === 'string' ? value : (value as { ref: string }).ref;
  const luminance = (hex: string) =>
    [1, 3, 5]
      .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a: unknown, b: unknown) => {
    const x = luminance(solid(a));
    const y = luminance(solid(b));
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  type Rules = { rest: unknown; hover?: unknown; pressed?: unknown; selected?: { rest: unknown } };
  type Paint = {
    boxColor?: { neutral: { medium: Rules } };
    textColor?: { neutral: { medium: Rules } };
  };

  for (const variant of ['box', 'segmented'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const elements = tabs.variants?.[variant]?.elements;
        const palette = (slot: 'e1' | 'e2' | 'e3' | 'e4' | 'e5') =>
          elements?.[slot]?.palettes?.default?.[theme]?.[surface] as Paint;
        const background = palette(variant === 'box' ? 'e1' : 'e2').boxColor!.neutral.medium.rest;
        const selectedBox = palette('e5').boxColor!.neutral.medium;
        for (const slot of ['e3', 'e4'] as const) {
          const ink = palette(slot).textColor!.neutral.medium;
          expect(
            contrast(ink.rest, background),
            `${variant}.${theme}.${surface}.${slot}.rest`
          ).toBeGreaterThanOrEqual(4.5);
          for (const state of ['rest', 'hover', 'pressed'] as const)
            expect(
              contrast(ink.selected!.rest, selectedBox[state] ?? selectedBox.rest),
              `${variant}.${theme}.${surface}.${slot}.selected.${state}`
            ).toBeGreaterThanOrEqual(4.5);
        }
      }
});
