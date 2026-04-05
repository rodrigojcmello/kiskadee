import { useMemo } from 'react';
import { resolveListClassName, resolveSeparatorClassName } from '../Tabs.class-names';
import {
  type ResolvedTabsRootState,
  useTabsRuntimeRootState
} from '../Tabs.runtime-state';
import type { TabsDotRootProps, TabsResolvedIndicator } from '../Tabs.types';

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
function resolveIndicatorMotion(indicator: TabsDotRootProps['indicator']): TabsResolvedIndicator['motion'] {
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
    variant: 'dot',
    widthMode: 'tab'
  };
  const listClassName = resolveListClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    tabWidthMode: baseState.resolvedTabWidthMode,
    radiusMode: baseState.resolvedRadiusMode,
    type: 'dot',
    indicatorPosition: resolvedIndicator.position,
    lowerCurveMode: 'curved'
  });
  const separatorClassName = resolveSeparatorClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    type: 'dot'
  });

  return useMemo(
    () => ({
      ...baseState,
      resolvedType: 'dot' as const,
      resolvedLowerCurveMode: 'curved' as const,
      listClassName,
      separatorClassName,
      resolvedIndicator
    }),
    [baseState, listClassName, resolvedIndicator, separatorClassName]
  );
}
