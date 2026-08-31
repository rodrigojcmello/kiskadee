import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  BorderRadiusEffectSchema,
  BreakpointValue,
  ComponentName,
  ComponentStyleKeyMap,
  ElementAllSizeValue,
  ElementIconSize,
  ElementSizeValue,
  ElementStyle,
  ElementTypography,
  RadiusMode,
  ScaleProperty,
  ScaleSchema,
  Schema,
  SchemaIconSizes,
  SchemaSeparators,
  ShadowEffectSchema,
  ShadowElementEffectSchema,
  StyleKeyByElement,
  StyleKeysByInteractionState,
  ThumbShrinkEffectSchema
} from '@kiskadee/core';
import { resolveActivationFeedbackSetting } from '@kiskadee/core';
import { resolveElementPaletteSources } from '../palettes/resolveElementPaletteSources.ts';
import { createTypographyBuild, type TypographyBuild } from '../typography/compileTypography.ts';
import { buildStyleKey, deepUpdate } from '../utils/index.ts';
import {
  buildScopedToneMetadataKey,
  convertElementColorsToStyleKeys,
  type ToneMetadataByPalette
} from './colors/convertElementColorsToStyleKeys.ts';
import { convertElementDecorationsToStyleKeys } from './decoration/convertElementDecorationsToStyleKeys.ts';
import { convertElementActivationFeedbackToStyleKeys } from './effects/convertElementActivationFeedbackToStyleKeys.ts';
import { convertElementBorderRadiusToStyleKeys } from './effects/convertElementBorderRadiusToStyleKeys.ts';
import {
  convertComponentShadowToStyleKeys,
  convertElementShadowToStyleKeys
} from './effects/convertElementShadowToStyleKeys.ts';
import { convertElementThumbShrinkToStyleKeys } from './effects/convertElementThumbShrinkToStyleKeys.ts';
import { expandElementIconSize } from './icon-sizes/compileIconSizes.ts';
import {
  convertElementScalesToStyleKeys,
  type ScaleValue
} from './scales/convertElementScalesToStyleKeys.ts';

type ElementSchemaInput = Pick<
  ElementStyle,
  | 'decorations'
  | 'effects'
  | 'foreground'
  | 'iconSize'
  | 'name'
  | 'palettes'
  | 'scales'
  | 'separator'
  | 'typography'
>;

type ComponentSchemaInput = {
  effects?: {
    activationFeedback?: ActivationFeedbackSetting;
    shadow?: ShadowEffectSchema;
  };
  elements?: Record<string, ElementSchemaInput | undefined>;
  variants?: Record<
    string,
    | {
        elements?: Record<string, ElementSchemaInput | undefined>;
        modes?: Record<
          string,
          | {
              elements?: Record<string, ElementSchemaInput | undefined>;
            }
          | undefined
        >;
      }
    | undefined
  >;
};

type RadiusScaleProperty = Extract<
  ScaleProperty,
  'borderRadius' | 'borderRadiusRounded' | 'borderRadiusPill' | 'borderRadiusSquare'
>;

