import { motion } from 'motion/react';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { resolveIndicatorClassName } from '../Tabs.class-names';
import { useTabsVisualContext } from '../Tabs.context';
import type { IndicatorRect } from '../Tabs.measurements';
import {
  measureElementRectRelativeToBar,
  measureIndicatorRect,
  resolveBarEdgeOffsetStyle
} from '../Tabs.measurements';
import { resolveStretchIndicatorRect, type TabsMotionEngineProps } from '../Tabs.motion.shared';
import './Tabs.line.motion.scss';

type StretchIndicatorPhase = 'idle' | 'stretch' | 'settle';

/**
 * What
 *     Renders the line tab bar enhancer with lazy-loaded motion support for the line indicator.
 * Why
 *     Line tabs keep static rendering as the default path, so this component isolates the
 *     heavier stretch/direct transition logic behind the motion boundary.
 */
export default function TabsLineMotionBarEnhancer({ children }: TabsMotionEngineProps) {
  const {
    selected,
    scale,
    intent,
    emphasis,
    radiusMode,
    indicator,
    indicatorTransition,
    classNames,
    elements,
    barRef
  } = useTabsVisualContext();
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null);
  const [stretchDisplayRect, setStretchDisplayRect] = useState<IndicatorRect | null>(null);
  const [stretchPhase, setStretchPhase] = useState<StretchIndicatorPhase>('idle');
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
    (
      nextValue: string | undefined,
      currentRenderedRect?: IndicatorRect | null
    ): IndicatorRect | null => {
      const barElement = barRef.current;
      if (!barElement || !nextValue) {
        return null;
      }

      if (indicator.widthMode !== 'fixed') {
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
    [barRef, indicator.widthMode, measureRenderedIndicatorRect, stretchPhase]
  );

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
    if (!supportsStretchMotion) {
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current === undefined || selected === undefined) {
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current !== selected) {
      const currentRenderedRect = measureRenderedIndicatorRect();
      const finalRect = measureAnimatedIndicatorRect(selected, currentRenderedRect);
      if (!finalRect) {
        previousSelectedRef.current = selected;
        return;
      }

      const previousRect =
        measureAnimatedIndicatorRect(previousSelectedRef.current, currentRenderedRect) ??
        stretchDisplayRect ??
        lastSettledIndicatorRectRef.current ??
        finalRect;
      setStretchDisplayRect(
        resolveStretchIndicatorRect({
          originRect: previousRect,
          finalRect
        })
      );
      setStretchPhase('stretch');
      previousSelectedRef.current = selected;
    }
  }, [
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
  }, [selected, updateIndicatorRect, barRef]);

  const renderedIndicatorRect = supportsStretchMotion
    ? (stretchDisplayRect ?? indicatorRect)
    : indicatorRect;
  const indicatorClassName = resolveIndicatorClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode,
    indicator,
    type: 'line',
    className:
      indicator.widthMode === 'fixed' && supportsStretchMotion && stretchPhase !== 'idle'
        ? 'k-tab-e5k'
        : undefined
  });
  const indicatorAnimate =
    renderedIndicatorRect !== null
      ? {
          ['--k-tab-x' as const]: `${renderedIndicatorRect.x}px`,
          ['--k-tab-w' as const]: `${renderedIndicatorRect.width}px`
        }
      : undefined;
  const indicatorStyle = {
    ['--k-tab-y' as const]: '0px',
    ['--k-tab-h' as const]: '0px',
    ...resolveBarEdgeOffsetStyle({
      barElement: barRef.current,
      position: indicator.position
    })
  } as CSSProperties;

  return (
    <>
      {children}
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
              return;
            }
            lastSettledIndicatorRectRef.current = measureRenderedIndicatorRect() ?? indicatorRect;
          }}
          className={indicatorClassName}
        />
      ) : null}
    </>
  );
}
