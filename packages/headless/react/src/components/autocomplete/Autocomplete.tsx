import type { Placement } from '@floating-ui/react';
import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import { type AnchoredOverlayWidth, useAnchoredOverlay } from '../../internal/anchored-overlay.tsx';
import {
  assertUniqueCollectionKeys,
  type CollectionItem,
  getAdjacentCollectionKey,
  getFirstEnabledCollectionKey,
  getLastEnabledCollectionKey
} from '../../internal/collection.ts';
import { useControllableState } from '../../internal/controllable-state.ts';

export type AutocompleteOption = {
  value: string;
  textValue: string;
  disabled?: boolean;
  content?: ReactNode;
};

export type AutocompleteOpenChangeReason =
  | 'focus'
  | 'input'
  | 'keyboard'
  | 'selection'
  | 'escape'
  | 'outside-press'
  | 'programmatic';

export type AutocompleteOpenChangeDetails = {
  reason: AutocompleteOpenChangeReason;
  event?: Event;
};

export type AutocompleteInputValueChangeDetails = {
  reason: 'input' | 'selection';
  event?: Event;
};

export type AutocompleteRootProps = {
  children: ReactNode;
  options: readonly AutocompleteOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string, details: AutocompleteInputValueChangeDetails) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: AutocompleteOpenChangeDetails) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export type AutocompleteInputRenderProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'defaultValue' | 'value'
> & {
  ref: Ref<HTMLInputElement>;
  value: string;
};

export type AutocompleteInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'children' | 'defaultValue' | 'value'
> & {
  render?: (
    props: AutocompleteInputRenderProps,
    state: { open: boolean; activeValue?: string; selectedValue?: string }
  ) => ReactElement;
};

export type AutocompleteContentProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children?: ReactNode;
  placement?: Placement;
  offset?: number;
  collisionPadding?: number;
  portalled?: boolean;
  portalContainer?: HTMLElement | null;
  width?: AnchoredOverlayWidth;
  forceMount?: boolean;
  render?: (
    props: AutocompleteContentRenderProps,
    state: AutocompleteContentRenderState
  ) => ReactElement;
};

export type AutocompleteContentRenderState = {
  open: boolean;
  positioned: boolean;
  availableHeight: number;
  availableWidth: number;
  placement: Placement;
  activeValue?: string;
};

export type AutocompleteContentRenderProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  ref: Ref<HTMLDivElement>;
  children?: ReactNode;
  'data-open'?: true;
  'data-closed'?: true;
  'data-placement': Placement;
  'data-width': AnchoredOverlayWidth;
};

export type AutocompleteOptionRenderProps = ComponentPropsWithoutRef<'div'> & {
  ref: Ref<HTMLDivElement>;
  'data-active'?: true;
  'data-disabled'?: true;
  'data-text-value'?: string;
};

export type AutocompleteOptionProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  value: string;
  textValue?: string;
  disabled?: boolean;
  children?: ReactNode;
  render?: (
    props: AutocompleteOptionRenderProps,
    state: { active: boolean; selected: boolean; disabled: boolean }
  ) => ReactElement;
};

export type AutocompleteEmptyProps = ComponentPropsWithoutRef<'div'>;

type AutocompleteContextValue = {
  open: boolean;
  setOpen: (open: boolean, details: AutocompleteOpenChangeDetails) => void;
  selectedValue: string | undefined;
  selectValue: (value: string, event?: Event) => void;
  inputValue: string;
  setInputValue: (value: string, details: AutocompleteInputValueChangeDetails) => void;
  activeKey: string | undefined;
  setActiveKey: (value: string | undefined) => void;
  options: readonly AutocompleteOption[];
  items: readonly CollectionItem<string, AutocompleteOption>[];
  disabled: boolean;
  baseId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  optionRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  inputElement: HTMLInputElement | null;
  setInputElement: (element: HTMLInputElement | null) => void;
};

