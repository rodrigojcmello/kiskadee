import { createTabsComponent } from '../Tabs.runtime';
import TabsBoxStaticBarEnhancer from './Tabs.box.static';
import { useResolvedTabsBoxRootState } from './Tabs.box.root-state';
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
import './Tabs.box.scss';

/**
 * What
 *     Exposes the box Tabs entrypoint by binding the shared runtime to the box resolvers.
 * Why
 *     Consumers that only need box tabs should import one lean type-specific component rather
 *     than a generic runtime that carries every visual variant.
 */
export const TabsBox = createTabsComponent<TabsBoxRootProps>({
  displayName: 'TabsBox',
  StaticEnhancer: TabsBoxStaticBarEnhancer,
  loadMotionEnhancer: () => import('./Tabs.box.motion'),
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
