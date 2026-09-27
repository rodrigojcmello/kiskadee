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
type Mode = 'outline' | 'underline' | 'borderless' | 'notched' | 'inside';

const sizes = (small: number, medium: number, large: number) =>
  ({ 's:sm:1': small, 's:md:1': medium, 's:lg:1': large }) as const;
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
const palette = <T>(onSubtle: T) => ({ default: { light: { onSubtle } } });

export function createFluent2MicrosoftTextFieldSchema({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): NonNullable<Schema<never>['components']['textField']> {
  const neutral = (tone: KiskadeeTone) =>
    c.resolve('default', 'l', exactColor('textField.neutral', tone, 'component.text-field'));
  const transparent = c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light', 0));
  const white = c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light'));
  const foreground = c.resolve('default', 'l', referenceColor('textField.neutral', 'vivid'));
  const brand = c.resolve('default', 'l', referenceColor('primary', 'vivid'));
  const error = c.resolve('default', 'l', referenceColor('textField.error', 'vivid'));
  // Warning is a Kiskadee extension; use the existing readable Orange L50 recipe.
  const warning = c.resolve(
    'default',
    'l',
    exactColor('textField.warning', 50, 'component.text-field')
  );
  const disabledText = neutral(16);
  const disabledStroke = neutral(7);
  const stroke = neutral(10);
  const strokeHover = neutral(12);
  const underline = neutral(50);
  const underlineHover = neutral(55);
  const placeholder = neutral(40);
  const filled = neutral(2);
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
    const borderless = mode === 'borderless';
    const underlined = mode === 'underline';
    const height = floating ? sizes(40, 48, 56) : sizes(24, 32, 40);
    const background = underlined ? transparent : borderless || mode === 'inside' ? filled : white;
    const edge = (intent: Intent) => ({
      rest: intent === 'neutral' ? (borderless ? transparent : stroke) : semantic(intent),
      ...(intent === 'neutral' && !borderless ? { hover: ref(strokeHover) } : {}),
      ...(intent === 'neutral' && !borderless
        ? {
            ...(mode === 'outline' ? { pressed: ref(strokeHover) } : {}),
            focus: ref(mode === 'outline' ? strokeHover : brand)
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
              typography: inputTypography,
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
            pill: floating ? sizes(20, 24, 28) : sizes(12, 16, 20)
          },
          paddingTop: mode === 'inside' ? sizes(6, 8, 10) : sizes(4, 6, 9),
          paddingBottom: mode === 'inside' ? sizes(2, 4, 6) : sizes(4, 6, 9),
          paddingLeft: sizes(8, 12, 16),
          paddingRight: sizes(8, 12, 16)
        },
        palettes: controlPalette
      },
      e4: {
        name: 'input',
        typography: inputTypography,
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
                      ? underline
                      : semantic(intent),
                  ...(intent === 'neutral' && !borderless ? { hover: ref(underlineHover) } : {}),
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
