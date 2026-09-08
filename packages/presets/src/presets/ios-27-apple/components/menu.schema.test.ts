import {
  validateBottomSheetComponentContract,
  validateDropdownComponentContract
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../ios-27-apple.schema.ts';

const themes = ['light', 'dark', 'darker'] as const;
const intents = ['neutral', 'destructive'] as const;

describe('iOS 27 opaque menu presentations', () => {
  it('satisfies the existing component contracts in all three themes', () => {
    expect(validateDropdownComponentContract(schema.components.dropdown)).toEqual([]);
    expect(validateBottomSheetComponentContract(schema.components.bottomSheet)).toEqual([]);

    for (const component of [schema.components.dropdown, schema.components.bottomSheet]) {
      for (const element of Object.values(component?.elements ?? {})) {
        if ('palettes' in element) {
          expect(Object.keys(element.palettes?.default ?? {}).sort()).toEqual([...themes].sort());
        }
      }
    }
  });

  it.each(themes)('keeps elevated surfaces visible and stable on %s', (theme) => {
    const expectedSurface = theme === 'light' ? '#ffffff' : '#1c1c1e';
    const dropdown = schema.components.dropdown?.elements;
    const sheet = schema.components.bottomSheet?.elements;
    const dropdownSurface = dropdown?.e1.palettes?.default?.[theme]?.onSubtle;
    const scrollSurface = dropdown?.e11?.palettes?.default?.[theme]?.onSubtle;
    const sheetSurface = sheet?.e2.palettes?.default?.[theme];
    const scrim = sheet?.e1.palettes?.default?.[theme];

    expect(dropdownSurface?.boxColor?.neutral?.medium?.rest).toBe(expectedSurface);
    expect(scrollSurface?.boxColor?.neutral?.medium?.rest).toBe(expectedSurface);
    expect(sheetSurface?.onSubtle.boxColor?.neutral?.medium?.rest).toBe(expectedSurface);
    expect(sheetSurface?.onVivid).toEqual(sheetSurface?.onSubtle);
    expect(scrim?.onVivid).toEqual(scrim?.onSubtle);
    expect(scrim?.onSubtle.boxColor?.neutral?.medium?.rest).toBe('#00000052');
  });

  it.each(themes)('keeps selection and terminal disabled paint independent on %s', (theme) => {
    const dropdown = schema.components.dropdown?.elements;
    const sheet = schema.components.bottomSheet?.elements;

    expect(schema.components.dropdown?.options?.selectedItemBackground).toBe(false);
    for (const intent of intents) {
      const dropdownRow =
        dropdown?.e2.palettes?.default?.[theme]?.onSubtle.boxColor?.[intent]?.medium;
      const sheetRow = sheet?.e7.palettes?.default?.[theme]?.onSubtle.boxColor?.[intent]?.medium;

      for (const row of [dropdownRow, sheetRow]) {
        expect(row).toBeDefined();
        expect(row?.hover).not.toEqual(row?.rest);
        expect(row?.pressed).not.toEqual(row?.hover);
        expect(row?.disabled).toEqual(row?.rest);
        expect(row?.focus).toBeUndefined();
      }
      expect(sheetRow?.selected).toBeUndefined();
      expect(
        dropdown?.e4.palettes?.default?.[theme]?.onSubtle.textColor?.[intent]?.medium?.disabled
      ).toEqual({ parentState: `fg:neutral.standard.${theme}.onSubtle.lowest` });
      expect(
        sheet?.e9.palettes?.default?.[theme]?.onSubtle.textColor?.[intent]?.medium?.disabled
      ).toEqual({ parentState: `fg:neutral.standard.${theme}.onSubtle.lowest` });
    }
  });

  it.each(
    themes
  )('communicates destructive actions through text without tinting every slot on %s', (theme) => {
    const dropdown = schema.components.dropdown?.elements;
    const sheet = schema.components.bottomSheet?.elements;
    for (const [label, auxiliary, row] of [
      [dropdown?.e4, dropdown?.e5, dropdown?.e2],
      [sheet?.e9, sheet?.e10, sheet?.e7]
    ] as const) {
      const labels = label?.palettes?.default?.[theme]?.onSubtle.textColor;
      const auxiliaryColors = auxiliary?.palettes?.default?.[theme]?.onSubtle.textColor;
      const rows = row?.palettes?.default?.[theme]?.onSubtle.boxColor;
      expect(labels?.destructive?.medium?.rest).toBe(theme === 'light' ? '#ff383c' : '#e85752');
      expect(labels?.neutral?.medium?.rest).toBe(`fg:neutral.standard.${theme}.onSubtle.medium`);
      expect(auxiliaryColors?.destructive).toEqual(auxiliaryColors?.neutral);
      expect(rows?.destructive).toEqual(rows?.neutral);
    }
  });
});
