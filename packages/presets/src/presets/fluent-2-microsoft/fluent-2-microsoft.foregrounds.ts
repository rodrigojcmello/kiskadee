import {
  type ForegroundProfile,
  type PrimitiveRole,
  primitive,
  type SchemaForegrounds
} from '@kiskadee/core';
import {
  absoluteCap,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from './fluent-2-microsoft.color.ts';

type CreateFluent2MicrosoftForegroundsArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const CHROMATIC_LOW_ALPHA = 68;
const CHROMATIC_LOWEST_ALPHA = 24;
const CHROMATIC_ON_VIVID_OFFSET = 4;
const CHROMATIC_ON_VIVID_LOW_ALPHA = 76;
const CHROMATIC_ON_VIVID_LOWEST_ALPHA = 40;

function createChromaticForegroundProfile(
  c: Fluent2MicrosoftColorResolver,
  role: PrimitiveRole
): ForegroundProfile {
  const onSubtle = (theme: 'l' | 'd') => {
    const offset = theme === 'l' ? 0 : 8;

    return {
      medium: { rest: c.resolve('default', theme, referenceColor(role, 'vivid', offset)) },
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
  const onVivid = {
    medium: {
      rest: c.resolve('default', 'l', referenceColor(role, 'subtle', CHROMATIC_ON_VIVID_OFFSET))
    },
    low: {
      rest: c.resolve(
        'default',
        'l',
        referenceColor(role, 'subtle', CHROMATIC_ON_VIVID_OFFSET, CHROMATIC_ON_VIVID_LOW_ALPHA)
      )
    },
    lowest: {
      rest: c.resolve(
        'default',
        'l',
        referenceColor(role, 'subtle', CHROMATIC_ON_VIVID_OFFSET, CHROMATIC_ON_VIVID_LOWEST_ALPHA)
      )
    }
  } as const;

  return {
    palettes: {
      default: {
        light: { onSubtle: onSubtle('l'), onVivid },
        dark: { onSubtle: onSubtle('d'), onVivid },
        darker: { onSubtle: onSubtle('d'), onVivid }
      }
    }
  };
}

export function createFluent2MicrosoftForegrounds({
  c
}: CreateFluent2MicrosoftForegroundsArgs): SchemaForegrounds {
  const lightOnSubtle = {
    medium: { rest: c.resolve('default', 'l', referenceColor('neutral', 'vivid')) },
    low: { rest: c.resolve('default', 'l', referenceColor('neutral', 'vivid', -7)) },
    lowest: { rest: c.resolve('default', 'l', referenceColor('neutral', 'vivid', -21)) }
  } as const;
  const darkOnSubtle = {
    medium: { rest: c.resolve('default', 'd', referenceColor('neutral', 'vivid', 3)) },
    low: { rest: c.resolve('default', 'd', referenceColor('neutral', 'vivid', -2)) },
    lowest: { rest: c.resolve('default', 'd', referenceColor('neutral', 'vivid', -11)) }
  } as const;
  const onVivid = (theme: 'l' | 'd') => ({
    medium: {
      rest: c.resolve('default', theme, absoluteCap(primitive('black', 'v1'), 'light'))
    },
    low: {
      rest: c.resolve('default', theme, absoluteCap(primitive('black', 'v1'), 'light', 68))
    },
    lowest: {
      rest: c.resolve('default', theme, absoluteCap(primitive('black', 'v1'), 'light', 24))
    }
  });

  return {
    profiles: {
      neutral: {
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
      },
      blue: createChromaticForegroundProfile(c, primitive('blue', 'v1')),
      red: createChromaticForegroundProfile(c, primitive('red', 'v1')),
      green: createChromaticForegroundProfile(c, primitive('green', 'v1')),
      purple: createChromaticForegroundProfile(c, primitive('purple', 'v1')),
      orange: createChromaticForegroundProfile(c, primitive('orange', 'v1')),
      yellow: createChromaticForegroundProfile(c, primitive('yellow', 'v1'))
    }
  };
}
