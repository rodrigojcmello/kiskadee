import { useMemo } from 'react';
import {
  resolveIndicatorShape,
  resolveIndicatorTabShape
} from '../Tabs.class-names';
import {
  type ResolvedTabsRootState,
  useTabsRuntimeRootState
} from '../Tabs.runtime-state';
import type { TabsBoxRootProps, TabsResolvedIndicator } from '../Tabs.types';

/**
 * What
 *     Resolves the effective motion mode for box tabs.
 * Why
 *     Box root-state assembly should work from one normalized motion value before building the
 *     resolved indicator config.
 */
function resolveIndicatorMotion(indicator: TabsBoxRootProps['indicator']): TabsResolvedIndicator['motion'] {
  return indicator?.motion ?? 'none';
}

/**
 * What
 *     Builds the fully resolved root state for the box Tabs runtime.
 * Why
 *     Box tabs reuse the shared root state but still need box-specific indicator defaults and
 *     list/separator classes in one place.
 */
export function useResolvedTabsBoxRootState({
  indicator,
  ...props
}: TabsBoxRootProps): ResolvedTabsRootState {
  const baseState = useTabsRuntimeRootState({
    ...props,
    variant: 'box'
  });
  const resolvedIndicator: TabsResolvedIndicator = {
    motion: resolveIndicatorMotion(indicator),
    motionStyle: indicator?.motionStyle ?? 'direct',
    position: 'bottom',
    shape: resolveIndicatorShape(
      'box',
      indicator?.shape,
      baseState.globalTabsOptions?.indicatorShape
    ),
    width: 'tab'
  };
  const resolvedTabShape = resolveIndicatorTabShape(
    resolvedIndicator,
    baseState.resolvedTabShape
  );

  return useMemo(
    () => ({
      ...baseState,
      resolvedTabShape,
      resolvedVariant: 'box' as const,
      resolvedLowerCurve: 'curved' as const,
      resolvedIndicator
    }),
    [baseState, resolvedIndicator, resolvedTabShape]
  );
}
