import {
  type ClassNameByElementJSON,
  type ColorClasses,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode
} from '@kiskadee/core';
import { isValidElement, type ReactNode } from 'react';
import type {
  TabsClassesMap,
  TabsClassNames,
  TabsResolvedIndicator,
  TabsVisualContextValue
} from './Tabs.types';

export const DEFAULT_SCALE = 's:md:1';
export const DEFAULT_EMPHASIS: TabsVisualContextValue['emphasis'] = 'medium';
export const DEFAULT_INTENT = 'neutral';
export const DEFAULT_TYPE: TabsVisualContextValue['type'] = 'line';

/**
 * What
 *     Normalizes a scale token by stripping the `s:` prefix when it exists.
 * Why
 *     Schema class maps are keyed by the raw scale name, so every resolver needs the same
 *     lookup format.
 */
export const normalizeScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

/**
 * What
 *     Joins className fragments into a single trimmed string while discarding empty values.
 * Why
 *     Every class resolver in this file assembles conditional fragments, so this avoids
 *     repeating filtering and trimming logic.
 */
export function joinClassNames(
  ...parts: Array<string | undefined | false | null>
): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

/**
 * What
 *     Resolves the semantic color classes for one schema element using the current intent and
 *     emphasis.
 * Why
 *     Tabs elements share the same color bucket structure, and this keeps that selection
 *     logic in one place before each element-specific resolver adds its own modifiers.
 */
export function resolveIntentClasses(
  element: TabsClassesMap['e1'] | undefined,
  intent: string,
  emphasis: TabsVisualContextValue['emphasis']
): string {
  if (!element?.c) return '';

  const byIntent = element.c as Record<string, ColorClasses>;
  const chosen = byIntent[intent] ?? Object.values(byIntent)[0];
  if (!chosen) return '';

  if (emphasis) {
    const bucket = componentEmphasisBuckets[emphasis];
    const buckets = chosen as Record<string, string | undefined>;
    return buckets[bucket] ?? chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';
  }

  return chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';
}

/**
 * What
 *     Collects every effect class declared for a schema element into a flat className string.
 * Why
 *     Element effects are optional and can be declared in multiple slots, so resolvers need
 *     a shared way to merge them without duplicating that traversal.
 */
export function resolveEffectClasses(element: TabsClassesMap['e1'] | undefined): string {
  if (!element?.e) return '';
  return Object.values(element.e)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

/**
 * What
 *     Builds the base className for one schema element from its default, color, scale,
 *     effect, and selected-state classes.
 * Why
 *     Most Tabs slots share this same assembly pattern, so higher-level resolvers can
 *     compose on top of one common element resolver instead of rebuilding the same stack
 *     each time.
 */
export function resolveElementClassName(
  element: TabsClassesMap['e1'] | undefined,
  options: {
    scale: string;
    intent: string;
    emphasis: TabsVisualContextValue['emphasis'];
    selected?: boolean;
  }
): string {
  if (!element) return '';

  const scaleKey = normalizeScaleKey(options.scale);
  return (
    joinClassNames(
      element.d,
      resolveIntentClasses(element, options.intent, options.emphasis),
      element.s?.all,
      element.s?.[scaleKey],
      resolveEffectClasses(element),
      options.selected ? element.l : ''
    ) ?? ''
  );
}

/**
 * What
 *     Resolves width classes for schema elements that expose size rules per scale.
 * Why
 *     Fixed-width tabs need to opt into width tokens without mixing that concern into the
 *     generic element-class resolver.
 */
export function resolveWidthClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string
): string {
  if (!element) return '';

  const scaleKey = normalizeScaleKey(scale);
  return joinClassNames(element.w?.all, element.w?.[scaleKey]) ?? '';
}

/**
 * What
 *     Selects the class-map branch that corresponds to the current Tabs variant.
 * Why
 *     The runtime accepts either a direct element map or a variant-indexed map, so this
 *     normalizes both shapes into one predictable structure for the rest of the file.
 */
export function resolveVariantElements(
  map: TabsClassesMap | Record<string, TabsClassesMap> | undefined,
  variant: string
): TabsClassesMap {
  if (!map) return {};
  const asRecord = map as Record<string, TabsClassesMap>;
  const isElementMap = Object.hasOwn(asRecord, 'e1');
  if (isElementMap) return map as TabsClassesMap;
  return asRecord[variant] ?? asRecord.line ?? asRecord.box ?? asRecord.dot ?? {};
}

