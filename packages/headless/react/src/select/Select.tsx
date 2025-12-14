import { autoUpdate, offset, useFloating } from '@floating-ui/react';
import type {
  ComponentPropsWithoutRef,
  Dispatch,
  KeyboardEvent,
  ReactNode,
  SetStateAction
} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

// NOTE ABOUT PORTALS + POSITIONING
// -----------------------------------------------------------------------------
// This Select supports an opt-in `portalled` mode on `Select.Content`.
//
// Why is JS positioning needed when portalled?
// - In the default (non-portalled) mode, the dropdown is typically positioned
//   purely with CSS (e.g. `position: absolute; top: 100%; left: 0`) because it
//   lives inside the same DOM tree as the trigger, sharing the same containing
//   block.
// - When we render the dropdown in a React portal (usually into `document.body`),
//   it is removed from that local layout context, so CSS-only absolute
//   positioning no longer anchors it to the trigger.
//
// We use `@floating-ui/react` to keep the dropdown anchored to the trigger even
// when portalled:
// - `refs.setReference(triggerEl)` defines the anchor (the trigger).
// - `refs.setFloating(dropdownEl)` defines the floating element (the listbox).
// - `floatingStyles` provides the computed `top/left/position` (we use
//   `strategy: 'fixed'` so coordinates are viewport-based).
// - `autoUpdate` keeps it in sync on scroll/resize/layout changes.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type SelectRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type SelectProps = SelectRootDivProps & {
  children: ReactNode;
  options: SelectOption[];
  value?: string; // controlled selected value
  defaultValue?: string; // initial value for uncontrolled mode
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  idPrefix?: string;
  /**
   * Class names by compact element keys:
   * - e1: Select root container (div)
   * - e2: Trigger button
   * - e3: Dropdown content (listbox)
   * - e4: Option (role=option) — rest state
   * - e4a: Option (role=option) — selected state
   * - e4d: Option (role=option) — disabled state
   * - e5: Label
   */
  classNames?: Partial<Record<'e1' | 'e2' | 'e3' | 'e4' | 'e4a' | 'e4d' | 'e5', string>>;
};

export type SelectTriggerProps = {
  children?: ReactNode;
  className?: string;
};

export type SelectContentProps = {
  children?: ReactNode;
  className?: string;
  /**
   * When enabled, renders the dropdown in a React portal (defaults to `document.body`).
   * Useful to avoid clipping/stacking-context issues (e.g. `backdrop-filter`).
   */
  portalled?: boolean;
  /**
   * Custom portal container. If not provided, defaults to `document.body` on the client.
   * If `null`, portal rendering is disabled.
   */
  portalContainer?: HTMLElement | null;
};

