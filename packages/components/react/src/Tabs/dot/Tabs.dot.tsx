import { createTabsComponent } from '../Tabs.runtime';
import TabsDotStaticBarEnhancer from './Tabs.dot.static';
import { useResolvedTabsDotRootState } from './Tabs.dot.root-state';
import type {
  TabsBarProps,
  TabsContentProps,
  TabsDotIndicatorConfig,
  TabsDotRootProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from '../Tabs.types';
import '../Tabs.common.scss';
import './Tabs.dot.scss';

/**
 * What
 *     Exposes the dot Tabs entrypoint by binding the shared runtime to the dot resolvers.
 * Why
 *     Consumers that only need dot tabs should import one lean type-specific component rather
 *     than a generic runtime that carries every visual variant.
 */
export const TabsDot = createTabsComponent<TabsDotRootProps>({
  displayName: 'TabsDot',
  StaticEnhancer: TabsDotStaticBarEnhancer,
  loadMotionEnhancer: () => import('./Tabs.dot.motion'),
  useResolvedRootState: useResolvedTabsDotRootState
});

export type {
  TabsBarProps,
  TabsContentProps,
  TabsDotIndicatorConfig,
  TabsDotRootProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
};

export default TabsDot;
