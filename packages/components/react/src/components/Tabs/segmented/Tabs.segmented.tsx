import './Tabs.segmented.css';
import { createTabsComponent } from '../Tabs.runtime.tsx';
import type {
  TabsBarProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSegmentedIndicatorConfig,
  TabsSegmentedRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from '../Tabs.types';
import TabsSegmentedBarBase from './Tabs.segmented.parts.tsx';
import { useResolvedTabsSegmentedRootState } from './Tabs.segmented.root-state.tsx';
import TabsSegmentedStaticBarEnhancer from './Tabs.segmented.static.tsx';
import { tabsSegmentedStructural } from './Tabs.segmented.structural.ts';

/**
 * What
 *     Exposes the segmented Tabs entrypoint by binding the shared runtime to the segmented
 *     resolvers.
 * Why
 *     Consumers that only need segmented tabs should import one lean variant-specific component
 *     rather than a generic runtime that carries every visual variant.
 */
export const TabsSegmented = createTabsComponent<TabsSegmentedRootProps>({
  displayName: 'TabsSegmented',
  structural: tabsSegmentedStructural,
  BarComponent: TabsSegmentedBarBase,
  StaticEnhancer: TabsSegmentedStaticBarEnhancer,
  useResolvedRootState: useResolvedTabsSegmentedRootState
});

export type {
  TabsBarProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSegmentedIndicatorConfig,
  TabsSegmentedRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
};

export default TabsSegmented;
