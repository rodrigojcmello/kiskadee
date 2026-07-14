import { invertKiskadeeHexScale } from '@kiskadee/core';
import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import { dynamicDark, dynamicLight } from '../dynamic.color.ts';
import neutralDark from './colors/neutral.dark.ts';
import neutralLight from './colors/neutral.light.ts';
import primaryUnique from './colors/primary.unique.ts';
import purpleLight from './colors/purple.light.ts';
import purple2Light from './colors/purple-2.light.ts';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Color Layer 1 - Primitive Colors
// -------------------------------------------------------------------------------------------------

export const primitiveColors = {
  blue: {
    v1: {
      kind: 'static',
      scales: { light: primaryUnique, dark: invertKiskadeeHexScale(primaryUnique) }
    },
    // Used by the `dynamic` segment override.
    dynamic: { kind: 'dynamic', scales: { light: dynamicLight, dark: dynamicDark } }
  },
  black: {
    v1: {
      kind: 'static',
      scales: { light: neutralLight, dark: neutralDark },
      gradient: {
        angle: 180,
        stops: [
          { primitive: 'primitive.black.v1', position: 0 },
          { primitive: 'primitive.black.v1', position: 100 }
        ]
      }
    }
  },
  purple: {
    v1: {
      // NOTE: Dark scale is currently mirrored from light as a placeholder.
      kind: 'static',
      scales: { light: purpleLight, dark: invertKiskadeeHexScale(purpleLight) },
      gradient: {
        angle: 180,
        stops: [
          { primitive: 'primitive.purple.v1', position: 0 },
          { primitive: 'primitive.purple.v2', position: 100 }
        ]
      }
    },
    // NOTE: Dark scale is currently mirrored from light as a placeholder.
    v2: {
      kind: 'static',
      scales: { light: purple2Light, dark: invertKiskadeeHexScale(purple2Light) }
    }
  }
} as const satisfies PrimitiveColors;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 - Global Semantics
// -------------------------------------------------------------------------------------------------

export const globalSemantics = {
  light: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' }
  },
  dark: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' }
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
  modern: {
    meta: {
      name: 'Modern'
    },
    themes: {
      light: {
        primary: { v1: 'primitive.purple.v1' }
      },
      dark: {
        primary: { v1: 'primitive.purple.v1' }
      }
    }
  },
  dynamic: {
    meta: {
      name: 'Dynamic'
    },
    themes: {
      light: {
        primary: { v1: 'primitive.blue.dynamic' }
      },
      dark: {
        primary: { v1: 'primitive.blue.dynamic' }
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
