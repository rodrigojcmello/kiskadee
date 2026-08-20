import './BottomSheet.structural.scss';
import type {
  BottomSheetCenteredIcons,
  BottomSheetInitialHeight,
  BottomSheetIntent,
  BottomSheetItemLayout,
  BottomSheetPageTransition,
  BottomSheetSwipeBehavior,
  ElementSizeValue,
  RadiusMode
} from '@kiskadee/core';
import {
  type BottomSheetContentRenderProps,
  type BottomSheetContentRenderState,
  BottomSheet as HeadlessBottomSheet
} from '@kiskadee/react-headless/bottom-sheet';
import { motion, type PanInfo, useDragControls } from 'motion/react';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref
} from 'react';
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
import { Button } from '../Button/Button.tsx';
import type { ButtonProps } from '../Button/Button.types.ts';
import { IconGlyph } from '../Icon/IconGlyph.tsx';
import {
  DEFAULT_BOTTOM_SHEET_INTENT,
  DEFAULT_BOTTOM_SHEET_RADIUS,
  DEFAULT_BOTTOM_SHEET_SCALE,
  resolveBottomSheetClassNames,
  resolveBottomSheetElementClassName,
  resolveBottomSheetItemClassName
} from './BottomSheet.class-names.ts';
import type {
  BottomSheetBodyProps,
  BottomSheetCheckmarkProps,
  BottomSheetClassesMap,
  BottomSheetClassNames,
  BottomSheetCloseProps,
  BottomSheetContentProps,
  BottomSheetDescriptionProps,
  BottomSheetEndTextProps,
  BottomSheetGroupLabelProps,
  BottomSheetGroupProps,
  BottomSheetHandleProps,
  BottomSheetHeaderProps,
  BottomSheetIconProps,
  BottomSheetItemProps,
  BottomSheetLabelProps,
  BottomSheetRootProps,
  BottomSheetSeparatorProps,
  BottomSheetSnapPoint,
  BottomSheetTitleProps,
  BottomSheetTrailingProps,
  BottomSheetTriggerProps,
  BottomSheetVisualProviderProps
} from './BottomSheet.types.ts';

const DEFAULT_INITIAL_HEIGHT: BottomSheetInitialHeight = 'standard';
const DEFAULT_SWIPE_BEHAVIOR: BottomSheetSwipeBehavior = 'expand-dismiss';
const DEFAULT_PAGE_TRANSITION: BottomSheetPageTransition = 'slide';
const DEFAULT_ITEM_LAYOUT: BottomSheetItemLayout = 'centered';
const DEFAULT_CENTERED_ICONS: BottomSheetCenteredIcons = 'hide';

const SHEET_MOTION = {
  type: 'spring',
  stiffness: 420,
  damping: 38,
  mass: 0.82
} as const;

const SCRIM_MOTION = {
  duration: 0.18,
  ease: [0.2, 0, 0, 1]
} as const;

type BottomSheetResolvedOptions = {
  initialHeight: BottomSheetInitialHeight;
  swipeBehavior: BottomSheetSwipeBehavior;
  pageTransition: BottomSheetPageTransition;
  itemLayout: BottomSheetItemLayout;
  centeredIcons: BottomSheetCenteredIcons;
};

type BottomSheetVisualContextValue = {
  classesMap: BottomSheetClassesMap | undefined;
  classNames: BottomSheetClassNames;
  resolved: ReturnType<typeof resolveBottomSheetClassNames>;
  options: BottomSheetResolvedOptions;
  scale: ElementSizeValue;
};

type BottomSheetRuntimeContextValue = {
  snapPoint: BottomSheetSnapPoint;
  overflow: boolean;
  setBodyElement: (element: HTMLDivElement | null) => void;
  startDrag: (event: ReactPointerEvent<HTMLElement>) => void;
  swipeBehavior: BottomSheetSwipeBehavior;
};

const BottomSheetVisualContext = createContext<BottomSheetVisualContextValue | null>(null);
const BottomSheetRuntimeContext = createContext<BottomSheetRuntimeContextValue | null>(null);
const BottomSheetItemIntentContext = createContext<BottomSheetIntent>(DEFAULT_BOTTOM_SHEET_INTENT);

