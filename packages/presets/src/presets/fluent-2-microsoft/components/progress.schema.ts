import type {
  KiskadeeTone,
  ProgressIntent,
  ProgressTrackColorMap,
  Schema,
  SolidColor
} from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ProgressComponent = NonNullable<NonNullable<Schema<never>['components']>['progress']>;
type Fluent2MicrosoftTheme = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type ProgressRole = `progress.${ProgressIntent}`;
type ProgressRestColor = {
  rest: SolidColor;
};
type ProgressProfileMap = Record<
  ProgressIntent,
  {
    medium: ProgressRestColor;
  }
>;

type CreateFluent2MicrosoftProgressSchemaArgs = {
  c: PresetColorGetter<'default'>;
};

const ON_SUBTLE_INDICATOR_TONES = {
  light: {
    neutral: 85,
    primary: 50,
    positive: 45,
    warning: 50,
    destructive: 45
  },
  dark: {
    neutral: 90,
    primary: 60,
    positive: 45,
    warning: 55,
    destructive: 40
  },
  darker: {
    neutral: 90,
    primary: 60,
    positive: 45,
    warning: 55,
    destructive: 40
  }
} as const satisfies Record<Fluent2MicrosoftTheme, Record<ProgressIntent, KiskadeeTone>>;

const ON_VIVID_INDICATOR_OFFSET = 8;
const ON_VIVID_TRACK_ALPHA = 18;

function rest(color: SolidColor): ProgressRestColor {
  return {
    rest: color
  };
}

function createProgressProfileMap(
  resolveColor: (intent: ProgressIntent) => SolidColor
): ProgressProfileMap {
  const createMediumProfile = (intent: ProgressIntent) => ({
    medium: rest(resolveColor(intent))
  });

  return {
    neutral: createMediumProfile('neutral'),
    primary: createMediumProfile('primary'),
    positive: createMediumProfile('positive'),
    warning: createMediumProfile('warning'),
    destructive: createMediumProfile('destructive')
  };
}

function toThemeShortcut(theme: Fluent2MicrosoftTheme): ThemeShortcut {
  return theme === 'light' ? 'l' : 'd';
}

function progressRole(intent: ProgressIntent): ProgressRole {
  return `progress.${intent}`;
}

function createOnSubtleTrackProfiles(
  theme: Fluent2MicrosoftTheme,
  c: PresetColorGetter<'default'>
): ProgressTrackColorMap {
  const themeShortcut = toThemeShortcut(theme);
  const tone = theme === 'light' ? 6 : 12;
  const trackColor = c('default', themeShortcut, 'neutral', tone);

  return {
    neutral: {
      medium: rest(trackColor)
    }
  };
}

function createOnSubtleIndicatorProfiles(
  theme: Fluent2MicrosoftTheme,
  c: PresetColorGetter<'default'>
): ProgressProfileMap {
  const themeShortcut = toThemeShortcut(theme);

  return createProgressProfileMap((intent) => {
    const tone = ON_SUBTLE_INDICATOR_TONES[theme][intent];
    return c('default', themeShortcut, progressRole(intent), tone);
  });
}

function createOnVividTrackProfiles(c: PresetColorGetter<'default'>): ProgressTrackColorMap {
  const trackColor = c('default', 'l', 'primitive.black.v1', 0, ON_VIVID_TRACK_ALPHA);

  return {
    neutral: {
      medium: rest(trackColor)
    }
  };
}

function createOnVividIndicatorProfiles(c: PresetColorGetter<'default'>): ProgressProfileMap {
  return createProgressProfileMap((intent) =>
    c.ref('default', 'l', progressRole(intent), 'subtle', ON_VIVID_INDICATOR_OFFSET)
  );
}

function createTrackContextPalettes(theme: Fluent2MicrosoftTheme, c: PresetColorGetter<'default'>) {
  return {
    onSubtle: {
      boxColor: createOnSubtleTrackProfiles(theme, c)
    },
    onVivid: {
      boxColor: createOnVividTrackProfiles(c)
    }
  };
}

function createIndicatorContextPalettes(
  theme: Fluent2MicrosoftTheme,
  c: PresetColorGetter<'default'>
) {
  return {
    onSubtle: {
      boxColor: createOnSubtleIndicatorProfiles(theme, c)
    },
    onVivid: {
      boxColor: createOnVividIndicatorProfiles(c)
    }
  };
}

export function createFluent2MicrosoftProgressSchema({
  c
}: CreateFluent2MicrosoftProgressSchemaArgs): ProgressComponent {
  return {
    elements: {
      e1: {
        name: 'progress-root'
      },
      e2: {
        name: 'progress-track',
        scales: {
          boxHeight: {
            's:md:1': 2,
            's:lg:1': 4
          },
          borderRadius: {
            pill: 9999
          }
        },
        palettes: {
          default: {
            light: createTrackContextPalettes('light', c),
            dark: createTrackContextPalettes('dark', c),
            darker: createTrackContextPalettes('darker', c)
          }
        }
      },
      e3: {
        name: 'progress-indicator',
        scales: {
          borderRadius: {
            pill: 9999
          }
        },
        palettes: {
          default: {
            light: createIndicatorContextPalettes('light', c),
            dark: createIndicatorContextPalettes('dark', c),
            darker: createIndicatorContextPalettes('darker', c)
          }
        }
      }
    }
  };
}
