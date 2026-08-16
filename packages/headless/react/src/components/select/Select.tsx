import type { Placement } from '@floating-ui/react';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  Dispatch,
  KeyboardEvent,
  ReactElement,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  RefAttributes,
  SetStateAction
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
import {
  type AnchoredOverlayDismissDetails,
  type AnchoredOverlayWidth,
  useAnchoredOverlay
} from '../../internal/anchored-overlay.tsx';
import {
  assertUniqueCollectionKeys,
  type CollectionItem,
  findCollectionKeyByPrefix,
  getAdjacentCollectionKey,
  getFirstEnabledCollectionKey,
  getLastEnabledCollectionKey
} from '../../internal/collection.ts';
import { useControllableState } from '../../internal/controllable-state.ts';

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  textValue?: string;
};

export type SelectOpenChangeReason =
  | 'trigger'
  | 'keyboard'
  | 'selection'
  | 'escape'
  | 'outside-press'
  | 'programmatic';

export type SelectOpenChangeDetails = {
  reason: SelectOpenChangeReason;
  event?: Event;
};

type SelectRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type SelectProps = SelectRootDivProps & {
  children: ReactNode;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: SelectOpenChangeDetails) => void;
  disabled?: boolean;
  placeholder?: string;
  idPrefix?: string;
  classNames?: Partial<
    Record<'e1' | 'e2' | 'e3' | 'e4' | 'e4a' | 'e4d' | 'e5' | 'e6' | 'e7', string>
  >;
};

export type SelectTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  children?: ReactNode;
  render?: (
    props: SelectTriggerRenderProps,
    state: { open: boolean; selectedValue?: string }
  ) => ReactElement;
};

export type SelectTriggerRenderProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  ref: Ref<HTMLButtonElement>;
  children?: ReactNode;
};

type SelectContentBehaviorProps = {
  children?: ReactNode;
  forceMount?: boolean;
  portalled?: boolean;
  offset?: number;
  collisionPadding?: number;
  placement?: Placement;
  portalContainer?: HTMLElement | null;
  width?: AnchoredOverlayWidth;
};

type SelectDefaultContentProps = Omit<ComponentPropsWithoutRef<'ul'>, 'children'> &
  SelectContentBehaviorProps & {
    render?: never;
  };

type SelectRenderedContentProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> &
  SelectContentBehaviorProps & {
    render: (props: SelectContentRenderProps, state: SelectContentRenderState) => ReactElement;
  };

export type SelectContentProps = SelectDefaultContentProps | SelectRenderedContentProps;

export type SelectContentRenderState = {
  open: boolean;
  positioned: boolean;
  activeValue?: string;
  placement: Placement;
};

export type SelectContentRenderProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  ref: Ref<HTMLDivElement>;
  children?: ReactNode;
  'data-open'?: true;
  'data-closed'?: true;
  'data-placement'?: Placement;
  'data-width'?: AnchoredOverlayWidth;
};

type SelectContentComponent = {
  (props: SelectDefaultContentProps & RefAttributes<HTMLUListElement>): ReactElement | null;
  (props: SelectRenderedContentProps & RefAttributes<HTMLDivElement>): ReactElement | null;
};

export type SelectOptionProps = Omit<ComponentPropsWithoutRef<'li'>, 'children' | 'value'> & {
  value: string;
  children?: ReactNode;
  disabled?: boolean;
  textValue?: string;
  render?: (
    props: SelectOptionRenderProps,
    state: { active: boolean; selected: boolean; disabled: boolean }
  ) => ReactElement;
};

export type SelectOptionRenderProps = Omit<ComponentPropsWithoutRef<'li'>, 'children'> & {
  ref: Ref<HTMLElement>;
  children?: ReactNode;
  'data-focused'?: true;
  'data-selected'?: true;
  'data-disabled'?: true;
  'data-text-value'?: string;
};

export type SelectLabelProps = ComponentPropsWithoutRef<'span'>;

export type SelectStepProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'className' | 'type'
> & {
  children?: ReactNode;
  className?: string;
};

type SelectContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean, details: SelectOpenChangeDetails) => void;
  selected: string | undefined;
  setSelected: (value: string) => void;
  options: SelectOption[];
  items: CollectionItem<string, SelectOption>[];
  activeKey: string | undefined;
  setActiveKey: (key: string | undefined) => void;
  disabled: boolean;
  placeholder: string;
  baseId: string;
  labelId?: string;
  setLabelId: Dispatch<SetStateAction<string | undefined>>;
  classNames?: SelectProps['classNames'];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  listRef: React.RefObject<HTMLElement | null>;
  optionRefs: React.MutableRefObject<Map<string, HTMLElement>>;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Select components must be used within a Select.Root');
  return context;
}

