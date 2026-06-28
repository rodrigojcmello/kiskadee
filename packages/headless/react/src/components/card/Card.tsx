import { stateActivator as cn } from '@kiskadee/core';
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
  children?: ReactNode;
  controlState?: boolean;
  defaultControlState?: boolean;
  onControlStateChange?: (controlState: boolean) => void;
  interactionStateSource?: CardActionInteractionStateSource;
  interactionLocked?: boolean;
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
  projectedHover?: boolean;
  projectedPressed?: boolean;
}): string | undefined {
  const hasProjectedState =
    states.controlState || states.disabled || states.projectedHover || states.projectedPressed;

  return join(
    cn.interactive,
    cn.nativeInteraction,
    states.projectedHover && cn.hover,
    states.projectedPressed && cn.pressed,
    states.controlState && cn.selected,
    states.disabled && cn.disabled,
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
  const shouldProjectBoundsState = interactionStateSource === 'bounds' && !disabled;
  const stateClassName = cardActionStateClassName({
    controlState,
    disabled,
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
    setIsBoundsHovered(false);
    setIsBoundsPressed(false);
  }, [shouldProjectBoundsState]);

  useEffect(() => {
    if (!shouldProjectBoundsState) return;

    const updateHoverFromPointer = (event: PointerEvent) => {
      const buttonElement = buttonRef.current;
      const isHovered =
        buttonElement !== null &&
        isHoverCapablePointer(event) &&
        isPointerInsideBounds(buttonElement, event);

      setIsBoundsHovered(isHovered);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const buttonElement = buttonRef.current;
      if (!buttonElement || event.button !== 0 || event.isPrimary === false) return;

      const isInside = isPointerInsideBounds(buttonElement, event);
      if (isHoverCapablePointer(event)) {
        setIsBoundsHovered(isInside);
      }

      if (!isInside) {
        pressedPointerIdRef.current = null;
        setIsBoundsPressed(false);
        return;
      }

      pressedPointerIdRef.current = event.pointerId;
      setIsBoundsPressed(true);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateHoverFromPointer(event);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (pressedPointerIdRef.current !== null && pressedPointerIdRef.current !== event.pointerId) {
        return;
      }

      pressedPointerIdRef.current = null;
      setIsBoundsPressed(false);
      updateHoverFromPointer(event);
    };

    const handleWindowBlur = () => {
      pressedPointerIdRef.current = null;
      setIsBoundsPressed(false);
      setIsBoundsHovered(false);
    };

    const listenerOptions = { capture: true, passive: true };
    window.addEventListener('pointerdown', handlePointerDown, listenerOptions);
    window.addEventListener('pointermove', handlePointerMove, listenerOptions);
    window.addEventListener('pointerup', handlePointerEnd, listenerOptions);
    window.addEventListener('pointercancel', handlePointerEnd, listenerOptions);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      pressedPointerIdRef.current = null;
      window.removeEventListener('pointerdown', handlePointerDown, listenerOptions);
      window.removeEventListener('pointermove', handlePointerMove, listenerOptions);
      window.removeEventListener('pointerup', handlePointerEnd, listenerOptions);
      window.removeEventListener('pointercancel', handlePointerEnd, listenerOptions);
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
      {children}
    </button>
  );
});

export const Card = CardRoot;
export const CardAction = CardActionRoot;
