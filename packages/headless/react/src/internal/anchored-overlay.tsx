import {
  autoUpdate,
  FloatingNode,
  FloatingTree,
  flip,
  offset as floatingOffset,
  type OpenChangeReason,
  type Placement,
  type ReferenceType,
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
  positionReference?: ReferenceType | null;
  placement?: Placement;
  fallbackPlacements?: Placement[];
  offset?: number;
  collisionPadding?: number;
  shiftCrossAxis?: boolean;
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
  positionReference,
  placement = 'bottom-start',
  fallbackPlacements,
  offset = 6,
  collisionPadding = 8,
  shiftCrossAxis = false,
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
  availableHeight: number;
  availableWidth: number;
  renderFloating: (node: ReactNode) => ReactNode;
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
} {
  const [mounted, setMounted] = useState(false);
  const [availableSize, setAvailableSize] = useState({ height: 0, width: 0 });
  const nodeId = useFloatingNodeId();
  const sizeMiddleware = useMemo(
    () =>
      size({
        padding: collisionPadding,
        apply({ availableHeight, availableWidth, elements, rects }) {
          const height = Math.max(0, availableHeight);
          const widthLimit = Math.max(0, availableWidth);
          setAvailableSize((current) =>
            current.height === height && current.width === widthLimit
              ? current
              : { height, width: widthLimit }
          );
          elements.floating.style.removeProperty('width');
          elements.floating.style.removeProperty('min-width');
          if (width === 'anchor') {
            elements.floating.style.width = `${Math.min(rects.reference.width, widthLimit)}px`;
          } else if (width === 'min-anchor') {
            elements.floating.style.minWidth = `${Math.min(rects.reference.width, widthLimit)}px`;
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
      flip({ padding: collisionPadding, fallbackPlacements }),
      shift({ padding: collisionPadding, crossAxis: shiftCrossAxis }),
      sizeMiddleware
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

  useEffect(() => {
    refs.setPositionReference(positionReference ?? referenceElement);
  }, [positionReference, referenceElement, refs]);

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
    availableHeight: availableSize.height,
    availableWidth: availableSize.width,
    renderFloating,
    getReferenceProps,
    getFloatingProps
  };
}
