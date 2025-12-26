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
    v1: { solid: { light: primaryUnique, dark: primaryUnique } }
  },
  black: {
    v1: { solid: { light: neutralLight, dark: neutralDark } }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: { solid: { hue: 'blue', name: 'v1' } },
    neutral: { solid: { hue: 'black', name: 'v1' } }
  },
  dark: {
    primary: { solid: { hue: 'blue', name: 'v1' } },
    neutral: { solid: { hue: 'black', name: 'v1' } }
  }
} as const satisfies GlobalSemanticsByTheme;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  componentIntents
} as const satisfies SchemaColors;
