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
import {
  DEFAULT_ELEMENT_STYLE_EMISSION_POLICY,
  type ResolvedElementStyleEmissionPolicy
} from '../../style-emission/web-build-policy.ts';
import { convertHslaToHex } from '../utils/convertHslaToHex.ts';

export type TransformColorKeyToCssOptions = {
  /**
   * When enabled, `boxColor` solid values are emitted as a 2-stop linear-gradient (degenerate)
   * using `--k-bg0/--k-bg1` so transitions keep the same CSS type across Design Systems.
   *
   * Applies ONLY to `boxColor` (`background` on Web).
   */
  enableSolidBoxColorAsGradient?: boolean;
  styleEmissionPolicy?: ResolvedElementStyleEmissionPolicy;
};

export const EMITTED_COLOR_CSS_VARS = {
  boxColor: '--k-bgc',
  borderColor: '--k-bdc'
} as const;

type ResolvedGradientLike = {
  kind: 'linear';
  angle: number;
  stops: Array<{ color: unknown; position: number }>;
};

function isHslaLike(v: unknown): v is HSLA {
  return (
    Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number' && !Number.isNaN(n))
  );
}

function isResolvedGradientLike(v: unknown): v is ResolvedGradientLike {
  if (!v || typeof v !== 'object') return false;
  const g = v as Partial<ResolvedGradientLike>;
  if (g.kind !== 'linear') return false;
  if (typeof g.angle !== 'number' || Number.isNaN(g.angle)) return false;
  if (!Array.isArray(g.stops) || g.stops.length === 0) return false;
  return g.stops.every((s) => {
    if (!s || typeof s !== 'object') return false;
    const stop = s as { color?: unknown; position?: unknown };
    if (typeof stop.position !== 'number' || Number.isNaN(stop.position)) return false;
    // color is either HSLA-like array or string (e.g. CSS variable)
    return typeof stop.color === 'string' || isHslaLike(stop.color);
  });
}

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
 * @param options
 * @returns GeneratedCss containing:
 *   - className: token without a dot prefix, for use in HTML
 *   - cssRule: full CSS text including selector(s)
 *   - parentClassName: only for reference cases (== or ::ref), the full token for the parent selector
 */
