import './Tabs.dot.css';
import { createTabsComponent } from '../Tabs.runtime.tsx';
import TabsDotStaticBarEnhancer from './Tabs.dot.static.tsx';
import { tabsDotStructural } from './Tabs.dot.structural.ts';
import { useResolvedTabsDotRootState } from './Tabs.dot.root-state.tsx';
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

/**
 * What
 *     Exposes the dot Tabs entrypoint by binding the shared runtime to the dot resolvers.
 * Why
 *     Consumers that only need dot tabs should import one lean variant-specific component rather
 *     than a generic runtime that carries every visual variant.
 */
export const TabsDot = createTabsComponent<TabsDotRootProps>({
  displayName: 'TabsDot',
  structural: tabsDotStructural,
  StaticEnhancer: TabsDotStaticBarEnhancer,
  loadMotionEnhancer: () => import('./Tabs.dot.motion.tsx'),
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
