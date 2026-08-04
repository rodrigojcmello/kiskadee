import type { FontStack } from './schema.ts';

export const SYSTEM_MONOSPACE_FONT_STACK = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  'Liberation Mono',
  'Courier New',
  'monospace'
] as const satisfies FontStack;

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong'
]);

const CSS_IDENTIFIER_PATTERN = /^-?[_a-zA-Z][-_a-zA-Z0-9]*$/;
const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'revert', 'revert-layer', 'unset']);

function unwrapQuotedFontToken(token: string): string {
  if (token.length < 2) return token;

  const first = token[0];
  const last = token[token.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return token.slice(1, -1);
  }

  return token;
}

function escapeCssString(value: string): string {
  let escaped = '';

  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (character === '"' || character === '\\') {
      escaped += `\\${character}`;
    } else if (codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f)) {
      escaped += `\\${codePoint.toString(16)} `;
    } else {
      escaped += character;
    }
  }

  return escaped;
}

function toCssFontToken(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (GENERIC_FONT_FAMILIES.has(lower)) {
    return lower;
  }

  const unquoted = unwrapQuotedFontToken(trimmed);
  if (
    unquoted === trimmed &&
    CSS_IDENTIFIER_PATTERN.test(trimmed) &&
    !CSS_WIDE_KEYWORDS.has(lower)
  ) {
    return trimmed;
  }

  return `"${escapeCssString(unquoted)}"`;
}

/**
 * Converts a non-empty semantic font stack into a safe CSS `font-family` value.
 */
export function toCssFontFamily(stack: FontStack): string {
  return stack.map(toCssFontToken).filter(Boolean).join(', ');
}
