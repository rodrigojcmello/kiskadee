import './Dropdown.structural.scss';
import type {
  DropdownIntent,
  DropdownLeadingIconComposition,
  DropdownPresenceProfile,
  ElementSizeValue,
  PresenceProfiles,
  RadiusMode
} from '@kiskadee/core';
import { Dropdown as HeadlessDropdown } from '@kiskadee/react-headless/dropdown';
import {
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';
import { resolveStructuralUtilityProjectionClassName } from '../../shared/class-resolution/structuralUtilityProjection.ts';
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { useIsomorphicLayoutEffect } from '../../shared/utils/useIsomorphicLayoutEffect.ts';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';
import {
  DEFAULT_DROPDOWN_INTENT,
  DEFAULT_DROPDOWN_RADIUS,
  DEFAULT_DROPDOWN_SCALE,
  resolveDropdownClassNames,
  resolveDropdownElementClassName,
  resolveDropdownItemClassName
} from './Dropdown.class-names.ts';
import type {
  DropdownAnchorProps,
  DropdownCheckmarkProps,
  DropdownClassesMap,
  DropdownClassNames,
  DropdownContentProps,
  DropdownDescriptionProps,
  DropdownEndTextProps,
  DropdownGroupLabelProps,
  DropdownGroupProps,
  DropdownIconProps,
  DropdownItemProps,
  DropdownItemsProps,
  DropdownLabelProps,
  DropdownPresenceProps,
  DropdownPresenceRenderProps,
  DropdownPresenceRenderState,
  DropdownPresentationProps,
  DropdownRadioMarkProps,
  DropdownRootProps,
  DropdownScrollAreaProps,
  DropdownSurfaceProps,
  DropdownTrailingProps,
  DropdownVisualProviderProps
} from './Dropdown.types.ts';
import {
  type DropdownPresenceEffectModule,
  useDropdownPresenceEffect
} from './effects/presence/index.ts';

declare const process: { env: { NODE_ENV?: string } };

type ResolvedDropdownPresence = {
  profile: DropdownPresenceProfile;
  profiles: PresenceProfiles;
};

type DropdownPresenceRuntimeContextValue = {
  effectModule: DropdownPresenceEffectModule | null;
  presence: ResolvedDropdownPresence | null;
  onSurfaceExitComplete: (surfaceId: symbol) => void;
  registerSurface: (surfaceId: symbol, mounted: boolean) => void;
  state: DropdownPresenceRenderState;
};

type DropdownVisualContextValue = {
  classesMap: DropdownClassesMap | undefined;
  classNames: DropdownClassNames;
  resolved: ReturnType<typeof resolveDropdownClassNames>;
  presence: ResolvedDropdownPresence | null;
  options: ResolvedDropdownPresentationOptions;
  scale: ElementSizeValue;
};

type ResolvedDropdownPresentationOptions = Required<DropdownPresentationProps>;

const DEFAULT_LEADING_ICON_COMPOSITION: DropdownLeadingIconComposition = 'item-and-selection';
const DEFAULT_SELECTED_ITEM_BACKGROUND = true;

const DropdownItemIntentContext = createContext<DropdownIntent>(DEFAULT_DROPDOWN_INTENT);

const DropdownVisualContext = createContext<DropdownVisualContextValue | null>(null);
const DropdownCollectionOptionsContext = createContext<ResolvedDropdownPresentationOptions | null>(
  null
);
const DropdownPresenceRuntimeContext = createContext<DropdownPresenceRuntimeContextValue | null>(
  null
);

function useDropdownVisualContext(componentName: string): DropdownVisualContextValue {
  const context = useContext(DropdownVisualContext);
  if (!context) {
    throw new Error(
      `${componentName} must be used within Dropdown.Root or Dropdown.VisualProvider`
    );
  }
  return context;
}

export function useDropdownResolvedOptions(): ResolvedDropdownPresentationOptions {
  const collectionOptions = useContext(DropdownCollectionOptionsContext);
  const visualContext = useDropdownVisualContext('useDropdownResolvedOptions');
  return collectionOptions ?? visualContext.options;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function DropdownVisualProvider({
  scale = DEFAULT_DROPDOWN_SCALE,
  radius,
  shadow = true,
  presence,
  leadingIconComposition,
  selectedItemBackground,
  classNames = {},
  children
}: DropdownVisualProviderProps) {
  const { classesMap, global } = useKiskadee();
  const dropdownClassesMap = useComponentClassMap(
    'dropdown',
    classesMap.dropdown as DropdownClassesMap | undefined
  );
  const resolvedRadius: RadiusMode = radius ?? global?.radius ?? DEFAULT_DROPDOWN_RADIUS;
  const presenceArtifact = global?.components?.dropdown?.effects?.presence;
  const artifactOptions = global?.components?.dropdown?.options;
  const presenceProfile = presence === false ? undefined : (presence ?? presenceArtifact?.profile);
  const resolvedPresence = useMemo<ResolvedDropdownPresence | null>(() => {
    if (!presenceProfile || !presenceArtifact?.profiles[presenceProfile]) return null;
    return { profile: presenceProfile, profiles: presenceArtifact.profiles };
  }, [presenceArtifact, presenceProfile]);
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      presence === undefined ||
      presence === false ||
      resolvedPresence
    ) {
      return;
    }
    console.warn(
      `[Kiskadee] Dropdown presence profile "${presence}" is unavailable in the active preset.`
    );
  }, [presence, resolvedPresence]);
  const resolved = useMemo(
    () =>
      resolveDropdownClassNames({
        classesMap: dropdownClassesMap,
        classNames,
        scale,
        radius: resolvedRadius,
        shadow
      }),
    [classNames, dropdownClassesMap, resolvedRadius, scale, shadow]
  );
  const options = useMemo<ResolvedDropdownPresentationOptions>(
    () => ({
      leadingIconComposition:
        leadingIconComposition ??
        artifactOptions?.leadingIconComposition ??
        DEFAULT_LEADING_ICON_COMPOSITION,
      selectedItemBackground:
        selectedItemBackground ??
        artifactOptions?.selectedItemBackground ??
        DEFAULT_SELECTED_ITEM_BACKGROUND
    }),
    [artifactOptions, leadingIconComposition, selectedItemBackground]
  );
  const contextValue = useMemo<DropdownVisualContextValue>(
    () => ({
      classesMap: dropdownClassesMap,
      classNames,
      options,
      presence: resolvedPresence,
      resolved,
      scale
    }),
    [classNames, dropdownClassesMap, options, resolved, resolvedPresence, scale]
  );

  return (
    <DropdownVisualContext.Provider value={contextValue}>{children}</DropdownVisualContext.Provider>
  );
}

