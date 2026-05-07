import type {
  BreakpointValue,
  ElementSizeValue,
  InteractionState,
  SelectedInteractionStateToken,
  StyleKey
} from '@kiskadee/core';

export interface BuildStyleKeyParams {
  /**
   * CSS property name (e.g. "margin", "color", "shadow").
   */
  propertyName: string;

  /**
   * Value to be encoded into the key. Primitive values are stringified;
   * non-primitives are JSON-stringified.
   */
  value: unknown;

  /**
   * Optional flag to indicate this key belongs to the control (selected/on) scope.
   * When true, the interactionState must be one of: 'rest' | 'hover' | 'pressed' | 'focus'.
   */
  controlState?: boolean | undefined;

  /**
   * Optional interaction/component state.
   * - If controlState is true: must be 'rest' | 'hover' | 'pressed' | 'focus'.
   * - Otherwise: a base InteractionState (e.g., 'rest' | 'hover' | 'pressed' | 'focus' | 'disabled' | 'readOnly' | 'filled' | 'selected').
   * Required when isRef is true (and must not be a rest variant: 'rest' or, when controlState is true, 'rest').
   */
  interactionState?: InteractionState | undefined;

  /**
   * Whether this key is a "reference" variant. When true, a non-"rest"
   * interaction state must be provided; otherwise an error is thrown.
   */
  isRef?: boolean | undefined;

  /**
   * Optional size/scale identifier (e.g., "s:md:1", "s:lg:1").
   */
  size?: ElementSizeValue | undefined;

  /**
   * Optional responsive breakpoint (e.g., "bp:sm:1").
   * Only used in combination with size.
   */
  breakpoint?: BreakpointValue | undefined;
}

/**
 * Delimiters used to construct a unique style key string:
 *
 * - PROPERTY_VALUE: separates the property name from its value
 * - STATE: appends an interaction state to the property
 * - SIZE: appends a size identifier to the property
 * - BREAKPOINT: appends a responsive breakpoint to the size
 * - REF_STATE: appends a non-rest interaction state when it's a reference
 */
export const SEPARATORS = {
  BREAKPOINT: '::',
  REF_STATE: '==',
  SIZE: '++',
  STATE: '--',
  VALUE: '__'
};

/**
 * Builds a single style key string representing a combination of:
 *   - CSS property name
 *   - optional interaction/component state (hover, focus, filled, etc.)
 *   - optional size (+ optional breakpoint)
 *   - property value (primitive stringified, non-primitive JSON stringified)
 *
 * Examples:
 *   - "margin__16"                          (base value)
 *   - "margin++small__16"                   (with size)
 *   - "margin++small::md__16"               (with size + breakpoint)
 *   - "color==hover__\"#ff0000\""           (reference color on hover)
 *   - "shadow--focus__[4,4,8,[0,0,0,0.5]]"  (shadow values on focus)
 *
 * Notes:
 *   - When size is provided, interactionState and isRef are ignored for key construction.
 *   - When isRef is true, interactionState must be provided and cannot be "rest",
 *     otherwise an error is thrown.
 *
 * @param propertyName     CSS property name (e.g. "margin", "color", "shadow")
 * @param value            Raw or serializable value
 * @param interactionState Interaction state. When controlState is true, it must be one of
 *                         'selected:rest' | 'selected:hover' | 'selected:pressed' | 'selected:focus'.
 *                         Otherwise, it must be a base InteractionState (e.g., 'rest', 'hover').
 * @param controlState
 * @param isRef            Indicates a reference key; requires a non-'rest' variant
 *                         (for example 'hover', 'disabled', 'filled', or a selected:* state)
 * @param size             Size identifier (e.g., "s:md:1", "s:lg:1")
 * @param breakpoint       Breakpoint identifier (e.g., "bp:sm:1")
 * @returns A unique style key string
 * @throws If isRef is true without a non-"rest" interactionState
 */
export function buildStyleKey({
  propertyName,
  value,
  interactionState,
  controlState,
  isRef = false,
  size,
  breakpoint
}: BuildStyleKeyParams): StyleKey {
  // Stringify the value: primitives via String(value), others via JSON.stringify
  const valueString =
    typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value);

  // 1) State normalization and validation (done first so size branch can include state)
  let effectiveState: InteractionState | SelectedInteractionStateToken | undefined;

  if (controlState === true) {
    // In control (selected) scope. interactionState must be rest|hover|pressed|focus.
    if (interactionState === undefined) {
      throw new Error(
        'buildStyleKey: when controlState=true you must provide interactionState as one of rest|hover|pressed|focus'
      );
    }

    if (interactionState === 'selected') {
      throw new Error(
        `buildStyleKey: interactionState 'selected' is redundant when controlState=true; use rest|hover|pressed|focus`
      );
    }

    if (interactionState === 'disabled' || interactionState === 'readOnly') {
      throw new Error(
        `buildStyleKey: interactionState '${interactionState}' is not supported when controlState=true`
      );
    }

    if (
      interactionState !== 'rest' &&
      interactionState !== 'hover' &&
      interactionState !== 'pressed' &&
      interactionState !== 'focus'
    ) {
      throw new Error(
        `buildStyleKey: invalid interactionState for controlState=true (got ${interactionState}); expected one of rest|hover|pressed|focus`
      );
    }

    effectiveState = `selected:${interactionState}`;
  } else {
    // Not in control scope. Use the provided base InteractionState as-is.
    effectiveState = interactionState;
  }

  // 2) Size/scale branch
  //    Support combining state + size, omitting "--rest" for the base non-selected case.
  //    Formats:
  //      - property++size__value (when no state or base rest)
  //      - property--state++size__value (when a non-rest state or selected:* is provided)
  //      - property--state++size::breakpoint__value (with breakpoint)
  if (size !== undefined) {
    const bpSuffix = breakpoint !== undefined ? `${SEPARATORS.BREAKPOINT}${breakpoint}` : '';
    const isRestVariant = effectiveState === undefined || effectiveState === 'rest';
    if (isRestVariant) {
      return `${propertyName}${SEPARATORS.SIZE}${size}${bpSuffix}${SEPARATORS.VALUE}${valueString}`;
    }
    return `${propertyName}${SEPARATORS.STATE}${effectiveState}${SEPARATORS.SIZE}${size}${bpSuffix}${SEPARATORS.VALUE}${valueString}`;
  }

  // 3) Reference branch (only for non-size keys)
  //    Format: property==state__value
  //    Requires: isRef===true and effectiveState !== undefined and not a base 'rest'
  //    Note: selected:rest is allowed (ref under selected scope)
  const isRestVariant = effectiveState === 'rest';
  if (isRef === true && effectiveState !== undefined && !isRestVariant) {
    return `${propertyName}${SEPARATORS.REF_STATE}${effectiveState}${SEPARATORS.VALUE}${valueString}`;
  }

  // 4) Invalid reference combination
  if (isRef === true) {
    throw new Error(
      `buildStyleKey: when isRef=true you must supply a non-'rest' interaction state (got ${effectiveState ?? 'undefined'})`
    );
  }

  // 5) Non-reference state branch
  //    Format: property--state__value
  if (effectiveState !== undefined) {
    // Omit '--rest' for base non-selected
    if (effectiveState === 'rest') {
      return `${propertyName}${SEPARATORS.VALUE}${valueString}`;
    }
    return `${propertyName}${SEPARATORS.STATE}${effectiveState}${SEPARATORS.VALUE}${valueString}`;
  }

  // 6) Base case (no state, no scale, non-ref)
  //    Format: property__value
  return `${propertyName}${SEPARATORS.VALUE}${valueString}`;
}
