import { createTabsComponent } from '../Tabs.runtime';
import {
  TabsBridgeBarBase,
  TabsBridgeContentBase,
  TabsBridgeTabBase
} from './Tabs.bridge.parts';
import TabsBridgeStaticBarEnhancer from './Tabs.bridge.static';
import { useResolvedTabsBridgeRootState } from './Tabs.bridge.root-state';
import type {
  TabsBarProps,
  TabsBridgeIndicatorConfig,
  TabsBridgeRootProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from '../Tabs.types';
import '../Tabs.common.scss';
import './Tabs.bridge.scss';

/**
 * What
 *     Exposes the bridge Tabs entrypoint by binding the shared runtime to the bridge resolvers.
 * Why
 *     Bridge has its own structural shell but still reuses the common headless/runtime layer.
 */
export const TabsBridge = createTabsComponent<TabsBridgeRootProps>({
  displayName: 'TabsBridge',
  StaticEnhancer: TabsBridgeStaticBarEnhancer,
  BarComponent: TabsBridgeBarBase,
  TabComponent: TabsBridgeTabBase,
  ContentComponent: TabsBridgeContentBase,
  useResolvedRootState: useResolvedTabsBridgeRootState
});

export type {
  TabsBarProps,
  TabsBridgeIndicatorConfig,
  TabsBridgeRootProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
};

export default TabsBridge;
