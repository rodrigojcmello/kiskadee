import type {
  BorderRadiusEffectSchema,
  ComponentName,
  ComponentStyleKeyMap,
  ScaleSchema,
  Schema,
  StyleKeyByElement,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import { deepUpdate } from '../utils';
import {
  convertElementColorsToStyleKeys,
  type ToneMetadataByPalette
} from './colors/convertElementColorsToStyleKeys';
import { convertElementDecorationsToStyleKeys } from './decoration/convertElementDecorationsToStyleKeys';
import { convertElementBorderRadiusToStyleKeys } from './effects/convertElementBorderRadiusToStyleKeys';
import { convertElementShadowToStyleKeys } from './effects/convertElementShadowToStyleKeys';
import { convertElementScalesToStyleKeys } from './scales/convertElementScalesToStyleKeys';

/**
 * Processes a Schema object by iterating over each component's elements.
 * For each style object, it processes the decoration, scales, and colors
 * (if defined) using their respective methods, and accumulates results
 * into styleKeysByComponent. Also collects emphasis metadata from color processing.
 *
 * @param schema - The Schema object to process.
 * @returns An object containing styleKeys and toneMetadata Map.
 */
export function convertElementSchemaToStyleKeys(schema: Schema): {
  styleKeys: ComponentStyleKeyMap;
  toneMetadataByPalette: ToneMetadataByPalette;
} {
  const styleKeysByComponent: ComponentStyleKeyMap = {};
  const toneMetadataByPalette: ToneMetadataByPalette = new Map();

  // Iterate over each component in the schema.
  for (const c in schema.components) {
    const componentName = c as ComponentName;
    const component = schema.components[componentName];
    if (!component?.elements) continue;

    // Iterate over each element within the component.
    for (const elementName in component.elements) {
      const element = component.elements[elementName];

      deepUpdate<StyleKeyByElement>(styleKeysByComponent, [componentName, elementName], (prev) => {
        const el: Partial<StyleKeyByElement> = prev ? { ...prev } : {};
        if (element.decorations) {
          el.decorations = convertElementDecorationsToStyleKeys(element.decorations);
        }
        if (element.scales) {
          const { borderRadius, ...otherScales } = element.scales as ScaleSchema;
          if (Object.keys(otherScales).length > 0) {
            el.scales = convertElementScalesToStyleKeys(otherScales as ScaleSchema);
          }
          if (borderRadius !== undefined) {
            el.radiusScales = convertElementScalesToStyleKeys({
              borderRadius
            } as ScaleSchema);
          }
        }
        if (element.palettes) {
          const { styleKeys: paletteKeys, toneMetadataByPalette: paletteToneMetadataByPalette } =
            convertElementColorsToStyleKeys(element.palettes);
          el.palettes = paletteKeys;
          // Merge emphasis metadata from this element into the global map, keeping it scoped by palette.
          for (const [paletteKey, byMetaKey] of paletteToneMetadataByPalette) {
            if (!toneMetadataByPalette.has(paletteKey)) {
              toneMetadataByPalette.set(paletteKey, new Map());
            }
            const target = toneMetadataByPalette.get(paletteKey)!;

            for (const [metaKey, meta] of byMetaKey) {
              const existing = target.get(metaKey);
              const existingTones = existing?.tones ?? [];
              const incomingTones = meta?.tones ?? [];
              const mergedTones = Array.from(new Set([...existingTones, ...incomingTones]));
              target.set(metaKey, mergedTones.length ? { tones: mergedTones } : {});
            }
          }
        }
        // Effects: merge multiple effect maps (shadow, borderRadius, ...)
        // Each converter returns a map of InteractionState -> StyleKey[].
        // We concatenate arrays per state to produce a single `effects` map.
        if (element.effects) {
          const effectsMap: StyleKeysByInteractionState = {};
          const appendEffectMap = (map: StyleKeysByInteractionState) => {
            for (const [state, keys] of Object.entries(map)) {
              const arr = keys ?? [];
              if (!arr.length) continue;
              deepUpdate(effectsMap, [state], (prev: string[] = []) => [...prev, ...arr]);
            }
          };
          if (element.effects.shadow) {
            const shadowMap = convertElementShadowToStyleKeys(element.effects.shadow);
            appendEffectMap(shadowMap);
          }
          if (element.effects.borderRadius) {
            const borderRadius: BorderRadiusEffectSchema = element.effects.borderRadius;
            const rounded = borderRadius?.rounded;
            const full = borderRadius?.full;

            if (rounded) {
              const brMap = convertElementBorderRadiusToStyleKeys(rounded, 'borderRadiusRounded');
              appendEffectMap(brMap);
            }

            if (full) {
              const brMap = convertElementBorderRadiusToStyleKeys(full, 'borderRadiusFull');
              appendEffectMap(brMap);
            }
          }
          if (Object.keys(effectsMap).length > 0) {
            el.effects = effectsMap;
          }
        }

        return el as StyleKeyByElement;
      });
    }
  }

  return { styleKeys: styleKeysByComponent, toneMetadataByPalette };
}
