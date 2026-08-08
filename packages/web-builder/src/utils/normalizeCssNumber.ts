/**
 * Keeps generated numeric identities stable while avoiding insignificant floating-point tails.
 */
export function normalizeCssNumber(value: number): number {
  const rounded = Number(value.toFixed(6));
  return Object.is(rounded, -0) ? 0 : rounded;
}
