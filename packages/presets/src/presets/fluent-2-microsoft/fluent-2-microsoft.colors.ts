import type {
  ComponentIntents,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors,
  SchemaSegments
} from '@kiskadee/core';
import neutralDark from './colors/neutral.dark';
import neutralLight from './colors/neutral.light';
import primaryUnique from './colors/primary.unique';

type Segment = 'default';

export const segments: SchemaSegments<Segment> = {
  default: {
    name: 'Default',
    mainColor: 'blue',
    themes: {
      light: {
        primary: primaryUnique,
        neutral: neutralLight
      },
      dark: {
        primary: primaryUnique,
        neutral: neutralDark
      }
    }
  }
};

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

export const primitiveColors = {
  blue: {
    default: { solid: { light: primaryUnique, dark: primaryUnique } }
  },
  black: {
    default: { solid: { light: neutralLight, dark: neutralDark } }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: { solid: { hue: 'blue', name: 'default' } },
    neutral: { solid: { hue: 'black', name: 'default' } }
  },
  dark: {
    primary: { solid: { hue: 'blue', name: 'default' } },
    neutral: { solid: { hue: 'black', name: 'default' } }
  }
} as const satisfies GlobalSemanticsByTheme;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  componentIntents
} as const satisfies SchemaColors;
