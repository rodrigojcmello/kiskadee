import {
  FloatingFocusManager,
  type OpenChangeReason,
  useDismiss,
  useFloating,
  useInteractions,
  useRole
} from '@floating-ui/react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  HTMLProps,
  ReactElement,
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
  useId,
  useMemo,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { useControllableState } from '../../internal/controllable-state.ts';

export type BottomSheetOpenChangeReason =
  | 'trigger'
  | 'escape'
  | 'scrim'
  | 'close-button'
  | 'selection'
  | 'swipe'
  | 'programmatic';

export type BottomSheetOpenChangeDetails = {
  reason: BottomSheetOpenChangeReason;
  event?: Event;
};

export type BottomSheetRootProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: BottomSheetOpenChangeDetails) => void;
};

export type BottomSheetTriggerRenderProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> & {
  ref: Ref<HTMLElement>;
  id: string;
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'dialog';
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
};

export type BottomSheetTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> & {
  children?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  render?: (props: BottomSheetTriggerRenderProps, state: { open: boolean }) => ReactElement;
};

export type BottomSheetCloseRenderProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> & {
  ref: Ref<HTMLButtonElement>;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

export type BottomSheetCloseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> & {
  children?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  render?: (props: BottomSheetCloseRenderProps) => ReactElement;
};

export type BottomSheetContentRenderProps = {
  overlayProps: HTMLAttributes<HTMLDivElement> & {
    'data-open'?: true;
    'data-closed'?: true;
  };
  dialogProps: HTMLAttributes<HTMLDivElement> & {
    ref: Ref<HTMLDivElement>;
    id: string;
    role: 'dialog';
    'aria-modal'?: true;
    'data-open'?: true;
    'data-closed'?: true;
  };
};

export type BottomSheetContentRenderState = {
  open: boolean;
  dismiss: (reason: BottomSheetOpenChangeReason, event?: Event) => void;
};

export type BottomSheetContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  forceMount?: boolean;
  portalled?: boolean;
  portalContainer?: HTMLElement | null;
  render?: (
    props: BottomSheetContentRenderProps,
    state: BottomSheetContentRenderState
  ) => ReactElement;
};

type BottomSheetContextValue = {
  open: boolean;
  setOpen: (open: boolean, details: BottomSheetOpenChangeDetails) => void;
  triggerId: string;
  contentId: string;
  refs: ReturnType<typeof useFloating>['refs'];
  context: ReturnType<typeof useFloating>['context'];
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
};

export type BottomSheetController = {
  open: boolean;
  dismiss: (reason: BottomSheetOpenChangeReason, event?: Event) => void;
};

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

let scrollLockCount = 0;
let previousBodyOverflow = '';

function useDocumentScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;
    if (scrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLockCount += 1;

    return () => {
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) document.body.style.overflow = previousBodyOverflow;
    };
  }, [locked]);
}

function useBottomSheetContext(componentName: string): BottomSheetContextValue {
  const context = useContext(BottomSheetContext);
  if (!context) throw new Error(`${componentName} must be used within BottomSheet.Root`);
  return context;
}

export function useBottomSheetController(): BottomSheetController {
  const { open, setOpen } = useBottomSheetContext('useBottomSheetController');
  return useMemo(
    () => ({
      open,
      dismiss: (reason: BottomSheetOpenChangeReason, event?: Event) => {
        setOpen(false, { reason, event });
      }
    }),
    [open, setOpen]
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function mapFloatingReason(reason: OpenChangeReason): BottomSheetOpenChangeReason {
  return reason === 'escape-key' ? 'escape' : 'programmatic';
}

function BottomSheetRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange
}: BottomSheetRootProps) {
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen });
  const generatedId = useId();
  const triggerId = `bottom-sheet-${generatedId}-trigger`;
  const contentId = `bottom-sheet-${generatedId}-content`;
  const setOpen = useCallback(
    (nextOpen: boolean, details: BottomSheetOpenChangeDetails) => {
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
    },
    [onOpenChange, setOpenState]
  );
  const handleFloatingOpenChange = useCallback(
    (nextOpen: boolean, event: Event | undefined, reason: OpenChangeReason) => {
      setOpen(nextOpen, { reason: mapFloatingReason(reason), event });
    },
    [setOpen]
  );
  const floating = useFloating({ open, onOpenChange: handleFloatingOpenChange });
  const dismiss = useDismiss(floating.context, { outsidePress: false });
  const role = useRole(floating.context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);
  const contextValue = useMemo<BottomSheetContextValue>(
    () => ({
      open,
      setOpen,
      triggerId,
      contentId,
      refs: floating.refs,
      context: floating.context,
      getReferenceProps,
      getFloatingProps
    }),
    [
      contentId,
      floating.context,
      floating.refs,
      getFloatingProps,
      getReferenceProps,
      open,
      setOpen,
      triggerId
    ]
  );

  useDocumentScrollLock(open);

  return <BottomSheetContext.Provider value={contextValue}>{children}</BottomSheetContext.Provider>;
}

