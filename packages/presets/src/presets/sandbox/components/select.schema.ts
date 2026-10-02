import type { Schema, SelectElements } from '@kiskadee/core';
import primary from '../colors/b.blue.v1.ts';
import { sandboxTypographyReferences as typography } from '../sandbox.typography.ts';

// Experimental recipe based on the Showcase control, not an official Fluent variant.
export function createSandboxSelectSchema(): NonNullable<Schema['components']['select']> {
  const sizes = (sm: number, md: number, lg: number) => ({
    's:sm:1': sm,
    's:md:1': md,
    's:lg:1': lg
  });
  const palette = (properties: Record<string, unknown>) => ({
    default: {
      light: { onSubtle: properties, onVivid: properties },
      dark: { onSubtle: properties, onVivid: properties }
    }
  });
  const color = (rest: string, hover?: string, disabled?: string, focus?: string) => ({
    neutral: {
      medium: {
        rest,
        ...(hover ? { hover } : {}),
        ...(focus ? { focus } : {}),
        ...(disabled ? { disabled: { ref: disabled } } : {})
      }
    }
  });
  // The control keeps a pale fill in both themes, so its focus contrast uses the Light asset.
  const focusContour = primary.scales.light[40];
  const outerText = {
    default: {
      light: {
        onSubtle: { textColor: color('#174d88', undefined, '#a6adb8') },
        onVivid: { textColor: color('#ffffff', undefined, '#ffffff66') }
      },
      dark: {
        onSubtle: { textColor: color('#ffffff', undefined, '#ffffff66') },
        onVivid: { textColor: color('#ffffff', undefined, '#ffffff66') }
      }
    }
  };
  const radius = { rounded: 9, square: 0, pill: sizes(12, 16, 20) };
  const modes = Object.fromEntries(
    (['outline', 'underline', 'borderless'] as const).map((mode) => {
      const elements: SelectElements = {
        e1: { name: 'root' },
        e2: {
          name: 'label',
          typography: typography.optionalIndicator,
          scales: { marginBottom: 6 },
          palettes: outerText
        },
        e3: {
          name: 'control',
          decorations: { borderStyle: 'solid' },
          scales: {
            boxHeight: sizes(32, 40, 48),
            borderWidth: mode === 'borderless' ? 0 : 1,
            borderRadius: { rounded: 12, square: 0, pill: sizes(16, 20, 24) },
            paddingTop: mode === 'underline' ? 0 : 3,
            paddingBottom: mode === 'underline' ? 0 : 3,
            paddingLeft: 3,
            paddingRight: 3
          },
          palettes: palette({
            boxColor: color(mode === 'outline' ? '#ffffff8f' : '#fffffff5'),
            borderColor: color(
              mode === 'borderless' ? '#ffffff00' : '#00000014',
              undefined,
              undefined,
              focusContour
            )
          })
        },
        e4: {
          name: 'trigger',
          decorations: { borderStyle: 'solid' },
          scales: {
            borderWidth: mode === 'outline' ? 2 : 0,
            borderRadius: radius,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 0,
            paddingBottom: 0
          },
          palettes: palette({
            boxColor: color(mode === 'outline' ? '#fffffff5' : '#ffffff00', '#ffffff'),
            borderColor: color(
              mode === 'outline' ? '#3b82f6' : '#ffffff00',
              undefined,
              '#a6adb8',
              focusContour
            ),
            ...(mode === 'outline'
              ? { borderBottomColor: color('#3b82f6', undefined, '#a6adb8', focusContour) }
              : {})
          })
        },
        e5: {
          name: 'value',
          typography: typography.bodyStrong,
          palettes: palette({ textColor: color('#174d88', undefined, '#a6adb8') })
        },
        e6: {
          name: 'chevron',
          scales: { boxWidth: 16, boxHeight: 16, marginLeft: 8 },
          palettes: palette({ textColor: color('#00000099', undefined, '#a6adb8') })
        },
        e8: {
          name: 'previous',
          typography: typography.body,
          scales: {
            boxWidth: sizes(24, 32, 40),
            borderWidth: 0,
            borderRadius: radius,
            marginRight: 3
          },
          palettes: palette({
            boxColor: color('#ffffff00', '#ffffffb8'),
            textColor: { neutral: { medium: { rest: '#00000099', disabled: '#a6adb8' } } }
          })
        },
        e9: {
          name: 'next',
          typography: typography.body,
          scales: {
            boxWidth: sizes(24, 32, 40),
            borderWidth: 0,
            borderRadius: radius,
            marginLeft: 3
          },
          palettes: palette({
            boxColor: color('#ffffff00', '#ffffffb8'),
            textColor: { neutral: { medium: { rest: '#00000099', disabled: '#a6adb8' } } }
          })
        },
        e10: {
          name: 'message',
          typography: typography.body,
          scales: { marginTop: 4 },
          palettes: outerText
        },
        e11: {
          name: 'placeholder',
          typography: typography.bodyStrong,
          palettes: palette({
            textColor: color(
              'color-mix(in srgb, #174d88 62%, transparent)',
              undefined,
              'color-mix(in srgb, #a6adb8 62%, transparent)'
            )
          })
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
          scales: { boxHeight: sizes(24, 32, 40) }
        }
      };
      elements.e7 = {
        name: 'indicator',
        scales: { boxHeight: mode === 'underline' ? 1 : 0 },
        palettes: palette({
          boxColor: {
            neutral: {
              medium: {
                rest: mode === 'underline' ? '#3b82f6' : '#ffffff00',
                focus: { ref: focusContour },
                disabled: { ref: '#a6adb8' }
              }
            }
          }
        })
      };
      return [
        mode,
        {
          options: {
            focusIndicator:
              mode === 'outline' ? 'inner' : mode === 'underline' ? 'underline' : 'outer',
            focusRingColorSource: mode === 'borderless' ? 'global' : 'component'
          },
          elements
        }
      ];
    })
  ) as NonNullable<Schema['components']['select']>['variants']['standard']['modes'];
  return {
    options: {
      variant: 'standard',
      mode: 'outline',
      focusIndicator: 'inner',
      focusRingColorSource: 'component',
      density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' }
    },
    variants: { standard: { modes } }
  };
}
