import './Tabs.dot.motion.css';
import { motion } from 'motion/react';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { resolveIndicatorClassName } from '../Tabs.class-names';
import { useTabsVisualContext } from '../Tabs.context';
import type { IndicatorRect } from '../Tabs.measurements';
import { measureIndicatorRect, resolveBarEdgeOffsetStyle } from '../Tabs.measurements';
import type { TabsMotionEngineProps } from '../Tabs.motion.shared';

type DotIndicatorPhase = 'idle' | 'exit' | 'enter';

/**
 * What
 *     Renders the dot tab bar enhancer with lazy-loaded grow/shrink indicator motion.
 * Why
 *     Dot tabs use a distinct transition model from line and box, so their motion logic stays
 *     isolated behind the lazy client-only enhancer.
 */
export default function TabsDotMotionBarEnhancer({ children }: TabsMotionEngineProps) {
  const {
    selected,
    scale,
    intent,
    emphasis,
    tabShape,
    indicator,
    classNames,
    elements,
    structural,
    barRef
  } = useTabsVisualContext();
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null);
  const [dotDisplayRect, setDotDisplayRect] = useState<IndicatorRect | null>(null);
  const [dotPhase, setDotPhase] = useState<DotIndicatorPhase>('idle');
  const previousSelectedRef = useRef<string | undefined>(selected);
  const lastSettledIndicatorRectRef = useRef<IndicatorRect | null>(null);

  const updateIndicatorRect = useCallback(() => {
    setIndicatorRect(
      measureIndicatorRect({
        barElement: barRef.current,
        selected,
        width: indicator.width
      })
    );
  }, [barRef, indicator.width, selected]);

  useEffect(() => {
    updateIndicatorRect();
  }, [updateIndicatorRect, children]);

  useEffect(() => {
    if (dotPhase === 'idle') {
      setDotDisplayRect(indicatorRect);
      lastSettledIndicatorRectRef.current = indicatorRect;
    }
  }, [dotPhase, indicatorRect]);

  useEffect(() => {
    if (indicator.motion === 'none') {
      setDotPhase('idle');
      setDotDisplayRect(indicatorRect);
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current === undefined || selected === undefined) {
      previousSelectedRef.current = selected;
      return;
    }

    if (previousSelectedRef.current !== selected) {
      setDotDisplayRect(lastSettledIndicatorRectRef.current ?? indicatorRect);
      setDotPhase('exit');
      previousSelectedRef.current = selected;
    }
  }, [indicator.motion, indicatorRect, selected]);

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

  const renderedIndicatorRect = dotDisplayRect ?? indicatorRect;
  const indicatorClassName = resolveIndicatorClassName({
    structural,
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    tabShape,
    indicator,
    variant: 'dot'
  });
  const indicatorAnimate =
    renderedIndicatorRect !== null
      ? {
          scale: dotPhase === 'exit' ? 0 : 1,
          opacity: dotPhase === 'exit' ? 0 : 1
        }
      : undefined;
  const indicatorStyle = {
    ...(renderedIndicatorRect !== null
      ? {
          ['--k-tab-x' as const]: `${renderedIndicatorRect.x}px`,
          ['--k-tab-w' as const]: `${renderedIndicatorRect.width}px`
        }
      : {}),
    ['--k-tab-y' as const]: '0px',
    ['--k-tab-h' as const]: '0px',
    ...resolveBarEdgeOffsetStyle({
      barElement: barRef.current,
      position: indicator.position
    })
  } as CSSProperties;
  const dotTransition: Record<string, unknown> =
    dotPhase === 'exit' ? { duration: 0.09, ease: 'easeIn' } : { duration: 0.14, ease: 'easeOut' };

  return (
    <>
      {children}
      {indicatorAnimate ? (
        <motion.span
          initial={false}
          animate={indicatorAnimate}
          transition={dotTransition}
          style={indicatorStyle}
          onAnimationComplete={() => {
            if (indicator.motion === 'none') return;
            if (dotPhase === 'exit') {
              if (indicatorRect) {
                setDotDisplayRect(indicatorRect);
              }
              setDotPhase('enter');
              return;
            }
            if (dotPhase === 'enter') {
              setDotPhase('idle');
              lastSettledIndicatorRectRef.current = indicatorRect;
            }
          }}
          className={indicatorClassName}
        />
      ) : null}
    </>
  );
}
