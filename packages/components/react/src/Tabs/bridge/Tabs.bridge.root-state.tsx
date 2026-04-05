import { useMemo } from 'react';
import { resolveListClassName, resolveSeparatorClassName } from '../Tabs.class-names';
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
  const listClassName = resolveListClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    tabWidthMode: baseState.resolvedTabWidthMode,
    radiusMode: resolvedRadiusMode,
    type: 'bridge',
    indicatorPosition: resolvedIndicator.position,
    lowerCurveMode: resolvedLowerCurveMode
  });
  const separatorClassName = resolveSeparatorClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    type: 'bridge'
  });

  return useMemo(
    () => ({
      ...baseState,
      resolvedRadiusMode,
      resolvedType: 'bridge' as const,
      resolvedLowerCurveMode,
      resolvedSeparator: false,
      listClassName,
      separatorClassName,
      resolvedIndicator
    }),
    [
      baseState,
      listClassName,
      resolvedIndicator,
      resolvedLowerCurveMode,
      resolvedRadiusMode,
      separatorClassName
    ]
  );
}
