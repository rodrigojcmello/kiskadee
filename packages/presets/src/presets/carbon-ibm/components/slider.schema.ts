import { type Color, primitive, type Schema } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type SliderComponent = NonNullable<Schema<never>['components']['slider']>;
type Theme = 'light' | 'dark' | 'darker';
type Part =
  | 'text'
  | 'label'
  | 'rail'
  | 'fill'
  | 'thumb'
  | 'hidden'
  | 'indicator'
  | 'mark'
  | 'inverse';

function states(rest: Color, deltas: { focus?: Color; pressed?: Color; disabled?: Color } = {}) {
  return {
    rest,
    ...Object.fromEntries(
      Object.entries(deltas)
        .filter(([, color]) => color !== rest)
        .map(([state, color]) => [state, { ref: color }])
    )
  };
}

export function createCarbonIbmSliderSchema({ c }: { c: CarbonIbmColorResolver }): SliderComponent {
  const themePalette = (theme: Theme, part: Part) => {
    const token = (name: Parameters<typeof tokenColor>[2]) => tokenColor(c, theme, name);
    const cap = (alpha = 100) =>
      c.resolve(
        'default',
        theme === 'light' ? 'l' : 'd',
        absoluteCap(primitive('black', 'v1'), 'light', alpha)
      );
    const create = (onVivid: boolean) => {
      const disabled = onVivid ? cap(35) : token('border-disabled');
      const disabledText = onVivid ? cap(35) : token('text-disabled');
      const interactive = onVivid ? cap() : tokenColor(c, theme, 'interactive', 'slider.primary');
      const color =
        part === 'text' || part === 'label'
          ? states(onVivid ? cap() : token(part === 'label' ? 'text-secondary' : 'text-primary'), {
              disabled: disabledText
            })
          : part === 'rail'
            ? states(onVivid ? cap(24) : token('border-subtle-01'), { disabled })
            : part === 'fill'
              ? states(onVivid ? cap() : token('border-inverse'), {
                  focus: interactive,
                  pressed: interactive,
                  disabled
                })
              : part === 'thumb'
                ? states(onVivid ? cap() : token('icon-primary'), {
                    pressed: interactive,
                    disabled
                  })
                : part === 'hidden'
                  ? states(cap(0))
                  : part === 'mark'
                    ? states(onVivid ? cap() : token('border-inverse'), { disabled })
                    : part === 'inverse' && onVivid
                      ? states(
                          c.resolve(
                            'default',
                            theme === 'light' ? 'l' : 'd',
                            absoluteCap(primitive('black', 'v1'), 'dark')
                          )
                        )
                      : states(token('text-inverse'));
      const map = { neutral: { medium: color }, primary: { medium: color } };
      if (part === 'indicator')
        return {
          boxColor: {
            neutral: { medium: states(token('background-inverse')) },
            primary: { medium: states(token('background-inverse')) }
          },
          textColor: map
        };
      return {
        [part === 'text' || part === 'label' || part === 'inverse' ? 'textColor' : 'boxColor']: map
      };
    };
    return { onSubtle: create(false), onVivid: create(true) };
  };
  const palettes = (part: Part) => ({
    default: {
      light: themePalette('light', part),
      dark: themePalette('dark', part),
      darker: themePalette('darker', part)
    }
  });
  const radius = { rounded: 0, pill: 0, square: 0 };
  return {
    options: {
      density: { regular: 's:md:1' },
      variant: 'standard',
      valueDisplay: 'tooltip',
      marks: 'none',
      edgeMarks: 'exclude',
      markLabelPlacement: 'adaptive',
      edgeLabelPlacement: 'adaptive'
    },
    variants: {
      standard: {
        options: { mode: 'base' },
        modes: {
          base: {
            elements: {
              e1: { name: 'slider-root' },
              e2: {
                name: 'slider-field-label',
                typography: { 's:all': 'label-small' },
                palettes: palettes('label')
              },
              e3: {
                name: 'slider-value-summary',
                typography: { 's:all': 'body-medium' },
                scales: { marginLeft: 16 },
                palettes: palettes('text')
              },
              e4: {
                name: 'slider-control-row',
                scales: { boxHeight: 14, marginTop: 8, paddingTop: 16, paddingBottom: 16 }
              },
              e5: {
                name: 'slider-endpoint',
                scales: { marginRight: 8, marginLeft: 8, paddingLeft: 0 }
              },
              e6: {
                name: 'slider-endpoint-icon',
                iconSize: { 's:all': 's:sm:1' },
                palettes: palettes('text')
              },
              e7: {
                name: 'slider-endpoint-label',
                typography: { 's:all': 'body-medium' },
                palettes: palettes('text')
              },
              e8: {
                name: 'slider-track',
                scales: { boxWidth: 200, boxHeight: 4, borderWidth: 0, borderRadius: radius },
                palettes: palettes('rail')
              },
              e9: {
                name: 'slider-active-track',
                scales: { boxHeight: 4, borderWidth: 0, borderRadius: radius },
                palettes: palettes('fill')
              },
              e10: {
                name: 'slider-thumb',
                scales: {
                  boxWidth: 14,
                  boxHeight: 14,
                  borderWidth: 0,
                  borderRadius: { rounded: 7, pill: 7, square: 7 }
                },
                palettes: palettes('thumb')
              },
              e11: {
                name: 'slider-thumb-inner',
                scales: { boxWidth: 0, boxHeight: 0, borderWidth: 0, borderRadius: radius },
                palettes: palettes('hidden')
              },
              e14: {
                name: 'slider-value-indicator',
                typography: { 's:all': 'body-medium' },
                scales: {
                  boxHeight: 24,
                  marginTop: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 0,
                  paddingBottom: 0,
                  borderWidth: 0,
                  borderRadius: radius
                },
                palettes: palettes('indicator')
              },
              e15: {
                name: 'slider-mark',
                scales: { boxWidth: 1, boxHeight: 4, borderWidth: 0, borderRadius: radius },
                palettes: palettes('mark')
              },
              e16: {
                name: 'slider-mark-label',
                typography: { 's:all': 'label-small' },
                scales: { marginTop: 8, marginBottom: 8 },
                palettes: palettes('text')
              },
              e17: {
                name: 'slider-helper-text',
                typography: { 's:all': 'label-small' },
                scales: { marginTop: 16 },
                palettes: palettes('label')
              },
              e19: {
                name: 'slider-thumb-icon',
                iconSize: { 's:all': 's:sm:3' },
                palettes: palettes('inverse')
              },
              e20: {
                name: 'slider-optional-indicator',
                typography: { 's:all': 'label-small' },
                scales: { marginLeft: 4 },
                palettes: palettes('label')
              }
            }
          }
        }
      }
    }
  };
}
