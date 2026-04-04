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
  resolveBridgeTriggerClassName,
  resolveElementClassName,
  resolveNonShadowEffectClasses,
  resolveRadiusClassName,
  resolveShadowEffectClassName
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
    <div className={joinClassNames(listClassName, className)}>
      <HeadlessTabs.Bar ref={barRef} {...props} className="k-tab-e1c-a">
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
  const isTextOnlyTab = children == null && icon == null && typeof label === 'string';
  const itemClassName = resolveBridgeItemClassName({
    elements
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
  const textOnlyTriggerClassName = isTextOnlyTab
    ? joinClassNames(
        triggerClassName,
        resolveElementClassName(elements.e3, {
          scale,
          intent,
          emphasis,
          selected: isSelected
        }),
        classNames.e3
      )
    : triggerClassName;
  const itemStyle =
    bridgeVisualOrder != null
      ? ({ '--k-tab-z': String(bridgeVisualOrder) } as CSSProperties)
      : undefined;

  return (
    <div className={itemClassName} data-selected={isSelected || undefined} style={itemStyle}>
      <HeadlessTabs.Tab {...restProps} value={value} className={textOnlyTriggerClassName}>
        {isTextOnlyTab
          ? label
          : withTabsTabContext(
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
export function TabsBridgeContentBase({ className, children, ...props }: TabsContentProps) {
  const { scale, intent, emphasis, classNames, elements, radiusMode } = useTabsVisualContext();
  const panelShadowClassName = joinClassNames(
    resolveShadowEffectClassName(elements.e7),
    'k-tab-e7a-a'
  );
  const panelShellClassName = joinClassNames(
    resolveElementClassName(elements.e7, {
      scale,
      intent,
      emphasis,
      includeEffects: false
    }),
    resolveNonShadowEffectClasses(elements.e7),
    resolveRadiusClassName(elements.e7, scale, radiusMode),
    classNames.e7,
    'k-tab-e7-a',
    className
  );

  return (
    <HeadlessTabs.Content {...props} className="k-tab-p">
      <div className={panelShadowClassName}>
        <div className={panelShellClassName}>
          {children}
        </div>
      </div>
    </HeadlessTabs.Content>
  );
}
