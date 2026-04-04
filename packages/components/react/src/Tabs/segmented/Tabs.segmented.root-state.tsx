import { useMemo } from 'react';
import {
  resolveIndicatorVariant,
  resolveListClassName,
  resolveSeparatorClassName
} from '../Tabs.class-names';
import {
  type ResolvedTabsRootState,
  useTabsRuntimeRootState
} from '../Tabs.runtime-state';
import type { TabsResolvedIndicator, TabsSegmentedRootProps } from '../Tabs.types';

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
    variant: resolveIndicatorVariant(
      'segmented',
      indicator?.variant,
      baseState.globalTabsOptions?.indicatorVariant ?? baseState.globalTabsOptions?.indicatorShape
    ),
    widthMode: 'tab'
  };
  const resolvedRadiusMode = 'rounded' as const;
  const listClassName = resolveListClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    radiusMode: resolvedRadiusMode,
    type: 'segmented',
    indicatorPosition: resolvedIndicator.position,
    lowerCurveMode: 'curved'
  });
  const separatorClassName = resolveSeparatorClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    type: 'segmented'
  });

  return useMemo(
    () => ({
      ...baseState,
      resolvedRadiusMode,
      resolvedType: 'segmented' as const,
      resolvedLowerCurveMode: 'curved' as const,
      listClassName,
      separatorClassName,
      resolvedIndicator
    }),
    [baseState, listClassName, resolvedIndicator, resolvedRadiusMode, separatorClassName]
  );
}
