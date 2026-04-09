import type { StyleKeyUsageMap } from '../phase-2-map-style-key-usage/mapStyleKeyUsage';
import { getToken } from '../utils';

export type ShortenCssClassNames = Record<string, string>;

export interface ShortenCssClassNamesOptions {
  /**
   * Optional prefix for all generated class names.
   *
   * Useful for isolating CSS bundles per template/design system
   * (e.g., `ios-a`, `material-b`).
   */
  prefix?: string;
}

export function shortenCssClassNames(
  usage: StyleKeyUsageMap,
  options?: ShortenCssClassNamesOptions
): ShortenCssClassNames {
  const result: ShortenCssClassNames = {};
  let index = 0;

  // Assign tokens in order of descending usage (mapStyleKeyUsage already sorts it)
  for (const key of Object.keys(usage)) {
    const token = getToken(index++);
    result[key] = options?.prefix ? `${options.prefix}${token}` : token;
  }

  return result;
}
