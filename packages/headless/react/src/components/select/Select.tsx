import type { Padding, Placement } from '@floating-ui/react';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  Dispatch,
  KeyboardEvent,
  ReactElement,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
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
  /** A none option clears the value instead of confirming its collection key. */
  kind?: 'value' | 'none';
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

export type SelectValueChangeReason = 'option' | 'keyboard' | 'previous' | 'next' | 'typeahead';

export type SelectValueChangeDetails = {
  reason: SelectValueChangeReason;
  event?: Event;
};

export type SelectActiveSource = 'initial' | 'keyboard' | 'pointer' | null;

export type SelectState = Readonly<{
  selectedValue: string | null;
  hasSelection: boolean;
  isOpen: boolean;
  activeValue?: string;
  highlightedValue?: string;
  activeSource: SelectActiveSource;
}>;

type SelectRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type SelectProps = SelectRootDivProps & {
  children: ReactNode;
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  /** Initial list candidate only: omitted uses the first enabled option; null uses none. */
  suggestedValue?: string | null;
  onValueChange?: (value: string | null, details: SelectValueChangeDetails) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: SelectOpenChangeDetails) => void;
  disabled?: boolean;
  /** Wrap Previous/Next navigation between enabled options. Defaults to false. */
  loop?: boolean;
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
    state: { open: boolean; selectedValue: string | null; hasSelection: boolean }
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
  offset?: number | null;
  collisionPadding?: Padding | null;
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
  availableHeight: number;
  availableWidth: number;
  activeValue?: string;
  highlightedValue?: string;
  activeSource: SelectActiveSource;
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
    state: { active: boolean; highlighted: boolean; selected: boolean; disabled: boolean }
  ) => ReactElement;
};

export type SelectOptionRenderProps = Omit<ComponentPropsWithoutRef<'li'>, 'children'> & {
  ref: Ref<HTMLElement>;
  children?: ReactNode;
  'data-focused'?: true;
  'data-highlighted'?: true;
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
  render?: (props: SelectStepRenderProps, state: { disabled: boolean }) => ReactNode;
};

export type SelectStepRenderProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  type: 'button';
  'data-direction': 'previous' | 'next';
};

type SelectContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean, details: SelectOpenChangeDetails) => void;
  selected: string | null;
  hasSelection: boolean;
  commitOption: (key: string, details: SelectValueChangeDetails) => void;
  options: SelectOption[];
  items: CollectionItem<string, SelectOption>[];
  activeKey: string | undefined;
  highlightedKey: string | undefined;
  activeSource: SelectActiveSource;
  activateOption: (key: string | undefined, source: SelectActiveSource) => void;
  clearPointerHighlight: (key: string) => void;
  disabled: boolean;
  loop: boolean;
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

/** Read-only selection and candidate state for adapters inside Select.Root. */
export function useSelectState(): SelectState {
  const context = useSelectContext();
  return {
    selectedValue: context.selected,
    hasSelection: context.hasSelection,
    isOpen: context.isOpen,
    activeValue: context.activeKey,
    highlightedValue: context.highlightedKey,
    activeSource: context.activeSource
  };
}

function optionId(baseId: string, value: string): string {
  return `${baseId}-option-${encodeURIComponent(value)}`;
}

