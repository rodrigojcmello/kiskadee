import type {
  BorderRadiusEffectSchema,
  ComponentName,
  ComponentStyleKeyMap,
  ElementAllSizeValue,
  ElementSizeValue,
  RadiusMode,
  ScaleProperty,
  ScaleSchema,
  Schema,
  StyleKeyByElement,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import { buildStyleKey, deepUpdate } from '../utils';
import {
  convertElementColorsToStyleKeys,
  type ToneMetadataByPalette
} from './colors/convertElementColorsToStyleKeys';
import { convertElementDecorationsToStyleKeys } from './decoration/convertElementDecorationsToStyleKeys';
import { convertElementBorderRadiusToStyleKeys } from './effects/convertElementBorderRadiusToStyleKeys';
import { convertElementRippleToStyleKeys } from './effects/convertElementRippleToStyleKeys';
import { convertElementShadowToStyleKeys } from './effects/convertElementShadowToStyleKeys';
import {
  convertElementScalesToStyleKeys,
  type ScaleValue
} from './scales/convertElementScalesToStyleKeys';

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
  // [RIPPLE EFFECT 10] START: Read global ripple config for element-level ripple conversion.
  const rippleConfig = schema.global?.effects?.ripple;
  // [RIPPLE EFFECT 10] END: Read global ripple config for element-level ripple conversion.

  const applyElement = (
    path: string[],
    element: {
      decorations?: any;
      scales?: any;
      palettes?: any;
      effects?: any;
    }
  ) => {
    deepUpdate<StyleKeyByElement>(styleKeysByComponent, path, (prev) => {
        const el: Partial<StyleKeyByElement> = prev ? { ...prev } : {};
        if (element.decorations) {
          el.decorations = convertElementDecorationsToStyleKeys(element.decorations);
        }
        if (element.scales) {
          const { borderRadius, ...otherScales } = element.scales as ScaleSchema;
          if (Object.keys(otherScales).length > 0) {
            el.scales = convertElementScalesToStyleKeys(
              otherScales as Partial<Record<ScaleProperty, ScaleValue>>
            );
          }
          const radiusScales: NonNullable<StyleKeyByElement['radiusScales']> = {};
          if (borderRadius) {
            const modes: RadiusMode[] = ['rounded', 'pill', 'square'];
            const modeValues = {
              rounded: borderRadius.rounded,
              pill: borderRadius.pill,
              square: borderRadius.square
            } as const;

            type RadiusSizeToken = ElementSizeValue | ElementAllSizeValue;
            const sizeMapByMode: Record<RadiusMode, Partial<Record<RadiusSizeToken, unknown>>> = {
              rounded: {},
              pill: {},
              square: {}
            };

            const addSizeValues = (mode: RadiusMode, value: unknown) => {
              if (value === undefined) return;
              if (typeof value === 'number') {
                sizeMapByMode[mode]['s:all'] = value;
                return;
              }
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                for (const [size, sizeValue] of Object.entries(value)) {
                  const sizeToken = size as RadiusSizeToken;
                  sizeMapByMode[mode][sizeToken] = sizeValue;
                }
              }
            };

            for (const mode of modes) {
              addSizeValues(mode, modeValues[mode]);
            }

            const allSizes = new Set<RadiusSizeToken>();
            for (const mode of modes) {
              for (const size of Object.keys(sizeMapByMode[mode])) {
                allSizes.add(size as RadiusSizeToken);
              }
            }

            const valueKey = (value: unknown): string => {
              if (typeof value === 'number') return `n:${value}`;
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                const entries = Object.entries(value as Record<string, number>).sort(([a], [b]) =>
                  a.localeCompare(b)
                );
                return `o:${entries.map(([k, v]) => `${k}:${v}`).join('|')}`;
              }
              return `u:${String(value)}`;
            };

            const emitKeys = (
              propertyName: string,
              size: RadiusSizeToken,
              sizeValue: unknown
            ): string[] => {
              const keys: string[] = [];
              if (typeof sizeValue === 'number') {
                const key = buildStyleKey({ propertyName, value: sizeValue });
                keys.push(key);
                return keys;
              }
              if (sizeValue && typeof sizeValue === 'object' && !Array.isArray(sizeValue)) {
                for (const [bp, value] of Object.entries(sizeValue as Record<string, number>)) {
                  const breakpoint = bp as keyof Schema['breakpoints'];
                  if (bp === 'bp:all') {
                    keys.push(buildStyleKey({ propertyName, value }));
                  } else {
                    if (size === 's:all') {
                      keys.push(buildStyleKey({ propertyName, value }));
                      continue;
                    }
                    keys.push(
                      buildStyleKey({
                        propertyName,
                        value,
                        size,
                        breakpoint
                      })
                    );
                  }
                }
              }
              return keys;
            };

            const propertyNameForMode = (mode: RadiusMode): string => {
              if (mode === 'rounded') return 'borderRadiusRounded';
              if (mode === 'pill') return 'borderRadiusPill';
              return 'borderRadiusSquare';
            };

            for (const size of allSizes) {
              // Dedupe by mode/value: if rounded/pill/square share the same size token value,
              // emit a single generic borderRadius style key so we don't duplicate identical CSS.
              const groups = new Map<string, RadiusMode[]>();
              for (const mode of modes) {
                const sizeValue = sizeMapByMode[mode][size];
                if (sizeValue === undefined) continue;
                const key = valueKey(sizeValue);
                let group = groups.get(key);
                if (!group) {
                  group = [];
                  groups.set(key, group);
                }
                group.push(mode);
              }

              for (const [_groupKey, groupedModes] of groups.entries()) {
                const isShared = groupedModes.length > 1;
                const sharedProperty = isShared ? 'borderRadius' : undefined;
                const sizeValue = sizeMapByMode[groupedModes[0]][size];
                const propertyName = sharedProperty ?? propertyNameForMode(groupedModes[0]);
                const keys = emitKeys(propertyName, size, sizeValue);

                for (const mode of groupedModes) {
                  if (!radiusScales[mode]) radiusScales[mode] = {};
                  const modeScales = radiusScales[mode];
                  if (!modeScales) continue;
                  const sizeKeys = modeScales[size] ?? [];
                  modeScales[size] = [...sizeKeys, ...keys];
                }
              }
            }
          }
          if (Object.keys(radiusScales).length > 0) {
            el.radiusScales = radiusScales;
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
            const target = toneMetadataByPalette.get(paletteKey);
            if (!target) continue;

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
          // [RIPPLE EFFECT 11] START: Emit ripple style keys from global ripple config.
          if (element.effects.ripple) {
            const rippleMap = convertElementRippleToStyleKeys({
              config: rippleConfig
            });
            appendEffectMap(rippleMap);
          }
          // [RIPPLE EFFECT 11] END: Emit ripple style keys from global ripple config.
          if (element.effects.borderRadius) {
            const borderRadius: BorderRadiusEffectSchema = element.effects.borderRadius;
            const rounded = borderRadius?.rounded;
            const pill = borderRadius?.pill;
            const square = borderRadius?.square;

            if (rounded) {
              const brMap = convertElementBorderRadiusToStyleKeys(rounded, 'borderRadiusRounded');
              appendEffectMap(brMap);
            }

            if (pill) {
              const brMap = convertElementBorderRadiusToStyleKeys(pill, 'borderRadiusPill');
              appendEffectMap(brMap);
            }
            if (square) {
              const brMap = convertElementBorderRadiusToStyleKeys(square, 'borderRadiusSquare');
              appendEffectMap(brMap);
            }
          }
          if (Object.keys(effectsMap).length > 0) {
            el.effects = effectsMap;
          }
        }

        return el as StyleKeyByElement;
      });
  };

  // Iterate over each component in the schema.
  for (const c in schema.components) {
    const componentName = c as ComponentName;
    const component = schema.components[componentName] as
      | {
          elements?: Record<string, any>;
          variants?: Record<string, { elements?: Record<string, any> }>;
        }
      | undefined;
    if (!component) continue;

    const variants = component.variants;
    if (variants && typeof variants === 'object') {
      for (const [variantName, variant] of Object.entries(variants)) {
        const elements = variant?.elements as Record<
          string,
          {
            decorations?: any;
            scales?: any;
            palettes?: any;
            effects?: any;
          }
        >;
        if (!elements) continue;
        for (const [elementName, element] of Object.entries(elements)) {
          if (!element) continue;
          applyElement([componentName, variantName, elementName], element);
        }
      }
      continue;
    }

    const elements = component.elements as Record<
      string,
      {
        decorations?: any;
        scales?: any;
        palettes?: any;
        effects?: any;
      }
    >;
    if (!elements) continue;
    for (const [elementName, element] of Object.entries(elements)) {
      if (!element) continue;
      applyElement([componentName, elementName], element);
    }
  }

  return { styleKeys: styleKeysByComponent, toneMetadataByPalette };
}