/**
 * What
 *     Resolves radius classes for a schema element using the active radius mode and scale.
 * Why
 *     Tabs can switch between rounded, pill, and square radii at runtime, so slot resolvers
 *     need a shared way to pick the matching schema classes.
 */
export function resolveRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode
): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  const all =
    radiusMode === 'rounded'
      ? (element.r?.all ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.all ?? '')
        : radiusMode === 'square'
          ? (element.rs?.all ?? '')
          : '';
  const byScale =
    radiusMode === 'rounded'
      ? (element.r?.[scaleKey] ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.[scaleKey] ?? '')
        : radiusMode === 'square'
          ? (element.rs?.[scaleKey] ?? '')
          : '';
  return joinClassNames(all, byScale) ?? '';
}

/**
 * What
 *     Maps the current Tabs type and indicator width mode to the structural indicator
 *     modifier class.
 * Why
 *     The indicator CSS changes layout rules by type, and this keeps that branching in one
 *     small resolver instead of scattering hard-coded class names across renderers.
 */
export function resolveIndicatorModeClass(
  type: TabsVisualContextValue['type'],
  indicatorWidthMode: TabsVisualContextValue['indicator']['widthMode']
): string {
  if (type === 'dot') {
    return 'k-tab-e5c';
  }

  if (type !== 'line') {
    return '';
  }

  return indicatorWidthMode === 'fixed' ? 'k-tab-e5b' : 'k-tab-e5a';
}

/**
 * What
 *     Resolves the final indicator variant allowed for the current Tabs type.
 * Why
 *     Global options and local props can request variants that do not apply to every type,
 *     so this function clamps them to the supported set before rendering.
 */
export function resolveIndicatorVariant(
  type: TabsVisualContextValue['type'],
  indicatorVariant: TabsResolvedIndicator['variant'] | undefined,
  globalIndicatorVariant: string | undefined
): TabsResolvedIndicator['variant'] {
  const candidate =
    typeof indicatorVariant === 'string' ? indicatorVariant : globalIndicatorVariant;

  if (type === 'dot') {
    return 'dot';
  }

  if (type === 'line') {
    return candidate === 'rounded' || candidate === 'roundedClip' ? candidate : 'square';
  }

  return candidate === 'rounded' || candidate === 'pill' ? candidate : 'square';
}

/**
 * What
 *     Resolves the effective indicator width mode from local and global settings.
 * Why
 *     Only line tabs support alternate width behaviors, so this centralizes the fallback
 *     rules and the type-specific restriction in one place.
 */
export function resolveIndicatorWidthMode(
  type: TabsVisualContextValue['type'],
  indicatorWidthMode: TabsVisualContextValue['indicator']['widthMode'] | undefined,
  globalIndicatorWidthMode: TabsVisualContextValue['indicator']['widthMode'] | undefined
): TabsVisualContextValue['indicator']['widthMode'] {
  if (type !== 'line') {
    return 'tab';
  }

  return indicatorWidthMode ?? globalIndicatorWidthMode ?? 'tab';
}

/**
 * What
 *     Resolves the effective tab width mode from local props and global component defaults.
 * Why
 *     Trigger class resolution needs one final width mode, so this avoids repeating the same
 *     fallback order wherever tab width affects styling.
 */
export function resolveTabWidthMode(
  tabWidthMode: TabsVisualContextValue['tabWidthMode'] | undefined,
  globalTabWidthMode: TabsVisualContextValue['tabWidthMode'] | undefined
): TabsVisualContextValue['tabWidthMode'] {
  return tabWidthMode ?? globalTabWidthMode ?? 'auto';
}

/**
 * What
 *     Builds the final className for the tab-list container by combining schema classes and
 *     type-specific structural modifiers.
 * Why
 *     Each Tabs type reuses the same root slot but applies different structural markers, so
 *     the runtime needs one resolver that expresses those differences without duplicating
 *     class assembly.
 */
export function resolveListClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  radiusMode: RadiusMode;
  type: TabsVisualContextValue['type'];
  indicatorPosition: TabsResolvedIndicator['position'];
}): string | undefined {
  return joinClassNames(
    'k-tab',
    'k-tab-e1',
    options.type === 'box' ? 'k-tab-b' : options.type === 'dot' ? 'k-tab-d' : 'k-tab-l',
    options.type !== 'box' ? (options.indicatorPosition === 'top' ? 'k-tab-e1b' : 'k-tab-e1a') : '',
    resolveRadiusClassName(options.elements.e1, options.scale, options.radiusMode),
    resolveElementClassName(options.elements.e1, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis
    }),
    options.classNames.e1
  );
}

