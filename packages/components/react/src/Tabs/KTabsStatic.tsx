import {
  type ClassNameByElementJSON,
  type ColorClasses,
  type RadiusMode,
  stateActivator as cn,
  componentEmphasisBuckets
} from '@kiskadee/core';
import { HeadlessTabs } from '@kiskadee/react-headless';
import {
  Children,
  type CSSProperties,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext';
import type {
  TabsBarProps,
  TabsClassesMap,
  TabsClassNames,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootProps,
  TabsTabProps
} from './KTabsStatic.types.ts';
import './KTabsStatic.scss';

export type {
  TabsBarProps,
  TabsClassNames,
  TabsContentProps,
  TabsElementName,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootProps,
  TabsTabProps
} from './KTabsStatic.types.ts';

const DEFAULT_SCALE = 's:md:1';
const DEFAULT_INTENT = 'neutral';
const DEFAULT_VARIANT = 'line';

type TabsVisualContextValue = {
  selected: string | undefined;
  scale: string;
  intent: string;
  emphasis: TabsRootProps['emphasis'];
  variant: NonNullable<TabsRootProps['variant']>;
  radiusMode: RadiusMode;
  indicatorMotion: NonNullable<TabsRootProps['indicatorMotion']>;
  indicatorPosition: NonNullable<TabsRootProps['indicatorPosition']>;
  indicatorShape: NonNullable<TabsRootProps['indicatorShape']>;
  separator: boolean;
  listClassName: string | undefined;
  separatorClassName: string | undefined;
  classNames: TabsClassNames;
  elements: TabsClassesMap;
};

const TabsVisualContext = createContext<TabsVisualContextValue | null>(null);

function useTabsVisualContext(): TabsVisualContextValue {
  const context = useContext(TabsVisualContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs.Root');
  }
  return context;
}

type TabsTabContextValue = {
  isSelected: boolean;
};

const TabsTabContext = createContext<TabsTabContextValue | null>(null);

function useTabsTabContext(): TabsTabContextValue {
  const context = useContext(TabsTabContext);
  if (!context) {
    throw new Error('Tabs.Label and Tabs.Icon must be used within a Tabs.Tab');
  }
  return context;
}

const normalizeScaleKey = (key: string): string => (key.startsWith('s:') ? key.slice(2) : key);

function joinClassNames(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

function resolveIntentClasses(
  element: ClassNameByElementJSON | undefined,
  intent: string,
  emphasis: TabsRootProps['emphasis']
): string {
  if (!element?.c) return '';

  const byIntent = element.c as Record<string, ColorClasses>;
  const chosen = byIntent[intent] ?? Object.values(byIntent)[0];
  if (!chosen) return '';

  if (emphasis) {
    const bucket = componentEmphasisBuckets[emphasis];
    const buckets = chosen as Record<string, string | undefined>;
    return buckets[bucket] ?? chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';
  }

  return chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';
}

function resolveEffectClasses(element: ClassNameByElementJSON | undefined): string {
  if (!element?.e) return '';
  return Object.values(element.e)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

function resolveElementClassName(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: string;
    intent: string;
    emphasis: TabsRootProps['emphasis'];
    selected?: boolean;
  }
): string {
  if (!element) return '';

  const scaleKey = normalizeScaleKey(options.scale);
  return (
    joinClassNames(
      element.d,
      resolveIntentClasses(element, options.intent, options.emphasis),
      element.s?.all,
      element.s?.[scaleKey],
      resolveEffectClasses(element),
      options.selected ? element.l : ''
    ) ?? ''
  );
}

function resolveVariantElements(
  map: TabsClassesMap | Record<string, TabsClassesMap> | undefined,
  variant: string
): TabsClassesMap {
  if (!map) return {};
  const asRecord = map as Record<string, TabsClassesMap>;
  const isElementMap = Object.prototype.hasOwnProperty.call(asRecord, 'e1');
  if (isElementMap) return map as TabsClassesMap;
  return asRecord[variant] ?? asRecord.line ?? asRecord.box ?? {};
}

function resolveRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode
): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  const all =
    radiusMode === 'rounded'
      ? (element.r?.all ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.all ?? '')
        : radiusMode === 'square'
        ? (element.rs?.all ?? '')
        : '';
  const byScale =
    radiusMode === 'rounded'
      ? (element.r?.[scaleKey] ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.[scaleKey] ?? '')
        : radiusMode === 'square'
        ? (element.rs?.[scaleKey] ?? '')
        : '';
  return joinClassNames(all, byScale) ?? '';
}

