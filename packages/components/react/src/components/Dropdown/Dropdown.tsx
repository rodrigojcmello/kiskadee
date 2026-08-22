import './Dropdown.structural.scss';
import type {
  DropdownIntent,
  DropdownPresenceProfile,
  ElementSizeValue,
  PresenceProfiles,
  RadiusMode
} from '@kiskadee/core';
import { Dropdown as HeadlessDropdown } from '@kiskadee/react-headless/dropdown';
import {
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
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { useIsomorphicLayoutEffect } from '../../shared/utils/useIsomorphicLayoutEffect.ts';
import { IconGlyph } from '../Icon/IconGlyph.tsx';
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
  DropdownRadioMarkProps,
  DropdownRootProps,
  DropdownSeparatorProps,
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
  scale: ElementSizeValue;
};

const DropdownItemIntentContext = createContext<DropdownIntent>(DEFAULT_DROPDOWN_INTENT);

const DropdownVisualContext = createContext<DropdownVisualContextValue | null>(null);
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

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function DropdownVisualProvider({
  scale = DEFAULT_DROPDOWN_SCALE,
  radius,
  shadow = true,
  presence,
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
  const contextValue = useMemo<DropdownVisualContextValue>(
    () => ({
      classesMap: dropdownClassesMap,
      classNames,
      presence: resolvedPresence,
      resolved,
      scale
    }),
    [classNames, dropdownClassesMap, resolved, resolvedPresence, scale]
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
      <DropdownPresence>
        {({ forceMount, render }) => (
          <HeadlessDropdown.Content {...props} ref={ref} forceMount={forceMount} render={render} />
        )}
      </DropdownPresence>
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

  const { ref, children, ...props } = positionerProps;
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
    <div {...props} ref={ref}>
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
  { className, layout = 'independent', ...props },
  ref
) {
  const { resolved } = useDropdownVisualContext('Dropdown.Items');
  return (
    <div
      {...props}
      ref={ref}
      className={`${resolved.items} ${className ?? ''}`.trim()}
      data-layout={layout}
    />
  );
});

const DropdownGroup = forwardRef<HTMLDivElement, DropdownGroupProps>(function DropdownGroup(
  { className, ...props },
  ref
) {
  return <div {...props} ref={ref} className={`k-ddn-x2 ${className ?? ''}`.trim()} />;
});

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
  const itemClassName = resolveDropdownItemClassName({
    baseClassName: resolved.e2,
    element: classesMap?.e2,
    scale,
    intent: intent as DropdownIntent,
    selected,
    hovered,
    disabled,
    interactive,
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

  if (render) {
    return (
      <DropdownItemIntentContext.Provider value={intent}>
        {render(renderProps, { selected, hovered, disabled })}
      </DropdownItemIntentContext.Provider>
    );
  }
  const { ref: nativeRef, ...nativeProps } = renderProps;
  return (
    <DropdownItemIntentContext.Provider value={intent}>
      <div {...nativeProps} ref={nativeRef as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    </DropdownItemIntentContext.Provider>
  );
});

function useDropdownSlotClassName(
  elementName: 'e3' | 'e4' | 'e5' | 'e6' | 'e8' | 'e9' | 'e10',
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
  { name, className, children, ...props },
  ref
) {
  const resolvedClassName = useDropdownSlotClassName('e3', 'k-ddn-e3', className);
  return (
    <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
      {name ? <IconGlyph name={name} /> : children}
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
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        className={resolvedClassName}
        data-visible={visible}
      >
        <IconGlyph name="check" />
      </span>
    );
  }
);

const DropdownRadioMark = forwardRef<HTMLSpanElement, DropdownRadioMarkProps>(
  function DropdownRadioMark({ visible = true, className, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e10', 'k-ddn-e10', className);
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        className={resolvedClassName}
        data-visible={visible}
      >
        <IconGlyph name="radio-selected" />
      </span>
    );
  }
);

const DropdownTrailing = forwardRef<HTMLSpanElement, DropdownTrailingProps>(
  function DropdownTrailing({ name, className, children, ...props }, ref) {
    const resolvedClassName = useDropdownSlotClassName('e6', 'k-ddn-e6', className);
    return (
      <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
        {name ? <IconGlyph name={name} /> : children}
      </span>
    );
  }
);

const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  function DropdownSeparator({ className, ...props }, ref) {
    const { resolved } = useDropdownVisualContext('Dropdown.Separator');
    return <div {...props} ref={ref} className={`${resolved.e7} ${className ?? ''}`.trim()} />;
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
  Separator: typeof DropdownSeparator;
} = {
  Root: DropdownRoot,
  VisualProvider: DropdownVisualProvider,
  Presence: DropdownPresence,
  Anchor: DropdownAnchor,
  Content: DropdownContent,
  Surface: DropdownSurface,
  Items: DropdownItems,
  Group: DropdownGroup,
  GroupLabel: DropdownGroupLabel,
  Checkmark: DropdownCheckmark,
  RadioMark: DropdownRadioMark,
  Item: DropdownItem,
  Icon: DropdownIcon,
  Label: DropdownLabel,
  Description: DropdownDescription,
  EndText: DropdownEndText,
  Trailing: DropdownTrailing,
  Separator: DropdownSeparator
};

export type { DropdownClassNames };
