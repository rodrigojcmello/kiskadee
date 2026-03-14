import {
  type ClassNameByElementJSON,
  type ColorClasses,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode
} from '@kiskadee/core';
import { createContext, isValidElement, type ReactNode, useContext } from 'react';
import type {
  ResolvedTabsIndicator,
  TabsClassesMap,
  TabsClassNames,
  TabsTabContextValue,
  TabsVisualContextValue
} from './Tabs.common.types.ts';

export const DEFAULT_SCALE = 's:md:1';
export const DEFAULT_EMPHASIS: TabsVisualContextValue['emphasis'] = 'medium';
export const DEFAULT_INTENT = 'neutral';
export const DEFAULT_TYPE: TabsVisualContextValue['type'] = 'line';
const TAB_CONTENT_SELECTOR = '.k-tab-c';

const TabsVisualContext = createContext<TabsVisualContextValue | null>(null);
const TabsTabContext = createContext<TabsTabContextValue | null>(null);

export function useTabsVisualContext(): TabsVisualContextValue {
  const context = useContext(TabsVisualContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs.Root');
  }
  return context;
}

export function useTabsTabContext(): TabsTabContextValue {
  const context = useContext(TabsTabContext);
  if (!context) {
    throw new Error('Tabs.Label and Tabs.Icon must be used within a Tabs.Tab');
  }
  return context;
}

export const TabsVisualContextProvider = TabsVisualContext.Provider;
export const TabsTabContextProvider = TabsTabContext.Provider;

export const normalizeScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

export function joinClassNames(
  ...parts: Array<string | undefined | false | null>
): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export function resolveIntentClasses(
  element: TabsClassesMap['e1'] | undefined,
  intent: string,
  emphasis: TabsVisualContextValue['emphasis']
): string {
  if (!element?.c) return '';

  const byIntent = element.c as Record<string, ColorClasses>;
  const chosen = byIntent[intent] ?? Object.values(byIntent)[0];
  if (!chosen) return '';

  if (emphasis) {
    const bucket = componentEmphasisBuckets[emphasis];
    const buckets = chosen as Record<string, string | undefined>;
    return buckets[bucket] ?? chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';
  }

  return chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';
}

export function resolveEffectClasses(element: TabsClassesMap['e1'] | undefined): string {
  if (!element?.e) return '';
  return Object.values(element.e)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

export function resolveElementClassName(
  element: TabsClassesMap['e1'] | undefined,
  options: {
    scale: string;
    intent: string;
    emphasis: TabsVisualContextValue['emphasis'];
    selected?: boolean;
  }
): string {
  if (!element) return '';

  const scaleKey = normalizeScaleKey(options.scale);
  return (
    joinClassNames(
      element.d,
      resolveIntentClasses(element, options.intent, options.emphasis),
      element.s?.all,
      element.s?.[scaleKey],
      resolveEffectClasses(element),
      options.selected ? element.l : ''
    ) ?? ''
  );
}

export function resolveWidthClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string
): string {
  if (!element) return '';

  const scaleKey = normalizeScaleKey(scale);
  return joinClassNames(element.w?.all, element.w?.[scaleKey]) ?? '';
}

export function resolveVariantElements(
  map: TabsClassesMap | Record<string, TabsClassesMap> | undefined,
  variant: string
): TabsClassesMap {
  if (!map) return {};
  const asRecord = map as Record<string, TabsClassesMap>;
  const isElementMap = Object.hasOwn(asRecord, 'e1');
  if (isElementMap) return map as TabsClassesMap;
  return asRecord[variant] ?? asRecord.line ?? asRecord.box ?? asRecord.dot ?? {};
}

export function resolveRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode
): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  const all =
    radiusMode === 'rounded'
      ? (element.r?.all ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.all ?? '')
        : radiusMode === 'square'
          ? (element.rs?.all ?? '')
          : '';
  const byScale =
    radiusMode === 'rounded'
      ? (element.r?.[scaleKey] ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.[scaleKey] ?? '')
        : radiusMode === 'square'
          ? (element.rs?.[scaleKey] ?? '')
          : '';
  return joinClassNames(all, byScale) ?? '';
}

export function resolveIndicatorModeClass(
  type: TabsVisualContextValue['type'],
  indicatorWidthMode: TabsVisualContextValue['indicator']['widthMode']
): string {
  if (type === 'dot') {
    return 'k-tab-e5c';
  }

  if (type !== 'line') {
    return '';
  }

  return indicatorWidthMode === 'fixed' ? 'k-tab-e5b' : 'k-tab-e5a';
}

export function resolveIndicatorVariant(
  type: TabsVisualContextValue['type'],
  indicatorVariant: ResolvedTabsIndicator['variant'] | undefined,
  globalIndicatorVariant: string | undefined
): ResolvedTabsIndicator['variant'] {
  const candidate = typeof indicatorVariant === 'string' ? indicatorVariant : globalIndicatorVariant;

  if (type === 'dot') {
    return 'dot';
  }

  if (type === 'line') {
    return candidate === 'rounded' || candidate === 'roundedClip' ? candidate : 'square';
  }

  return candidate === 'rounded' || candidate === 'pill' ? candidate : 'square';
}

export function resolveIndicatorWidthMode(
  type: TabsVisualContextValue['type'],
  indicatorWidthMode: TabsVisualContextValue['indicator']['widthMode'] | undefined,
  globalIndicatorWidthMode: TabsVisualContextValue['indicator']['widthMode'] | undefined
): TabsVisualContextValue['indicator']['widthMode'] {
  if (type !== 'line') {
    return 'tab';
  }

  return indicatorWidthMode ?? globalIndicatorWidthMode ?? 'tab';
}

