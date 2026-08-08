import {
  type Breakpoints,
  type BreakpointValue,
  type ElementAllSizeValue,
  type ElementSizeValue,
  elementSizeValues
} from '@kiskadee/core';
import { SEPARATORS } from '../../utils/index.ts';
import { normalizeCssNumber } from '../../utils/normalizeCssNumber.ts';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../errorMessages.ts';

type TypographyMetricProperty = 'textLetterSpacing' | 'textLineHeight';

type ParsedTypographyMetricKey = {
  value: string;
  mediaQuery?: string;
};

function parseTypographyMetricKey(
  styleKey: string,
  propertyName: TypographyMetricProperty,
  breakpoints: Breakpoints
): ParsedTypographyMetricKey {
  const directPrefix = `${propertyName}${SEPARATORS.VALUE}`;
  if (styleKey.startsWith(directPrefix)) {
    return { value: styleKey.slice(directPrefix.length) };
  }

  const responsivePrefix = `${propertyName}${SEPARATORS.SIZE}`;
  if (!styleKey.startsWith(responsivePrefix)) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  const [scope, value, extraValue] = styleKey
    .slice(responsivePrefix.length)
    .split(SEPARATORS.VALUE);
  if (!scope || value === undefined || extraValue !== undefined) {
    throw new Error(`Invalid responsive typography style key "${styleKey}".`);
  }

  const [rawSize, rawBreakpoint, extraBreakpoint] = scope.split(SEPARATORS.BREAKPOINT);
  const size = rawSize as ElementSizeValue | ElementAllSizeValue;
  if (size !== 's:all' && !elementSizeValues.includes(size as ElementSizeValue)) {
    throw new Error(`Invalid typography size token "${rawSize}" in style key "${styleKey}".`);
  }
  if (extraBreakpoint !== undefined) {
    throw new Error(`Invalid responsive typography style key "${styleKey}".`);
  }
  if (!rawBreakpoint) return { value };

  const breakpoint = rawBreakpoint as BreakpointValue;
  const minWidth = breakpoints[breakpoint];
  if (minWidth === undefined) {
    throw new Error(`Invalid typography breakpoint token "${rawBreakpoint}" in "${styleKey}".`);
  }

  return { value, mediaQuery: `@media (min-width: ${minWidth}px)` };
}

function wrapRule(className: string, declaration: string, mediaQuery?: string): string {
  const rule = `.${className} { ${declaration} }`;
  return mediaQuery ? `${mediaQuery} { ${rule} }` : rule;
}

export function transformTypographyMetricKeyToCss(
  styleKey: string,
  className: string,
  breakpoints: Breakpoints
): string {
  const propertyName: TypographyMetricProperty = styleKey.startsWith('textLineHeight')
    ? 'textLineHeight'
    : 'textLetterSpacing';
  const parsed = parseTypographyMetricKey(styleKey, propertyName, breakpoints);

  if (propertyName === 'textLetterSpacing' && parsed.value === 'normal') {
    return wrapRule(className, 'letter-spacing: normal', parsed.mediaQuery);
  }

  const value = Number(parsed.value);
  if (!Number.isFinite(value)) {
    throw new Error(UNSUPPORTED_VALUE(propertyName, parsed.value, styleKey));
  }
  const normalized = normalizeCssNumber(value);
  const declaration =
    propertyName === 'textLineHeight'
      ? `line-height: ${normalized}`
      : `letter-spacing: ${normalized}em`;

  return wrapRule(className, declaration, parsed.mediaQuery);
}