const BottomSheetTrigger = forwardRef<HTMLElement, BottomSheetTriggerProps>(
  function BottomSheetTrigger(
    { children, render, onClick, id, disabled, ...buttonProps },
    forwardedRef
  ) {
    const { open, setOpen, refs, triggerId, contentId, getReferenceProps } =
      useBottomSheetContext('BottomSheet.Trigger');
    const ref = useCallback(
      (node: HTMLElement | null) => {
        refs.setReference(node);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, refs]
    );
    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) {
          setOpen(!open, { reason: 'trigger', event: event.nativeEvent });
        }
      },
      [disabled, onClick, open, setOpen]
    );
    const renderProps = getReferenceProps({
      ...buttonProps,
      disabled,
      ref,
      id: id ?? triggerId,
      type: buttonProps.type ?? 'button',
      'aria-controls': contentId,
      'aria-expanded': open,
      'aria-haspopup': 'dialog',
      onClick: handleClick
    }) as BottomSheetTriggerRenderProps;

    if (render) return render(renderProps, { open });
    const { ref: nativeRef, ...nativeProps } = renderProps;
    return (
      <button {...nativeProps} ref={nativeRef as Ref<HTMLButtonElement>}>
        {children}
      </button>
    );
  }
);

const BottomSheetClose = forwardRef<HTMLButtonElement, BottomSheetCloseProps>(
  function BottomSheetClose({ children, render, onClick, ...buttonProps }, forwardedRef) {
    const { setOpen } = useBottomSheetContext('BottomSheet.Close');
    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false, { reason: 'close-button', event: event.nativeEvent });
        }
      },
      [onClick, setOpen]
    );
    const renderProps: BottomSheetCloseRenderProps = {
      ...buttonProps,
      ref: forwardedRef,
      type: buttonProps.type ?? 'button',
      onClick: handleClick
    };

    if (render) return render(renderProps);
    const { ref, ...nativeProps } = renderProps;
    return (
      <button {...nativeProps} ref={ref}>
        {children}
      </button>
    );
  }
);

const BottomSheetContent = forwardRef<HTMLDivElement, BottomSheetContentProps>(
  function BottomSheetContent(
    {
      children,
      forceMount = false,
      portalled = true,
      portalContainer,
      render,
      id,
      onPointerDown,
      ...dialogProps
    },
    forwardedRef
  ) {
    const { open, setOpen, refs, context, contentId, getFloatingProps } =
      useBottomSheetContext('BottomSheet.Content');
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        refs.setFloating(node);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, refs]
    );
    const dismiss = useCallback(
      (reason: BottomSheetOpenChangeReason, event?: Event) => {
        setOpen(false, { reason, event });
      },
      [setOpen]
    );
    const handleScrimPointerDown = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented && event.target === event.currentTarget) {
          dismiss('scrim', event.nativeEvent);
        }
      },
      [dismiss, onPointerDown]
    );

    if (!open && !forceMount) return null;

    const floatingProps = getFloatingProps(
      dialogProps as HTMLProps<HTMLElement>
    ) as unknown as HTMLAttributes<HTMLDivElement>;
    const resolvedDialogProps: BottomSheetContentRenderProps['dialogProps'] = {
      ...floatingProps,
      ref,
      id: id ?? contentId,
      role: 'dialog',
      'aria-modal': open || undefined,
      'aria-hidden': open ? dialogProps['aria-hidden'] : true,
      inert: open ? dialogProps.inert : true,
      'data-open': open || undefined,
      'data-closed': !open || undefined,
      children
    };
    const resolvedRenderProps: BottomSheetContentRenderProps = {
      overlayProps: {
        onPointerDown: handleScrimPointerDown,
        'data-open': open || undefined,
        'data-closed': !open || undefined
      },
      dialogProps: resolvedDialogProps
    };
    const state: BottomSheetContentRenderState = { open, dismiss };
    const rendered = render ? (
      render(resolvedRenderProps, state)
    ) : (
      <div {...resolvedRenderProps.overlayProps}>
        <div {...resolvedRenderProps.dialogProps} />
      </div>
    );
    const focusManaged = (
      <FloatingFocusManager
        context={context}
        modal
        outsideElementsInert
        returnFocus
        disabled={!open}
      >
        {rendered}
      </FloatingFocusManager>
    );

    if (!portalled || !mounted) return focusManaged;
    const container = portalContainer === undefined ? document.body : portalContainer;
    return container ? createPortal(focusManaged, container) : focusManaged;
  }
);

export const BottomSheet = {
  Root: BottomSheetRoot,
  Trigger: BottomSheetTrigger,
  Content: BottomSheetContent,
  Close: BottomSheetClose
};
