export type FontStack = readonly [primary: string, fallback: string];

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'math',
  'emoji',
  'fangsong'
]);

function isQuotedFontToken(token: string): boolean {
  const trimmed = token.trim();
  if (trimmed.length < 2) return false;
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  return (first === '"' && last === '"') || (first === "'" && last === "'");
}

function toCssFontToken(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (GENERIC_FONT_FAMILIES.has(lower)) {
    return lower;
  }

  if (isQuotedFontToken(trimmed)) {
    return trimmed;
  }

  // Quote when needed for CSS parsing (e.g., spaces). We intentionally keep this
  // conservative: quoting a non-generic family name is always safe.
  const needsQuotes = /\s|,|\(|\)|\//.test(trimmed);
  if (!needsQuotes) {
    return trimmed;
  }

  const escaped = trimmed.replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Converts a font stack `[primary, fallback]` (without needing to think about quotes)
 * into a CSS `font-family` string.
 */
export function toCssFontFamily(stack: FontStack): string {
  const primary = toCssFontToken(stack[0]);
  const fallback = toCssFontToken(stack[1]);

  if (primary && fallback) return `${primary}, ${fallback}`;
  return primary || fallback;
}
