import type { ComponentIntents, GlobalSemanticsBySegment, SchemaColors } from '@kiskadee/core';
import { classifyPrimitives } from '../../classify-primitives.ts';
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
const purpleSemantics = {
  support: { v1: 'primitive.purple.v3' },
  primary: { v1: 'primitive.purple.v2', v2: 'primitive.black.v1' },
  neutral: { v1: 'primitive.black.v1', v2: 'primitive.black.v1' }
} as const;

export const globalSemanticsBySegment = {
  purple: {
    meta: { name: 'Purple - Baseline' },
    themes: { light: purpleSemantics, dark: purpleSemantics }
  },
  default: {
    meta: {
      name: 'Blue - Google'
    }
  }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  badge: {
    neutral: 'neutral',
    primary: 'primary',
    novelty: 'purpleLike',
    positive: 'greenLike',
    warning: 'yellowLike',
    attention: 'redLike'
  },
  bottomSheet: {
    neutral: 'neutral',
    destructive: 'redLike'
  },
  button: {
    primary: 'primary',
    support: 'support',
    destructive: 'redLike',
    positive: 'greenLike',
    neutral: 'primitive.black.v1'
  },
  card: {
    support: 'support',
    primary: 'primary',
    neutral: 'neutral'
  },
  chip: { neutral: 'neutral', primary: 'primary' },
  dropdown: {
    neutral: 'neutral',
    destructive: 'redLike'
  },
  icon: { neutral: 'neutral', primary: 'primary' },
  progress: {
    neutral: 'neutral',
    primary: 'primary',
    positive: 'greenLike',
    warning: 'yellowLike',
    destructive: 'redLike'
  },
  slider: { neutral: 'neutral', primary: 'primary' },
  text: { neutral: 'neutral' },
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
  primitiveColors: classifyPrimitives(primitiveColors),
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
