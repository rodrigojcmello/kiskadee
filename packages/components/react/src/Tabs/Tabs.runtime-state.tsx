import type { RadiusMode, TabsType } from '@kiskadee/core';
import { type RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext';
import {
  DEFAULT_EMPHASIS,
  DEFAULT_INTENT,
  DEFAULT_SCALE,
  resolveTabWidthMode,
  resolveVariantElements
} from './Tabs.class-names';
import type {
  TabsResolvedIndicator,
  TabsClassesMap,
  TabsVisualContextValue
} from './Tabs.types';
import type { TabsRootBaseProps } from './Tabs.types';

export type TabsRuntimeRootState = {
  selected: string | undefined;
  handleValueChange: (value: string) => void;
  barRef: RefObject<HTMLDivElement | null>;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  elements: TabsClassesMap;
  resolvedTabWidthMode: TabsVisualContextValue['tabWidthMode'];
  resolvedSeparator: boolean;
  resolvedRadiusMode: RadiusMode;
  classNames: NonNullable<TabsRootBaseProps['classNames']>;
  globalTabsOptions: NonNullable<
    NonNullable<NonNullable<ReturnType<typeof useKiskadee>['global']>['components']>['tabs']
  >['options'] | undefined;
};

export type ResolvedTabsRootState = TabsRuntimeRootState & {
  resolvedType: TabsVisualContextValue['type'];
  resolvedLowerCurveMode: TabsVisualContextValue['lowerCurveMode'];
  listClassName: string | undefined;
  separatorClassName: string | undefined;
  resolvedIndicator: TabsResolvedIndicator;
};

/**
 * What
 *     Resolves the shared root state used by every Tabs type before type-specific decoration.
 * Why
 *     Line, box, and dot all need the same controlled state, schema classes, and global option
 *     fallbacks before they specialize indicator behavior.
 */
export function useTabsRuntimeRootState({
  classNames = {},
  scale = DEFAULT_SCALE,
  emphasis = DEFAULT_EMPHASIS,
  intent = DEFAULT_INTENT,
  tabWidthMode,
  separator,
  value,
  defaultValue,
  onValueChange,
  variant
}: TabsRootBaseProps & { variant: TabsType }): TabsRuntimeRootState {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const barRef = useRef<HTMLDivElement | null>(null);
  const selected = isControlled ? value : uncontrolledValue;

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  const {
    classesMap: { tabs: rawTabsMap },
    global
  } = useKiskadee();

  const globalTabsOptions = global?.components?.tabs?.options;
  const elements = resolveVariantElements(
    rawTabsMap as TabsClassesMap | Record<string, TabsClassesMap> | undefined,
    variant
  );
  const resolvedTabWidthMode = resolveTabWidthMode(tabWidthMode, globalTabsOptions?.tabWidthMode);
  const resolvedSeparator =
    separator ?? (variant === 'segmented' ? true : globalTabsOptions?.separator ?? false);
  const resolvedRadiusMode = (global?.radius ?? 'rounded') as RadiusMode;

  return useMemo(
    () => ({
      selected,
      handleValueChange,
      barRef,
      scale,
      intent,
      emphasis,
      elements,
      resolvedTabWidthMode,
      resolvedSeparator,
      resolvedRadiusMode,
      classNames,
      globalTabsOptions
    }),
    [
      classNames,
      elements,
      emphasis,
      globalTabsOptions,
      handleValueChange,
      intent,
      resolvedRadiusMode,
      resolvedSeparator,
      resolvedTabWidthMode,
      scale,
      selected
    ]
  );
}
