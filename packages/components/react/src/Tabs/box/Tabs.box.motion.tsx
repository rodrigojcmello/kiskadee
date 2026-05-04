import './Tabs.box.motion.css';
import { motion } from 'motion/react';
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildTabsChildrenWithSeparators } from '../Tabs.bar.helpers.tsx';
import { resolveIndicatorClassName } from '../Tabs.class-names.ts';
import { useTabsVisualContext } from '../Tabs.context.ts';
import type { IndicatorRect } from '../Tabs.measurements.ts';
import { measureElementRectRelativeToBar, measureIndicatorRect } from '../Tabs.measurements.ts';
import { resolveStretchIndicatorRect, type TabsMotionEngineProps } from '../Tabs.motion.shared.ts';

type StretchIndicatorPhase = 'idle' | 'stretch' | 'settle';

/**
 * What
 *     Renders the box tab bar enhancer with lazy-loaded motion support for the box indicator.
 * Why
 *     Box tabs combine indicator animation with runtime separator behavior, so this keeps that
 *     heavier client-only logic out of the default static path.
 */
export default function TabsBoxMotionBarEnhancer({ children }: TabsMotionEngineProps) {
  const {
    selected,
    scale,
    intent,
    emphasis,
    tabShape,
    indicator,
    indicatorTransition,
    classNames,
    elements,
    structural,
    barRef,
    separator,
    separatorClassName
  } = useTabsVisualContext();
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null);
  const [stretchDisplayRect, setStretchDisplayRect] = useState<IndicatorRect | null>(null);
  const [stretchPhase, setStretchPhase] = useState<StretchIndicatorPhase>('idle');
  const [settledSelected, setSettledSelected] = useState<string | undefined>(selected);
  const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(false);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const latestSelectedRef = useRef<string | undefined>(selected);
  const previousSelectedRef = useRef<string | undefined>(selected);
  const lastSettledIndicatorRectRef = useRef<IndicatorRect | null>(null);
  const supportsStretchMotion = indicator.motion !== 'none' && indicator.motionStyle === 'stretch';

  const measureRenderedIndicatorRect = useCallback(
    () =>
      measureElementRectRelativeToBar({
        barElement: barRef.current,
        element: indicatorRef.current
      }),
    [barRef]
  );

  const measureAnimatedIndicatorRect = useCallback(
    (nextValue: string | undefined): IndicatorRect | null =>
      measureIndicatorRect({
        barElement: barRef.current,
        selected: nextValue,
        width: indicator.width
      }),
    [barRef, indicator.width]
  );

  const updateIndicatorRect = useCallback(() => {
    setIndicatorRect(measureAnimatedIndicatorRect(selected));
  }, [measureAnimatedIndicatorRect, selected]);

  useEffect(() => {
    updateIndicatorRect();
  }, [updateIndicatorRect, children]);

  useEffect(() => {
    if (!supportsStretchMotion) {
      setStretchPhase('idle');
      setStretchDisplayRect(null);
      lastSettledIndicatorRectRef.current = measureRenderedIndicatorRect() ?? indicatorRect;
      return;
    }

    if (stretchPhase === 'idle') {
      const settledRect = measureAnimatedIndicatorRect(selected) ?? indicatorRect;
      setStretchDisplayRect(settledRect);
      lastSettledIndicatorRectRef.current = settledRect;
    }
  }, [
    indicatorRect,
    measureAnimatedIndicatorRect,
    measureRenderedIndicatorRect,
    selected,
    stretchPhase,
    supportsStretchMotion
  ]);

  useEffect(() => {
    latestSelectedRef.current = selected;
    if (indicator.motion === 'none') {
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      setStretchPhase('idle');
      setStretchDisplayRect(measureAnimatedIndicatorRect(selected) ?? indicatorRect);
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current === undefined || selected === undefined) {
      setSettledSelected(selected);
      setIsIndicatorAnimating(false);
      setStretchPhase('idle');
      setStretchDisplayRect(measureAnimatedIndicatorRect(selected) ?? indicatorRect);
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current !== selected) {
      setIsIndicatorAnimating(true);
      if (supportsStretchMotion) {
        const currentRenderedRect = measureRenderedIndicatorRect();
        const finalRect = measureAnimatedIndicatorRect(selected);
        if (finalRect) {
          const previousRect =
            currentRenderedRect ??
            stretchDisplayRect ??
            lastSettledIndicatorRectRef.current ??
            measureAnimatedIndicatorRect(previousSelectedRef.current) ??
            finalRect;
          setStretchDisplayRect(
            resolveStretchIndicatorRect({
              originRect: previousRect,
              finalRect
            })
          );
          setStretchPhase('stretch');
        }
      }
      previousSelectedRef.current = selected;
    }
  }, [
    indicator.motion,
    indicatorRect,
    measureAnimatedIndicatorRect,
    measureRenderedIndicatorRect,
    selected,
    stretchDisplayRect,
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
  }, [barRef, selected, updateIndicatorRect]);

  const separatorSelected =
    indicator.motion === 'none' ? selected : isIndicatorAnimating ? undefined : settledSelected;
  const childrenWithSeparators = useMemo(
    () =>
      buildTabsChildrenWithSeparators({
        children,
        variant: 'box',
        structural,
        separator,
        separatorClassName,
        getSeparatorState: (leftValue, rightValue) => {
          const willHideOnSettle =
            selected !== undefined && (selected === leftValue || selected === rightValue);
          return {
            hidden:
              separatorSelected !== undefined &&
              (separatorSelected === leftValue || separatorSelected === rightValue),
            dimmed: indicator.motion !== 'none' && isIndicatorAnimating && willHideOnSettle
          };
        }
      }),
    [
      children,
      indicator.motion,
      isIndicatorAnimating,
      selected,
      separator,
      separatorClassName,
      separatorSelected,
      structural
    ]
  );

  const renderedIndicatorRect = supportsStretchMotion
    ? (stretchDisplayRect ?? indicatorRect)
    : indicatorRect;
  const indicatorClassName = resolveIndicatorClassName({
    structural,
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    tabShape,
    indicator,
    variant: 'box'
  });
  const indicatorAnimate =
    renderedIndicatorRect !== null
      ? {
          ['--k-tab-x' as const]: `${renderedIndicatorRect.x}px`,
          ['--k-tab-y' as const]: `${renderedIndicatorRect.y}px`,
          ['--k-tab-w' as const]: `${renderedIndicatorRect.width}px`,
          ['--k-tab-h' as const]: `${renderedIndicatorRect.height}px`
        }
      : undefined;
  const indicatorStyle: CSSProperties = {
    top: 0,
    bottom: 'auto'
  };

  return (
    <>
      {childrenWithSeparators}
      {indicatorAnimate ? (
        <motion.span
          ref={indicatorRef}
          initial={false}
          animate={indicatorAnimate}
          transition={indicatorTransition}
          style={indicatorStyle}
          onAnimationComplete={() => {
            if (supportsStretchMotion && stretchPhase === 'stretch') {
              const finalRect =
                measureAnimatedIndicatorRect(latestSelectedRef.current) ?? indicatorRect;
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
          }}
          className={indicatorClassName}
        />
      ) : null}
    </>
  );
}
