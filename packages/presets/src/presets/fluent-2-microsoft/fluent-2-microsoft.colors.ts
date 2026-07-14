import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import blueV1 from './colors/b.blue.v1.ts';
import blackV1 from './colors/n.black.v1.ts';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

export const primitiveColors = {
  blue: {
    // Tonal generator asset `b.blue.v1` is addressed by its natural appearance in Core.
    v1: blueV1
  },
  black: {
    // Tonal generator asset `n.black.v1` is addressed by its natural appearance in Core.
    v1: blackV1
  }
} as const satisfies PrimitiveColors;

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
  }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  },
  card: {
    neutral: 'neutral',
    primary: 'primary'
  },
  slider: {
    neutral: 'neutral',
    primary: 'primary'
  },
  switch: {
    neutral: 'neutral'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
