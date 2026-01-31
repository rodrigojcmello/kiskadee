import type {
  InteractionState,
  NumericByInteractionState,
  NumericWithSelected,
  ResponsiveNumeric,
  SelectedInteractionState,
  SelectedInteractionStateToken,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import { buildStyleKey, deepUpdate } from '../../utils';

/**
 * Converts the borderRadius effect schema into StyleKey lists grouped by interaction state.
 *
 * Input shape mirrors palettes/colors with optional nested "selected" scope:
 *   {
 *     rest?: number | ResponsiveNumeric,
 *     hover?: number | ResponsiveNumeric,
 *     pressed?: number | ResponsiveNumeric,
 *     focus?: number | ResponsiveNumeric,
 *     disabled?: number | ResponsiveNumeric,
 *     readOnly?: number | ResponsiveNumeric,
 *     selected?: {
 *       rest: number | ResponsiveNumeric,
 *       hover?: number | ResponsiveNumeric,
 *       pressed?: number | ResponsiveNumeric,
 *       focus?: number | ResponsiveNumeric,
 *     }
 *   }
 *
 * Emitted key patterns (examples):
 *   - Inline state:      "borderRadius--hover__18"
 *   - Selected inline:   "borderRadius--selected:hover__12" (via controlState=true)
 *   - Responsive size:   "borderRadius--hover++s:md:1__18"
 *   - All sizes:         "borderRadius__18" (when token is "s:all")
 *
 * Notes:
 *   - We only add "--rest" when in the selected scope; otherwise rest omits the state for brevity.
 *   - No logic other than key generation; CSS translation is handled later in phase-4.
 */
export function convertElementBorderRadiusToStyleKeys(
  borderRadius: NumericWithSelected,
  propertyName: 'borderRadiusRounded' | 'borderRadiusFull'
): StyleKeysByInteractionState {
  const out: Partial<Record<InteractionState | SelectedInteractionStateToken, string[]>> = {};

  const valueMap = (borderRadius ?? {}) as NumericByInteractionState & {
    selected?: NumericByInteractionState;
  };

  // Helper to emit a key for a numeric or responsive numeric value
  const emit = (
    controlState: boolean,
    interactionState: InteractionState,
    val: ResponsiveNumeric
  ): void => {
    // Responsive map: iterate size/breakpoint entries
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const entries = Object.entries(val as Record<string, number>);
      if (entries.length > 0) {
        for (const [token, px] of entries) {
          const stateLabel: InteractionState | SelectedInteractionStateToken = controlState
            ? (`selected:${interactionState}` as SelectedInteractionStateToken)
            : interactionState;

          if (token === 's:all') {
            const styleKey = buildStyleKey({
              propertyName,
              value: px,
              interactionState: interactionState,
              controlState: controlState || undefined
            });
            deepUpdate(out, [stateLabel], (arr: string[] = []) => [...arr, styleKey]);
            continue;
          }

          // For specific size tokens, DO NOT encode size in the style key; size is applied via class mapping later.
          const styleKey = buildStyleKey({
            propertyName,
            value: px,
            interactionState: interactionState,
            controlState: controlState || undefined
          });
          deepUpdate(out, [stateLabel], (arr: string[] = []) => [...arr, styleKey]);
        }
        return;
      }
    }

    // Simple numeric value
    const isBaseRest = controlState !== true && interactionState === 'rest';
    const styleKey = buildStyleKey({
      propertyName,
      value: val,
      interactionState: isBaseRest ? undefined : interactionState,
      controlState: controlState || undefined
    });
    const stateLabel: InteractionState | SelectedInteractionStateToken = controlState
      ? (`selected:${interactionState}` as SelectedInteractionStateToken)
      : interactionState;
    deepUpdate(out, [stateLabel], (arr: string[] = []) => [...arr, styleKey]);
  };

  // Collect base states present on valueMap
  const baseStates: Exclude<InteractionState, 'selected'>[] = [
    'rest',
    'hover',
    'pressed',
    'focus',
    'disabled',
    'readOnly'
  ];
  for (const st of baseStates) {
    const v = valueMap[st];
    if (v !== undefined) emit(false, st, v);
  }

  // Selected sub-map
  const selected = valueMap.selected;
  if (selected) {
    const selStates: SelectedInteractionState[] = ['rest', 'hover', 'pressed', 'focus'];
    for (const st of selStates) {
      const v = selected[st];
      if (v !== undefined) emit(true, st, v);
    }
  }

  // Transition is not converted into style keys for now; can be a future separate key if needed.

  return out;
}
