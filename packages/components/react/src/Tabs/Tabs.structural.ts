import type { TabsBridgeLowerCurve, TabsVariant } from '@kiskadee/core';

export type TabsStructuralElementKey = 'e1' | 'e1c' | 'e2' | 'e2b' | 'e2c' | 'e5' | 'e6';

export type TabsStructuralDescriptor<TVariant extends TabsVariant = TabsVariant> = {
  variant: TVariant;
  letter: string;
  elements: Partial<Record<TabsStructuralElementKey, string>>;
  indicatorStaticClassName?: string;
  separatorHiddenClassName?: string;
  separatorDimmedClassName?: string;
  lowerCurveClassNames?: Partial<Record<TabsBridgeLowerCurve, string>>;
};

/**
 * What
 *     Looks up the structural class name for one variant-owned Tabs slot.
 * Why
 *     Shared renderers should receive one descriptor from the active variant instead of
 *     importing a registry that knows every Tabs variant.
 */
export function getTabsStructuralElementClassName(
  structural: TabsStructuralDescriptor,
  element: TabsStructuralElementKey
): string {
  return structural.elements[element] ?? '';
}

/**
 * What
 *     Looks up the bridge lower-curve structural modifier for the active runtime mode.
 * Why
 *     Only bridge exposes lower-curve geometry, so the descriptor carries these optional
 *     modifiers without forcing a global variant table.
 */
export function getTabsStructuralLowerCurveClassName(
  structural: TabsStructuralDescriptor,
  curve: TabsBridgeLowerCurve
): string {
  return structural.lowerCurveClassNames?.[curve] ?? '';
}

/**
 * What
 *     Returns the static-indicator modifier class declared by the active variant.
 * Why
 *     Some variants define a dedicated static indicator modifier while others rely on the
 *     shared fallback, so callers need one safe lookup point.
 */
export function getTabsStructuralIndicatorStaticClassName(
  structural: TabsStructuralDescriptor
): string {
  return structural.indicatorStaticClassName ?? '';
}

/**
 * What
 *     Returns the separator hidden-state modifier declared by the active variant.
 * Why
 *     Separator state classes differ by variant, so runtime separator injection should read
 *     them from the variant descriptor rather than hard-code names.
 */
export function getTabsStructuralSeparatorHiddenClassName(
  structural: TabsStructuralDescriptor
): string {
  return structural.separatorHiddenClassName ?? '';
}

/**
 * What
 *     Returns the separator dimmed-state modifier declared by the active variant.
 * Why
 *     Only some variants define a dimmed separator treatment, so the descriptor keeps that
 *     optional state local to the owning variant.
 */
export function getTabsStructuralSeparatorDimmedClassName(
  structural: TabsStructuralDescriptor
): string {
  return structural.separatorDimmedClassName ?? '';
}
