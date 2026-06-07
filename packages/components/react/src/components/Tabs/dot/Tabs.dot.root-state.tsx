import { useMemo } from 'react';
import { type ResolvedTabsRootState, useTabsRuntimeRootState } from '../Tabs.runtime-state';
import type { TabsDotRootProps, TabsResolvedIndicator } from '../Tabs.types.ts';

/**
 * What
 *     Resolves the effective indicator position for dot tabs.
 * Why
 *     Dot tabs accept local position overrides and global defaults, so the runtime needs one
 *     helper to collapse those inputs.
 */
function resolveIndicatorPosition(
  indicator: TabsDotRootProps['indicator'],
  globalIndicatorPosition: string | undefined
): TabsResolvedIndicator['position'] {
  return indicator?.position ?? (globalIndicatorPosition === 'top' ? 'top' : 'bottom');
}

/**
 * What
 *     Resolves the effective motion mode for dot tabs.
 * Why
 *     Dot root-state assembly needs one normalized motion value before it builds the resolved
 *     indicator config.
 */
function resolveIndicatorMotion(
  indicator: TabsDotRootProps['indicator']
): TabsResolvedIndicator['motion'] {
  return indicator?.motion ?? 'none';
}

/**
 * What
 *     Builds the fully resolved root state for the dot Tabs runtime.
 * Why
 *     Dot tabs reuse shared root state but still need dot-specific indicator defaults and list
 *     classes in one place.
 */
export function useResolvedTabsDotRootState({
  indicator,
  ...props
}: TabsDotRootProps): ResolvedTabsRootState {
  const baseState = useTabsRuntimeRootState({
    ...props,
    variant: 'dot'
  });
  const resolvedIndicator: TabsResolvedIndicator = {
    motion: resolveIndicatorMotion(indicator),
    motionStyle: 'direct',
    position: resolveIndicatorPosition(indicator, baseState.globalTabsOptions?.indicatorPosition),
    shape: 'dot',
    width: 'tab'
  };

  return useMemo(
    () => ({
      ...baseState,
      resolvedVariant: 'dot' as const,
      resolvedLowerCurve: 'curved' as const,
      resolvedIndicator
    }),
    [baseState, resolvedIndicator]
  );
}
