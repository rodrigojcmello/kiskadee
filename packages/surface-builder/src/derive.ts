import type { ContentSurfaceContextMap, Schema, SystemButtonIntent } from '@kiskadee/core';
import { compileSurfaceRegions } from './regions.ts';

/** Read the effective Button output using the same compiler as the portable pre-build. */
export function resolveButtonContentSurfaceContext(
  schema: Schema<string>
): ContentSurfaceContextMap<SystemButtonIntent> | undefined {
  return compileSurfaceRegions(schema, 'button', []).regions?.e1?.output;
}