function optionId(baseId: string, value: string): string {
  return `${baseId}-option-${encodeURIComponent(value)}`;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function SelectRoot({
  children,
  options,
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  placeholder = 'Select an option',
  idPrefix,
  classNames,
  ...rootDivProps
}: SelectProps) {
  const internalId = useId();
  const baseId = idPrefix ?? `select-${internalId}`;
  const [labelId, setLabelId] = useState<string | undefined>();
  const [selected, setSelectedState] = useControllableState<string | undefined>({
    value,
    defaultValue
  });
  const [isOpen, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen
  });
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const optionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const items = useMemo<CollectionItem<string, SelectOption>[]>(
    () =>
      options.map((option) => ({
        key: option.value,
        disabled: option.disabled,
        textValue:
          option.textValue ?? (typeof option.label === 'string' ? option.label : option.value),
        data: option
      })),
    [options]
  );
  const setIsOpen = useCallback(
    (nextOpen: boolean, details: SelectOpenChangeDetails) => {
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
    },
    [onOpenChange, setOpenState]
  );
  const setSelected = useCallback(
    (nextValue: string) => {
      setSelectedState(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, setSelectedState]
  );

  useEffect(() => assertUniqueCollectionKeys(items, 'Select'), [items]);

  useEffect(() => {
    if (!isOpen) return;
    const selectedItem = items.find((item) => item.key === selected && !item.disabled);
    setActiveKey(selectedItem?.key ?? getFirstEnabledCollectionKey(items));
  }, [isOpen, items, selected]);

  useEffect(() => {
    if (!isOpen || !activeKey) return;
    optionRefs.current.get(activeKey)?.scrollIntoView({ block: 'nearest' });
  }, [activeKey, isOpen]);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      selected,
      setSelected,
      options,
      items,
      activeKey,
      setActiveKey,
      disabled,
      placeholder,
      baseId,
      labelId,
      setLabelId,
      classNames,
      triggerRef,
      listRef,
      optionRefs
    }),
    [
      activeKey,
      baseId,
      classNames,
      disabled,
      isOpen,
      items,
      labelId,
      options,
      placeholder,
      selected,
      setIsOpen,
      setSelected
    ]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={classNames?.e1} {...rootDivProps}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { children, className, onClick, onKeyDown, render, ...props },
  forwardedRef
) {
  const {
    isOpen,
    setIsOpen,
    selected,
    setSelected,
    options,
    items,
    activeKey,
    setActiveKey,
    disabled,
    placeholder,
    baseId,
    labelId,
    classNames,
    triggerRef
  } = useSelectContext();
  const searchBuffer = useRef('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selectedOption = options.find((option) => option.value === selected);
  const triggerClassName = className ?? classNames?.e2;

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  const runTypeahead = useCallback(
    (character: string) => {
      clearTimeout(searchTimeout.current);
      searchBuffer.current += character.toLocaleLowerCase();
      const match = findCollectionKeyByPrefix(items, searchBuffer.current, activeKey);
      if (match) {
        if (isOpen) setActiveKey(match);
        else setSelected(match);
      }
      searchTimeout.current = setTimeout(() => {
        searchBuffer.current = '';
      }, 500);
    },
    [activeKey, isOpen, items, setActiveKey, setSelected]
  );

  const commitActive = useCallback(() => {
    const item = items.find((candidate) => candidate.key === activeKey);
    if (!item || item.disabled) return;
    setSelected(item.key);
    setIsOpen(false, { reason: 'selection' });
    triggerRef.current?.focus();
  }, [activeKey, items, setIsOpen, setSelected, triggerRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen) commitActive();
          else setIsOpen(true, { reason: 'keyboard', event: event.nativeEvent });
          break;
        case 'ArrowDown':
        case 'ArrowUp': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true, { reason: 'keyboard', event: event.nativeEvent });
          } else {
            setActiveKey(
              getAdjacentCollectionKey(items, activeKey, event.key === 'ArrowDown' ? 1 : -1, true)
            );
          }
          break;
        }
        case 'Home':
          if (isOpen) {
            event.preventDefault();
            setActiveKey(getFirstEnabledCollectionKey(items));
          }
          break;
        case 'End':
          if (isOpen) {
            event.preventDefault();
            setActiveKey(getLastEnabledCollectionKey(items));
          }
          break;
        case 'Escape':
          if (isOpen) {
            event.preventDefault();
            event.stopPropagation();
            setIsOpen(false, { reason: 'escape', event: event.nativeEvent });
          }
          break;
        case 'Tab':
          if (isOpen) setIsOpen(false, { reason: 'keyboard', event: event.nativeEvent });
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
            runTypeahead(event.key);
          }
      }
    },
    [
      activeKey,
      commitActive,
      disabled,
      isOpen,
      items,
      onKeyDown,
      runTypeahead,
      setActiveKey,
      setIsOpen
    ]
  );
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        setIsOpen(!isOpen, { reason: 'trigger', event: event.nativeEvent });
      }
    },
    [disabled, isOpen, onClick, setIsOpen]
  );
  const ref = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef, triggerRef]
  );

  const triggerProps: SelectTriggerRenderProps = {
    ...props,
    ref,
    id: `${baseId}-trigger`,
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-expanded': isOpen,
    'aria-controls': `${baseId}-listbox`,
    'aria-activedescendant': isOpen && activeKey ? optionId(baseId, activeKey) : undefined,
    'aria-labelledby': labelId ? `${labelId} ${baseId}-trigger` : `${baseId}-trigger`,
    'aria-disabled': disabled || undefined,
    disabled,
    className: triggerClassName,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    children: children ?? selectedOption?.label ?? placeholder
  };

  if (render) return render(triggerProps, { open: isOpen, selectedValue: selected });
  const { ref: nativeRef, ...nativeTriggerProps } = triggerProps;
  return <button {...nativeTriggerProps} ref={nativeRef} type="button" />;
});

