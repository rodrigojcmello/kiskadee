import { HeadlessTabs } from '@kiskadee/react-headless';
import {
  Children,
  type CSSProperties,
  cloneElement,
  isValidElement,
  type ReactElement
} from 'react';
import {
  joinClassNames,
  resolveBridgeItemClassName,
  resolveBridgeTriggerClassName
} from '../Tabs.class-names';
import { useTabsVisualContext } from '../Tabs.context';
import { TabsSlotContent, withTabsTabContext } from '../Tabs.parts';
import { getTabsStructuralElementClassName } from '../Tabs.structural';
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
  const { barRef, listClassName, structural } = useTabsVisualContext();
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
    <div className={joinClassNames(listClassName, className)}>
      <HeadlessTabs.Bar
        ref={barRef}
        {...props}
        className={getTabsStructuralElementClassName(structural, 'e1c')}
      >
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
  const { selected, scale, intent, emphasis, classNames, elements, structural, tabWidth, tabShape } =
    useTabsVisualContext();
  const isSelected = selected === value;
  const itemClassName = resolveBridgeItemClassName({
    structural,
    elements,
    scale,
    tabWidth
  });
  const triggerClassName = resolveBridgeTriggerClassName({
    structural,
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    tabWidth,
    tabShape,
    selected: isSelected,
    className
  });
  const itemStyle =
    bridgeVisualOrder != null
      ? ({ '--k-tab-z': String(bridgeVisualOrder) } as CSSProperties)
      : undefined;

  return (
    <div className={itemClassName} data-selected={isSelected || undefined} style={itemStyle}>
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
 *     Renders the bridge content panel on top of the shared headless `tabpanel`.
 * Why
 *     Bridge no longer consumes schema panel styling, so its content panel falls back to the
 *     shared structural shell while keeping the bridge-specific tab stack above it.
 */
export function TabsBridgeContentBase({ className, children, ...props }: TabsContentProps) {
  return (
    <HeadlessTabs.Content {...props} className={joinClassNames('k-tab-p', className)}>
      {children}
    </HeadlessTabs.Content>
  );
}
