import { useMemo } from 'react';
import { resolveIndicatorShape } from '../Tabs.class-names.ts';
import { type ResolvedTabsRootState, useTabsRuntimeRootState } from '../Tabs.runtime-state';
import type { TabsResolvedIndicator, TabsSegmentedRootProps } from '../Tabs.types.ts';

/**
 * What
 *     Builds the fully resolved root state for the segmented Tabs runtime.
 * Why
 *     Segmented tabs reuse the shared root state but still need segmented-specific
 *     indicator defaults and list/separator classes in one place.
 */
export function useResolvedTabsSegmentedRootState({
  indicator,
  ...props
}: TabsSegmentedRootProps): ResolvedTabsRootState {
  const baseState = useTabsRuntimeRootState({
    ...props,
    variant: 'segmented'
  });
  const resolvedIndicator: TabsResolvedIndicator = {
    motion: 'none',
    motionStyle: 'direct',
    position: 'bottom',
    shape: resolveIndicatorShape(
      'segmented',
      indicator?.shape,
      baseState.globalTabsOptions?.indicatorShape
    ),
    width: 'tab'
  };
  const resolvedTabShape = 'rounded' as const;

  return useMemo(
    () => ({
      ...baseState,
      resolvedTabShape,
      resolvedVariant: 'segmented' as const,
      resolvedLowerCurve: 'curved' as const,
      resolvedIndicator
    }),
    [baseState, resolvedIndicator, resolvedTabShape]
  );
}
