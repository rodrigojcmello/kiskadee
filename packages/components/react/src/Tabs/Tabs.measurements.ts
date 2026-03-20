import type { TabsVisualContextValue } from './Tabs.types';

const TAB_CONTENT_SELECTOR = '.k-tab-c';

export type IndicatorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * What
 *     Finds the rendered tab element that matches the currently selected tab value.
 * Why
 *     Indicator measurement starts from the active tab node, so motion and static renderers
 *     need one shared lookup helper.
 */
export function findTabElement(
  barElement: HTMLDivElement | null,
  value: string | undefined
): HTMLElement | null {
  if (!barElement || !value) return null;
  const tabs = Array.from(barElement.querySelectorAll<HTMLElement>('[role="tab"]'));
  return tabs.find((tab) => tab.getAttribute('data-tab-value') === value) ?? null;
}

/**
 * What
 *     Measures an element relative to the tab bar instead of the viewport.
 * Why
 *     Indicator positioning is driven by CSS variables inside the bar, so every renderer needs
 *     coordinates in that local space.
 */
export function measureElementRectRelativeToBar(options: {
  barElement: HTMLDivElement | null;
  element: HTMLElement | null;
}): IndicatorRect | null {
  const { barElement, element } = options;
  if (!barElement || !element) {
    return null;
  }

  const barRect = barElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return {
    x: elementRect.left - barRect.left + barElement.scrollLeft,
    y: elementRect.top - barRect.top + barElement.scrollTop,
    width: elementRect.width,
    height: elementRect.height
  };
}

/**
 * What
 *     Finds the inner content wrapper used when the indicator width tracks tab content.
 * Why
 *     `content` width mode should measure the label/icon wrapper, not the full trigger box.
 */
function findMeasuredTabContentElement(selectedTab: HTMLElement): HTMLElement | null {
  return selectedTab.querySelector<HTMLElement>(TAB_CONTENT_SELECTOR);
}

/**
 * What
 *     Measures the indicator rectangle for the selected tab using the active width mode.
 * Why
 *     Static and motion indicators share the same geometry rules, so this centralizes the
 *     tab-vs-content measurement logic.
 */
export function measureIndicatorRect(options: {
  barElement: HTMLDivElement | null;
  selected: string | undefined;
  widthMode: TabsVisualContextValue['indicator']['widthMode'];
}): IndicatorRect | null {
  const { barElement, selected, widthMode } = options;
  const selectedTab = findTabElement(barElement, selected);
  if (!barElement || !selectedTab) {
    return null;
  }

  const tabRect = measureElementRectRelativeToBar({
    barElement,
    element: selectedTab
  });
  const measuredRect =
    widthMode === 'content'
      ? measureElementRectRelativeToBar({
          barElement,
          element: findMeasuredTabContentElement(selectedTab)
        }) ?? tabRect
      : tabRect;

  return measuredRect;
}