/**
 * What
 *     Builds the final className for the optional separator element rendered between box tabs.
 * Why
 *     Box tabs can inject separators dynamically, so their renderer needs a dedicated
 *     resolver for that extra slot without special-casing raw class assembly inline.
 */
export function resolveSeparatorClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e6, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis
    }),
    options.classNames.e6,
    'k-tab-e6'
  );
}

/**
 * What
 *     Builds the final className for a tab trigger by merging schema classes, consumer
 *     overrides, width/radius modifiers, and interactive/selected state markers.
 * Why
 *     Tabs.Tab uses this as the single place where trigger styling is assembled, so the
 *     runtime can keep rendering logic separate from class-resolution rules.
 */
export function resolveTriggerClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  tabWidthMode: TabsVisualContextValue['tabWidthMode'];
  radiusMode: RadiusMode;
  selected: boolean;
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e2, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected
    }),
    options.tabWidthMode === 'fixed'
      ? resolveWidthClassName(options.elements.e2, options.scale)
      : '',
    resolveRadiusClassName(options.elements.e2, options.scale, options.radiusMode),
    options.classNames.e2,
    'k-tab-e2',
    options.tabWidthMode === 'fixed' ? 'k-tab-e2a' : '',
    'k-state',
    cn.interactive,
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

/**
 * What
 *     Builds the final className for the tab label slot.
 * Why
 *     Tabs.Label is rendered inside the trigger context, so it needs its own resolver to
 *     inherit the current selected state and still allow schema and consumer overrides.
 */
export function resolveLabelClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  selected: boolean;
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e3, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected
    }),
    options.classNames.e3,
    'k-tab-e3',
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

/**
 * What
 *     Builds the final className for the tab icon slot.
 * Why
 *     Tabs.Icon follows the same state-driven styling model as the label, but keeps a
 *     separate resolver so icon-specific schema classes stay independent from label
 *     classes.
 */
export function resolveIconClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  selected: boolean;
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e4, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected
    }),
    options.classNames.e4,
    'k-tab-e4',
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

/**
 * What
 *     Builds the final className for the active indicator, including variant, position,
 *     motion, and type-specific modifiers.
 * Why
 *     Static and motion renderers for line, box, and dot all depend on the same indicator
 *     slot, so this keeps indicator class branching centralized and consistent across
 *     implementations.
 */
export function resolveIndicatorClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  radiusMode: RadiusMode;
  indicator: TabsResolvedIndicator;
  type: TabsVisualContextValue['type'];
  className?: string;
}): string | undefined {
  const indicatorRadiusMode: RadiusMode =
    options.indicator.variant === 'square'
      ? 'square'
      : options.indicator.variant === 'pill'
        ? 'pill'
        : options.indicator.variant === 'rounded'
          ? 'rounded'
          : options.radiusMode;
  const indicatorVariantClass =
    options.indicator.variant === 'rounded'
      ? 'k-tab-e5e'
      : options.indicator.variant === 'pill'
        ? 'k-tab-e5f'
        : options.indicator.variant === 'roundedClip' && options.type === 'line'
          ? 'k-tab-e5g'
          : options.indicator.variant === 'square'
            ? 'k-tab-e5d'
            : '';

  return joinClassNames(
    resolveElementClassName(options.elements.e5, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: true
    }),
    resolveRadiusClassName(options.elements.e5, options.scale, indicatorRadiusMode),
    options.classNames.e5,
    'k-tab-e5',
    options.type !== 'box'
      ? options.indicator.position === 'top'
        ? 'k-tab-e5i'
        : 'k-tab-e5h'
      : '',
    resolveIndicatorModeClass(options.type, options.indicator.widthMode),
    indicatorVariantClass,
    options.indicator.motion === 'none' ? 'k-tab-e5j' : '',
    options.elements.e5?.e?.h ? cn.shadow : '',
    'k-state',
    options.className
  );
}

/**
 * What
 *     Extracts the `value` prop from a potential React tab child when it is a valid element.
 * Why
 *     Box tabs build separator elements between triggers, and that logic needs a lightweight
 *     way to inspect child values without depending on a stricter child shape.
 */
export function extractTabValue(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined;
  const value = (child.props as { value?: unknown }).value;
  return typeof value === 'string' ? value : undefined;
}
