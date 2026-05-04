import { type CSSProperties, type ReactNode, useCallback, useEffect, useState } from 'react';
import { resolveIndicatorClassName } from '../Tabs.class-names.ts';
import { useTabsVisualContext } from '../Tabs.context.ts';
import { measureIndicatorRect, resolveBarEdgeOffsetStyle } from '../Tabs.measurements.ts';

type TabsLineStaticBarEnhancerProps = {
  children?: ReactNode;
};

/**
 * What
 *     Renders the static line indicator and keeps its geometry synced with the selected tab.
 * Why
 *     The static line runtime needs a DOM-measured indicator without loading the motion layer.
 */
function TabsLineStaticIndicator() {
  const {
    selected,
    scale,
    intent,
    emphasis,
    classNames,
    elements,
    structural,
    indicator,
    tabShape,
    barRef
  } = useTabsVisualContext();
  const [indicatorRect, setIndicatorRect] = useState<ReturnType<typeof measureIndicatorRect>>(null);

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
  }, [updateIndicatorRect]);

  useEffect(() => {
    const barElement = barRef.current;
    if (!barElement) return;
    const selectedTab = barElement.querySelector<HTMLElement>(
      `[role="tab"][data-tab-value="${selected ?? ''}"]`
    );

    barElement.addEventListener('scroll', updateIndicatorRect, { passive: true });
    window.addEventListener('resize', updateIndicatorRect);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateIndicatorRect);
      resizeObserver.observe(barElement);
      if (selectedTab) resizeObserver.observe(selectedTab);
    }

    return () => {
      barElement.removeEventListener('scroll', updateIndicatorRect);
      window.removeEventListener('resize', updateIndicatorRect);
      resizeObserver?.disconnect();
    };
  }, [barRef, selected, updateIndicatorRect]);

  const indicatorClassName = resolveIndicatorClassName({
    structural,
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    tabShape,
    indicator,
    variant: 'line'
  });
  const indicatorStyle = (
    indicatorRect !== null
      ? {
          ['--k-tab-x' as const]: `${indicatorRect.x}px`,
          ['--k-tab-y' as const]: `${indicatorRect.y}px`,
          ['--k-tab-w' as const]: `${indicatorRect.width}px`,
          ['--k-tab-h' as const]: `${indicatorRect.height}px`,
          ...resolveBarEdgeOffsetStyle({
            barElement: barRef.current,
            position: indicator.position
          })
        }
      : {}
  ) as CSSProperties;

  return (
    <div
      aria-hidden="true"
      data-visible={indicatorRect ? true : undefined}
      hidden={!indicatorRect}
      style={indicatorStyle}
      className={indicatorClassName}
    />
  );
}

/**
 * What
 *     Wraps the line tab bar with the static indicator renderer.
 * Why
 *     The shared runtime expects one enhancer per variant, and the line static path only needs to
 *     append its measured indicator.
 */
export function TabsLineStaticBarEnhancer({ children }: TabsLineStaticBarEnhancerProps) {
  return (
    <>
      {children}
      <TabsLineStaticIndicator />
    </>
  );
}

export default TabsLineStaticBarEnhancer;
