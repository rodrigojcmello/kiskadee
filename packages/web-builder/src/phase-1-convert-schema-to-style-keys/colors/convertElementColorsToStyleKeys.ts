import type {
  Color,
  ColorProperty,
  ColorValue,
  ElementPalettes,
  Emphasis,
  InteractionState,
  InteractionStateColorMap,
  SegmentName,
  SelectedInteractionStateToken,
  SelectedInteractionSubMap,
  SemanticColor,
  StyleKey,
  StyleKeyByElement,
  ThemeMode
} from '@kiskadee/core';
import { buildStyleKey, deepUpdate } from '../../utils';

// Metadata to track which emphasis track(s) generated each style key.
//
// Important: different tracks (subtle/vivid) may legitimately produce the same StyleKey
// when their resolved color values are identical. In that case we must retain BOTH
// tracks; otherwise downstream bucketing (f/d) becomes order-dependent.
export type ToneMetadata = {
  tones?: Emphasis[]; // undefined = color without emphasis (single/unique color)
};

function addToneMetadata(
  toneMetadata: Map<StyleKey, ToneMetadata>,
  styleKey: StyleKey,
  tone: Emphasis
): void {
  const existing = toneMetadata.get(styleKey);
  const tones = existing?.tones ?? [];
  if (tones.includes(tone)) {
    return;
  }
  toneMetadata.set(styleKey, { tones: [...tones, tone] });
}

// Local type guards to avoid any
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isRefValue(val: Color | ColorValue): val is { ref?: Color | undefined } {
  return isPlainObject(val) && 'ref' in val;
}

function isSelectedSubMap(val: unknown): val is SelectedInteractionSubMap {
  // Detect by presence of any known selected-submap keys; rest is now optional
  if (!isPlainObject(val)) return false;
  return 'rest' in val || 'hover' in val || 'pressed' in val || 'focus' in val;
}

function isInteractionStateColorMap(val: unknown): val is InteractionStateColorMap {
  // Detect by presence of any known keys; rest is now optional
  if (!isPlainObject(val)) return false;
  return (
    'rest' in val ||
    'hover' in val ||
    'pressed' in val ||
    'focus' in val ||
    'selected' in val ||
    'disabled' in val ||
    'readOnly' in val
  );
}

/**
 * Converts an element's color palettes schema into nested style keys.
 *
 * High-level behavior:
 * - Iterates over segments (e.g., ios, youtube) and their themes (light, dark, darker).
 * - For each color property (textColor, borderColor, boxColor, ...), handles:
 *   - a map of semantic colors (primary, secondary, greenLike, yellowLike, redLike, neutral)
 * - For every interaction state found (rest, hover, focus, ...), it:
 *   - Detects whether the color entry is a direct value or a { ref: ... } reference.
 *   - Serializes the color as a string before passing to buildStyleKey:
 *       - When isRef is true, the underlying referenced color is stringified.
 *       - When isRef is false, the direct color value is stringified.
 *   - Uses buildStyleKey to encode propertyName, state, isRef, and serialized value
 *     into a stable StyleKey (e.g., "textColor--rest__[0,0,0,1]" or
 *     "textColor==hover__[0,0,0,0.5]").
 * - Appends the generated key to a nested output structure organized by:
 *     segmentName -> themeName -> semanticColor -> interactionState -> StyleKey[]
 * - Additionally tracks which emphasis (subtle/vivid) generated each style key in a parallel Map
 *
 * Why pre-stringify color values:
 * - buildStyleKey stringifies primitives via String(value) and JSON-serializes non-primitives.
 * - Colors here are arrays (e.g., [h, s, l, a]) or references to arrays. By explicitly
 *   JSON.stringify-ing these values into a string, we guarantee a predictable output
 *   like "[0,0,0,1]" at the end of the key (after "__").
 *
 * Notes:
 * - This function only produces style keys; it does not validate color formats or states.
 *   Validation and error handling occur when transforming keys into CSS in a later phase.
 *
 * @param palettes - The ElementPalettes object defining palettes organized by segment and theme.
 * @returns An object with styleKeys and toneMetadata Map tracking emphasis info for each key.
 */
