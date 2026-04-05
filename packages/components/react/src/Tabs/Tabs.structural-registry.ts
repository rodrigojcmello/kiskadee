import type { TabsBridgeLowerCurveMode, TabsType } from '@kiskadee/core';

export type TabsStructuralElementKey = 'e1' | 'e1c' | 'e2' | 'e2b' | 'e2c' | 'e5' | 'e6';

type TabsStructuralVariantEntry = {
  letter: string;
  elements: Partial<Record<TabsStructuralElementKey, string>>;
  indicatorStaticClassName?: string;
  separatorHiddenClassName?: string;
  separatorDimmedClassName?: string;
  lowerCurveModeClassNames?: Partial<Record<TabsBridgeLowerCurveMode, string>>;
};

/**
 * What
 *     Centralizes the structural class registry for Tabs variants.
 * Why
 *     Variant letters and element-derived classes should live in one table so runtime
 *     resolvers can look up static class names without repeating conditional branches.
 */
export const tabsStructuralRegistry = {
  bridge: {
    letter: 'a',
    elements: {
      e1: 'k-tab-e1-a',
      e1c: 'k-tab-e1c-a',
      e2: 'k-tab-e2-a',
      e2b: 'k-tab-e2b-a',
      e2c: 'k-tab-e2c-a'
    },
    lowerCurveModeClassNames: {
      curved: '',
      'flush-all': 'k-tab-e1d-a',
      'flush-start': 'k-tab-e1e-a',
      'flush-end': 'k-tab-e1f-a',
      'flush-both': 'k-tab-e1g-a'
    }
  },
  box: {
    letter: 'b',
    elements: {
      e1: 'k-tab-e1-b',
      e2: 'k-tab-e2-b',
      e2b: 'k-tab-e2b-b',
      e5: 'k-tab-e5-b',
      e6: 'k-tab-e6-b'
    },
    indicatorStaticClassName: 'k-tab-e5a-b',
    separatorHiddenClassName: 'k-tab-e6a-b',
    separatorDimmedClassName: 'k-tab-e6b-b'
  },
  dot: {
    letter: 'c',
    elements: {
      e1: 'k-tab-e1-c',
      e2: 'k-tab-e2-c',
      e2b: 'k-tab-e2b-c',
      e5: 'k-tab-e5-c'
    },
    indicatorStaticClassName: 'k-tab-e5a-c'
  },
  line: {
    letter: 'd',
    elements: {
      e1: 'k-tab-e1-d',
      e2: 'k-tab-e2-d',
      e2b: 'k-tab-e2b-d',
      e5: 'k-tab-e5-d'
    },
    indicatorStaticClassName: 'k-tab-e5a-d'
  },
  segmented: {
    letter: 'e',
    elements: {
      e1: 'k-tab-e1-e',
      e1c: 'k-tab-e1c-e',
      e2: 'k-tab-e2-e',
      e2b: 'k-tab-e2b-e',
      e5: 'k-tab-e5-e',
      e6: 'k-tab-e6-e'
    },
    separatorHiddenClassName: 'k-tab-e6b'
  }
} as const satisfies Record<TabsType, TabsStructuralVariantEntry>;

/**
 * What
 *     Returns the structural registry entry for one Tabs variant.
 * Why
 *     Class resolvers should share one lookup source instead of duplicating variant maps.
 */
export function getTabsVariantRegistry(type: TabsType): TabsStructuralVariantEntry {
  return tabsStructuralRegistry[type];
}

/**
 * What
 *     Looks up the structural class name for one variant-owned Tabs slot.
 * Why
 *     Static variant element classes are table-driven, so resolvers only need the variant
 *     and the slot key to retrieve them.
 */
export function getTabsVariantElementClassName(
  type: TabsType,
  element: TabsStructuralElementKey
): string {
  return getTabsVariantRegistry(type).elements[element] ?? '';
}

/**
 * What
 *     Looks up the bridge lower-curve structural modifier for the active runtime mode.
 * Why
 *     Bridge list geometry is variant-specific, so the runtime needs one table-backed source
 *     for these mode classes.
 */
export function getTabsBridgeLowerCurveClassName(mode: TabsBridgeLowerCurveMode): string {
  return getTabsVariantRegistry('bridge').lowerCurveModeClassNames?.[mode] ?? '';
}

/**
 * What
 *     Returns the static-indicator modifier class for the current variant.
 * Why
 *     Only some variants define a dedicated static indicator modifier, so call sites need a
 *     safe lookup that falls back to an empty string.
 */
export function getTabsIndicatorStaticClassName(type: TabsType): string {
  return getTabsVariantRegistry(type).indicatorStaticClassName ?? '';
}

/**
 * What
 *     Returns the separator hidden-state modifier for the current variant.
 * Why
 *     Separator state classes differ by variant, so separator renderers should not hard-code
 *     those names inline.
 */
export function getTabsSeparatorHiddenClassName(type: TabsType): string {
  return getTabsVariantRegistry(type).separatorHiddenClassName ?? '';
}

/**
 * What
 *     Returns the separator dimmed-state modifier for the current variant.
 * Why
 *     Only specific variants define a dimmed separator treatment, so this keeps that lookup
 *     centralized with the rest of the structural registry.
 */
export function getTabsSeparatorDimmedClassName(type: TabsType): string {
  return getTabsVariantRegistry(type).separatorDimmedClassName ?? '';
}
