import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  HTMLAttributes,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
  RefObject
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type {
  StateProjectionRule,
  StateProjectionSlotProps,
  StateProjectionStateValue,
  UseStateProjectionOptions
} from '../../hooks/state-projection/useStateProjection.ts';
import {
  mergeStateProjectionSlotProps,
  useStateProjection
} from '../../hooks/state-projection/useStateProjection.ts';

export type TextFieldValidationStatus = 'error' | 'warning';

export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TextFieldStateName =
  | 'hovered'
  | 'pressed'
  | 'focused'
  | 'focusVisible'
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
export type TextFieldMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  reserveSpace?: boolean;
};

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
  controlRef: RefObject<HTMLDivElement | null>;
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
  required: boolean | undefined;
  validationStatus: TextFieldValidationStatus | undefined;
  message: ReactNode;
  focused: boolean;
  setFocused: (focused: boolean) => void;
  focusVisible: boolean;
  setFocusVisible: (focusVisible: boolean) => void;
};

const TextFieldContext = createContext<TextFieldContextValue | null>(null);

function useTextFieldContext() {
  const context = useContext(TextFieldContext);
  if (!context) {
    throw new Error('TextField compound components must be used within a TextField.Root');
  }
  return context;
}

export type UseHeadlessTextFieldActionsOptions = {
  inputType?: HTMLInputTypeAttribute;
  visibilityEnabled?: boolean;
};

export type UseHeadlessTextFieldActionsResult = {
  value: string;
  inputId: string;
  disabled: boolean;
  readOnly: boolean;
  clear: () => void;
  inputType: HTMLInputTypeAttribute;
  visible: boolean;
  toggleVisibility: () => void;
};

/** Connects optional actions to the existing field value and native input without exposing its context. */
export function useHeadlessTextFieldActions({
  inputType = 'text',
  visibilityEnabled = false
}: UseHeadlessTextFieldActionsOptions = {}): UseHeadlessTextFieldActionsResult {
  const { value, inputId, disabled, readOnly, setValue, inputRef } = useTextFieldContext();
  const canReveal = visibilityEnabled && inputType === 'password';
  const [shown, setShown] = useState(false);
  const visible = canReveal && shown;
  const selectionRef = useRef<{
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none' | null;
  } | null>(null);

  useEffect(() => {
    if (canReveal) return;
    setShown(false);
    selectionRef.current = null;
  }, [canReveal]);

  useLayoutEffect(() => {
    const selection = selectionRef.current;
    selectionRef.current = null;
    const input = inputRef.current;
    if (!selection || !canReveal || !input || (input.type !== 'text' && input.type !== 'password'))
      return;
    input.setSelectionRange(selection.start, selection.end, selection.direction ?? undefined);
  }, [canReveal, inputRef, visible]);

  const clear = useCallback(() => {
    if (disabled || readOnly || value.length === 0) return;
    inputRef.current?.focus();
    setValue('');
  }, [disabled, inputRef, readOnly, setValue, value]);

  const toggleVisibility = useCallback(() => {
    if (!canReveal || disabled) return;
    const input = inputRef.current;
    selectionRef.current =
      input?.selectionStart != null && input.selectionEnd != null
        ? {
            start: input.selectionStart,
            end: input.selectionEnd,
            direction: input.selectionDirection
          }
        : null;
    setShown((current) => !current);
  }, [canReveal, disabled, inputRef]);

  return {
    value,
    inputId,
    disabled: disabled === true,
    readOnly: readOnly === true,
    clear,
    inputType: visible ? 'text' : inputType,
    visible,
    toggleVisibility
  };
}

function mergeClassNames(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

const interactiveDescendantSelector = [
  'button',
  'input',
  'select',
  'textarea',
  'a[href]',
  'area[href]',
  'summary',
  'label',
  'audio[controls]',
  'video[controls]',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])',
  ...[
    'button',
    'checkbox',
    'combobox',
    'link',
    'listbox',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'radio',
    'searchbox',
    'slider',
    'spinbutton',
    'switch',
    'tab',
    'textbox',
    'treeitem'
  ].map((role) => `[role~="${role}"]`)
].join(',');

