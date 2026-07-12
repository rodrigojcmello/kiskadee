/**
 * Locale-independent UTF-16 code-unit ordering for reproducible generation and
 * artifact identity across browsers and Node runtimes.
 */
export function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
