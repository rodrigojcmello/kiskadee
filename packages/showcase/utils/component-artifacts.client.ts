import { evictRequiredBuildJson, loadJsonFromBuild } from './build-artifacts.client';

function selectedArtifactPath(path: string, revision?: string | null): string {
  return revision ? `${path}?v=${encodeURIComponent(revision)}` : path;
}

/** The shared URL cache owns deduplication and retry for every JSON consumer. */
export function loadSelectedComponentArtifact<T>(
  path: string,
  revision?: string | null
): Promise<T> {
  return loadJsonFromBuild<T>(selectedArtifactPath(path, revision), { required: true });
}

export function evictSelectedComponentArtifact(path: string, revision?: string | null): void {
  evictRequiredBuildJson(selectedArtifactPath(path, revision));
}
