import { HeadlessTabs } from '@kiskadee/react-headless';
import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement
} from 'react';
import {
  joinClassNames,
  resolvePanelClassName,
  resolveBridgeItemClassName,
  resolveBridgeTriggerClassName
} from '../Tabs.class-names';
import { useTabsVisualContext } from '../Tabs.context';
import { TabsSlotContent, withTabsTabContext } from '../Tabs.parts';
import type { TabsBarProps, TabsContentProps, TabsTabProps } from '../Tabs.types';

type TabsBridgeVisualOrderProps = {
  bridgeVisualOrder?: number;
};

/**
 * What
 *     Renders the bridge tablist with a dedicated outer shell and an inner scrolling tablist.
 * Why
 *     The bridge visual depends on two structural layers, matching the validated prototype:
 *     one layer clips and stacks the shell, and the inner one owns horizontal scrolling.
 */
export function TabsBridgeBarBase({ className, children, ...props }: TabsBarProps) {
  const { barRef, listClassName } = useTabsVisualContext();
  const items = Children.toArray(children);
  const orderedChildren = items.map((child, index) => {
    if (!isValidElement(child)) {
      return child;
    }

    return cloneElement(child as ReactElement<TabsBridgeVisualOrderProps>, {
      bridgeVisualOrder: items.length - index
    });
  });

  return (
    <div className={joinClassNames(listClassName, 'k-tab-br-shell', className)}>
      <HeadlessTabs.Bar ref={barRef} {...props} className="k-tab-br-list">
        {orderedChildren}
      </HeadlessTabs.Bar>
    </div>
  );
}

/**
 * What
 *     Renders the bridge tab with a dedicated outer shell wrapper around the semantic trigger.
 * Why
 *     Bridge needs one extra DOM layer so overlap, shell shadow, and selected reconnect geometry
 *     stay separate from the accessible tab button.
 */
export function TabsBridgeTabBase({
  bridgeVisualOrder,
  value,
  className,
  label,
  icon,
  children,
  ...restProps
}: TabsTabProps & TabsBridgeVisualOrderProps) {
  const { selected, scale, intent, emphasis, classNames, elements, tabWidthMode, radiusMode } =
    useTabsVisualContext();
  const isSelected = selected === value;
  const itemClassName = resolveBridgeItemClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode,
    selected: isSelected
  });
  const triggerClassName = resolveBridgeTriggerClassName({
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
  const itemStyle =
    bridgeVisualOrder != null
      ? ({ '--k-tab-z': String(bridgeVisualOrder) } as CSSProperties)
      : undefined;

  return (
    <div
      className={itemClassName}
      data-selected={isSelected || undefined}
      style={itemStyle}
    >
      <HeadlessTabs.Tab {...restProps} value={value} className={triggerClassName}>
        {withTabsTabContext(
          isSelected,
          <TabsSlotContent label={label} icon={icon}>
            {children}
          </TabsSlotContent>
        )}
      </HeadlessTabs.Tab>
    </div>
  );
}

/**
 * What
 *     Renders the bridge content panel using the dedicated panel shell classes from `e7`.
 * Why
 *     Bridge treats the visible panel as part of the visual identity, so the shared
 *     headless panel needs one extra structural marker for bridge-only CSS.
 */
export function TabsBridgeContentBase({ className, ...props }: TabsContentProps) {
  const { scale, intent, emphasis, classNames, elements, radiusMode } = useTabsVisualContext();
  const panelClassName =
    resolvePanelClassName({
      elements,
      classNames,
      scale,
      intent,
      emphasis,
      radiusMode
    }) ?? 'k-tab-p';

  return (
    <HeadlessTabs.Content
      {...props}
      className={joinClassNames(panelClassName, 'k-tab-br-p', className)}
    />
  );
}
