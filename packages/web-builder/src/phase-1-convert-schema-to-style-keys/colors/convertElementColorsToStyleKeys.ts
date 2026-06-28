import type {
  Color,
  ColorProperty,
  ColorValue,
  ComponentEmphasis,
  ElementPalettes,
  InteractionState,
  InteractionStateColorMap,
  SelectedInteractionStateToken,
  SelectedInteractionSubMap,
  SemanticColor,
  StyleKey,
  StyleKeyByElement,
  ThemeMode
} from '@kiskadee/core';
import { interactionStateKeys } from '@kiskadee/core';
import { buildStyleKey, deepUpdate } from '../../utils/index.ts';

// Metadata to track which emphasis track(s) generated each style key.
//
// Important: different tracks (highest/high/medium/low/lowest) may legitimately produce the same StyleKey
// when their resolved color values are identical. In that case we must retain the local tracks
// for the current consumer, otherwise downstream hh/h/m/l/ll bucketing becomes order-dependent.
export type ToneMetadata = {
  tones?: ComponentEmphasis[]; // undefined = color without emphasis (single/unique color)
};

export type PaletteKey = string;
export type ToneMetadataKey = string;

export type ToneMetadataByPalette = Map<PaletteKey, Map<ToneMetadataKey, ToneMetadata>>;

export type ToneMetadataScope = {
  componentName: string;
  variantName?: string;
  modeName?: string;
  elementName: string;
};

export function buildScopedToneMetadataKey(
  scope: ToneMetadataScope,
  toneMetadataKey: ToneMetadataKey
): ToneMetadataKey {
  const variantPart = scope.variantName === undefined ? 'variant' : `variant:${scope.variantName}`;
  const modePart = scope.modeName === undefined ? 'mode' : `mode:${scope.modeName}`;
  return `component:${scope.componentName}::${variantPart}::${modePart}::element:${scope.elementName}::${toneMetadataKey}`;
}

function buildPaletteKey(segmentName: string, themeName: string): PaletteKey {
  // IMPORTANT:
  // This color converter scopes tone/emphasis metadata by palette (segment + theme).
  // Schema-wide component/variant/element ownership is added by the phase 1 aggregator.
  //
  // Rationale:
  // - StyleKey is the identity of a CSS rule. It must remain global so Phase 3/4 can dedupe
  //   classes: same rule/value => same StyleKey => same CSS class.
  // - The emphasis bucket in the JSON artifact is palette- and consumer-specific. The same StyleKey
  //   can be high in one element and medium in another, or high in one palette and medium in another.
  //
  // Therefore, we keep StyleKey global and move ONLY the metadata into scoped maps.
  return `${segmentName}.${themeName}`;
}

function buildToneMetadataKey(params: {
  semanticColor: SemanticColor;
  styleKey: StyleKey;
}): ToneMetadataKey {
  const { semanticColor, styleKey } = params;
  // IMPORTANT: do not include segment/theme or component/element ownership here.
  // StyleKey identity must remain global/deduplicable.
  // Palette scoping is handled by the outer ToneMetadataByPalette map.
  // Element ownership is added by convertElementSchemaToStyleKeys when it merges
  // this element-local metadata into the schema-wide metadata map.
  //
  // We still include `semanticColor` here because the same StyleKey may be reused under
  // different semantics within the same palette, and the artifact buckets are semantic-aware.
  return `${semanticColor}::${styleKey}`;
}