function useBottomSheetVisualContext(componentName: string): BottomSheetVisualContextValue {
  const context = useContext(BottomSheetVisualContext);
  if (!context) {
    throw new Error(
      `${componentName} must be used within BottomSheet.Root or BottomSheet.VisualProvider`
    );
  }
  return context;
}

function useBottomSheetRuntimeContext(componentName: string): BottomSheetRuntimeContextValue {
  const context = useContext(BottomSheetRuntimeContext);
  if (!context) throw new Error(`${componentName} must be used within BottomSheet.Content`);
  return context;
}

export function useBottomSheetResolvedOptions(): BottomSheetResolvedOptions {
  return useBottomSheetVisualContext('useBottomSheetResolvedOptions').options;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function BottomSheetVisualProvider({
  scale = DEFAULT_BOTTOM_SHEET_SCALE,
  radius,
  shadow = true,
  initialHeight,
  swipeBehavior,
  pageTransition,
  itemLayout,
  centeredIcons,
  classNames = {},
  children
}: BottomSheetVisualProviderProps) {
  const { classesMap, global } = useKiskadee();
  const bottomSheetClassesMap = useComponentClassMap(
    'bottomSheet',
    classesMap.bottomSheet as BottomSheetClassesMap | undefined
  );
  const artifactOptions = global?.components?.bottomSheet?.options;
  const resolvedRadius: RadiusMode = radius ?? global?.radius ?? DEFAULT_BOTTOM_SHEET_RADIUS;
  const options = useMemo<BottomSheetResolvedOptions>(
    () => ({
      initialHeight: initialHeight ?? artifactOptions?.initialHeight ?? DEFAULT_INITIAL_HEIGHT,
      swipeBehavior: swipeBehavior ?? artifactOptions?.swipeBehavior ?? DEFAULT_SWIPE_BEHAVIOR,
      pageTransition: pageTransition ?? artifactOptions?.pageTransition ?? DEFAULT_PAGE_TRANSITION,
      itemLayout: itemLayout ?? artifactOptions?.itemLayout ?? DEFAULT_ITEM_LAYOUT,
      centeredIcons: centeredIcons ?? artifactOptions?.centeredIcons ?? DEFAULT_CENTERED_ICONS
    }),
    [artifactOptions, centeredIcons, initialHeight, itemLayout, pageTransition, swipeBehavior]
  );
  const resolved = useMemo(
    () =>
      resolveBottomSheetClassNames({
        classesMap: bottomSheetClassesMap,
        classNames,
        scale,
        radius: resolvedRadius,
        shadow
      }),
    [bottomSheetClassesMap, classNames, resolvedRadius, scale, shadow]
  );
  const contextValue = useMemo<BottomSheetVisualContextValue>(
    () => ({
      classesMap: bottomSheetClassesMap,
      classNames,
      resolved,
      options,
      scale
    }),
    [bottomSheetClassesMap, classNames, options, resolved, scale]
  );

  return (
    <BottomSheetVisualContext.Provider value={contextValue}>
      {children}
    </BottomSheetVisualContext.Provider>
  );
}

function BottomSheetRoot({
  scale,
  radius,
  shadow,
  initialHeight,
  swipeBehavior,
  pageTransition,
  itemLayout,
  centeredIcons,
  classNames,
  children,
  ...props
}: BottomSheetRootProps) {
  return (
    <BottomSheetVisualProvider
      scale={scale}
      radius={radius}
      shadow={shadow}
      initialHeight={initialHeight}
      swipeBehavior={swipeBehavior}
      pageTransition={pageTransition}
      itemLayout={itemLayout}
      centeredIcons={centeredIcons}
      classNames={classNames}
    >
      <HeadlessBottomSheet.Root {...props}>{children}</HeadlessBottomSheet.Root>
    </BottomSheetVisualProvider>
  );
}

const BottomSheetTrigger = forwardRef<HTMLElement, BottomSheetTriggerProps>(
  function BottomSheetTrigger(props, ref) {
    return <HeadlessBottomSheet.Trigger {...props} ref={ref} />;
  }
);

type BottomSheetMotionContentProps = {
  children: ReactNode;
  contentRenderProps: BottomSheetContentRenderProps;
  contentState: BottomSheetContentRenderState;
  overlayProps: NonNullable<BottomSheetContentProps['overlayProps']>;
  surfaceProps: NonNullable<BottomSheetContentProps['surfaceProps']>;
};

function BottomSheetMotionContent({
  children,
  contentRenderProps,
  contentState,
  overlayProps,
  surfaceProps
}: BottomSheetMotionContentProps) {
  const { options, resolved } = useBottomSheetVisualContext('BottomSheet.Content');
  const dragControls = useDragControls();
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>(options.initialHeight);
  const [bodyElement, setBodyElement] = useState<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);
  const previousOpenRef = useRef(false);
  const didDragRef = useRef(false);
  const clearDragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measureOverflow = useCallback(() => {
    if (!bodyElement) {
      setOverflow(false);
      return;
    }
    setOverflow(bodyElement.scrollHeight > bodyElement.clientHeight + 1);
  }, [bodyElement]);

  useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = contentState.open;
    if (contentState.open && !wasOpen) setSnapPoint(options.initialHeight);
  }, [contentState.open, options.initialHeight]);

  useEffect(() => {
    if (!contentState.open || !bodyElement) return;
    measureOverflow();
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measureOverflow);
    const mutationObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(measureOverflow);
    resizeObserver?.observe(bodyElement);
    mutationObserver?.observe(bodyElement, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', measureOverflow);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', measureOverflow);
    };
  }, [bodyElement, contentState.open, measureOverflow, snapPoint]);

  useEffect(
    () => () => {
      if (clearDragTimerRef.current) clearTimeout(clearDragTimerRef.current);
    },
    []
  );

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (options.swipeBehavior === 'none' || event.button !== 0) return;
      dragControls.start(event);
    },
    [dragControls, options.swipeBehavior]
  );
  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.y) > 6) didDragRef.current = true;
    },
    []
  );
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const dismiss = info.offset.y > 72 || info.velocity.y > 650;
      const expand = info.offset.y < -56 || info.velocity.y < -650;
      if (dismiss) {
        contentState.dismiss('swipe');
      } else if (
        expand &&
        options.swipeBehavior === 'expand-dismiss' &&
        snapPoint !== 'maximum' &&
        overflow
      ) {
        setSnapPoint('maximum');
      }

      if (clearDragTimerRef.current) clearTimeout(clearDragTimerRef.current);
      clearDragTimerRef.current = setTimeout(() => {
        didDragRef.current = false;
      }, 250);
    },
    [contentState, options.swipeBehavior, overflow, snapPoint]
  );
  const handleSurfaceClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      surfaceProps.onClickCapture?.(event);
      if (!event.defaultPrevented && didDragRef.current) {
        event.preventDefault();
        event.stopPropagation();
        didDragRef.current = false;
      }
    },
    [surfaceProps]
  );
  const runtimeContext = useMemo<BottomSheetRuntimeContextValue>(
    () => ({
      snapPoint,
      overflow,
      setBodyElement,
      startDrag,
      swipeBehavior: options.swipeBehavior
    }),
    [options.swipeBehavior, overflow, snapPoint, startDrag]
  );
  const {
    ref: dialogRef,
    className: dialogClassName,
    onAnimationStart: _dialogAnimationStart,
    onDrag: _dialogDrag,
    onDragEnd: _dialogDragEnd,
    onDragStart: _dialogDragStart,
    ...dialogProps
  } = contentRenderProps.dialogProps;
  const {
    className: providedSurfaceClassName,
    onClickCapture: _surfaceClickCapture,
    ...providedSurfaceProps
  } = surfaceProps;
  const {
    className: overlayClassName,
    onPointerDown: overlayPointerDown,
    ...overlayRest
  } = overlayProps;
  const {
    className: headlessOverlayClassName,
    onPointerDown: headlessOverlayPointerDown,
    onAnimationStart: _overlayAnimationStart,
    onDrag: _overlayDrag,
    onDragEnd: _overlayDragEnd,
    onDragStart: _overlayDragStart,
    ...headlessOverlayRest
  } = contentRenderProps.overlayProps;
  const handleOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      overlayPointerDown?.(event);
      if (!event.defaultPrevented) headlessOverlayPointerDown?.(event);
    },
    [headlessOverlayPointerDown, overlayPointerDown]
  );

  return (
    <motion.div
      {...headlessOverlayRest}
      {...overlayRest}
      className={joinClassNames(resolved.e1, headlessOverlayClassName, overlayClassName)}
      initial={{ opacity: 0 }}
      animate={{ opacity: contentState.open ? 1 : 0 }}
      transition={SCRIM_MOTION}
      onPointerDown={handleOverlayPointerDown}
    >
      <motion.div
        {...providedSurfaceProps}
        {...dialogProps}
        ref={dialogRef}
        className={joinClassNames(resolved.e2, dialogClassName, providedSurfaceClassName)}
        data-snap-point={snapPoint}
        data-item-layout={options.itemLayout}
        data-centered-icons={options.centeredIcons}
        initial={{ y: '100%' }}
        animate={{ y: contentState.open ? 0 : '100%' }}
        transition={SHEET_MOTION}
        layout="size"
        drag={options.swipeBehavior === 'none' ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.08, bottom: 0.24 }}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClickCapture={handleSurfaceClickCapture}
      >
        <BottomSheetRuntimeContext.Provider value={runtimeContext}>
          {options.swipeBehavior === 'none' ? null : <BottomSheetHandle />}
          {children}
        </BottomSheetRuntimeContext.Provider>
      </motion.div>
    </motion.div>
  );
}

