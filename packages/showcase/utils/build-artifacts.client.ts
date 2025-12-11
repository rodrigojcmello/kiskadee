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
export async function loadJsonFromBuild<T>(
  relativePath: string,
  options: BuildJsonOptions<T>
): Promise<T> {
  const response = await fetch(`/build/${relativePath}`);

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
