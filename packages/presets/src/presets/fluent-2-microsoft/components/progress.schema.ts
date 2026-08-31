import type { ProgressIntent, ProgressTrackColorMap, Schema, SolidColor } from '@kiskadee/core';
import { primitive } from '@kiskadee/core';
import {
  absoluteCap,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

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
  c: Fluent2MicrosoftColorResolver;
};

const ON_SUBTLE_INDICATOR_OFFSETS = {
  light: {
    neutral: 0,
    primary: 0,
    positive: 0,
    warning: 7,
    destructive: 0
  },
  dark: {
    neutral: 0,
    primary: 4,
    positive: 1,
    warning: 3,
    destructive: 0
  },
  darker: {
    neutral: 0,
    primary: 4,
    positive: 1,
    warning: 3,
    destructive: 0
  }
} as const satisfies Record<Fluent2MicrosoftTheme, Record<ProgressIntent, number>>;

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
  c: Fluent2MicrosoftColorResolver
): ProgressTrackColorMap {
  const themeShortcut = toThemeShortcut(theme);
  const offset = theme === 'light' ? 2 : 7;
  const trackColor = c.resolve(
    'default',
    themeShortcut,
    referenceColor('neutral', 'subtle', offset)
  );

  return {
    neutral: {
      medium: rest(trackColor)
    }
  };
}

function createOnSubtleIndicatorProfiles(
  theme: Fluent2MicrosoftTheme,
  c: Fluent2MicrosoftColorResolver
): ProgressProfileMap {
  const themeShortcut = toThemeShortcut(theme);

  return createProgressProfileMap((intent) => {
    const offset = ON_SUBTLE_INDICATOR_OFFSETS[theme][intent];
    return c.resolve(
      'default',
      themeShortcut,
      referenceColor(progressRole(intent), 'vivid', offset)
    );
  });
}

function createOnVividTrackProfiles(c: Fluent2MicrosoftColorResolver): ProgressTrackColorMap {
  const trackColor = c.resolve(
    'default',
    'l',
    absoluteCap(primitive('black', 'v1'), 'light', ON_VIVID_TRACK_ALPHA)
  );

  return {
    neutral: {
      medium: rest(trackColor)
    }
  };
}

function createOnVividIndicatorProfiles(c: Fluent2MicrosoftColorResolver): ProgressProfileMap {
  return createProgressProfileMap((intent) =>
    c.resolve(
      'default',
      'l',
      referenceColor(progressRole(intent), 'subtle', ON_VIVID_INDICATOR_OFFSET)
    )
  );
}

function createTrackContextPalettes(
  theme: Fluent2MicrosoftTheme,
  c: Fluent2MicrosoftColorResolver
) {
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
  c: Fluent2MicrosoftColorResolver
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
