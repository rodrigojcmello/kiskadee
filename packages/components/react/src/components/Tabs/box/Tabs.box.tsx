import './Tabs.box.css';
import { createTabsComponent } from '../Tabs.runtime.tsx';
import type {
  TabsBarProps,
  TabsBoxIndicatorConfig,
  TabsBoxRootProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from '../Tabs.types';
import { useResolvedTabsBoxRootState } from './Tabs.box.root-state.tsx';
import TabsBoxStaticBarEnhancer from './Tabs.box.static.tsx';
import { tabsBoxStructural } from './Tabs.box.structural.ts';

/**
 * What
 *     Exposes the box Tabs entrypoint by binding the shared runtime to the box resolvers.
 * Why
 *     Consumers that only need box tabs should import one lean variant-specific component rather
 *     than a generic runtime that carries every visual variant.
 */
export const TabsBox = createTabsComponent<TabsBoxRootProps>({
  displayName: 'TabsBox',
  structural: tabsBoxStructural,
  StaticEnhancer: TabsBoxStaticBarEnhancer,
  loadMotionEnhancer: () => import('./Tabs.box.motion.tsx'),
  useResolvedRootState: useResolvedTabsBoxRootState
});

export type {
  TabsBarProps,
  TabsBoxIndicatorConfig,
  TabsBoxRootProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
};

export default TabsBox;
