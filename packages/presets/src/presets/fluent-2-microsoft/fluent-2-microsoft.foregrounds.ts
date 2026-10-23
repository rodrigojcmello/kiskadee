import {
  type ForegroundProfile,
  normalizeHexColor,
  type PrimitiveRole,
  primitive,
  type SchemaForegrounds,
  type SolidColor,
  withAlpha
} from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from './fluent-2-microsoft.color.ts';

type CreateFluent2MicrosoftForegroundsArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const CHROMATIC_MEDIUM_ALPHA = 68;
const CHROMATIC_LOW_ALPHA = 46;
const CHROMATIC_LOWEST_ALPHA = 24;
const CHROMATIC_ON_VIVID_MEDIUM_ALPHA = 76;
const CHROMATIC_ON_VIVID_LOW_ALPHA = 58;
const CHROMATIC_ON_VIVID_LOWEST_ALPHA = 40;
const STANDARD_ON_VIVID_LIGHT_OFFSET = 8;
const STANDARD_ON_VIVID_DARK_OFFSET = -2;
const DEEP_ON_SUBTLE_LIGHT_TONE = 65;
const DEEP_ON_SUBTLE_DARK_TONE = 75;
const DEEP_ON_VIVID_OFFSET = 2;
const FOREGROUND_PENDING_VISIBILITY = 70;

function applyVisibility(color: SolidColor, visibility: number): SolidColor {
  if (!color.startsWith('#')) return withAlpha(color, visibility);
  const normalized = normalizeHexColor(color);
  const sourceVisibility =
    normalized.length === 9 ? (Number.parseInt(normalized.slice(7, 9), 16) / 255) * 100 : 100;
  return withAlpha(normalized, (sourceVisibility * visibility) / 100);
}

function createChromaticForegroundProfile(
  c: Fluent2MicrosoftColorResolver,
  role: PrimitiveRole | 'primary'
): ForegroundProfile {
  const onSubtle = (theme: 'l' | 'd') => {
    const offset = theme === 'l' ? 0 : 8;
    const high = c.resolve('default', theme, referenceColor(role, 'vivid', offset));

    return {
      high: {
        rest: high,
        hover:
          theme === 'l'
            ? c.resolve('default', theme, referenceColor(role, 'vivid', offset + 1))
            : high,
        pressed:
          theme === 'l'
            ? c.resolve('default', theme, referenceColor(role, 'vivid', offset + 3))
            : high,
        pending: applyVisibility(high, FOREGROUND_PENDING_VISIBILITY)
      },
      medium: {
        rest: c.resolve(
          'default',
          theme,
          referenceColor(role, 'vivid', offset, CHROMATIC_MEDIUM_ALPHA)
        )
      },
      low: {
        rest: c.resolve(
          'default',
          theme,
          referenceColor(role, 'vivid', offset, CHROMATIC_LOW_ALPHA)
        )
      },
      lowest: {
        rest: c.resolve(
          'default',
          theme,
          referenceColor(role, 'vivid', offset, CHROMATIC_LOWEST_ALPHA)
        )
      }
    } as const;
  };
  const onVivid = (theme: 'light' | 'dark' | 'darker') => {
    const offset =
      theme === 'light' ? STANDARD_ON_VIVID_LIGHT_OFFSET : STANDARD_ON_VIVID_DARK_OFFSET;

    return {
      high: { rest: c.resolve('default', 'l', referenceColor(role, 'subtle', offset)) },
      medium: {
        rest: c.resolve(
          'default',
          'l',
          referenceColor(role, 'subtle', offset, CHROMATIC_ON_VIVID_MEDIUM_ALPHA)
        )
      },
      low: {
        rest: c.resolve(
          'default',
          'l',
          referenceColor(role, 'subtle', offset, CHROMATIC_ON_VIVID_LOW_ALPHA)
        )
      },
      lowest: {
        rest: c.resolve(
          'default',
          'l',
          referenceColor(role, 'subtle', offset, CHROMATIC_ON_VIVID_LOWEST_ALPHA)
        )
      }
    } as const;
  };

  return {
    palettes: {
      default: {
        light: { onSubtle: onSubtle('l'), onVivid: onVivid('light') },
        dark: { onSubtle: onSubtle('d'), onVivid: onVivid('dark') },
        darker: { onSubtle: onSubtle('d'), onVivid: onVivid('darker') }
      }
    }
  };
}

