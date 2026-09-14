// Utilities for loading JSON artifacts generated into the `/public/build` directory.
//
// This helper centralizes `fetch` calls to `/build`, including consistent
// handling of 404 responses and error reporting.

export type BuildJsonOptions<T> = { required: true } | { required: false; fallback: T };

/**
 * Load a JSON artifact from `/build`.
 *
 * Behaviour:
 * - When `required: true`, any non-ok response (including 404) throws an error.
 * - When `required: false`, a 404 response returns the provided `fallback` value;
 *   other non-ok statuses still throw an error.
 * - Network or parsing errors are propagated in both cases.
 */
async function fetchJsonFromBuild<T>(
  relativePath: string,
  options: BuildJsonOptions<T>
): Promise<T> {
  const response = await fetch(`/build/${relativePath}`, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404 && !options.required) {
      return options.fallback;
    }

    throw new Error(
      `Failed to load JSON artifact from /build/${relativePath} (status ${response.status})`
    );
  }

  return (await response.json()) as T;
}

export async function loadTextFromBuild(
  relativePath: string,
  options: BuildJsonOptions<string>
): Promise<string> {
  const response = await fetch(`/build/${relativePath}`, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404 && !options.required) {
      return options.fallback;
    }

    throw new Error(
      `Failed to load artifact from /build/${relativePath} (status ${response.status})`
    );
  }

  return response.text();
}

const jsonLoads = new Map<string, Promise<unknown>>();
export function loadJsonFromBuild<T>(
  relativePath: string,
  options: BuildJsonOptions<T>
): Promise<T> {
  const key = `${relativePath}|${options.required}`;
  const cached = jsonLoads.get(key);
  if (cached) return cached as Promise<T>;
  const promise = fetchJsonFromBuild(relativePath, options);
  jsonLoads.set(key, promise);
  void promise.catch(() => jsonLoads.delete(key));
  return promise;
}

export function clearBuildArtifactCache() {
  jsonLoads.clear();
}