export type SelectOptionProps = {
  value: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export type SelectLabelProps = {
  children?: ReactNode;
  className?: string;
  id?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

type SelectContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selected: string | undefined;
  setSelected: (value: string) => void;
  options: SelectOption[];
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  disabled: boolean;
  placeholder: string;
  baseId: string;
  labelId?: string;
  setLabelId: Dispatch<SetStateAction<string | undefined>>;
  classNames?: SelectProps['classNames'];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  listRef: React.RefObject<HTMLUListElement | null>;
  optionRefs: React.MutableRefObject<Map<string, HTMLLIElement | null>>;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select.Root');
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Component
// ─────────────────────────────────────────────────────────────────────────────

function SelectRoot({
  children,
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  placeholder = 'Select an option',
  idPrefix,
  classNames,
  ...rootDivProps
}: SelectProps) {
  const internalId = useId();
  const baseId = idPrefix ?? `select-${internalId}`;

  const [labelId, setLabelId] = useState<string | undefined>(undefined);

  // Controlled/uncontrolled selected value
  // - Controlled: `value` is provided, so we never update internal state.
  // - Uncontrolled: `value` is undefined, so we store selection locally and
  //   still notify the consumer via `onValueChange`.
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | undefined>(defaultValue ?? undefined);
  const selected = isControlled ? value : uncontrolled;

  const setSelected = useCallback(
    (v: string) => {
      if (!isControlled) setUncontrolled(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );

  // Dropdown open state
  const [isOpen, setIsOpen] = useState(false);

  // Focus management
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const optionRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  // Close on click outside
  // IMPORTANT: when `Select.Content` is rendered with `portalled`, the listbox
  // lives outside of `containerRef` (the root div). In that case, a naive
  // `containerRef.contains(target)` check would treat clicks inside the dropdown
  // as “outside” and immediately close it.
  //
  // To support both modes, we consider both:
  // - `containerRef` (root subtree)
  // - `listRef` (the actual listbox element, whether portalled or not)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideRoot = containerRef.current?.contains(target) ?? false;
      const clickedInsideList = listRef.current?.contains(target) ?? false;
      if (!clickedInsideRoot && !clickedInsideList) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const enabledOptions = options.filter((o) => !o.disabled);
      const selectedOption = enabledOptions.find((o) => o.value === selected);
      if (selectedOption) {
        const idx = options.findIndex((o) => o.value === selectedOption.value);
        setFocusedIndex(idx);
      } else {
        const firstEnabledIdx = options.findIndex((o) => !o.disabled);
        setFocusedIndex(firstEnabledIdx >= 0 ? firstEnabledIdx : -1);
      }
    }
  }, [isOpen, options, selected]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const option = options[focusedIndex];
      if (option) {
        const el = optionRefs.current.get(option.value);
        el?.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, focusedIndex, options]);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      selected,
      setSelected,
      options,
      focusedIndex,
      setFocusedIndex,
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
      isOpen,
      selected,
      setSelected,
      options,
      focusedIndex,
      disabled,
      placeholder,
      baseId,
      labelId,
      classNames
    ]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={containerRef} className={classNames?.e1} {...rootDivProps}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trigger Component
// ─────────────────────────────────────────────────────────────────────────────

function SelectTrigger({ children, className }: SelectTriggerProps) {
  const {
    isOpen,
    setIsOpen,
    selected,
    options,
    focusedIndex,
    setFocusedIndex,
    setSelected,
    disabled,
    placeholder,
    baseId,
    labelId,
    classNames,
    triggerRef
  } = useSelectContext();

  const selectedOption = options.find((o) => o.value === selected);
  const displayLabel = selectedOption?.label ?? placeholder;

  const triggerClassName = className ?? classNames?.e2;

  // Type-ahead search
  const searchBuffer = useRef('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleTypeAhead = useCallback(
    (char: string) => {
      clearTimeout(searchTimeout.current);
      searchBuffer.current += char.toLowerCase();

      // Find option starting with the search buffer
      const enabledOptions = options.map((o, idx) => ({ ...o, idx })).filter((o) => !o.disabled);

      const match = enabledOptions.find((o) => {
        const label = typeof o.label === 'string' ? o.label : '';
        return label.toLowerCase().startsWith(searchBuffer.current);
      });

      if (match) {
        if (isOpen) {
          setFocusedIndex(match.idx);
        } else {
          setSelected(match.value);
        }
      }

      // Clear buffer after 500ms of no typing
      searchTimeout.current = setTimeout(() => {
        searchBuffer.current = '';
      }, 500);
    },
    [options, isOpen, setFocusedIndex, setSelected]
  );

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      const enabledIndices = options
        .map((o, idx) => ({ ...o, idx }))
        .filter((o) => !o.disabled)
        .map((o) => o.idx);

      if (enabledIndices.length === 0) return;

      let currentIdx = enabledIndices.indexOf(focusedIndex);
      if (currentIdx === -1) {
        currentIdx = direction === 1 ? -1 : enabledIndices.length;
      }

      const nextIdx =
        enabledIndices[(currentIdx + direction + enabledIndices.length) % enabledIndices.length];
      setFocusedIndex(nextIdx);
    },
    [options, focusedIndex, setFocusedIndex]
  );

  const focusFirst = useCallback(() => {
    const firstEnabled = options.findIndex((o) => !o.disabled);
    if (firstEnabled >= 0) setFocusedIndex(firstEnabled);
  }, [options, setFocusedIndex]);

  const focusLast = useCallback(() => {
    const lastEnabled = [...options].reverse().findIndex((o) => !o.disabled);
    if (lastEnabled >= 0) setFocusedIndex(options.length - 1 - lastEnabled);
  }, [options, setFocusedIndex]);

  const selectFocused = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < options.length) {
      const option = options[focusedIndex];
      if (option && !option.disabled) {
        setSelected(option.value);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
  }, [focusedIndex, options, setSelected, setIsOpen, triggerRef]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen) {
            selectFocused();
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            moveFocus(1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            moveFocus(-1);
          }
          break;
        case 'Home':
          e.preventDefault();
          if (isOpen) focusFirst();
          break;
        case 'End':
          e.preventDefault();
          if (isOpen) focusLast();
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Tab':
          if (isOpen) {
            setIsOpen(false);
          }
          break;
        default:
          // Type-ahead: single printable character
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            handleTypeAhead(e.key);
          }
          break;
      }
    },
    [
      disabled,
      isOpen,
      setIsOpen,
      moveFocus,
      focusFirst,
      focusLast,
      selectFocused,
      handleTypeAhead,
      triggerRef
    ]
  );

  return (
    <button
      ref={triggerRef}
      id={`${baseId}-trigger`}
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={`${baseId}-listbox`}
      aria-labelledby={labelId ? `${labelId} ${baseId}-trigger` : `${baseId}-trigger`}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={triggerClassName}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      onKeyDown={onKeyDown}
    >
      {children ?? displayLabel}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Label Component
// ─────────────────────────────────────────────────────────────────────────────

function SelectLabel({ children, className, id }: SelectLabelProps) {
  const { baseId, setLabelId, classNames } = useSelectContext();

  const resolvedId = id ?? `${baseId}-label`;

  useEffect(() => {
    setLabelId(resolvedId);
    return () => {
      setLabelId((current) => (current === resolvedId ? undefined : current));
    };
  }, [resolvedId, setLabelId]);

  const resolvedClassName = className ?? classNames?.e5;

  return (
    <span id={resolvedId} className={resolvedClassName}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Component (Dropdown/Listbox)
// ─────────────────────────────────────────────────────────────────────────────

function SelectContent({
  children,
  className,
  portalled = false,
  portalContainer
}: SelectContentProps) {
  const { isOpen, options, baseId, classNames, listRef, triggerRef } = useSelectContext();

  // Floating UI is used only to provide robust, anchor-based positioning when
  // `portalled` is enabled. In the default non-portalled mode, consumers usually
  // position the dropdown via CSS (e.g. absolute positioning inside `e1`).
  //
  // We keep this hook here unconditionally for simplicity; the computed styles
  // are only applied when `portalled` is true.
  const { refs, floatingStyles, update } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [offset(8)],
    whileElementsMounted: autoUpdate
  });

  // Connect the floating anchor to the trigger element.
  // This is what makes the dropdown follow the trigger even when rendered in a portal.
  useEffect(() => {
    if (!portalled) return;
    if (!triggerRef.current) return;
    refs.setReference(triggerRef.current);
  }, [portalled, refs, triggerRef]);

  // When opening, force an immediate position calculation so the first frame of
  // the open animation starts at the correct coordinates.
  useEffect(() => {
    if (!portalled) return;
    if (!isOpen) return;
    update();
  }, [portalled, isOpen, update]);

  const contentClassName = className ?? classNames?.e3;

  // Portal container resolution:
  // - `portalContainer === undefined`: default to `document.body` on the client.
  // - `portalContainer === null`: explicitly disable portal usage.
  // - SSR safety: if `document` is not available, portal is disabled.
  const resolvedPortalContainer =
    portalContainer === undefined
      ? typeof document !== 'undefined'
        ? document.body
        : null
      : portalContainer;

  const ul = (
    <ul
      ref={(node) => {
        listRef.current = node;
        // Connect the floating element (the listbox) so Floating UI can measure
        // it and compute the correct viewport coordinates.
        if (portalled) refs.setFloating(node);
      }}
      id={`${baseId}-listbox`}
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: ...
      role="listbox"
      aria-labelledby={`${baseId}-trigger`}
      aria-hidden={isOpen ? undefined : true}
      data-open={isOpen || undefined}
      className={contentClassName}
      tabIndex={-1}
      style={
        portalled
          ? {
              ...floatingStyles,
              // Ensure the dropdown is above local fixed headers by default.
              zIndex: 10000
            }
          : undefined
      }
    >
      {children ??
        options.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            {option.label}
          </SelectOption>
        ))}
    </ul>
  );

  // If we are not in portalled mode, or portal rendering is unavailable/disabled,
  // render inline and allow consumers to position via CSS.
  if (!portalled || !resolvedPortalContainer) return ul;

  // Portalled rendering:
  // - avoids clipping by overflow/stacking contexts
  // - helps with cases where `backdrop-filter` and fixed headers interfere
  // - requires JS positioning (handled by Floating UI above)
  return createPortal(ul, resolvedPortalContainer);
}

