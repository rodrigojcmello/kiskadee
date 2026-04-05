import { useMemo } from 'react';
import {
  resolveIndicatorVariant,
  resolveIndicatorWidthMode,
  resolveListClassName,
  resolveSeparatorClassName
} from '../Tabs.class-names';
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
    variant: resolveIndicatorVariant(
      'line',
      indicator?.variant,
      baseState.globalTabsOptions?.indicatorVariant ?? baseState.globalTabsOptions?.indicatorShape
    ),
    widthMode: resolveIndicatorWidthMode(
      'line',
      indicator?.widthMode,
      baseState.globalTabsOptions?.indicatorWidthMode
    )
  };
  const listClassName = resolveListClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    tabWidthMode: baseState.resolvedTabWidthMode,
    radiusMode: baseState.resolvedRadiusMode,
    type: 'line',
    indicatorPosition: resolvedIndicator.position,
    lowerCurveMode: 'curved'
  });
  const separatorClassName = resolveSeparatorClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    type: 'line'
  });

  return useMemo(
    () => ({
      ...baseState,
      resolvedType: 'line' as const,
      resolvedLowerCurveMode: 'curved' as const,
      listClassName,
      separatorClassName,
      resolvedIndicator
    }),
    [baseState, listClassName, resolvedIndicator, separatorClassName]
  );
}
