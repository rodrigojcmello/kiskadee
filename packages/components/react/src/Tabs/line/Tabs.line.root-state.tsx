import { useMemo } from 'react';
import { resolveIndicatorShape, resolveIndicatorWidth } from '../Tabs.class-names';
import {
  type ResolvedTabsRootState,
  useTabsRuntimeRootState
} from '../Tabs.runtime-state';
import type { TabsLineRootProps, TabsResolvedIndicator } from '../Tabs.types';

/**
 * What
 *     Resolves the effective indicator position for line tabs.
 * Why
 *     Line tabs allow local overrides and global defaults, so this keeps the final top/bottom
 *     decision in one helper.
 */
function resolveIndicatorPosition(
  indicator: TabsLineRootProps['indicator'],
  globalIndicatorPosition: string | undefined
): TabsResolvedIndicator['position'] {
  return indicator?.position ?? (globalIndicatorPosition === 'top' ? 'top' : 'bottom');
}

/**
 * What
 *     Resolves the effective motion mode for line tabs.
 * Why
 *     Line root-state assembly should work with one final motion value before it builds the
 *     resolved indicator object.
 */
function resolveIndicatorMotion(indicator: TabsLineRootProps['indicator']): TabsResolvedIndicator['motion'] {
  return indicator?.motion ?? 'none';
}

/**
 * What
 *     Builds the fully resolved root state for the line Tabs runtime.
 * Why
 *     The line entrypoint needs one place to combine shared root state with line-specific
 *     indicator defaults and structural classes.
 */
export function useResolvedTabsLineRootState({
  indicator,
  ...props
}: TabsLineRootProps): ResolvedTabsRootState {
  const baseState = useTabsRuntimeRootState({
    ...props,
    variant: 'line'
  });
  const resolvedIndicatorPosition = resolveIndicatorPosition(
    indicator,
    baseState.globalTabsOptions?.indicatorPosition
  );
  const resolvedIndicator: TabsResolvedIndicator = {
    motion: resolveIndicatorMotion(indicator),
    motionStyle: indicator?.motionStyle ?? 'direct',
    position: resolvedIndicatorPosition,
    shape: resolveIndicatorShape(
      'line',
      indicator?.shape,
      baseState.globalTabsOptions?.indicatorShape
    ),
    width: resolveIndicatorWidth(
      'line',
      indicator?.width,
      baseState.globalTabsOptions?.indicatorWidth
    )
  };

  return useMemo(
    () => ({
      ...baseState,
      resolvedVariant: 'line' as const,
      resolvedLowerCurve: 'curved' as const,
      resolvedIndicator
    }),
    [baseState, resolvedIndicator]
  );
}
