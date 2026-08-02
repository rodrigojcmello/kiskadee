import {
  type HexColor,
  type KiskadeeTone,
  normalizeHexColor,
  primitive,
  type SolidColor,
  shiftKiskadeeTone,
  withAlpha
} from '@kiskadee/core';
import type {
  PresetBrandContentPolarity,
  PresetBrandTonalFamilyInput
} from '../../../preset-build-extensions.ts';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../fluent-2-microsoft.colors.ts';
import {
  createFluentButtonOnSubtleIntent,
  createFluentButtonOnVividIntent,
  FLUENT_BUTTON_DEFAULT_TONAL_RECIPE,
  type FluentButtonFormulaScale,
  type FluentButtonFormulaTheme,
  type FluentButtonTonalFamily,
  omitFluentButtonPendingTextState
} from './button-color-formula.ts';

export type FluentBrandContentPolarity = PresetBrandContentPolarity;
export type FluentBrandTonalFamilyInput = PresetBrandTonalFamilyInput;

type BrandIntentFormula = ReturnType<typeof createFluentButtonOnSubtleIntent>;
type BrandIntentFormulaById = Record<string, BrandIntentFormula>;
type ThemeBrandIntentFormulas = Record<FluentButtonFormulaTheme, BrandIntentFormulaById>;

const schemaContext = { colors: schemaColors } as const;
const c = createPresetColorGetter<'default'>(schemaContext);

const toThemeShortcut = (theme: FluentButtonFormulaScale): 'l' | 'd' =>
  theme === 'light' ? 'l' : 'd';

const createPresetFamily = (
  role: 'button.neutral' | 'button.primary'
): FluentButtonTonalFamily => ({
  color: (theme, tone, alpha) => c('default', toThemeShortcut(theme), role, tone, alpha),
  reference: (theme, reference, offset = 0, alpha) =>
    c.ref('default', toThemeShortcut(theme), role, reference, offset, alpha)
});

const neutralButtonFamily = createPresetFamily('button.neutral');
const primaryButtonFamily = createPresetFamily('button.primary');

const neutralSurfaceColor = (
  theme: FluentButtonFormulaScale,
  tone: KiskadeeTone,
  alpha?: number
): SolidColor => c('default', toThemeShortcut(theme), 'neutral', tone, alpha);

const canonicalOnVividSurface = primaryButtonFamily.reference('light', 'vivid');

function createBrandFamily(input: FluentBrandTonalFamilyInput): FluentButtonTonalFamily {
  const resolveColor = (
    theme: FluentButtonFormulaScale,
    tone: KiskadeeTone,
    alpha?: number
  ): SolidColor => {
    const raw = input.scales[theme][tone];
    const hex = normalizeHexColor(raw) as HexColor;
    return alpha === undefined ? hex : withAlpha(hex, alpha);
  };

  return {
    color: resolveColor,
    reference: (theme, reference, offset = 0, alpha) => {
      const referenceTone = input.functionalReferences[theme][reference].tone;
      return resolveColor(theme, shiftKiskadeeTone(referenceTone, offset), alpha);
    }
  };
}

function resolveContentForeground(
  theme: FluentButtonFormulaScale,
  polarity: FluentBrandContentPolarity
): SolidColor {
  const tone: KiskadeeTone =
    polarity === 'light' ? (theme === 'light' ? 0 : 100) : theme === 'light' ? 100 : 0;

  return c('default', toThemeShortcut(theme), primitive('black', 'v1'), tone);
}

function resolveVividContentPolarity(
  brand: FluentBrandTonalFamilyInput,
  scale: FluentButtonFormulaScale
): FluentBrandContentPolarity {
  if (brand.functionalReferences[scale].vivid.source !== 'contrast-mirror') {
    return brand.contentPolarity;
  }

  return brand.contentPolarity === 'light' ? 'dark' : 'light';
}

function createThemeFormulas(
  theme: FluentButtonFormulaTheme,
  brands: readonly FluentBrandTonalFamilyInput[],
  surfaceContext: 'onSubtle' | 'onVivid'
): BrandIntentFormulaById {
  return Object.fromEntries(
    brands.map((brand) => {
      const family = createBrandFamily(brand);
      const scale = FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme].scale;
      const formula =
        surfaceContext === 'onSubtle'
          ? createFluentButtonOnSubtleIntent({
              theme,
              family,
              neutralButtonFamily,
              neutralSurfaceColor,
              highForeground: resolveContentForeground(
                scale,
                resolveVividContentPolarity(brand, scale)
              )
            })
          : createFluentButtonOnVividIntent({
              theme,
              family,
              neutralButtonFamily,
              canonicalSurface: canonicalOnVividSurface
            });

      return [`brand.${brand.id}`, formula];
    })
  );
}

function createFormulaMatrix(
  brands: readonly FluentBrandTonalFamilyInput[],
  surfaceContext: 'onSubtle' | 'onVivid'
): ThemeBrandIntentFormulas {
  return {
    light: createThemeFormulas('light', brands, surfaceContext),
    dark: createThemeFormulas('dark', brands, surfaceContext),
    darker: createThemeFormulas('darker', brands, surfaceContext)
  };
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
 * Projects portable brand scales through the exact Fluent Button formula.
 *
 * The returned component intentionally contains palettes only: layout, scale,
 * effects, and options remain owned by the normal Fluent Button artifact.
 */
export function createFluent2MicrosoftBrandButtonProjection(
  brands: readonly FluentBrandTonalFamilyInput[]
): {
  elements: {
    e1: { name: string; palettes: Record<string, unknown> };
    e2: { name: string; palettes: Record<string, unknown> };
    e3: { name: string; palettes: Record<string, unknown> };
  };
} {
  const onSubtle = createFormulaMatrix(brands, 'onSubtle');
  const onVivid = createFormulaMatrix(brands, 'onVivid');

  const createContainerTheme = (theme: FluentButtonFormulaTheme) => ({
    onSubtle: {
      boxColor: selectProperty(onSubtle[theme], 'boxColor'),
      borderColor: selectProperty(onSubtle[theme], 'borderColor')
    },
    onVivid: {
      boxColor: selectProperty(onVivid[theme], 'boxColor'),
      borderColor: selectProperty(onVivid[theme], 'borderColor')
    }
  });
  const createContentTheme = (
    theme: FluentButtonFormulaTheme,
    options: { omitPending?: boolean } = {}
  ) => ({
    onSubtle: {
      textColor: options.omitPending
        ? omitFluentButtonPendingTextState(selectProperty(onSubtle[theme], 'textColor'))
        : selectProperty(onSubtle[theme], 'textColor')
    },
    onVivid: {
      textColor: options.omitPending
        ? omitFluentButtonPendingTextState(selectProperty(onVivid[theme], 'textColor'))
        : selectProperty(onVivid[theme], 'textColor')
    }
  });

  return {
    elements: {
      e1: {
        name: 'button',
        palettes: {
          default: {
            light: createContainerTheme('light'),
            dark: createContainerTheme('dark'),
            darker: createContainerTheme('darker')
          }
        }
      },
      e2: {
        name: 'button-text',
        palettes: {
          default: {
            light: createContentTheme('light'),
            dark: createContentTheme('dark'),
            darker: createContentTheme('darker')
          }
        }
      },
      e3: {
        name: 'button-icon',
        palettes: {
          default: {
            light: createContentTheme('light', { omitPending: true }),
            dark: createContentTheme('dark', { omitPending: true }),
            darker: createContentTheme('darker', { omitPending: true })
          }
        }
      }
    }
  };
}
