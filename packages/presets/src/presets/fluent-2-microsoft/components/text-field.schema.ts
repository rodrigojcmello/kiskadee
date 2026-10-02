import type { Color, Schema, TextFieldElements } from '@kiskadee/core';
import type { Fluent2MicrosoftColorResolver } from '../fluent-2-microsoft.color.ts';
import {
  createFieldVisualRecipe,
  fieldSizes,
  fieldTypography as inputTypography
} from './field-visual-recipe.ts';

type Intent = 'neutral' | 'error' | 'warning';

type Mode = 'outline' | 'underline' | 'borderless' | 'notched' | 'inside';

const ref = (color: Color) => ({ ref: color });
const editableStates = <T extends { disabled?: unknown; readOnly?: unknown }>(states: T) => {
  const { disabled: _disabled, readOnly: _readOnly, ...editable } = states;
  return editable;
};
const intents = <T extends object>(recipe: (intent: Intent) => T) => ({
  neutral: { medium: recipe('neutral') },
  error: { medium: editableStates(recipe('error')) },
  warning: { medium: editableStates(recipe('warning')) }
});

export function createFluent2MicrosoftTextFieldSchema({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): NonNullable<Schema<never>['components']['textField']> {
  const themedElements = (theme: 'light' | 'dark' | 'darker', vivid = false) => {
    const dark = theme !== 'light';
    const {
      palette,
      neutral,
      transparent,
      white,
      onSurfaceForeground,
      foreground,
      brand,
      error,
      warning,
      disabledText,
      disabledStroke,
      outlineStroke,
      neutralControl,
      outlineIndicator,
      outlineIndicatorHover,
      borderlessSurface,
      stroke,
      strokeHover,
      underline,
      underlineHover,
      placeholder,
      filled
    } = createFieldVisualRecipe(c, theme, vivid);
    const semantic = (intent: Intent) =>
      intent === 'error' ? error : intent === 'warning' ? warning : brand;
    const text = (rest: Color, disabled = disabledText) =>
      palette({
        textColor: intents(() => ({ rest, disabled: ref(disabled) }))
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
        floating ? { 's:md:1': medium, 's:lg:1': large } : fieldSizes(small, medium, large);
      const typography = floating
        ? { 's:md:1': inputTypography['s:md:1'], 's:lg:1': inputTypography['s:lg:1'] }
        : inputTypography;
      const borderless = mode === 'borderless';
      // Filled shells retain Card's on-subtle content; external labels/messages stay on-vivid.
      const filledVivid = vivid && (borderless || floating);
      const inputForeground = filledVivid ? onSurfaceForeground : foreground;
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
          ...(mode === 'outline'
            ? {
                hover: ref(neutralControl.hoverBackground),
                focus: ref(background),
                pressed: ref(background)
              }
            : {}),
          ...(underlined || filledVivid
            ? {}
            : { disabled: ref(transparent), readOnly: ref(transparent) })
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
        textColor: intents(() => ({ rest: filledVivid ? onSurfaceForeground : placeholder }))
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
          palettes:
            floating && vivid ? text(onSurfaceForeground, neutral(dark ? 35 : 16)) : labelPalette
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
          palettes: text(inputForeground, filledVivid ? neutral(dark ? 35 : 16) : disabledText)
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
  const lightElements = themedElements('light');
  const darkElements = themedElements('dark');
  const lightVividElements = themedElements('light', true);
  const darkVividElements = themedElements('dark', true);
  const darkerElements = themedElements('darker');
  const darkerVividElements = themedElements('darker', true);
  const elements = (mode: Mode): TextFieldElements => {
    const darker = darkerElements(mode);
    const darkerVivid = darkerVividElements(mode);
    const light = lightElements(mode);
    const dark = darkElements(mode);
    const lightVivid = lightVividElements(mode);
    const darkVivid = darkVividElements(mode);
    for (const key of ['e2', 'e3', 'e4', 'e5', 'e6', 'e7'] as const) {
      const target = light[key];
      const darkPalette = dark[key]?.palettes?.default?.dark;
      const darkerPalette = darker[key]?.palettes?.default?.darker;
      if (target?.palettes?.default?.light && darkPalette && darkerPalette) {
        target.palettes = {
          ...target.palettes,
          default: {
            ...target.palettes.default,
            darker: {
              ...darkerPalette,
              ...darkerVivid[key]?.palettes?.default?.darker
            },
            dark: { ...darkPalette, ...darkVivid[key]?.palettes?.default?.dark },
            light: {
              ...target.palettes.default.light,
              ...lightVivid[key]?.palettes?.default?.light
            }
          }
        };
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
