import './HeadlessSwitch.structural.css';
import { stateActivator as cn } from '@kiskadee/core';
import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
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
import { useCheckedState } from '../../hooks/checked-state/useCheckedState.ts';

export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export type SwitchStateName =
  | 'checked'
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
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
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
  checked: boolean;
  focused: boolean;
  focusVisible: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}): string | undefined {
  const highlightedFocus = states.focused && states.focusVisible;
  const hasProjectedState = states.checked || states.focused || states.disabled || states.readOnly;

  return mergeClassNames(
    cn.interactive,
    states.checked && cn.selected,
    states.focused && cn.focus,
    highlightedFocus && cn.focusVisible,
    states.disabled && cn.disabled,
    states.readOnly && cn.readOnly,
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
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    disabled,
    readOnly,
    required,
    name,
    value,
    ...rootProps
  },
  ref
) {
  const generatedId = useId();
  const resolvedInputId = inputId ?? `switch-${generatedId}`;
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const { checked, setChecked } = useCheckedState({
    checked: checkedProp,
    defaultChecked,
    disabled,
    readOnly,
    onCheckedChange
  });

  const slotProps = useMemo<SwitchSlotProps>(() => {
    const stateClassName = switchStateClassName({
      checked,
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
      }
    };
  }, [checked, classNames, disabled, focused, focusVisible, readOnly]);

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
      if (readOnly) {
        event.preventDefault();
        onChange?.(event);
        return;
      }

      setChecked(event.currentTarget.checked);
      onChange?.(event);
    },
    [onChange, readOnly, setChecked]
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
      >
        <input
          {...restInputProps}
          ref={(node) => {
            assignRef(inputRef, node);
          }}
          id={resolvedInputId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          value={value}
          aria-checked={checked}
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

export const HeadlessSwitch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
  Label: SwitchLabel,
  State: SwitchState
});

export default HeadlessSwitch;