const AutocompleteContext = createContext<AutocompleteContextValue | null>(null);

function useAutocompleteContext(componentName: string): AutocompleteContextValue {
  const context = useContext(AutocompleteContext);
  if (!context) throw new Error(`${componentName} must be used within Autocomplete.Root`);
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function optionId(baseId: string, value: string): string {
  return `${baseId}-option-${encodeURIComponent(value)}`;
}

function AutocompleteRoot({
  children,
  options,
  value,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue = '',
  onInputValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  idPrefix
}: AutocompleteRootProps) {
  const generatedId = useId();
  const baseId = idPrefix ?? `autocomplete-${generatedId}`;
  const [selectedValue, setSelectedValue] = useControllableState<string | undefined>({
    value,
    defaultValue
  });
  const [inputValue, setInputValueState] = useControllableState({
    value: inputValueProp,
    defaultValue: defaultInputValue
  });
  const [open, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen
  });
  const [activeKey, setActiveKey] = useState<string>();
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const items = useMemo<CollectionItem<string, AutocompleteOption>[]>(
    () =>
      options.map((option) => ({
        key: option.value,
        disabled: option.disabled,
        textValue: option.textValue,
        data: option
      })),
    [options]
  );
  const setOpen = useCallback(
    (nextOpen: boolean, details: AutocompleteOpenChangeDetails) => {
      if (disabled && nextOpen) return;
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
      if (!nextOpen) setActiveKey(undefined);
    },
    [disabled, onOpenChange, setOpenState]
  );
  const setInputValue = useCallback(
    (nextValue: string, details: AutocompleteInputValueChangeDetails) => {
      setInputValueState(nextValue);
      onInputValueChange?.(nextValue, details);
    },
    [onInputValueChange, setInputValueState]
  );
  const selectValue = useCallback(
    (nextValue: string, event?: Event) => {
      const option = options.find((candidate) => candidate.value === nextValue);
      if (!option || option.disabled) return;
      setSelectedValue(nextValue);
      onValueChange?.(nextValue);
      setInputValue(option.textValue, { reason: 'selection', event });
      setOpen(false, { reason: 'selection', event });
      inputRef.current?.focus();
    },
    [onValueChange, options, setInputValue, setOpen, setSelectedValue]
  );

  useEffect(() => assertUniqueCollectionKeys(items, 'Autocomplete'), [items]);
  useEffect(() => {
    if (!open) return;
    const selected = items.find((item) => item.key === selectedValue && !item.disabled);
    setActiveKey(selected?.key ?? getFirstEnabledCollectionKey(items));
  }, [items, open, selectedValue]);
  useEffect(() => {
    if (!open || !activeKey) return;
    optionRefs.current.get(activeKey)?.scrollIntoView({ block: 'nearest' });
  }, [activeKey, open]);

  const contextValue = useMemo<AutocompleteContextValue>(
    () => ({
      open,
      setOpen,
      selectedValue,
      selectValue,
      inputValue,
      setInputValue,
      activeKey,
      setActiveKey,
      options,
      items,
      disabled,
      baseId,
      inputRef,
      optionRefs,
      inputElement,
      setInputElement
    }),
    [
      activeKey,
      baseId,
      disabled,
      inputElement,
      inputValue,
      items,
      open,
      options,
      selectValue,
      selectedValue,
      setInputValue,
      setOpen
    ]
  );

  return (
    <AutocompleteContext.Provider value={contextValue}>{children}</AutocompleteContext.Provider>
  );
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  function AutocompleteInput(
    { render, onBlur, onChange, onFocus, onKeyDown, id, autoComplete = 'off', ...props },
    forwardedRef
  ) {
    const {
      open,
      setOpen,
      selectedValue,
      selectValue,
      inputValue,
      setInputValue,
      activeKey,
      setActiveKey,
      items,
      disabled,
      baseId,
      inputRef,
      setInputElement
    } = useAutocompleteContext('Autocomplete.Input');
    const ref = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        setInputElement(node);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, inputRef, setInputElement]
    );
    const handleFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        onFocus?.(event);
        if (!event.defaultPrevented && !disabled) {
          setOpen(true, { reason: 'focus', event: event.nativeEvent });
        }
      },
      [disabled, onFocus, setOpen]
    );
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        if (event.defaultPrevented || disabled) return;
        setInputValue(event.currentTarget.value, { reason: 'input', event: event.nativeEvent });
        setOpen(true, { reason: 'input', event: event.nativeEvent });
        setActiveKey(getFirstEnabledCollectionKey(items));
      },
      [disabled, items, onChange, setActiveKey, setInputValue, setOpen]
    );
    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        if (!event.defaultPrevented && open) {
          setOpen(false, { reason: 'programmatic', event: event.nativeEvent });
        }
      },
      [onBlur, open, setOpen]
    );
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!open) setOpen(true, { reason: 'keyboard', event: event.nativeEvent });
          setActiveKey(
            getAdjacentCollectionKey(items, activeKey, event.key === 'ArrowDown' ? 1 : -1, true)
          );
        } else if (event.key === 'Home' && open) {
          event.preventDefault();
          setActiveKey(getFirstEnabledCollectionKey(items));
        } else if (event.key === 'End' && open) {
          event.preventDefault();
          setActiveKey(getLastEnabledCollectionKey(items));
        } else if (event.key === 'Enter' && open && activeKey) {
          event.preventDefault();
          selectValue(activeKey, event.nativeEvent);
        } else if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false, { reason: 'escape', event: event.nativeEvent });
        }
      },
      [activeKey, disabled, items, onKeyDown, open, selectValue, setActiveKey, setOpen]
    );
    const inputProps: AutocompleteInputRenderProps = {
      ...props,
      ref,
      id: id ?? `${baseId}-input`,
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-expanded': open,
      'aria-controls': `${baseId}-listbox`,
      'aria-activedescendant': open && activeKey ? optionId(baseId, activeKey) : undefined,
      autoComplete,
      disabled,
      value: inputValue,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onChange: handleChange,
      onKeyDown: handleKeyDown
    };

    if (render) return render(inputProps, { open, activeValue: activeKey, selectedValue });
    const { ref: nativeRef, ...nativeInputProps } = inputProps;
    return <input {...nativeInputProps} ref={nativeRef} />;
  }
);

