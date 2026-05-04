import './Tabs.bridge.css';
import { createTabsComponent } from '../Tabs.runtime.tsx';
import {
  TabsBridgeBarBase,
  TabsBridgeContentBase,
  TabsBridgeTabBase
} from './Tabs.bridge.parts';
import { tabsBridgeStructural } from './Tabs.bridge.structural.ts';
import TabsBridgeStaticBarEnhancer from './Tabs.bridge.static.tsx';
import { useResolvedTabsBridgeRootState } from './Tabs.bridge.root-state.tsx';
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

/**
 * What
 *     Exposes the bridge Tabs entrypoint by binding the shared runtime to the bridge resolvers.
 * Why
 *     Bridge has its own structural shell but still reuses the common headless/runtime layer.
 */
export const TabsBridge = createTabsComponent<TabsBridgeRootProps>({
  displayName: 'TabsBridge',
  structural: tabsBridgeStructural,
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
