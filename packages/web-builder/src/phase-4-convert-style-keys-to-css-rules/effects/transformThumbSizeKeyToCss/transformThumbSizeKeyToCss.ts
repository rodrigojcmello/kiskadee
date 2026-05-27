import { breakpoints as schemaBreakpoints, type StyleKey } from '@kiskadee/core';

export const ERROR_INVALID_THUMB_SIZE_KEY_FORMAT =
  'Invalid thumb-size key format. Expected numeric value after "__".';
export const ERROR_INVALID_THUMB_SIZE_PROPERTY =
  'Invalid thumb-size property. Expected thumbSizeBoxWidth or thumbSizeBoxHeight.';

function parseThumbSizeProperty(styleKey: StyleKey): 'width' | 'height' {
  const propertyName = styleKey.split(/\+\+|__/)[0];
  if (propertyName === 'thumbSizeBoxWidth') return 'width';
  if (propertyName === 'thumbSizeBoxHeight') return 'height';
  throw new Error(ERROR_INVALID_THUMB_SIZE_PROPERTY);
}

function parseThumbSizeValue(styleKey: StyleKey): number {
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

export function transformThumbSizeKeyToCss(styleKey: StyleKey, className: string): string {
  const property = parseThumbSizeProperty(styleKey);
  const px = parseThumbSizeValue(styleKey);
  const mediaQuery = resolveMediaQuery(styleKey);
  const rule = `.k-swt:not(.-s) .${className} { ${property}: ${px}px }`;

  return mediaQuery ? `${mediaQuery} { ${rule} }` : rule;
}
