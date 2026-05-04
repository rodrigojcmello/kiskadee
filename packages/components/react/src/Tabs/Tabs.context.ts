import { createContext, useContext } from 'react';
import type { TabsTabContextValue, TabsVisualContextValue } from './Tabs.types.ts';

const TabsVisualContext = createContext<TabsVisualContextValue | null>(null);
const TabsTabContext = createContext<TabsTabContextValue | null>(null);

/**
 * What
 *     Reads the visual Tabs context for shared styling and indicator state.
 * Why
 *     Compound parts like `Bar`, `Tab`, and motion/static enhancers depend on one shared
 *     runtime state instead of receiving long prop chains.
 */
export function useTabsVisualContext(): TabsVisualContextValue {
  const context = useContext(TabsVisualContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs.Root');
  }
  return context;
}

/**
 * What
 *     Reads the per-tab context that exposes whether the current tab is selected.
 * Why
 *     `Tabs.Label` and `Tabs.Icon` need selection-aware styling without re-deriving state from
 *     the root context every time they render.
 */
export function useTabsTabContext(): TabsTabContextValue {
  const context = useContext(TabsTabContext);
  if (!context) {
    throw new Error('Tabs.Label and Tabs.Icon must be used within a Tabs.Tab');
  }
  return context;
}

export const TabsVisualContextProvider = TabsVisualContext.Provider;
export const TabsTabContextProvider = TabsTabContext.Provider;
