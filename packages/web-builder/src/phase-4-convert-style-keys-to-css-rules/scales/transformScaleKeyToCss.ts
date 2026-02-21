import {
  type Breakpoints,
  type BreakpointValue,
  type ElementSizeValue,
  elementSizeValues,
  type ScaleProperty,
  type StyleKey,
  scaleProperties
} from '@kiskadee/core';
import { SEPARATORS } from '../../utils/buildStyleKey/buildStyleKey';

export const ERROR_NO_MATCHING_SCALE_PROPERTY = 'No matching scale key found.';
export const ERROR_INVALID_MEDIA_QUERY_PATTERN =
  'Invalid media query pattern; expected exactly one media token and one value.';
export const ERROR_INVALID_MEDIA_TOKEN = 'Invalid media query token.';
export const ERROR_INVALID_CUSTOM_TOKEN = 'Invalid custom size token.';
export const ERROR_MISSING_VALUE = 'Missing value for scale.';
export const ERROR_NO_STANDARD_SCALE_KEY = 'No matching standard scale key found.';
export const ERROR_INVALID_STANDARD_PATTERN =
  'Invalid standard scale key format; unexpected number of parts.';
export const ERROR_INVALID_KEY_FORMAT = 'Invalid scale key format; missing required delimiters.';

/**
 * Map of project scale keys to their corresponding CSS property names.
 */
const cssPropertyMap: Record<ScaleProperty, string> = {
  borderRadius: 'border-radius',
  borderRadiusRounded: 'border-radius',
  borderRadiusPill: 'border-radius',
  borderRadiusSquare: 'border-radius',
  borderWidth: 'border-width',
  boxHeight: 'height',
  boxWidth: 'width',
  marginBottom: 'margin-bottom',
  marginLeft: 'margin-left',
  marginRight: 'margin-right',
  marginTop: 'margin-top',
  paddingBottom: 'padding-bottom',
  paddingLeft: 'padding-left',
  paddingRight: 'padding-right',
  paddingTop: 'padding-top',
  textHeight: 'line-height',
  textSize: 'font-size'
} as const;

/**
 * Converts a dimension key into a CSS rule.
 *
 * Supports both standard keys (e.g. "paddingTop__16") and keys with size and/or media query support
 * (e.g. "paddingTop++s:sm:1::bp:lg:1__16").
 *
 * When the key includes a media token (after the breakpoint separator) for a breakpoint, the breakpoint token is
 * resolved via the provided breakpoints (e.g. "bp:lg:1" -> lookup of 'bp:lg:1'). If a size token is present
 * (e.g. "s:sm:1") it is validated against elementSizeValues and otherwise discarded for output.
 *
 * Notes (kept in sync with implementation):
 *  - Keys using the size separator must start with a known ScaleProperty, followed by SEPARATORS.SIZE.
 *  - With a breakpoint: format is "<scaleProperty><SIZE><sizeToken><BREAKPOINT><mediaToken><VALUE><value>".
 *  - Without a breakpoint: format is "<scaleProperty><SIZE><sizeToken><VALUE><value>".
 *  - Standard keys (no size) use: "<scaleProperty><VALUE><value>".
 *
 * @param styleKey - The scale key string to convert (must match one of the supported formats).
 * @param breakpoints - Object mapping breakpoint tokens to min-width pixel values.
 * @param className - CSS class name to use in the generated rule.
 * @returns A single CSS rule string (optionally wrapped in a media query) for the provided key.
 */
