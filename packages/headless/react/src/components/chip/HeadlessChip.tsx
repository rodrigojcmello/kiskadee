import { stateActivator as cn } from '@kiskadee/core';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useContext,
  useMemo
} from 'react';
import { useControlState } from '../../hooks/control-state/useControlState.ts';

declare const process: { env: { NODE_ENV?: string } };

type ChipContextValue = {
  disabled: boolean;
};

const ChipContext = createContext<ChipContextValue | undefined>(undefined);

function join(...parts: Array<string | undefined | false>): string | undefined {
  const value = parts.filter(Boolean).join(' ').trim();
  return value.length > 0 ? value : undefined;
}

function useChipContext(part: string): ChipContextValue {
  const value = useContext(ChipContext);
  if (!value) throw new Error(`HeadlessChip.${part} must be rendered inside HeadlessChip.Root.`);
  return value;
}

export type HeadlessChipRootProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: ReactNode;
  disabled?: boolean;
};

export type HeadlessChipContentProps = HTMLAttributes<HTMLSpanElement>;

export type HeadlessChipSelectProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-pressed' | 'children'
> & {
  children?: ReactNode | ((state: { controlState: boolean }) => ReactNode);
  controlState?: boolean;
  defaultControlState?: boolean;
  onControlStateChange?: (controlState: boolean) => void;
};

export type HeadlessChipRemoveProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const Content = forwardRef<HTMLSpanElement, HeadlessChipContentProps>(
  function HeadlessChipContent(props, ref) {
    useChipContext('Content');
    return <span {...props} ref={ref} />;
  }
);

const Select = forwardRef<HTMLButtonElement, HeadlessChipSelectProps>(function HeadlessChipSelect(
  {
    controlState,
    defaultControlState,
    disabled: disabledProp,
    onClick,
    onControlStateChange,
    type = 'button',
    className,
    ...props
  },
  ref
) {
  const root = useChipContext('Select');
  const disabled = root.disabled || Boolean(disabledProp);
  const control = useControlState({
    controlState,
    defaultControlState,
    disabled,
    onControlStateChange
  });

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-pressed={control.controlState}
      data-selected={control.controlState ? '' : undefined}
      className={join(
        className,
        cn.interactive,
        !disabled && cn.nativeInteraction,
        control.controlState && cn.selected,
        disabled && cn.disabled,
        (control.controlState || disabled) && cn.activator
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) control.toggle();
      }}
    >
      {typeof props.children === 'function'
        ? props.children({ controlState: control.controlState })
        : props.children}
    </button>
  );
});

const Remove = forwardRef<HTMLButtonElement, HeadlessChipRemoveProps>(function HeadlessChipRemove(
  { className, disabled: disabledProp, onClick, onRemove, type = 'button', ...props },
  ref
) {
  const root = useChipContext('Remove');
  const disabled = root.disabled || Boolean(disabledProp);

  if (process.env.NODE_ENV !== 'production' && !props['aria-label'] && !props['aria-labelledby']) {
    console.warn('[Kiskadee] HeadlessChip.Remove requires aria-label or aria-labelledby.');
  }

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      className={join(
        className,
        cn.interactive,
        !disabled && cn.nativeInteraction,
        disabled && cn.disabled,
        disabled && cn.activator
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onRemove?.(event);
      }}
    />
  );
});

const Root = forwardRef<HTMLSpanElement, HeadlessChipRootProps>(function HeadlessChipRoot(
  { children, disabled = false, ...props },
  ref
) {
  const context = useMemo(() => ({ disabled }), [disabled]);

  return (
    <ChipContext.Provider value={context}>
      <span {...props} ref={ref} data-disabled={disabled ? '' : undefined}>
        {children}
      </span>
    </ChipContext.Provider>
  );
});

export const HeadlessChip = { Root, Content, Select, Remove } as const;
