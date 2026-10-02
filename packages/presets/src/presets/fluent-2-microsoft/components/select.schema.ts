import type { Color, Schema, SelectElements, SelectMode } from '@kiskadee/core';
import type { Fluent2MicrosoftColorResolver } from '../fluent-2-microsoft.color.ts';
import {
  createFieldVisualRecipe,
  fieldTypography,
  fieldSizes as sizes
} from './field-visual-recipe.ts';

const ref = (color: Color) => ({ ref: color });
const neutral = <T>(states: T) => ({ neutral: { medium: states } });

export function createFluent2MicrosoftSelectSchema({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): NonNullable<Schema['components']['select']> {
  function themed(
    mode: SelectMode,
    theme: 'light' | 'dark' | 'darker',
    vivid: boolean
  ): SelectElements {
    const r = createFieldVisualRecipe(c, theme, vivid);
    const borderless = mode === 'borderless';
    const outline = mode === 'outline';
    const background = borderless ? r.borderlessSurface : r.transparent;
    const foreground = borderless && vivid ? r.onSurfaceForeground : r.foreground;
    const text = (color: Color, disabled = r.disabledText) =>
      r.palette({ textColor: neutral({ rest: color, disabled: ref(disabled) }) });
    const innerDisabled =
      borderless && vivid ? r.neutral(theme === 'light' ? 16 : 35) : r.disabledText;
    const stroke = borderless || !outline ? r.transparent : r.outlineStroke;
    const bottom = outline ? r.outlineIndicator : borderless ? r.transparent : r.underline;
    const bottomHover = outline ? r.outlineIndicatorHover : r.underlineHover;
    const controlScales = {
      boxHeight: sizes(24, 32, 40),
      borderRadius: { rounded: mode === 'underline' ? 0 : 4, square: 0, pill: sizes(12, 16, 20) },
      paddingTop: outline ? sizes(3, 5, 8) : sizes(4, 6, 9),
      paddingBottom: outline ? sizes(3, 5, 8) : sizes(4, 6, 9),
      paddingLeft: outline ? sizes(7, 11, 15) : sizes(8, 12, 16),
      paddingRight: outline ? sizes(7, 11, 15) : sizes(8, 12, 16)
    };
    const shellPalette = r.palette({
      boxColor: neutral({
        rest: background,
        ...(outline
          ? {
              hover: r.neutralControl.hoverBackground,
              focus: background,
              pressed: background
            }
          : {}),
        ...(mode === 'underline' || (borderless && vivid) ? {} : { disabled: r.transparent })
      }),
      borderColor: neutral({
        rest: stroke,
        focus: r.brand,
        disabled: borderless ? r.transparent : r.disabledStroke
      }),
      borderBottomColor: neutral({
        rest: bottom,
        ...(!borderless ? { hover: bottomHover, focus: bottom, pressed: bottom } : {}),
        disabled: borderless ? r.transparent : r.disabledStroke
      })
    });
    const innerScales = {
      borderRadius: controlScales.borderRadius,
      paddingTop: controlScales.paddingTop,
      paddingBottom: controlScales.paddingBottom,
      paddingLeft: controlScales.paddingLeft,
      paddingRight: controlScales.paddingRight,
      borderWidth: 0
    };
    const step = (name: string) => ({
      name,
      typography: fieldTypography,
      scales: innerScales,
      palettes: r.palette({
        boxColor: neutral({
          rest: r.transparent,
          hover: r.neutralControl.hoverBackground,
          disabled: r.transparent
        }),
        textColor: neutral({ rest: foreground, disabled: innerDisabled })
      })
    });
    return {
      e1: { name: 'root' },
      e2: {
        name: 'label',
        typography: fieldTypography,
        scales: { marginBottom: 4 },
        palettes: text(r.foreground)
      },
      e3: {
        name: 'control',
        decorations: { borderStyle: 'solid' },
        scales: {
          boxHeight: controlScales.boxHeight,
          borderWidth: outline ? 1 : 0,
          borderRadius: controlScales.borderRadius
        },
        palettes: shellPalette
      },
      e4: {
        name: 'trigger',
        decorations: { borderStyle: 'solid' },
        scales: innerScales,
        palettes: r.palette({
          boxColor: neutral({ rest: r.transparent }),
          borderColor: neutral({
            rest: r.transparent,
            focus: r.brand,
            disabled: ref(r.transparent)
          })
        })
      },
      e5: { name: 'value', typography: fieldTypography, palettes: text(foreground, innerDisabled) },
      e6: {
        name: 'chevron',
        scales: { boxWidth: sizes(12, 16, 20), boxHeight: sizes(12, 16, 20), marginLeft: 8 },
        palettes: text(foreground, innerDisabled)
      },
      e7: {
        name: 'indicator',
        scales: { boxHeight: 1 },
        palettes: r.palette({
          boxColor: neutral({
            rest: bottom,
            ...(!borderless ? { hover: ref(bottomHover) } : {}),
            focus: ref(r.brand),
            pressed: ref(r.brand),
            disabled: ref(borderless ? r.transparent : r.disabledStroke)
          })
        })
      },
      e8: step('previous'),
      e9: step('next'),
      e10: {
        name: 'message',
        typography: { 's:all': 'caption-medium' },
        scales: { marginTop: 4 },
        palettes: text(r.underline)
      },
      e11: {
        name: 'placeholder',
        typography: fieldTypography,
        palettes: text(
          `color-mix(in srgb, ${borderless && vivid ? r.onSurfaceForeground : r.placeholder} 62%, transparent)`,
          `color-mix(in srgb, ${innerDisabled} 62%, transparent)`
        )
      },
      e13: {
        name: 'list-positioner',
        scales: {
          marginTop: 8,
          paddingTop: 8,
          paddingRight: 8,
          paddingBottom: 8,
          paddingLeft: 8
        }
      },
      e12: {
        name: 'divider',
        separator: { 's:all': 'subtle' },
        scales: { boxHeight: sizes(16, 24, 32) }
      }
    };
  }
  function elements(mode: SelectMode): SelectElements {
    const result = themed(mode, 'light', false);
    for (const theme of ['light', 'dark', 'darker'] as const) {
      for (const vivid of [false, true]) {
        const source = themed(mode, theme, vivid);
        for (const key of Object.keys(source) as (keyof SelectElements)[]) {
          if (key === 'e1' || key === 'e12' || key === 'e13') continue;
          const target = result[key];
          const palette = source[key]?.palettes?.default?.[theme];
          if (!target || !palette) continue;
          target.palettes = {
            default: {
              ...target.palettes?.default,
              [theme]: { ...target.palettes?.default?.[theme], ...palette }
            }
          };
        }
      }
    }
    return result;
  }
  return {
    options: {
      variant: 'standard',
      mode: 'outline',
      focusIndicator: 'underline',
      focusRingColorSource: 'component',
      density: { compact: 's:md:1', regular: 's:md:1', spacious: 's:lg:1' }
    },
    variants: {
      standard: {
        modes: {
          outline: {
            options: { focusIndicator: 'underline', focusRingColorSource: 'component' },
            elements: elements('outline')
          },
          underline: {
            options: { focusIndicator: 'underline', focusRingColorSource: 'component' },
            elements: elements('underline')
          },
          borderless: {
            options: { focusIndicator: 'underline', focusRingColorSource: 'component' },
            elements: elements('borderless')
          }
        }
      }
    }
  };
}