function DropdownRoot({
  scale,
  radius,
  shadow,
  presence,
  leadingIconComposition,
  selectedItemBackground,
  classNames,
  children,
  ...props
}: DropdownRootProps) {
  return (
    <DropdownVisualProvider
      scale={scale}
      radius={radius}
      shadow={shadow}
      presence={presence}
      leadingIconComposition={leadingIconComposition}
      selectedItemBackground={selectedItemBackground}
      classNames={classNames}
    >
      <HeadlessDropdown.Root {...props}>{children}</HeadlessDropdown.Root>
    </DropdownVisualProvider>
  );
}

const DropdownAnchor = forwardRef<HTMLElement, DropdownAnchorProps>(
  function DropdownAnchor(props, ref) {
    return <HeadlessDropdown.Anchor {...props} ref={ref} />;
  }
);

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  function DropdownContent(props, ref) {
    return (
      <SurfaceContextProvider value="onSubtle">
        <DropdownPresence>
          {({ forceMount, render }) => (
            <HeadlessDropdown.Content {...props} ref={ref} forceMount={forceMount} render={render} />
          )}
        </DropdownPresence>
      </SurfaceContextProvider>
    );
  }
);

type DropdownPresenceNodeProps = {
  effectModule: DropdownPresenceEffectModule | null;
  positionerProps: DropdownPresenceRenderProps;
  presence: ResolvedDropdownPresence | null;
  onExitComplete: () => void;
  onMotionOpen: () => void;
  state: DropdownPresenceRenderState;
};

