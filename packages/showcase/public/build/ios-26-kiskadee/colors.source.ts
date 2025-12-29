import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors
} from '@kiskadee/core';
import dynamicColor from '../dynamic.color';
import neutralLight from './colors/neutral.light';
import primaryLight from './colors/primary.light';
import redLikeLight from './colors/red-like.light';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

/**
 * Layer 1: primitive color assets.
 *
 * NOTE: For now, we reuse light scales for `d` as a placeholder.
 */
export const primitiveColors = {
  blue: {
    v1: { solid: { light: primaryLight, dark: primaryLight } },
    // `dynamic` segment override uses `dynamic`.
    dynamic: { solid: { light: dynamicColor, dark: dynamicColor } }
  },
  black: {
    v1: { solid: { light: neutralLight, dark: neutralLight } }
  },
  red: {
    v1: { solid: { light: redLikeLight, dark: redLikeLight } }
  }
} as const satisfies PrimitiveColors;

type GlobalSemanticKey = 'primary' | 'neutral' | 'redLike';

export const globalSemantics = {
  light: {
    primary: 'primitive.blue.v1',
    neutral: 'primitive.black.v1',
    redLike: 'primitive.red.v1'
  },
  dark: {
    primary: 'primitive.blue.v1',
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

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'primary'
  }
} as const satisfies ComponentIntents;
