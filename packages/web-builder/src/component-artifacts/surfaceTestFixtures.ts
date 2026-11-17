import type { Schema } from '@kiskadee/core';
import {
  buildSurfaceContextsArtifact,
  materializeSurfaceContexts
} from '@kiskadee/surface-builder';

export function withPrebuiltTestSurfaces<T extends Schema<string>>(schema: T): T {
  const artifact = buildSurfaceContextsArtifact({
    key: 'surface-test',
    schema,
    schemaPath: 'surface-test.schema.ts'
  });
  return materializeSurfaceContexts(schema, artifact) as T;
}
