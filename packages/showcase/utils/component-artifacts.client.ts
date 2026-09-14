import { loadJsonFromBuild } from './build-artifacts.client';

/** The shared URL cache owns deduplication and retry for every JSON consumer. */
export function loadSelectedComponentArtifact<T>(
  path: string,
  revision?: string | null
): Promise<T> {
  return loadJsonFromBuild<T>(revision ? `${path}?v=${encodeURIComponent(revision)}` : path, {
    required: true
  });
}
