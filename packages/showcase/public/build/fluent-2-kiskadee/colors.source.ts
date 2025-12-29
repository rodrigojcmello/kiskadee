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
    v1: {
      // NOTE: Dark scale is currently mirrored from light as a placeholder.
      solid: { light: purpleLight, dark: purpleLight },
      gradient: {
        angle: 180,
        stops: [
          { primitive: 'primitive.purple.v1', position: 0 },
          { primitive: 'primitive.purple.v2', position: 100 }
        ]
      }
    },
    // NOTE: Dark scale is currently mirrored from light as a placeholder.
    v2: { solid: { light: purple2Light, dark: purple2Light } }
  }
} as const satisfies PrimitiveColors;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 - Global Semantics
// -------------------------------------------------------------------------------------------------

export const globalSemantics = {
  light: {
    primary: 'primitive.purple.v1',
    neutral: 'primitive.black.v1'
  },
  dark: {
    primary: 'primitive.purple.v1',
    neutral: 'primitive.black.v1'
  }
} as const satisfies GlobalSemanticsByTheme;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 - Global semantics by segment (registry + optional overrides)
// -------------------------------------------------------------------------------------------------

/**
 * Segment registry + optional per-segment overrides for global semantics.
 *
 * - `default` is always present to register the primary segment.
 * - `themes` is optional and should be used only when a segment must override Layer 2 mappings.
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
        primary: 'primitive.blue.dynamic'
      },
      dark: {
        primary: 'primitive.blue.dynamic'
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
