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
import {
  assertPresetColorAlpha,
  assertPresetColorEvidence,
  bindPresetColorRole,
  createStrictPresetColorResolver
} from '../../../utils/presetColor.ts';
import {
  absoluteCap,
  type Fluent2MicrosoftFamilyColorLocator,
  familyReferenceColor
} from '../fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from '../fluent-2-microsoft.color-evidence.ts';
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

const c = createStrictPresetColorResolver<'default', typeof fluent2MicrosoftColorEvidence>({
  colors: schemaColors,
  exactEvidence: fluent2MicrosoftColorEvidence
});

const toThemeShortcut = (theme: FluentButtonFormulaScale): 'l' | 'd' =>
  theme === 'light' ? 'l' : 'd';

const createPresetFamily = (
  role: 'button.neutral' | 'button.primary'
): FluentButtonTonalFamily => ({
  resolve: (theme, locator) =>
    c.resolve('default', toThemeShortcut(theme), bindPresetColorRole(role, locator))
});

const neutralButtonFamily = createPresetFamily('button.neutral');
const primaryButtonFamily = createPresetFamily('button.primary');

const neutralSurfaceColor = (
  theme: FluentButtonFormulaScale,
  locator: Fluent2MicrosoftFamilyColorLocator
): SolidColor =>
  c.resolve('default', toThemeShortcut(theme), bindPresetColorRole('neutral', locator));

const canonicalOnVividSurface = primaryButtonFamily.resolve('light', familyReferenceColor('vivid'));

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
    resolve(theme, locator) {
      assertPresetColorAlpha(locator.alpha);
      if (locator.mode === 'cap') {
        return c.resolve('default', toThemeShortcut(theme), locator);
      }

      if (locator.mode === 'reference') {
        const referenceTone = input.functionalReferences[theme][locator.reference].tone;
        return resolveColor(
          theme,
          shiftKiskadeeTone(referenceTone, locator.offset ?? 0),
          locator.alpha
        );
      }

      assertPresetColorEvidence(fluent2MicrosoftColorEvidence, locator.evidenceId);
      return resolveColor(theme, locator.tone, locator.alpha);
    }
  };
}

function resolveContentForeground(
  theme: FluentButtonFormulaScale,
  polarity: FluentBrandContentPolarity
): SolidColor {
  return c.resolve(
    'default',
    toThemeShortcut(theme),
    absoluteCap(primitive('black', 'v1'), polarity)
  );
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