export function transformScaleKeyToCss(
  styleKey: StyleKey,
  breakpoints: Breakpoints,
  className: string
): string {
  let scaleProperty: ScaleProperty | undefined;
  let mediaQuery: string | undefined;
  let scaleValue: string = '';

  const hasSizeSeparator = styleKey.includes(SEPARATORS.SIZE) === true;
  const hasValueSeparator = styleKey.includes(SEPARATORS.VALUE) === true;

  if (hasSizeSeparator === true) {
    scaleProperty = scaleProperties.find((scaleProperty) => styleKey.startsWith(scaleProperty));
    const isScalePropertyValid = scaleProperty != null;

    if (isScalePropertyValid === false) {
      throw new Error(ERROR_NO_MATCHING_SCALE_PROPERTY);
    }

    const withoutPrefix = styleKey.slice(`${scaleProperty}${SEPARATORS.SIZE}`.length);
    const hasBreakpointSeparator = withoutPrefix.includes(SEPARATORS.BREAKPOINT);

    if (hasBreakpointSeparator === true) {
      const [sizeToken, remainder] = withoutPrefix.split(SEPARATORS.BREAKPOINT) as [
        ElementSizeValue,
        string
      ];
      const parts = remainder.split(SEPARATORS.VALUE) as [BreakpointValue, string];
      if (parts.length !== 2) {
        throw new Error(ERROR_INVALID_MEDIA_QUERY_PATTERN);
      }
      const [mediaToken, value] = parts;
      const bpValue = breakpoints[mediaToken];
      const hasValidBreakpoint = bpValue != null;

      if (hasValidBreakpoint === false) {
        throw new Error(ERROR_INVALID_MEDIA_TOKEN);
      }

      const isValidSizeToken = elementSizeValues.includes(sizeToken);

      if (isValidSizeToken === false) {
        throw new Error(ERROR_INVALID_CUSTOM_TOKEN);
      }

      mediaQuery = `@media (min-width: ${bpValue}px)`;
      scaleValue = value;
    } else {
      const [sizeToken, value] = withoutPrefix.split(SEPARATORS.VALUE) as [
        ElementSizeValue,
        string
      ];
      const isValidToken = sizeToken != null && elementSizeValues.includes(sizeToken);
      const hasValue = value != null;

      if (isValidToken === false) {
        throw new Error(ERROR_INVALID_CUSTOM_TOKEN);
      }

      if (hasValue === false) {
        throw new Error(ERROR_MISSING_VALUE);
      }

      scaleValue = value;
    }
  } else if (hasValueSeparator === true) {
    scaleProperty = scaleProperties.find((scaleProperty) => styleKey.startsWith(scaleProperty));
    const isScalePropertyValid = scaleProperty != null;

    if (isScalePropertyValid === false) {
      throw new Error(ERROR_NO_STANDARD_SCALE_KEY);
    }

    const parts = styleKey.split(SEPARATORS.VALUE);

    if (parts.length !== 2) {
      throw new Error(ERROR_INVALID_STANDARD_PATTERN);
    }

    const [, value] = parts as [string, string];
    scaleValue = value;
  } else {
    throw new Error(ERROR_INVALID_KEY_FORMAT);
  }

  const cssProperty = cssPropertyMap[scaleProperty as unknown as ScaleProperty];
  let cssValue: string;
  if (scaleProperty === 'textSize') {
    cssValue = `${Number(scaleValue) / 16}rem`;
  } else {
    cssValue = `${scaleValue}px`;
  }

  let rule: string;
  if (scaleProperty === 'borderWidth') {
    rule = `.${className} { --k-bw: ${cssValue}; ${cssProperty}: ${cssValue} }`;
  } else if (
    scaleProperty === 'borderRadius' ||
    scaleProperty === 'borderRadiusRounded' ||
    scaleProperty === 'borderRadiusPill' ||
    scaleProperty === 'borderRadiusSquare'
  ) {
    rule = `.${className} { --k-br: ${cssValue}; ${cssProperty}: ${cssValue} }`;
  } else if (
    scaleProperty === 'paddingTop' ||
    scaleProperty === 'paddingRight' ||
    scaleProperty === 'paddingBottom' ||
    scaleProperty === 'paddingLeft'
  ) {
    const paddingVar =
      scaleProperty === 'paddingTop'
        ? '--k-pt'
        : scaleProperty === 'paddingRight'
          ? '--k-pr'
          : scaleProperty === 'paddingBottom'
            ? '--k-pb'
            : '--k-pl';
    const adjustedPadding = `max(0px, calc(var(${paddingVar}) - var(--k-bw, 0px)))`;
    rule = `.${className} { ${paddingVar}: ${cssValue}; ${cssProperty}: ${adjustedPadding} }`;
  } else {
    rule = `.${className} { ${cssProperty}: ${cssValue} }`;
  }

  if (mediaQuery) {
    rule = `${mediaQuery} { ${rule} }`;
  }

  return rule;
}
