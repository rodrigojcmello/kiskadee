import { useMemo } from 'react';
import {
  type ResolvedTabsRootState,
  useTabsRuntimeRootState
} from '../Tabs.runtime-state';
import type { TabsBridgeRootProps, TabsResolvedIndicator, TabsVisualContextValue } from '../Tabs.types';

function resolveLowerCurveMode(
  lowerCurveMode: TabsBridgeRootProps['lowerCurveMode'],
  globalLowerCurveMode: TabsVisualContextValue['lowerCurveMode'] | undefined
): TabsVisualContextValue['lowerCurveMode'] {
  return lowerCurveMode ?? globalLowerCurveMode ?? 'curved';
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
  lowerCurveMode,
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
    variant: 'bridge',
    widthMode: 'tab'
  };
  const resolvedRadiusMode = 'rounded' as const;
  const resolvedLowerCurveMode = resolveLowerCurveMode(
    lowerCurveMode,
    baseState.globalTabsOptions?.lowerCurveMode
  );

  return useMemo(
    () => ({
      ...baseState,
      resolvedRadiusMode,
      resolvedType: 'bridge' as const,
      resolvedLowerCurveMode,
      resolvedSeparator: false,
      resolvedIndicator
    }),
    [baseState, resolvedIndicator, resolvedLowerCurveMode, resolvedRadiusMode]
  );
}