function DropdownPresenceNode({
  effectModule,
  onExitComplete,
  onMotionOpen,
  positionerProps,
  presence,
  state
}: DropdownPresenceNodeProps) {
  const [activeRuntime, setActiveRuntime] = useState(() => ({
    effectModule,
    presence
  }));
  const cycleOpenRef = useRef(state.open);
  const closingRef = useRef(false);
  const completedSurfaceIdsRef = useRef(new Set<symbol>());
  const exitReleasedRef = useRef(false);
  const surfaceIdsRef = useRef(new Set<symbol>());
  const nextRuntimeRef = useRef({ effectModule, presence });
  const onExitCompleteRef = useRef(onExitComplete);
  nextRuntimeRef.current = { effectModule, presence };
  onExitCompleteRef.current = onExitComplete;

  const completeExitWhenReady = useCallback(() => {
    if (!closingRef.current || exitReleasedRef.current) return;
    for (const surfaceId of surfaceIdsRef.current) {
      if (!completedSurfaceIdsRef.current.has(surfaceId)) return;
    }

    exitReleasedRef.current = true;
    cycleOpenRef.current = false;
    setActiveRuntime(nextRuntimeRef.current);
    onExitCompleteRef.current();
  }, []);

  const registerSurface = useCallback(
    (surfaceId: symbol, mounted: boolean) => {
      if (mounted) {
        surfaceIdsRef.current.add(surfaceId);
      } else {
        surfaceIdsRef.current.delete(surfaceId);
        completedSurfaceIdsRef.current.delete(surfaceId);
        completeExitWhenReady();
      }
    },
    [completeExitWhenReady]
  );

  const handleSurfaceExitComplete = useCallback(
    (surfaceId: symbol) => {
      if (!closingRef.current || !surfaceIdsRef.current.has(surfaceId)) return;
      completedSurfaceIdsRef.current.add(surfaceId);
      completeExitWhenReady();
    },
    [completeExitWhenReady]
  );

  useEffect(() => {
    if (state.open) {
      cycleOpenRef.current = true;
      return;
    }
    if (cycleOpenRef.current && activeRuntime.effectModule && activeRuntime.presence) return;
    cycleOpenRef.current = false;
    if (activeRuntime.effectModule === effectModule && activeRuntime.presence === presence) {
      return;
    }
    setActiveRuntime({ effectModule, presence });
  }, [activeRuntime, effectModule, presence, state.open]);

  useIsomorphicLayoutEffect(() => {
    if (!activeRuntime.effectModule || !activeRuntime.presence) return;
    if (state.open) {
      cycleOpenRef.current = true;
      closingRef.current = false;
      exitReleasedRef.current = false;
      completedSurfaceIdsRef.current.clear();
      onMotionOpen();
      return;
    }
    if (!cycleOpenRef.current) return;

    closingRef.current = true;
    completedSurfaceIdsRef.current.clear();
    completeExitWhenReady();
  }, [activeRuntime, completeExitWhenReady, onMotionOpen, state.open]);

  const { ref, children, className, style, ...props } = positionerProps;
  const hasAvailableSize = state.availableHeight > 0 && state.availableWidth > 0;
  const positionerStyle = {
    ...style,
    ...(hasAvailableSize
      ? {
          '--k-ddn-ah': `${state.availableHeight}px`,
          '--k-ddn-aw': `${state.availableWidth}px`
        }
      : {})
  } as React.CSSProperties;
  const contextValue = useMemo<DropdownPresenceRuntimeContextValue>(
    () => ({
      ...activeRuntime,
      onSurfaceExitComplete: handleSurfaceExitComplete,
      registerSurface,
      state
    }),
    [activeRuntime, handleSurfaceExitComplete, registerSurface, state]
  );
  return (
    <div
      {...props}
      ref={ref}
      className={joinClassNames('k-ddn', className)}
      style={positionerStyle}
    >
      <DropdownPresenceRuntimeContext.Provider value={contextValue}>
        {children}
      </DropdownPresenceRuntimeContext.Provider>
    </div>
  );
}

function DropdownPresence({ children }: DropdownPresenceProps) {
  const { presence } = useDropdownVisualContext('Dropdown.Presence');
  const effectModule = useDropdownPresenceEffect(presence !== null);
  const [retainForExit, setRetainForExit] = useState(false);
  const handleMotionOpen = useCallback(() => setRetainForExit(true), []);
  const handleExitComplete = useCallback(() => setRetainForExit(false), []);
  const render = useCallback(
    (positionerProps: DropdownPresenceRenderProps, state: DropdownPresenceRenderState) => (
      <DropdownPresenceNode
        effectModule={effectModule}
        onExitComplete={handleExitComplete}
        onMotionOpen={handleMotionOpen}
        positionerProps={positionerProps}
        presence={presence}
        state={state}
      />
    ),
    [effectModule, handleExitComplete, handleMotionOpen, presence]
  );
  const adapter = useMemo(() => ({ forceMount: retainForExit, render }), [render, retainForExit]);

  return children(adapter);
}