function createDeepChromaticForegroundProfile(
  c: Fluent2MicrosoftColorResolver,
  role: PrimitiveRole | 'primary'
): ForegroundProfile {
  const onSubtle = (theme: 'l' | 'd') => {
    const tone = theme === 'l' ? DEEP_ON_SUBTLE_LIGHT_TONE : DEEP_ON_SUBTLE_DARK_TONE;
    const high = c.resolve('default', theme, exactColor(role, tone, 'global.foreground.deep'));

    return {
      high: {
        rest: high,
        pending: applyVisibility(high, FOREGROUND_PENDING_VISIBILITY)
      },
      medium: {
        rest: c.resolve(
          'default',
          theme,
          exactColor(role, tone, 'global.foreground.deep', CHROMATIC_MEDIUM_ALPHA)
        )
      },
      low: {
        rest: c.resolve(
          'default',
          theme,
          exactColor(role, tone, 'global.foreground.deep', CHROMATIC_LOW_ALPHA)
        )
      },
      lowest: {
        rest: c.resolve(
          'default',
          theme,
          exactColor(role, tone, 'global.foreground.deep', CHROMATIC_LOWEST_ALPHA)
        )
      }
    } as const;
  };
  const onVivid = () => {
    const offset = DEEP_ON_VIVID_OFFSET;
    const high = c.resolve('default', 'l', referenceColor(role, 'subtle', offset));

    return {
      high: {
        rest: high,
        pending: applyVisibility(high, FOREGROUND_PENDING_VISIBILITY)
      },
      medium: {
        rest: c.resolve(
          'default',
          'l',
          referenceColor(role, 'subtle', offset, CHROMATIC_ON_VIVID_MEDIUM_ALPHA)
        )
      },
      low: {
        rest: c.resolve(
          'default',
          'l',
          referenceColor(role, 'subtle', offset, CHROMATIC_ON_VIVID_LOW_ALPHA)
        )
      },
      lowest: {
        rest: c.resolve(
          'default',
          'l',
          referenceColor(role, 'subtle', offset, CHROMATIC_ON_VIVID_LOWEST_ALPHA)
        )
      }
    } as const;
  };

  return {
    palettes: {
      default: {
        light: { onSubtle: onSubtle('l'), onVivid: onVivid() },
        dark: { onSubtle: onSubtle('d'), onVivid: onVivid() },
        darker: { onSubtle: onSubtle('d'), onVivid: onVivid() }
      }
    }
  };
}

