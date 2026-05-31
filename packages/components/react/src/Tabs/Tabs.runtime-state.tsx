import type { RadiusMode, TabsVariant } from '@kiskadee/core';
import { type RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import {
  DEFAULT_EMPHASIS,
  DEFAULT_INTENT,
  DEFAULT_SCALE,
  resolveTabWidth,
  resolveVariantElements
} from './Tabs.class-names';
import type { TabsClassesMap, TabsResolvedIndicator, TabsVisualContextValue } from './Tabs.types';
import type { TabsRootBaseProps } from './Tabs.types.ts';
import { type TabsArtifactConfig, useTabsArtifactConfig } from './useTabsArtifactConfig.ts';

export type TabsRuntimeRootState = {
  selected: string | undefined;
  handleValueChange: (value: string) => void;
  barRef: RefObject<HTMLDivElement | null>;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  elements: TabsClassesMap;
  resolvedTabWidth: TabsVisualContextValue['tabWidth'];
  resolvedSeparator: boolean;
  resolvedTabShape: RadiusMode;
  classNames: NonNullable<TabsRootBaseProps['classNames']>;
  globalTabsOptions: TabsArtifactConfig['options'] | undefined;
};

export type ResolvedTabsRootState = TabsRuntimeRootState & {
  resolvedVariant: TabsVisualContextValue['variant'];
  resolvedLowerCurve: TabsVisualContextValue['lowerCurve'];
  resolvedIndicator: TabsResolvedIndicator;
};

/**
 * What
 *     Resolves the shared root state used by every Tabs variant before variant-specific decoration.
 * Why
 *     Line, box, and dot all need the same controlled state, schema classes, and global option
 *     fallbacks before they specialize indicator behavior.
 */
export function useTabsRuntimeRootState({
  classNames = {},
  scale = DEFAULT_SCALE,
  emphasis = DEFAULT_EMPHASIS,
  intent = DEFAULT_INTENT,
  tabWidth,
  separator,
  value,
  defaultValue,
  onValueChange,
  variant
}: TabsRootBaseProps & { variant: TabsVariant }): TabsRuntimeRootState {
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

  const { global } = useKiskadee();
  const { tabsClassesMap, options: globalTabsOptions } = useTabsArtifactConfig();

  const elements = resolveVariantElements(tabsClassesMap, variant);
  const resolvedTabWidth = resolveTabWidth(tabWidth, globalTabsOptions?.tabWidth);
  const resolvedSeparator =
    separator ?? (variant === 'segmented' ? true : (globalTabsOptions?.separator ?? false));
  const resolvedTabShape = (global?.radius ?? 'rounded') as RadiusMode;

  return useMemo(
    () => ({
      selected,
      handleValueChange,
      barRef,
      scale,
      intent,
      emphasis,
      elements,
      resolvedTabWidth,
      resolvedSeparator,
      resolvedTabShape,
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
      resolvedTabShape,
      resolvedSeparator,
      resolvedTabWidth,
      scale,
      selected
    ]
  );
}
