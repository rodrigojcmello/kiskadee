import type {
  InteractionStateColorMap,
  KiskadeeTone,
  Schema,
  SolidColor,
  SurfaceContext
} from '@kiskadee/core';
import { primitive } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorLocator,
  type Fluent2MicrosoftColorResolver
} from '../fluent-2-microsoft.color.ts';

type Fluent2MicrosoftSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type ColorLocator = {
  color: Fluent2MicrosoftColorLocator;
  track?: ThemeShortcut;
};

type StateRecipe = {
  rest: ColorLocator;
  hover?: ColorLocator;
  pressed?: ColorLocator;
  selected?: ColorLocator;
  disabled?: ColorLocator;
};

type IntentRecipe = {
  lowest: StateRecipe;
  low: StateRecipe;
  medium: StateRecipe;
  high?: StateRecipe;
  highest?: StateRecipe;
};

type CardPaletteRecipe = {
  track: ThemeShortcut;
  boxColor: {
    neutral: IntentRecipe;
    primary: IntentRecipe;
  };
  borderColor: {
    neutral: IntentRecipe;
    primary: IntentRecipe;
  };
};

type CreateFluent2MicrosoftCardSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
  segmentNames: readonly Fluent2MicrosoftSegmentName[];
};

const n = (tone: KiskadeeTone, alpha?: number): ColorLocator => ({
  color: exactColor('card.neutral', tone, 'component.card', alpha)
});

const p = (tone: KiskadeeTone, alpha?: number): ColorLocator => ({
  color: exactColor('card.primary', tone, 'component.card', alpha)
});

const physicalCap = (polarity: 'light' | 'dark', alpha?: number): ColorLocator => ({
  color: absoluteCap(primitive('black', 'v1'), polarity, alpha)
});
const lightCap = (alpha?: number) => physicalCap('light', alpha);
const darkCap = (alpha?: number) => physicalCap('dark', alpha);
const lightTransparent = lightCap(0);
const darkTransparent = darkCap(0);
const onVividTransparent: ColorLocator = {
  color: absoluteCap(primitive('black', 'v1'), 'light', 0),
  track: 'l'
};
const onVividBoundary: ColorLocator = {
  color: absoluteCap(primitive('black', 'v1'), 'light', 15),
  track: 'l'
};

const transparentBorder = (transparent: ColorLocator, selected: ColorLocator): StateRecipe => ({
  rest: transparent,
  selected
});

const LIGHT_RECIPE = {
  track: 'l',
  boxColor: {
    neutral: {
      lowest: {
        rest: lightTransparent,
        hover: n(2),
        pressed: n(7),
        selected: n(5),
        disabled: n(3)
      },
      low: {
        rest: lightCap(),
        hover: n(2),
        pressed: n(7),
        selected: n(5),
        disabled: n(3)
      },
      medium: {
        rest: n(1),
        hover: n(3),
        pressed: n(8),
        selected: n(6),
        disabled: n(3)
      },
      high: {
        rest: n(2),
        hover: n(4),
        pressed: n(9),
        selected: n(7),
        disabled: n(3)
      }
    },
    primary: {
      lowest: {
        rest: lightTransparent,
        hover: p(4),
        pressed: p(8),
        selected: p(6),
        disabled: n(3)
      },
      low: {
        rest: lightCap(),
        hover: n(2),
        pressed: n(7),
        selected: n(5),
        disabled: n(3)
      },
      medium: {
        rest: p(4),
        hover: p(8),
        pressed: p(12),
        selected: p(10),
        disabled: n(3)
      },
      highest: {
        rest: p(50),
        hover: p(55),
        pressed: p(75),
        selected: p(60),
        disabled: n(3)
      }
    }
  },
  borderColor: {
    neutral: {
      lowest: transparentBorder(lightTransparent, n(16)),
      low: {
        rest: n(10),
        hover: n(12),
        pressed: n(18),
        selected: n(16),
        disabled: n(7)
      },
      medium: transparentBorder(lightTransparent, n(16)),
      high: transparentBorder(lightTransparent, n(16))
    },
    primary: {
      lowest: transparentBorder(lightTransparent, n(16)),
      low: {
        rest: p(50),
        hover: p(55),
        pressed: p(75),
        selected: p(60),
        disabled: lightTransparent
      },
      medium: transparentBorder(lightTransparent, n(16)),
      highest: transparentBorder(lightTransparent, n(16))
    }
  }
} as const satisfies CardPaletteRecipe;

