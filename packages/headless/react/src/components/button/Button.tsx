import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode
} from 'react';
import { createContext, forwardRef, useCallback, useContext, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ButtonClassNames = Partial<Record<'e1' | 'e2' | 'e3' | 'e5', string>>;

type ButtonDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

type ButtonUnsafeAttributes = Record<string, string | number | boolean | undefined>;

export type ButtonProps = {
  /**
   * Class names by compact element keys for styling integration.
   * - e1: Root button element (button)
   * - e2: Label text wrapper (span)
   * - e3: Icon wrapper (span)
   */
  classNames?: ButtonClassNames;
  /** Optional visual label (text). If omitted, ensure the button is still accessible (aria-label). */
  label?: ReactNode;
  /** Optional icon element. Rendered before the label by default. */
  icon?: ReactNode;
  /**
   * Blocks new activation attempts without applying native disabled semantics.
   * This low-level gate does not add pending ARIA state by itself.
   */
  interactionLocked?: boolean;
  /**
   * Marks an accepted action as in progress.
   * Pending buttons remain focusable, expose busy/disabled ARIA state, and block reactivation.
   */
  pending?: boolean;
  children?: ReactNode;
  /**
   * Escape hatch for uncommon attributes not covered by native button typings.
   * Prefer native props and data-* attributes whenever possible.
   */
  unsafeAttrs?: ButtonUnsafeAttributes;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  ButtonDataAttributes;

export type ButtonLabelProps = HTMLAttributes<HTMLSpanElement>;
export type ButtonIconProps = HTMLAttributes<HTMLSpanElement>;
export type ButtonDisclosureProps = HTMLAttributes<HTMLSpanElement>;

export type ButtonResolvedInteractionState = {
  /** Whether the native disabled attribute owns the interaction gate. */
  nativeDisabled: boolean;
  /** Resolved pending state. Native disabled takes precedence over pending. */
  pending: boolean;
  /** Resolved temporary gate, including the gate implied by pending. */
  interactionLocked: boolean;
  /** Whether user activation must be blocked by either native or temporary semantics. */
  activationBlocked: boolean;
  /** Final aria-busy value forwarded to the native button. */
  ariaBusy: ButtonHTMLAttributes<HTMLButtonElement>['aria-busy'];
  /** Final aria-disabled value forwarded to the native button. */
  ariaDisabled: ButtonHTMLAttributes<HTMLButtonElement>['aria-disabled'];
};

export type ResolveButtonInteractionStateOptions = {
  disabled?: boolean;
  interactionLocked?: boolean;
  pending?: boolean;
  ariaBusy?: ButtonHTMLAttributes<HTMLButtonElement>['aria-busy'];
  ariaDisabled?: ButtonHTMLAttributes<HTMLButtonElement>['aria-disabled'];
};

/**
 * Resolves Button interaction semantics independently from styled state projection.
 * Styled adapters can reuse this resolver so native behavior and visual projection
 * observe the same disabled-over-pending precedence.
 */
export function resolveButtonInteractionState({
  disabled,
  interactionLocked,
  pending,
  ariaBusy,
  ariaDisabled
}: ResolveButtonInteractionStateOptions): ButtonResolvedInteractionState {
  const nativeDisabled = disabled === true;
  const resolvedPending = !nativeDisabled && pending === true;
  const resolvedInteractionLocked =
    !nativeDisabled && (interactionLocked === true || resolvedPending);
  const resolvedAriaDisabled = resolvedPending ? true : ariaDisabled;
  const ariaDisabledBlocksActivation =
    resolvedAriaDisabled === true || resolvedAriaDisabled === 'true';

  return {
    nativeDisabled,
    pending: resolvedPending,
    interactionLocked: resolvedInteractionLocked,
    activationBlocked: nativeDisabled || resolvedInteractionLocked || ariaDisabledBlocksActivation,
    ariaBusy: resolvedPending ? true : ariaBusy,
    ariaDisabled: resolvedAriaDisabled
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

type ButtonContextValue = {
  classNames: ButtonClassNames;
  interactionState: ButtonResolvedInteractionState;
};

const ButtonContext = createContext<ButtonContextValue | null>(null);

function useButtonContext() {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error('Button compound components must be used within a Button');
  }
  return context;
}

function isButtonActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ButtonLabel = forwardRef<HTMLSpanElement, ButtonLabelProps>(function ButtonLabel(
  { className, children, ...props },
  ref
) {
  const { classNames } = useButtonContext();
  const finalClassName = classNames.e2 ? `${classNames.e2} ${className || ''}`.trim() : className;

  return (
    <span ref={ref} className={finalClassName} {...props}>
      {children}
    </span>
  );
});

const ButtonIcon = forwardRef<HTMLSpanElement, ButtonIconProps>(function ButtonIcon(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const { classNames } = useButtonContext();
  const finalClassName = classNames.e3 ? `${classNames.e3} ${className || ''}`.trim() : className;

  return (
    <span ref={ref} className={finalClassName} aria-hidden={ariaHidden} {...props}>
      {children}
    </span>
  );
});

const ButtonDisclosure = forwardRef<HTMLSpanElement, ButtonDisclosureProps>(
  function ButtonDisclosure(
    { className, children, 'aria-hidden': ariaHidden = true, ...props },
    ref
  ) {
    const { classNames } = useButtonContext();
    const finalClassName = classNames.e5 ? `${classNames.e5} ${className || ''}`.trim() : className;

    return (
      <span ref={ref} className={finalClassName} aria-hidden={ariaHidden} {...props}>
        {children}
      </span>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Root Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Headless Button component focused on semantics and accessibility, without styles.
 * - Uses the native <button> element for correct semantics and keyboard handling.
 * - Supports optional icon and label content via props (legacy) or children (compound).
 * - Exposes compact classNames mapping (e1 root, e2 label, e3 icon) to integrate with styled wrappers.
 * - Accepts native attributes like disabled and ARIA props (aria-pressed, aria-disabled) directly.
 */
const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    classNames = {},
    label,
    icon,
    interactionLocked,
    pending,
    type = 'button',
    children,
    disabled,
    unsafeAttrs,
    onClick,
    onKeyDown,
    onKeyUp,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    'aria-busy': ariaBusy,
    'aria-disabled': ariaDisabled,
    ...rest
  },
  ref
) {
  const { e1, e2, e3, e5 } = classNames;
  const interactionState = useMemo(
    () =>
      resolveButtonInteractionState({
        disabled,
        interactionLocked,
        pending,
        ariaBusy,
        ariaDisabled
      }),
    [ariaBusy, ariaDisabled, disabled, interactionLocked, pending]
  );

  const contextValue = useMemo<ButtonContextValue>(
    () => ({
      classNames: { e2, e3, e5 },
      interactionState
    }),
    [e2, e3, e5, interactionState]
  );
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (interactionState.activationBlocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    },
    [interactionState.activationBlocked, onClick]
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (interactionState.activationBlocked && isButtonActivationKey(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onKeyDown?.(event);
    },
    [interactionState.activationBlocked, onKeyDown]
  );
  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (interactionState.activationBlocked && isButtonActivationKey(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onKeyUp?.(event);
    },
    [interactionState.activationBlocked, onKeyUp]
  );
  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (interactionState.activationBlocked) {
        event.stopPropagation();
        return;
      }

      onPointerDown?.(event);
    },
    [interactionState.activationBlocked, onPointerDown]
  );
  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (interactionState.activationBlocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onPointerUp?.(event);
    },
    [interactionState.activationBlocked, onPointerUp]
  );
  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (interactionState.activationBlocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onPointerCancel?.(event);
    },
    [interactionState.activationBlocked, onPointerCancel]
  );

  return (
    <ButtonContext.Provider value={contextValue}>
      <button
        {...rest}
        {...unsafeAttrs}
        ref={ref}
        type={type}
        disabled={interactionState.nativeDisabled}
        aria-busy={interactionState.ariaBusy}
        aria-disabled={interactionState.ariaDisabled}
        className={e1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {children ? (
          children
        ) : (
          <>
            {!!icon && <ButtonIcon>{icon}</ButtonIcon>}
            {!!label && <ButtonLabel>{label}</ButtonLabel>}
          </>
        )}
      </button>
    </ButtonContext.Provider>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const Button = Object.assign(ButtonRoot, {
  Label: ButtonLabel,
  Icon: ButtonIcon,
  Disclosure: ButtonDisclosure
});

export default Button;
