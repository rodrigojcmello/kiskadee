import {
  type ColorProperty,
  CssColorProperty,
  type HSLA,
  InteractionStateCssPseudoSelector,
  type PseudoSelectorKeys,
  type StateActivatorKeys,
  type StyleKey,
  stateActivator
} from '@kiskadee/core';
import { convertHslaToHex } from '../utils/convertHslaToHex';

export const ERROR_INVALID_KEY_FORMAT =
  'Invalid key format. Expected value in square brackets at the end.';
export const ERROR_REF_REQUIRE_STATE =
  'Invalid key format. Reference "==" requires a preceding non-rest interaction state.';

/**
 * Transform a style key into its corresponding CSS rule representation.
 *
 * Handles two cases:
 * 1. Simple keys (no "=="): generates a class rule, optionally with a pseudo-state
 *    if the key contains an interaction state (e.g. "--hover__").
 * 2. Reference keys ("=="): generate a parent rule with a pseudo-state and
 *    a nested rule targeting the child selector. Also supports legacy "::ref".
 *
 * @param styleKey - the style token, e.g. "boxColor--hover__[240,50,50,0.5]" or
 *                   "boxColor==hover__[240,50,50,0.5]"
 * @param className - the CSS class name to use for the generated rule (without the leading dot).
 *                    Usually this is the shortened token assigned to the styleKey (for example "a"
 *                    or "abc"). The function will emit selectors using `.${className}`.
 * @param forceState - when true and a pseudo-class is present, also include the corresponding
 *                     "forced" CSS class selector (from classNameCssPseudoSelector) alongside
 *                     the native pseudo-class so the same style can be applied by adding that
 *                     class in HTML. Example: if pseudo-class is "hover" and its forced suffix
 *                     is "-h", the generated selector list will include ".abc:hover, .abc.-h" for
 *                     inline rules or ".-a:hover .abc, .-a.-h .abc" for parent-ref rules.
 * @returns GeneratedCss containing:
 *   - className: token without a dot prefix, for use in HTML
 *   - cssRule: full CSS text including selector(s)
 *   - parentClassName: only for reference cases (== or ::ref), the full token for the parent selector
 */
