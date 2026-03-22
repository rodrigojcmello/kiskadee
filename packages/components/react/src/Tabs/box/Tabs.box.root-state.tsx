import { useMemo } from 'react';
import {
  resolveIndicatorRadiusMode,
  resolveIndicatorVariant,
  resolveListClassName,
  resolveSeparatorClassName
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
    variant: resolveIndicatorVariant(
      'box',
      indicator?.variant,
      baseState.globalTabsOptions?.indicatorVariant ?? baseState.globalTabsOptions?.indicatorShape
    ),
    widthMode: 'tab'
  };
  const resolvedRadiusMode = resolveIndicatorRadiusMode(
    resolvedIndicator,
    baseState.resolvedRadiusMode
  );
  const listClassName = resolveListClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis,
    radiusMode: resolvedRadiusMode,
    type: 'box',
    indicatorPosition: resolvedIndicator.position
  });
  const separatorClassName = resolveSeparatorClassName({
    elements: baseState.elements,
    classNames: baseState.classNames,
    scale: baseState.scale,
    intent: baseState.intent,
    emphasis: baseState.emphasis
  });

  return useMemo(
    () => ({
      ...baseState,
      resolvedRadiusMode,
      resolvedType: 'box' as const,
      listClassName,
      separatorClassName,
      resolvedIndicator
    }),
    [baseState, listClassName, resolvedIndicator, resolvedRadiusMode, separatorClassName]
  );
}
