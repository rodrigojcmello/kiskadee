import { stateActivator as cn } from '@kiskadee/core';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent,
  ReactNode
} from 'react';
import { forwardRef, useCallback } from 'react';
import { useControlState } from '../../hooks/control-state/useControlState.ts';

export type CardClassNames = Partial<Record<'e1', string>>;

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
  interactionLocked?: boolean;
  unsafeAttrs?: CardUnsafeAttributes;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  CardDataAttributes;

function join(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

function cardActionStateClassName(states: {
  controlState: boolean;
  disabled?: boolean;
}): string | undefined {
  const hasProjectedState = states.controlState || states.disabled;

  return join(
    cn.interactive,
    cn.nativeInteraction,
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
    interactionLocked,
    disabled,
    type = 'button',
    onClick,
    unsafeAttrs,
    'aria-pressed': ariaPressedProp,
    ...rest
  },
  ref
) {
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
  const stateClassName = cardActionStateClassName({ controlState, disabled });
  const ariaPressed = isSelectable ? controlState : ariaPressedProp;

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

  return (
    <button
      {...rest}
      {...unsafeAttrs}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={join(classNames.e1, stateClassName, className)}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

export const Card = CardRoot;
export const CardAction = CardActionRoot;
