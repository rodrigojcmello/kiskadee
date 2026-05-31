import type { ReactNode } from 'react';

type TabsBridgeStaticBarEnhancerProps = {
  children?: ReactNode;
};

/**
 * What
 *     Leaves the bridge tab bar children untouched.
 * Why
 *     Bridge does not render a measured indicator layer, so the shared Tabs runtime still needs
 *     a static enhancer that simply preserves the bar contents.
 */
export function TabsBridgeStaticBarEnhancer({ children }: TabsBridgeStaticBarEnhancerProps) {
  return children ?? null;
}

export default TabsBridgeStaticBarEnhancer;
