import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ButtonClassNames = Partial<Record<'e1' | 'e2' | 'e3', string>>;

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
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export type ButtonLabelProps = HTMLAttributes<HTMLSpanElement>;
export type ButtonIconProps = HTMLAttributes<HTMLSpanElement>;

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

type ButtonContextValue = {
  classNames: ButtonClassNames;
};

const ButtonContext = createContext<ButtonContextValue | null>(null);

function useButtonContext() {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error('Button compound components must be used within a Button');
  }
  return context;
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
  { classNames = {}, label, icon, type = 'button', children, ...rest },
  ref
) {
  const { e1, e2, e3 } = classNames;

  const contextValue = useMemo<ButtonContextValue>(
    () => ({ classNames: { e2, e3 } }),
    [e2, e3]
  );

  return (
    <ButtonContext.Provider value={contextValue}>
      <button {...rest} ref={ref} type={type} className={e1}>
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
  Icon: ButtonIcon
});

export default Button;