function addToneMetadataByPalette(
  toneMetadataByPalette: ToneMetadataByPalette,
  paletteKey: PaletteKey,
  toneMetadataKey: ToneMetadataKey,
  tone: ComponentEmphasis
): void {
  if (!toneMetadataByPalette.has(paletteKey)) {
    toneMetadataByPalette.set(paletteKey, new Map());
  }
  const byMetaKey = toneMetadataByPalette.get(paletteKey);
  if (!byMetaKey) return;

  const existing = byMetaKey.get(toneMetadataKey);
  const tones = existing?.tones ?? [];
  if (tones.includes(tone)) {
    return;
  }

  // NOTE:
  // Different tracks (highest/high/medium/low/lowest) can legitimately produce the same StyleKey when their
  // resolved color values are identical. In that case we must retain BOTH tones.
  // Downstream, Phase 5 is allowed to put the same CSS class into multiple local hh/h/m/l/ll buckets.
  byMetaKey.set(toneMetadataKey, { tones: [...tones, tone] });
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
  return interactionStateKeys.some((state) => state in val);
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
 * - Additionally tracks which emphasis (highest/high/medium/low/lowest) generated each style key in a parallel Map
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
  toneMetadataByPalette: ToneMetadataByPalette;
} {
  const styleKeys: StyleKeyByElement['palettes'] = {};
  const toneMetadataByPalette: ToneMetadataByPalette = new Map();

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

        // The new schema requires emphasis tracks (highest/high/medium/low/lowest) under each semantic color.
        // Reject legacy direct InteractionStateColorMap at the property root.
        if (isInteractionStateColorMap(colorEntry)) {
          throw new Error(
            'Invalid color schema: direct interaction-state maps are no longer supported. Use highest/high/medium/low/lowest tracks under each semantic color.'
          );
        }
        type SemanticEntry = Record<ComponentEmphasis, InteractionStateColorMap> | unknown;
        const semanticColorMap: Partial<Record<SemanticColor, SemanticEntry>> =
          colorEntry as Partial<Record<SemanticColor, SemanticEntry>>;

        // Helper that processes a plain interaction/component-state map.
        const processInteractionStateMap = (
          semanticColor: SemanticColor,
          interactionStateMap: InteractionStateColorMap,
          tone?: ComponentEmphasis
        ) => {
          const paletteKey = buildPaletteKey(segmentName, themeName);
          for (const interactionState of interactionStateKeys) {
            const rawValue = interactionStateMap[interactionState];
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
                    const key = buildToneMetadataKey({ semanticColor, styleKey });
                    addToneMetadataByPalette(toneMetadataByPalette, paletteKey, key, tone);
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
                    const key = buildToneMetadataKey({ semanticColor, styleKey });
                    addToneMetadataByPalette(toneMetadataByPalette, paletteKey, key, tone);
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
              const paletteKey = buildPaletteKey(segmentName, themeName);
              const key = buildToneMetadataKey({ semanticColor, styleKey });
              addToneMetadataByPalette(toneMetadataByPalette, paletteKey, key, tone);
            }
          }
        };

        for (const s in semanticColorMap) {
          const semanticColor = s as SemanticColor;
          const entry = semanticColorMap[semanticColor];

          // Support emphasis tracks (highest/high/medium/low/lowest) as an intermediate level under the semantic color.
          const hasEmphasisTracks =
            entry &&
            typeof entry === 'object' &&
            ('highest' in entry ||
              'high' in entry ||
              'medium' in entry ||
              'low' in entry ||
              'lowest' in entry);
          if (hasEmphasisTracks) {
            const tracks = ['highest', 'high', 'medium', 'low', 'lowest'] as const;
            for (const t of tracks) {
              const trackEntry = (entry as Record<(typeof tracks)[number], unknown>)[t];
              if (isInteractionStateColorMap(trackEntry)) {
                processInteractionStateMap(semanticColor, trackEntry, t);
              }
            }
            continue;
          }

          // Fallback: legacy shape (direct interaction-state map under a semantic color) is no longer supported
          if (isInteractionStateColorMap(entry)) {
            throw new Error(
              `Invalid color schema: semantic color "${semanticColor}" must define highest/high/medium/low/lowest tracks.`
            );
          }
        }
      } // End colorProperty loop
    } // End theme loop
  } // End segment loop

  return { styleKeys, toneMetadataByPalette };
}
