import type { TabsBridgeLowerCurve, TabsVariant } from '@kiskadee/core';

export type TabsStructuralSlotKey = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'x1' | 'x2' | 'x3' | 'x4';

export type TabsStructuralDescriptor<TVariant extends TabsVariant = TabsVariant> = {
  variant: TVariant;
  letter: string;
  slots: Partial<Record<TabsStructuralSlotKey, string>>;
  distributedBar?: string;
  indicatorStatic?: string;
  separatorHidden?: string;
  separatorDimmed?: string;
  lowerCurve?: Partial<Record<TabsBridgeLowerCurve, string>>;
};

/**
 * What
 *     Looks up the structural class name for one variant-owned Tabs slot.
 * Why
 *     Shared renderers should receive one descriptor from the active variant instead of
 *     importing a registry that knows every Tabs variant.
 */
export function getTabsSlot(
  { slots }: Pick<TabsStructuralDescriptor, 'slots'>,
  slot: TabsStructuralSlotKey
): string {
  return slots[slot] ?? '';
}

/**
 * What
 *     Returns the distributed-width bar modifier declared by the active variant.
 * Why
 *     Tabs width distribution is a variant-owned structural concern, so shared runtime class
 *     resolution should read the modifier from the descriptor instead of emitting one generic
 *     class that leaks across every variant.
 */
export function getTabsDistributedBar(
  { distributedBar }: Pick<TabsStructuralDescriptor, 'distributedBar'>
): string {
  return distributedBar ?? '';
}

/**
 * What
 *     Looks up the bridge lower-curve structural modifier for the active runtime mode.
 * Why
 *     Only bridge exposes lower-curve geometry, so the descriptor carries these optional
 *     modifiers without forcing a global variant table.
 */
export function getTabsLowerCurve(
  { lowerCurve }: Pick<TabsStructuralDescriptor, 'lowerCurve'>,
  curve: TabsBridgeLowerCurve
): string {
  return lowerCurve?.[curve] ?? '';
}

/**
 * What
 *     Returns the static-indicator modifier class declared by the active variant.
 * Why
 *     Some variants define a dedicated static indicator modifier while others rely on the
 *     shared fallback, so callers need one safe lookup point.
 */
export function getTabsIndicatorStatic(
  { indicatorStatic }: Pick<TabsStructuralDescriptor, 'indicatorStatic'>
): string {
  return indicatorStatic ?? '';
}

/**
 * What
 *     Returns the separator hidden-state modifier declared by the active variant.
 * Why
 *     Separator state classes differ by variant, so runtime separator injection should read
 *     them from the variant descriptor rather than hard-code names.
 */
export function getTabsSeparatorHidden(
  { separatorHidden }: Pick<TabsStructuralDescriptor, 'separatorHidden'>
): string {
  return separatorHidden ?? '';
}

/**
 * What
 *     Returns the separator dimmed-state modifier declared by the active variant.
 * Why
 *     Only some variants define a dimmed separator treatment, so the descriptor keeps that
 *     optional state local to the owning variant.
 */
export function getTabsSeparatorDimmed(
  { separatorDimmed }: Pick<TabsStructuralDescriptor, 'separatorDimmed'>
): string {
  return separatorDimmed ?? '';
}
