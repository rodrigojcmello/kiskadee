/** Native hover is suppressed after touch without changing forced states or specificity. */
export function normalizeNativePseudo(pseudo: string): string {
  return pseudo === ':hover'
    ? ':hover:where(:not(:active)):where(:not(:root[data-k-input="touch"] *))'
    : pseudo;
}
