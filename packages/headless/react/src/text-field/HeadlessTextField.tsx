import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  Ref,
  RefObject
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import type {
  StateProjectionRule,
  StateProjectionSlotProps,
  StateProjectionStateValue,
  UseStateProjectionOptions
} from '../state-projection/useStateProjection.ts';
import {
  mergeStateProjectionSlotProps,
  useStateProjection
} from '../state-projection/useStateProjection.ts';

export type TextFieldValidationStatus = 'error' | 'warning';

export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TextFieldStateName =
  | 'focused'
  | 'filled'
  | 'disabled'
  | 'readOnly'
  | 'invalid'
  | 'validationStatus';

export type TextFieldClassNames = Partial<Record<TextFieldElementName, string>>;

export type TextFieldStateProjectionOptions = Omit<
  UseStateProjectionOptions<TextFieldElementName, TextFieldStateName>,
  'classNames' | 'states' | 'target'
> & {
  target?: TextFieldElementName;
};

type TextFieldProjectionStates = Partial<Record<TextFieldStateName, StateProjectionStateValue>>;
type TextFieldSlotProps = StateProjectionSlotProps<TextFieldElementName>;

type TextFieldRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type TextFieldRootProps = TextFieldRootDivProps & {
  children?: ReactNode;
  classNames?: TextFieldClassNames;
  stateProjection?: TextFieldStateProjectionOptions;
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
  slotProps: TextFieldSlotProps;
  inputId: string;
  labelId: string;
  messageId: string;
  value: string;
  setValue: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
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

const textFieldDataAttributeProjections = {
  focused: {
    attribute: 'data-focused'
  },
  filled: {
    attribute: 'data-filled'
  },
  disabled: {
    attribute: 'data-disabled'
  },
  readOnly: {
    attribute: 'data-readonly'
  },
  invalid: {
    attribute: 'data-invalid'
  },
  validationStatus: {
    attribute: {
      name: 'data-validation-status',
      value: (status) => String(status)
    }
  }
} satisfies Partial<
  Record<TextFieldStateName, StateProjectionRule<TextFieldElementName, TextFieldStateName>>
>;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

function TextFieldRoot({
  children,
  classNames = {},
  stateProjection,
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { target: stateProjectionTarget = 'e1', ...stateProjectionOptions } = stateProjection ?? {};

  const projectionStates = useMemo<TextFieldProjectionStates>(
    () => ({
      focused,
      filled: resolvedValue.length > 0,
      disabled,
      readOnly,
      invalid: validationStatus === 'error',
      validationStatus
    }),
    [disabled, focused, readOnly, resolvedValue, validationStatus]
  );

  const projectedSlotProps = useStateProjection<TextFieldElementName, TextFieldStateName>({
    ...stateProjectionOptions,
    classNames,
    states: projectionStates,
    target: stateProjectionTarget
  });

  const rootDataSlotProps = useStateProjection<TextFieldElementName, TextFieldStateName>({
    states: projectionStates,
    target: 'e1',
    projections: textFieldDataAttributeProjections
  });

  const controlDataSlotProps = useStateProjection<TextFieldElementName, TextFieldStateName>({
    states: projectionStates,
    target: 'e3',
    projections: textFieldDataAttributeProjections
  });

  const slotProps = useMemo<TextFieldSlotProps>(
    () =>
      mergeStateProjectionSlotProps(
        projectedSlotProps.slotProps,
        rootDataSlotProps.slotProps,
        controlDataSlotProps.slotProps
      ),
    [controlDataSlotProps.slotProps, projectedSlotProps.slotProps, rootDataSlotProps.slotProps]
  );

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
      slotProps,
      inputId: resolvedInputId,
      labelId: `${resolvedInputId}-label`,
      messageId: `${resolvedInputId}-message`,
      value: resolvedValue,
      setValue,
      inputRef,
      disabled,
      readOnly,
      required,
      validationStatus,
      message,
      focused,
      setFocused
    }),
    [
      disabled,
      focused,
      message,
      readOnly,
      required,
      resolvedInputId,
      resolvedValue,
      setValue,
      inputRef,
      slotProps,
      validationStatus
    ]
  );
  const { className: rootClassName, ...rootSlotProps } = slotProps.e1 ?? {};

  return (
    <TextFieldContext.Provider value={contextValue}>
      <div {...rootSlotProps} className={rootClassName} {...rootProps}>
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
  const { className: slotClassName, ...slotProps } = context.slotProps.e2 ?? {};

  return (
    <label
      {...slotProps}
      ref={ref}
      id={context.labelId}
      htmlFor={context.inputId}
      className={mergeClassNames(slotClassName, className)}
      {...props}
    >
      {children}
    </label>
  );
});

const TextFieldControl = forwardRef<HTMLDivElement, TextFieldControlProps>(
  function TextFieldControl({ className, children, onClick, ...props }, ref) {
    const context = useTextFieldContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e3 ?? {};
    const { disabled, inputRef } = context;

    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClick?.(event);

        const inputElement = inputRef.current;
        if (!inputElement || event.defaultPrevented || disabled || event.target === inputElement) {
          return;
        }

        inputElement.focus();
      },
      [disabled, inputRef, onClick]
    );

    return (
      <div
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        onClick={handleClick}
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
  const { className: slotClassName, ...slotProps } = context.slotProps.e4 ?? {};
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
      {...slotProps}
      {...props}
      ref={(node) => {
        context.inputRef.current = node;
        assignRef(ref, node);
      }}
      id={context.inputId}
      type={type}
      value={context.value}
      disabled={context.disabled}
      readOnly={context.readOnly}
      required={context.required}
      aria-invalid={context.validationStatus === 'error' ? true : undefined}
      aria-describedby={describedBy}
      className={mergeClassNames(slotClassName, className)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
});

const TextFieldMessage = forwardRef<HTMLParagraphElement, TextFieldMessageProps>(
  function TextFieldMessage({ className, children, ...props }, ref) {
    const context = useTextFieldContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e5 ?? {};
    const content = children ?? context.message;

    if (!content) return null;

    return (
      <p
        {...slotProps}
        ref={ref}
        id={context.messageId}
        className={mergeClassNames(slotClassName, className)}
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
