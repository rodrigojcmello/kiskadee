/**
 * Compose the existing single-segment recipes without reauthoring their formulas.
 * Only Schema's segment-indexed palettes, surface maps and border options are extended;
 * geometry, options and color assets retain their original ownership.
 */
export function withTeamsPalettes<T>(base: T, teams: T): T {
  if (!base || typeof base !== 'object' || Array.isArray(base)) return base;
  const result = { ...base } as Record<string, unknown>;
  const candidate = teams as Record<string, unknown>;
  for (const [key, value] of Object.entries(result)) {
    if (key === 'colors') continue;
    if (
      key === 'palettes' ||
      key === 'contentSurfaceContext' ||
      key === 'canonicalSurfaces' ||
      key === 'border'
    ) {
      const source = candidate[key] as Record<string, unknown> | undefined;
      if (source && 'default' in source) {
        result[key] = { ...(value as object), teams: source.default };
      }
    } else if (candidate[key] !== undefined) {
      result[key] = withTeamsPalettes(value, candidate[key]);
    }
  }
  return result as T;
}
