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
  type IndicatorRect,
  measureIndicatorRect,
  measureElementRectRelativeToBar,
  joinClassNames,
  resolveIconClassName,
  resolveIndicatorClassName,
  resolveIndicatorVariant,
  resolveIndicatorWidthMode,
  resolveLabelClassName,
  resolveListClassName,
  resolveSeparatorClassName,
  resolveTabWidthMode,
  resolveTrimOuterCurves,
  resolveTriggerClassName,
  resolveVariantElements,
  TabsTabContextProvider,
  TabsVisualContextProvider,
  useTabsTabContext,
  useTabsVisualContext
} from './Tabs.common';
import './Tabs.common.scss';
import type {
  ResolvedTabsIndicator,
  TabsIndicatorMotion,
  TabsIndicatorMotionStyle,
  TabsTabContextValue,
  TabsVisualContextValue
} from './Tabs.common.types.ts';
import { TabsBridgeIndicator } from './Tabs.bridge';
import './Tabs.animated.scss';

export type {
  TabsBarProps,
  TabsBridgeIndicatorConfig,
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

type DotIndicatorPhase = 'idle' | 'exit' | 'enter';
type StretchIndicatorPhase = 'idle' | 'stretch' | 'settle';
const STRETCH_INDICATOR_MAX_WIDTH = 400;

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

function resolveStretchIndicatorRect(options: {
  originRect: IndicatorRect;
  finalRect: IndicatorRect;
}): IndicatorRect {
  const { originRect, finalRect } = options;
  const originRight = originRect.x + originRect.width;
  const finalRight = finalRect.x + finalRect.width;
  const movingRight = finalRect.x >= originRect.x;

  if (movingRight) {
    const width = Math.min(finalRight - originRect.x, STRETCH_INDICATOR_MAX_WIDTH);
    return {
      x: finalRight - width,
      y: finalRect.y,
      width,
      height: finalRect.height
    };
  }

  const width = Math.min(originRight - finalRect.x, STRETCH_INDICATOR_MAX_WIDTH);
  return {
    x: finalRect.x,
    y: finalRect.y,
    width,
    height: finalRect.height
  };
}

function TabsRoot({
  children,
  classNames = {},
  scale = DEFAULT_SCALE,
  emphasis = DEFAULT_EMPHASIS,
  intent = DEFAULT_INTENT,
  type,
  tabWidthMode,
  indicator,
  separator,
  trimOuterCurves,
  spring,
  value,
  defaultValue,
  onValueChange,
  ...restProps
}: TabsRootProps) {
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
  const resolvedTabWidthMode = resolveTabWidthMode(
    tabWidthMode,
    global?.components?.tabs?.options?.tabWidthMode
  );
  const resolvedSeparator = separator ?? global?.components?.tabs?.options?.separator ?? false;
  const resolvedTrimOuterCurves = resolveTrimOuterCurves(
    trimOuterCurves,
    global?.components?.tabs?.options?.trimOuterCurves
  );
  const resolvedRadiusMode = (global?.radius ?? 'rounded') as RadiusMode;
  const resolvedIndicatorMotion = indicator?.motion ?? 'auto';
  const resolvedIndicatorMotionStyle: TabsIndicatorMotionStyle =
    resolvedType === 'dot' || resolvedType === 'bridge' ? 'direct' : indicator?.motionStyle ?? 'direct';
  const indicatorTransition = resolveIndicatorTransition(resolvedIndicatorMotion, spring);
  const resolvedIndicator: ResolvedTabsIndicator = {
    motion: resolvedIndicatorMotion,
    motionStyle: resolvedIndicatorMotionStyle,
    position: resolvedType === 'bridge' ? 'bottom' : resolvedIndicatorPosition,
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
      tabWidthMode: resolvedTabWidthMode,
      radiusMode: resolvedRadiusMode,
      barRef,
      indicator: resolvedIndicator,
      indicatorTransition,
      separator: resolvedSeparator,
      trimOuterCurves: resolvedTrimOuterCurves,
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
      resolvedTabWidthMode,
      resolvedRadiusMode,
      barRef,
      resolvedIndicator,
      indicatorTransition,
      resolvedSeparator,
      resolvedTrimOuterCurves,
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
    barRef,
    separator,
    trimOuterCurves,
    separatorClassName,
    listClassName
  } = useTabsVisualContext();
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null);
  const [dotDisplayRect, setDotDisplayRect] = useState<IndicatorRect | null>(null);
  const [stretchDisplayRect, setStretchDisplayRect] = useState<IndicatorRect | null>(null);
  const [dotPhase, setDotPhase] = useState<DotIndicatorPhase>('idle');
  const [stretchPhase, setStretchPhase] = useState<StretchIndicatorPhase>('idle');
  const [settledSelected, setSettledSelected] = useState<string | undefined>(selected);
  const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(false);
  const indicatorRef = useRef<HTMLElement | null>(null);
  const latestSelectedRef = useRef<string | undefined>(selected);
  const previousSelectedRef = useRef<string | undefined>(selected);
  const lastSettledIndicatorRectRef = useRef<IndicatorRect | null>(null);
  const isDotIndicator = type === 'dot';
  const supportsStretchMotion =
    !isDotIndicator && indicator.motion !== 'none' && indicator.motionStyle === 'stretch';

  const measureRenderedIndicatorRect = useCallback(
    () =>
      measureElementRectRelativeToBar({
        barElement: barRef.current,
        element: indicatorRef.current
      }),
    [barRef]
  );

  const measureAnimatedIndicatorRect = useCallback(
    (
      nextValue: string | undefined,
      currentRenderedRect?: IndicatorRect | null
    ): IndicatorRect | null => {
      const barElement = barRef.current;
      if (!barElement || !nextValue) {
        return null;
      }

      if (type !== 'line' || indicator.widthMode !== 'fixed') {
        return measureIndicatorRect({
          barElement,
          selected: nextValue,
          widthMode: indicator.widthMode
        });
      }

      const tabRect = measureIndicatorRect({
        barElement,
        selected: nextValue,
        widthMode: 'tab'
      });

      if (!tabRect) {
        return null;
      }

      const fixedWidth =
        stretchPhase === 'idle'
          ? currentRenderedRect?.width ??
            measureRenderedIndicatorRect()?.width ??
            lastSettledIndicatorRectRef.current?.width
          : lastSettledIndicatorRectRef.current?.width ??
            currentRenderedRect?.width ??
            measureRenderedIndicatorRect()?.width;

      if (!fixedWidth) {
        return tabRect;
      }

      return {
        x: tabRect.x + (tabRect.width - fixedWidth) / 2,
        y: tabRect.y,
        width: fixedWidth,
        height: tabRect.height
      };
    },
    [barRef, indicator.widthMode, measureRenderedIndicatorRect, stretchPhase, type]
  );

  const resolveSettledIndicatorRect = useCallback(
    (nextValue: string | undefined): IndicatorRect | null =>
      measureAnimatedIndicatorRect(nextValue) ?? indicatorRect,
    [indicatorRect, measureAnimatedIndicatorRect]
  );

  const positionClass =
    type !== 'box' && type !== 'bridge'
      ? indicator.position === 'top'
        ? 'k-tab-e1b'
        : 'k-tab-e1a'
      : undefined;
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
    setIndicatorRect(
      measureIndicatorRect({
        barElement: barRef.current,
        selected,
        widthMode: indicator.widthMode
      })
    );
  }, [barRef, indicator.widthMode, selected]);

  useEffect(() => {
    updateIndicatorRect();
  }, [updateIndicatorRect, children]);

  useEffect(() => {
    if (!isDotIndicator) {
      setDotPhase('idle');
      setDotDisplayRect(null);
      return;
    }

    if (dotPhase === 'idle') {
      setDotDisplayRect(indicatorRect);
      lastSettledIndicatorRectRef.current = measureRenderedIndicatorRect() ?? indicatorRect;
    }
  }, [dotPhase, indicatorRect, isDotIndicator, measureRenderedIndicatorRect]);

  useEffect(() => {
    if (!supportsStretchMotion) {
      setStretchPhase('idle');
      setStretchDisplayRect(null);
      if (!isDotIndicator) {
        lastSettledIndicatorRectRef.current = measureRenderedIndicatorRect() ?? indicatorRect;
      }
      return;
    }

    if (stretchPhase === 'idle') {
      const settledRect = resolveSettledIndicatorRect(selected);
      setStretchDisplayRect(settledRect);
      lastSettledIndicatorRectRef.current = settledRect;
    }
  }, [
    indicatorRect,
    isDotIndicator,
    measureRenderedIndicatorRect,
    resolveSettledIndicatorRect,
    selected,
    stretchPhase,
    supportsStretchMotion
  ]);

  const resolveStretchTargets = useCallback(
    (nextValue: string | undefined): { stretchRect: IndicatorRect; finalRect: IndicatorRect } | null => {
      const barElement = barRef.current;
      if (!barElement || !nextValue) {
        return null;
      }

      const currentRenderedRect = measureRenderedIndicatorRect();
      const finalRect = measureAnimatedIndicatorRect(nextValue, currentRenderedRect);

      if (!finalRect) {
        return null;
      }

      const previousIndicatorRect = measureAnimatedIndicatorRect(
        previousSelectedRef.current,
        currentRenderedRect
      );
      const originRect =
        currentRenderedRect ??
        stretchDisplayRect ??
        lastSettledIndicatorRectRef.current ??
        previousIndicatorRect ??
        finalRect;

      const stretchRect = resolveStretchIndicatorRect({
        originRect,
        finalRect
      });

      return {
        stretchRect,
        finalRect
      };
    },
    [barRef, measureAnimatedIndicatorRect, measureRenderedIndicatorRect, stretchDisplayRect]
  );

  useEffect(() => {
    latestSelectedRef.current = selected;
    if (indicator.motion === 'none') {
      const settledRect = resolveSettledIndicatorRect(selected);
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      setDotPhase('idle');
      setStretchPhase('idle');
      setStretchDisplayRect(settledRect);
      lastSettledIndicatorRectRef.current = settledRect;
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current === undefined || selected === undefined) {
      const settledRect = resolveSettledIndicatorRect(selected);
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      setDotPhase('idle');
      setStretchPhase('idle');
      setStretchDisplayRect(settledRect);
      lastSettledIndicatorRectRef.current = settledRect;
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current !== selected) {
      setIsIndicatorAnimating(true);
      if (isDotIndicator) {
        setDotDisplayRect(lastSettledIndicatorRectRef.current ?? indicatorRect);
        setDotPhase('exit');
      } else if (supportsStretchMotion) {
        const stretchTargets = resolveStretchTargets(selected);
        if (stretchTargets) {
          setStretchDisplayRect(stretchTargets.stretchRect);
          setStretchPhase('stretch');
        } else {
          setStretchDisplayRect(indicatorRect);
          setStretchPhase('idle');
        }
      }
      previousSelectedRef.current = selected;
    }
  }, [
    indicator.motion,
    indicatorRect,
    isDotIndicator,
    resolveStretchTargets,
    resolveSettledIndicatorRect,
    selected,
    supportsStretchMotion
  ]);

  useEffect(() => {
    const barElement = barRef.current;
    if (!barElement) return;
    const selectedTab = barElement.querySelector<HTMLElement>(
      `[role="tab"][data-tab-value="${selected ?? ''}"]`
    );

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
    type,
    className:
      type !== 'bridge' &&
      type === 'line' &&
      indicator.widthMode === 'fixed' &&
      supportsStretchMotion &&
      stretchPhase !== 'idle'
        ? 'k-tab-e5k'
        : type === 'bridge'
          ? undefined
          : undefined
  });

  const renderedIndicatorRect = isDotIndicator
    ? (dotDisplayRect ?? indicatorRect)
    : supportsStretchMotion
      ? (stretchDisplayRect ?? indicatorRect)
      : indicatorRect;
  const indicatorAnimate: Record<string, string | number> | undefined = renderedIndicatorRect
    ? isDotIndicator
      ? {
          scale: dotPhase === 'exit' ? 0 : 1,
          opacity: dotPhase === 'exit' ? 0 : 1
        }
      : type === 'box' || type === 'bridge'
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
  const handleIndicatorAnimationComplete = () => {
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
      lastSettledIndicatorRectRef.current = indicatorRect;
    }
    if (supportsStretchMotion && stretchPhase === 'stretch') {
      const finalRect = measureAnimatedIndicatorRect(latestSelectedRef.current) ?? indicatorRect;
      if (finalRect) {
        setStretchDisplayRect(finalRect);
        setStretchPhase('settle');
        return;
      }
    }
    if (supportsStretchMotion && stretchPhase === 'settle') {
      setStretchPhase('idle');
      lastSettledIndicatorRectRef.current = measureRenderedIndicatorRect() ?? indicatorRect;
      setSettledSelected(latestSelectedRef.current);
      setIsIndicatorAnimating(false);
      return;
    }
    lastSettledIndicatorRectRef.current = measureRenderedIndicatorRect() ?? indicatorRect;
    setSettledSelected(latestSelectedRef.current);
    setIsIndicatorAnimating(false);
  };

  return (
    <HeadlessTabs.Bar
      ref={barRef}
      {...props}
      className={joinClassNames(listClassName, positionClass, className)}
    >
      {childrenWithSeparators}
      {indicatorAnimate
        ? type === 'bridge' && renderedIndicatorRect
          ? (
            <TabsBridgeIndicator
              as={motion.div}
              animate
              barRef={barRef}
              className={joinClassNames('k-tab-e5', 'k-tab-e5m')}
              indicatorRect={renderedIndicatorRect}
              onAnimationComplete={handleIndicatorAnimationComplete}
              probeClassName={indicatorClassName}
              selected={selected}
              trimOuterCurves={trimOuterCurves}
              transition={indicatorTransition}
            />
            )
          : (
            <motion.span
              ref={indicatorRef as any}
              initial={false}
              animate={indicatorAnimate}
              transition={isDotIndicator ? dotTransition : indicatorTransition}
              style={indicatorStyle}
              onAnimationComplete={handleIndicatorAnimationComplete}
              className={indicatorClassName}
            />
            )
        : null}
    </HeadlessTabs.Bar>
  );
}

function TabsTab({ value, className, label, icon, children, ...restProps }: TabsTabProps) {
  const { selected, scale, intent, emphasis, classNames, elements, tabWidthMode, radiusMode } =
    useTabsVisualContext();
  const isSelected = selected === value;

  const triggerClassName = resolveTriggerClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    tabWidthMode,
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
