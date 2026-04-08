import { HeadlessTabs } from '@kiskadee/react-headless';
import { memo, type ReactNode, useEffect, useMemo, useState } from 'react';
import type { ResolvedTabsRootState } from './Tabs.runtime-state';
import { joinClassNames, resolveListClassName, resolveSeparatorClassName } from './Tabs.class-names';
import { TabsVisualContextProvider, useTabsVisualContext } from './Tabs.context';
import { resolveSpringConfig } from './Tabs.motion.shared';
import { TabsContentBase, TabsIconBase, TabsLabelBase, TabsTabBase } from './Tabs.parts';
import type { TabsStructuralDescriptor } from './Tabs.structural';
import type {
  TabsBarProps,
  TabsContentProps,
  TabsIconProps,
  TabsIndicatorProps,
  TabsLabelProps,
  TabsRootBaseProps,
  TabsSpringConfig,
  TabsSpringPreset,
  TabsTabProps
} from './Tabs.types';

type TabsBarEnhancerProps = {
  children?: ReactNode;
};

type TabsBarEnhancerComponent = (props: TabsBarEnhancerProps) => ReactNode;

type TabsComponent = {
  Root: (props: any) => ReactNode;
  Bar: typeof TabsBar;
  Tab: typeof TabsTabBase;
  Label: typeof TabsLabelBase;
  Icon: typeof TabsIconBase;
  Content: typeof TabsContentBase;
  Indicator: typeof TabsIndicator;
};

type TabsMotionLoader = () => Promise<{ default: TabsBarEnhancerComponent }>;

type CreateTabsComponentOptions<TRootProps> = {
  displayName: string;
  structural: TabsStructuralDescriptor;
  StaticEnhancer: TabsBarEnhancerComponent;
  loadMotionEnhancer?: TabsMotionLoader;
  useResolvedRootState: (props: TRootProps) => ResolvedTabsRootState;
  BarComponent?: typeof TabsBar;
  TabComponent?: typeof TabsTabBase;
  ContentComponent?: typeof TabsContentBase;
};

const motionEnhancerCache = new Map<TabsMotionLoader, TabsBarEnhancerComponent>();
const fallbackStaticEnhancer: TabsBarEnhancerComponent = (props) => props.children ?? null;

/**
 * What
 *     Resolves the indicator transition object used by motion-enabled renderers.
 * Why
 *     The runtime needs one place to translate the public spring API into the shape expected
 *     by the animation layer.
 */
function resolveIndicatorTransition(
  indicatorMotion: ResolvedTabsRootState['resolvedIndicator']['motion'],
  spring: TabsSpringPreset | TabsSpringConfig | undefined
): Record<string, unknown> {
  if (indicatorMotion === 'none') {
    return { duration: 0 };
  }

  return {
    type: 'spring',
    ...resolveSpringConfig(spring)
  };
}

/**
 * What
 *     Loads and caches the optional motion enhancer, or falls back to the static enhancer.
 * Why
 *     Tabs variants ship static-first and lazy-load motion, so this hook manages that swap
 *     without spreading loader state into the visual components.
 */
function useTabsBarEnhancer(options: {
  enabled: boolean;
  loader?: TabsMotionLoader;
  StaticEnhancer: TabsBarEnhancerComponent;
}) {
  const [enhancer, setEnhancer] = useState<TabsBarEnhancerComponent | null>(() => {
    if (!options.enabled || !options.loader) return null;
    return motionEnhancerCache.get(options.loader) ?? null;
  });

  useEffect(() => {
    if (!options.enabled || !options.loader) {
      setEnhancer(null);
      return;
    }

    const cached = motionEnhancerCache.get(options.loader);
    if (cached) {
      setEnhancer(() => cached);
      return;
    }

    let cancelled = false;
    void options.loader().then((module) => {
      if (cancelled) return;
      motionEnhancerCache.set(options.loader!, module.default);
      setEnhancer(() => module.default);
    });

    return () => {
      cancelled = true;
    };
  }, [options.StaticEnhancer, options.enabled, options.loader]);

  return {
    Enhancer: enhancer ?? options.StaticEnhancer,
    motionReady: enhancer !== null
  };
}

/**
 * What
 *     Renders the shared tab bar and wraps its children with the selected enhancer.
 * Why
 *     Every Tabs variant reuses the same headless bar wiring, while the enhancer decides whether
 *     the indicator is static or motion-driven.
 */
function TabsBar({ className, children, ...props }: TabsBarProps) {
  const { barRef, indicator, listClassName, loadMotionEnhancer, StaticEnhancer } = useTabsVisualContext();
  const { Enhancer, motionReady } = useTabsBarEnhancer({
    enabled: indicator.motion !== 'none',
    loader: loadMotionEnhancer,
    StaticEnhancer: StaticEnhancer ?? fallbackStaticEnhancer
  });

  return (
    <HeadlessTabs.Bar
      ref={barRef}
      {...props}
      className={joinClassNames(listClassName, motionReady ? 'k-tab-m' : '', className)}
    >
      <Enhancer>{children}</Enhancer>
    </HeadlessTabs.Bar>
  );
}

/**
 * What
 *     Exposes a no-op indicator slot for compound API compatibility.
 * Why
 *     The visual implementations render indicators internally through enhancers, but the
 *     compound surface still reserves the `Indicator` member.
 */
