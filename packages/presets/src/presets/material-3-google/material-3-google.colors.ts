import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import dynamicColor from '../dynamic.color';
import blackLight from './colors/black.v1.light';
import purpleV1Light from './colors/purple.v1.light';
import purpleV2Light from './colors/purple.v2.light';
import redV1Light from './colors/red.v1.light';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// NOTE: This preset is currently light-only. We keep `dark` keys present as placeholders.

export const primitiveColors = {
  purple: {
    v1: {
      solid: {
        light: purpleV1Light,
        dark: purpleV1Light
      }
    },
    v2: {
      solid: {
        light: purpleV2Light,
        dark: purpleV2Light
      }
    },
    // Used by the `dynamic` segment override.
    dynamic: {
      solid: {
        light: dynamicColor,
        dark: dynamicColor
      }
    }
  },
  black: {
    v1: {
      solid: {
        light: blackLight,
        dark: blackLight
      }
    }
  },
  red: {
    v1: {
      solid: {
        light: redV1Light,
        dark: redV1Light
      }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: 'primitive.purple.v1',
    neutral: 'primitive.black.v1',
    redLike: 'primitive.red.v1'
  },
  dark: {
    primary: 'primitive.purple.v1',
    neutral: 'primitive.black.v1',
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
  },
  dynamic: {
    meta: {
      name: 'Material Design - Dynamic'
    },
    themes: {
      light: {
        primary: 'primitive.purple.dynamic'
      },
      dark: {
        primary: 'primitive.purple.dynamic'
      }
    }
  }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'primitive.purple.v2'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