const BottomSheetContent = forwardRef<HTMLDivElement, BottomSheetContentProps>(
  function BottomSheetContent({ children, overlayProps = {}, surfaceProps = {}, ...props }, ref) {
    return (
      <HeadlessBottomSheet.Content
        {...props}
        ref={ref}
        forceMount
        render={(contentRenderProps, contentState) => (
          <BottomSheetMotionContent
            contentRenderProps={contentRenderProps}
            contentState={contentState}
            overlayProps={overlayProps}
            surfaceProps={surfaceProps}
          >
            {children}
          </BottomSheetMotionContent>
        )}
      />
    );
  }
);

const BottomSheetHandle = forwardRef<HTMLDivElement, BottomSheetHandleProps>(
  function BottomSheetHandle({ className, onPointerDown, ...props }, ref) {
    const { resolved } = useBottomSheetVisualContext('BottomSheet.Handle');
    const runtime = useBottomSheetRuntimeContext('BottomSheet.Handle');
    if (runtime.swipeBehavior === 'none') return null;
    return (
      <div
        {...props}
        aria-hidden="true"
        ref={ref}
        className={joinClassNames(resolved.e3, className)}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (!event.defaultPrevented) runtime.startDrag(event);
        }}
      />
    );
  }
);

const BottomSheetHeader = forwardRef<HTMLElement, BottomSheetHeaderProps>(
  function BottomSheetHeader({ className, onPointerDown, ...props }, ref) {
    const { resolved } = useBottomSheetVisualContext('BottomSheet.Header');
    const runtime = useBottomSheetRuntimeContext('BottomSheet.Header');
    return (
      <header
        {...props}
        ref={ref}
        className={joinClassNames(resolved.e4, className)}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented) return;
          const target = event.target as Element;
          if (target.closest('button, a, input, select, textarea')) return;
          runtime.startDrag(event);
        }}
      />
    );
  }
);