const DARK_RECIPE = {
  track: 'd',
  boxColor: {
    neutral: {
      lowest: {
        rest: darkTransparent,
        hover: n(16),
        pressed: n(10),
        selected: n(12),
        disabled: n(3)
      },
      low: {
        rest: n(9),
        hover: n(20),
        pressed: n(6),
        selected: n(16),
        disabled: n(3)
      },
      medium: {
        rest: n(6),
        hover: n(12),
        pressed: n(3),
        selected: n(10),
        disabled: n(3)
      },
      high: {
        rest: n(3),
        hover: n(9),
        pressed: n(1),
        selected: n(7)
      }
    },
    primary: {
      lowest: {
        rest: darkTransparent,
        hover: p(9),
        pressed: p(6),
        selected: p(7),
        disabled: n(3)
      },
      low: {
        rest: n(9),
        hover: n(20),
        pressed: n(6),
        selected: n(16),
        disabled: n(3)
      },
      medium: {
        rest: p(10),
        hover: p(16),
        pressed: p(8),
        selected: p(12),
        disabled: n(3)
      },
      highest: {
        rest: p(35),
        hover: p(40),
        pressed: p(14),
        selected: p(28),
        disabled: n(3)
      }
    }
  },
  borderColor: {
    neutral: {
      lowest: transparentBorder(darkTransparent, n(50)),
      low: {
        rest: n(45),
        hover: n(50),
        selected: n(50),
        disabled: n(22)
      },
      medium: transparentBorder(darkTransparent, n(50)),
      high: transparentBorder(darkTransparent, n(50))
    },
    primary: {
      lowest: transparentBorder(darkTransparent, n(50)),
      low: {
        rest: p(35),
        hover: p(40),
        pressed: p(14),
        selected: p(28),
        disabled: darkTransparent
      },
      medium: transparentBorder(darkTransparent, n(50)),
      highest: transparentBorder(darkTransparent, n(50))
    }
  }
} as const satisfies CardPaletteRecipe;

const DARKER_RECIPE = {
  ...DARK_RECIPE,
  boxColor: {
    ...DARK_RECIPE.boxColor,
    neutral: {
      ...DARK_RECIPE.boxColor.neutral,
      highest: {
        rest: darkCap(),
        hover: n(5),
        selected: n(3),
        disabled: n(3)
      }
    }
  },
  borderColor: {
    ...DARK_RECIPE.borderColor,
    neutral: {
      ...DARK_RECIPE.borderColor.neutral,
      highest: transparentBorder(darkTransparent, n(50))
    }
  }
} as const satisfies CardPaletteRecipe;

const CARD_RECIPES = {
  light: LIGHT_RECIPE,
  dark: DARK_RECIPE,
  darker: DARKER_RECIPE
} as const satisfies Record<ThemeName, CardPaletteRecipe>;

function createCardContentSurfaceContext(themeName: ThemeName) {
  const recipe: CardPaletteRecipe = CARD_RECIPES[themeName];
  const createContext = () => ({
    neutral: {
      lowest: { rest: 'inherit' as const },
      low: { rest: 'onSubtle' as const },
      medium: { rest: 'onSubtle' as const },
      high: { rest: 'onSubtle' as const },
      ...(recipe.boxColor.neutral.highest ? { highest: { rest: 'onSubtle' as const } } : undefined)
    },
    primary: {
      lowest: { rest: 'inherit' as const },
      low: { rest: 'onSubtle' as const },
      medium: { rest: 'onSubtle' as const },
      ...(recipe.boxColor.primary.high ? { high: { rest: 'onSubtle' as const } } : undefined),
      ...(recipe.boxColor.primary.highest ? { highest: { rest: 'onVivid' as const } } : undefined)
    }
  });

  return {
    onSubtle: createContext(),
    onVivid: createContext()
  };
}

const CANONICAL_CARD_SURFACES = {
  default: {
    light: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' }
    ],
    dark: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' }
    ],
    darker: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' },
      { intent: 'neutral', emphasis: 'highest', contentSurfaceContext: 'onSubtle' }
    ]
  }
} as const satisfies NonNullable<CardComponent['options']>['canonicalSurfaces'];

function resolveColor(
  c: Fluent2MicrosoftColorResolver,
  segmentName: Fluent2MicrosoftSegmentName,
  track: ThemeShortcut,
  locator: ColorLocator
): SolidColor {
  return c.resolve(segmentName, locator.track ?? track, locator.color);
}

function createStateMap(
  c: Fluent2MicrosoftColorResolver,
  segmentName: Fluent2MicrosoftSegmentName,
  track: ThemeShortcut,
  recipe: StateRecipe
): InteractionStateColorMap {
  return {
    rest: resolveColor(c, segmentName, track, recipe.rest),
    ...(recipe.hover ? { hover: resolveColor(c, segmentName, track, recipe.hover) } : undefined),
    ...(recipe.pressed
      ? { pressed: resolveColor(c, segmentName, track, recipe.pressed) }
      : undefined),
    ...(recipe.selected
      ? {
          selected: {
            rest: resolveColor(c, segmentName, track, recipe.selected)
          }
        }
      : undefined),
    ...(recipe.disabled
      ? { disabled: resolveColor(c, segmentName, track, recipe.disabled) }
      : undefined)
  };
}