function TabsRoot({
  children,
  classNames = {},
  scale = DEFAULT_SCALE,
  emphasis = 'medium',
  intent = DEFAULT_INTENT,
  variant,
  indicatorMotion: _indicatorMotion = 'none',
  indicatorPosition,
  indicatorShape,
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

  const resolvedVariant =
    variant ?? global?.components?.tabs?.options?.variant ?? DEFAULT_VARIANT;
  const elements = resolveVariantElements(
    rawTabsMap as TabsClassesMap | Record<string, TabsClassesMap> | undefined,
    resolvedVariant
  );
  const resolvedIndicatorPosition =
    indicatorPosition ?? global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const resolvedIndicatorShape =
    indicatorShape ?? global?.components?.tabs?.options?.indicatorShape ?? 'square';
  const resolvedSeparator =
    separator ?? global?.components?.tabs?.options?.separator ?? false;
  const resolvedRadiusMode = (global?.radius ?? 'rounded') as RadiusMode;
  const resolvedIndicatorMotion: NonNullable<TabsRootProps['indicatorMotion']> = 'none';

  const listClassName = joinClassNames(
    'k-tab-e1',
    resolvedVariant === 'box' ? 'k-tab--box' : 'k-tab--line',
    resolveRadiusClassName(elements.e1, scale, resolvedRadiusMode),
    resolveElementClassName(elements.e1, {
      scale,
      intent,
      emphasis
    }),
    classNames.e1
  );
  const separatorClassName = joinClassNames(
    resolveElementClassName(elements.e6, {
      scale,
      intent,
      emphasis
    }),
    classNames.e6,
    'k-tab-e6'
  );

  const visualContext = useMemo<TabsVisualContextValue>(
    () => ({
      selected,
      scale,
      intent,
      emphasis,
      variant: resolvedVariant,
      radiusMode: resolvedRadiusMode,
      indicatorMotion: resolvedIndicatorMotion,
      indicatorPosition: resolvedIndicatorPosition,
      indicatorShape: resolvedIndicatorShape,
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
      resolvedVariant,
      resolvedRadiusMode,
      resolvedIndicatorMotion,
      resolvedIndicatorPosition,
      resolvedIndicatorShape,
      resolvedSeparator,
      listClassName,
      separatorClassName,
      classNames,
      elements
    ]
  );

  return (
    <TabsVisualContext.Provider value={visualContext}>
      <HeadlessTabs.Root {...restProps} value={selected} onValueChange={handleValueChange}>
        {children}
      </HeadlessTabs.Root>
    </TabsVisualContext.Provider>
  );
}

function extractTabValue(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined;
  const value = (child.props as { value?: unknown }).value;
  return typeof value === 'string' ? value : undefined;
}

function TabsBar({ className, children, ...props }: TabsBarProps) {
  const {
    selected,
    separator,
    separatorClassName,
    listClassName,
    indicatorPosition,
    indicatorMotion,
    variant
  } = useTabsVisualContext();
  const positionClass =
    variant === 'line' ? (indicatorPosition === 'top' ? 'k-tab-e1-t' : 'k-tab-e1-b') : undefined;
  const motionClass = variant === 'box' ? (indicatorMotion === 'none' ? 'k-tab-e1-mn' : 'k-tab-e1-ma') : undefined;

  const childrenWithSeparators = useMemo(() => {
    const items = Children.toArray(children);
    if (variant !== 'box' || !separator || items.length <= 1) return items;

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
          className={joinClassNames(separatorClassName, hidden ? 'k-tab-e6-h' : '')}
        />
      );
    }

    return output;
  }, [children, selected, separator, separatorClassName, variant]);

  return (
    <HeadlessTabs.Bar
      {...props}
      className={joinClassNames(listClassName, positionClass, motionClass, className)}
    >
      {childrenWithSeparators}
    </HeadlessTabs.Bar>
  );
}