const BottomSheetTitle = forwardRef<HTMLHeadingElement, BottomSheetTitleProps>(
  function BottomSheetTitle({ className, tabIndex = -1, ...props }, ref) {
    const { resolved } = useBottomSheetVisualContext('BottomSheet.Title');
    return (
      <h2
        {...props}
        ref={ref}
        tabIndex={tabIndex}
        className={joinClassNames(resolved.e5, 'k-foc', className)}
      />
    );
  }
);

const BottomSheetBody = forwardRef<HTMLDivElement, BottomSheetBodyProps>(function BottomSheetBody(
  { className, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props },
  forwardedRef
) {
  const { resolved } = useBottomSheetVisualContext('BottomSheet.Body');
  const runtime = useBottomSheetRuntimeContext('BottomSheet.Body');
  const directionGateRef = useRef<{ pointerId: number; y: number } | null>(null);
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      runtime.setBodyElement(node);
      assignRef(forwardedRef, node);
    },
    [forwardedRef, runtime]
  );
  const clearDirectionGate = useCallback(() => {
    directionGateRef.current = null;
  }, []);

  return (
    <div
      {...props}
      ref={ref}
      className={joinClassNames(resolved.e6, className)}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.currentTarget.scrollTop > 0) return;
        if (runtime.snapPoint !== 'maximum') {
          runtime.startDrag(event);
          return;
        }
        directionGateRef.current = { pointerId: event.pointerId, y: event.clientY };
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const gate = directionGateRef.current;
        if (
          event.defaultPrevented ||
          !gate ||
          gate.pointerId !== event.pointerId ||
          event.currentTarget.scrollTop > 0
        ) {
          return;
        }
        const delta = event.clientY - gate.y;
        if (delta > 8) {
          clearDirectionGate();
          runtime.startDrag(event);
        } else if (delta < -8) {
          clearDirectionGate();
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        clearDirectionGate();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        clearDirectionGate();
      }}
    />
  );
});