function createCardPalette(
  c: Fluent2MicrosoftColorResolver,
  segmentName: Fluent2MicrosoftSegmentName,
  themeName: ThemeName,
  surfaceContext: SurfaceContext
) {
  const recipe: CardPaletteRecipe = CARD_RECIPES[themeName];
  const stateMap = (stateRecipe: StateRecipe) =>
    createStateMap(c, segmentName, recipe.track, stateRecipe);
  const contextualBoundary = (visible: boolean) =>
    stateMap({ rest: visible ? onVividBoundary : onVividTransparent });

  const borderColor =
    surfaceContext === 'onSubtle'
      ? {
          neutral: {
            lowest: stateMap(recipe.borderColor.neutral.lowest),
            low: stateMap(recipe.borderColor.neutral.low),
            medium: stateMap(recipe.borderColor.neutral.medium),
            high: stateMap(recipe.borderColor.neutral.high!),
            ...(recipe.borderColor.neutral.highest
              ? { highest: stateMap(recipe.borderColor.neutral.highest) }
              : undefined)
          },
          primary: {
            lowest: stateMap(recipe.borderColor.primary.lowest),
            low: stateMap(recipe.borderColor.primary.low),
            medium: stateMap(recipe.borderColor.primary.medium),
            ...(recipe.borderColor.primary.high
              ? { high: stateMap(recipe.borderColor.primary.high!) }
              : undefined),
            ...(recipe.borderColor.primary.highest
              ? { highest: stateMap(recipe.borderColor.primary.highest) }
              : undefined)
          }
        }
      : {
          neutral: {
            lowest: contextualBoundary(false),
            low: contextualBoundary(false),
            medium: contextualBoundary(false),
            high: contextualBoundary(false),
            ...(recipe.borderColor.neutral.highest
              ? { highest: contextualBoundary(false) }
              : undefined)
          },
          primary: {
            lowest: contextualBoundary(false),
            low: contextualBoundary(false),
            medium: contextualBoundary(false),
            ...(recipe.borderColor.primary.high ? { high: contextualBoundary(false) } : undefined),
            ...(recipe.borderColor.primary.highest
              ? { highest: contextualBoundary(true) }
              : undefined)
          }
        };

  return {
    boxColor: {
      neutral: {
        lowest: stateMap(recipe.boxColor.neutral.lowest),
        low: stateMap(recipe.boxColor.neutral.low),
        medium: stateMap(recipe.boxColor.neutral.medium),
        high: stateMap(recipe.boxColor.neutral.high!),
        ...(recipe.boxColor.neutral.highest
          ? { highest: stateMap(recipe.boxColor.neutral.highest) }
          : undefined)
      },
      primary: {
        lowest: stateMap(recipe.boxColor.primary.lowest),
        low: stateMap(recipe.boxColor.primary.low),
        medium: stateMap(recipe.boxColor.primary.medium),
        ...(recipe.boxColor.primary.high
          ? { high: stateMap(recipe.boxColor.primary.high!) }
          : undefined),
        ...(recipe.boxColor.primary.highest
          ? { highest: stateMap(recipe.boxColor.primary.highest) }
          : undefined)
      }
    },
    borderColor
  };
}

export function createFluent2MicrosoftCardSchema({
  c,
  segmentNames
}: CreateFluent2MicrosoftCardSchemaArgs): CardComponent {
  return {
    contentSurfaceContext: {
      default: {
        light: createCardContentSurfaceContext('light'),
        dark: createCardContentSurfaceContext('dark'),
        darker: createCardContentSurfaceContext('darker')
      }
    },
    options: {
      canonicalSurfaces: CANONICAL_CARD_SURFACES
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:md:1',
            hover: 's:lg:1'
          },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3', 's:lg:4']
        }
      }
    },
    elements: {
      e1: {
        name: 'card',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:md:1': 16
          },
          paddingBottom: {
            's:md:1': 16
          },
          paddingLeft: {
            's:md:1': 16
          },
          paddingRight: {
            's:md:1': 16
          },
          borderWidth: {
            's:md:1': 1
          },
          borderRadius: {
            rounded: {
              's:md:1': 4
            },
            square: {
              's:md:1': 0
            }
          }
        },
        palettes: buildBySegment(segmentNames, (segmentName) => ({
          light: {
            onSubtle: createCardPalette(c, segmentName, 'light', 'onSubtle'),
            onVivid: createCardPalette(c, segmentName, 'light', 'onVivid')
          },
          dark: {
            onSubtle: createCardPalette(c, segmentName, 'dark', 'onSubtle'),
            onVivid: createCardPalette(c, segmentName, 'dark', 'onVivid')
          },
          darker: {
            onSubtle: createCardPalette(c, segmentName, 'darker', 'onSubtle'),
            onVivid: createCardPalette(c, segmentName, 'darker', 'onVivid')
          }
        }))
      }
    }
  };
}
