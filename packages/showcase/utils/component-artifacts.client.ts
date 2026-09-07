import { loadJsonFromBuild } from './build-artifacts.client';

const loads = new Map<string, Promise<unknown>>();

export function loadSelectedComponentArtifact<T>(
  path: string,
  version?: string | null
): Promise<T> {
  const key = `${version ?? 'default'}::${path}`;
  let promise = loads.get(key);
  if (!promise) {
    promise = loadJsonFromBuild<T>(path, { required: true });
    loads.set(key, promise);
    void promise.catch(() => loads.delete(key));
  }
  return promise as Promise<T>;
}
