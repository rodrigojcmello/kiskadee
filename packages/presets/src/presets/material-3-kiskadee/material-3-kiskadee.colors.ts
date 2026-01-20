import type { ComponentIntents, SchemaColors } from '@kiskadee/core';
import { type DeepOverride, deepMerge } from '../../utils/deepMerge';
import {
  componentIntents as baseComponentIntents,
  globalSemantics,
  globalSemanticsBySegment,
  primitiveColors
} from '../material-3-google/material-3-google.colors';

// Material 3 (Kiskadee): derived from the official Google preset with minimal overrides.
// This preset is allowed to introduce non-official intents (e.g. `destructive`).

const componentIntentsPatch = {
  button: {
    destructive: 'redLike'
  }
} as const satisfies DeepOverride<typeof baseComponentIntents>;

export const componentIntents = deepMerge(
  baseComponentIntents,
  componentIntentsPatch
) satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
