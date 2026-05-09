import {
  type HSLA,
  InteractionStateCssPseudoSelector,
  type ProjectedStateKeys,
  type PseudoSelectorKeys,
  projectedStateActivator,
  stateActivator
} from '@kiskadee/core';
import {
  DEFAULT_ELEMENT_STYLE_EMISSION_POLICY,
  type ResolvedElementStyleEmissionPolicy
} from '../../../style-emission/web-build-policy.ts';
import {
  INVALID_SHADOW_COLOR_VALUE,
  UNSUPPORTED_INTERACTION_STATE,
  UNSUPPORTED_PROPERTY_NAME,
  UNSUPPORTED_VALUE
} from '../../errorMessages.ts';
import { convertHslaToHex } from '../../utils/convertHslaToHex.ts';

export type TransformShadowKeyToCssOptions = {
  styleEmissionPolicy?: ResolvedElementStyleEmissionPolicy;
};

function getProjectedStateSuffix(state: string): string {
  return Object.hasOwn(projectedStateActivator, state)
    ? projectedStateActivator[state as ProjectedStateKeys]
    : '';
}

/**
 * Builds CSS rule(s) that set the box-shadow property from a compact shadow style key.
 *
 * Supports inline interaction states and emits both native pseudo selectors and
 * projected state selectors (using the activator class "-a"), similar to border-radius.
 *
 * Accepted keys:
 * - "shadow__[x,y,blur,[h,l,s,a]]"                 — default (rest)
 * - "shadow--<state>__[x,y,blur,[h,l,s,a]]"        — inline interaction state
 *
 * Notes:
 * - This transformer does not implement parent reference ("==") because shadow keys are not
 *   generated as references in the current pipeline. It can be added later if needed.
 */
export function transformShadowKeyToCss(
  styleKey: string,
  className: string,
  forceState?: boolean,
  options?: TransformShadowKeyToCssOptions
): string {
  // Extract the optional interaction state and the bracketed value.
  const regex = /^shadow(?:--(\w+))?__\[(.*)]$/;
  const match = styleKey.match(regex);

  if (match === null) throw new Error(UNSUPPORTED_PROPERTY_NAME('shadow', styleKey));

  // Determine interaction state or default to "rest".
  const [, rawInteractionState = 'rest', shadowValue = ''] = match;
  const interactionState = rawInteractionState;
  const hasUnsupportedInteractionState = !(interactionState in InteractionStateCssPseudoSelector);
  if (hasUnsupportedInteractionState) {
    throw new Error(UNSUPPORTED_INTERACTION_STATE(interactionState, styleKey));
  }

  // Map to CSS pseudo (empty when rest or non-native states like disabled/selected).
  const cssPseudo = InteractionStateCssPseudoSelector[interactionState as PseudoSelectorKeys] || '';

  // Parse value: x,y,blur,color
  const parts = shadowValue.match(/^([\d.]+),([\d.]+),([\d.]+),(.*)$/);
  if (parts === null) throw new Error(UNSUPPORTED_VALUE('shadow', shadowValue, styleKey));

  const x = Number(parts[1]);
  const y = Number(parts[2]);
  const blur = Number(parts[3]);
  const colorPart = parts[4].trim();

  // Convert HSLA array to hexadecimal string
  let hexColor: string;
  try {
    const hsla = JSON.parse(colorPart) as HSLA;
    hexColor = convertHslaToHex(hsla);
  } catch {
    throw new Error(INVALID_SHADOW_COLOR_VALUE);
  }

  // Optimize zero lengths: CSS allows omitting the unit for 0 values
  const formatPx = (n: number): string => (n === 0 ? '0' : `${n}px`);
  const styleEmissionPolicy = options?.styleEmissionPolicy ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY;
  const decl =
    styleEmissionPolicy.shadowEmission === 'token'
      ? `{ --k-sh-x: ${formatPx(x)}; --k-sh-y: ${formatPx(y)}; --k-sh-blur: ${formatPx(blur)}; --k-sh-color: ${hexColor} }`
      : `{ box-shadow: ${formatPx(x)} ${formatPx(y)} ${formatPx(blur)} ${hexColor} }`;

  // Build selectors
  const selectors: string[] = [];
  const eSuffix = stateActivator.shadow;

  // Native branch when a native pseudo exists — always gate with shadow activation class
  if (cssPseudo) {
    selectors.push(`.${className}.${eSuffix}${cssPseudo}`);
  } else if (interactionState === 'rest') {
    // Base rest state with no pseudo — gate with shadow activation class
    selectors.push(`.${className}.${eSuffix}`);
  }

  // Projected branch uses projectedStateActivator + activator (.-a), and is also gated by shadow activation.
  const suffix = getProjectedStateSuffix(interactionState);
  const allowForced =
    suffix !== '' &&
    (forceState === true || interactionState === 'disabled' || interactionState === 'readOnly');
  if (allowForced) {
    const activator = stateActivator.activator;
    selectors.push(`.${className}.${eSuffix}.${suffix}.${activator}`);
  }

  // Fallback: if nothing collected (e.g., non-native state without force enabled but should still style)
  if (selectors.length === 0) selectors.push(`.${className}.${eSuffix}`);

  return `${selectors.join(', ')} ${decl}`;
}
