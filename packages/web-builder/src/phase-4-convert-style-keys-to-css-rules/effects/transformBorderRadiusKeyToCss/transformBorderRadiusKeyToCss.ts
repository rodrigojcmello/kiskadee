import {
  InteractionStateCssPseudoSelector,
  type PseudoSelectorKeys,
  type StateActivatorKeys,
  type StyleKey,
  breakpoints as schemaBreakpoints,
  stateActivator
} from '@kiskadee/core';

export const ERROR_INVALID_NUMERIC_KEY_FORMAT =
  'Invalid key format. Expected numeric value in square brackets at the end.';
export const ERROR_REF_REQUIRE_STATE_NUMERIC =
  'Invalid key format. Reference "==" requires a preceding non-rest interaction state.';

/**
 * Transform a borderRadius style key into a CSS rule string.
 *
 * This function understands the styleKey grammar used by kiskadee for effects:
 * - Base key: "borderRadius"
 * - Inline state (applies to the same element): "--<state[:state2[:...]]>"
 *   • Example: "--hover", "--selected:hover"
 * - Parent reference (state on parent gating the child): "==<state[:...]>"
 *   • Example: "==hover", "==selected:focus"
 * - Responsive size token (ignored for radius value but may carry breakpoint): "++s:md:1"
 * - Optional breakpoint: "::bp:<token>". We only use the breakpoint to wrap with a media query.
 * - Value: the numeric radius in pixels after "__". It can be either "__18" or "__[18]".
 *
 * States use two kinds of selectors:
 * - Native pseudo-classes (hover, focus, active for "pressed"), sourced from InteractionStateCssPseudoSelector
 * - Forced class suffixes (e.g., -h for hover, -f for focus, -s for selected), sourced from classNameStateClassMap (which also exposes the global activator and other utility classes)
 *
 * Selector emission rules (aligned with transformColorKeyToCss):
 * - Inline (no "==")
 *   • Native branch: emits .<className><pseudo(s)> plus any non-native forced suffixes as classes on the same element.
 *     Never add the activator class (.-a) in this branch.
 *   • Forced branch: emits .<className>.<all forced suffixes>.-a when forceState === true OR when one state is "disabled".
 * - Reference (with "==")
 *   • Native parent branch: emits .-a<pseudo(s)><non-native classes> .<className> when there is at least one native pseudo.
 *   • Forced parent branch: emits .-a.<all forced suffixes> .<className> when forceState === true OR when one state is "disabled".
 *
 * Examples (simplified for className="abc"):
 * - "--hover__10" => ".abc:hover, .abc.-h.-a { border-radius: 10px }" (when forceState=true)
 * - "--selected:hover__8" => ".abc:hover.-s, .abc.-s.-h.-a { border-radius: 8px }" (when forceState=true)
 * - "==hover__4" => ".-a:hover .abc, .-a.-h .abc { border-radius: 4px }" (when forceState=true)
 *
 * The function only constructs selectors and the "border-radius" declaration; it does not validate
 * whether specific state combinations are semantically meaningful.
 */
