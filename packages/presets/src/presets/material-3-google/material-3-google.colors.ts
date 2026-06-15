import type { ComponentIntents, GlobalSemanticsBySegment, SchemaColors } from '@kiskadee/core';
import { globalSemantics, primitiveColors } from './color.layers.ts';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

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
  },
  card: {
    neutral: 'neutral'
  },
  tabs: {
    neutral: 'neutral'
  },
  switch: {
    neutral: 'primary'
  },
  textField: {
    neutral: 'neutral',
    error: 'redLike',
    warning: 'yellowLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
