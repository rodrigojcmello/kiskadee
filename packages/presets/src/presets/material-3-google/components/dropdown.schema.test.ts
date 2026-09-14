import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleDropdownSchema } from './dropdown.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
const dropdown = createMaterial3GoogleDropdownSchema({
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

it('publishes every dropdown palette for both segments, themes and surface contexts', () => {
  for (const element of Object.values(dropdown.elements) as PaletteElement[])
    for (const segment of ['default', 'dynamic'] as const)
      for (const theme of ['light', 'dark'] as const) {
        const palette = element.palettes?.[segment]?.[theme];
        if (!palette) continue;
        expect(palette.onSubtle).toBeDefined();
        expect(palette.onVivid).toEqual(palette.onSubtle);
      }
});

it('keeps selected rows stable across compound pointer states and clears disabled rows', () => {
  const item = dropdown.elements.e2?.palettes?.default?.light?.onSubtle as {
    boxColor?: {
      neutral?: { medium?: { selected?: Record<string, unknown>; disabled?: unknown } };
      destructive?: { medium?: { selected?: Record<string, unknown>; disabled?: unknown } };
    };
  };
  const neutral = item.boxColor?.neutral?.medium;
  const destructive = item.boxColor?.destructive?.medium;

  expect(neutral?.selected?.hover).toEqual(neutral?.selected?.rest);
  expect(neutral?.selected?.pressed).toEqual(neutral?.selected?.rest);
  expect(destructive?.selected?.hover).toEqual(destructive?.selected?.rest);
  expect(destructive?.selected?.pressed).toEqual(destructive?.selected?.rest);
  expect(neutral?.disabled).toEqual(destructive?.disabled);
});
