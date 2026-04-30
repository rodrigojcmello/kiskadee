import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  HTMLAttributes,
  ReactNode,
  Ref
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState
} from 'react';

export type TextFieldValidationStatus = 'error' | 'warning';

export type TextFieldClassNames = Partial<
  Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6', string>
>;

type TextFieldRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type TextFieldRootProps = TextFieldRootDivProps & {
  children?: ReactNode;
  classNames?: TextFieldClassNames;
  inputId?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  validationStatus?: TextFieldValidationStatus;
  message?: ReactNode;
};

export type TextFieldLabelProps = Omit<HTMLAttributes<HTMLLabelElement>, 'htmlFor'>;
export type TextFieldControlProps = HTMLAttributes<HTMLDivElement>;
export type TextFieldMessageProps = HTMLAttributes<HTMLParagraphElement>;

export type TextFieldInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'aria-describedby'
  | 'aria-invalid'
  | 'defaultValue'
  | 'disabled'
  | 'id'
  | 'readOnly'
  | 'required'
  | 'value'
> & {
  'aria-describedby'?: string;
};

type TextFieldContextValue = {
  classNames: TextFieldClassNames;
  inputId: string;
  labelId: string;
  messageId: string;
  value: string;
  setValue: (value: string) => void;
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
  required: boolean | undefined;
  validationStatus: TextFieldValidationStatus | undefined;
  message: ReactNode;
  focused: boolean;
  setFocused: (focused: boolean) => void;
};

const TextFieldContext = createContext<TextFieldContextValue | null>(null);

function useTextFieldContext() {
  const context = useContext(TextFieldContext);
  if (!context) {
    throw new Error('TextField compound components must be used within a TextField.Root');
  }
  return context;
}

function mergeClassNames(...parts: Array<string | undefined | null | false>): string | undefined {
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

function resolveDataAttributes(context: TextFieldContextValue) {
  const filled = context.value.length > 0;

  return {
    'data-focused': context.focused ? '' : undefined,
    'data-filled': filled ? '' : undefined,
    'data-disabled': context.disabled ? '' : undefined,
    'data-readonly': context.readOnly ? '' : undefined,
    'data-invalid': context.validationStatus === 'error' ? '' : undefined,
    'data-validation-status': context.validationStatus
  };
}

function TextFieldRoot({
  children,
  classNames = {},
  inputId,
  value,
  defaultValue = '',
  onValueChange,
  disabled,
  readOnly,
  required,
  validationStatus,
  message,
  ...rootProps
}: TextFieldRootProps) {
  const generatedId = useId();
  const resolvedInputId = inputId ?? `text-field-${generatedId}`;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const resolvedValue = isControlled ? value : uncontrolledValue;
  const [focused, setFocused] = useState(false);

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo<TextFieldContextValue>(
    () => ({
      classNames,
      inputId: resolvedInputId,
      labelId: `${resolvedInputId}-label`,
      messageId: `${resolvedInputId}-message`,
      value: resolvedValue,
      setValue,
      disabled,
      readOnly,
      required,
      validationStatus,
      message,
      focused,
      setFocused
    }),
    [
      classNames,
      disabled,
      focused,
      message,
      readOnly,
      required,
      resolvedInputId,
      resolvedValue,
      setValue,
      validationStatus
    ]
  );

  return (
    <TextFieldContext.Provider value={contextValue}>
      <div className={classNames.e1} {...resolveDataAttributes(contextValue)} {...rootProps}>
        {children}
      </div>
    </TextFieldContext.Provider>
  );
}

const TextFieldLabel = forwardRef<HTMLLabelElement, TextFieldLabelProps>(function TextFieldLabel(
  { className, children, ...props },
  ref
) {
  const context = useTextFieldContext();

  return (
    <label
      ref={ref}
      id={context.labelId}
      htmlFor={context.inputId}
      className={mergeClassNames(context.classNames.e2, className)}
      {...props}
    >
      {children}
    </label>
  );
});

const TextFieldControl = forwardRef<HTMLDivElement, TextFieldControlProps>(
  function TextFieldControl({ className, children, ...props }, ref) {
    const context = useTextFieldContext();

    return (
      <div
        ref={ref}
        className={mergeClassNames(context.classNames.e3, className)}
        {...resolveDataAttributes(context)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const TextFieldInput = forwardRef<HTMLInputElement, TextFieldInputProps>(function TextFieldInput(
  {
    className,
    onBlur,
    onChange,
    onFocus,
    type = 'text',
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const context = useTextFieldContext();
  const describedBy = mergeClassNames(
    ariaDescribedBy,
    context.message ? context.messageId : undefined
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      context.setValue(event.currentTarget.value);
      onChange?.(event);
    },
    [context, onChange]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      context.setFocused(true);
      onFocus?.(event);
    },
    [context, onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      context.setFocused(false);
      onBlur?.(event);
    },
    [context, onBlur]
  );

  return (
    <input
      {...props}
      ref={(node) => assignRef(ref, node)}
      id={context.inputId}
      type={type}
      value={context.value}
      disabled={context.disabled}
      readOnly={context.readOnly}
      required={context.required}
      aria-invalid={context.validationStatus === 'error' ? true : undefined}
      aria-describedby={describedBy}
      className={mergeClassNames(context.classNames.e4, className)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
});

const TextFieldMessage = forwardRef<HTMLParagraphElement, TextFieldMessageProps>(
  function TextFieldMessage({ className, children, ...props }, ref) {
    const context = useTextFieldContext();
    const content = children ?? context.message;

    if (!content) return null;

    return (
      <p
        ref={ref}
        id={context.messageId}
        className={mergeClassNames(context.classNames.e5, className)}
        role={context.validationStatus === 'error' ? 'alert' : undefined}
        aria-live={context.validationStatus === 'warning' ? 'polite' : undefined}
        {...props}
      >
        {content}
      </p>
    );
  }
);

export const HeadlessTextField = Object.assign(TextFieldRoot, {
  Root: TextFieldRoot,
  Label: TextFieldLabel,
  Control: TextFieldControl,
  Input: TextFieldInput,
  Message: TextFieldMessage
});

export default HeadlessTextField;