function TabsIndicator(_: TabsIndicatorProps) {
  return null;
}

/**
 * What
 *     Creates a typed Tabs compound component from shared runtime pieces and variant-specific hooks.
 * Why
 *     Line, box, segmented, and dot should stay lean entrypoints, so this factory centralizes
 *     the common root, bar, slot, and lazy-motion wiring.
 */
export function createTabsComponent<
  TRootProps extends TabsRootBaseProps & {
    indicator?: unknown;
    lowerCurve?: unknown;
    variant?: unknown;
  }
>(
  options: CreateTabsComponentOptions<TRootProps>
) {
  /**
   * What
   *     Resolves runtime state for one Tabs instance and bridges it into the headless root.
   * Why
   *     The factory needs an instance-level root that strips visual-only props before they
   *     reach the DOM while still feeding the visual context.
   */
  function TabsRoot(props: TRootProps) {
    const {
      children,
      spring,
      scale: _scale,
      emphasis: _emphasis,
      tabWidth: _tabWidth,
      separator: _separator,
      lowerCurve: _lowerCurve,
      intent: _intent,
      indicator: _indicator,
      variant: _variant,
      ...headlessRootProps
    } = props;
    const rootState = options.useResolvedRootState({
      ...props,
      children
    });
    const indicatorTransition = useMemo(
      () => resolveIndicatorTransition(rootState.resolvedIndicator.motion, spring),
      [rootState.resolvedIndicator.motion, spring]
    );
    const listClassName = useMemo(
      () =>
        resolveListClassName({
          structural: options.structural,
          elements: rootState.elements,
          classNames: rootState.classNames,
          scale: rootState.scale,
          intent: rootState.intent,
          emphasis: rootState.emphasis,
          tabWidth: rootState.resolvedTabWidth,
          tabShape: rootState.resolvedTabShape,
          variant: rootState.resolvedVariant,
          indicatorPosition: rootState.resolvedIndicator.position,
          lowerCurve: rootState.resolvedLowerCurve
        }),
      [
        rootState.classNames,
        rootState.elements,
        rootState.emphasis,
        rootState.intent,
        rootState.resolvedIndicator.position,
        rootState.resolvedLowerCurve,
        rootState.resolvedTabShape,
        rootState.resolvedTabWidth,
        rootState.resolvedVariant,
        rootState.scale
      ]
    );
    const separatorClassName = useMemo(
      () =>
        resolveSeparatorClassName({
          structural: options.structural,
          elements: rootState.elements,
          classNames: rootState.classNames,
          scale: rootState.scale,
          intent: rootState.intent,
          emphasis: rootState.emphasis,
          variant: rootState.resolvedVariant
        }),
      [
        rootState.classNames,
        rootState.elements,
        rootState.emphasis,
        rootState.intent,
        rootState.resolvedVariant,
        rootState.scale
      ]
    );

    const visualContext = useMemo(
      () => ({
        selected: rootState.selected,
        scale: rootState.scale,
        intent: rootState.intent,
        emphasis: rootState.emphasis,
        variant: rootState.resolvedVariant,
        structural: options.structural,
        tabWidth: rootState.resolvedTabWidth,
        tabShape: rootState.resolvedTabShape,
        lowerCurve: rootState.resolvedLowerCurve,
        barRef: rootState.barRef,
        indicator: rootState.resolvedIndicator,
        indicatorTransition,
        separator: rootState.resolvedSeparator,
        listClassName,
        separatorClassName,
        classNames: rootState.classNames,
        elements: rootState.elements,
        StaticEnhancer: options.StaticEnhancer,
        loadMotionEnhancer: options.loadMotionEnhancer
      }),
      [
        indicatorTransition,
        listClassName,
        options.StaticEnhancer,
        options.loadMotionEnhancer,
        options.structural,
        rootState.barRef,
        rootState.classNames,
        rootState.elements,
        rootState.emphasis,
        rootState.intent,
        rootState.resolvedLowerCurve,
        rootState.resolvedIndicator,
        rootState.resolvedTabShape,
        rootState.resolvedSeparator,
        rootState.resolvedTabWidth,
        rootState.resolvedVariant,
        rootState.scale,
        rootState.selected,
        separatorClassName
      ]
    );

    return (
      <TabsVisualContextProvider value={visualContext}>
        <HeadlessTabs.Root
          {...headlessRootProps}
          orientation="horizontal"
          value={rootState.selected}
          onValueChange={rootState.handleValueChange}
        >
          {children}
        </HeadlessTabs.Root>
      </TabsVisualContextProvider>
    );
  }

  const TabsRootMemo = memo(TabsRoot);
  TabsRootMemo.displayName = options.displayName;
  const BarComponent = options.BarComponent ?? TabsBar;
  const TabComponent = options.TabComponent ?? TabsTabBase;
  const ContentComponent = options.ContentComponent ?? TabsContentBase;

  return Object.assign(TabsRootMemo, {
    Root: TabsRootMemo,
    Bar: BarComponent,
    Tab: TabComponent,
    Label: TabsLabelBase,
    Icon: TabsIconBase,
    Content: ContentComponent,
    Indicator: TabsIndicator
  }) as TabsComponent & {
    Root: typeof TabsRootMemo;
  };
}

export type { TabsBarProps, TabsContentProps, TabsIconProps, TabsLabelProps, TabsTabProps };