export function transformBorderRadiusKeyToCss(
  styleKey: StyleKey,
  className: string,
  forceState?: boolean
): string {
  // 1) Parse the numeric radius after "__". Accept both plain ("__18") and bracketed ("__[18]").
  const afterValueSep = styleKey.split('__')[1] ?? '';
  let raw = afterValueSep.trim();
  if (raw.startsWith('[') && raw.endsWith(']')) {
    raw = raw.slice(1, -1);
  }
  const px = Number(raw);
  if (Number.isFinite(px) === false) throw new Error(ERROR_INVALID_NUMERIC_KEY_FORMAT);

  // Determine if the styleKey targets a parent state (reference) or the element itself (inline)
  const isRef = styleKey.includes('==');

  // Extract the list of interaction states (e.g., ["selected", "hover"]).
  // Important: when responsive tokens are present ("++..."), they must be excluded from the states segment.
  const extractStates = (): string[] => {
    if (isRef) {
      // For reference keys, the state segment starts right after "==" and ends before any optional "++".
      const child = styleKey.split('__')[0] ?? '';
      const idx = child.indexOf('==');
      if (idx === -1) return [];
      let seg = child.slice(idx + 2);
      // Cut off responsive size/breakpoint segment if present ("++...")
      const plusIdx = seg.indexOf('++');
      if (plusIdx !== -1) seg = seg.slice(0, plusIdx);
      return seg ? seg.split(':') : [];
    }
    // For inline keys, the state segment is between "--" and either "++" (responsive) or "__" (value).
    const start = styleKey.indexOf('--');
    if (start === -1) return [];
    const rest = styleKey.slice(start + 2);
    // State segment ends before either "++" (responsive) or "__" (value)
    const endDoubleUnderscore = rest.indexOf('__');
    const endPlusPlus = rest.indexOf('++');
    let cutAt: number;
    if (endPlusPlus !== -1 && endDoubleUnderscore !== -1)
      cutAt = Math.min(endPlusPlus, endDoubleUnderscore);
    else if (endPlusPlus !== -1) cutAt = endPlusPlus;
    else cutAt = endDoubleUnderscore;
    const seg = cutAt === -1 ? rest : rest.slice(0, cutAt);
    return seg ? seg.split(':') : [];
  };

  // Remove explicit "rest" and empty tokens if provided.
  const states = extractStates().filter((s) => s !== 'rest' && s !== '');

  // Build selectors that apply to the same element (.abc ...)
  const buildInlineSelectors = (): string[] => {
    if (states.length === 0) return [`.${className}`];

    // Split states into those with native CSS pseudos and those that only exist as forced classes
    const nativeTokens = states
      .map((s) => InteractionStateCssPseudoSelector[s as PseudoSelectorKeys] || '')
      .filter((v) => v !== '');
    const nonNativeForcedSuffixes = states
      .filter((s) => !InteractionStateCssPseudoSelector[s as PseudoSelectorKeys])
      .map((s) => stateActivator[s as StateActivatorKeys] || '')
      .filter((v) => v !== '');
    const allForcedSuffixes = states
      .map((s) => stateActivator[s as StateActivatorKeys] || '')
      .filter((v) => v !== '');

    const selectors: string[] = [];

    // Native branch: .abc:hover[...non-native classes]; never append activator (.-a) here.
    if (nativeTokens.length > 0) {
      const nativeChunk = nativeTokens.join('');
      const nonNativeChunk =
        nonNativeForcedSuffixes.length > 0 ? `.${nonNativeForcedSuffixes.join('.')}` : '';
      // Do not append activator (.-a) for the native branch; activator gates only the forced branch
      selectors.push(`.${className}${nativeChunk}${nonNativeChunk}`);
    }

    // Forced branch: .abc.-s.-h.-a (when allowed)
    const allowForced =
      allForcedSuffixes.length > 0 && (forceState === true || states.includes('disabled'));
    const activator = stateActivator.activator;
    if (allowForced) selectors.push(`.${className}.${allForcedSuffixes.join('.')}.${activator}`);

    // If we couldn't build any branch, fall back to base selector
    if (selectors.length === 0) return [`.${className}`];
    return selectors;
  };

  // Build selectors where the parent state gates the child (.-a... .abc)
  const buildRefSelectors = (): string[] => {
    const parentStates = states;
    if (parentStates.length === 0) throw new Error(ERROR_REF_REQUIRE_STATE_NUMERIC);

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

    // Native parent branch: .-a:hover[.nonNative] .abc
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

    // Forced parent branch: .-a.-s.-h .abc (when allowed)
    if (
      allForcedSuffixes.length > 0 &&
      (forceState === true || parentStates.includes('disabled'))
    ) {
      const activator = stateActivator.activator;
      parentSelectors.push(`.${activator}.${allForcedSuffixes.join('.')} .${className}`);
    }

    if (parentSelectors.length === 0) throw new Error(ERROR_REF_REQUIRE_STATE_NUMERIC);
    return parentSelectors;
  };

  // Detect responsive size/breakpoint ("++" optional with optional "::bp:*")
  // We ignore the size itself for the rule, but if a breakpoint token is provided,
  // we wrap the rule with an appropriate min-width media query based on schema breakpoints.
  const head = styleKey.split('__')[0] ?? '';
  const hasSize = head.includes('++');
  let mediaQuery: string | undefined;
  if (hasSize) {
    const after = head.slice(head.indexOf('++') + 2);
    const hasBp = after.includes('::');
    if (hasBp) {
      const [/*sizeToken*/ , bpToken] = after.split('::');
      const bpPx = (schemaBreakpoints as Record<string, number>)[bpToken];
      if (bpPx != null) {
        mediaQuery = `@media (min-width: ${bpPx}px)`;
      } else {
        throw new Error(`Invalid breakpoint token: ${bpToken}`);
      }
    }
  }

  // Assemble the final CSS rule: join selectors by comma and emit border-radius with the parsed px value.
  const selectors = isRef ? buildRefSelectors() : buildInlineSelectors();
  const selector = selectors.join(', ');
  const rule = `${selector} { --k-br: ${px}px; border-radius: ${px}px }`;
  return mediaQuery ? `${mediaQuery} { ${rule} }` : rule;
}