function getAdjacentSelectValueKey(
  items: CollectionItem<string, SelectOption>[],
  selected: string | null,
  direction: -1 | 1,
  loop: boolean
): string | undefined {
  const values = items.filter((item) => item.data?.kind !== 'none');
  const selectedIndex = values.findIndex((item) => item.key === selected);
  if (selectedIndex < 0) return getAdjacentCollectionKey(values, undefined, direction, loop);

  for (let distance = 1; distance <= values.length; distance++) {
    const nextIndex = selectedIndex + direction * distance;
    if (!loop && (nextIndex < 0 || nextIndex >= values.length)) return undefined;
    const item = values[(nextIndex + values.length) % values.length];
    if (item && !item.disabled && item.key !== selected) return item.key;
  }
  return undefined;
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
  suggestedValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  loop = false,
  placeholder = 'Select an option',
  idPrefix,
  classNames,
  ...rootDivProps
}: SelectProps) {
  const internalId = useId();
  const baseId = idPrefix ?? `select-${internalId}`;
  const [labelId, setLabelId] = useState<string | undefined>();
  const [selection, setSelectedState] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null
  });
  const [isOpen, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen
  });
  const [candidate, setCandidate] = useState<{
    key?: string;
    highlightedKey?: string;
    source: SelectActiveSource;
  }>({ source: null });
  const { key: activeKey, highlightedKey, source: activeSource } = candidate;
  const wasOpen = useRef(false);
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
  const selectedOption = options.find(
    (option) => option.value === selection && option.kind !== 'none'
  );
  const selected = selectedOption?.value ?? null;
  const hasSelection = selected !== null;
  const setIsOpen = useCallback(
    (nextOpen: boolean, details: SelectOpenChangeDetails) => {
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
    },
    [onOpenChange, setOpenState]
  );
  const commitOption = useCallback(
    (key: string, details: SelectValueChangeDetails) => {
      const option = options.find((candidate) => candidate.value === key);
      if (!option || option.disabled || disabled) return;
      const nextValue = option.kind === 'none' ? null : option.value;
      setSelectedState(nextValue);
      onValueChange?.(nextValue, details);
    },
    [disabled, onValueChange, options, setSelectedState]
  );

  const activateOption = useCallback((key: string | undefined, source: SelectActiveSource) => {
    const nextSource = key === undefined ? null : source;
    setCandidate((current) =>
      current.key === key && current.highlightedKey === key && current.source === nextSource
        ? current
        : { key, highlightedKey: key, source: nextSource }
    );
  }, []);
  const clearPointerHighlight = useCallback((key: string) => {
    setCandidate((current) =>
      current.source === 'pointer' && current.highlightedKey === key
        ? { ...current, highlightedKey: undefined }
        : current
    );
  }, []);

  useEffect(() => {
    assertUniqueCollectionKeys(items, 'Select');
    if (
      (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }).process?.env
        ?.NODE_ENV !== 'production' &&
      options.filter((option) => option.kind === 'none').length > 1
    ) {
      console.error('[Kiskadee] Select accepts at most one none option.');
    }
  }, [items, options]);

  useEffect(() => {
    if (!isOpen) {
      wasOpen.current = false;
      activateOption(undefined, null);
      return;
    }
    if (wasOpen.current) {
      setCandidate((current) => {
        if (current.key === undefined) return current;
        const item = items.find((item) => item.key === current.key && !item.disabled);
        return item ? current : { source: null };
      });
      return;
    }
    wasOpen.current = true;
    const selectedItem = items.find((item) => item.key === selected && !item.disabled);
    const suggestion =
      suggestedValue === undefined
        ? getFirstEnabledCollectionKey(items)
        : suggestedValue === null
          ? undefined
          : items.find((item) => item.key === suggestedValue && !item.disabled)?.key;
    activateOption(selectedItem?.key ?? suggestion, 'initial');
  }, [activateOption, isOpen, items, selected, suggestedValue]);

  useEffect(() => {
    if (!isOpen || activeKey === undefined) return;
    optionRefs.current.get(activeKey)?.scrollIntoView({ block: 'nearest' });
  }, [activeKey, isOpen]);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      selected,
      hasSelection,
      commitOption,
      options,
      items,
      activeKey,
      highlightedKey,
      activeSource,
      activateOption,
      clearPointerHighlight,
      disabled,
      loop,
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
      highlightedKey,
      activeSource,
      activateOption,
      clearPointerHighlight,
      baseId,
      classNames,
      disabled,
      isOpen,
      items,
      labelId,
      loop,
      options,
      placeholder,
      selected,
      hasSelection,
      setIsOpen,
      commitOption
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
    hasSelection,
    commitOption,
    options,
    items,
    activeKey,
    activateOption,
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
    (character: string, event: Event) => {
      clearTimeout(searchTimeout.current);
      searchBuffer.current += character.toLocaleLowerCase();
      const match = findCollectionKeyByPrefix(items, searchBuffer.current, activeKey);
      if (match !== undefined) {
        if (isOpen) activateOption(match, 'keyboard');
        else commitOption(match, { reason: 'typeahead', event });
      }
      searchTimeout.current = setTimeout(() => {
        searchBuffer.current = '';
      }, 500);
    },
    [activeKey, activateOption, commitOption, isOpen, items]
  );

  const commitActive = useCallback(
    (event: Event) => {
      const item = items.find((candidate) => candidate.key === activeKey);
      if (!item || item.disabled) return;
      commitOption(item.key, { reason: 'keyboard', event });
      setIsOpen(false, { reason: 'selection', event });
      triggerRef.current?.focus();
    },
    [activeKey, commitOption, items, setIsOpen, triggerRef]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen) commitActive(event.nativeEvent);
          else setIsOpen(true, { reason: 'keyboard', event: event.nativeEvent });
          break;
        case 'ArrowDown':
        case 'ArrowUp': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true, { reason: 'keyboard', event: event.nativeEvent });
          } else {
            activateOption(
              getAdjacentCollectionKey(items, activeKey, event.key === 'ArrowDown' ? 1 : -1, true),
              'keyboard'
            );
          }
          break;
        }
        case 'Home':
          if (isOpen) {
            event.preventDefault();
            activateOption(getFirstEnabledCollectionKey(items), 'keyboard');
          }
          break;
        case 'End':
          if (isOpen) {
            event.preventDefault();
            activateOption(getLastEnabledCollectionKey(items), 'keyboard');
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
            runTypeahead(event.key, event.nativeEvent);
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
      activateOption,
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
    'aria-activedescendant':
      isOpen && activeKey !== undefined ? optionId(baseId, activeKey) : undefined,
    'aria-labelledby': labelId ? `${labelId} ${baseId}-trigger` : `${baseId}-trigger`,
    'aria-disabled': disabled || undefined,
    disabled,
    className: triggerClassName,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    children: children ?? selectedOption?.label ?? placeholder
  };

  if (render) return render(triggerProps, { open: isOpen, selectedValue: selected, hasSelection });
  const { ref: nativeRef, ...nativeTriggerProps } = triggerProps;
  return <button {...nativeTriggerProps} ref={nativeRef} type="button" />;
});

