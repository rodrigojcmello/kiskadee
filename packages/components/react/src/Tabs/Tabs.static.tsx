import type { RadiusMode } from '@kiskadee/core';
import { HeadlessTabs } from '@kiskadee/react-headless';
import {
  Children,
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
  useState
} from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext';
import type {
  TabsBarProps,
  TabsClassesMap,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootProps,
  TabsTabProps
} from './Tabs.static.types.ts';
import {
  DEFAULT_EMPHASIS,
  DEFAULT_INTENT,
  DEFAULT_SCALE,
  DEFAULT_TYPE,
  extractTabValue,
  joinClassNames,
  resolveIconClassName,
  resolveIndicatorClassName,
  resolveIndicatorVariant,
  resolveIndicatorWidthMode,
  resolveLabelClassName,
  resolveListClassName,
  resolveSeparatorClassName,
  resolveTriggerClassName,
  resolveVariantElements,
  TabsTabContextProvider,
  TabsVisualContextProvider,
  useTabsTabContext,
  useTabsVisualContext
} from './Tabs.common.ts';
import './Tabs.common.scss';
import type {
  ResolvedTabsIndicator,
  TabsTabContextValue,
  TabsVisualContextValue
} from './Tabs.common.types.ts';
import './Tabs.static.scss';

export type {
  TabsBarProps,
  TabsBoxIndicatorConfig,
  TabsClassNames,
  TabsClassesMap,
  TabsContentProps,
  TabsDotIndicatorConfig,
  TabsElementName,
  TabsIconProps,
  TabsIndicatorConfig,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsLineIndicatorConfig,
  TabsRootProps,
  TabsTabProps
} from './Tabs.static.types.ts';

function TabsRoot({
  children,
  classNames = {},
  scale = DEFAULT_SCALE,
  emphasis = DEFAULT_EMPHASIS,
  intent = DEFAULT_INTENT,
  type,
  indicator,
  separator,
  value,
  defaultValue,
  onValueChange,
  ...restProps
}: TabsRootProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const selected = isControlled ? value : uncontrolledValue;

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  const {
    classesMap: { tabs: rawTabsMap },
    global
  } = useKiskadee();

  const resolvedType =
    type ??
    global?.components?.tabs?.options?.type ??
    global?.components?.tabs?.options?.variant ??
    DEFAULT_TYPE;
  const elements = resolveVariantElements(
    rawTabsMap as TabsClassesMap | Record<string, TabsClassesMap> | undefined,
    resolvedType
  );
  const resolvedIndicatorPosition =
    indicator?.position ?? global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const resolvedIndicatorVariant = resolveIndicatorVariant(
    resolvedType,
    indicator?.variant,
    global?.components?.tabs?.options?.indicatorVariant ??
      global?.components?.tabs?.options?.indicatorShape
  );
  const resolvedIndicatorWidthMode = resolveIndicatorWidthMode(
    resolvedType,
    indicator?.widthMode,
    global?.components?.tabs?.options?.indicatorWidthMode
  );
  const resolvedSeparator = separator ?? global?.components?.tabs?.options?.separator ?? false;
  const resolvedRadiusMode = (global?.radius ?? 'rounded') as RadiusMode;
  const resolvedIndicator: ResolvedTabsIndicator<'none'> = {
    motion: 'none',
    position: resolvedIndicatorPosition,
    variant: resolvedIndicatorVariant,
    widthMode: resolvedIndicatorWidthMode
  };

  const listClassName = resolveListClassName({
    modeClass: 'k-tab-s',
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode: resolvedRadiusMode,
    type: resolvedType
  });
  const separatorClassName = resolveSeparatorClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis
  });

  const visualContext = useMemo<TabsVisualContextValue>(
    () => ({
      selected,
      scale,
      intent,
      emphasis,
      type: resolvedType,
      radiusMode: resolvedRadiusMode,
      indicator: resolvedIndicator,
      separator: resolvedSeparator,
      listClassName,
      separatorClassName,
      classNames,
      elements
    }),
    [
      selected,
      scale,
      intent,
      emphasis,
      resolvedType,
      resolvedRadiusMode,
      resolvedIndicator,
      resolvedSeparator,
      listClassName,
      separatorClassName,
      classNames,
      elements
    ]
  );

  return (
    <TabsVisualContextProvider value={visualContext}>
      <HeadlessTabs.Root {...restProps} value={selected} onValueChange={handleValueChange}>
        {children}
      </HeadlessTabs.Root>
    </TabsVisualContextProvider>
  );
}

