import { type StyleKey, breakpoints as schemaBreakpoints } from '@kiskadee/core';

export const ERROR_INVALID_THUMB_SIZE_KEY_FORMAT =
  'Invalid thumb-shrink key format. Expected numeric value after "__".';
export const ERROR_INVALID_THUMB_SIZE_PROPERTY =
  'Invalid thumb-shrink property. Expected thumbShrinkBoxWidth or thumbShrinkBoxHeight.';

function parseThumbShrinkProperty(styleKey: StyleKey): {
  cssProperty: 'width' | 'height';
  cssVariable?: '--k-swt-thh';
} {
  const propertyName = styleKey.split(/\+\+|__/)[0];
  if (propertyName === 'thumbShrinkBoxWidth') return { cssProperty: 'width' };
  if (propertyName === 'thumbShrinkBoxHeight') {
    return { cssProperty: 'height', cssVariable: '--k-swt-thh' };
  }
  throw new Error(ERROR_INVALID_THUMB_SIZE_PROPERTY);
}

function parseThumbShrinkValue(styleKey: StyleKey): number {
  const raw = styleKey.split('__')[1]?.trim() ?? '';
  const px = Number(raw);
  if (!Number.isFinite(px)) throw new Error(ERROR_INVALID_THUMB_SIZE_KEY_FORMAT);
  return px;
}

function resolveMediaQuery(styleKey: StyleKey): string | undefined {
  const head = styleKey.split('__')[0] ?? '';
  if (!head.includes('++')) return undefined;

  const afterSize = head.slice(head.indexOf('++') + 2);
  if (!afterSize.includes('::')) return undefined;

  const [, breakpointToken] = afterSize.split('::');
  const breakpointValue = schemaBreakpoints[breakpointToken as keyof typeof schemaBreakpoints];
  if (breakpointValue == null) {
    throw new Error(`Invalid breakpoint token: ${breakpointToken}`);
  }

  return `@media (min-width: ${breakpointValue}px)`;
}

export function transformThumbShrinkKeyToCss(styleKey: StyleKey, className: string): string {
  const { cssProperty, cssVariable } = parseThumbShrinkProperty(styleKey);
  const px = parseThumbShrinkValue(styleKey);
  const mediaQuery = resolveMediaQuery(styleKey);
  const cssValue = `${px}px`;
  const declarations = cssVariable
    ? `${cssVariable}: ${cssValue}; ${cssProperty}: ${cssValue}`
    : `${cssProperty}: ${cssValue}`;
  const rule = `.k-swt:not(.-s) .${className} { ${declarations} }`;

  return mediaQuery ? `${mediaQuery} { ${rule} }` : rule;
}
