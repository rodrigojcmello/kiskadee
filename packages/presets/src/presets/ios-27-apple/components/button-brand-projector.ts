import {
  type HexColor,
  normalizeHexColor,
  type SolidColor,
  shiftKiskadeeTone,
  withAlpha
} from '@kiskadee/core';
import type {
  PresetBrandContentPolarity,
  PresetBrandTonalFamilyInput
} from '../../../preset-build-extensions.ts';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../ios-27-apple.colors.ts';
import {
  createIos27AppleBrandButtonOnVividIntent,
  createIos27AppleButtonOnSubtleIntent,
  IOS_27_APPLE_BUTTON_TONAL_RECIPE,
  type Ios27AppleButtonFormulaScale,
  type Ios27AppleButtonFormulaTheme,
  type Ios27AppleButtonTonalFamily
} from './button-color-formula.ts';

type BrandIntentFormula = ReturnType<typeof createIos27AppleButtonOnSubtleIntent>;
type BrandIntentFormulaById = Record<string, BrandIntentFormula>;
type ThemeBrandIntentFormulas = Record<Ios27AppleButtonFormulaTheme, BrandIntentFormulaById>;

const schemaContext = { colors: schemaColors } as const;
const c = createPresetColorGetter<'default'>(schemaContext);

const neutralButtonFamily: Ios27AppleButtonTonalFamily = {
  color: (scale, tone, alpha) => c('default', scale, 'button.neutral', tone, alpha),
  reference: (scale, reference, offset = 0, alpha) =>
    c.ref('default', scale, 'button.neutral', reference, offset, alpha)
};

function createBrandFamily(input: PresetBrandTonalFamilyInput): Ios27AppleButtonTonalFamily {
  const resolveColor = (
    scale: Ios27AppleButtonFormulaScale,
    tone: Parameters<Ios27AppleButtonTonalFamily['color']>[1],
    alpha?: number
  ): SolidColor => {
    const theme = scale === 'l' ? 'light' : 'dark';
    const raw = input.scales[theme][tone];
    const hex = normalizeHexColor(raw) as HexColor;
    return alpha === undefined ? hex : withAlpha(hex, alpha);
  };

  return {
    color: resolveColor,
    reference: (scale, reference, offset = 0, alpha) => {
      const theme = scale === 'l' ? 'light' : 'dark';
      const referenceTone = input.functionalReferences[theme][reference].tone;
      return resolveColor(scale, shiftKiskadeeTone(referenceTone, offset), alpha);
    }
  };
}

function resolveContentForeground(
  scale: Ios27AppleButtonFormulaScale,
  polarity: PresetBrandContentPolarity
): SolidColor {
  const tone = polarity === 'light' ? (scale === 'l' ? 0 : 100) : scale === 'l' ? 100 : 0;
  return neutralButtonFamily.color(scale, tone);
}

function resolveVividContentPolarity(
  brand: PresetBrandTonalFamilyInput,
  scale: Ios27AppleButtonFormulaScale
): PresetBrandContentPolarity {
  const theme = scale === 'l' ? 'light' : 'dark';
  if (brand.functionalReferences[theme].vivid.source !== 'contrast-mirror') {
    return brand.contentPolarity;
  }

  return brand.contentPolarity === 'light' ? 'dark' : 'light';
}

function createOnSubtleFormulas(
  theme: Ios27AppleButtonFormulaTheme,
  brands: readonly PresetBrandTonalFamilyInput[]
): BrandIntentFormulaById {
  const scale = IOS_27_APPLE_BUTTON_TONAL_RECIPE[theme].scale;
  return Object.fromEntries(
    brands.map((brand) => {
      const family = createBrandFamily(brand);
      return [
        `brand.${brand.id}`,
        createIos27AppleButtonOnSubtleIntent({
          theme,
          family,
          neutralFamily: neutralButtonFamily,
          highForeground: resolveContentForeground(scale, resolveVividContentPolarity(brand, scale))
        })
      ];
    })
  );
}

function createOnVividFormulas(
  brands: readonly PresetBrandTonalFamilyInput[]
): BrandIntentFormulaById {
  return Object.fromEntries(
    brands.map((brand) => [
      `brand.${brand.id}`,
      createIos27AppleBrandButtonOnVividIntent({
        family: createBrandFamily(brand),
        neutralFamily: neutralButtonFamily
      })
    ])
  );
}

function selectProperty(
  formulas: BrandIntentFormulaById,
  property: keyof BrandIntentFormula
): Record<string, Record<string, unknown>> {
  return Object.fromEntries(
    Object.entries(formulas).map(([intent, formula]) => [intent, formula[property]])
  );
}

/**
 * Projects optional authentication and social Brand Packs through the iOS 27
 * Button recipe without adding their colors to the preset primitive catalog.
 */
export function createIos27AppleBrandButtonProjection(
  brands: readonly PresetBrandTonalFamilyInput[]
): {
  elements: {
    e1: { name: string; palettes: Record<string, unknown> };
    e2: { name: string; palettes: Record<string, unknown> };
    e3: { name: string; palettes: Record<string, unknown> };
  };
} {
  const onSubtle: ThemeBrandIntentFormulas = {
    light: createOnSubtleFormulas('light', brands),
    dark: createOnSubtleFormulas('dark', brands)
  };
  const onVivid = createOnVividFormulas(brands);

  const createContainerTheme = (theme: Ios27AppleButtonFormulaTheme) => ({
    onSubtle: {
      boxColor: selectProperty(onSubtle[theme], 'boxColor')
    },
    onVivid: {
      boxColor: selectProperty(onVivid, 'boxColor')
    }
  });
  const createContentTheme = (theme: Ios27AppleButtonFormulaTheme) => ({
    onSubtle: {
      textColor: selectProperty(onSubtle[theme], 'textColor')
    },
    onVivid: {
      textColor: selectProperty(onVivid, 'textColor')
    }
  });

  return {
    elements: {
      e1: {
        name: 'button',
        palettes: {
          default: {
            light: createContainerTheme('light'),
            dark: createContainerTheme('dark')
          }
        }
      },
      e2: {
        name: 'button-text',
        palettes: {
          default: {
            light: createContentTheme('light'),
            dark: createContentTheme('dark')
          }
        }
      },
      e3: {
        name: 'button-icon',
        palettes: {
          default: {
            light: createContentTheme('light'),
            dark: createContentTheme('dark')
          }
        }
      }
    }
  };
}