function SelectStep({
  'aria-label': ariaLabel,
  children,
  className,
  disabled: disabledProp,
  onClick,
  direction,
  ...buttonProps
}: SelectStepProps & { direction: -1 | 1 }) {
  const { selected, setSelected, items, disabled, classNames } = useSelectContext();
  const adjacentKey = getAdjacentCollectionKey(items, selected, direction, false);
  const isDisabled = disabled || disabledProp || adjacentKey === undefined;
  const resolvedClassName = className ?? (direction === -1 ? classNames?.e6 : classNames?.e7);
  const resolvedLabel = ariaLabel ?? (direction === -1 ? 'Previous option' : 'Next option');
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !isDisabled && adjacentKey) setSelected(adjacentKey);
    },
    [adjacentKey, isDisabled, onClick, setSelected]
  );

  return (
    <button
      {...buttonProps}
      type="button"
      aria-label={resolvedLabel}
      className={resolvedClassName}
      data-direction={direction === -1 ? 'previous' : 'next'}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function SelectPrevious(props: SelectStepProps) {
  return <SelectStep {...props} direction={-1} />;
}

function SelectNext(props: SelectStepProps) {
  return <SelectStep {...props} direction={1} />;
}

function SelectLabel({ children, className, id, ...props }: SelectLabelProps) {
  const { baseId, setLabelId, classNames } = useSelectContext();
  const resolvedId = id ?? `${baseId}-label`;

  useEffect(() => {
    setLabelId(resolvedId);
    return () => setLabelId((current) => (current === resolvedId ? undefined : current));
  }, [resolvedId, setLabelId]);

  return (
    <span {...props} id={resolvedId} className={className ?? classNames?.e5}>
      {children}
    </span>
  );
}

const SelectContentImplementation = forwardRef<HTMLElement, SelectContentProps>(
  function SelectContent(
    {
      children,
      className,
      forceMount = false,
      portalled = false,
      offset = 8,
      collisionPadding = 8,
      placement = 'bottom-start',
      portalContainer,
      width = 'content',
      render,
      style,
      ...props
    },
    forwardedRef
  ) {
    const { isOpen, setIsOpen, options, activeKey, baseId, classNames, listRef, triggerRef } =
      useSelectContext();
    const handleDismiss = useCallback(
      (details: AnchoredOverlayDismissDetails) => {
        setIsOpen(false, { reason: details.reason, event: details.event });
        if (details.reason === 'escape') triggerRef.current?.focus();
      },
      [setIsOpen, triggerRef]
    );
    const overlay = useAnchoredOverlay({
      open: isOpen,
      referenceElement: triggerRef.current,
      placement,
      offset,
      collisionPadding,
      portalled,
      portalContainer,
      width,
      onDismiss: handleDismiss
    });
    const contentRef = useCallback(
      (node: HTMLElement | null) => {
        listRef.current = node;
        overlay.floatingRef(node);
        assignRef(forwardedRef, node);
      },
      [forwardedRef, listRef, overlay]
    );
    if (!isOpen && !forceMount) return null;

    const resolvedChildren =
      children ??
      options.map((option) => (
        <SelectOption
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          textValue={option.textValue}
        >
          {option.label}
        </SelectOption>
      ));
    const sharedProps = {
      id: `${baseId}-listbox`,
      role: 'listbox' as const,
      'aria-labelledby': `${baseId}-trigger`,
      'aria-hidden': isOpen ? undefined : true,
      inert: isOpen ? props.inert : true,
      'data-open': isOpen || undefined,
      'data-closed': !isOpen || undefined,
      'data-placement': portalled ? overlay.placement : undefined,
      'data-width': width,
      className: className ?? classNames?.e3,
      tabIndex: -1,
      style: portalled ? { ...overlay.floatingStyles, ...style } : style,
      children: resolvedChildren
    };
    const state: SelectContentRenderState = {
      open: isOpen,
      positioned: overlay.positioned,
      activeValue: activeKey,
      placement: overlay.placement
    };

    if (render) {
      const renderProps: SelectContentRenderProps = {
        ...(props as ComponentPropsWithoutRef<'div'>),
        ...sharedProps,
        ref: contentRef
      };
      return overlay.renderFloating(render(renderProps, state));
    }

    const nativeListProps: ComponentPropsWithoutRef<'ul'> = {
      ...(props as ComponentPropsWithoutRef<'ul'>),
      ...sharedProps
    };
    return overlay.renderFloating(<ul {...nativeListProps} ref={contentRef} />);
  }
);

const SelectContent = SelectContentImplementation as SelectContentComponent;

const SelectOption = forwardRef<HTMLLIElement, SelectOptionProps>(function SelectOption(
  {
    value,
    children,
    className,
    disabled: disabledProp,
    textValue,
    render,
    onClick,
    onMouseEnter,
    ...props
  },
  forwardedRef
) {
  const {
    selected,
    setSelected,
    options,
    activeKey,
    setActiveKey,
    setIsOpen,
    baseId,
    classNames,
    triggerRef,
    optionRefs
  } = useSelectContext();
  const option = options.find((candidate) => candidate.value === value);
  const isSelected = selected === value;
  const isFocused = activeKey === value;
  const isDisabled = option ? (option.disabled ?? false) : (disabledProp ?? false);

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
        `[Kiskadee] Select.Option "${value}" disabled state differs from Root.options metadata. Root.options wins for keyboard navigation.`
      );
    }
  }, [disabledProp, option?.disabled, value]);

  let resolvedClassName = className;
  if (!resolvedClassName) {
    if (isDisabled) resolvedClassName = classNames?.e4d ?? classNames?.e4;
    else if (isSelected) resolvedClassName = classNames?.e4a ?? classNames?.e4;
    else resolvedClassName = classNames?.e4;
  }
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (node) optionRefs.current.set(value, node);
      else optionRefs.current.delete(value);
      assignRef(forwardedRef, node);
    },
    [forwardedRef, optionRefs, value]
  );
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLLIElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;
      setSelected(value);
      setIsOpen(false, { reason: 'selection', event: event.nativeEvent });
      triggerRef.current?.focus();
    },
    [isDisabled, onClick, setIsOpen, setSelected, triggerRef, value]
  );
  const handleMouseEnter = useCallback(
    (event: ReactMouseEvent<HTMLLIElement>) => {
      onMouseEnter?.(event);
      if (!event.defaultPrevented && !isDisabled) setActiveKey(value);
    },
    [isDisabled, onMouseEnter, setActiveKey, value]
  );

  const optionProps: SelectOptionRenderProps = {
    ...props,
    ref,
    id: optionId(baseId, value),
    role: 'option',
    'aria-selected': isSelected,
    'aria-disabled': isDisabled || undefined,
    'data-focused': isFocused || undefined,
    'data-selected': isSelected || undefined,
    'data-disabled': isDisabled || undefined,
    'data-text-value': textValue ?? option?.textValue,
    className: resolvedClassName,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    children: children ?? option?.label
  };

  if (render) {
    return render(optionProps, { active: isFocused, selected: isSelected, disabled: isDisabled });
  }
  return <li {...optionProps} ref={optionProps.ref as Ref<HTMLLIElement>} />;
});

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Previous: SelectPrevious,
  Next: SelectNext,
  Content: SelectContent,
  Option: SelectOption,
  Label: SelectLabel
};