const AutocompleteContent = forwardRef<HTMLDivElement, AutocompleteContentProps>(
  function AutocompleteContent(
    {
      children,
      placement = 'bottom-start',
      offset = 6,
      collisionPadding = 8,
      portalled = true,
      portalContainer,
      width = 'min-anchor',
      forceMount = false,
      render,
      id,
      style,
      ...props
    },
    forwardedRef
  ) {
    const { open, setOpen, options, activeKey, baseId, inputElement, inputRef } =
      useAutocompleteContext('Autocomplete.Content');
    const overlay = useAnchoredOverlay({
      open,
      referenceElement: inputElement,
      placement,
      offset,
      collisionPadding,
      portalled,
      portalContainer,
      width,
      onDismiss: (details) => {
        setOpen(false, { reason: details.reason, event: details.event });
        if (details.reason === 'escape') inputRef.current?.focus();
      }
    });
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        overlay.floatingRef(node);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, overlay]
    );

    if (!open && !forceMount) return null;
    const childrenContent =
      children ??
      options.map((option) => (
        <AutocompleteOptionComponent
          key={option.value}
          value={option.value}
          textValue={option.textValue}
          disabled={option.disabled}
        >
          {option.content ?? option.textValue}
        </AutocompleteOptionComponent>
      ));
    const floatingProps = overlay.getFloatingProps(
      props as HTMLProps<HTMLElement>
    ) as unknown as ComponentPropsWithoutRef<'div'>;
    const renderProps: AutocompleteContentRenderProps = {
      ...floatingProps,
      ref,
      id: id ?? `${baseId}-listbox`,
      role: 'listbox',
      'aria-labelledby': inputElement?.id || `${baseId}-input`,
      'aria-hidden': open ? props['aria-hidden'] : true,
      inert: open ? props.inert : true,
      'data-open': open || undefined,
      'data-closed': !open || undefined,
      'data-placement': overlay.placement,
      'data-width': width,
      style: { ...overlay.floatingStyles, ...style },
      children: childrenContent
    };
    const state: AutocompleteContentRenderState = {
      open,
      positioned: overlay.positioned,
      availableHeight: overlay.availableHeight,
      availableWidth: overlay.availableWidth,
      placement: overlay.placement,
      activeValue: activeKey
    };
    if (render) return overlay.renderFloating(render(renderProps, state));

    const { ref: contentRef, ...nativeContentProps } = renderProps;
    const content = <div {...nativeContentProps} ref={contentRef} />;

    return overlay.renderFloating(content);
  }
);

