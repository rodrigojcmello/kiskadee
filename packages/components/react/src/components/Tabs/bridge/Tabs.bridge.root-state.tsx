import { useMemo } from 'react';
import {
  type ResolvedTabsRootState,
  useTabsRuntimeRootState
} from '../Tabs.runtime-state';
import type { TabsBridgeRootProps, TabsResolvedIndicator, TabsVisualContextValue } from '../Tabs.types.ts';

function resolveLowerCurve(
  lowerCurve: TabsBridgeRootProps['lowerCurve'],
  globalLowerCurve: TabsVisualContextValue['lowerCurve'] | undefined
): TabsVisualContextValue['lowerCurve'] {
  return lowerCurve ?? globalLowerCurve ?? 'curved';
}

/**
 * What
 *     Builds the fully resolved root state for the bridge Tabs runtime.
 * Why
 *     Bridge reuses the shared Tabs foundation but fixes radius mode and lower-curve behavior
 *     into one resolved state before rendering.
 */
export function useResolvedTabsBridgeRootState({
  indicator: _indicator,
  lowerCurve,
  ...props
}: TabsBridgeRootProps): ResolvedTabsRootState {
  const baseState = useTabsRuntimeRootState({
    ...props,
    variant: 'bridge'
  });
  const resolvedIndicator: TabsResolvedIndicator = {
    motion: 'none',
    motionStyle: 'direct',
    position: 'bottom',
    shape: 'bridge',
    width: 'tab'
  };
  const resolvedTabShape = 'rounded' as const;
  const resolvedLowerCurve = resolveLowerCurve(
    lowerCurve,
    baseState.globalTabsOptions?.lowerCurve
  );

  return useMemo(
    () => ({
      ...baseState,
      resolvedTabShape,
      resolvedVariant: 'bridge' as const,
      resolvedLowerCurve,
      resolvedSeparator: false,
      resolvedIndicator
    }),
    [baseState, resolvedIndicator, resolvedLowerCurve, resolvedTabShape]
  );
}
