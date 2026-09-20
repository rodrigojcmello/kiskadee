import {
  type InteractionStateColorMap,
  primitive,
  type Schema,
  type SolidColor
} from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver, referenceColor } from '../carbon-ibm.color.ts';
import { type CarbonTokenName, tokenColor } from '../carbon-ibm.tokens.ts';

type CardComponent = NonNullable<Schema<never>['components']['card']>;
const themes = ['light', 'dark', 'darker'] as const;
const levels = ['lowest', 'low', 'medium', 'high'] as const;

/** Carbon layer tokens become stable Card surfaces; primary tonal layers are Kiskadee extensions. */
export function createCarbonIbmCardSchema({ c }: { c: CarbonIbmColorResolver }): CardComponent {
  const palettes = Object.fromEntries(
    themes.map((theme) => {
      const track = theme === 'light' ? 'l' : 'd';
      const token = (name: CarbonTokenName) => tokenColor(c, theme, name);
      const primary = (offset: number) =>
        c.resolve('default', track, referenceColor('card.primary', 'subtle', offset));
      const neutral = (offset: number) =>
        c.resolve('default', track, referenceColor('card.neutral', 'subtle', offset));
      const state = (
        rest: SolidColor,
        hover: SolidColor,
        pressed: SolidColor,
        selected: SolidColor
      ): InteractionStateColorMap => ({
        rest,
        ...(hover !== rest ? { hover } : {}),
        ...(pressed !== rest ? { pressed } : {}),
        ...(selected !== rest ? { selected: { rest: selected } } : {}),
        ...(token('layer-selected-disabled') !== rest
          ? { disabled: token('layer-selected-disabled') }
          : {})
      });
      const layer = (n: '01' | '02' | '03') =>
        state(
          token(`layer-${n}`),
          token(`layer-hover-${n}`),
          token(`layer-active-${n}`),
          token(`layer-selected-${n}`)
        );
      const neutralBoxes =
        theme === 'light'
          ? {
              lowest: state(
                token('background'),
                token('layer-01'),
                token('layer-active-01'),
                token('layer-selected-01')
              ),
              low: state(
                neutral(-3),
                token('layer-hover-01'),
                token('layer-active-01'),
                token('layer-selected-01')
              ),
              medium: layer('01'),
              high: state(
                token('layer-accent-01'),
                token('layer-accent-hover-01'),
                token('layer-accent-active-01'),
                token('layer-active-01')
              )
            }
          : {
              lowest: state(
                token('background'),
                token('layer-01'),
                token('layer-active-01'),
                token('layer-selected-01')
              ),
              low: layer('01'),
              medium: layer('02'),
              high: layer('03')
            };
      const primaryBoxes = {
        lowest: neutralBoxes.lowest,
        low: state(primary(-2), primary(0), primary(3), primary(1)),
        medium: state(primary(0), primary(2), primary(5), primary(3)),
        high: state(primary(2), primary(4), primary(7), primary(5)),
        highest: state(
          token('background-brand'),
          token('button-primary-hover'),
          token('button-primary-active'),
          tokenColor(c, 'light', 'link-secondary', 'card.primary')
        )
      };
      const transparent = c.resolve(
        'default',
        track,
        absoluteCap(primitive('black', 'v1'), 'light', 0)
      );
      const border = (onVivid: boolean) => ({
        neutral: Object.fromEntries(
          levels.map((level) => [
            level,
            {
              rest: token(
                level === 'high'
                  ? theme === 'light'
                    ? 'border-tile-02'
                    : 'border-tile-03'
                  : level === 'medium' && theme !== 'light'
                    ? 'border-tile-02'
                    : 'border-tile-01'
              ),
              selected: { rest: token('border-interactive') },
              disabled: transparent
            }
          ])
        ),
        primary: Object.fromEntries(
          [...levels, 'highest'].map((level) => [
            level,
            {
              rest:
                level === 'highest'
                  ? c.resolve(
                      'default',
                      track,
                      absoluteCap(primitive('black', 'v1'), 'light', onVivid ? 30 : 0)
                    )
                  : token('border-interactive'),
              disabled: transparent
            }
          ])
        )
      });
      return [
        theme,
        {
          onSubtle: {
            boxColor: { neutral: neutralBoxes, primary: primaryBoxes },
            borderColor: border(false)
          },
          onVivid: {
            boxColor: { neutral: neutralBoxes, primary: primaryBoxes },
            borderColor: border(true)
          }
        }
      ];
    })
  );
  const contexts = () => ({
    neutral: Object.fromEntries(levels.map((level) => [level, { rest: 'onSubtle' }])),
    primary: {
      ...Object.fromEntries(levels.map((level) => [level, { rest: 'onSubtle' }])),
      highest: { rest: 'onVivid', disabled: 'onSubtle' }
    }
  });
  const catalog = [
    ...levels.map((emphasis) => ({
      intent: 'neutral' as const,
      emphasis,
      contentSurfaceContext: 'onSubtle' as const
    })),
    ...(['low', 'medium', 'high'] as const).map((emphasis) => ({
      intent: 'primary' as const,
      emphasis,
      contentSurfaceContext: 'onSubtle' as const
    })),
    {
      intent: 'primary' as const,
      emphasis: 'highest' as const,
      contentSurfaceContext: 'onVivid' as const
    }
  ];
  return {
    contentSurfaceContext: {
      default: Object.fromEntries(
        themes.map((theme) => [theme, { onSubtle: contexts(), onVivid: contexts() }])
      )
    },
    options: {
      canonicalSurfaces: { default: Object.fromEntries(themes.map((theme) => [theme, catalog])) },
      border: {
        default: Object.fromEntries(
          themes.map((theme) => [
            theme,
            {
              onSubtle: {
                neutral: Object.fromEntries(levels.map((x) => [x, true])),
                primary: { ...Object.fromEntries(levels.map((x) => [x, true])), highest: false }
              },
              onVivid: {
                neutral: Object.fromEntries(levels.map((x) => [x, true])),
                primary: { ...Object.fromEntries(levels.map((x) => [x, true])), highest: true }
              }
            }
          ])
        )
      }
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:md:1' },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1']
        }
      }
    },
    elements: {
      e1: {
        name: 'card',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: { 's:md:1': 16 },
          paddingBottom: { 's:md:1': 16 },
          paddingLeft: { 's:md:1': 16 },
          paddingRight: { 's:md:1': 16 },
          borderWidth: 1,
          borderRadius: { square: 0, rounded: 4 }
        },
        palettes: { default: palettes }
      }
    }
  };
}