const ACTIVATION_FEEDBACK_HOST_BY_COMPONENT: Partial<Record<ComponentName, string>> = {
  button: 'e1',
  slider: 'e10',
  switch: 'e3'
};

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
  typographyBuild?: TypographyBuild;
} {
  const styleKeysByComponent: ComponentStyleKeyMap = {};
  const toneMetadataByPalette: ToneMetadataByPalette = new Map();
  const typographyBuild = createTypographyBuild(schema.global?.typography, schema.breakpoints);
  const foregrounds = schema.global?.foregrounds;
  const iconSizes = schema.global?.iconSizes as SchemaIconSizes | undefined;
  const separators = schema.global?.separators as SchemaSeparators | undefined;
  const activationFeedbackConfig = schema.global?.effects?.activationFeedback;
  const shadowConfig = schema.global?.effects?.shadow;

  const resolveElementActivationFeedbackConfig = (
    componentName: ComponentName,
    elementName: string,
    element: ElementSchemaInput
  ): ActivationFeedbackEffectSchema | undefined => {
    const component = schema.components?.[componentName] as ComponentSchemaInput | undefined;
    const componentSetting = component?.effects?.activationFeedback;
    if (componentSetting === false) return undefined;

    const elementSetting = element.effects?.activationFeedback;
    const hasElementSetting = elementSetting !== undefined;
    const componentResolvedConfig = resolveActivationFeedbackSetting(
      activationFeedbackConfig,
      componentSetting
    );

    if (componentSetting !== undefined) {
      const hostElementName = ACTIVATION_FEEDBACK_HOST_BY_COMPONENT[componentName];
      if (elementName !== hostElementName && !hasElementSetting) return undefined;
      if (elementSetting === false) return undefined;
      return resolveActivationFeedbackSetting(componentResolvedConfig, elementSetting);
    }

    if (!hasElementSetting || elementSetting === false) return undefined;
    return resolveActivationFeedbackSetting(activationFeedbackConfig, elementSetting);
  };

  const resolveElementShadowConfig = (
    componentName: ComponentName,
    elementName: string
  ): ShadowElementEffectSchema | undefined => {
    if (!shadowConfig) return undefined;
    const component = schema.components?.[componentName] as ComponentSchemaInput | undefined;
    const componentSetting = component?.effects?.shadow;
    const elementSetting = componentSetting?.[elementName];
    if (!elementSetting) return undefined;
    return elementSetting;
  };

  const applyElement = (
    path: string[],
    element: ElementSchemaInput,
    metadataScope: {
      componentName: string;
      variantName?: string;
      modeName?: string;
      elementName: string;
    }
  ) => {
    if (element.typography && !typographyBuild) {
      throw new Error(
        `[web-builder] ${metadataScope.componentName}.${metadataScope.elementName} references typography without global.typography.`
      );
    }
    if (element.iconSize && !iconSizes) {
      throw new Error(
        `[web-builder] ${metadataScope.componentName}.${metadataScope.elementName} references iconSize without global.iconSizes.`
      );
    }
    if (element.foreground && !foregrounds) {
      throw new Error(
        `[web-builder] ${metadataScope.componentName}.${metadataScope.elementName} references foreground without global.foregrounds.`
      );
    }
    if (element.separator && !separators) {
      throw new Error(
        `[web-builder] ${metadataScope.componentName}.${metadataScope.elementName} references separator without global.separators.`
      );
    }
    deepUpdate<StyleKeyByElement>(styleKeysByComponent, path, (prev) => {
      const el: Partial<StyleKeyByElement> = prev ? { ...prev } : {};
      const typographyStyleKeys = element.typography
        ? typographyBuild?.expandElement(element.typography as ElementTypography, {
            component: metadataScope.componentName as ComponentName,
            ...(metadataScope.variantName ? { variant: metadataScope.variantName } : {}),
            ...(metadataScope.modeName ? { mode: metadataScope.modeName } : {}),
            element: metadataScope.elementName,
            elementName: element.name
          })
        : undefined;
      if (element.decorations) {
        el.decorations = convertElementDecorationsToStyleKeys(element.decorations);
      }
      if (typographyStyleKeys?.decorations.length) {
        el.decorations = Array.from(
          new Set([...(el.decorations ?? []), ...typographyStyleKeys.decorations])
        );
      }
      const iconSizeScales =
        element.iconSize && iconSizes
          ? expandElementIconSize(element.iconSize as ElementIconSize, iconSizes)
          : undefined;
      const { palettes: mergedPalettes, separatorRecipe } = resolveElementPaletteSources(element, {
        foregrounds,
        separators
      });
      if (element.scales || iconSizeScales || separatorRecipe) {
        const { borderRadius, ...otherScales } = (element.scales ?? {}) as ScaleSchema;
        const mergedScales = {
          ...otherScales,
          ...separatorRecipe?.scales,
          ...iconSizeScales
        };
        if (Object.keys(mergedScales).length > 0) {
          el.scales = convertElementScalesToStyleKeys(
            mergedScales as Partial<Record<ScaleProperty, ScaleValue>>
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
            propertyName: RadiusScaleProperty,
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
                const breakpoint = bp as BreakpointValue;
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

          const propertyNameForMode = (mode: RadiusMode): RadiusScaleProperty => {
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
              const sharedProperty: RadiusScaleProperty | undefined = isShared
                ? 'borderRadius'
                : undefined;
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
      if (typographyStyleKeys) {
        const mergedScales: NonNullable<StyleKeyByElement['scales']> = {
          ...(el.scales ?? {})
        };
        for (const [size, keys] of Object.entries(typographyStyleKeys.scales)) {
          const sizeKey = size as keyof typeof mergedScales;
          mergedScales[sizeKey] = Array.from(
            new Set([...(mergedScales[sizeKey] ?? []), ...(keys ?? [])])
          );
        }
        if (Object.keys(mergedScales).length > 0) {
          el.scales = mergedScales;
        }
      }
      if (mergedPalettes) {
        const { styleKeys: paletteKeys, toneMetadataByPalette: paletteToneMetadataByPalette } =
          convertElementColorsToStyleKeys(mergedPalettes);
        el.palettes = paletteKeys;
        // Merge element-local emphasis metadata into the global map.
        // Style keys remain globally dedupable; metadata is additionally scoped by component,
        // variant, and element so another consumer cannot change this element's hh/h/m/l/ll buckets.
        for (const [paletteKey, byMetaKey] of paletteToneMetadataByPalette) {
          if (!toneMetadataByPalette.has(paletteKey)) {
            toneMetadataByPalette.set(paletteKey, new Map());
          }
          const target = toneMetadataByPalette.get(paletteKey);
          if (!target) continue;

          for (const [metaKey, meta] of byMetaKey) {
            const scopedMetaKey = buildScopedToneMetadataKey(metadataScope, metaKey);
            const existing = target.get(scopedMetaKey);
            const existingTones = existing?.tones ?? [];
            const incomingTones = meta?.tones ?? [];
            const mergedTones = Array.from(new Set([...existingTones, ...incomingTones]));
            target.set(scopedMetaKey, mergedTones.length ? { tones: mergedTones } : {});
          }
        }
      }
      // Effects: merge multiple effect maps (shadow, borderRadius, ...)
      // Each converter returns a map of InteractionState -> StyleKey[].
      // We concatenate arrays per state to produce a single `effects` map.
      const activationFeedbackResolvedConfig = resolveElementActivationFeedbackConfig(
        metadataScope.componentName as ComponentName,
        metadataScope.elementName,
        element
      );
      const shadowResolvedConfig = resolveElementShadowConfig(
        metadataScope.componentName as ComponentName,
        metadataScope.elementName
      );
      if (element.effects || activationFeedbackResolvedConfig || shadowResolvedConfig) {
        const effectsMap: StyleKeysByInteractionState = {};
        const appendEffectMap = (map: StyleKeysByInteractionState) => {
          for (const [state, keys] of Object.entries(map)) {
            const arr = keys ?? [];
            if (!arr.length) continue;
            deepUpdate(effectsMap, [state], (prev: string[] = []) => [...prev, ...arr]);
          }
        };
        if (element.effects?.shadow) {
          const shadowMap = convertElementShadowToStyleKeys(element.effects.shadow);
          appendEffectMap(shadowMap);
        }
        if (shadowResolvedConfig && shadowConfig) {
          const shadowMap = convertComponentShadowToStyleKeys(shadowResolvedConfig, shadowConfig);
          appendEffectMap(shadowMap);
        }
        if (activationFeedbackResolvedConfig) {
          const activationFeedbackMap = convertElementActivationFeedbackToStyleKeys({
            config: activationFeedbackResolvedConfig
          });
          appendEffectMap(activationFeedbackMap);
        }
        if (element.effects?.borderRadius) {
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
        if (
          element.effects?.thumbShrink &&
          metadataScope.componentName === 'switch' &&
          metadataScope.elementName === 'e3'
        ) {
          const thumbShrink: ThumbShrinkEffectSchema = element.effects.thumbShrink;
          const thumbShrinkMap = convertElementThumbShrinkToStyleKeys(thumbShrink);
          appendEffectMap(thumbShrinkMap);
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
    const component = schema.components[componentName] as ComponentSchemaInput | undefined;
    if (!component) continue;

    const variants = component.variants;
    if (variants && typeof variants === 'object') {
      for (const [variantName, variant] of Object.entries(variants)) {
        const elements = variant?.elements;
        if (elements) {
          for (const [elementName, element] of Object.entries(elements)) {
            if (!element) continue;
            applyElement([componentName, variantName, elementName], element, {
              componentName,
              variantName,
              elementName
            });
          }
        }

        const modes = variant?.modes;
        if (!modes) continue;
        for (const [modeName, mode] of Object.entries(modes)) {
          const modeElements = mode?.elements;
          if (!modeElements) continue;
          for (const [elementName, element] of Object.entries(modeElements)) {
            if (!element) continue;
            applyElement([componentName, variantName, modeName, elementName], element, {
              componentName,
              variantName,
              modeName,
              elementName
            });
          }
        }
      }
      continue;
    }

    const elements = component.elements;
    if (!elements) continue;
    for (const [elementName, element] of Object.entries(elements)) {
      if (!element) continue;
      applyElement([componentName, elementName], element, {
        componentName,
        elementName
      });
    }
  }

  return {
    styleKeys: styleKeysByComponent,
    toneMetadataByPalette,
    ...(typographyBuild ? { typographyBuild } : {})
  };
}
