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

type ParsedShadowLayer = {
  blur: number;
  color: HSLA;
  spread: number;
  x: number;
  y: number;
};

function getProjectedStateSuffix(state: string): string {
  return Object.hasOwn(projectedStateActivator, state)
    ? projectedStateActivator[state as ProjectedStateKeys]
    : '';
}

function parseShadowColor(value: unknown): HSLA {
  if (!Array.isArray(value)) throw new Error(INVALID_SHADOW_COLOR_VALUE);
  return value as HSLA;
}

function parseShadowLayer(value: unknown): ParsedShadowLayer {
  if (Array.isArray(value)) {
    const [x, y, blur, spreadOrColor, maybeColor] = value;
    if (typeof x !== 'number' || typeof y !== 'number' || typeof blur !== 'number') {
      throw new Error(UNSUPPORTED_VALUE('shadow', JSON.stringify(value), 'shadow'));
    }

    if (Array.isArray(spreadOrColor)) {
      return {
        x,
        y,
        blur,
        spread: 0,
        color: parseShadowColor(spreadOrColor)
      };
    }

    if (typeof spreadOrColor === 'number') {
      return {
        x,
        y,
        blur,
        spread: spreadOrColor,
        color: parseShadowColor(maybeColor)
      };
    }
  }

  if (value && typeof value === 'object') {
    const layer = value as Partial<ParsedShadowLayer>;
    if (
      typeof layer.x === 'number' &&
      typeof layer.y === 'number' &&
      typeof layer.blur === 'number'
    ) {
      return {
        x: layer.x,
        y: layer.y,
        blur: layer.blur,
        spread: typeof layer.spread === 'number' ? layer.spread : 0,
        color: parseShadowColor(layer.color)
      };
    }
  }

  throw new Error(UNSUPPORTED_VALUE('shadow', JSON.stringify(value), 'shadow'));
}

function parseShadowLayers(shadowValue: string, styleKey: string): ParsedShadowLayer[] {
  try {
    const parsed = JSON.parse(shadowValue) as unknown;
    if (Array.isArray(parsed)) {
      const isSingleTuple =
        parsed.length >= 4 &&
        typeof parsed[0] === 'number' &&
        typeof parsed[1] === 'number' &&
        typeof parsed[2] === 'number';
      return isSingleTuple ? [parseShadowLayer(parsed)] : parsed.map(parseShadowLayer);
    }
  } catch {
    // Fall through to the legacy compact parser below.
  }

  const parts = shadowValue.match(/^(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(.*)$/);
  if (parts === null) throw new Error(UNSUPPORTED_VALUE('shadow', shadowValue, styleKey));

  const x = Number(parts[1]);
  const y = Number(parts[2]);
  const blur = Number(parts[3]);
  const colorPart = parts[4].trim();

  try {
    return [
      {
        x,
        y,
        blur,
        spread: 0,
        color: JSON.parse(colorPart) as HSLA
      }
    ];
  } catch {
    throw new Error(INVALID_SHADOW_COLOR_VALUE);
  }
}

/**
 * Builds CSS rule(s) that set the box-shadow property from a compact shadow style key.
 *
 * Supports inline interaction states and emits both native pseudo selectors gated by `-n` and
 * projected state selectors (using the activator class "-a"), similar to border-radius.
 *
 * Accepted keys:
 * - "shadow__[x,y,blur,[h,l,s,a]]"                 — default (rest)
 * - "shadow__[x,y,blur,spread,[h,l,s,a]]"          — default (rest with spread)
 * - "shadow__[[x,y,blur,spread,[h,l,s,a]], ...]"   — multi-layer default
 * - "shadow--<state>__[x,y,blur,[h,l,s,a]]"        — inline interaction state
 * - "shadow++<size>__[[x,y,blur,spread,[...]], ...]" — size-aware fixed level
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
  const valueSeparator = styleKey.indexOf('__');
  if (valueSeparator === -1) throw new Error(UNSUPPORTED_PROPERTY_NAME('shadow', styleKey));

  const head = styleKey.slice(0, valueSeparator);
  const shadowValue = styleKey.slice(valueSeparator + 2);
  const headMatch = head.match(/^shadow(?:--([^+]+))?(?:\+\+(.+))?$/);
  if (headMatch === null) throw new Error(UNSUPPORTED_PROPERTY_NAME('shadow', styleKey));

  // Determine interaction state or default to "rest".
  const [, rawInteractionState = 'rest'] = headMatch;
  const interactionState = rawInteractionState;
  const hasUnsupportedInteractionState = !(interactionState in InteractionStateCssPseudoSelector);
  if (hasUnsupportedInteractionState) {
    throw new Error(UNSUPPORTED_INTERACTION_STATE(interactionState, styleKey));
  }

  // Map to CSS pseudo (empty when rest or non-native states like disabled/selected).
  const cssPseudo = InteractionStateCssPseudoSelector[interactionState as PseudoSelectorKeys] || '';

  // Optimize zero lengths: CSS allows omitting the unit for 0 values
  const formatPx = (n: number): string => (n === 0 ? '0' : `${n}px`);
  const layers = parseShadowLayers(shadowValue, styleKey);
  if (layers.length === 0) throw new Error(UNSUPPORTED_VALUE('shadow', shadowValue, styleKey));
  const formatLayer = ({ x, y, blur, spread, color }: ParsedShadowLayer): string => {
    const hexColor = convertHslaToHex(color);
    return `${formatPx(x)} ${formatPx(y)} ${formatPx(blur)} ${formatPx(spread)} ${hexColor}`;
  };
  const styleEmissionPolicy = options?.styleEmissionPolicy ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY;
  const decl =
    styleEmissionPolicy.shadowEmission === 'token'
      ? `{ --k-sh-x: ${formatPx(layers[0].x)}; --k-sh-y: ${formatPx(layers[0].y)}; --k-sh-blur: ${formatPx(layers[0].blur)}; --k-sh-color: ${convertHslaToHex(layers[0].color)} }`
      : `{ box-shadow: ${layers.map(formatLayer).join(', ')} }`;

  // Build selectors
  const selectors: string[] = [];
  const eSuffix = stateActivator.shadow;

  // Native branch when a native pseudo exists — gate with shadow activation and native interaction.
  if (cssPseudo) {
    selectors.push(`.${className}.${eSuffix}.${stateActivator.nativeInteraction}${cssPseudo}`);
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