function TabsTab({ value, className, label, icon, children, ...restProps }: TabsTabProps) {
  const { selected, scale, intent, emphasis, classNames, elements, radiusMode } = useTabsVisualContext();
  const isSelected = selected === value;

  const triggerClassName = joinClassNames(
    resolveElementClassName(elements.e2, {
      scale,
      intent,
      emphasis,
      selected: isSelected
    }),
    resolveRadiusClassName(elements.e2, scale, radiusMode),
    classNames.e2,
    'k-tab-e2',
    'k-state',
    cn.interactive,
    cn.activator,
    isSelected ? cn.selected : '',
    className
  );

  const tabContext = useMemo<TabsTabContextValue>(() => ({ isSelected }), [isSelected]);

  return (
    <HeadlessTabs.Tab {...restProps} value={value} className={triggerClassName}>
      <TabsTabContext.Provider value={tabContext}>
        {children ? (
          children
        ) : (
          <>
            {icon ? <TabsIcon>{icon}</TabsIcon> : null}
            {label ? <TabsLabel>{label}</TabsLabel> : null}
          </>
        )}
      </TabsTabContext.Provider>
    </HeadlessTabs.Tab>
  );
}

const TabsLabel = forwardRef<HTMLSpanElement, TabsLabelProps>(function TabsLabel(
  { className, children, ...props },
  ref
) {
  const { isSelected } = useTabsTabContext();
  const { scale, intent, emphasis, classNames, elements } = useTabsVisualContext();

  const labelClassName = joinClassNames(
    resolveElementClassName(elements.e3, {
      scale,
      intent,
      emphasis,
      selected: isSelected
    }),
    classNames.e3,
    'k-tab-e3',
    cn.activator,
    isSelected ? cn.selected : '',
    className
  );

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

  const iconClassName = joinClassNames(
    resolveElementClassName(elements.e4, {
      scale,
      intent,
      emphasis,
      selected: isSelected
    }),
    classNames.e4,
    'k-tab-e4',
    cn.activator,
    isSelected ? cn.selected : '',
    className
  );

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
  const {
    scale,
    intent,
    emphasis,
    classNames,
    elements,
    indicatorPosition,
    indicatorShape,
    radiusMode,
    indicatorMotion,
    variant
  } = useTabsVisualContext();
  const indicatorRadiusMode: RadiusMode =
    indicatorShape === 'square'
      ? 'square'
      : indicatorShape === 'pill'
        ? 'pill'
        : indicatorShape === 'rounded'
          ? 'rounded'
          : radiusMode;
  const indicatorShapeClass =
    indicatorShape === 'rounded'
      ? 'k-tab-e5-r'
      : indicatorShape === 'pill'
        ? 'k-tab-e5-p'
      : indicatorShape === 'roundedClip' && variant === 'line'
        ? 'k-tab-e5-c'
        : indicatorShape === 'square'
          ? 'k-tab-e5-q'
          : '';

  const indicatorClassName = joinClassNames(
    resolveElementClassName(elements.e5, {
      scale,
      intent,
      emphasis,
      selected: true
    }),
    resolveRadiusClassName(elements.e5, scale, indicatorRadiusMode),
    classNames.e5,
    'k-tab-e5',
    indicatorPosition === 'top' ? 'k-tab-e5-t' : 'k-tab-e5-b',
    indicatorShapeClass,
    indicatorMotion === 'none' ? 'k-tab-e5-n' : '',
    elements.e5?.e?.h ? cn.shadow : '',
    'k-state',
    className
  );

  const indicatorStyle: CSSProperties =
    variant === 'box'
      ? { top: 0, bottom: 'auto', ...style }
      : indicatorPosition === 'top'
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
