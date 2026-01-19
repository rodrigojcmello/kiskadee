import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import dynamicColor from '../dynamic.color';
import blackLight from './colors/black.light';
import purpleV1Light from './colors/purple.v1.light';

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
  }
} as const satisfies PrimitiveColors;

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
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
