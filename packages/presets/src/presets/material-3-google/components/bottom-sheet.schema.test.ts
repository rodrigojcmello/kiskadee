import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleBottomSheetSchema } from './bottom-sheet.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic'>({ colors: schemaColors });
const bottomSheet = createMaterial3GoogleBottomSheetSchema({
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

it('publishes every BottomSheet palette for both segments, themes and surface contexts', () => {
  for (const element of Object.values(bottomSheet.elements) as PaletteElement[])
    for (const segment of ['default', 'dynamic'] as const)
      for (const theme of ['light', 'dark'] as const) {
        const palette = element.palettes?.[segment]?.[theme];
        if (!palette) continue;
        expect(palette.onSubtle).toBeDefined();
        expect(palette.onVivid).toEqual(palette.onSubtle);
      }
});

it('keeps disabled menu rows transparent while retaining selected resets', () => {
  const item = bottomSheet.elements.e7?.palettes?.default?.light?.onSubtle as {
    boxColor?: {
      neutral?: { medium?: { selected?: Record<string, unknown>; disabled?: unknown } };
    };
  };
  const neutral = item.boxColor?.neutral?.medium;

  expect(neutral?.selected?.rest).toBeDefined();
  expect(neutral?.disabled).toBeDefined();
  expect(neutral?.disabled).toBe(c('default', 'l', 'bottomSheet.neutral', 0, 0));
});