export function createFluent2MicrosoftForegrounds({
  c
}: CreateFluent2MicrosoftForegroundsArgs): SchemaForegrounds {
  const lightOnSubtle = {
    high: (() => {
      const rest = c.resolve('default', 'l', referenceColor('neutral', 'vivid'));
      return {
        rest,
        hover: c.resolve('default', 'l', referenceColor('neutral', 'vivid', 1)),
        pressed: c.resolve('default', 'l', referenceColor('neutral', 'vivid', 3)),
        pending: applyVisibility(rest, FOREGROUND_PENDING_VISIBILITY)
      };
    })(),
    medium: {
      rest: c.resolve('default', 'l', referenceColor('neutral', 'vivid', -7)),
      pending: applyVisibility(
        c.resolve('default', 'l', referenceColor('neutral', 'vivid', -7)),
        FOREGROUND_PENDING_VISIBILITY
      ),
      disabled: c.resolve('default', 'l', exactColor('neutral', 20, 'global.foreground.states', 82))
    },
    low: { rest: c.resolve('default', 'l', referenceColor('neutral', 'vivid', -14)) },
    lowest: {
      rest: c.resolve('default', 'l', referenceColor('neutral', 'vivid', -21)),
      disabled: c.resolve('default', 'l', exactColor('neutral', 16, 'global.foreground.states'))
    }
  } as const;
  const darkOnSubtle = {
    high: (() => {
      const rest = c.resolve('default', 'd', referenceColor('neutral', 'vivid', 3));
      return {
        rest,
        hover: rest,
        pressed: rest,
        pending: applyVisibility(rest, FOREGROUND_PENDING_VISIBILITY)
      };
    })(),
    medium: {
      rest: c.resolve('default', 'd', referenceColor('neutral', 'vivid', -2)),
      pending: applyVisibility(
        c.resolve('default', 'd', referenceColor('neutral', 'vivid', -2)),
        FOREGROUND_PENDING_VISIBILITY
      ),
      disabled: c.resolve('default', 'd', exactColor('neutral', 35, 'global.foreground.states'))
    },
    low: { rest: c.resolve('default', 'd', referenceColor('neutral', 'vivid', -6)) },
    lowest: {
      rest: c.resolve('default', 'd', referenceColor('neutral', 'vivid', -11)),
      disabled: c.resolve('default', 'd', exactColor('neutral', 35, 'global.foreground.states'))
    }
  } as const;
  const onVivid = (theme: 'l' | 'd') => {
    const high = c.resolve('default', theme, absoluteCap(primitive('black', 'v1'), 'light'));
    const disabled = c.resolve(
      'default',
      theme,
      absoluteCap(primitive('black', 'v1'), 'light', 40)
    );
    return {
      high: {
        rest: high,
        hover: high,
        pressed: high,
        pending: applyVisibility(high, FOREGROUND_PENDING_VISIBILITY),
        disabled
      },
      medium: {
        rest: c.resolve('default', theme, absoluteCap(primitive('black', 'v1'), 'light', 68)),
        disabled
      },
      low: {
        rest: c.resolve(
          'default',
          theme,
          absoluteCap(primitive('black', 'v1'), 'light', CHROMATIC_LOW_ALPHA)
        )
      },
      lowest: {
        rest: c.resolve('default', theme, absoluteCap(primitive('black', 'v1'), 'light', 24)),
        disabled
      }
    };
  };

  return {
    profiles: {
      neutral: {
        standard: {
          palettes: {
            default: {
              light: {
                onSubtle: lightOnSubtle,
                onVivid: onVivid('l')
              },
              dark: {
                onSubtle: darkOnSubtle,
                onVivid: onVivid('d')
              },
              darker: {
                onSubtle: darkOnSubtle,
                onVivid: onVivid('d')
              }
            }
          }
        }
      },
      blue: {
        standard: createChromaticForegroundProfile(c, 'primary'),
        deep: createDeepChromaticForegroundProfile(c, 'primary')
      },
      red: {
        standard: createChromaticForegroundProfile(c, primitive('red', 'v1')),
        deep: createDeepChromaticForegroundProfile(c, primitive('red', 'v1'))
      },
      green: {
        standard: createChromaticForegroundProfile(c, primitive('green', 'v1')),
        deep: createDeepChromaticForegroundProfile(c, primitive('green', 'v1'))
      },
      purple: {
        standard: createChromaticForegroundProfile(c, primitive('purple', 'v1')),
        deep: createDeepChromaticForegroundProfile(c, primitive('purple', 'v1'))
      },
      orange: {
        standard: createChromaticForegroundProfile(c, primitive('orange', 'v1')),
        deep: createDeepChromaticForegroundProfile(c, primitive('orange', 'v1'))
      },
      yellow: {
        standard: createChromaticForegroundProfile(c, primitive('yellow', 'v1')),
        deep: createDeepChromaticForegroundProfile(c, primitive('yellow', 'v1'))
      }
    }
  };
}
