import { primitive, type Schema } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type ChipComponent = NonNullable<Schema<never>['components']['chip']>;
type Theme = 'light' | 'dark' | 'darker';
const INTENTS = ['neutral', 'primary'] as const;
const EMPHASES = ['high', 'medium', 'low', 'lowest'] as const;

export function createCarbonIbmChipSchema({ c }: { c: CarbonIbmColorResolver }): ChipComponent {
  const palette = (theme: Theme, property: 'boxColor' | 'borderColor' | 'textColor') => {
    const track = theme === 'light' ? 'l' : 'd';
    const cap = (polarity: 'light' | 'dark', alpha?: number) =>
      c.resolve('default', track, absoluteCap(primitive('black', 'v1'), polarity, alpha));
    const create = (onVivid: boolean) =>
      Object.fromEntries(
        INTENTS.map((intent) => {
          const role = `chip.${intent}` as const;
          const family = intent === 'neutral' ? 'gray' : 'blue';
          const token = (name: Parameters<typeof tokenColor>[2]) =>
            tokenColor(
              c,
              theme,
              name,
              name.startsWith('tag-') || name.startsWith('button-primary') ? role : undefined
            );
          const high = intent === 'neutral' ? token('background-inverse') : token('button-primary');
          const highHover =
            intent === 'neutral'
              ? token('background-inverse-hover')
              : token('button-primary-hover');
          const highPressed =
            intent === 'neutral'
              ? token('background-inverse-hover')
              : token('button-primary-active');
          const selected = token('background-inverse');
          const transparent = cap('dark', 0);
          return [
            intent,
            Object.fromEntries(
              EMPHASES.map((emphasis) => {
                if (property === 'textColor') {
                  const inverse = token('text-inverse');
                  const rest =
                    emphasis === 'high'
                      ? intent === 'neutral'
                        ? inverse
                        : token('text-on-color')
                      : onVivid && (emphasis === 'low' || emphasis === 'lowest')
                        ? cap('light')
                        : emphasis === 'medium'
                          ? token(`tag-color-${family}`)
                          : token('text-primary');
                  const mediumHover =
                    emphasis === 'medium' && theme !== 'light' ? cap('light') : undefined;
                  const mediumPressed =
                    emphasis === 'medium'
                      ? theme === 'dark'
                        ? cap('light')
                        : theme === 'light' && intent === 'primary'
                          ? token('text-primary')
                          : undefined
                      : undefined;
                  return [
                    emphasis,
                    {
                      rest,
                      ...(mediumHover && { hover: { ref: mediumHover } }),
                      ...(mediumPressed && { pressed: { ref: mediumPressed } }),
                      ...(rest !== inverse && {
                        selected: {
                          rest: { ref: inverse },
                          // Keep the inverse content when regular medium state deltas also match.
                          ...(mediumHover && { hover: { ref: inverse } }),
                          ...(mediumPressed && { pressed: { ref: inverse } })
                        }
                      }),
                      disabled: { ref: token('text-disabled') }
                    }
                  ];
                }
                if (property === 'borderColor') {
                  return [
                    emphasis,
                    {
                      rest:
                        emphasis === 'low'
                          ? onVivid
                            ? cap('light')
                            : token('border-inverse')
                          : transparent,
                      ...(emphasis === 'low' && {
                        selected: { rest: selected },
                        disabled: token('border-disabled')
                      })
                    }
                  ];
                }
                return [
                  emphasis,
                  {
                    rest:
                      emphasis === 'high'
                        ? high
                        : emphasis === 'medium'
                          ? token(`tag-background-${family}`)
                          : transparent,
                    hover:
                      emphasis === 'high'
                        ? highHover
                        : emphasis === 'medium'
                          ? token(`tag-hover-${family}`)
                          : onVivid
                            ? cap('light', 12)
                            : token('background-hover'),
                    pressed:
                      emphasis === 'high'
                        ? highPressed
                        : onVivid && emphasis !== 'medium'
                          ? cap('light', 20)
                          : token('layer-active-01'),
                    ...(emphasis !== 'high' || intent !== 'neutral'
                      ? {
                          selected: {
                            rest: selected,
                            hover: token('background-inverse-hover'),
                            pressed: token('background-inverse-hover')
                          }
                        }
                      : {}),
                    disabled: emphasis === 'lowest' ? transparent : token('layer-01')
                  }
                ];
              })
            )
          ];
        })
      );
    return { onSubtle: { [property]: create(false) }, onVivid: { [property]: create(true) } };
  };
  const themes = (text = false) => {
    const theme = (theme: Theme) =>
      text
        ? palette(theme, 'textColor')
        : {
            onSubtle: {
              ...palette(theme, 'boxColor').onSubtle,
              ...palette(theme, 'borderColor').onSubtle
            },
            onVivid: {
              ...palette(theme, 'boxColor').onVivid,
              ...palette(theme, 'borderColor').onVivid
            }
          };
    return { default: { light: theme('light'), dark: theme('dark'), darker: theme('darker') } };
  };
  return {
    options: { density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' } },
    contentSurfaceContext: {
      default: Object.fromEntries(
        (['light', 'dark', 'darker'] as const).map((theme) => [
          theme,
          Object.fromEntries(
            (['onSubtle', 'onVivid'] as const).map((context) => [
              context,
              Object.fromEntries(
                INTENTS.map((intent) => [
                  intent,
                  Object.fromEntries(
                    EMPHASES.map((emphasis) => [
                      emphasis,
                      {
                        rest:
                          emphasis === 'high'
                            ? intent === 'neutral' && theme !== 'light'
                              ? 'onSubtle'
                              : 'onVivid'
                            : 'inherit',
                        selected: theme === 'light' ? 'onVivid' : 'onSubtle',
                        disabled: 'onSubtle'
                      }
                    ])
                  )
                ])
              )
            ])
          )
        ])
      )
    },
    elements: {
      e1: { name: 'chip-container' },
      e2: {
        name: 'chip-primary-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          boxHeight: { 's:sm:1': 18, 's:md:1': 24, 's:lg:1': 32 },
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: { 's:sm:1': 7, 's:md:1': 7, 's:lg:1': 11 },
          paddingRight: { 's:sm:1': 7, 's:md:1': 7, 's:lg:1': 11 },
          borderWidth: 1,
          borderRadius: { rounded: 16, pill: 16 }
        },
        palettes: themes()
      },
      e3: {
        name: 'chip-label',
        typography: { 's:all': 'label-small' },
        scales: { paddingLeft: 0, paddingRight: 0 },
        palettes: themes(true)
      },
      e4: {
        name: 'chip-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { marginRight: 4 },
        palettes: themes(true)
      },
      e5: {
        name: 'chip-remove-control',
        decorations: { borderStyle: 'solid' },
        scales: {
          marginLeft: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 3,
          paddingRight: { 's:sm:1': 0, 's:md:1': 3, 's:lg:1': 7 },
          borderWidth: 1,
          borderRadius: { rounded: 16, pill: 16 }
        },
        palettes: themes()
      },
      e6: { name: 'chip-remove-icon', iconSize: { 's:all': 's:sm:1' }, palettes: themes(true) },
      e7: { name: 'chip-badge-relation', scales: { marginLeft: 4 } }
    }
  };
}