const DropdownSurface = forwardRef<HTMLDivElement, DropdownSurfaceProps>(function DropdownSurface(
  { className, ...props },
  ref
) {
  const { resolved } = useDropdownVisualContext('Dropdown.Surface');
  const presenceRuntime = useContext(DropdownPresenceRuntimeContext);
  const surfaceIdRef = useRef(Symbol('dropdown-surface'));
  useIsomorphicLayoutEffect(() => {
    if (!presenceRuntime) return;
    const surfaceId = surfaceIdRef.current;
    presenceRuntime.registerSurface(surfaceId, true);
    return () => presenceRuntime.registerSurface(surfaceId, false);
  }, [presenceRuntime?.registerSurface]);
  const surfaceProps = {
    ...props,
    ref,
    className: `${resolved.e1} ${className ?? ''}`.trim()
  } as DropdownPresenceRenderProps;

  if (presenceRuntime?.presence && presenceRuntime.effectModule) {
    return (
      <presenceRuntime.effectModule.DropdownPresenceEffect
        onExitComplete={() => presenceRuntime.onSurfaceExitComplete(surfaceIdRef.current)}
        open={presenceRuntime.state.open}
        positioned={presenceRuntime.state.positioned}
        placement={presenceRuntime.state.placement}
        surfaceProps={surfaceProps}
        profile={presenceRuntime.presence.profile}
        profiles={presenceRuntime.presence.profiles}
      />
    );
  }

  const { ref: surfaceRef, style, ...surfaceRest } = surfaceProps;
  return (
    <div
      {...surfaceRest}
      ref={surfaceRef}
      style={
        presenceRuntime && !presenceRuntime.state.open
          ? { ...style, opacity: 0, pointerEvents: 'none' }
          : style
      }
    />
  );
});

const DropdownItems = forwardRef<HTMLDivElement, DropdownItemsProps>(function DropdownItems(
  { className, layout = 'independent', leadingIconComposition, selectedItemBackground, ...props },
  ref
) {
  const { resolved } = useDropdownVisualContext('Dropdown.Items');
  const inheritedOptions = useDropdownResolvedOptions();
  const options = useMemo<ResolvedDropdownPresentationOptions>(
    () => ({
      leadingIconComposition: leadingIconComposition ?? inheritedOptions.leadingIconComposition,
      selectedItemBackground: selectedItemBackground ?? inheritedOptions.selectedItemBackground
    }),
    [inheritedOptions, leadingIconComposition, selectedItemBackground]
  );
  return (
    <DropdownCollectionOptionsContext.Provider value={options}>
      <div
        {...props}
        ref={ref}
        className={`${resolved.items} ${className ?? ''}`.trim()}
        data-layout={layout}
      />
    </DropdownCollectionOptionsContext.Provider>
  );
});

const SCROLL_EDGE_TOLERANCE = 1;
const SCROLL_HOVER_DELAY_MS = 150;
const SCROLL_SPEED_PX_PER_SECOND = 240;