const BottomSheetGroup = forwardRef<HTMLDivElement, BottomSheetGroupProps>(
  function BottomSheetGroup({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={joinClassNames('k-bsh-x4', className)} />;
  }
);

const BottomSheetGroupLabel = forwardRef<HTMLSpanElement, BottomSheetGroupLabelProps>(
  function BottomSheetGroupLabel({ className, ...props }, ref) {
    const { resolved } = useBottomSheetVisualContext('BottomSheet.GroupLabel');
    return <span {...props} ref={ref} className={joinClassNames(resolved.e14, className)} />;
  }
);

const BottomSheetItem = forwardRef<HTMLElement, BottomSheetItemProps>(function BottomSheetItem(
  {
    children,
    className,
    disabled = false,
    interactive = true,
    intent: intentProp,
    render,
    selected = false,
    ...props
  },
  forwardedRef
) {
  const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.Item');
  const inheritedIntent = useContext(BottomSheetItemIntentContext);
  const intent = intentProp ?? inheritedIntent;
  const itemClassName = resolveBottomSheetItemClassName({
    baseClassName: resolved.e7,
    element: classesMap?.e7,
    scale,
    intent,
    selected,
    disabled,
    interactive,
    className
  });
  const renderProps = {
    ...props,
    ref: forwardedRef,
    className: itemClassName,
    'data-selected': selected || undefined,
    'data-disabled': disabled || undefined,
    'aria-disabled': disabled || undefined,
    children
  };

  if (render) {
    return (
      <BottomSheetItemIntentContext.Provider value={intent}>
        {render(renderProps, { selected, disabled })}
      </BottomSheetItemIntentContext.Provider>
    );
  }
  const { ref, ...buttonProps } = renderProps;
  return (
    <BottomSheetItemIntentContext.Provider value={intent}>
      <button
        {...(buttonProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
      />
    </BottomSheetItemIntentContext.Provider>
  );
});

const BottomSheetIcon = forwardRef<HTMLSpanElement, BottomSheetIconProps>(function BottomSheetIcon(
  { className, children, name, ...props },
  ref
) {
  const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.Icon');
  const intent = useContext(BottomSheetItemIntentContext);
  const resolvedClassName = joinClassNames(
    resolveBottomSheetElementClassName(classesMap?.e8, scale, intent),
    resolved.e8,
    className
  );
  return (
    <span {...props} ref={ref} aria-hidden="true" className={resolvedClassName}>
      {name ? <IconGlyph name={name} /> : children}
    </span>
  );
});

const BottomSheetLabel = forwardRef<HTMLSpanElement, BottomSheetLabelProps>(
  function BottomSheetLabel({ className, ...props }, ref) {
    const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.Label');
    const intent = useContext(BottomSheetItemIntentContext);
    return (
      <span
        {...props}
        ref={ref}
        className={joinClassNames(
          resolveBottomSheetElementClassName(classesMap?.e9, scale, intent),
          resolved.e9,
          className
        )}
      />
    );
  }
);

const BottomSheetDescription = forwardRef<HTMLSpanElement, BottomSheetDescriptionProps>(
  function BottomSheetDescription({ className, ...props }, ref) {
    const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.Description');
    const intent = useContext(BottomSheetItemIntentContext);
    return (
      <span
        {...props}
        ref={ref}
        className={joinClassNames(
          resolveBottomSheetElementClassName(classesMap?.e10, scale, intent),
          resolved.e10,
          className
        )}
      />
    );
  }
);

const BottomSheetTrailing = forwardRef<HTMLSpanElement, BottomSheetTrailingProps>(
  function BottomSheetTrailing({ className, children, functional = false, name, ...props }, ref) {
    const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.Trailing');
    const intent = useContext(BottomSheetItemIntentContext);
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        data-functional={functional || undefined}
        className={joinClassNames(
          resolveBottomSheetElementClassName(classesMap?.e11, scale, intent),
          resolved.e11,
          className
        )}
      >
        {name ? <IconGlyph name={name} /> : children}
      </span>
    );
  }
);

const BottomSheetSeparator = forwardRef<HTMLHRElement, BottomSheetSeparatorProps>(
  function BottomSheetSeparator({ className, ...props }, ref) {
    const { resolved } = useBottomSheetVisualContext('BottomSheet.Separator');
    return <hr {...props} ref={ref} className={joinClassNames(resolved.e12, className)} />;
  }
);

const BottomSheetEndText = forwardRef<HTMLSpanElement, BottomSheetEndTextProps>(
  function BottomSheetEndText({ className, ...props }, ref) {
    const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.EndText');
    const intent = useContext(BottomSheetItemIntentContext);
    return (
      <span
        {...props}
        ref={ref}
        className={joinClassNames(
          resolveBottomSheetElementClassName(classesMap?.e13, scale, intent),
          resolved.e13,
          className
        )}
      />
    );
  }
);

const BottomSheetCheckmark = forwardRef<HTMLSpanElement, BottomSheetCheckmarkProps>(
  function BottomSheetCheckmark({ className, style, visible = true, ...props }, ref) {
    const { classesMap, resolved, scale } = useBottomSheetVisualContext('BottomSheet.Checkmark');
    const intent = useContext(BottomSheetItemIntentContext);
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        className={joinClassNames(
          resolveBottomSheetElementClassName(classesMap?.e15, scale, intent),
          resolved.e15,
          className
        )}
        style={{ ...style, visibility: visible ? style?.visibility : 'hidden' }}
      >
        <IconGlyph name="check" />
      </span>
    );
  }
);

const BottomSheetClose = forwardRef<HTMLButtonElement, BottomSheetCloseProps>(
  function BottomSheetClose(
    { children, icon = 'close', onClick, 'aria-label': ariaLabel, ...buttonProps },
    forwardedRef
  ) {
    return (
      <HeadlessBottomSheet.Close
        onClick={onClick}
        render={(closeProps) => {
          const { ref: closeRef, ...behaviorProps } = closeProps;
          const ref = (node: HTMLButtonElement | null) => {
            assignRef(closeRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Button
              {...buttonProps}
              {...(behaviorProps as ButtonProps)}
              ref={ref}
              aria-label={ariaLabel ?? (children ? undefined : 'Close')}
            >
              {children ?? <Button.Icon name={icon} />}
            </Button>
          );
        }}
      />
    );
  }
);

export const BottomSheet = {
  Root: BottomSheetRoot,
  VisualProvider: BottomSheetVisualProvider,
  Trigger: BottomSheetTrigger,
  Content: BottomSheetContent,
  Close: BottomSheetClose,
  Handle: BottomSheetHandle,
  Header: BottomSheetHeader,
  HeaderActions: forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
    function BottomSheetHeaderActions({ className, ...props }, ref) {
      return <div {...props} ref={ref} className={joinClassNames('k-bsh-x1', className)} />;
    }
  ),
  Title: BottomSheetTitle,
  Body: BottomSheetBody,
  PageViewport: forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
    function BottomSheetPageViewport({ className, ...props }, ref) {
      return <div {...props} ref={ref} className={joinClassNames('k-bsh-x2', className)} />;
    }
  ),
  Page: forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function BottomSheetPage(
    { className, ...props },
    ref
  ) {
    return <div {...props} ref={ref} className={joinClassNames('k-bsh-x3', className)} />;
  }),
  Group: BottomSheetGroup,
  GroupLabel: BottomSheetGroupLabel,
  Item: BottomSheetItem,
  Icon: BottomSheetIcon,
  Label: BottomSheetLabel,
  Description: BottomSheetDescription,
  Trailing: BottomSheetTrailing,
  Separator: BottomSheetSeparator,
  EndText: BottomSheetEndText,
  Checkmark: BottomSheetCheckmark
};
