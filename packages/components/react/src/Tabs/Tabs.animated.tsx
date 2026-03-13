import type { RadiusMode } from '@kiskadee/core';
import { HeadlessTabs } from '@kiskadee/react-headless';
import { motion } from 'motion/react';
import {
  Children,
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext';
import type {
  TabsBarProps,
  TabsClassesMap,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from './Tabs.animated.types.ts';
import {
  DEFAULT_EMPHASIS,
  DEFAULT_INTENT,
  DEFAULT_SCALE,
  DEFAULT_TYPE,
  extractTabValue,
  joinClassNames,
  resolveIconClassName,
  resolveIndicatorClassName,
  resolveIndicatorVariant,
  resolveIndicatorWidthMode,
  resolveLabelClassName,
  resolveListClassName,
  resolveSeparatorClassName,
  resolveTriggerClassName,
  resolveVariantElements,
  TabsTabContextProvider,
  TabsVisualContextProvider,
  useTabsTabContext,
  useTabsVisualContext
} from './Tabs.common.ts';
import './Tabs.common.scss';
import type {
  ResolvedTabsIndicator,
  TabsIndicatorMotion,
  TabsTabContextValue,
  TabsVisualContextValue
} from './Tabs.common.types.ts';
import './Tabs.animated.scss';

export type {
  TabsBarProps,
  TabsBoxIndicatorConfig,
  TabsClassesMap,
  TabsClassNames,
  TabsContentProps,
  TabsDotIndicatorConfig,
  TabsElementName,
  TabsIconProps,
  TabsIndicatorConfig,
  TabsIndicatorMotion,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsLineIndicatorConfig,
  TabsRootProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from './Tabs.animated.types.ts';

type IndicatorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DotIndicatorPhase = 'idle' | 'exit' | 'enter';

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
  indicatorMotion: TabsIndicatorMotion,
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
  emphasis = DEFAULT_EMPHASIS,
  intent = DEFAULT_INTENT,
  type,
  indicator,
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

  const resolvedType =
    type ??
    global?.components?.tabs?.options?.type ??
    global?.components?.tabs?.options?.variant ??
    DEFAULT_TYPE;
  const elements = resolveVariantElements(
    rawTabsMap as TabsClassesMap | Record<string, TabsClassesMap> | undefined,
    resolvedType
  );
  const resolvedIndicatorPosition =
    indicator?.position ?? global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const resolvedIndicatorVariant = resolveIndicatorVariant(
    resolvedType,
    indicator?.variant,
    global?.components?.tabs?.options?.indicatorVariant ??
      global?.components?.tabs?.options?.indicatorShape
  );
  const resolvedIndicatorWidthMode = resolveIndicatorWidthMode(
    resolvedType,
    indicator?.widthMode,
    global?.components?.tabs?.options?.indicatorWidthMode
  );
  const resolvedSeparator = separator ?? global?.components?.tabs?.options?.separator ?? false;
  const resolvedRadiusMode = (global?.radius ?? 'rounded') as RadiusMode;
  const resolvedIndicatorMotion = indicator?.motion ?? 'auto';
  const indicatorTransition = resolveIndicatorTransition(resolvedIndicatorMotion, spring);
  const resolvedIndicator: ResolvedTabsIndicator = {
    motion: resolvedIndicatorMotion,
    position: resolvedIndicatorPosition,
    variant: resolvedIndicatorVariant,
    widthMode: resolvedIndicatorWidthMode
  };

  const listClassName = resolveListClassName({
    modeClass: 'k-tab-a',
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode: resolvedRadiusMode,
    type: resolvedType
  });

  const separatorClassName = resolveSeparatorClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis
  });

  const visualContext = useMemo<TabsVisualContextValue>(
    () => ({
      selected,
      scale,
      intent,
      emphasis,
      type: resolvedType,
      radiusMode: resolvedRadiusMode,
      indicator: resolvedIndicator,
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
      resolvedType,
      resolvedRadiusMode,
      resolvedIndicator,
      indicatorTransition,
      resolvedSeparator,
      listClassName,
      separatorClassName,
      classNames,
      elements
    ]
  );

  return (
    <TabsVisualContextProvider value={visualContext}>
      <HeadlessTabs.Root {...restProps} value={selected} onValueChange={handleValueChange}>
        {children}
      </HeadlessTabs.Root>
    </TabsVisualContextProvider>
  );
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
    type,
    radiusMode,
    indicator,
    indicatorTransition,
    classNames,
    elements,
    separator,
    separatorClassName,
    listClassName
  } = useTabsVisualContext();

  const barRef = useRef<HTMLDivElement | null>(null);
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null);
  const [dotDisplayRect, setDotDisplayRect] = useState<IndicatorRect | null>(null);
  const [dotPhase, setDotPhase] = useState<DotIndicatorPhase>('idle');
  const [settledSelected, setSettledSelected] = useState<string | undefined>(selected);
  const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(false);
  const latestSelectedRef = useRef<string | undefined>(selected);
  const previousSelectedRef = useRef<string | undefined>(selected);
  const lastSettledIndicatorRectRef = useRef<IndicatorRect | null>(null);
  const isDotIndicator = type === 'dot';

  const positionClass =
    type !== 'box' ? (indicator.position === 'top' ? 'k-tab-e1b' : 'k-tab-e1a') : undefined;
  const separatorSelected =
    indicator.motion === 'none' ? selected : isIndicatorAnimating ? undefined : settledSelected;

  const childrenWithSeparators = useMemo(() => {
    const items = Children.toArray(children);
    if (type !== 'box' || !separator || items.length <= 1) return items;

    const output: ReactNode[] = [];
    let previousTabValue: string | undefined;
    let separatorIndex = 0;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const currentTabValue = extractTabValue(item);

      if (currentTabValue && previousTabValue) {
        const willHideOnSettle =
          selected !== undefined && (selected === previousTabValue || selected === currentTabValue);
        const hidden =
          separatorSelected !== undefined &&
          (separatorSelected === previousTabValue || separatorSelected === currentTabValue);
        const dimmed = indicator.motion !== 'none' && isIndicatorAnimating && willHideOnSettle;

        output.push(
          <span
            key={`k-tab-separator-${previousTabValue}-${currentTabValue}-${separatorIndex}`}
            aria-hidden="true"
            className={joinClassNames(
              separatorClassName,
              hidden ? 'k-tab-e6b' : '',
              dimmed ? 'k-tab-e6a' : ''
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
    indicator.motion,
    isIndicatorAnimating,
    selected,
    separator,
    separatorClassName,
    separatorSelected,
    type
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
    if (!isDotIndicator) {
      setDotPhase('idle');
      setDotDisplayRect(null);
      lastSettledIndicatorRectRef.current = null;
      return;
    }

    if (dotPhase === 'idle') {
      setDotDisplayRect(indicatorRect);
      lastSettledIndicatorRectRef.current = indicatorRect;
    }
  }, [dotPhase, indicatorRect, isDotIndicator]);

  useEffect(() => {
    latestSelectedRef.current = selected;
    if (indicator.motion === 'none') {
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      setDotPhase('idle');
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current === undefined || selected === undefined) {
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      setDotPhase('idle');
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current !== selected) {
      setIsIndicatorAnimating(true);
      if (isDotIndicator) {
        setDotDisplayRect(lastSettledIndicatorRectRef.current ?? indicatorRect);
        setDotPhase('exit');
      }
      previousSelectedRef.current = selected;
    }
  }, [indicator.motion, indicatorRect, isDotIndicator, selected]);

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

  const indicatorClassName = resolveIndicatorClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode,
    indicator,
    type
  });

  const renderedIndicatorRect = isDotIndicator ? (dotDisplayRect ?? indicatorRect) : indicatorRect;
  const indicatorAnimate: Record<string, string | number> | undefined = renderedIndicatorRect
    ? isDotIndicator
      ? {
          scale: dotPhase === 'exit' ? 0 : 1,
          opacity: dotPhase === 'exit' ? 0 : 1
        }
      : type === 'box'
        ? {
            ['--k-tab-x' as const]: `${renderedIndicatorRect.x}px`,
            ['--k-tab-y' as const]: `${renderedIndicatorRect.y}px`,
            ['--k-tab-w' as const]: `${renderedIndicatorRect.width}px`,
            ['--k-tab-h' as const]: `${renderedIndicatorRect.height}px`
          }
        : {
            ['--k-tab-x' as const]: `${renderedIndicatorRect.x}px`,
            ['--k-tab-w' as const]: `${renderedIndicatorRect.width}px`
          }
    : undefined;
  const dotTransition: Record<string, unknown> =
    dotPhase === 'exit' ? { duration: 0.09, ease: 'easeIn' } : { duration: 0.14, ease: 'easeOut' };
  const indicatorStyle = {
    ['--k-tab-x' as const]:
      isDotIndicator && renderedIndicatorRect ? `${renderedIndicatorRect.x}px` : '0px',
    ['--k-tab-y' as const]: '0px',
    ['--k-tab-w' as const]:
      isDotIndicator && renderedIndicatorRect ? `${renderedIndicatorRect.width}px` : '0px',
    ['--k-tab-h' as const]: '0px'
  } as CSSProperties;

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
          transition={isDotIndicator ? dotTransition : indicatorTransition}
          style={indicatorStyle}
          onAnimationComplete={() => {
            if (indicator.motion === 'none') return;
            if (isDotIndicator && dotPhase === 'exit') {
              if (indicatorRect) {
                setDotDisplayRect(indicatorRect);
              }
              setDotPhase('enter');
              return;
            }
            if (isDotIndicator && dotPhase === 'enter') {
              setDotPhase('idle');
            }
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

  const triggerClassName = resolveTriggerClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode,
    selected: isSelected,
    className
  });

  const tabContext = useMemo<TabsTabContextValue>(() => ({ isSelected }), [isSelected]);

  return (
    <HeadlessTabs.Tab {...restProps} value={value} className={triggerClassName}>
      <TabsTabContextProvider value={tabContext}>
        <span className="k-tab-c">
          {children ? (
            children
          ) : (
            <>
              {icon ? <TabsIcon>{icon}</TabsIcon> : null}
              {label ? <TabsLabel>{label}</TabsLabel> : null}
            </>
          )}
        </span>
      </TabsTabContextProvider>
    </HeadlessTabs.Tab>
  );
}

const TabsLabel = forwardRef<HTMLSpanElement, TabsLabelProps>(function TabsLabel(
  { className, children, ...props },
  ref
) {
  const { isSelected } = useTabsTabContext();
  const { scale, intent, emphasis, classNames, elements } = useTabsVisualContext();

  const labelClassName = resolveLabelClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    selected: isSelected,
    className
  });

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

  const iconClassName = resolveIconClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    selected: isSelected,
    className
  });

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
