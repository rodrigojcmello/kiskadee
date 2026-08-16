import {
  autoUpdate,
  FloatingNode,
  FloatingTree,
  flip,
  offset as floatingOffset,
  type OpenChangeReason,
  type Placement,
  shift,
  size,
  type UseDismissProps,
  type UseHoverProps,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useHover,
  useInteractions
} from '@floating-ui/react';
import type { CSSProperties, ReactNode, RefCallback } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export type AnchoredOverlayWidth = 'content' | 'min-anchor' | 'anchor';
export type AnchoredOverlayDismissReason = 'escape' | 'outside-press';

export type AnchoredOverlayDismissDetails = {
  reason: AnchoredOverlayDismissReason;
  event: Event;
};

export type UseAnchoredOverlayOptions = {
  open: boolean;
  referenceElement: HTMLElement | null;
  placement?: Placement;
  offset?: number;
  collisionPadding?: number;
  portalled?: boolean;
  portalContainer?: HTMLElement | null;
  width?: AnchoredOverlayWidth;
  dismissBubbles?: UseDismissProps['bubbles'];
  dismissEscapeKey?: boolean;
  hover?: Pick<
    UseHoverProps,
    'delay' | 'enabled' | 'handleClose' | 'mouseOnly' | 'move' | 'restMs'
  >;
  onDismiss?: (details: AnchoredOverlayDismissDetails) => void;
  onOpenChange?: (open: boolean, event: Event | undefined, reason: OpenChangeReason) => void;
};

export type AnchoredOverlayTreeProps = {
  children?: ReactNode;
};

export function AnchoredOverlayTree({ children }: AnchoredOverlayTreeProps) {
  const parentNodeId = useFloatingParentNodeId();
  if (parentNodeId !== null) return children;
  return <FloatingTree>{children}</FloatingTree>;
}

export function useAnchoredOverlay({
  open,
  referenceElement,
  placement = 'bottom-start',
  offset = 6,
  collisionPadding = 8,
  portalled = true,
  portalContainer,
  width = 'content',
  dismissBubbles,
  dismissEscapeKey = true,
  hover,
  onDismiss,
  onOpenChange
}: UseAnchoredOverlayOptions): {
  floatingRef: RefCallback<HTMLElement>;
  floatingStyles: CSSProperties;
  positioned: boolean;
  placement: Placement;
  renderFloating: (node: ReactNode) => ReactNode;
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
} {
  const [mounted, setMounted] = useState(false);
  const nodeId = useFloatingNodeId();
  const widthMiddleware = useMemo(
    () =>
      size({
        padding: collisionPadding,
        apply({ elements, rects }) {
          elements.floating.style.removeProperty('width');
          elements.floating.style.removeProperty('min-width');
          if (width === 'anchor') {
            elements.floating.style.width = `${rects.reference.width}px`;
          } else if (width === 'min-anchor') {
            elements.floating.style.minWidth = `${rects.reference.width}px`;
          }
        }
      }),
    [collisionPadding, width]
  );
  const handleOpenChange = useCallback(
    (nextOpen: boolean, event: Event | undefined, reason: OpenChangeReason) => {
      if (onOpenChange) {
        onOpenChange(nextOpen, event, reason);
        return;
      }
      if (!nextOpen && event && (reason === 'escape-key' || reason === 'outside-press')) {
        onDismiss?.({
          reason: reason === 'escape-key' ? 'escape' : 'outside-press',
          event
        });
      }
    },
    [onDismiss, onOpenChange]
  );
  const {
    context,
    refs,
    floatingStyles,
    isPositioned,
    placement: resolvedPlacement
  } = useFloating({
    nodeId,
    open,
    onOpenChange: handleOpenChange,
    placement,
    strategy: 'fixed',
    middleware: [
      floatingOffset(offset),
      flip({ padding: collisionPadding }),
      shift({ padding: collisionPadding }),
      widthMiddleware
    ],
    transform: false,
    whileElementsMounted: autoUpdate
  });
  const dismissInteraction = useDismiss(context, {
    bubbles: dismissBubbles,
    escapeKey: dismissEscapeKey
  });
  const hoverInteraction = useHover(context, {
    ...hover,
    enabled: hover?.enabled ?? hover !== undefined
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismissInteraction,
    hoverInteraction
  ]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    refs.setReference(referenceElement);
  }, [referenceElement, refs]);

  const floatingRef = useCallback<RefCallback<HTMLElement>>(
    (node) => refs.setFloating(node),
    [refs]
  );
  const renderFloating = useCallback(
    (node: ReactNode): ReactNode => {
      let renderedNode = node;
      if (portalled && mounted) {
        const container = portalContainer === undefined ? document.body : portalContainer;
        if (container) renderedNode = createPortal(node, container);
      }
      return <FloatingNode id={nodeId}>{renderedNode}</FloatingNode>;
    },
    [mounted, nodeId, portalContainer, portalled]
  );

  return {
    floatingRef,
    floatingStyles,
    positioned: isPositioned,
    placement: resolvedPlacement,
    renderFloating,
    getReferenceProps,
    getFloatingProps
  };
}
