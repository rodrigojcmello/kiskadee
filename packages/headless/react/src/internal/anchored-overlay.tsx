import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  type Placement,
  shift,
  size,
  useFloating
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
  onDismiss: (details: AnchoredOverlayDismissDetails) => void;
};

export function useAnchoredOverlay({
  open,
  referenceElement,
  placement = 'bottom-start',
  offset = 6,
  collisionPadding = 8,
  portalled = true,
  portalContainer,
  width = 'content',
  onDismiss
}: UseAnchoredOverlayOptions): {
  floatingRef: RefCallback<HTMLElement>;
  floatingStyles: CSSProperties;
  placement: Placement;
  renderFloating: (node: ReactNode) => ReactNode;
} {
  const [mounted, setMounted] = useState(false);
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
  const {
    refs,
    floatingStyles,
    placement: resolvedPlacement
  } = useFloating({
    open,
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

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    refs.setReference(referenceElement);
  }, [referenceElement, refs]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (referenceElement?.contains(target) || refs.floating.current?.contains(target)) return;
      onDismiss({ reason: 'outside-press', event });
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onDismiss({ reason: 'escape', event });
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDismiss, open, referenceElement, refs.floating]);

  const floatingRef = useCallback<RefCallback<HTMLElement>>(
    (node) => refs.setFloating(node),
    [refs]
  );
  const renderFloating = useCallback(
    (node: ReactNode): ReactNode => {
      if (!portalled || !mounted) return node;
      const container = portalContainer === undefined ? document.body : portalContainer;
      return container ? createPortal(node, container) : node;
    },
    [mounted, portalContainer, portalled]
  );

  return {
    floatingRef,
    floatingStyles,
    placement: resolvedPlacement,
    renderFloating
  };
}
