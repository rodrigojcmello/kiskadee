import {
  type ClassNameByElementJSON,
  type ColorClasses,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode
} from '@kiskadee/core';
import { isValidElement, type ReactNode } from 'react';
import {
  getTabsDistributedBar,
  getTabsIndicatorStatic,
  getTabsLowerCurve,
  getTabsSlot
} from './Tabs.structural';
import type {
  TabsClassesMap,
  TabsClassNames,
  TabsResolvedIndicator,
  TabsVariantClassesMap,
  TabsVisualContextValue
} from './Tabs.types';

export const DEFAULT_SCALE = 's:md:1';
export const DEFAULT_EMPHASIS: TabsVisualContextValue['emphasis'] = 'medium';
export const DEFAULT_INTENT = 'neutral';
export const DEFAULT_VARIANT: TabsVisualContextValue['variant'] = 'line';

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
 *     Resolves only the shadow effect class for one element, including the shadow activator.
 * Why
 *     Bridge projects tab shadow from an outer wrapper, so shadow needs to be movable
 *     independently from other effect buckets like ripple.
 */
export function resolveShadowEffectClassName(element: TabsClassesMap['e1'] | undefined): string {
  const shadowClass = typeof element?.e?.h === 'string' ? element.e.h : '';
  return joinClassNames(shadowClass, shadowClass ? cn.shadow : '') ?? '';
}

/**
 * What
 *     Resolves every non-shadow effect class for one element.
 * Why
 *     Some components need to project shadow on a different DOM node while keeping the
 *     remaining effects on the interactive element itself.
 */
