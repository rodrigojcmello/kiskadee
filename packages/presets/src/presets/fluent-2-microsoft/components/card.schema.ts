import type { InteractionStateColorMap, KiskadeeTone, Schema, SolidColor } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Fluent2MicrosoftSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type CardRole = 'card.neutral' | 'card.primary' | 'primitive.black.v1';

type ColorLocator = {
  role: CardRole;
  tone: KiskadeeTone;
  alpha?: number;
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
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  segmentNames: readonly Fluent2MicrosoftSegmentName[];
};

const n = (tone: KiskadeeTone, alpha?: number): ColorLocator => ({
  role: 'card.neutral',
  tone,
  alpha
});

const p = (tone: KiskadeeTone, alpha?: number): ColorLocator => ({
  role: 'card.primary',
  tone,
  alpha
});

const k = (tone: KiskadeeTone, alpha?: number): ColorLocator => ({
  role: 'primitive.black.v1',
  tone,
  alpha
});

const transparent = k(0, 0);

const transparentBorder = (selected: ColorLocator): StateRecipe => ({
  rest: transparent,
  selected
});

const LIGHT_RECIPE = {
  track: 'l',
  boxColor: {
    neutral: {
      lowest: {
        rest: transparent,
        hover: n(2),
        pressed: n(7),
        selected: n(5),
        disabled: n(3)
      },
      low: {
        rest: k(0),
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
        rest: transparent,
        hover: p(4),
        pressed: p(8),
        selected: p(6),
        disabled: n(3)
      },
      low: {
        rest: k(0),
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
      lowest: transparentBorder(n(16)),
      low: {
        rest: n(10),
        hover: n(12),
        pressed: n(18),
        selected: n(16),
        disabled: n(7)
      },
      medium: transparentBorder(n(16)),
      high: transparentBorder(n(16))
    },
    primary: {
      lowest: transparentBorder(n(16)),
      low: {
        rest: p(50),
        hover: p(55),
        pressed: p(75),
        selected: p(60),
        disabled: transparent
      },
      medium: transparentBorder(n(16)),
      highest: transparentBorder(n(16))
    }
  }
} as const satisfies CardPaletteRecipe;

const DARK_RECIPE = {
  track: 'd',
  boxColor: {
    neutral: {
      lowest: {
        rest: transparent,
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
        rest: transparent,
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
      lowest: transparentBorder(n(50)),
      low: {
        rest: n(45),
        hover: n(50),
        selected: n(50),
        disabled: n(22)
      },
      medium: transparentBorder(n(50)),
      high: transparentBorder(n(50))
    },
    primary: {
      lowest: transparentBorder(n(50)),
      low: {
        rest: p(35),
        hover: p(40),
        pressed: p(14),
        selected: p(28),
        disabled: transparent
      },
      medium: transparentBorder(n(50)),
      highest: transparentBorder(n(50))
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
        rest: k(0),
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
      highest: transparentBorder(n(50))
    }
  }
} as const satisfies CardPaletteRecipe;

const CARD_RECIPES = {
  light: LIGHT_RECIPE,
  dark: DARK_RECIPE,
  darker: DARKER_RECIPE
} as const satisfies Record<ThemeName, CardPaletteRecipe>;

const CANONICAL_CARD_SURFACES = {
  default: {
    light: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'default' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'default' },
      { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'default' },
      { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'default' },
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'inverse' }
    ],
    dark: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'default' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'default' },
      { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'default' },
      { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'default' },
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'inverse' }
    ],
    darker: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'default' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'default' },
      { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'default' },
      { intent: 'neutral', emphasis: 'high', contentSurfaceContext: 'default' },
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'inverse' },
      { intent: 'neutral', emphasis: 'highest', contentSurfaceContext: 'default' }
    ]
  }
} as const satisfies NonNullable<CardComponent['options']>['canonicalSurfaces'];

function resolveColor(
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>,
  segmentName: Fluent2MicrosoftSegmentName,
  track: ThemeShortcut,
  locator: ColorLocator
): SolidColor {
  return c(segmentName, track, locator.role, locator.tone, locator.alpha);
}

function createStateMap(
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>,
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
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>,
  segmentName: Fluent2MicrosoftSegmentName,
  themeName: ThemeName
) {
  const recipe: CardPaletteRecipe = CARD_RECIPES[themeName];
  const stateMap = (stateRecipe: StateRecipe) =>
    createStateMap(c, segmentName, recipe.track, stateRecipe);

  return {
    boxColor: {
      neutral: {
        lowest: stateMap(recipe.boxColor.neutral.lowest),
        low: stateMap(recipe.boxColor.neutral.low),
        medium: stateMap(recipe.boxColor.neutral.medium),
        high: stateMap(recipe.boxColor.neutral.high),
        ...(recipe.boxColor.neutral.highest
          ? { highest: stateMap(recipe.boxColor.neutral.highest) }
          : undefined)
      },
      primary: {
        lowest: stateMap(recipe.boxColor.primary.lowest),
        low: stateMap(recipe.boxColor.primary.low),
        medium: stateMap(recipe.boxColor.primary.medium),
        ...(recipe.boxColor.primary.high
          ? { high: stateMap(recipe.boxColor.primary.high) }
          : undefined),
        ...(recipe.boxColor.primary.highest
          ? { highest: stateMap(recipe.boxColor.primary.highest) }
          : undefined)
      }
    },
    borderColor: {
      neutral: {
        lowest: stateMap(recipe.borderColor.neutral.lowest),
        low: stateMap(recipe.borderColor.neutral.low),
        medium: stateMap(recipe.borderColor.neutral.medium),
        high: stateMap(recipe.borderColor.neutral.high),
        ...(recipe.borderColor.neutral.highest
          ? { highest: stateMap(recipe.borderColor.neutral.highest) }
          : undefined)
      },
      primary: {
        lowest: stateMap(recipe.borderColor.primary.lowest),
        low: stateMap(recipe.borderColor.primary.low),
        medium: stateMap(recipe.borderColor.primary.medium),
        ...(recipe.borderColor.primary.high
          ? { high: stateMap(recipe.borderColor.primary.high) }
          : undefined),
        ...(recipe.borderColor.primary.highest
          ? { highest: stateMap(recipe.borderColor.primary.highest) }
          : undefined)
      }
    }
  };
}

export function createFluent2MicrosoftCardSchema({
  c,
  segmentNames
}: CreateFluent2MicrosoftCardSchemaArgs): CardComponent {
  return {
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
            default: createCardPalette(c, segmentName, 'light')
          },
          dark: {
            default: createCardPalette(c, segmentName, 'dark')
          },
          darker: {
            default: createCardPalette(c, segmentName, 'darker')
          }
        }))
      }
    }
  };
}
