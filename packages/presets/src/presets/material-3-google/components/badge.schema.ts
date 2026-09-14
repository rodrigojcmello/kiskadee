import { type BadgeIntent, primitive, type Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';
type BadgeComponent = NonNullable<Schema<'purple'>['components']['badge']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';
type BadgeEmphasis = 'high' | 'medium' | 'low' | 'lowest';
type SurfaceContext = 'onSubtle' | 'onVivid';
type BadgeRole = `badge.${BadgeIntent}`;

type CreateMaterial3GoogleBadgeSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent?: string;
};

const INTENTS = [
  'neutral',
  'primary',
  'novelty',
  'positive',
  'warning',
  'attention'
] as const satisfies readonly BadgeIntent[];

const EMPHASES = ['high', 'medium', 'low', 'lowest'] as const satisfies readonly BadgeEmphasis[];

function createBadgeIntentSchema({
  c,
  segment,
  theme,
  intent,
  context,
  transparent
}: {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segment: Material3GoogleSegmentName;
  theme: ThemeName;
  intent: BadgeIntent;
  context: SurfaceContext;
  transparent: string;
}) {
  const role = `badge.${intent}` as BadgeRole;
  const themeShortcut: ThemeShortcut = theme === 'light' ? 'l' : 'd';
  const lightSurface = context === 'onVivid';
  const family = (reference: 'subtle' | 'vivid', offset = 0, alpha?: number) =>
    c.ref(segment, lightSurface ? 'l' : themeShortcut, role, reference, offset, alpha);
  const physical = (polarity: 'light' | 'dark', alpha?: number) =>
    c(segment, 'l', primitive('black', 'v1'), polarity === 'light' ? 0 : 100, alpha);

  // Material's badge is a compact filled status mark. The additional emphasis
  // positions complete Kiskadee's shared badge vocabulary using the same family.
  const surface = (emphasis: BadgeEmphasis) => {
    if (context === 'onVivid') {
      if (emphasis === 'high') return family('subtle');
      if (emphasis === 'medium') return family('subtle', 1);
      if (emphasis === 'low') return physical('light', 12);
      return physical('light', 8);
    }

    if (emphasis === 'high') return family('vivid');
    if (emphasis === 'medium') return family('subtle');
    if (emphasis === 'low') return family('vivid', 0, 8);
    return transparent;
  };

  const highForeground =
    context === 'onVivid'
      ? family('vivid')
      : theme === 'dark' && intent === 'neutral'
        ? physical('dark')
        : physical('light');
  const regularForeground =
    context === 'onSubtle' && theme === 'dark' && intent !== 'neutral'
      ? family('vivid', 6)
      : family('vivid');
  const foreground = (emphasis: BadgeEmphasis) => {
    if (emphasis === 'high') return highForeground;
    if (context === 'onVivid' && (emphasis === 'low' || emphasis === 'lowest')) {
      return physical('light');
    }
    return regularForeground;
  };

  return {
    box: Object.fromEntries(EMPHASES.map((emphasis) => [emphasis, { rest: surface(emphasis) }])),
    text: Object.fromEntries(EMPHASES.map((emphasis) => [emphasis, { rest: foreground(emphasis) }]))
  };
}

function createIntentMap<T>(
  intents: readonly BadgeIntent[],
  create: (intent: BadgeIntent) => T
): Record<BadgeIntent, T> {
  return Object.fromEntries(intents.map((intent) => [intent, create(intent)])) as Record<
    BadgeIntent,
    T
  >;
}

