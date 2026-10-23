import {
  createContext,
  type DOMAttributes,
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useContext
} from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';

type TextFieldPassiveAttributes<T extends HTMLElement> = Omit<
  HTMLAttributes<T>,
  keyof DOMAttributes<T> | 'tabIndex' | 'role'
>;

export type { TextFieldContentEmphasis } from '@kiskadee/core';

export type TextFieldIconProps = TextFieldPassiveAttributes<HTMLSpanElement> & {
  children: ReactElement;
  role?: 'img' | 'presentation' | 'none';
};

export type TextFieldTextProps = TextFieldPassiveAttributes<HTMLElement> & {
  children: ReactNode;
};

export type TextFieldActionProps = TextFieldPassiveAttributes<HTMLSpanElement> & {
  children: ReactElement;
};

export type TextFieldContentClassNames = {
  iconClassName: string;
  textClassName: string;
  regionClassName: string;
};

export const TextFieldContentContext = createContext<TextFieldContentClassNames | null>(null);

function useTextFieldContent() {
  const context = useContext(TextFieldContentContext);
  if (!context) {
    throw new Error('TextFieldIcon and TextFieldText must be rendered inside a TextField');
  }
  return context;
}

/** The field owns the passive icon viewport and paint; artwork keeps its own direction policy. */
export const TextFieldIcon = forwardRef<HTMLSpanElement, TextFieldIconProps>(function TextFieldIcon(
  { children, className, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const { iconClassName } = useTextFieldContent();
  return (
    <span
      {...props}
      ref={ref}
      aria-hidden={ariaHidden}
      className={joinClassNames(iconClassName, className)}
    >
      {children}
    </span>
  );
});

/** Isolates text without adding bidi control characters to the native input value. */
export const TextFieldText = forwardRef<HTMLElement, TextFieldTextProps>(function TextFieldText(
  { children, className, ...props },
  ref
) {
  const { textClassName } = useTextFieldContent();
  return (
    <bdi {...props} ref={ref} className={joinClassNames(textClassName, className)}>
      {children}
    </bdi>
  );
});

/** Marks an existing action for field-owned spacing without changing its behavior or dimensions. */
export const TextFieldAction = forwardRef<HTMLSpanElement, TextFieldActionProps>(
  function TextFieldAction({ children, className, ...props }, ref) {
    useTextFieldContent();
    return (
      <span {...props} ref={ref} className={className} data-text-field-action>
        {children}
      </span>
    );
  }
);