export function transformColorKeyToCss(
  styleKey: StyleKey,
  className: string,
  forceState?: boolean
): string {
  const separatorIndex = styleKey.indexOf('__');
  if (separatorIndex === -1) {
    throw new Error(ERROR_INVALID_KEY_FORMAT);
  }
  const rawValue = styleKey.slice(separatorIndex + 2);

  let cssValue: string;

  // Check if it is HSLA array
  if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    const inner = rawValue.slice(1, -1);
    const hsla = inner.split(',').map(Number) as HSLA;
    cssValue = convertHslaToHex(hsla);
  } else {
    cssValue = rawValue;
  }

  // Base color property, e.g. "background-color" or "color"
  // Support both non-ref ("--" or "__") and ref ("==") separators
  const propertyName = styleKey.split(/==|--|__/)[0] as ColorProperty;
  const colorProperty = CssColorProperty[propertyName];
  // Optimization: use shorthand "background" instead of "background-color"
  const optimizedProperty = colorProperty === 'background-color' ? 'background' : colorProperty;

  const isRef = styleKey.includes('==');

  const extractStates = (): string[] => {
    // Capture the full state segment which may be compound, e.g., "selected:hover"
    if (isRef) {
      // the child is before "__"; a state segment is after "=="
      const child = styleKey.split('__')[0] ?? '';
      const idx = child.indexOf('==');
      if (idx === -1) return [];
      const seg = child.slice(idx + 2);
      return seg ? seg.split(':') : [];
    }
    // non-ref: state segment is between "--" and "__" (if present)
    const start = styleKey.indexOf('--');
    if (start === -1) return [];
    const rest = styleKey.slice(start + 2);
    const end = rest.indexOf('__');
    const seg = end === -1 ? rest : rest.slice(0, end);
    return seg ? seg.split(':') : [];
  };

  const states = extractStates();
  const filteredStates = states.filter((s) => s !== 'rest' && s !== '');

  if (!isRef) {
    if (filteredStates.length === 0) {
      return `.${className} { ${optimizedProperty}: ${cssValue} }`;
    }

    // Split states by availability of native pseudo
    const nativeTokens = filteredStates
      .map((s) => InteractionStateCssPseudoSelector[s as PseudoSelectorKeys] || '')
      .filter((v) => v !== '');
    const nonNativeForcedSuffixes = filteredStates
      .filter((s) => !InteractionStateCssPseudoSelector[s as PseudoSelectorKeys])
      .map((s) => stateActivator[s as StateActivatorKeys] || '')
      .filter((v) => v !== '');
    const allForcedSuffixes = filteredStates
      .map((s) => stateActivator[s as StateActivatorKeys] || '')
      .filter((v) => v !== '');

    const selectors: string[] = [];

    // Native branch: only use native pseudos; include non-native state classes but NEVER add activator
    if (nativeTokens.length > 0) {
      const nativeChunk = nativeTokens.join('');
      const nonNativeChunk =
        nonNativeForcedSuffixes.length > 0 ? `.${nonNativeForcedSuffixes.join('.')}` : '';
      // Do not append activator to the native branch; activator only gates the forced branch
      selectors.push(`.${className}${nativeChunk}${nonNativeChunk}`);
    }

    // Forced branch: include all forced classes for every state, gated by activator
    const allowForced =
      allForcedSuffixes.length > 0 && (forceState === true || filteredStates.includes('disabled'));
    if (allowForced) {
      const activator = stateActivator.activator;
      selectors.push(`.${className}.${allForcedSuffixes.join('.')}.${activator}`);
    }

    if (selectors.length === 0) {
      // No way to express the states; fallback to base
      return `.${className} { ${optimizedProperty}: ${cssValue} }`;
    }

    const selector = selectors.join(', ');
    return `${selector} { ${optimizedProperty}: ${cssValue} }`;
  }

  // Ref (parent state gating child .className)
  const parentStates = filteredStates;
  if (parentStates.length === 0) {
    // The new structure requires a preceding non-rest interaction state for refs
    throw new Error(ERROR_REF_REQUIRE_STATE);
  }

  // Split states for parent
  const nativeTokens = parentStates
    .map((s) => InteractionStateCssPseudoSelector[s as PseudoSelectorKeys] || '')
    .filter((v) => v !== '');
  const nonNativeForcedSuffixes = parentStates
    .filter((s) => !InteractionStateCssPseudoSelector[s as PseudoSelectorKeys])
    .map((s) => stateActivator[s as StateActivatorKeys] || '')
    .filter((v) => v !== '');
  const allForcedSuffixes = parentStates
    .map((s) => stateActivator[s as StateActivatorKeys] || '')
    .filter((v) => v !== '');

  const parentSelectors: string[] = [];

  // Native parent branch: parent always gated by activator; add pseudos and non-native class suffixes
  // Only emit this branch when there is at least one native pseudo; otherwise it duplicates the forced-only case.
  if (nativeTokens.length > 0) {
    const nativeChunk = nativeTokens.join('');
    const nonNativeChunk =
      nonNativeForcedSuffixes.length > 0 ? `.${nonNativeForcedSuffixes.join('.')}` : '';
    {
      // Use interactive anchor from schema (do not mix with -a).
      const interactive = stateActivator.interactive;
      parentSelectors.push(`.${interactive}${nativeChunk}${nonNativeChunk} .${className}`);
    }
  }

  // Forced parent branch: activator + all forced suffixes
  if (allForcedSuffixes.length > 0 && (forceState === true || parentStates.includes('disabled'))) {
    const activator = stateActivator.activator;
    parentSelectors.push(`.${activator}.${allForcedSuffixes.join('.')} .${className}`);
  }

  if (parentSelectors.length === 0) {
    throw new Error(ERROR_REF_REQUIRE_STATE);
  }

  const selector = parentSelectors.join(', ');
  return `${selector} { ${optimizedProperty}: ${cssValue} }`;
}