export function resolveTabWidthMode(
  tabWidthMode: TabsVisualContextValue['tabWidthMode'] | undefined,
  globalTabWidthMode: TabsVisualContextValue['tabWidthMode'] | undefined
): TabsVisualContextValue['tabWidthMode'] {
  return tabWidthMode ?? globalTabWidthMode ?? 'auto';
}

export type IndicatorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function findSelectedTabElement(
  barElement: HTMLDivElement | null,
  selected: string | undefined
): HTMLElement | null {
  if (!barElement || !selected) return null;
  const tabs = Array.from(barElement.querySelectorAll<HTMLElement>('[role="tab"]'));
  return tabs.find((tab) => tab.getAttribute('data-tab-value') === selected) ?? null;
}

function findMeasuredTabContentElement(selectedTab: HTMLElement): HTMLElement | null {
  return selectedTab.querySelector<HTMLElement>(TAB_CONTENT_SELECTOR);
}

export function measureIndicatorRect(options: {
  barElement: HTMLDivElement | null;
  selected: string | undefined;
  widthMode: TabsVisualContextValue['indicator']['widthMode'];
}): IndicatorRect | null {
  const { barElement, selected, widthMode } = options;
  const selectedTab = findSelectedTabElement(barElement, selected);
  if (!barElement || !selectedTab) {
    return null;
  }

  const barRect = barElement.getBoundingClientRect();
  const tabRect = selectedTab.getBoundingClientRect();
  const measuredRect =
    widthMode === 'content'
      ? (findMeasuredTabContentElement(selectedTab)?.getBoundingClientRect() ?? tabRect)
      : tabRect;

  return {
    x: measuredRect.left - barRect.left + barElement.scrollLeft,
    y: measuredRect.top - barRect.top + barElement.scrollTop,
    width: measuredRect.width,
    height: measuredRect.height
  };
}

export function resolveListClassName(options: {
  modeClass: 'k-tab-a' | 'k-tab-s';
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  radiusMode: RadiusMode;
  type: TabsVisualContextValue['type'];
}): string | undefined {
  return joinClassNames(
    options.modeClass,
    'k-tab-e1',
    options.type === 'box' ? 'k-tab-b' : options.type === 'dot' ? 'k-tab-d' : 'k-tab-l',
    resolveRadiusClassName(options.elements.e1, options.scale, options.radiusMode),
    resolveElementClassName(options.elements.e1, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis
    }),
    options.classNames.e1
  );
}

export function resolveSeparatorClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e6, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis
    }),
    options.classNames.e6,
    'k-tab-e6'
  );
}

export function resolveTriggerClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  tabWidthMode: TabsVisualContextValue['tabWidthMode'];
  radiusMode: RadiusMode;
  selected: boolean;
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e2, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected
    }),
    options.tabWidthMode === 'fixed' ? resolveWidthClassName(options.elements.e2, options.scale) : '',
    resolveRadiusClassName(options.elements.e2, options.scale, options.radiusMode),
    options.classNames.e2,
    'k-tab-e2',
    options.tabWidthMode === 'fixed' ? 'k-tab-e2a' : '',
    'k-state',
    cn.interactive,
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

export function resolveLabelClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  selected: boolean;
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e3, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected
    }),
    options.classNames.e3,
    'k-tab-e3',
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

export function resolveIconClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  selected: boolean;
  className?: string;
}): string | undefined {
  return joinClassNames(
    resolveElementClassName(options.elements.e4, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: options.selected
    }),
    options.classNames.e4,
    'k-tab-e4',
    cn.activator,
    options.selected ? cn.selected : '',
    options.className
  );
}

export function resolveIndicatorClassName(options: {
  elements: TabsClassesMap;
  classNames: TabsClassNames;
  scale: string;
  intent: string;
  emphasis: TabsVisualContextValue['emphasis'];
  radiusMode: RadiusMode;
  indicator: ResolvedTabsIndicator;
  type: TabsVisualContextValue['type'];
  className?: string;
}): string | undefined {
  const indicatorRadiusMode: RadiusMode =
    options.indicator.variant === 'square'
      ? 'square'
      : options.indicator.variant === 'pill'
        ? 'pill'
        : options.indicator.variant === 'rounded'
          ? 'rounded'
          : options.radiusMode;
  const indicatorVariantClass =
    options.indicator.variant === 'rounded'
      ? 'k-tab-e5e'
      : options.indicator.variant === 'pill'
        ? 'k-tab-e5f'
        : options.indicator.variant === 'roundedClip' && options.type === 'line'
          ? 'k-tab-e5g'
          : options.indicator.variant === 'square'
            ? 'k-tab-e5d'
            : '';

  return joinClassNames(
    resolveElementClassName(options.elements.e5, {
      scale: options.scale,
      intent: options.intent,
      emphasis: options.emphasis,
      selected: true
    }),
    resolveRadiusClassName(options.elements.e5, options.scale, indicatorRadiusMode),
    options.classNames.e5,
    'k-tab-e5',
    options.type !== 'box'
      ? options.indicator.position === 'top'
        ? 'k-tab-e5i'
        : 'k-tab-e5h'
      : '',
    resolveIndicatorModeClass(options.type, options.indicator.widthMode),
    indicatorVariantClass,
    options.indicator.motion === 'none' ? 'k-tab-e5j' : '',
    options.elements.e5?.e?.h ? cn.shadow : '',
    'k-state',
    options.className
  );
}

export function extractTabValue(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined;
  const value = (child.props as { value?: unknown }).value;
  return typeof value === 'string' ? value : undefined;
}
