import { createTabsComponent } from '../Tabs.runtime';
import TabsLineStaticBarEnhancer from './Tabs.line.static';
import { useResolvedTabsLineRootState } from './Tabs.line.root-state';
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
import './Tabs.line.scss';

/**
 * What
 *     Exposes the line Tabs entrypoint by binding the shared runtime to the line resolvers.
 * Why
 *     Consumers that only need line tabs should import one lean type-specific component rather
 *     than a generic runtime that carries every visual variant.
 */
export const TabsLine = createTabsComponent<TabsLineRootProps>({
  displayName: 'TabsLine',
  StaticEnhancer: TabsLineStaticBarEnhancer,
  loadMotionEnhancer: () => import('./Tabs.line.motion'),
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
