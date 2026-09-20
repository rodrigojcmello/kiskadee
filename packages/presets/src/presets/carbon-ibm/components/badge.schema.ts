import {
  type BadgeIntent,
  type ColorSchema,
  primitive,
  type Schema,
  type SurfaceContextPalette
} from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver, referenceColor } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type BadgeComponent = NonNullable<Schema<never>['components']['badge']>;
type Theme = 'light' | 'dark' | 'darker';
const FAMILIES = {
  neutral: 'gray',
  primary: 'blue',
  novelty: 'purple',
  positive: 'green',
  warning: 'yellow',
  attention: 'red'
} as const;
const INTENTS = Object.keys(FAMILIES) as BadgeIntent[];

export function createCarbonIbmBadgeSchema({ c }: { c: CarbonIbmColorResolver }): BadgeComponent {
  const palette = (
    theme: Theme,
    type: 'surface' | 'text' | 'mark' | 'separation'
  ): SurfaceContextPalette<ColorSchema> => {
    const track = theme === 'light' ? 'l' : 'd';
    const cap = (polarity: 'light' | 'dark', alpha?: number) =>
      c.resolve('default', track, absoluteCap(primitive('black', 'v1'), polarity, alpha));
    const vivid = (intent: BadgeIntent) =>
      c.resolve('default', track, referenceColor(`badge.${intent}`, 'vivid'));
    const createMap = (onVivid: boolean) =>
      Object.fromEntries(
        INTENTS.map((intent) => {
          const role = `badge.${intent}` as const;
          const background = tokenColor(c, theme, `tag-background-${FAMILIES[intent]}`, role);
          const text = tokenColor(c, theme, `tag-color-${FAMILIES[intent]}`, role);
          const high =
            intent === 'neutral' ? tokenColor(c, theme, 'background-inverse', role) : vivid(intent);
          const onHigh =
            intent === 'neutral'
              ? tokenColor(c, theme, 'text-inverse', role)
              : intent === 'warning' && theme === 'light'
                ? cap('dark')
                : cap('light');
          const colors =
            type === 'separation'
              ? { high: cap('light'), medium: cap('light'), low: cap('light') }
              : type === 'surface'
                ? {
                    high,
                    medium: background,
                    low: cap(onVivid ? 'light' : theme === 'light' ? 'dark' : 'light', 8)
                  }
                : type === 'mark'
                  ? {
                      high: onVivid ? cap('light') : vivid(intent),
                      medium: text,
                      low: onVivid ? cap('light') : text
                    }
                  : { high: onHigh, medium: text, low: onVivid ? cap('light') : text };
          return [
            intent,
            Object.fromEntries(
              Object.entries(colors).map(([emphasis, rest]) => [emphasis, { rest }])
            )
          ];
        })
      );
    return {
      onSubtle: {
        [type === 'surface' || type === 'separation' ? 'boxColor' : 'textColor']: createMap(false),
        ...(type === 'separation' && { borderColor: createMap(false) })
      },
      onVivid: {
        [type === 'surface' || type === 'separation' ? 'boxColor' : 'textColor']: createMap(true),
        ...(type === 'separation' && { borderColor: createMap(true) })
      }
    };
  };
  const themes = (type: Parameters<typeof palette>[1]) => ({
    default: {
      light: palette('light', type),
      dark: palette('dark', type),
      darker: palette('darker', type)
    }
  });
  return {
    options: { density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' } },
    elements: {
      e1: {
        name: 'badge-surface',
        scales: {
          boxHeight: { 's:sm:1': 18, 's:md:1': 24, 's:lg:1': 32 },
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: { 's:sm:1': 8, 's:md:1': 8, 's:lg:1': 12 },
          paddingRight: { 's:sm:1': 8, 's:md:1': 8, 's:lg:1': 12 },
          borderRadius: { square: 0, rounded: 16, pill: 16 }
        },
        palettes: themes('surface')
      },
      e2: {
        name: 'badge-content',
        typography: { 's:all': 'label-small' },
        palettes: themes('text')
      },
      e3: {
        name: 'badge-full-bleed-mark',
        iconSize: { 's:sm:1': 's:sm:1', 's:md:1': 's:md:1', 's:lg:1': 's:lg:1' },
        scales: { borderRadius: { pill: 16 } },
        palettes: themes('mark')
      },
      e4: {
        name: 'badge-contained-mark-icon',
        iconSize: { 's:all': 's:sm:1' },
        palettes: themes('text')
      },
      e5: {
        name: 'badge-dot-surface',
        scales: { boxWidth: 8, boxHeight: 8, borderRadius: { pill: 4 } },
        palettes: themes('surface')
      },
      e6: {
        name: 'badge-separation-ring',
        scales: { borderWidth: 2, borderRadius: { square: 0, rounded: 16, pill: 16 } },
        palettes: themes('separation')
      }
    }
  };
}
