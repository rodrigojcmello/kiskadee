import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { buildTabsChildrenWithSeparators } from '../Tabs.bar.helpers';
import { resolveIndicatorClassName } from '../Tabs.class-names';
import { useTabsVisualContext } from '../Tabs.context';
import { measureIndicatorRect } from '../Tabs.measurements';

type TabsSegmentedStaticBarEnhancerProps = {
  children?: ReactNode;
};

/**
 * What
 *     Renders the static segmented indicator and keeps its geometry synced with the selected tab.
 * Why
 *     The static segmented runtime needs a measured selection surface without pulling in motion
 *     code.
 */
function TabsSegmentedStaticIndicator() {
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
    variant: 'segmented'
  });
  const indicatorStyle = (
    indicatorRect !== null
      ? {
          ['--k-tab-x' as const]: `${indicatorRect.x}px`,
          ['--k-tab-y' as const]: `${indicatorRect.y}px`,
          ['--k-tab-w' as const]: `${indicatorRect.width}px`,
          ['--k-tab-h' as const]: `${indicatorRect.height}px`,
          top: 0,
          bottom: 'auto'
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
 *     Wraps the segmented tab bar with static separators and the static segmented indicator.
 * Why
 *     Segmented tabs inject separator nodes at runtime, so the static enhancer owns both
 *     separator composition and indicator rendering.
 */
export function TabsSegmentedStaticBarEnhancer({
  children
}: TabsSegmentedStaticBarEnhancerProps) {
  const { structural, separator, separatorClassName } = useTabsVisualContext();
  const childrenWithSeparators = useMemo(
    () =>
      buildTabsChildrenWithSeparators({
        children,
        variant: 'segmented',
        structural,
        separator,
        separatorClassName
      }),
    [children, separator, separatorClassName, structural]
  );

  return (
    <>
      {childrenWithSeparators}
      <TabsSegmentedStaticIndicator />
    </>
  );
}

export default TabsSegmentedStaticBarEnhancer;
