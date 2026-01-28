import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import dynamicColor from '../dynamic.color';
import blackV1Dark from './colors/black.v1.dark';
import blackV1Light from './colors/black.v1.light';
import blackV2Dark from './colors/black.v2.dark';
import blackV2Light from './colors/black.v2.light';
import blueV1Dark from './colors/blue.v1.dark';
import blueV1Light from './colors/blue.v1.light';
import blueV2Light from './colors/blue.v2.light';
import redV1Dark from './colors/red.v1.dark';
import redV1Light from './colors/red.v1.light';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// NOTE: This preset is currently light-only. We keep `dark` keys present as placeholders.

export const primitiveColors = {
  blue: {
    v1: {
      solid: {
        light: blueV1Light,
        dark: blueV1Dark
      }
    },
    v2: {
      solid: {
        light: blueV2Light,
        dark: blackV2Dark
      }
    }
  },
  black: {
    v1: {
      solid: {
        light: blackV1Light,
        dark: blackV1Dark
      }
    },
    v2: {
      solid: {
        light: blackV2Light,
        dark: blackV2Dark
      }
    }
  },
  red: {
    v1: {
      solid: {
        light: redV1Light,
        dark: redV1Dark
      }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: 'primitive.blue.v1',
    neutral: 'primitive.blue.v2',
    redLike: 'primitive.red.v1'
  },
  dark: {
    primary: 'primitive.blue.v1',
    neutral: 'primitive.blue.v2',
    redLike: 'primitive.red.v1'
  }
} as const satisfies GlobalSemanticsByTheme;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 - Global semantics by segment (registry + optional overrides)
// -------------------------------------------------------------------------------------------------

/**
 * Segment registry + optional per-segment overrides for global semantics.
 *
 * - `default` is always present to register the primary segment.
 * - `themes` are optional and should be used only when a segment must override Layer 2 mappings.
 */
export const globalSemanticsBySegment = {
  default: {
    meta: {
      name: 'Material Design - Default (purple)'
    }
  }
  // dynamic: {
  //   meta: {
  //     name: 'Material Design - Dynamic'
  //   },
  //   themes: {
  //     light: {
  //       primary: 'primitive.purple.dynamic'
  //     },
  //     dark: {
  //       primary: 'primitive.purple.dynamic'
  //     }
  //   }
  // }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
