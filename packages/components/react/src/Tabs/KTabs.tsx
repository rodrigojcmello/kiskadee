import {
  type ClassNameByElementJSON,
  type ColorClasses,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode
} from '@kiskadee/core';
import { HeadlessTabs } from '@kiskadee/react-headless';
import { motion } from 'motion/react';
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext';
import type {
  TabsBarProps,
  TabsClassesMap,
  TabsClassNames,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from './KTabs.types.ts';
import './KTabs.scss';

export type {
  TabsBarProps,
  TabsClassNames,
  TabsContentProps,
  TabsElementName,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from './KTabs.types.ts';

const DEFAULT_SCALE = 's:md:1';
const DEFAULT_INTENT = 'neutral';
const DEFAULT_VARIANT = 'line';

type IndicatorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TabsVisualContextValue = {
  selected: string | undefined;
  scale: string;
  intent: string;
  emphasis: TabsRootProps['emphasis'];
  variant: NonNullable<TabsRootProps['variant']>;
  radiusMode: RadiusMode;
  indicatorMotion: NonNullable<TabsRootProps['indicatorMotion']>;
  indicatorPosition: NonNullable<TabsRootProps['indicatorPosition']>;
  indicatorShape: NonNullable<TabsRootProps['indicatorShape']>;
  indicatorTransition: Record<string, unknown>;
  separator: boolean;
  listClassName: string | undefined;
  separatorClassName: string | undefined;
  classNames: TabsClassNames;
  elements: TabsClassesMap;
};

const TabsVisualContext = createContext<TabsVisualContextValue | null>(null);

function useTabsVisualContext(): TabsVisualContextValue {
  const context = useContext(TabsVisualContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs.Root');
  }
  return context;
}

type TabsTabContextValue = {
  isSelected: boolean;
};

const TabsTabContext = createContext<TabsTabContextValue | null>(null);

function useTabsTabContext(): TabsTabContextValue {
  const context = useContext(TabsTabContext);
  if (!context) {
    throw new Error('Tabs.Label and Tabs.Icon must be used within a Tabs.Tab');
  }
  return context;
}

const normalizeScaleKey = (key: string): string => (key.startsWith('s:') ? key.slice(2) : key);

function joinClassNames(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

function resolveIntentClasses(
  element: ClassNameByElementJSON | undefined,
  intent: string,
  emphasis: TabsRootProps['emphasis']
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

function resolveEffectClasses(element: ClassNameByElementJSON | undefined): string {
  if (!element?.e) return '';
  return Object.values(element.e)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

function resolveElementClassName(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: string;
    intent: string;
    emphasis: TabsRootProps['emphasis'];
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

function resolveVariantElements(
  map: TabsClassesMap | Record<string, TabsClassesMap> | undefined,
  variant: string
): TabsClassesMap {
  if (!map) return {};
  const asRecord = map as Record<string, TabsClassesMap>;
  const isElementMap = Object.prototype.hasOwnProperty.call(asRecord, 'e1');
  if (isElementMap) return map as TabsClassesMap;
  return asRecord[variant] ?? asRecord.line ?? asRecord.box ?? {};
}

function resolveRadiusClassName(
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

function resolveSpringConfig(
  spring: TabsSpringPreset | TabsSpringConfig | undefined
): TabsSpringConfig {
  if (!spring || spring === 'snappy') {
    return { stiffness: 520, damping: 40, mass: 0.9 };
  }

  if (spring === 'gentle') {
    return { stiffness: 320, damping: 34, mass: 0.95 };
  }

  if (spring === 'debugSlow') {
    return { stiffness: 70, damping: 22, mass: 2.4 };
  }

  return spring;
}

function resolveIndicatorTransition(
  indicatorMotion: NonNullable<TabsRootProps['indicatorMotion']>,
  spring: TabsSpringPreset | TabsSpringConfig | undefined
): Record<string, unknown> {
  if (indicatorMotion === 'none') {
    return { duration: 0 };
  }

  const springConfig = resolveSpringConfig(spring);
  return {
    type: 'spring',
    ...springConfig
  };
}

function TabsRoot({
  children,
  classNames = {},
  scale = DEFAULT_SCALE,
  emphasis = 'medium',
  intent = DEFAULT_INTENT,
  variant,
  indicatorMotion = 'auto',
  indicatorPosition,
  indicatorShape,
  separator,
  spring,
  value,
  defaultValue,
  onValueChange,
  ...restProps
}: TabsRootProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
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

  const resolvedVariant = variant ?? global?.components?.tabs?.options?.variant ?? DEFAULT_VARIANT;
  const elements = resolveVariantElements(
    rawTabsMap as TabsClassesMap | Record<string, TabsClassesMap> | undefined,
    resolvedVariant
  );
  const resolvedIndicatorPosition =
    indicatorPosition ?? global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const resolvedIndicatorShape =
    indicatorShape ?? global?.components?.tabs?.options?.indicatorShape ?? 'square';
  const resolvedSeparator = separator ?? global?.components?.tabs?.options?.separator ?? false;
  const resolvedRadiusMode = (global?.radius ?? 'rounded') as RadiusMode;
  const indicatorTransition = resolveIndicatorTransition(indicatorMotion, spring);

  const listClassName = joinClassNames(
    'k-tab-a',
    'k-tab-e1',
    resolvedVariant === 'box' ? 'k-tab-b' : 'k-tab-l',
    resolveRadiusClassName(elements.e1, scale, resolvedRadiusMode),
    resolveElementClassName(elements.e1, {
      scale,
      intent,
      emphasis
    }),
    classNames.e1
  );

  const separatorClassName = joinClassNames(
    resolveElementClassName(elements.e6, {
      scale,
      intent,
      emphasis
    }),
    classNames.e6,
    'k-tab-e6'
  );

  const visualContext = useMemo<TabsVisualContextValue>(
    () => ({
      selected,
      scale,
      intent,
      emphasis,
      variant: resolvedVariant,
      radiusMode: resolvedRadiusMode,
      indicatorMotion,
      indicatorPosition: resolvedIndicatorPosition,
      indicatorShape: resolvedIndicatorShape,
      indicatorTransition,
      separator: resolvedSeparator,
      listClassName,
      separatorClassName,
      classNames,
      elements
    }),
    [
      selected,
      scale,
      intent,
      emphasis,
      resolvedVariant,
      resolvedRadiusMode,
      indicatorMotion,
      resolvedIndicatorPosition,
      resolvedIndicatorShape,
      indicatorTransition,
      resolvedSeparator,
      listClassName,
      separatorClassName,
      classNames,
      elements
    ]
  );

  return (
    <TabsVisualContext.Provider value={visualContext}>
      <HeadlessTabs.Root {...restProps} value={selected} onValueChange={handleValueChange}>
        {children}
      </HeadlessTabs.Root>
    </TabsVisualContext.Provider>
  );
}

function extractTabValue(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined;
  const value = (child.props as { value?: unknown }).value;
  return typeof value === 'string' ? value : undefined;
}

function findSelectedTabElement(
  barElement: HTMLDivElement | null,
  selected: string | undefined
): HTMLElement | null {
  if (!barElement || !selected) return null;
  const tabs = Array.from(barElement.querySelectorAll<HTMLElement>('[role="tab"]'));
  return tabs.find((tab) => tab.getAttribute('data-tab-value') === selected) ?? null;
}

function TabsBar({ className, children, ...props }: TabsBarProps) {
  const {
    selected,
    scale,
    intent,
    emphasis,
    variant,
    radiusMode,
    indicatorMotion,
    indicatorPosition,
    indicatorShape,
    indicatorTransition,
    classNames,
    elements,
    separator,
    separatorClassName,
    listClassName
  } = useTabsVisualContext();

  const barRef = useRef<HTMLDivElement | null>(null);
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null);
  const [settledSelected, setSettledSelected] = useState<string | undefined>(selected);
  const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(false);
  const latestSelectedRef = useRef<string | undefined>(selected);
  const previousSelectedRef = useRef<string | undefined>(selected);

  const positionClass =
    variant === 'line' ? (indicatorPosition === 'top' ? 'k-tab-e1-t' : 'k-tab-e1-b') : undefined;
  const separatorSelected =
    indicatorMotion === 'none' ? selected : isIndicatorAnimating ? undefined : settledSelected;

  const childrenWithSeparators = useMemo(() => {
    const items = Children.toArray(children);
    if (variant !== 'box' || !separator || items.length <= 1) return items;

    const output: ReactNode[] = [];
    let previousTabValue: string | undefined;
    let separatorIndex = 0;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const currentTabValue = extractTabValue(item);

      if (currentTabValue && previousTabValue) {
        const willHideOnSettle =
          selected !== undefined &&
          (selected === previousTabValue || selected === currentTabValue);
        const hidden =
          separatorSelected !== undefined &&
          (separatorSelected === previousTabValue || separatorSelected === currentTabValue);
        const dimmed = indicatorMotion !== 'none' && isIndicatorAnimating && willHideOnSettle;

        output.push(
          <span
            key={`k-tab-separator-${previousTabValue}-${currentTabValue}-${separatorIndex}`}
            aria-hidden="true"
            className={joinClassNames(
              separatorClassName,
              hidden ? 'k-tab-e6-h' : '',
              dimmed ? 'k-tab-e6-d' : ''
            )}
          />
        );
        separatorIndex += 1;
      }

      output.push(item);
      if (currentTabValue) {
        previousTabValue = currentTabValue;
      }
    }

    return output;
  }, [
    children,
    indicatorMotion,
    isIndicatorAnimating,
    selected,
    separator,
    separatorClassName,
    separatorSelected,
    variant
  ]);

  const updateIndicatorRect = useCallback(() => {
    const barElement = barRef.current;
    const selectedTab = findSelectedTabElement(barElement, selected);
    if (!barElement || !selectedTab) {
      setIndicatorRect(null);
      return;
    }

    const barRect = barElement.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    const nextRect = {
      x: tabRect.left - barRect.left + barElement.scrollLeft,
      y: tabRect.top - barRect.top + barElement.scrollTop,
      width: tabRect.width,
      height: tabRect.height
    };
    setIndicatorRect(nextRect);
  }, [selected]);

  useEffect(() => {
    updateIndicatorRect();
  }, [updateIndicatorRect, children]);

  useEffect(() => {
    latestSelectedRef.current = selected;
    if (indicatorMotion === 'none') {
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current === undefined || selected === undefined) {
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current !== selected) {
      setIsIndicatorAnimating(true);
      previousSelectedRef.current = selected;
    }
  }, [indicatorMotion, selected]);

  useEffect(() => {
    const barElement = barRef.current;
    if (!barElement) return;
    const selectedTab = findSelectedTabElement(barElement, selected);

    const onResize = () => updateIndicatorRect();
    barElement.addEventListener('scroll', onResize, { passive: true });
    window.addEventListener('resize', onResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(barElement);
      if (selectedTab) resizeObserver.observe(selectedTab);
    }

    return () => {
      barElement.removeEventListener('scroll', onResize);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
    };
  }, [selected, updateIndicatorRect]);

  const indicatorRadiusMode: RadiusMode =
    indicatorShape === 'square'
      ? 'square'
      : indicatorShape === 'pill'
        ? 'pill'
        : indicatorShape === 'rounded'
          ? 'rounded'
          : radiusMode;
  const indicatorShapeClass =
    indicatorShape === 'rounded'
      ? 'k-tab-e5-r'
      : indicatorShape === 'pill'
        ? 'k-tab-e5-p'
      : indicatorShape === 'roundedClip' && variant === 'line'
        ? 'k-tab-e5-c'
        : indicatorShape === 'square'
          ? 'k-tab-e5-q'
          : '';
  const indicatorClassName = joinClassNames(
    resolveElementClassName(elements.e5, {
      scale,
      intent,
      emphasis,
      selected: true
    }),
    resolveRadiusClassName(elements.e5, scale, indicatorRadiusMode),
    classNames.e5,
    'k-tab-e5',
    variant === 'line' ? (indicatorPosition === 'top' ? 'k-tab-e5-t' : 'k-tab-e5-b') : '',
    indicatorShapeClass,
    indicatorMotion === 'none' ? 'k-tab-e5-n' : '',
    elements.e5?.e?.h ? cn.shadow : '',
    'k-state'
  );

  const indicatorAnimate: Record<string, number> | undefined = indicatorRect
    ? variant === 'box'
      ? {
          x: indicatorRect.x,
          y: indicatorRect.y,
          width: indicatorRect.width,
          height: indicatorRect.height
        }
      : {
          x: indicatorRect.x,
          width: indicatorRect.width
        }
    : undefined;

  return (
    <HeadlessTabs.Bar
      ref={barRef}
      {...props}
      className={joinClassNames(listClassName, positionClass, className)}
    >
      {childrenWithSeparators}
      {indicatorAnimate ? (
        <motion.span
          initial={false}
          animate={indicatorAnimate}
          transition={indicatorTransition}
          onAnimationComplete={() => {
            if (indicatorMotion === 'none') return;
            setSettledSelected(latestSelectedRef.current);
            setIsIndicatorAnimating(false);
          }}
          className={indicatorClassName}
        />
      ) : null}
    </HeadlessTabs.Bar>
  );
}

function TabsTab({ value, className, label, icon, children, ...restProps }: TabsTabProps) {
  const { selected, scale, intent, emphasis, classNames, elements, radiusMode } =
    useTabsVisualContext();
  const isSelected = selected === value;

  const triggerClassName = joinClassNames(
    resolveElementClassName(elements.e2, {
      scale,
      intent,
      emphasis,
      selected: isSelected
    }),
    resolveRadiusClassName(elements.e2, scale, radiusMode),
    classNames.e2,
    'k-tab-e2',
    'k-state',
    cn.interactive,
    cn.activator,
    isSelected ? cn.selected : '',
    className
  );

  const tabContext = useMemo<TabsTabContextValue>(() => ({ isSelected }), [isSelected]);

  return (
    <HeadlessTabs.Tab {...restProps} value={value} className={triggerClassName}>
      <TabsTabContext.Provider value={tabContext}>
        <span className="k-tab-e2c">
          {children ? (
            children
          ) : (
            <>
              {icon ? <TabsIcon>{icon}</TabsIcon> : null}
              {label ? <TabsLabel>{label}</TabsLabel> : null}
            </>
          )}
        </span>
      </TabsTabContext.Provider>
    </HeadlessTabs.Tab>
  );
}

const TabsLabel = forwardRef<HTMLSpanElement, TabsLabelProps>(function TabsLabel(
  { className, children, ...props },
  ref
) {
  const { isSelected } = useTabsTabContext();
  const { scale, intent, emphasis, classNames, elements } = useTabsVisualContext();

  const labelClassName = joinClassNames(
    resolveElementClassName(elements.e3, {
      scale,
      intent,
      emphasis,
      selected: isSelected
    }),
    classNames.e3,
    'k-tab-e3',
    cn.activator,
    isSelected ? cn.selected : '',
    className
  );

  return (
    <span ref={ref} className={labelClassName} {...props}>
      {children}
    </span>
  );
});

const TabsIcon = forwardRef<HTMLSpanElement, TabsIconProps>(function TabsIcon(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const { isSelected } = useTabsTabContext();
  const { scale, intent, emphasis, classNames, elements } = useTabsVisualContext();

  const iconClassName = joinClassNames(
    resolveElementClassName(elements.e4, {
      scale,
      intent,
      emphasis,
      selected: isSelected
    }),
    classNames.e4,
    'k-tab-e4',
    cn.activator,
    isSelected ? cn.selected : '',
    className
  );

  return (
    <span ref={ref} className={iconClassName} aria-hidden={ariaHidden} {...props}>
      {children}
    </span>
  );
});

function TabsContent(props: TabsContentProps) {
  const panelClassName = joinClassNames('k-tab-p', props.className);
  return <HeadlessTabs.Content {...props} className={panelClassName} />;
}

function TabsIndicator(_: TabsIndicatorProps) {
  // KTabs indicator is rendered by selected Tab via Motion layout animation.
  return null;
}

type KTabsComponent = {
  Root: typeof TabsRoot;
  Bar: typeof TabsBar;
  Tab: typeof TabsTab;
  Label: typeof TabsLabel;
  Icon: typeof TabsIcon;
  Content: typeof TabsContent;
  Indicator: typeof TabsIndicator;
};

const TabsRootMemo = memo(TabsRoot);

export const KTabs = Object.assign(TabsRootMemo, {
  Root: TabsRootMemo,
  Bar: TabsBar,
  Tab: TabsTab,
  Label: TabsLabel,
  Icon: TabsIcon,
  Content: TabsContent,
  Indicator: TabsIndicator
}) as KTabsComponent;

export default KTabs;
