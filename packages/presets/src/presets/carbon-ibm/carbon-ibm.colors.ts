import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import blackLight from './colors/black.light';
import blueLight from './colors/blue.light';

// Layer 1: Primitive colors
export const primitiveColors = {
  blue: {
    v1: {
      solid: { light: blueLight, dark: blueLight }
    }
  },
  black: {
    v1: {
      solid: { light: blackLight, dark: blackLight }
    }
  }
} as const satisfies PrimitiveColors;

// Layer 2: Semantic colors (global meanings).
//
// Layer 2 is stable by default (no `light/dark`) and must not change meaning per
// component. However, for maximum flexibility, we support per-theme overrides.
//
// In practice, ~99% of design systems will mirror `light` and `dark` here: the same
// global semantic keys (e.g. `primary`, `neutral`) will point to the same primitive
// color assets.
//
// We still keep `Theme` support in Layer 2 for maximum flexibility in the remaining
// ~1% of cases. Example: in `light` you might map `neutral` to a black-based scale
// sitting on a very light gray surface; but in `dark` you may want to map `neutral`
// to a warm beige/rose primitive scale to increase contrast and improve readability.
// Having `light`/`dark` overrides in Layer 2 enables these fine-tuned adjustments.
//
export const globalSemantics = {
  light: {
    primary: {
      solid: { hue: 'blue', name: 'v1' }
    },
    neutral: {
      solid: { hue: 'black', name: 'v1' }
    }
  },
  dark: {
    primary: {
      solid: { hue: 'blue', name: 'v1' }
    },
    neutral: {
      solid: { hue: 'black', name: 'v1' }
    }
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

    // Example of direct Layer 1 usage (e.g. social buttons):
    // socialLinkedIn: { hue: 'blue', name: 'linkedin' }
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