const AutocompleteOptionComponent = forwardRef<HTMLDivElement, AutocompleteOptionProps>(
  function AutocompleteOptionComponent(
    {
      value,
      textValue,
      disabled: disabledProp,
      children,
      render,
      onMouseDown,
      onMouseEnter,
      ...props
    },
    forwardedRef
  ) {
    const { selectedValue, selectValue, activeKey, setActiveKey, options, baseId, optionRefs } =
      useAutocompleteContext('Autocomplete.Option');
    const option = options.find((candidate) => candidate.value === value);
    const disabled = option ? (option.disabled ?? false) : (disabledProp ?? false);
    const active = activeKey === value;
    const selected = selectedValue === value;
    const resolvedTextValue = textValue ?? option?.textValue ?? value;

    useEffect(() => {
      if (
        (
          globalThis as typeof globalThis & {
            process?: { env?: { NODE_ENV?: string } };
          }
        ).process?.env?.NODE_ENV !== 'production' &&
        disabledProp !== undefined &&
        option !== undefined &&
        disabledProp !== (option.disabled ?? false)
      ) {
        console.warn(
          `[Kiskadee] Autocomplete.Option "${value}" disabled state differs from Root.options metadata. Root.options wins for keyboard navigation.`
        );
      }
    }, [disabledProp, option, value]);
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) optionRefs.current.set(value, node);
        else optionRefs.current.delete(value);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, optionRefs, value]
    );
    const handleMouseDown = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseDown?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (!disabled) selectValue(value, event.nativeEvent);
      },
      [disabled, onMouseDown, selectValue, value]
    );
    const handleMouseEnter = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented && !disabled) setActiveKey(value);
      },
      [disabled, onMouseEnter, setActiveKey, value]
    );
    const optionProps: AutocompleteOptionRenderProps = {
      ...props,
      ref,
      id: optionId(baseId, value),
      role: 'option',
      'aria-selected': selected,
      'aria-disabled': disabled || undefined,
      'data-active': active || undefined,
      'data-disabled': disabled || undefined,
      'data-text-value': resolvedTextValue,
      onMouseDown: handleMouseDown,
      onMouseEnter: handleMouseEnter
    };

    if (render) return render(optionProps, { active, selected, disabled });
    const { ref: nativeRef, ...nativeOptionProps } = optionProps;
    return (
      <div {...nativeOptionProps} ref={nativeRef}>
        {children}
      </div>
    );
  }
);

const AutocompleteEmpty = forwardRef<HTMLDivElement, AutocompleteEmptyProps>(
  function AutocompleteEmpty(props, forwardedRef) {
    return <div {...props} ref={forwardedRef} role="status" />;
  }
);

export const Autocomplete = {
  Root: AutocompleteRoot,
  Input: AutocompleteInput,
  Content: AutocompleteContent,
  Option: AutocompleteOptionComponent,
  Empty: AutocompleteEmpty
};
