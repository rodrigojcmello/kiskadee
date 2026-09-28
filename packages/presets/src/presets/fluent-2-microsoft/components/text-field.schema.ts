import {
  type Color,
  type KiskadeeTone,
  primitive,
  type Schema,
  type TextFieldElements
} from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type Intent = 'neutral' | 'error' | 'warning';

import { createBalancedLowBorder } from './button-perceptual-alpha.ts';

type Mode = 'outline' | 'underline' | 'borderless' | 'notched' | 'inside';

const inputTypography = {
  's:sm:1': 'caption-medium',
  's:md:1': 'body-medium',
  's:lg:1': 'body-large'
} as const;
const ref = (color: Color) => ({ ref: color });
const intents = <T>(recipe: (intent: Intent) => T) => ({
  neutral: { medium: recipe('neutral') },
  error: { medium: recipe('error') },
  warning: { medium: recipe('warning') }
});

export function createFluent2MicrosoftTextFieldSchema({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): NonNullable<Schema<never>['components']['textField']> {
  const themedElements = (dark: boolean) => {
    const track = dark ? 'd' : 'l';
    const palette = <T>(onSubtle: T) => ({
      default: dark ? { dark: { onSubtle } } : { light: { onSubtle } }
    });
    const neutral = (tone: KiskadeeTone) =>
      c.resolve('default', track, exactColor('textField.neutral', tone, 'component.text-field'));
    const transparent = c.resolve(
      'default',
      track,
      absoluteCap(primitive('black', 'v1'), 'light', 0)
    );
    const white = c.resolve('default', track, absoluteCap(primitive('black', 'v1'), 'light'));
    const neutralVivid = c.resolve('default', track, referenceColor('textField.neutral', 'vivid'));
    const foreground = dark ? white : neutralVivid;
    const brand = c.resolve('default', track, referenceColor('primary', 'vivid'));
    const error = c.resolve('default', track, referenceColor('textField.error', 'vivid'));
    const warning = c.resolve('default', track, referenceColor('textField.warning', 'vivid'));
    const disabledText = neutral(dark ? 35 : 16);
    const disabledStroke = neutral(dark ? 24 : 7);
    const outlineStroke = createBalancedLowBorder({
      color: neutralVivid,
      surface: dark ? neutral(5) : white,
      targetDeltaE: dark ? 0.18 : 0.06
    });
    const outlineIndicator = neutral(dark ? 80 : 12);
    const outlineIndicatorHover = neutral(dark ? 90 : 22);
    const borderlessSurface = c.resolve(
      'default',
      track,
      exactColor('card.neutral', 3, 'component.card')
    );
    const stroke = neutral(dark ? 40 : 10);
    const strokeHover = neutral(dark ? 50 : 12);
    const underline = neutral(dark ? 80 : 50);
    const underlineHover = neutral(dark ? 85 : 55);
    const placeholder = neutral(dark ? 75 : 40);
    const filled = dark ? borderlessSurface : neutral(2);
    const semantic = (intent: Intent) =>
      intent === 'error' ? error : intent === 'warning' ? warning : brand;
    const text = (rest: Color) =>
      palette({
        textColor: intents(() => ({ rest, disabled: ref(disabledText) }))
      });
    const labelPalette = text(foreground);
    const messagePalette = palette({
      textColor: intents((intent) => ({
        rest: intent === 'neutral' ? underline : semantic(intent),
        disabled: ref(disabledText)
      }))
    });

    const elements = (mode: Mode): TextFieldElements => {
      const floating = mode === 'notched' || mode === 'inside';
      const sizes = (small: number, medium: number, large: number) =>
        floating
          ? { 's:md:1': medium, 's:lg:1': large }
          : { 's:sm:1': small, 's:md:1': medium, 's:lg:1': large };
      const typography = floating
        ? { 's:md:1': inputTypography['s:md:1'], 's:lg:1': inputTypography['s:lg:1'] }
        : inputTypography;
      const borderless = mode === 'borderless';
      const underlined = mode === 'underline';
      const height = floating ? sizes(0, 40, 48) : sizes(24, 32, 40);
      const background =
        underlined || mode === 'outline'
          ? transparent
          : borderless
            ? borderlessSurface
            : mode === 'inside'
              ? filled
              : dark
                ? neutral(9)
                : white;
      const edge = (intent: Intent) => ({
        rest:
          intent === 'neutral'
            ? borderless
              ? transparent
              : mode === 'outline'
                ? outlineStroke
                : stroke
            : semantic(intent),
        ...(intent === 'neutral' && !borderless && mode !== 'outline'
          ? { hover: ref(strokeHover) }
          : {}),
        ...(intent === 'neutral' && !borderless && mode !== 'outline'
          ? {
              focus: ref(brand)
            }
          : {}),
        disabled: ref(borderless ? transparent : disabledStroke),
        readOnly: ref(borderless ? transparent : disabledStroke)
      });
      const controlPalette = palette({
        boxColor: intents(() => ({
          rest: background,
          ...(underlined ? {} : { disabled: ref(transparent), readOnly: ref(transparent) })
        })),
        borderColor: intents(edge),
        ...(mode === 'outline'
          ? {
              borderBottomColor: intents((intent) => ({
                rest: intent === 'neutral' ? outlineIndicator : semantic(intent),
                ...(intent === 'neutral'
                  ? {
                      hover: ref(outlineIndicatorHover),
                      // Restore the base contour when focus/press overlaps hover; e6 owns emphasis.
                      focus: ref(outlineIndicator),
                      pressed: ref(outlineIndicator)
                    }
                  : {}),
                disabled: ref(disabledStroke),
                readOnly: ref(disabledStroke)
              }))
            }
          : {}),
        // e3 only carries Rest placeholder color; structural CSS owns its opacity.
        textColor: intents(() => ({ rest: placeholder }))
      });
      return {
        e1: { name: 'root' },
        e2: {
          name: 'label',
          typography: floating ? { 's:all': 'caption-medium' } : inputTypography,
          scales:
            mode === 'notched'
              ? { marginTop: -8, marginLeft: 4, paddingRight: 4, paddingLeft: 4 }
              : mode === 'inside'
                ? { marginTop: sizes(4, 6, 8), marginLeft: sizes(12, 16, 20) }
                : { marginBottom: 4 },
          palettes: labelPalette
        },
        ...(!floating
          ? {
              e7: {
                name: 'inline-label',
                typography: typography,
                scales: { boxWidth: sizes(96, 112, 128), paddingRight: 12 },
                palettes: labelPalette
              }
            }
          : {}),
        e3: {
          name: 'control',
          decorations: { borderStyle: 'solid' },
          scales: {
            boxHeight: height,
            borderWidth: underlined ? 0 : 1,
            borderRadius: {
              rounded: underlined ? 0 : 4,
              square: 0,
              pill: floating ? sizes(0, 20, 24) : sizes(12, 16, 20)
            },
            paddingTop:
              mode === 'inside'
                ? sizes(6, 8, 10)
                : mode === 'outline'
                  ? sizes(3, 5, 8)
                  : sizes(4, 6, 9),
            paddingBottom:
              mode === 'inside'
                ? sizes(2, 4, 6)
                : mode === 'outline'
                  ? sizes(3, 5, 8)
                  : sizes(4, 6, 9),
            paddingLeft: mode === 'outline' ? sizes(7, 11, 15) : sizes(8, 12, 16),
            paddingRight: mode === 'outline' ? sizes(7, 11, 15) : sizes(8, 12, 16)
          },
          palettes: controlPalette
        },
        e4: {
          name: 'input',
          typography: typography,
          ...(mode === 'inside' ? { scales: { paddingTop: 10 } } : {}),
          palettes: text(foreground)
        },
        e5: {
          name: 'message',
          typography: { 's:all': 'caption-medium' },
          scales: { marginTop: 4 },
          palettes: messagePalette
        },
        ...(!floating
          ? {
              e6: {
                name: 'indicator',
                scales: { boxHeight: 1 },
                palettes: palette({
                  boxColor: intents((intent) => ({
                    rest: borderless
                      ? transparent
                      : intent === 'neutral'
                        ? mode === 'outline'
                          ? outlineIndicator
                          : underline
                        : semantic(intent),
                    ...(intent === 'neutral' && !borderless
                      ? { hover: ref(mode === 'outline' ? outlineIndicatorHover : underlineHover) }
                      : {}),
                    ...(intent === 'neutral' || borderless
                      ? { pressed: ref(semantic(intent)), focus: ref(semantic(intent)) }
                      : {}),
                    disabled: ref(borderless ? transparent : disabledStroke),
                    readOnly: ref(borderless ? transparent : disabledStroke)
                  }))
                })
              }
            }
          : {})
      };
    };

    return elements;
  };
  const lightElements = themedElements(false);
  const darkElements = themedElements(true);
  const elements = (mode: Mode): TextFieldElements => {
    const light = lightElements(mode);
    const dark = darkElements(mode);
    for (const key of ['e2', 'e3', 'e4', 'e5', 'e6', 'e7'] as const) {
      const target = light[key];
      const darkPalette = dark[key]?.palettes?.default?.dark;
      if (target?.palettes?.default && darkPalette) {
        target.palettes.default.dark = darkPalette;
      }
    }
    return light;
  };

  return {
    options: {
      variant: 'standard',
      mode: 'outline',
      focusRingColorSource: 'component',
      density: { compact: 's:md:1', regular: 's:md:1', spacious: 's:lg:1' }
    },
    variants: {
      standard: {
        options: { mode: 'outline', labelPlacement: 'top' },
        modes: {
          outline: {
            options: { labelOffset: { square: 'none', rounded: 'none', pill: 'radius' } },
            elements: elements('outline')
          },
          underline: {
            options: { labelOffset: { square: 'none', rounded: 'none', pill: 'none' } },
            elements: elements('underline')
          },
          borderless: {
            options: { labelOffset: { square: 'none', rounded: 'none', pill: 'input-start' } },
            elements: elements('borderless')
          }
        }
      },
      floating: {
        options: { mode: 'notched' },
        modes: {
          notched: {
            options: { labelOffset: { square: 'none', rounded: 'radius', pill: 'input-start' } },
            elements: elements('notched')
          },
          inside: {
            options: {
              labelOffset: { square: 'input-start', rounded: 'input-start', pill: 'schema' }
            },
            elements: elements('inside')
          }
        }
      }
    }
  };
}
