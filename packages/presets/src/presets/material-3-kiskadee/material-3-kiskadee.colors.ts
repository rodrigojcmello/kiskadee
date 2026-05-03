import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import { type DeepOverride, deepMerge } from '../../utils/deepMerge.ts';
import {
  primitiveColors as basePrimitiveColors,
  globalSemantics
} from '../material-3-google/color.layers.ts';
import {
  componentIntents as baseComponentIntents,
  globalSemanticsBySegment as baseGlobalSemanticsBySegment
} from '../material-3-google/material-3-google.colors.ts';

// Material 3 (Kiskadee): derived from the official Google preset with minimal overrides.
// This preset is allowed to introduce non-official intents (e.g. `destructive`).

const componentIntentsPatch = {
  button: {
    destructive: 'redLike'
  }
} as const satisfies DeepOverride<ComponentIntents>;

const primitiveColorsPatch = {
  // purple: {
  //   v1: {
  //     gradient: {
  //       angle: 180,
  //       stops: [
  //         { primitive: 'primitive.purple.v1', position: 0 },
  //         { primitive: 'primitive.purple.v2', position: 100 }
  //       ]
  //     }
  //   }
  // },
  // black: {
  //   v1: {
  //     gradient: {
  //       angle: 180,
  //       stops: [
  //         { primitive: 'primitive.black.v1', position: 0 },
  //         { primitive: 'primitive.black.v1', position: 100 }
  //       ]
  //     }
  //   }
  // }
} as const satisfies DeepOverride<PrimitiveColors>;

export const primitiveColors = deepMerge(
  basePrimitiveColors as PrimitiveColors,
  primitiveColorsPatch
) satisfies PrimitiveColors;

const globalSemanticsBySegmentPatch = {
  modern: {
    meta: {
      name: 'Material Design - Modern'
    }
  }
} as const satisfies DeepOverride<GlobalSemanticsBySegment>;

export const globalSemanticsBySegment = deepMerge(
  baseGlobalSemanticsBySegment as GlobalSemanticsBySegment,
  globalSemanticsBySegmentPatch
) satisfies GlobalSemanticsBySegment;

export const componentIntents = deepMerge(
  baseComponentIntents as ComponentIntents,
  componentIntentsPatch
) satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
