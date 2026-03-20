import { HeadlessTabs } from '@kiskadee/react-headless';
import { forwardRef, type ReactNode } from 'react';
import {
  joinClassNames,
  resolveIconClassName,
  resolveLabelClassName,
  resolveTriggerClassName
} from './Tabs.class-names';
import { TabsTabContextProvider, useTabsTabContext, useTabsVisualContext } from './Tabs.context';
import type {
  TabsContentProps,
  TabsIconProps,
  TabsLabelProps,
  TabsTabContextValue,
  TabsTabProps
} from './Tabs.types';

/**
 * What
 *     Renders the inner tab content wrapper, either from custom children or from icon/label.
 * Why
 *     Tabs support both fully custom tab content and the shorthand `icon` plus `label` API,
 *     so this normalizes both paths into one measured content slot.
 */
export function TabsSlotContent({
  children,
  label,
  icon
}: Pick<TabsTabProps, 'children' | 'label' | 'icon'>) {
  return (
    <span className="k-tab-c">
      {children ? (
        children
      ) : (
        <>
          {icon ? <TabsIconBase>{icon}</TabsIconBase> : null}
          {label ? <TabsLabelBase>{label}</TabsLabelBase> : null}
        </>
      )}
    </span>
  );
}

/**
 * What
 *     Resolves the selected state and trigger className for one tab value.
 * Why
 *     `Tabs.Tab` should stay focused on rendering, so selection and class assembly live in a
 *     small reusable hook.
 */
export function useTabsTabState(value: string, className?: string) {
  const { selected, scale, intent, emphasis, classNames, elements, tabWidthMode, radiusMode } =
    useTabsVisualContext();
  const isSelected = selected === value;

  return {
    isSelected,
    triggerClassName: resolveTriggerClassName({
      elements,
      classNames,
      scale,
      intent,
      emphasis,
      tabWidthMode,
      radiusMode,
      selected: isSelected,
      className
    })
  };
}

/**
 * What
 *     Wraps tab children with the per-tab selected-state context provider.
 * Why
 *     Label and icon slots need lightweight access to `isSelected` without every caller wiring
 *     that prop by hand.
 */
export function withTabsTabContext(
  isSelected: boolean,
  children: ReactNode
) {
  const tabContext = { isSelected } satisfies TabsTabContextValue;
  return <TabsTabContextProvider value={tabContext}>{children}</TabsTabContextProvider>;
}

/**
 * What
 *     Renders the shared visual tab trigger on top of the headless `Tab` primitive.
 * Why
 *     All Tabs types reuse the same trigger composition, so this keeps tab markup and state
 *     wiring in one shared part.
 */
export function TabsTabBase({ value, className, label, icon, children, ...restProps }: TabsTabProps) {
  const { isSelected, triggerClassName } = useTabsTabState(value, className);

  return (
    <HeadlessTabs.Tab {...restProps} value={value} className={triggerClassName}>
      {withTabsTabContext(isSelected, (
        <TabsSlotContent label={label} icon={icon}>
          {children}
        </TabsSlotContent>
      ))}
    </HeadlessTabs.Tab>
  );
}

/**
 * What
 *     Renders the shared label slot with selection-aware classes.
 * Why
 *     Tabs types can style labels differently through schema classes, but the label markup and
 *     selected-state wiring remain the same.
 */
export const TabsLabelBase = forwardRef<HTMLSpanElement, TabsLabelProps>(function TabsLabelBase(
  { className, children, ...props },
  ref
) {
  const { isSelected } = useTabsTabContext();
  const { scale, intent, emphasis, classNames, elements } = useTabsVisualContext();

  const labelClassName = resolveLabelClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    selected: isSelected,
    className
  });

  return (
    <span ref={ref} className={labelClassName} {...props}>
      {children}
    </span>
  );
});

/**
 * What
 *     Renders the shared icon slot with selection-aware classes.
 * Why
 *     Icons follow the same compound contract across line, box, and dot, so this keeps that
 *     slot implementation consistent and reusable.
 */
export const TabsIconBase = forwardRef<HTMLSpanElement, TabsIconProps>(function TabsIconBase(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const { isSelected } = useTabsTabContext();
  const { scale, intent, emphasis, classNames, elements } = useTabsVisualContext();

  const iconClassName = resolveIconClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    selected: isSelected,
    className
  });

  return (
    <span ref={ref} className={iconClassName} aria-hidden={ariaHidden} {...props}>
      {children}
    </span>
  );
});

/**
 * What
 *     Renders the shared content panel wrapper on top of the headless `Content` primitive.
 * Why
 *     Tabs panels share one structural class and one headless implementation regardless of the
 *     visual type.
 */
export function TabsContentBase(props: TabsContentProps) {
  const panelClassName = joinClassNames('k-tab-p', props.className);
  return <HeadlessTabs.Content {...props} className={panelClassName} />;
}
