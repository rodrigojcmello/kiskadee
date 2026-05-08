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
import { useCheckedState } from '../checked-state/useCheckedState.ts';
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

export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type SwitchStateName = 'checked' | 'focused' | 'disabled' | 'readOnly' | 'required';

export type SwitchClassNames = Partial<Record<SwitchElementName, string>>;

export type SwitchStateProjectionOptions = Omit<
  UseStateProjectionOptions<SwitchElementName, SwitchStateName>,
  'classNames' | 'states' | 'target'
> & {
  target?: SwitchElementName;
};

type SwitchProjectionStates = Partial<Record<SwitchStateName, StateProjectionStateValue>>;
type SwitchSlotProps = StateProjectionSlotProps<SwitchElementName>;

type SwitchRootLabelProps = Omit<
  ComponentPropsWithoutRef<'label'>,
  'children' | 'className' | 'htmlFor'
>;

export type SwitchRootProps = SwitchRootLabelProps & {
  children?: ReactNode;
  classNames?: SwitchClassNames;
  stateProjection?: SwitchStateProjectionOptions;
  inputId?: string;
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

type SwitchContextValue = {
  slotProps: SwitchSlotProps;
  inputId: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
  required: boolean | undefined;
  name: string | undefined;
  value: string | undefined;
  focused: boolean;
  setFocused: (focused: boolean) => void;
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

const switchDataAttributeProjections = {
  checked: {
    attribute: 'data-checked'
  },
  focused: {
    attribute: 'data-focused'
  },
  disabled: {
    attribute: 'data-disabled'
  },
  readOnly: {
    attribute: 'data-readonly'
  },
  required: {
    attribute: 'data-required'
  }
} satisfies Partial<
  Record<SwitchStateName, StateProjectionRule<SwitchElementName, SwitchStateName>>
>;

const SwitchRoot = forwardRef<HTMLLabelElement, SwitchRootProps>(function SwitchRoot(
  {
    children,
    classNames = {},
    stateProjection,
    inputId,
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
  const { target: stateProjectionTarget = 'e1', ...stateProjectionOptions } = stateProjection ?? {};
  const { checked, setChecked } = useCheckedState({
    checked: checkedProp,
    defaultChecked,
    disabled,
    readOnly,
    onCheckedChange
  });

  const projectionStates = useMemo<SwitchProjectionStates>(
    () => ({
      checked,
      focused,
      disabled,
      readOnly,
      required
    }),
    [checked, disabled, focused, readOnly, required]
  );

  const projectedSlotProps = useStateProjection<SwitchElementName, SwitchStateName>({
    ...stateProjectionOptions,
    classNames,
    states: projectionStates,
    target: stateProjectionTarget
  });

  const rootDataSlotProps = useStateProjection<SwitchElementName, SwitchStateName>({
    states: projectionStates,
    target: 'e1',
    projections: switchDataAttributeProjections
  });

  const trackDataSlotProps = useStateProjection<SwitchElementName, SwitchStateName>({
    states: projectionStates,
    target: 'e3',
    projections: switchDataAttributeProjections
  });

  const slotProps = useMemo<SwitchSlotProps>(
    () =>
      mergeStateProjectionSlotProps(
        projectedSlotProps.slotProps,
        rootDataSlotProps.slotProps,
        trackDataSlotProps.slotProps
      ),
    [projectedSlotProps.slotProps, rootDataSlotProps.slotProps, trackDataSlotProps.slotProps]
  );

  const contextValue = useMemo<SwitchContextValue>(
    () => ({
      slotProps,
      inputId: resolvedInputId,
      checked,
      setChecked,
      disabled,
      readOnly,
      required,
      name,
      value,
      focused,
      setFocused
    }),
    [
      checked,
      disabled,
      focused,
      name,
      readOnly,
      required,
      resolvedInputId,
      setChecked,
      slotProps,
      value
    ]
  );
  const { className: rootClassName, ...rootSlotProps } = slotProps.e1 ?? {};

  return (
    <SwitchContext.Provider value={contextValue}>
      <label
        {...rootSlotProps}
        ref={ref}
        htmlFor={resolvedInputId}
        className={rootClassName}
        {...rootProps}
      >
        {children}
      </label>
    </SwitchContext.Provider>
  );
});

const SwitchInput = forwardRef<HTMLInputElement, SwitchInputProps>(function SwitchInput(
  { className, onBlur, onChange, onFocus, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e2 ?? {};

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (context.readOnly) {
        event.preventDefault();
        onChange?.(event);
        return;
      }

      context.setChecked(event.currentTarget.checked);
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
        assignRef(ref, node);
      }}
      id={context.inputId}
      type="checkbox"
      role="switch"
      checked={context.checked}
      disabled={context.disabled}
      readOnly={context.readOnly}
      required={context.required}
      name={context.name}
      value={context.value}
      aria-checked={context.checked}
      aria-readonly={context.readOnly || undefined}
      className={mergeClassNames(slotClassName, className)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
});

const SwitchTrack = forwardRef<HTMLSpanElement, SwitchTrackProps>(function SwitchTrack(
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

const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(function SwitchThumb(
  { className, children, 'aria-hidden': ariaHidden = true, ...props },
  ref
) {
  const context = useSwitchContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e4 ?? {};

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
  const { className: slotClassName, ...slotProps } = context.slotProps.e5 ?? {};

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
  Input: SwitchInput,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
  Label: SwitchLabel,
  State: SwitchState
});

export default HeadlessSwitch;