const DropdownScrollArea = forwardRef<HTMLDivElement, DropdownScrollAreaProps>(
  function DropdownScrollArea({ children, className, onScroll, ...props }, forwardedRef) {
    const { classesMap, resolved } = useDropdownVisualContext('Dropdown.ScrollArea');
    const scrollStartIcon = useEssentialIcon('chevron-up');
    const scrollEndIcon = useEssentialIcon('chevron-down');
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const frameRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const directionRef = useRef<-1 | 1 | null>(null);
    const [activeScrollEdge, setActiveScrollEdge] = useState<'start' | 'end' | null>(null);
    const [scrollState, setScrollState] = useState({ start: false, end: false });
    const updateScrollState = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const next = {
        start: viewport.scrollTop > SCROLL_EDGE_TOLERANCE,
        end: viewport.scrollTop < maxScrollTop - SCROLL_EDGE_TOLERANCE
      };
      setScrollState((current) =>
        current.start === next.start && current.end === next.end ? current : next
      );
    }, []);
    const stopContinuousScroll = useCallback(() => {
      directionRef.current = null;
      lastFrameTimeRef.current = null;
      setActiveScrollEdge(null);
      if (delayRef.current !== null) clearTimeout(delayRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      delayRef.current = null;
      frameRef.current = null;
    }, []);
    const runContinuousScroll = useCallback(
      (time: number) => {
        const viewport = viewportRef.current;
        const direction = directionRef.current;
        if (!viewport || direction === null) return;
        const previousTime = lastFrameTimeRef.current ?? time;
        lastFrameTimeRef.current = time;
        viewport.scrollTop +=
          direction * SCROLL_SPEED_PX_PER_SECOND * ((time - previousTime) / 1000);
        updateScrollState();
        const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        if (
          (direction < 0 && viewport.scrollTop <= SCROLL_EDGE_TOLERANCE) ||
          (direction > 0 && viewport.scrollTop >= maxScrollTop - SCROLL_EDGE_TOLERANCE)
        ) {
          stopContinuousScroll();
          return;
        }
        frameRef.current = requestAnimationFrame(runContinuousScroll);
      },
      [stopContinuousScroll, updateScrollState]
    );
    const startContinuousScroll = useCallback(
      (direction: -1 | 1, pointerType: string) => {
        if (pointerType === 'touch') return;
        if (
          directionRef.current === direction &&
          (delayRef.current !== null || frameRef.current !== null)
        ) {
          return;
        }
        stopContinuousScroll();
        directionRef.current = direction;
        delayRef.current = setTimeout(() => {
          delayRef.current = null;
          setActiveScrollEdge(direction < 0 ? 'start' : 'end');
          frameRef.current = requestAnimationFrame(runContinuousScroll);
        }, SCROLL_HOVER_DELAY_MS);
      },
      [runContinuousScroll, stopContinuousScroll]
    );
    const handleShellPointerMove = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') {
          stopContinuousScroll();
          return;
        }
        const edgeAtPoint = (edge: 'start' | 'end') => {
          const affordance = event.currentTarget.querySelector<HTMLElement>(
            `[data-edge="${edge}"]`
          );
          if (!affordance) return false;
          const rect = affordance.getBoundingClientRect();
          return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
          );
        };
        if (edgeAtPoint('start')) {
          startContinuousScroll(-1, event.pointerType);
        } else if (edgeAtPoint('end')) {
          startContinuousScroll(1, event.pointerType);
        } else {
          stopContinuousScroll();
        }
      },
      [startContinuousScroll, stopContinuousScroll]
    );
    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      updateScrollState();
      const resizeObserver =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScrollState);
      resizeObserver?.observe(viewport);
      const observeContent = () => {
        for (const child of viewport.children) resizeObserver?.observe(child);
      };
      observeContent();
      const mutationObserver =
        typeof MutationObserver === 'undefined'
          ? null
          : new MutationObserver(() => {
              observeContent();
              updateScrollState();
            });
      mutationObserver?.observe(viewport, { childList: true, subtree: true });
      return () => {
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        stopContinuousScroll();
      };
    }, [stopContinuousScroll, updateScrollState]);
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef]
    );
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        onScroll?.(event);
        updateScrollState();
      },
      [onScroll, updateScrollState]
    );
    const hasAffordanceStyle = classesMap?.e11 !== undefined;
    const renderAffordance = (edge: 'start' | 'end') => {
      const iconName = edge === 'start' ? scrollStartIcon : scrollEndIcon;
      if (!hasAffordanceStyle || !iconName || !scrollState[edge]) return null;
      return (
        <span
          aria-hidden="true"
          className={resolved.e11}
          data-active={activeScrollEdge === edge || undefined}
          data-edge={edge}
        >
          <span className="k-ddn-x5">
            <FamilyResolvedIcon name={iconName} />
          </span>
        </span>
      );
    };

    return (
      <div
        className="k-ddn-x3"
        onPointerMove={handleShellPointerMove}
        onPointerLeave={stopContinuousScroll}
        onPointerCancel={stopContinuousScroll}
      >
        <div
          {...props}
          ref={ref}
          className={`k-ddn-x4 ${className ?? ''}`.trim()}
          onScroll={handleScroll}
        >
          {children}
        </div>
        {renderAffordance('start')}
        {renderAffordance('end')}
      </div>
    );
  }
);