export function transformColorKeyToCss(
  styleKey: StyleKey,
  className: string,
  forceState?: boolean,
  options?: TransformColorKeyToCssOptions
): string {
  const separatorIndex = styleKey.indexOf('__');
  if (separatorIndex === -1) {
    throw new Error(ERROR_INVALID_KEY_FORMAT);
  }
  const rawValue = styleKey.slice(separatorIndex + 2);

  // Base color property, e.g. "background-color" or "color"
  // Support both non-ref ("--" or "__") and ref ("==") separators
  const propertyName = styleKey.split(/==|--|__/)[0] as ColorProperty;
  const colorProperty = CssColorProperty[propertyName];
  // Optimization: use shorthand "background" instead of "background-color"
  const optimizedProperty = colorProperty === 'background-color' ? 'background' : colorProperty;
  const styleEmissionPolicy = options?.styleEmissionPolicy ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY;
  const shouldMirrorBoxColor =
    propertyName === 'boxColor' && styleEmissionPolicy.boxColorEmission === 'mirrored';
  const shouldMirrorBorderColor =
    propertyName === 'borderColor' && styleEmissionPolicy.borderColorEmission === 'mirrored';
  const shouldTokenizeBorderColor =
    propertyName === 'borderColor' && styleEmissionPolicy.borderColorEmission === 'token';
  const buildColorDeclarations = (value: string) =>
    shouldMirrorBoxColor
      ? `${EMITTED_COLOR_CSS_VARS.boxColor}: ${value}; ${optimizedProperty}: ${value}`
      : shouldMirrorBorderColor
        ? `${EMITTED_COLOR_CSS_VARS.borderColor}: ${value}; ${optimizedProperty}: ${value}`
        : shouldTokenizeBorderColor
          ? `${EMITTED_COLOR_CSS_VARS.borderColor}: ${value}`
          : `${optimizedProperty}: ${value}`;

  let cssValue: string;
  let gradientVars: string | undefined;
  let gradientBackground: string | undefined;

  // Check if it is HSLA array (solid color encoded as JSON array)
  if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    const inner = rawValue.slice(1, -1);
    const parts = inner.split(',').map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      throw new Error(
        `Invalid HSLA tuple in style key. Expected "h,s,l,a" (4 numbers), got: "${inner}"`
      );
    }
    // TS note: `HSLA` is a `readonly` tuple. We validate length at runtime and then cast.
    const hsla = parts as unknown as HSLA;
    const solidHex = convertHslaToHex(hsla);

    // Feature flag: force solid `boxColor` to be emitted as a 2-stop gradient
    // so we can transition between different Design Systems (gradient <-> solid)
    // without swapping `background-color` vs `background-image`.
    const shouldForceSolidAsGradient =
      options?.enableSolidBoxColorAsGradient === true && optimizedProperty === 'background';

    if (shouldForceSolidAsGradient) {
      gradientVars = `--k-bg0: ${solidHex}; --k-bg1: ${solidHex};`;
      gradientBackground = 'linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%)';
      cssValue = gradientBackground;
    } else {
      cssValue = solidHex;
    }
  } else if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
    // Cross-platform encoding: gradients are stored as JSON objects in the style key.
    // Web builder converts them to a valid CSS gradient only at this phase.
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      throw new Error(`Invalid JSON value in style key: ${rawValue}`);
    }

    if (!isResolvedGradientLike(parsed)) {
      throw new Error(
        `Unsupported JSON value in style key (expected ResolvedGradient): ${rawValue}`
      );
    }

    // Gradients are only supported for box/background paints on Web.
    if (optimizedProperty !== 'background') {
      throw new Error(
        `Gradient value is not supported for property "${String(propertyName)}" (styleKey=${styleKey}). Use a solid color instead.`
      );
    }

    const g = parsed;
    const resolvedStops = g.stops.map((s) => {
      const stopColor = typeof s.color === 'string' ? s.color : convertHslaToHex(s.color as HSLA);
      return { color: stopColor, position: s.position };
    });

    // Animated gradient strategy for Web (2–3 stops):
    // - Background is expressed in terms of CSS custom properties (--k-bg0/1/2)
    // - Interaction states only override the variables, allowing browsers that support
    //   `@property` to interpolate colors (progressive enhancement).
    if (resolvedStops.length === 2 || resolvedStops.length === 3) {
      const varNames = ['--k-bg0', '--k-bg1', '--k-bg2'] as const;

      gradientVars = resolvedStops.map((s, i) => `${varNames[i]}: ${s.color};`).join(' ');

      const bgStops = resolvedStops.map((s, i) => `var(${varNames[i]}) ${s.position}%`).join(', ');

      gradientBackground = `linear-gradient(${g.angle}deg, ${bgStops})`;
      // For non-rest states we want to emit only vars. For rest we emit vars + background.
      cssValue = gradientBackground;
    } else {
      // Fallback: keep output stable and compact (no animation support).
      const stops = resolvedStops.map((s) => `${s.color} ${s.position}%`).join(', ');
      cssValue = `linear-gradient(${g.angle}deg, ${stops})`;
    }
  } else {
    // String value (e.g. CSS var)
    cssValue = rawValue;
  }

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
    // IMPORTANT: only consider the key portion (before "__"). Values may contain "--"
    // (e.g. CSS vars like "var(--x)" inside JSON-encoded gradients).
    const head = styleKey.split('__')[0] ?? '';
    const start = head.indexOf('--');
    if (start === -1) return [];
    const seg = head.slice(start + 2);
    return seg ? seg.split(':') : [];
  };

  const states = extractStates();
  const filteredStates = states.filter((s) => s !== 'rest' && s !== '');
  const normalizeNativePseudo = (pseudo: string): string =>
    pseudo === ':hover' ? ':hover:not(:active)' : pseudo;

  if (!isRef) {
    if (filteredStates.length === 0) {
      if (gradientVars && gradientBackground && optimizedProperty === 'background') {
        if (shouldMirrorBoxColor) {
          return `.${className} { ${EMITTED_COLOR_CSS_VARS.boxColor}: ${gradientBackground}; ${gradientVars} ${optimizedProperty}: ${gradientBackground} }`;
        }

        return `.${className} { ${gradientVars} ${optimizedProperty}: ${gradientBackground} }`;
      }

      return `.${className} { ${buildColorDeclarations(cssValue)} }`;
    }

    // Split states by availability of native pseudo
    const nativeTokens = filteredStates
      .map((s) => InteractionStateCssPseudoSelector[s as PseudoSelectorKeys] || '')
      .map(normalizeNativePseudo)
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
    if (gradientVars && optimizedProperty === 'background') {
      // Non-rest state: override only variables.
      // The background expression is expected to be provided by the rest (base) rule.
      if (shouldMirrorBoxColor && gradientBackground) {
        return `${selector} { ${EMITTED_COLOR_CSS_VARS.boxColor}: ${gradientBackground}; ${gradientVars} }`;
      }

      return `${selector} { ${gradientVars} }`;
    }

    return `${selector} { ${buildColorDeclarations(cssValue)} }`;
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
    .map(normalizeNativePseudo)
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
  if (gradientVars && gradientBackground && optimizedProperty === 'background') {
    // Ref rules do not have a guaranteed rest anchor, so emit vars + background together.
    if (shouldMirrorBoxColor) {
      return `${selector} { ${EMITTED_COLOR_CSS_VARS.boxColor}: ${gradientBackground}; ${gradientVars} ${optimizedProperty}: ${gradientBackground} }`;
    }

    return `${selector} { ${gradientVars} ${optimizedProperty}: ${gradientBackground} }`;
  }
  return `${selector} { ${buildColorDeclarations(cssValue)} }`;
}
