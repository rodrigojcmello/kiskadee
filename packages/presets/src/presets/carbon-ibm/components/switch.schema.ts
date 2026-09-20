import { primitive, type Schema, type SolidColor } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Theme = 'light' | 'dark' | 'darker';
type Intent = 'neutral' | 'primary' | 'polarity';
const INTENTS = ['neutral', 'primary', 'polarity'] as const;
const ref = (value: SolidColor) => ({ ref: value });
const themes = <T>(factory: (theme: Theme) => T) => ({
  light: factory('light'),
  dark: factory('dark'),
  darker: factory('darker')
});

export function createCarbonIbmSwitchSchema({ c }: { c: CarbonIbmColorResolver }): SwitchComponent {
  const cap = (alpha = 100) =>
    c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light', alpha));
  const transparent = cap(0);
  const selectedColor = (theme: Theme, intent: Intent) =>
    intent === 'primary'
      ? tokenColor(c, theme, 'button-primary', 'switch.primary')
      : tokenColor(c, theme, 'support-success', 'switch.polarity');

  const track = (theme: Theme, onVivid: boolean, intent: Intent) => ({
    boxColor: {
      rest: onVivid
        ? cap(40)
        : intent === 'polarity'
          ? tokenColor(c, theme, 'support-error', 'redLike')
          : tokenColor(c, theme, 'toggle-off', 'switch.neutral'),
      selected: { rest: ref(onVivid ? cap() : selectedColor(theme, intent)) },
      readOnly: ref(transparent),
      disabled: ref(onVivid ? cap(16) : tokenColor(c, theme, 'button-disabled'))
    },
    borderColor: {
      rest: transparent,
      readOnly: ref(onVivid ? cap(40) : tokenColor(c, theme, 'icon-disabled'))
    }
  });
  const thumb = (theme: Theme, onVivid: boolean, intent: Intent) => ({
    boxColor: {
      rest:
        onVivid && intent === 'polarity'
          ? tokenColor(c, 'light', 'support-error', 'redLike')
          : cap(),
      ...(onVivid ? { selected: { rest: ref(selectedColor('light', intent)) } } : {}),
      readOnly: ref(onVivid ? cap() : tokenColor(c, theme, 'icon-primary')),
      disabled: ref(onVivid ? cap(32) : tokenColor(c, theme, 'icon-on-color-disabled'))
    }
  });
  const context = <T extends { boxColor: unknown; borderColor?: unknown }>(
    theme: Theme,
    create: (theme: Theme, onVivid: boolean, intent: Intent) => T
  ) => {
    const surface = (onVivid: boolean) => {
      const byIntent = Object.fromEntries(
        INTENTS.map((intent) => [intent, create(theme, onVivid, intent)])
      );
      return {
        boxColor: Object.fromEntries(
          INTENTS.map((intent) => [intent, { medium: byIntent[intent].boxColor }])
        ),
        ...(byIntent.neutral.borderColor
          ? {
              borderColor: Object.fromEntries(
                INTENTS.map((intent) => [intent, { medium: byIntent[intent].borderColor }])
              )
            }
          : {})
      };
    };
    return { onSubtle: surface(false), onVivid: surface(true) };
  };
  const textContext = (theme: Theme, secondary: boolean) => {
    const surface = (onVivid: boolean) => ({
      textColor: Object.fromEntries(
        INTENTS.map((intent) => [
          intent,
          {
            medium: {
              rest: onVivid
                ? cap(secondary ? 85 : 100)
                : tokenColor(c, theme, secondary ? 'text-secondary' : 'text-primary'),
              disabled: ref(onVivid ? cap(25) : tokenColor(c, theme, 'text-disabled'))
            }
          }
        ])
      )
    });
    return { onSubtle: surface(false), onVivid: surface(true) };
  };
  const iconContext = (theme: Theme) => {
    const surface = (onVivid: boolean) => ({
      textColor: Object.fromEntries(
        INTENTS.map((intent) => [
          intent,
          {
            medium: {
              rest: onVivid
                ? tokenColor(c, 'light', 'text-primary')
                : tokenColor(c, theme, 'toggle-off'),
              selected: { rest: ref(onVivid ? cap() : selectedColor(theme, intent)) },
              readOnly: ref(
                onVivid
                  ? tokenColor(c, 'light', 'text-primary')
                  : tokenColor(c, theme, 'background')
              ),
              disabled: ref(onVivid ? cap(16) : tokenColor(c, theme, 'button-disabled'))
            }
          }
        ])
      )
    });
    return { onSubtle: surface(false), onVivid: surface(true) };
  };

  return {
    effects: {
      activationFeedback: {
        profile: 'halo',
        origin: 'center',
        visual: {
          layer: 'underlay',
          paint: 'outline',
          tone: { default: 'subtle', bySurfaceContext: { onSubtle: 'subtle', onVivid: 'vivid' } }
        },
        profiles: { halo: { size: 8 } }
      }
    },
    options: {
      density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:md:1' },
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'standard',
      controlTextVisibility: 'always'
    },
    variants: {
      standard: {
        options: { mode: 'base' },
        modes: {
          base: {
            elements: {
              e1: { name: 'switch' },
              e2: {
                name: 'track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: { 's:sm:1': 32, 's:md:1': 48 },
                  boxHeight: { 's:sm:1': 16, 's:md:1': 24 },
                  borderWidth: 1,
                  borderRadius: { rounded: 2, pill: { 's:sm:1': 8, 's:md:1': 12 }, square: 0 },
                  paddingTop: 3,
                  paddingRight: 3,
                  paddingBottom: 3,
                  paddingLeft: 3
                },
                palettes: { default: themes((theme) => context(theme, track)) }
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: { 's:sm:1': 10, 's:md:1': 18 },
                  boxHeight: { 's:sm:1': 10, 's:md:1': 18 },
                  borderRadius: { rounded: 2, pill: { 's:sm:1': 5, 's:md:1': 9 }, square: 0 }
                },
                palettes: { default: themes((theme) => context(theme, thumb)) }
              },
              e4: {
                name: 'label',
                typography: { 's:sm:1': 'label-small', 's:md:1': 'label-small' },
                scales: { marginLeft: 8, marginRight: 8 },
                palettes: { default: themes((theme) => textContext(theme, true)) }
              },
              e5: {
                name: 'control text',
                typography: { 's:sm:1': 'body-medium', 's:md:1': 'body-medium' },
                scales: { marginLeft: 8, marginRight: 8 },
                palettes: { default: themes((theme) => textContext(theme, false)) }
              },
              e6: {
                name: 'icon',
                iconSize: { 's:sm:1': 's:sm:5', 's:md:1': 's:sm:2' },
                palettes: { default: themes(iconContext) }
              }
            }
          }
        }
      }
    }
  };
}