// ─────────────────────────────────────────────────────────────────────────────
// Option Component
// ─────────────────────────────────────────────────────────────────────────────

function SelectOption({ value, children, className, disabled }: SelectOptionProps) {
  const {
    selected,
    setSelected,
    options,
    focusedIndex,
    setFocusedIndex,
    setIsOpen,
    baseId,
    classNames,
    triggerRef,
    optionRefs
  } = useSelectContext();

  const option = options.find((o) => o.value === value);
  const optionIndex = options.findIndex((o) => o.value === value);
  const isSelected = selected === value;
  const isFocused = focusedIndex === optionIndex;
  const isDisabled = disabled || (option?.disabled ?? false);

  // Determine class name
  let optionClassName = className;
  if (!optionClassName) {
    if (isDisabled) {
      optionClassName = classNames?.e4d ?? classNames?.e4;
    } else if (isSelected) {
      optionClassName = classNames?.e4a ?? classNames?.e4;
    } else {
      optionClassName = classNames?.e4;
    }
  }

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      setSelected(value);
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, [isDisabled, value, setSelected, setIsOpen, triggerRef]);

  const handleMouseEnter = useCallback(() => {
    if (!isDisabled) {
      setFocusedIndex(optionIndex);
    }
  }, [isDisabled, optionIndex, setFocusedIndex]);

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: ...
    // biome-ignore lint/a11y/useKeyWithClickEvents: ...
    <li
      ref={(el) => {
        optionRefs.current.set(value, el);
      }}
      id={`${baseId}-option-${value}`}
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: this list item acts as a listbox option
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      data-focused={isFocused || undefined}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      className={optionClassName}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children ?? option?.label}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Option: SelectOption,
  Label: SelectLabel
};