export function resolveNonShadowEffectClasses(element: TabsClassesMap['e1'] | undefined): string {
  if (!element?.e) return '';
  return Object.entries(element.e)
    .filter(([bucket, value]) => bucket !== 'h' && typeof value === 'string' && value.length > 0)
    .map(([, value]) => value)
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
    includeEffects?: boolean;
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
      options.includeEffects === false ? '' : resolveEffectClasses(element),
      options.includeEffects === false || typeof element.e?.h !== 'string' || !element.e.h
        ? ''
        : cn.shadow,
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
 *     Tabs artifacts are variant-indexed. Variants are not interchangeable, so when the requested
 *     variant is missing we must return an empty map instead of borrowing styles from another
 *     branch.
 */
export function resolveVariantElements(
  map: TabsVariantClassesMap | undefined,
  variant: string
): TabsClassesMap {
  if (!map) return {};
  return map[variant as keyof TabsVariantClassesMap] ?? {};
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
      ? (element.rr?.all ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.all ?? '')
        : radiusMode === 'square'
          ? (element.rs?.all ?? '')
          : '';
  const byScale =
    radiusMode === 'rounded'
      ? (element.rr?.[scaleKey] ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.[scaleKey] ?? '')
        : radiusMode === 'square'
          ? (element.rs?.[scaleKey] ?? '')
          : '';
  return joinClassNames(all, byScale) ?? '';
}

/**
 * What
 *     Resolves the radius class for the tab-list shell, including bridge-specific fallback.
 * Why
 *     Bridge needs `--k-bdr` on `e1` for structural geometry, but current schema artifacts only
 *     emit radius classes on `e2`, so the runtime mirrors that class only when `e1` has none.
 */
export function resolveListRadiusClassName(options: {
  elements: TabsClassesMap;
  scale: string;
  radiusMode: RadiusMode;
  variant: TabsVisualContextValue['variant'];
}): string {
  const listRadiusClassName = resolveRadiusClassName(
    options.elements.e1,
    options.scale,
    options.radiusMode
  );
  if (listRadiusClassName || options.variant !== 'bridge') {
    return listRadiusClassName;
  }

  return resolveRadiusClassName(options.elements.e2, options.scale, options.radiusMode);
}

/**
 * What
 *     Resolves which tab shape should be applied for the active indicator shape.
 * Why
 *     Box Tabs reuse the indicator shape to define the shape of the bar and tabs themselves,
 *     while other variants either clamp shapes or use a fixed structural shape.
 */
export function resolveIndicatorTabShape(
  indicator: Pick<TabsResolvedIndicator, 'shape'>,
  fallback: RadiusMode
): RadiusMode {
  return indicator.shape === 'square'
    ? 'square'
    : indicator.shape === 'pill'
      ? 'pill'
      : indicator.shape === 'rounded'
        ? 'rounded'
        : fallback;
}

/**
 * What
 *     Maps the current Tabs variant and indicator width to the structural indicator
 *     modifier class.
 * Why
 *     The indicator CSS changes layout rules by variant, and this keeps that branching in one
 *     small resolver instead of scattering hard-coded class names across renderers.
 */
export function resolveIndicatorWidthClass(
  variant: TabsVisualContextValue['variant'],
  indicatorWidth: TabsVisualContextValue['indicator']['width']
): string {
  if (variant === 'dot') {
    return 'k-tab-e5b-c';
  }

  if (variant !== 'line') {
    return '';
  }

  return indicatorWidth === 'fixed' ? 'k-tab-e5c-d' : 'k-tab-e5b-d';
}

/**
 * What
 *     Resolves the variant-owned indicator shape modifier that is not covered by schema radius
 *     classes.
 * Why
 *     Tabs variants encode some indicator geometry structurally, so these fallback classes need
 *     one central mapping that stays aligned with the owning Sass files.
 */
export function resolveIndicatorShapeClass(options: {
  variant: TabsVisualContextValue['variant'];
  indicator: TabsResolvedIndicator;
  hasRadiusClass: boolean;
}): string {
  if (options.variant === 'segmented') {
    return 'k-tab-e5a-e';
  }

  if (options.variant === 'box') {
    if (options.hasRadiusClass) return '';
    return options.indicator.shape === 'rounded'
      ? 'k-tab-e5c-b'
      : options.indicator.shape === 'pill'
        ? 'k-tab-e5d-b'
        : 'k-tab-e5b-b';
  }

  if (options.variant !== 'line') {
    return '';
  }

  if (options.indicator.shape === 'roundedClip') {
    return options.indicator.position === 'top' ? 'k-tab-e5h-d' : 'k-tab-e5g-d';
  }

  if (options.hasRadiusClass) return '';
  return options.indicator.shape === 'rounded' ? 'k-tab-e5f-d' : 'k-tab-e5e-d';
}

/**
 * What
 *     Resolves the final indicator shape allowed for the current Tabs variant.
 * Why
 *     Global options and local props can request shapes that do not apply to every variant,
 *     so this function clamps them to the supported set before rendering.
 */
export function resolveIndicatorShape(
  variant: TabsVisualContextValue['variant'],
  indicatorShape: TabsResolvedIndicator['shape'] | undefined,
  globalIndicatorShape: string | undefined
): TabsResolvedIndicator['shape'] {
  const candidate = typeof indicatorShape === 'string' ? indicatorShape : globalIndicatorShape;

  if (variant === 'dot') {
    return 'dot';
  }

  if (variant === 'line') {
    return candidate === 'rounded' || candidate === 'roundedClip' ? candidate : 'square';
  }

  if (variant === 'segmented') {
    return 'segmented';
  }

  if (variant === 'bridge') {
    return 'bridge';
  }

  return candidate === 'rounded' || candidate === 'pill' ? candidate : 'square';
}

/**
 * What
 *     Resolves the effective indicator width from local and global settings.
 * Why
 *     Only line tabs support alternate width behaviors, so this centralizes the fallback
 *     rules and the variant-specific restriction in one place.
 */
export function resolveIndicatorWidth(
  variant: TabsVisualContextValue['variant'],
  indicatorWidth: TabsVisualContextValue['indicator']['width'] | undefined,
  globalIndicatorWidth: TabsVisualContextValue['indicator']['width'] | undefined
): TabsVisualContextValue['indicator']['width'] {
  if (variant !== 'line') {
    return 'tab';
  }

  return indicatorWidth ?? globalIndicatorWidth ?? 'tab';
}

/**
 * What
 *     Resolves the effective tab width from local props and global component defaults.
 * Why
 *     Trigger class resolution needs one final width value, so this avoids repeating the same
 *     fallback order wherever tab width affects styling.
 */
export function resolveTabWidth(
  tabWidth: TabsVisualContextValue['tabWidth'] | undefined,
  globalTabWidth: TabsVisualContextValue['tabWidth'] | undefined
): TabsVisualContextValue['tabWidth'] {
  return tabWidth ?? globalTabWidth ?? 'content';
}

/**
 * What
 *     Reports whether the current tab width consumes the schema `boxWidth` token.
 * Why
 *     `fixed`, `adaptive`, and `distributed` depend on width classes, while `content` keeps the
 *     trigger sized by content.
 */
function usesTabWidthScale(tabWidth: TabsVisualContextValue['tabWidth']): boolean {
  return tabWidth === 'fixed' || tabWidth === 'adaptive' || tabWidth === 'distributed';
}

/**
 * What
 *     Builds the final className for the tab-list container by combining schema classes and
 *     variant-specific structural modifiers.
 * Why
 *     Each Tabs variant reuses the same root slot but applies different structural markers, so
 *     the runtime needs one resolver that expresses those differences without duplicating
 *     class assembly.
 */
export function resolveListClassName(options: {
  structural: TabsVisualContextValue['structural'];
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  tabWidth: TabsVisualContextValue['tabWidth'];
  tabShape: RadiusMode;
  variant: TabsVisualContextValue['variant'];
  indicatorPosition: TabsResolvedIndicator['position'];
  lowerCurve: TabsVisualContextValue['lowerCurve'];
}): string | undefined {
  return joinClassNames(
    'k-tab',
    getTabsSlot(options.structural, 'e1'),
    options.tabWidth === 'distributed'
      ? getTabsDistributedBar(options.structural)
      : '',
    options.variant === 'bridge'
      ? getTabsLowerCurve(options.structural, options.lowerCurve)
      : '',
    options.variant === 'line' || options.variant === 'dot'
      ? options.indicatorPosition === 'top'
        ? 'k-tab-e1b'
        : 'k-tab-e1a'
      : '',
    resolveListRadiusClassName({
      elements: options.elements,
      scale: options.scale,
      radiusMode: options.tabShape,
      variant: options.variant
    }),
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
 *     Box and segmented tabs can inject separators dynamically, so their renderers need a
 *     dedicated resolver for that extra slot without special-casing raw class assembly inline.
 */
export function resolveSeparatorClassName(options: {
  structural: TabsVisualContextValue['structural'];
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  variant: TabsVisualContextValue['variant'];
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e6, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis
    }),
    options.classNames.e6,
    getTabsSlot(options.structural, 'e6')
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
  structural: TabsVisualContextValue['structural'];
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  tabWidth: TabsVisualContextValue['tabWidth'];
  tabShape: RadiusMode;
  variant: TabsVisualContextValue['variant'];
  selected: boolean;
  className?: string;
  includeEffects?: boolean;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e2, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected,
      includeEffects: options.includeEffects
    }),
    usesTabWidthScale(options.tabWidth)
      ? resolveWidthClassName(options.elements.e2, options.scale)
      : '',
    resolveRadiusClassName(options.elements.e2, options.scale, options.tabShape),
    options.classNames.e2,
    getTabsSlot(options.structural, 'e2'),
    options.tabWidth === 'fixed' ? 'k-tab-e2a' : '',
    options.tabWidth === 'adaptive' ? 'k-tab-e2c' : '',
    options.tabWidth === 'distributed' ? 'k-tab-e2b' : '',
    'k-trn',
    cn.interactive,
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

/**
 * What
 *     Builds the bridge wrapper className that carries overlap geometry and selected stacking.
 * Why
 *     Bridge tabs need one outer layer separate from the semantic trigger so overlap and z-index
 *     stay independent from the clipped interactive surface.
 */
export function resolveBridgeItemClassName(options: {
  structural: TabsVisualContextValue['structural'];
  elements: TabsClassesMap;
  scale: string;
  tabWidth: TabsVisualContextValue['tabWidth'];
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveShadowEffectClassName(options.elements.e2),
    usesTabWidthScale(options.tabWidth)
      ? resolveWidthClassName(options.elements.e2, options.scale)
      : '',
    getTabsSlot(options.structural, 'x3'),
    options.className
  );
}

/**
 * What
 *     Builds the final bridge trigger className using the base tab slot plus the selected
 *     bridge-shell color, radius, and effect overrides when active.
 * Why
 *     Bridge keeps overlap on the wrapper, but the visible shell still lives on the clipped
 *     semantic trigger, so selected-state surface styles must swap from `e2` to `e5`.
 */
export function resolveBridgeTriggerClassName(options: {
  structural: TabsVisualContextValue['structural'];
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  tabWidth: TabsVisualContextValue['tabWidth'];
  tabShape: RadiusMode;
  selected: boolean;
  className?: string;
}): string | undefined {
  const scaleKey = normalizeScaleKey(options.scale);
  const triggerElement = options.elements.e2;
  const selectedShellElement = options.elements.e5;
  const activeEffectElement = options.selected
    ? (selectedShellElement ?? triggerElement)
    : triggerElement;
  const activeColorClassName = options.selected
    ? resolveIntentClasses(selectedShellElement, options.intent, options.emphasis)
    : resolveIntentClasses(triggerElement, options.intent, options.emphasis);
  const activeRadiusClassName = resolveRadiusClassName(
    options.selected ? (selectedShellElement ?? triggerElement) : triggerElement,
    options.scale,
    options.tabShape
  );

  return joinClassNames(
    triggerElement?.d,
    activeColorClassName,
    triggerElement?.s?.all,
    triggerElement?.s?.[scaleKey],
    resolveNonShadowEffectClasses(activeEffectElement),
    usesTabWidthScale(options.tabWidth) ? resolveWidthClassName(triggerElement, options.scale) : '',
    activeRadiusClassName,
    options.classNames.e2,
    options.selected ? options.classNames.e5 : '',
    getTabsSlot(options.structural, 'e2'),
    options.tabWidth === 'fixed' ? 'k-tab-e2a' : '',
    options.tabWidth === 'adaptive' ? 'k-tab-e2c' : '',
    options.tabWidth === 'distributed' ? 'k-tab-e2b' : '',
    'k-trn',
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
  structural: TabsVisualContextValue['structural'];
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
    getTabsSlot(options.structural, 'e3'),
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
  structural: TabsVisualContextValue['structural'];
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
    getTabsSlot(options.structural, 'e4'),
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

/**
 * What
 *     Builds the final className for the active indicator, including variant, position,
 *     motion, and variant-specific modifiers.
 * Why
 *     Static and motion renderers for line, box, segmented, and dot all depend on the same
 *     indicator slot, so this keeps indicator class branching centralized and consistent across
 *     implementations.
 */
export function resolveIndicatorClassName(options: {
  structural: TabsVisualContextValue['structural'];
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  tabShape: RadiusMode;
  indicator: TabsResolvedIndicator;
  variant: TabsVisualContextValue['variant'];
  className?: string;
}): string | undefined {
  const indicatorRadiusMode = resolveIndicatorTabShape(options.indicator, options.tabShape);
  const indicatorRadiusClassName = resolveRadiusClassName(
    options.elements.e5,
    options.scale,
    indicatorRadiusMode
  );
  const indicatorShapeClass = resolveIndicatorShapeClass({
    variant: options.variant,
    indicator: options.indicator,
    hasRadiusClass: indicatorRadiusClassName.length > 0
  });

  return joinClassNames(
    resolveElementClassName(options.elements.e5, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: true
    }),
    indicatorRadiusClassName,
    options.classNames.e5,
    getTabsSlot(options.structural, 'e5'),
    resolveIndicatorWidthClass(options.variant, options.indicator.width),
    indicatorShapeClass,
    options.indicator.motion === 'none'
      ? getTabsIndicatorStatic(options.structural) || 'k-tab-e5j'
      : '',
    typeof options.elements.e5?.e?.h === 'string' && options.elements.e5.e.h ? cn.shadow : '',
    'k-trn',
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
