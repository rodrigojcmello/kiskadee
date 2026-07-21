import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import blueV1 from './colors/b.blue.v1.ts';
import mintV1 from './colors/bg.teal.v1.ts';
import tealV2 from './colors/bg.teal.v2.ts';
import cyanV1 from './colors/bg.teal.v3.ts';
import greenV1 from './colors/g.green.v1.ts';
import blackV1 from './colors/n.black.v1.ts';
import purpleV1 from './colors/p.purple.v1.ts';
import indigoV1 from './colors/pb.indigo.v1.ts';
import redV1 from './colors/r.red.v1.ts';
import pinkV1 from './colors/r.red.v2.ts';
import yellowV1 from './colors/y.yellow.v1.ts';
import orangeV1 from './colors/yr.orange.v1.ts';
import brownV1 from './colors/yr.orange.v2.ts';

// -------------------------------------------------------------------------------------------------
// Color architecture overview: Layer 1 → Layer 2 → Layer 3
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// Layer 1 - Primitive color assets
// -------------------------------------------------------------------------------------------------

export const primitiveColors = {
  black: {
    v1: blackV1
  },
  blue: {
    v1: blueV1
  },
  brown: {
    // Apple Brown is the authored `yr.orange.v2` seed, addressed by its natural identity in Core.
    v1: brownV1
  },
  cyan: {
    // Apple Cyan is an authored Blue-Green variant, addressed as Cyan in Core.
    v1: cyanV1
  },
  green: {
    v1: greenV1
  },
  orange: {
    v1: orangeV1
  },
  pink: {
    // Apple Pink classifies in Munsell Red but remains Pink at the public primitive layer.
    v1: pinkV1
  },
  purple: {
    v1: purpleV1,
    // Core has no Indigo hue name; the Apple Indigo appearance occupies the second Purple slot.
    v2: indigoV1
  },
  red: {
    v1: redV1
  },
  teal: {
    // Mint and Teal are distinct Apple identities inside the generated Blue-Green sector.
    v1: mintV1,
    v2: tealV2
  },
  yellow: {
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
    redLike: { v1: 'primitive.red.v1', v2: 'primitive.pink.v1' },
    yellowLike: { v1: 'primitive.yellow.v1', v2: 'primitive.orange.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  },
  dark: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    redLike: { v1: 'primitive.red.v1', v2: 'primitive.pink.v1' },
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
    neutral: 'neutral'
  },
  slider: {
    neutral: 'neutral',
    primary: 'primary'
  },
  switch: {
    neutral: 'neutral',
    primary: 'primary',
    // Composite intent: role lookup points at the positive/on pole; off uses redLike in the palette.
    polarity: 'greenLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
