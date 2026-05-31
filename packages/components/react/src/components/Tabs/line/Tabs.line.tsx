import './Tabs.line.css';
import { createTabsComponent } from '../Tabs.runtime.tsx';
import TabsLineStaticBarEnhancer from './Tabs.line.static.tsx';
import { tabsLineStructural } from './Tabs.line.structural.ts';
import { useResolvedTabsLineRootState } from './Tabs.line.root-state.tsx';
import type {
  TabsBarProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsLineIndicatorConfig,
  TabsLineRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from '../Tabs.types';

/**
 * What
 *     Exposes the line Tabs entrypoint by binding the shared runtime to the line resolvers.
 * Why
 *     Consumers that only need line tabs should import one lean variant-specific component rather
 *     than a generic runtime that carries every visual variant.
 */
export const TabsLine = createTabsComponent<TabsLineRootProps>({
  displayName: 'TabsLine',
  structural: tabsLineStructural,
  StaticEnhancer: TabsLineStaticBarEnhancer,
  loadMotionEnhancer: () => import('./Tabs.line.motion.tsx'),
  useResolvedRootState: useResolvedTabsLineRootState
});

export type {
  TabsBarProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsLineIndicatorConfig,
  TabsLineRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
};

export default TabsLine;
