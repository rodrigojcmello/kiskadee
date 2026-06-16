import type {
  ElementSizeValue,
  InteractionState,
  ShadowEffectSchema,
  ShadowGlobalEffectSchema,
  ShadowLayer,
  ShadowSchema,
  ShadowValue,
  SolidColor,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import { buildStyleKey, deepUpdate } from '../../utils/index.ts';

/**
 * Gets a shadow property value for the given interaction state, falling back to 'rest' then to a
 * default.
 */
function getShadowValue<T>(
  property: Partial<Record<InteractionState, T>>,
  state: InteractionState,
  defaultValue: T
): T {
  return property[state] !== undefined
    ? property[state]
    : property.rest !== undefined
      ? property.rest
      : defaultValue;
}

const ZERO_SHADOW: readonly ShadowLayer[] = [
  { x: 0, y: 0, blur: 0, spread: 0, color: [0, 0, 0, 0] }
];

function normalizeShadowValue(value: ShadowValue): readonly ShadowLayer[] {
  return Array.isArray(value) ? value : [value];
}

function getShadowLevel(
  globalShadow: ShadowGlobalEffectSchema,
  level: ElementSizeValue
): readonly ShadowLayer[] {
  const value = globalShadow.levels[level];
  if (!value) {
    throw new Error(`Unknown shadow level "${level}".`);
  }
  return normalizeShadowValue(value);
}

/**
 * Converts an element's shadow schema into style keys organized by interaction state.
 *
 * Gathers all interaction states present in the shadow properties (x, y, blur, color),
 * falls back to 'rest' or defaults for missing values, and generates a combined
 * shadow style key per state using {@link buildStyleKey}.
 *
 * @param shadow - The ShadowSchema defining interaction-based shadow settings.
 * @returns A map from InteractionState to an array of shadow style key strings.
 */
export function convertElementShadowToStyleKeys(shadow: ShadowSchema): StyleKeysByInteractionState {
  const styleKeys: StyleKeysByInteractionState = {};

  // CSS treats box-shadow as a single property, so combine x, y, blur, and color for each state.
  const hasShadowProperty =
    'color' in shadow || 'blur' in shadow || 'spread' in shadow || 'y' in shadow || 'x' in shadow;

  if (hasShadowProperty) {
    const { color = {}, blur = {}, spread = {}, y = {}, x = {} } = shadow;
    const allStates = new Set<InteractionState>([
      ...Object.keys(color),
      ...Object.keys(blur),
      ...Object.keys(spread),
      ...Object.keys(y),
      ...Object.keys(x)
    ] as InteractionState[]);
    allStates.add('rest');

    for (const state of allStates) {
      const shadowX = getShadowValue(x, state, 0);
      const shadowY = getShadowValue(y, state, 0);
      const shadowBlur = getShadowValue(blur, state, 0);
      const shadowSpread = getShadowValue(spread, state, 0);
      const shadowColor: SolidColor = getShadowValue(color, state, [0, 0, 0, 1]);
      const styleKey = buildStyleKey({
        propertyName: 'shadow',
        interactionState: state,
        value:
          shadowSpread === 0
            ? [shadowX, shadowY, shadowBlur, shadowColor]
            : [shadowX, shadowY, shadowBlur, shadowSpread, shadowColor]
      });

      deepUpdate(styleKeys, [state], (arr: string[] = []) => [...arr, styleKey]);
    }
  }

  return styleKeys;
}

export function convertComponentShadowToStyleKeys(
  shadow: ShadowEffectSchema,
  globalShadow: ShadowGlobalEffectSchema
): StyleKeysByInteractionState {
  const styleKeys: StyleKeysByInteractionState = {};

  for (const [rawState, level] of Object.entries(shadow.states ?? {})) {
    const interactionState = rawState as InteractionState;
    const value = level === false ? ZERO_SHADOW : getShadowLevel(globalShadow, level);
    const styleKey = buildStyleKey({
      propertyName: 'shadow',
      interactionState,
      value
    });

    deepUpdate(styleKeys, [interactionState], (arr: string[] = []) => [...arr, styleKey]);
  }

  for (const level of shadow.fixedLevels ?? []) {
    const value = getShadowLevel(globalShadow, level);
    const styleKey = buildStyleKey({
      propertyName: 'shadow',
      size: level,
      value
    });

    deepUpdate(styleKeys, ['rest'], (arr: string[] = []) => [...arr, styleKey]);
  }

  return styleKeys;
}