function isTextFieldSurfaceTarget(
  control: HTMLElement | null,
  input: HTMLInputElement | null,
  target: EventTarget | null
): boolean {
  if (!control || !(target instanceof Node) || !control.contains(target)) return false;
  if (target === input) return true;
  const interactiveTarget =
    target instanceof Element ? target.closest(interactiveDescendantSelector) : null;
  return (
    !interactiveTarget || interactiveTarget === control || !control.contains(interactiveTarget)
  );
}

const textFieldDataAttributeProjections = {
  hovered: {
    attribute: 'data-hovered'
  },
  pressed: {
    attribute: 'data-pressed'
  },
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
  onPointerEnter,
  onPointerLeave,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onBlurCapture,
  ...rootProps
}: TextFieldRootProps) {
  const generatedId = useId();
  const resolvedInputId = inputId ?? `text-field-${generatedId}`;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const resolvedValue = isControlled ? value : uncontrolledValue;
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressedPointerId = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const isTerminal = disabled === true || readOnly === true;
  const { target: stateProjectionTarget = 'e1', ...stateProjectionOptions } = stateProjection ?? {};

  const clearPressed = useCallback(() => {
    pressedPointerId.current = null;
    setPressed(false);
  }, []);

  useEffect(() => {
    if (!isTerminal) return;
    setHovered(false);
    clearPressed();
  }, [clearPressed, isTerminal]);

  useEffect(() => {
    if (!hovered && !pressed) return;
    const root = rootRef.current;
    const view = root?.ownerDocument.defaultView;
    if (!root || !view) return;

    const handlePointerEnd = (event: PointerEvent) => {
      if (pressedPointerId.current !== event.pointerId) return;
      clearPressed();
      if (
        event.type === 'pointercancel' ||
        !(event.target instanceof Node) ||
        !controlRef.current?.contains(event.target)
      ) {
        setHovered(false);
      }
    };
    const handleWindowBlur = () => {
      setHovered(false);
      clearPressed();
    };
    view.addEventListener('pointerup', handlePointerEnd, true);
    view.addEventListener('pointercancel', handlePointerEnd, true);
    view.addEventListener('blur', handleWindowBlur);
    return () => {
      view.removeEventListener('pointerup', handlePointerEnd, true);
      view.removeEventListener('pointercancel', handlePointerEnd, true);
      view.removeEventListener('blur', handleWindowBlur);
    };
  }, [clearPressed, hovered, pressed]);

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      if (
        !event.defaultPrevented &&
        !isTerminal &&
        event.target instanceof Node &&
        controlRef.current?.contains(event.target)
      ) {
        setHovered(event.pointerType === 'mouse' || event.pointerType === 'pen');
      }
    },
    [isTerminal, onPointerEnter]
  );
  const handlePointerOver = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerOver?.(event);
      if (
        event.defaultPrevented ||
        isTerminal ||
        !(event.target instanceof Node) ||
        !event.currentTarget.contains(event.target)
      )
        return;
      setHovered(
        controlRef.current?.contains(event.target) === true &&
          (event.pointerType === 'mouse' || event.pointerType === 'pen')
      );
    },
    [isTerminal, onPointerOver]
  );
  const handlePointerOut = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerOut?.(event);
      if (
        !(event.target instanceof Node) ||
        !event.currentTarget.contains(event.target) ||
        (event.relatedTarget instanceof Node &&
          controlRef.current?.contains(event.relatedTarget)) ||
        (pressedPointerId.current !== null && pressedPointerId.current !== event.pointerId)
      )
        return;
      setHovered(false);
      clearPressed();
    },
    [clearPressed, onPointerOut]
  );
  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (
        !(event.target instanceof Node) ||
        !event.currentTarget.contains(event.target) ||
        (pressedPointerId.current !== null && pressedPointerId.current !== event.pointerId)
      )
        return;
      setHovered(false);
      clearPressed();
    },
    [clearPressed, onPointerLeave]
  );
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.pointerType === 'touch') setHovered(false);
      if (
        event.defaultPrevented ||
        isTerminal ||
        event.button !== 0 ||
        event.isPrimary === false ||
        (pressedPointerId.current !== null && pressedPointerId.current !== event.pointerId) ||
        !isTextFieldSurfaceTarget(controlRef.current, inputRef.current, event.target)
      ) {
        return;
      }
      pressedPointerId.current = event.pointerId;
      setPressed(true);
    },
    [isTerminal, onPointerDown]
  );
  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerUp?.(event);
      if (pressedPointerId.current === event.pointerId) clearPressed();
    },
    [clearPressed, onPointerUp]
  );
  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerCancel?.(event);
      if (pressedPointerId.current !== event.pointerId) return;
      setHovered(false);
      clearPressed();
    },
    [clearPressed, onPointerCancel]
  );
  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onBlurCapture?.(event);
      if (event.target === inputRef.current && event.relatedTarget !== null) clearPressed();
    },
    [clearPressed, onBlurCapture]
  );

  const projectionStates = useMemo<TextFieldProjectionStates>(
    () => ({
      hovered: hovered && !pressed && !isTerminal,
      pressed: pressed && !isTerminal,
      focused,
      focusVisible: focused && focusVisible,
      filled: resolvedValue.length > 0,
      disabled,
      readOnly,
      invalid: validationStatus === 'error',
      validationStatus
    }),
    [
      disabled,
      focusVisible,
      focused,
      hovered,
      isTerminal,
      pressed,
      readOnly,
      resolvedValue,
      validationStatus
    ]
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
      controlRef,
      disabled,
      readOnly,
      required,
      validationStatus,
      message,
      focused,
      setFocused,
      focusVisible,
      setFocusVisible
    }),
    [
      disabled,
      focusVisible,
      focused,
      message,
      readOnly,
      required,
      resolvedInputId,
      resolvedValue,
      setValue,
      inputRef,
      controlRef,
      slotProps,
      validationStatus
    ]
  );
  const { className: rootClassName, ...rootSlotProps } = slotProps.e1 ?? {};

  return (
    <TextFieldContext.Provider value={contextValue}>
      <div
        {...rootSlotProps}
        {...rootProps}
        ref={rootRef}
        data-text-field-root=""
        className={rootClassName}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onBlurCapture={handleBlurCapture}
      >
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
        if (
          !inputElement ||
          event.defaultPrevented ||
          disabled ||
          event.target === inputElement ||
          !(event.target instanceof Node) ||
          !event.currentTarget.contains(event.target)
        ) {
          return;
        }

        if (!isTextFieldSurfaceTarget(event.currentTarget, inputElement, event.target)) return;

        inputElement.focus();
      },
      [disabled, inputRef, onClick]
    );

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: the shell delegates pointer focus to the native input.
      // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard access remains owned by the native input.
      <div
        {...slotProps}
        ref={(node) => {
          context.controlRef.current = node;
          assignRef(ref, node);
        }}
        className={mergeClassNames(slotClassName, className)}
        onClick={handleClick}
        {...props}
        data-text-field-control=""
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
    onKeyDown,
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
      context.setFocusVisible(event.currentTarget.matches(':focus-visible'));
      onFocus?.(event);
    },
    [context, onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      context.setFocused(false);
      context.setFocusVisible(false);
      onBlur?.(event);
    },
    [context, onBlur]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      context.setFocusVisible(true);
      onKeyDown?.(event);
    },
    [context, onKeyDown]
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
      onKeyDown={handleKeyDown}
    />
  );
});

const TextFieldMessage = forwardRef<HTMLParagraphElement, TextFieldMessageProps>(
  function TextFieldMessage(
    {
      className,
      children,
      id,
      reserveSpace = false,
      role,
      'aria-hidden': ariaHidden,
      'aria-live': ariaLive,
      ...props
    },
    ref
  ) {
    const context = useTextFieldContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e5 ?? {};
    const content = children ?? context.message;
    const isReserved = !content && reserveSpace;
    const resolvedRole = context.validationStatus === 'error' ? 'alert' : undefined;
    const resolvedAriaLive = context.validationStatus === 'warning' ? 'polite' : undefined;

    if (!content && !reserveSpace) return null;

    return (
      <p
        {...slotProps}
        {...props}
        ref={ref}
        id={isReserved ? undefined : (id ?? context.messageId)}
        className={mergeClassNames(slotClassName, className)}
        role={isReserved ? undefined : (role ?? resolvedRole)}
        aria-hidden={isReserved ? true : ariaHidden}
        aria-live={isReserved ? undefined : (ariaLive ?? resolvedAriaLive)}
        data-reserved={isReserved ? '' : undefined}
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
