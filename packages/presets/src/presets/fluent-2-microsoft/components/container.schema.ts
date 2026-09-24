import type { ContainerComponent, KiskadeeTone, SolidColor } from '@kiskadee/core';
import { primitive } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorLocator,
  type Fluent2MicrosoftColorResolver
} from '../fluent-2-microsoft.color.ts';

type Theme = 'light' | 'dark' | 'darker';
type Track = 'l' | 'd';
type ColorLocator = { color: Fluent2MicrosoftColorLocator };

const neutral = (tone: KiskadeeTone): ColorLocator => ({
  color: exactColor('card.neutral', tone, 'component.container')
});
const primary = (tone: KiskadeeTone): ColorLocator => ({
  color: exactColor('card.primary', tone, 'component.container')
});
const physicalBlack: ColorLocator = {
  color: absoluteCap(primitive('black', 'v1'), 'dark')
};

const COMPLEMENTARY_SURFACES = {
  light: {
    track: 'l',
    neutralLow: neutral(3),
    neutralMedium: neutral(4),
    primaryMedium: primary(5),
    primaryHighest: primary(55)
  },
  dark: {
    track: 'd',
    neutralLow: neutral(5),
    neutralMedium: neutral(2),
    primaryMedium: primary(8),
    primaryHighest: primary(30)
  },
  darker: {
    track: 'd',
    neutralLow: neutral(1),
    neutralMedium: physicalBlack,
    primaryMedium: primary(3),
    primaryHighest: primary(14)
  }
} as const satisfies Record<
  Theme,
  {
    track: Track;
    neutralLow: ColorLocator;
    neutralMedium: ColorLocator;
    primaryMedium: ColorLocator;
    primaryHighest: ColorLocator;
  }
>;

function resolveColor(
  c: Fluent2MicrosoftColorResolver,
  segment: 'default',
  track: Track,
  locator: ColorLocator
): SolidColor {
  return c.resolve(segment, track, locator.color);
}

/** Add the calibrated companion Rest surfaces to the migrated Container schema. */
export function createFluent2MicrosoftContainerSchema({
  base,
  c,
  segmentNames
}: {
  base: ContainerComponent<never>;
  c: Fluent2MicrosoftColorResolver;
  segmentNames: readonly 'default'[];
}): ContainerComponent<never> {
  const container = structuredClone(base);

  for (const segment of segmentNames) {
    for (const theme of ['light', 'dark', 'darker'] as const) {
      const recipe = COMPLEMENTARY_SURFACES[theme];
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const palette = container.elements.e1.palettes[segment]?.[theme]?.[context];
        const outputs = container.contentSurfaceContext[segment]?.[theme]?.[context];
        if (!palette || !outputs) {
          throw new Error(`Container ${segment}.${theme}.${context}: missing migrated surface`);
        }
        palette.boxColor.neutralComplementary = {
          low: { rest: resolveColor(c, segment, recipe.track, recipe.neutralLow) },
          medium: { rest: resolveColor(c, segment, recipe.track, recipe.neutralMedium) }
        };
        palette.boxColor.primaryComplementary = {
          ...(theme === 'light'
            ? { low: { rest: resolveColor(c, segment, recipe.track, primary(3)) } }
            : {}),
          medium: { rest: resolveColor(c, segment, recipe.track, recipe.primaryMedium) },
          highest: { rest: resolveColor(c, segment, recipe.track, recipe.primaryHighest) }
        };
        outputs.neutralComplementary = {
          low: { rest: 'onSubtle' },
          medium: { rest: 'onSubtle' }
        };
        outputs.primaryComplementary = {
          ...(theme === 'light' ? { low: { rest: 'onSubtle' as const } } : {}),
          medium: { rest: 'onSubtle' },
          highest: { rest: 'onVivid' }
        };
      }
    }
  }

  return container;
}
