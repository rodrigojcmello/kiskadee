import type { Placement, ReferenceType } from '@floating-ui/react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState
} from 'react';
import {
  type AnchoredOverlayDismissDetails,
  type AnchoredOverlayWidth,
  useAnchoredOverlay
} from '../../internal/anchored-overlay.tsx';
import { useControllableState } from '../../internal/controllable-state.ts';

export type DropdownOpenChangeReason = 'trigger' | 'escape' | 'outside-press' | 'programmatic';

export type DropdownOpenChangeDetails = {
  reason: DropdownOpenChangeReason;
  event?: Event;
};

export type DropdownRootProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: DropdownOpenChangeDetails) => void;
};

export type DropdownAnchorRenderProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick' | 'onKeyDown'
> & {
  ref: Ref<HTMLElement>;
  id: string;
  'aria-controls': string;
  'aria-expanded': boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

export type DropdownAnchorProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick' | 'onKeyDown'
> & {
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  render?: (props: DropdownAnchorRenderProps, state: { open: boolean }) => ReactElement;
};

export type DropdownReferenceRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
};

export type DropdownReferenceProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  positionReference?: ReferenceType | null;
  render?: (props: DropdownReferenceRenderProps) => ReactElement;
};

export type DropdownContentRenderState = {
  open: boolean;
  positioned: boolean;
  placement: Placement;
  availableHeight: number;
  availableWidth: number;
};

export type DropdownContentRenderProps = HTMLAttributes<HTMLDivElement> & {
  ref: Ref<HTMLDivElement>;
  id: string;
  'data-open'?: true;
  'data-closed'?: true;
  'data-placement': Placement;
  'data-width': AnchoredOverlayWidth;
};

export type DropdownContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  placement?: Placement;
  offset?: number;
  collisionPadding?: number;
  portalled?: boolean;
  portalContainer?: HTMLElement | null;
  width?: AnchoredOverlayWidth;
  forceMount?: boolean;
  render?: (props: DropdownContentRenderProps, state: DropdownContentRenderState) => ReactElement;
};

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean, details: DropdownOpenChangeDetails) => void;
  anchorElement: HTMLElement | null;
  setAnchorElement: (element: HTMLElement | null) => void;
  positionReference: ReferenceType | null;
  setPositionReference: (reference: ReferenceType | null) => void;
  anchorId: string;
  contentId: string;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext(componentName: string): DropdownContextValue {
  const context = useContext(DropdownContext);
  if (!context) throw new Error(`${componentName} must be used within Dropdown.Root`);
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function DropdownRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange
}: DropdownRootProps) {
  const [open, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen
  });
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [positionReference, setPositionReference] = useState<ReferenceType | null>(null);
  const generatedId = useId();
  const anchorId = `dropdown-${generatedId}-anchor`;
  const contentId = `dropdown-${generatedId}-content`;
  const setOpen = useCallback(
    (nextOpen: boolean, details: DropdownOpenChangeDetails) => {
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
    },
    [onOpenChange, setOpenState]
  );
  const contextValue = useMemo<DropdownContextValue>(
    () => ({
      open,
      setOpen,
      anchorElement,
      setAnchorElement,
      positionReference,
      setPositionReference,
      anchorId,
      contentId
    }),
    [anchorElement, anchorId, contentId, open, positionReference, setOpen]
  );

  return <DropdownContext.Provider value={contextValue}>{children}</DropdownContext.Provider>;
}