const DropdownGroup = forwardRef<HTMLDivElement, DropdownGroupProps>(function DropdownGroup(
  { className, children, ...props },
  ref
) {
  const { resolved } = useDropdownVisualContext('Dropdown.Group');
  return (
    <>
      <hr className={resolved.e7} />
      <div {...props} ref={ref} className={`k-ddn-x2 ${className ?? ''}`.trim()}>
        {children}
      </div>
    </>
  );
});

function resolveDropdownLeadingTrackPlaceholders(
  classesMap: DropdownClassesMap | undefined,
  scale: ElementSizeValue
): React.ReactNode {
  const iconWidth = resolveStructuralUtilityProjectionClassName(classesMap?.e3, 'iw', scale);
  const iconGap = resolveStructuralUtilityProjectionClassName(classesMap?.e3, 'ig', scale);
  const selectionWidth = resolveStructuralUtilityProjectionClassName(classesMap?.e10, 'sw', scale);
  const selectionGap = resolveStructuralUtilityProjectionClassName(classesMap?.e10, 'sg', scale);

  return (
    <>
      {selectionWidth && selectionGap ? (
        <span
          aria-hidden="true"
          className={joinClassNames('k-ddn-x7', selectionWidth, selectionGap)}
        />
      ) : null}
      {iconWidth && iconGap ? (
        <span aria-hidden="true" className={joinClassNames('k-ddn-x6', iconWidth, iconGap)} />
      ) : null}
    </>
  );
}

const DropdownItem = forwardRef<HTMLElement, DropdownItemProps>(function DropdownItem(
  {
    children,
    intent = DEFAULT_DROPDOWN_INTENT,
    selected = false,
    hovered = false,
    disabled = false,
    interactive = true,
    render,
    className,
    ...props
  },
  forwardedRef
) {
  const { classesMap, resolved, scale } = useDropdownVisualContext('Dropdown.Item');
  const { selectedItemBackground } = useDropdownResolvedOptions();
  const itemClassName = resolveDropdownItemClassName({
    baseClassName: resolved.e2,
    element: classesMap?.e2,
    scale,
    intent: intent as DropdownIntent,
    selected,
    hovered,
    disabled,
    interactive,
    selectedItemBackground,
    className
  });
  const ref = useCallback(
    (node: HTMLElement | null) => assignRef(forwardedRef, node),
    [forwardedRef]
  );
  const renderProps = {
    ...props,
    ref,
    className: itemClassName,
    'aria-disabled': disabled || undefined,
    'data-selected': selected || undefined,
    'data-disabled': disabled || undefined
  } as const;
  const leadingTrackPlaceholders = resolveDropdownLeadingTrackPlaceholders(classesMap, scale);

  if (render) {
    const renderedItem = render(renderProps, { selected, hovered, disabled });
    const renderedChildren = (renderedItem.props as { children?: React.ReactNode }).children;
    return (
      <DropdownItemIntentContext.Provider value={intent}>
        {cloneElement(renderedItem, undefined, leadingTrackPlaceholders, renderedChildren)}
      </DropdownItemIntentContext.Provider>
    );
  }
  const { ref: nativeRef, ...nativeProps } = renderProps;
  return (
    <DropdownItemIntentContext.Provider value={intent}>
      <div {...nativeProps} ref={nativeRef as React.Ref<HTMLDivElement>}>
        {leadingTrackPlaceholders}
        {children}
      </div>
    </DropdownItemIntentContext.Provider>
  );
});

function useDropdownSlotClassName(
  elementName: 'e3' | 'e4' | 'e5' | 'e6' | 'e8' | 'e9' | 'e10' | 'e11',
  structuralClassName: string,
  consumerClassName?: string
): string {
  const { classesMap, classNames, scale } = useDropdownVisualContext(`Dropdown.${elementName}`);
  const intent = useContext(DropdownItemIntentContext);
  return (
    joinClassNames(
      resolveDropdownElementClassName(classesMap?.[elementName], scale, intent),
      classNames[elementName],
      structuralClassName,
      consumerClassName
    ) ?? ''
  );
}

