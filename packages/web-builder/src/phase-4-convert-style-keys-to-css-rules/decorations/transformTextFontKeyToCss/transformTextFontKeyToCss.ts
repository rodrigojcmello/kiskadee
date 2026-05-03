import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

/**
 * Converts a textFont style key into a CSS rule string.
 *
 * It interprets the textFont value as a **semantic token** when it matches one of
 * the supported keywords:
 * - 'heading' -> var(--k-font-heading)
 * - 'body' -> var(--k-font-body)
 * - 'code' -> var(--k-font-code)
 *
 * Any other value is treated as unsupported and results in an error. This enforces
 * the contract that text fonts are expressed via semantic tokens, not raw stacks.
 *
 * @example
 * ```ts
 * transformTextFontKeyToCss('textFont__heading', 'abc')
 * // -> .abc { font-family: var(--k-font-heading) }
 * ```
 */
export function transformTextFontKeyToCss(styleKey: string, className: string): string {
  const propertyName = 'textFont';
  const prefix = `${propertyName}__`;

  if (!styleKey.startsWith(prefix)) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  const token = styleKey.substring(prefix.length);

  let cssValue: string | undefined;

  if (token === 'heading') {
    cssValue = 'var(--k-font-heading)';
  } else if (token === 'body') {
    cssValue = 'var(--k-font-body)';
  } else if (token === 'code') {
    cssValue = 'var(--k-font-code)';
  }

  if (!cssValue) {
    throw new Error(UNSUPPORTED_VALUE(propertyName, token, styleKey));
  }

  return `.${className} { font-family: ${cssValue} }`;
}
