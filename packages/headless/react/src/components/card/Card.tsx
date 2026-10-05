import { stateActivator as cn, type ProjectedStateKeys } from '@kiskadee/core';
import type {
  ButtonHTMLAttributes,
  FocusEvent,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  Ref
} from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useControlState } from '../../hooks/control-state/useControlState.ts';

export type CardClassNames = Partial<Record<'e1', string>>;
export type CardActionInteractionStateSource = 'native' | 'bounds';
export type CardActionStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;
export type CardActionRenderState = {
  controlState: boolean;
};

type CardDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

type CardUnsafeAttributes = Record<string, string | number | boolean | undefined>;

export type CardProps = {
  classNames?: CardClassNames;
  children?: ReactNode;
  unsafeAttrs?: CardUnsafeAttributes;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
  CardDataAttributes;

export type CardActionProps = {
  classNames?: CardClassNames;
  children?: ReactNode | ((state: CardActionRenderState) => ReactNode);
  controlState?: boolean;
  defaultControlState?: boolean;
  onControlStateChange?: (controlState: boolean) => void;
  interactionStateSource?: CardActionInteractionStateSource;
  interactionLocked?: boolean;
  status?: CardActionStatus;
  unsafeAttrs?: CardUnsafeAttributes;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  CardDataAttributes;

function join(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

function isHoverCapablePointer(event: PointerEvent): boolean {
  return event.pointerType === 'mouse' || event.pointerType === 'pen';
}

function isPointerInsideBounds(element: HTMLElement, event: PointerEvent): boolean {
  const rect = element.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function cardActionStateClassName(states: {
  controlState: boolean;
  disabled?: boolean;
  boundsPointerActive?: boolean;
  projectedHover?: boolean;
  projectedPressed?: boolean;
  status?: CardActionStatus;
}): string | undefined {
  const isDisabled = states.disabled || states.status === 'disabled';
  const isPending = !isDisabled && states.status === 'pending';
  const isTerminal = isDisabled || isPending;
  const isPressed = !isTerminal && (states.projectedPressed || states.status === 'pressed');
  const isHovered =
    !isTerminal && !isPressed && (states.projectedHover || states.status === 'hover');
  const isSelected = !isTerminal && states.controlState;
  const isFocused = !isTerminal && states.status === 'focus';
  const isReadOnly = !isTerminal && states.status === 'readOnly';
  const hasProjectedState =
    isSelected || isHovered || isPressed || isFocused || isPending || isDisabled || isReadOnly;

  return join(
    cn.interactive,
    !isTerminal && !isPressed && !states.boundsPointerActive && cn.nativeInteraction,
    isHovered && cn.hover,
    isPressed && cn.pressed,
    isSelected && cn.selected,
    isFocused && cn.focus,
    isFocused && cn.focusVisible,
    isPending && cn.pending,
    isDisabled && cn.disabled,
    isReadOnly && cn.readOnly,
    hasProjectedState && cn.activator
  );
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { classNames = {}, className, children, unsafeAttrs, ...rest },
  ref
) {
  return (
    <div {...rest} {...unsafeAttrs} ref={ref} className={join(classNames.e1, className)}>
      {children}
    </div>
  );
});

const CardActionRoot = forwardRef<HTMLButtonElement, CardActionProps>(function CardAction(
  {
    classNames = {},
    className,
    children,
    controlState: controlStateProp,
    defaultControlState,
    onControlStateChange,
    interactionStateSource = 'native',
    interactionLocked,
    status,
    disabled,
    type = 'button',
    onClick,
    onBlur,
    unsafeAttrs,
    'aria-pressed': ariaPressedProp,
    ...rest
  },
  ref
) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const pressedPointerIdRef = useRef<number | null>(null);
  const [isBoundsHovered, setIsBoundsHovered] = useState(false);
  const [isBoundsPressed, setIsBoundsPressed] = useState(false);
  const [isBoundsPointerActive, setIsBoundsPointerActive] = useState(false);
  const isSelectable =
    controlStateProp !== undefined ||
    defaultControlState !== undefined ||
    onControlStateChange !== undefined;
  const { controlState, toggle } = useControlState({
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    interactionLocked,
    onControlStateChange
  });
  const shouldProjectBoundsState =
    interactionStateSource === 'bounds' &&
    !disabled &&
    status !== 'disabled' &&
    status !== 'pending';
  const stateClassName = cardActionStateClassName({
    controlState,
    disabled,
    status,
    boundsPointerActive: shouldProjectBoundsState && isBoundsPointerActive,
    projectedHover: shouldProjectBoundsState && isBoundsHovered,
    projectedPressed: shouldProjectBoundsState && isBoundsPressed
  });
  const ariaPressed = isSelectable ? controlState : ariaPressedProp;
  const assignButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  useEffect(() => {
    if (shouldProjectBoundsState) return;

    pressedPointerIdRef.current = null;
    setIsBoundsPointerActive(false);
    setIsBoundsHovered(false);
    setIsBoundsPressed(false);
  }, [shouldProjectBoundsState]);

  useEffect(() => {
    if (!shouldProjectBoundsState) return;

    const updateBoundsFromPointer = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      if (pressedPointerIdRef.current !== null && pressedPointerIdRef.current !== event.pointerId) {
        return;
      }
      const buttonElement = buttonRef.current;
      const isInside = buttonElement !== null && isPointerInsideBounds(buttonElement, event);
      setIsBoundsHovered(isHoverCapablePointer(event) && isInside);
      setIsBoundsPressed(pressedPointerIdRef.current === event.pointerId && isInside);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const buttonElement = buttonRef.current;
      if (!buttonElement || event.button !== 0 || event.isPrimary === false) return;
      if (pressedPointerIdRef.current !== null && pressedPointerIdRef.current !== event.pointerId) {
        return;
      }

      const isInside = isPointerInsideBounds(buttonElement, event);
      setIsBoundsHovered(isInside && isHoverCapablePointer(event));

      if (!isInside) {
        pressedPointerIdRef.current = null;
        setIsBoundsPointerActive(false);
        setIsBoundsPressed(false);
        return;
      }

      pressedPointerIdRef.current = event.pointerId;
      setIsBoundsPointerActive(true);
      setIsBoundsPressed(true);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateBoundsFromPointer(event);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      if (pressedPointerIdRef.current !== null && pressedPointerIdRef.current !== event.pointerId) {
        return;
      }

      pressedPointerIdRef.current = null;
      setIsBoundsPointerActive(false);
      updateBoundsFromPointer(event);
    };

    const handleWindowBlur = () => {
      pressedPointerIdRef.current = null;
      setIsBoundsPointerActive(false);
      setIsBoundsPressed(false);
      setIsBoundsHovered(false);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      if (pressedPointerIdRef.current !== null && pressedPointerIdRef.current !== event.pointerId) {
        return;
      }
      handleWindowBlur();
    };
    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) handlePointerCancel(event);
    };

    const listenerOptions = { capture: true, passive: true };
    window.addEventListener('pointerdown', handlePointerDown, listenerOptions);
    window.addEventListener('pointermove', handlePointerMove, listenerOptions);
    window.addEventListener('pointerup', handlePointerEnd, listenerOptions);
    window.addEventListener('pointercancel', handlePointerCancel, listenerOptions);
    window.addEventListener('pointerout', handlePointerOut, listenerOptions);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      pressedPointerIdRef.current = null;
      window.removeEventListener('pointerdown', handlePointerDown, listenerOptions);
      window.removeEventListener('pointermove', handlePointerMove, listenerOptions);
      window.removeEventListener('pointerup', handlePointerEnd, listenerOptions);
      window.removeEventListener('pointercancel', handlePointerCancel, listenerOptions);
      window.removeEventListener('pointerout', handlePointerOut, listenerOptions);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [shouldProjectBoundsState]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (interactionLocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);

      if (!event.defaultPrevented && isSelectable) {
        toggle();
      }
    },
    [interactionLocked, isSelectable, onClick, toggle]
  );
  const handleBlur = useCallback(
    (event: FocusEvent<HTMLButtonElement>) => {
      pressedPointerIdRef.current = null;
      setIsBoundsPointerActive(false);
      setIsBoundsPressed(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  return (
    <button
      {...rest}
      {...unsafeAttrs}
      ref={assignButtonRef}
      type={type}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={join(classNames.e1, stateClassName, className)}
      onClick={handleClick}
      onBlur={handleBlur}
    >
      {typeof children === 'function' ? children({ controlState }) : children}
    </button>
  );
});

export const Card = CardRoot;
export const CardAction = CardActionRoot;