const DropdownAnchor = forwardRef<HTMLElement, DropdownAnchorProps>(function DropdownAnchor(
  { children, render, onClick, onKeyDown, id, ...buttonProps },
  forwardedRef
) {
  const { open, setOpen, setAnchorElement, setPositionReference, anchorId, contentId } =
    useDropdownContext('Dropdown.Anchor');
  useLayoutEffect(() => setPositionReference(null), [setPositionReference]);
  const resolvedId = id ?? anchorId;
  const ref = useCallback(
    (node: HTMLElement | null) => {
      setAnchorElement(node);
      assignRef(forwardedRef, node);
    },
    [forwardedRef, setAnchorElement]
  );
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setOpen(!open, { reason: 'trigger', event: event.nativeEvent });
      }
    },
    [onClick, open, setOpen]
  );
  const renderProps: DropdownAnchorRenderProps = {
    ...buttonProps,
    ref,
    id: resolvedId,
    type: buttonProps.type ?? 'button',
    'aria-controls': contentId,
    'aria-expanded': open,
    onClick: handleClick,
    onKeyDown
  };

  if (render) return render(renderProps, { open });

  const { ref: nativeRef, ...nativeButtonProps } = renderProps;
  return (
    <button {...nativeButtonProps} ref={nativeRef as Ref<HTMLButtonElement>}>
      {children}
    </button>
  );
});

const DropdownReference = forwardRef<HTMLElement, DropdownReferenceProps>(
  function DropdownReference(
    { children, positionReference = null, render, ...props },
    forwardedRef
  ) {
    const { setAnchorElement, setPositionReference } = useDropdownContext('Dropdown.Reference');
    const ref = useCallback(
      (node: HTMLElement | null) => {
        setAnchorElement(node);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, setAnchorElement]
    );
    useLayoutEffect(
      () => setPositionReference(positionReference),
      [positionReference, setPositionReference]
    );
    const renderProps: DropdownReferenceRenderProps = { ...props, ref, children };
    if (render) return render(renderProps);
    const { ref: referenceRef, ...nativeProps } = renderProps;
    return <div {...nativeProps} ref={referenceRef as Ref<HTMLDivElement>} />;
  }
);

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(function DropdownContent(
  {
    children,
    placement,
    offset,
    collisionPadding,
    portalled,
    portalContainer,
    width,
    forceMount = false,
    render,
    id,
    style,
    ...props
  },
  forwardedRef
) {
  const { open, setOpen, anchorElement, positionReference, contentId } =
    useDropdownContext('Dropdown.Content');
  const handleDismiss = useCallback(
    (details: AnchoredOverlayDismissDetails) => {
      setOpen(false, { reason: details.reason, event: details.event });
      if (details.reason === 'escape') anchorElement?.focus();
    },
    [anchorElement, setOpen]
  );
  const overlay = useAnchoredOverlay({
    open,
    referenceElement: anchorElement,
    positionReference,
    placement,
    offset,
    collisionPadding,
    portalled,
    portalContainer,
    width,
    onDismiss: handleDismiss
  });
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      overlay.floatingRef(node);
      assignRef(forwardedRef, node);
    },
    [forwardedRef, overlay]
  );
  if (!open && !forceMount) return null;

  const floatingProps = overlay.getFloatingProps(
    props as HTMLProps<HTMLElement>
  ) as unknown as HTMLAttributes<HTMLDivElement>;
  const renderProps: DropdownContentRenderProps = {
    ...floatingProps,
    ref,
    id: id ?? contentId,
    'aria-hidden': open ? props['aria-hidden'] : true,
    inert: open ? props.inert : true,
    'data-open': open || undefined,
    'data-closed': !open || undefined,
    'data-placement': overlay.placement,
    'data-width': width ?? 'content',
    style: { ...overlay.floatingStyles, ...style },
    children
  };
  const state: DropdownContentRenderState = {
    open,
    positioned: overlay.positioned,
    placement: overlay.placement,
    availableHeight: overlay.availableHeight,
    availableWidth: overlay.availableWidth
  };
  if (render) return overlay.renderFloating(render(renderProps, state));

  const { ref: contentRef, ...nativeContentProps } = renderProps;
  const content = <div {...nativeContentProps} ref={contentRef} />;

  return overlay.renderFloating(content);
});

export const Dropdown = {
  Root: DropdownRoot,
  Anchor: DropdownAnchor,
  Reference: DropdownReference,
  Content: DropdownContent
};