export function convertElementColorsToStyleKeys(palettes: ElementPalettes): {
  styleKeys: StyleKeyByElement['palettes'];
  toneMetadata: Map<StyleKey, ToneMetadata>;
} {
  const styleKeys: StyleKeyByElement['palettes'] = {};
  const toneMetadata = new Map<StyleKey, ToneMetadata>();

  // Iterate over segments (for example, ios, youtube, appletv)
  for (const segmentName in palettes) {
    const segment = palettes[segmentName as keyof ElementPalettes];
    if (!segment) continue;

    // Iterate over themes within each segment (e.g., light, dark, darker)
    for (const themeName in segment) {
      const colorSchema = segment[themeName as ThemeMode];
      if (!colorSchema) continue;

      for (const c in colorSchema) {
        const colorProperty = c as ColorProperty;
        const colorEntry = colorSchema[colorProperty];
        if (colorEntry === undefined) continue;

        // The new schema requires emphasis tracks (subtle/vivid) under each semantic color.
        // Reject legacy direct InteractionStateColorMap at the property root.
        if (isInteractionStateColorMap(colorEntry)) {
          throw new Error(
            'Invalid color schema: direct interaction-state maps are no longer supported. Use subtle/vivid tracks under each semantic color.'
          );
        }
        type SemanticEntry = Record<Emphasis, InteractionStateColorMap> | unknown;
        const semanticColorMap: Partial<Record<SemanticColor, SemanticEntry>> =
          colorEntry as Partial<Record<SemanticColor, SemanticEntry>>;

        // Helper that processes a plain interaction-state map (rest/hover/pressed/focus/selected)
        const processInteractionStateMap = (
          semanticColor: SemanticColor,
          interactionStateMap: InteractionStateColorMap,
          tone?: Emphasis
        ) => {
          const keys: (keyof InteractionStateColorMap)[] = [
            'rest',
            'hover',
            'pressed',
            'focus',
            'selected',
            'disabled',
            'readOnly'
          ];
          for (const interactionState of keys) {
            const rawValue =
              interactionStateMap[interactionState as keyof InteractionStateColorMap];
            if (rawValue === undefined) continue;

            // Handle the enriched "selected" submap shape: { rest, hover?, pressed?, focus? }.
            if (interactionState === 'selected' && isSelectedSubMap(rawValue)) {
              const sub = rawValue as SelectedInteractionSubMap;

              // Helper to push a key under a given state label
              const push = (
                stateLabel: InteractionState | SelectedInteractionStateToken,
                val: ColorValue | Color | undefined
              ) => {
                if (val === undefined) return; // skip undefined values entirely
                const isRef = isRefValue(val);
                const inner = isRef ? (val as { ref?: Color | undefined }).ref : (val as Color);
                if (inner === undefined) return; // { ref: undefined } -> skip
                const color = inner;

                // For the selected scope, we pass controlState=true and the base interaction (rest/hover/pressed/focus)
                if (stateLabel.startsWith('selected:')) {
                  const baseInteraction = stateLabel.split(':')[1] as InteractionState; // 'rest' | 'hover' | 'pressed' | 'focus'
                  const styleKey = buildStyleKey({
                    propertyName: colorProperty,
                    controlState: true,
                    interactionState: baseInteraction,
                    isRef,
                    value: color
                  });
                  deepUpdate(
                    styleKeys,
                    [segmentName, themeName, semanticColor, stateLabel],
                    (arr: string[] = []) => [...arr, styleKey]
                  );
                  // Store emphasis metadata
                  if (tone !== undefined) {
                    addToneMetadata(toneMetadata, styleKey, tone);
                  }
                } else {
                  const styleKey = buildStyleKey({
                    propertyName: colorProperty,
                    interactionState: stateLabel as InteractionState,
                    isRef,
                    value: color
                  });
                  deepUpdate(
                    styleKeys,
                    [segmentName, themeName, semanticColor, stateLabel],
                    (arr: string[] = []) => [...arr, styleKey]
                  );
                  // Store emphasis metadata
                  if (tone !== undefined) {
                    addToneMetadata(toneMetadata, styleKey, tone);
                  }
                }
              };

              // selected/rest
              push('selected:rest', sub.rest);
              // selected/hover
              if (sub.hover !== undefined) push('selected:hover', sub.hover);
              // selected/pressed
              if (sub.pressed !== undefined) push('selected:pressed', sub.pressed);
              // selected/focus
              if (sub.focus !== undefined) push('selected:focus', sub.focus);

              continue;
            }

            // A reference has the shape { ref: <color> }. We pass isRef accordingly and serialize
            // the "inner" color when a ref is present.
            const val = rawValue as ColorValue | Color | undefined;
            if (val === undefined) continue;
            const isRef = isRefValue(val);
            const inner = isRef ? (val as { ref?: Color | undefined }).ref : (val as Color);
            if (inner === undefined) continue; // skip { ref: undefined }

            // Build the style key including the interaction state and whether this is a ref.
            // Examples:
            //   - Non-ref: textColor--rest__[0,0,0,1]
            //   - Ref:     textColor==hover__[0,0,0,0.5]
            const styleKey = buildStyleKey({
              propertyName: colorProperty,
              interactionState: interactionState,
              isRef,
              value: inner
            });

            // Insert the key in a nested structure:
            //   styleKeys[segmentName][themeName][semanticColor][interactionState] = [...StyleKey[]]
            deepUpdate(
              styleKeys,
              [segmentName, themeName, semanticColor, interactionState],
              (arr: string[] = []) => [...arr, styleKey]
            );

            // Store emphasis metadata for this style key
            if (tone !== undefined) {
              addToneMetadata(toneMetadata, styleKey, tone);
            }
          }
        };

        for (const s in semanticColorMap) {
          const semanticColor = s as SemanticColor;
          const entry = semanticColorMap[semanticColor];

          // Support emphasis tracks (subtle/vivid) as an intermediate level under the semantic color.
          const hasSubtleOrVivid =
            entry && typeof entry === 'object' && ('subtle' in entry || 'vivid' in entry);
          if (hasSubtleOrVivid) {
            const tracks = ['subtle', 'vivid'] as const;
            for (const t of tracks) {
              const trackEntry = (entry as Record<'subtle' | 'vivid', unknown>)[t];
              if (isInteractionStateColorMap(trackEntry)) {
                processInteractionStateMap(semanticColor, trackEntry, t);
              }
            }
            continue;
          }

          // Fallback: legacy shape (direct interaction-state map under a semantic color) is no longer supported
          if (isInteractionStateColorMap(entry)) {
            throw new Error(
              `Invalid color schema: semantic color "${semanticColor}" must define subtle/vivid tracks.`
            );
          }
        }
      } // End colorProperty loop
    } // End theme loop
  } // End segment loop

  return { styleKeys, toneMetadata };
}