const DropdownIcon = forwardRef<HTMLSpanElement, DropdownIconProps>(function DropdownIcon(
  { className, children, ...props },
  ref
) {
  const { leadingIconComposition } = useDropdownResolvedOptions();
  const resolvedClassName = useDropdownSlotClassName('e3', 'k-ddn-e3', className);
  if (leadingIconComposition === 'selection-only') return null;
  return (
    <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
      {children}
    </span>
  );
});

const DropdownLabel = forwardRef<HTMLSpanElement, DropdownLabelProps>(function DropdownLabel(
  { className, ...props },
  ref
) {
  const resolvedClassName = useDropdownSlotClassName('e4', 'k-ddn-e4', className);
  return <span {...props} ref={ref} className={resolvedClassName} />;
});

const DropdownDescription = forwardRef<HTMLSpanElement, DropdownDescriptionProps>(
  function DropdownDescription({ className, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e5', 'k-ddn-e5', className);
    return <span {...props} ref={ref} className={resolvedClassName} />;
  }
);

const DropdownEndText = forwardRef<HTMLSpanElement, DropdownEndTextProps>(function DropdownEndText(
  { className, ...props },
  ref
) {
  const resolvedClassName = useDropdownSlotClassName('e8', 'k-ddn-e8', className);
  return <span {...props} ref={ref} className={resolvedClassName} />;
});

const DropdownGroupLabel = forwardRef<HTMLSpanElement, DropdownGroupLabelProps>(
  function DropdownGroupLabel({ className, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e9', 'k-ddn-e9', className);
    return <span {...props} ref={ref} className={resolvedClassName} />;
  }
);

const DropdownCheckmark = forwardRef<HTMLSpanElement, DropdownCheckmarkProps>(
  function DropdownCheckmark({ visible = true, className, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e10', 'k-ddn-e10', className);
    const iconName = useEssentialIcon('check');
    if (!iconName) return null;
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        className={resolvedClassName}
        data-visible={visible}
      >
        <FamilyResolvedIcon name={iconName} />
      </span>
    );
  }
);

const DropdownRadioMark = forwardRef<HTMLSpanElement, DropdownRadioMarkProps>(
  function DropdownRadioMark({ visible = true, className, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e10', 'k-ddn-e10', className);
    const iconName = useEssentialIcon('radio-selected');
    if (!iconName) return null;
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        className={resolvedClassName}
        data-visible={visible}
      >
        <FamilyResolvedIcon name={iconName} />
      </span>
    );
  }
);

const DropdownTrailing = forwardRef<HTMLSpanElement, DropdownTrailingProps>(
  function DropdownTrailing({ className, children, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e6', 'k-ddn-e6', className);
    return (
      <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
        {children}
      </span>
    );
  }
);

export const Dropdown: {
  Root: typeof DropdownRoot;
  VisualProvider: typeof DropdownVisualProvider;
  Presence: typeof DropdownPresence;
  Anchor: typeof DropdownAnchor;
  Content: typeof DropdownContent;
  Surface: typeof DropdownSurface;
  Items: typeof DropdownItems;
  ScrollArea: typeof DropdownScrollArea;
  Group: typeof DropdownGroup;
  GroupLabel: typeof DropdownGroupLabel;
  Checkmark: typeof DropdownCheckmark;
  RadioMark: typeof DropdownRadioMark;
  Item: typeof DropdownItem;
  Icon: typeof DropdownIcon;
  Label: typeof DropdownLabel;
  Description: typeof DropdownDescription;
  EndText: typeof DropdownEndText;
  Trailing: typeof DropdownTrailing;
} = {
  Root: DropdownRoot,
  VisualProvider: DropdownVisualProvider,
  Presence: DropdownPresence,
  Anchor: DropdownAnchor,
  Content: DropdownContent,
  Surface: DropdownSurface,
  Items: DropdownItems,
  ScrollArea: DropdownScrollArea,
  Group: DropdownGroup,
  GroupLabel: DropdownGroupLabel,
  Checkmark: DropdownCheckmark,
  RadioMark: DropdownRadioMark,
  Item: DropdownItem,
  Icon: DropdownIcon,
  Label: DropdownLabel,
  Description: DropdownDescription,
  EndText: DropdownEndText,
  Trailing: DropdownTrailing
};

export type { DropdownClassNames };