export function createMaterial3GoogleBadgeSchema({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleBadgeSchemaArgs): BadgeComponent {
  const resolveTransparent = (segment: Material3GoogleSegmentName) =>
    transparent ?? c(segment, 'l', primitive('black', 'v1'), 100, 0);

  const surfacePalette = (
    segment: Material3GoogleSegmentName,
    theme: ThemeName,
    context: SurfaceContext
  ) => {
    const transparentColor = resolveTransparent(segment);
    return {
      boxColor: createIntentMap(
        INTENTS,
        (intent) =>
          createBadgeIntentSchema({
            c,
            segment,
            theme,
            intent,
            context,
            transparent: transparentColor
          }).box
      )
    };
  };

  const textPalette = (
    segment: Material3GoogleSegmentName,
    theme: ThemeName,
    context: SurfaceContext
  ) => ({
    textColor: createIntentMap(
      INTENTS,
      (intent) =>
        createBadgeIntentSchema({
          c,
          segment,
          theme,
          intent,
          context,
          transparent: resolveTransparent(segment)
        }).text
    )
  });

  const surfacePalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: surfacePalette(segment, 'light', 'onSubtle'),
      onVivid: surfacePalette(segment, 'light', 'onVivid')
    },
    dark: {
      onSubtle: surfacePalette(segment, 'dark', 'onSubtle'),
      onVivid: surfacePalette(segment, 'dark', 'onVivid')
    }
  }));

  const textPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: textPalette(segment, 'light', 'onSubtle'),
      onVivid: textPalette(segment, 'light', 'onVivid')
    },
    dark: {
      onSubtle: textPalette(segment, 'dark', 'onSubtle'),
      onVivid: textPalette(segment, 'dark', 'onVivid')
    }
  }));

  const fullBleedMarkPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: {
        textColor: createIntentMap(INTENTS, (intent) => ({
          high: {
            rest: c.ref(segment, 'l', `badge.${intent}` as BadgeRole, 'vivid')
          }
        }))
      },
      onVivid: {
        textColor: createIntentMap(INTENTS, (intent) => ({
          high: {
            rest: c.ref(segment, 'l', `badge.${intent}` as BadgeRole, 'subtle', 1)
          }
        }))
      }
    },
    dark: {
      onSubtle: {
        textColor: createIntentMap(INTENTS, (intent) => ({
          high: {
            rest: c.ref(
              segment,
              'd',
              `badge.${intent}` as BadgeRole,
              'vivid',
              intent === 'neutral' ? 0 : 6
            )
          }
        }))
      },
      onVivid: {
        textColor: createIntentMap(INTENTS, (intent) => ({
          high: {
            rest: c.ref(segment, 'l', `badge.${intent}` as BadgeRole, 'subtle', 1)
          }
        }))
      }
    }
  }));

  const ringPalettes = buildBySegment(segmentNames, (segment) => {
    const transparentColor = resolveTransparent(segment);
    const ring = (theme: ThemeName, context: SurfaceContext) => {
      const polarity = context === 'onVivid' || theme === 'dark' ? 'light' : 'dark';
      const alpha = context === 'onVivid' ? 35 : theme === 'dark' ? 24 : 20;
      const value = c(
        segment,
        'l',
        primitive('black', 'v1'),
        polarity === 'light' ? 0 : 100,
        alpha
      );
      return createIntentMap(INTENTS, () => ({
        high: { rest: value },
        medium: { rest: value },
        low: { rest: value },
        lowest: { rest: value }
      }));
    };
    const transparentMap = createIntentMap(INTENTS, () => ({
      high: { rest: transparentColor },
      medium: { rest: transparentColor },
      low: { rest: transparentColor },
      lowest: { rest: transparentColor }
    }));
    return {
      light: {
        onSubtle: {
          boxColor: transparentMap,
          borderColor: ring('light', 'onSubtle')
        },
        onVivid: {
          boxColor: transparentMap,
          borderColor: ring('light', 'onVivid')
        }
      },
      dark: {
        onSubtle: {
          boxColor: transparentMap,
          borderColor: ring('dark', 'onSubtle')
        },
        onVivid: {
          boxColor: transparentMap,
          borderColor: ring('dark', 'onVivid')
        }
      }
    };
  });

  return {
    options: { density: { compact: 's:md:1', spacious: 's:lg:1' } },
    elements: {
      e1: {
        name: 'badge-surface',
        scales: {
          boxHeight: {
            's:sm:3': 16,
            's:sm:2': 18,
            's:sm:1': 20,
            's:md:1': 24,
            's:lg:1': 28,
            's:lg:2': 32
          },
          paddingTop: {
            's:sm:3': 0,
            's:sm:2': 0,
            's:sm:1': 0,
            's:md:1': 2,
            's:lg:1': 2,
            's:lg:2': 2
          },
          paddingBottom: {
            's:sm:3': 0,
            's:sm:2': 0,
            's:sm:1': 0,
            's:md:1': 2,
            's:lg:1': 2,
            's:lg:2': 2
          },
          paddingLeft: {
            's:sm:3': 4,
            's:sm:2': 5,
            's:sm:1': 6,
            's:md:1': 8,
            's:lg:1': 10,
            's:lg:2': 12
          },
          paddingRight: {
            's:sm:3': 4,
            's:sm:2': 5,
            's:sm:1': 6,
            's:md:1': 8,
            's:lg:1': 10,
            's:lg:2': 12
          },
          borderRadius: {
            square: 0,
            rounded: 8,
            pill: {
              's:sm:3': 8,
              's:sm:2': 9,
              's:sm:1': 10,
              's:md:1': 12,
              's:lg:1': 14,
              's:lg:2': 16
            }
          }
        },
        palettes: surfacePalettes
      },
      e2: {
        name: 'badge-content',
        typography: {
          's:sm:3': 'label-medium',
          's:sm:2': 'label-medium',
          's:sm:1': 'label-medium',
          's:md:1': 'label-medium',
          's:lg:1': 'label-large',
          's:lg:2': 'body-medium'
        },
        palettes: textPalettes
      },
      e3: {
        name: 'badge-full-bleed-mark',
        iconSize: {
          's:sm:3': 's:sm:1',
          's:sm:2': 's:sm:1',
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2'
        },
        scales: {
          borderRadius: {
            pill: {
              's:sm:3': 8,
              's:sm:2': 9,
              's:sm:1': 10,
              's:md:1': 12,
              's:lg:1': 14,
              's:lg:2': 16
            }
          }
        },
        palettes: fullBleedMarkPalettes
      },
      e4: {
        name: 'badge-contained-mark-icon',
        iconSize: {
          's:sm:3': 's:sm:3',
          's:sm:2': 's:sm:2',
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2'
        },
        palettes: textPalettes
      },
      e5: {
        name: 'badge-dot-surface',
        scales: {
          boxHeight: {
            's:sm:3': 6,
            's:sm:2': 8,
            's:sm:1': 10,
            's:md:1': 12,
            's:lg:1': 14,
            's:lg:2': 16
          },
          boxWidth: {
            's:sm:3': 6,
            's:sm:2': 8,
            's:sm:1': 10,
            's:md:1': 12,
            's:lg:1': 14,
            's:lg:2': 16
          },
          borderRadius: {
            pill: {
              's:sm:3': 3,
              's:sm:2': 4,
              's:sm:1': 5,
              's:md:1': 6,
              's:lg:1': 7,
              's:lg:2': 8
            }
          }
        },
        palettes: surfacePalettes
      },
      e6: {
        name: 'badge-separation-ring',
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: {
            's:sm:3': 1,
            's:sm:2': 1,
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1,
            's:lg:2': 1
          },
          borderRadius: {
            square: 0,
            rounded: 8,
            pill: {
              's:sm:3': 8,
              's:sm:2': 9,
              's:sm:1': 10,
              's:md:1': 12,
              's:lg:1': 14,
              's:lg:2': 16
            }
          }
        },
        palettes: ringPalettes
      }
    }
  };
}