function SelectStep({
  'aria-label': ariaLabel,
  children,
  className,
  disabled: disabledProp,
  onClick,
  render,
  direction,
  ...buttonProps
}: SelectStepProps & { direction: -1 | 1 }) {
  const { selected, commitOption, items, disabled, loop, classNames } = useSelectContext();
  const adjacentKey = getAdjacentSelectValueKey(items, selected, direction, loop);
  const isDisabled = disabled || disabledProp || adjacentKey === undefined;
  const resolvedClassName = className ?? (direction === -1 ? classNames?.e6 : classNames?.e7);
  const resolvedLabel = ariaLabel ?? (direction === -1 ? 'Previous option' : 'Next option');
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !isDisabled && adjacentKey !== undefined)
        commitOption(adjacentKey, {
          reason: direction === -1 ? 'previous' : 'next',
          event: event.nativeEvent
        });
    },
    [adjacentKey, commitOption, isDisabled, onClick]
  );

  const stepProps: SelectStepRenderProps = {
    ...buttonProps,
    type: 'button',
    'aria-label': resolvedLabel,
    className: resolvedClassName,
    'data-direction': direction === -1 ? 'previous' : 'next',
    disabled: isDisabled,
    onClick: handleClick,
    children
  };
  if (render) return render(stepProps, { disabled: isDisabled });
  return <button {...stepProps} />;
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
      offset = null,
      collisionPadding = null,
      placement = 'bottom-start',
      portalContainer,
      width = 'content',
      render,
      style,
      ...props
    },
    forwardedRef
  ) {
    const {
      isOpen,
      setIsOpen,
      options,
      activeKey,
      highlightedKey,
      activeSource,
      baseId,
      classNames,
      listRef,
      triggerRef
    } = useSelectContext();
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
      dir:
        props.dir ??
        (triggerRef.current
          ? triggerRef.current.ownerDocument.defaultView?.getComputedStyle(triggerRef.current)
              .direction ||
            triggerRef.current.closest('[dir]')?.getAttribute('dir') ||
            undefined
          : undefined),
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
      availableHeight: overlay.availableHeight,
      availableWidth: overlay.availableWidth,
      activeValue: activeKey,
      highlightedValue: highlightedKey,
      activeSource,
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
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...props
  },
  forwardedRef
) {
  const {
    selected,
    commitOption,
    options,
    disabled,
    activeKey,
    highlightedKey,
    activateOption,
    clearPointerHighlight,
    setIsOpen,
    baseId,
    classNames,
    triggerRef,
    optionRefs
  } = useSelectContext();
  const option = options.find((candidate) => candidate.value === value);
  const isSelected = selected === value;
  const isFocused = activeKey === value;
  const isHighlighted = highlightedKey === value;
  const isDisabled = disabled || (option ? (option.disabled ?? false) : (disabledProp ?? false));

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
      commitOption(value, { reason: 'option', event: event.nativeEvent });
      setIsOpen(false, { reason: 'selection', event: event.nativeEvent });
      triggerRef.current?.focus();
    },
    [commitOption, isDisabled, onClick, setIsOpen, triggerRef, value]
  );
  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLLIElement>) => {
      onPointerEnter?.(event);
      if (!event.defaultPrevented && !isDisabled && event.pointerType !== 'touch')
        activateOption(value, 'pointer');
    },
    [activateOption, isDisabled, onPointerEnter, value]
  );
  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLLIElement>) => {
      onPointerMove?.(event);
      if (!event.defaultPrevented && !isDisabled && event.pointerType !== 'touch')
        activateOption(value, 'pointer');
    },
    [activateOption, isDisabled, onPointerMove, value]
  );
  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLLIElement>) => {
      onPointerLeave?.(event);
      if (!event.defaultPrevented && event.pointerType !== 'touch') clearPointerHighlight(value);
    },
    [clearPointerHighlight, onPointerLeave, value]
  );

  const optionProps: SelectOptionRenderProps = {
    ...props,
    ref,
    id: optionId(baseId, value),
    role: 'option',
    'aria-selected': isSelected,
    'aria-disabled': isDisabled || undefined,
    'data-focused': isFocused || undefined,
    'data-highlighted': isHighlighted || undefined,
    'data-selected': isSelected || undefined,
    'data-disabled': isDisabled || undefined,
    'data-text-value': textValue ?? option?.textValue,
    className: resolvedClassName,
    onClick: handleClick,
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    children: children ?? option?.label
  };

  if (render) {
    return render(optionProps, {
      active: isFocused,
      highlighted: isHighlighted,
      selected: isSelected,
      disabled: isDisabled
    });
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