function TabsBar({ className, children, ...props }: TabsBarProps) {
  const { selected, separator, separatorClassName, listClassName, indicator, type } =
    useTabsVisualContext();
  const positionClass =
    type !== 'box' ? (indicator.position === 'top' ? 'k-tab-e1b' : 'k-tab-e1a') : undefined;

  const childrenWithSeparators = useMemo(() => {
    const items = Children.toArray(children);
    if (type !== 'box' || !separator || items.length <= 1) return items;

    const values = items.map(extractTabValue);
    const output: ReactNode[] = [];

    for (let index = 0; index < items.length; index += 1) {
      output.push(items[index]);
      if (index === items.length - 1) continue;

      const leftValue = values[index];
      const rightValue = values[index + 1];
      const hidden = selected !== undefined && (selected === leftValue || selected === rightValue);

      output.push(
        <span
          key={`k-tab-separator-${leftValue ?? index}-${rightValue ?? index + 1}`}
          aria-hidden="true"
          className={joinClassNames(separatorClassName, hidden ? 'k-tab-e6b' : '')}
        />
      );
    }

    return output;
  }, [children, selected, separator, separatorClassName, type]);

  return (
    <HeadlessTabs.Bar
      {...props}
      className={joinClassNames(listClassName, positionClass, className)}
    >
      {childrenWithSeparators}
    </HeadlessTabs.Bar>
  );
}

function TabsTab({ value, className, label, icon, children, ...restProps }: TabsTabProps) {
  const { selected, scale, intent, emphasis, classNames, elements, radiusMode } =
    useTabsVisualContext();
  const isSelected = selected === value;

  const triggerClassName = resolveTriggerClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode,
    selected: isSelected,
    className
  });

  const tabContext = useMemo<TabsTabContextValue>(() => ({ isSelected }), [isSelected]);

  return (
    <HeadlessTabs.Tab {...restProps} value={value} className={triggerClassName}>
      <TabsTabContextProvider value={tabContext}>
        {children ? (
          children
        ) : (
          <>
            {icon ? <TabsIcon>{icon}</TabsIcon> : null}
            {label ? <TabsLabel>{label}</TabsLabel> : null}
          </>
        )}
      </TabsTabContextProvider>
    </HeadlessTabs.Tab>
  );
}

const TabsLabel = forwardRef<HTMLSpanElement, TabsLabelProps>(function TabsLabel(
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

const TabsIcon = forwardRef<HTMLSpanElement, TabsIconProps>(function TabsIcon(
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

function TabsContent(props: TabsContentProps) {
  const panelClassName = joinClassNames('k-tab-p', props.className);
  return <HeadlessTabs.Content {...props} className={panelClassName} />;
}

function TabsIndicator({ className, style, ...props }: TabsIndicatorProps) {
  const { scale, intent, emphasis, classNames, elements, indicator, radiusMode, type } =
    useTabsVisualContext();
  const indicatorClassName = resolveIndicatorClassName({
    elements,
    classNames,
    scale,
    intent,
    emphasis,
    radiusMode,
    indicator,
    type,
    className
  });

  const indicatorStyle: CSSProperties =
    type === 'box'
      ? { top: 0, bottom: 'auto', ...style }
      : indicator.position === 'top'
        ? { top: 'calc(var(--k-bw, 0px) * -1)', bottom: 'auto', ...style }
        : { top: 'auto', bottom: 'calc(var(--k-bw, 0px) * -1)', ...style };

  return (
    <HeadlessTabs.Indicator {...props} style={indicatorStyle} className={indicatorClassName} />
  );
}

type KTabsStaticComponent = {
  Root: typeof TabsRoot;
  Bar: typeof TabsBar;
  Tab: typeof TabsTab;
  Label: typeof TabsLabel;
  Icon: typeof TabsIcon;
  Content: typeof TabsContent;
  Indicator: typeof TabsIndicator;
};

const TabsRootMemo = memo(TabsRoot);

export const KTabsStatic = Object.assign(TabsRootMemo, {
  Root: TabsRootMemo,
  Bar: TabsBar,
  Tab: TabsTab,
  Label: TabsLabel,
  Icon: TabsIcon,
  Content: TabsContent,
  Indicator: TabsIndicator
}) as KTabsStaticComponent;

export default KTabsStatic;
