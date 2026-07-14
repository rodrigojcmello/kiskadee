import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import blueV1 from './colors/b.blue.v1.ts';
import greenV1 from './colors/g.green.v1.ts';
import blackV1 from './colors/n.black.v1.ts';
import purpleV1 from './colors/p.purple.v1.ts';
import redV1 from './colors/r.red.v1.ts';
import yellowV1 from './colors/y.yellow.v1.ts';
import orangeV1 from './colors/yr.orange.v1.ts';

// -------------------------------------------------------------------------------------------------
// Color architecture overview: Layer 1 → Layer 2 → Layer 3
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Layer 1 - Primitive color assets
// -------------------------------------------------------------------------------------------------

export const primitiveColors = {
  black: {
    // Tonal generator asset `n.black.v1` is addressed by its natural appearance in Core.
    v1: blackV1
  },
  blue: {
    // Tonal generator asset `b.blue.v1` is addressed by its natural appearance in Core.
    v1: blueV1
  },
  green: {
    // Tonal generator asset `g.green.v1` preserves Fluent Green.
    v1: greenV1
  },
  orange: {
    // Tonal generator asset `yr.orange.v1` preserves Fluent Orange.
    v1: orangeV1
  },
  purple: {
    // Tonal generator asset `p.purple.v1` preserves Fluent Berry.
    v1: purpleV1
  },
  red: {
    // Tonal generator asset `r.red.v1` preserves Fluent Cranberry.
    v1: redV1
  },
  yellow: {
    // Tonal generator asset `y.yellow.v1` preserves Fluent Marigold.
    v1: yellowV1
  }
} as const satisfies PrimitiveColors;

// -------------------------------------------------------------------------------------------------
// Layer 2 - Global semantic colors
// -------------------------------------------------------------------------------------------------

export const globalSemantics = {
  light: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    redLike: { v1: 'primitive.red.v1' },
    yellowLike: { v1: 'primitive.yellow.v1', v2: 'primitive.orange.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  },
  dark: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    redLike: { v1: 'primitive.red.v1' },
    yellowLike: { v1: 'primitive.yellow.v1', v2: 'primitive.orange.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  }
} as const satisfies GlobalSemanticsByTheme;

// -------------------------------------------------------------------------------------------------
// Layer 2 - Segment registry and optional semantic overrides
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

// -------------------------------------------------------------------------------------------------
// Layer 3 - Component intents
// -------------------------------------------------------------------------------------------------

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
