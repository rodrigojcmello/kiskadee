import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { buildTabsChildrenWithSeparators } from '../Tabs.bar.helpers.tsx';
import { resolveIndicatorClassName } from '../Tabs.class-names.ts';
import { useTabsVisualContext } from '../Tabs.context.ts';
import { measureIndicatorRect } from '../Tabs.measurements.ts';

type TabsBoxStaticBarEnhancerProps = {
  children?: ReactNode;
};

/**
 * What
 *     Renders the static box indicator and keeps its geometry synced with the selected tab.
 * Why
 *     The static box runtime needs a measured selection surface without pulling in motion code.
 */
function TabsBoxStaticIndicator() {
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
    variant: 'box'
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
 *     Wraps the box tab bar with static separators and the static box indicator.
 * Why
 *     Box tabs inject separator nodes at runtime, so the static enhancer owns both separator
 *     composition and indicator rendering.
 */
export function TabsBoxStaticBarEnhancer({ children }: TabsBoxStaticBarEnhancerProps) {
  const { selected, structural, separator, separatorClassName } = useTabsVisualContext();
  const childrenWithSeparators = useMemo(
    () =>
      buildTabsChildrenWithSeparators({
        children,
        variant: 'box',
        structural,
        separator,
        separatorClassName,
        getSeparatorState: (leftValue, rightValue) => ({
          hidden: selected !== undefined && (selected === leftValue || selected === rightValue)
        })
      }),
    [children, selected, separator, separatorClassName, structural]
  );

  return (
    <>
      {childrenWithSeparators}
      <TabsBoxStaticIndicator />
    </>
  );
}

export default TabsBoxStaticBarEnhancer;
