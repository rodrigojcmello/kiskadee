import { createTabsComponent } from '../Tabs.runtime';
import TabsSegmentedBarBase from './Tabs.segmented.parts';
import TabsSegmentedStaticBarEnhancer from './Tabs.segmented.static';
import { useResolvedTabsSegmentedRootState } from './Tabs.segmented.root-state';
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
import '../Tabs.common.scss';
import './Tabs.segmented.scss';

/**
 * What
 *     Exposes the segmented Tabs entrypoint by binding the shared runtime to the segmented
 *     resolvers.
 * Why
 *     Consumers that only need segmented tabs should import one lean type-specific component
 *     rather than a generic runtime that carries every visual variant.
 */
export const TabsSegmented = createTabsComponent<TabsSegmentedRootProps>({
  displayName: 'TabsSegmented',
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
