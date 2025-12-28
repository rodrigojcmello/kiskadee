import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import dynamicColor from '../dynamic.color';
import neutralDark from './colors/neutral.dark';
import neutralLight from './colors/neutral.light';
import primaryUnique from './colors/primary.unique';
import purpleLight from './colors/purple.light';
import purple2Light from './colors/purple-2.light';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Color Layer 1 - Primitive Colors
// -------------------------------------------------------------------------------------------------

export const primitiveColors = {
  blue: {
    v1: { solid: { light: primaryUnique, dark: primaryUnique } },
    // Used by the `dynamic` segment override.
    dynamic: { solid: { light: dynamicColor, dark: dynamicColor } }
  },
  black: {
    v1: { solid: { light: neutralLight, dark: neutralDark } }
  },
  purple: {
    v1: { solid: { light: purpleLight } },
    v2: { solid: { light: purple2Light } }
  }
} as const satisfies PrimitiveColors;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 - Global Semantics
// -------------------------------------------------------------------------------------------------

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

// -------------------------------------------------------------------------------------------------
// Color Layer 2 (optional) - Global semantics overrides by segment
// -------------------------------------------------------------------------------------------------

/**
 * Optional per-segment overrides for global semantics.
 *
 * Most presets will keep this empty. When a segment (brand/product) needs a different
 * primitive mapping for a semantic key (e.g. `primary`), add it here.
 */
export const globalSemanticsBySegment = {
  default: {
    meta: {
      name: 'Default'
    }
  },
  dynamic: {
    meta: {
      name: 'Dynamic'
    },
    themes: {
      light: {
        primary: { solid: { hue: 'blue', name: 'dynamic' } }
      },
      dark: {
        primary: { solid: { hue: 'blue', name: 'dynamic' } }
      }
    }
  }
} as const satisfies GlobalSemanticsBySegment;

// -------------------------------------------------------------------------------------------------
// Color Layer 3 - Component Intents
// -------------------------------------------------------------------------------------------------

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  }
} as const satisfies ComponentIntents;

// ----------------------------------------------------------------------------

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
