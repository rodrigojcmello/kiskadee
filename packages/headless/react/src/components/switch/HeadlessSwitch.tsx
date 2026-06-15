import './HeadlessSwitch.structural.scss';
import { stateActivator as cn, type ProjectedStateKeys } from '@kiskadee/core';
import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
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
import { useControlState } from '../../hooks/control-state/useControlState.ts';

export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type SwitchStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type SwitchStateName =
  | 'controlState'
  | 'focused'
  | 'focusVisible'
  | 'disabled'
  | 'readOnly'
  | 'required';

export type SwitchClassNames = Partial<Record<SwitchElementName, string>>;

type SwitchSlotPropsValue = {
  className?: string;
};

type SwitchSlotProps = Partial<Record<SwitchElementName, SwitchSlotPropsValue>>;

type SwitchRootLabelProps = Omit<
  ComponentPropsWithoutRef<'label'>,
  'children' | 'className' | 'htmlFor'
>;

export type SwitchRootProps = SwitchRootLabelProps & {
  children?: ReactNode;
  classNames?: SwitchClassNames;
  inputId?: string;
  inputProps?: SwitchInputProps;
  inputRef?: Ref<HTMLInputElement>;
  controlState?: boolean;
  defaultControlState?: boolean;
  onControlStateChange?: (controlState: boolean) => void;
  status?: SwitchStatus;
  disabled?: boolean;
  interactionLocked?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
};

export type SwitchInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'aria-checked'
  | 'checked'
  | 'className'
  | 'defaultChecked'
  | 'disabled'
  | 'id'
  | 'name'
  | 'onChange'
  | 'readOnly'
  | 'required'
  | 'role'
  | 'type'
  | 'value'
> & {
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type SwitchTrackProps = HTMLAttributes<HTMLSpanElement>;
export type SwitchThumbProps = HTMLAttributes<HTMLSpanElement>;
export type SwitchLabelProps = HTMLAttributes<HTMLSpanElement>;
export type SwitchStateProps = HTMLAttributes<HTMLSpanElement>;
export type SwitchIconProps = HTMLAttributes<HTMLSpanElement>;

const SWITCH_INTERNAL_INPUT_CLASS_NAME = 'k-swt-x1';

type SwitchContextValue = {
  slotProps: SwitchSlotProps;
};

const SwitchContext = createContext<SwitchContextValue | null>(null);

function useSwitchContext() {
  const context = useContext(SwitchContext);
  if (!context) {
    throw new Error('Switch compound components must be used within a Switch.Root');
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

function switchStateClassName(states: {
  controlState: boolean;
  status?: SwitchStatus;
  focused: boolean;
  focusVisible: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}): string | undefined {
  const isHovered = states.status === 'hover';
  const isPressed = states.status === 'pressed';
  const isFocused = states.focused || states.status === 'focus';
  const isFocusVisible = isFocused && (states.focusVisible || states.status === 'focus');
  const isDisabled = states.disabled || states.status === 'disabled';
  const isReadOnly = states.readOnly || states.status === 'readOnly';
  const hasProjectedState =
    states.controlState || isHovered || isPressed || isFocused || isDisabled || isReadOnly;

  return mergeClassNames(
    cn.interactive,
    cn.nativeInteraction,
    isHovered && cn.hover,
    isPressed && cn.pressed,
    states.controlState && cn.selected,
    isFocused && cn.focus,
    isFocusVisible && cn.focusVisible,
    isDisabled && cn.disabled,
    isReadOnly && cn.readOnly,
    hasProjectedState && cn.activator
  );
}

const SwitchRoot = forwardRef<HTMLLabelElement, SwitchRootProps>(function SwitchRoot(
  {
    children,
    classNames = {},
    inputId,
    inputProps,
    inputRef,
    controlState: controlStateProp,
    defaultControlState,
    onControlStateChange,
    status,
    disabled,
    interactionLocked,
    readOnly,
    required,
    name,
    value,
    onClickCapture,
    ...rootProps
  },
  ref
) {
  const generatedId = useId();
  const resolvedInputId = inputId ?? `switch-${generatedId}`;
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const { controlState, setControlState } = useControlState({
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    interactionLocked,
    readOnly,
    onControlStateChange
  });

  const slotProps = useMemo<SwitchSlotProps>(() => {
    const stateClassName = switchStateClassName({
      controlState,
      status,
      focused,
      disabled,
      readOnly,
      focusVisible
    });

    return {
      e1: {
        className: mergeClassNames(classNames.e1, stateClassName)
      },
      e2: {
        className: classNames.e2
      },
      e3: {
        className: classNames.e3
      },
      e4: {
        className: classNames.e4
      },
      e5: {
        className: classNames.e5
      },
      e6: {
        className: classNames.e6
      }
    };
  }, [classNames, controlState, disabled, focused, focusVisible, readOnly, status]);

  const contextValue = useMemo<SwitchContextValue>(
    () => ({
      slotProps
    }),
    [slotProps]
  );
  const { className: rootClassName, ...rootSlotProps } = slotProps.e1 ?? {};
  const {
    className: inputClassName,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    ...restInputProps
  } = inputProps ?? {};

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (interactionLocked) {
        event.preventDefault();
        return;
      }

      if (readOnly) {
        event.preventDefault();
        onChange?.(event);
        return;
      }

      setControlState(event.currentTarget.checked);
      onChange?.(event);
    },
    [interactionLocked, onChange, readOnly, setControlState]
  );

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLLabelElement>) => {
      if (interactionLocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClickCapture?.(event);
    },
    [interactionLocked, onClickCapture]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setFocusVisible(event.currentTarget.matches(':focus-visible'));
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setFocusVisible(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      setFocusVisible(true);
      onKeyDown?.(event);
    },
    [onKeyDown]
  );

  return (
    <SwitchContext.Provider value={contextValue}>
      <label
        {...rootSlotProps}
        ref={ref}
        htmlFor={resolvedInputId}
        className={rootClassName}
        {...rootProps}
        onClickCapture={handleClickCapture}
      >
        <input
          {...restInputProps}
          ref={(node) => {
            assignRef(inputRef, node);
          }}
          id={resolvedInputId}
          type="checkbox"
          role="switch"
          checked={controlState}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          value={value}
          aria-checked={controlState}
          aria-readonly={readOnly || undefined}
          className={mergeClassNames(SWITCH_INTERNAL_INPUT_CLASS_NAME, inputClassName)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {children}
      </label>
    </SwitchContext.Provider>
  );
});

const SwitchTrack = forwardRef<HTMLSpanElement, SwitchTrackProps>(function SwitchTrack(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e2 ?? {};

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(slotClassName, className)}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </span>
  );
});

const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(function SwitchThumb(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e3 ?? {};

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(slotClassName, className)}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </span>
  );
});

const SwitchLabel = forwardRef<HTMLSpanElement, SwitchLabelProps>(function SwitchLabel(
  { className, children, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e4 ?? {};

  return (
    <span {...slotProps} ref={ref} className={mergeClassNames(slotClassName, className)} {...props}>
      {children}
    </span>
  );
});

const SwitchState = forwardRef<HTMLSpanElement, SwitchStateProps>(function SwitchState(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e5 ?? {};

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(slotClassName, className)}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </span>
  );
});

const SwitchIcon = forwardRef<HTMLSpanElement, SwitchIconProps>(function SwitchIcon(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e6 ?? {};

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(slotClassName, className)}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </span>
  );
});

export const HeadlessSwitch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
  Label: SwitchLabel,
  State: SwitchState,
  Icon: SwitchIcon
});

export default HeadlessSwitch;
