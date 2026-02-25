import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent,
  MutableRefObject,
  ReactNode
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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TabsRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type TabsRootProps = TabsRootDivProps & {
  children?: ReactNode;
  value?: string; // controlled selected tab id
  defaultValue?: string; // initial selected tab id for uncontrolled mode
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual'; // automatic: focus changes selection; manual: Enter/Space selects
  idPrefix?: string;
  /**
   * Class names by compact element keys:
   * - e1: Tabs root container (div)
   * - e2: Tab bar (role=tablist)
   * - e3: Tab button (role=tab) — rest state
   * - e3a: Tab button (role=tab) — selected state
   * - e4: Tab content (role=tabpanel)
   * - e5: Tab active indicator (optional)
   */
  classNames?: Partial<Record<'e1' | 'e2' | 'e3' | 'e3a' | 'e4' | 'e5', string>>;
};

export type TabsBarProps = {
  children?: ReactNode;
  className?: string;
};

export type TabsTabProps = {
  value: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export type TabsContentProps = {
  value: string;
  children?: ReactNode;
  className?: string;
};

export type TabsIndicatorProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'> & {
  className?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

type TabsRegistration = {
  value: string;
  disabled: boolean;
};

type TabsContextValue = {
  selected: string | undefined;
  setSelected: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  baseId: string;
  classNames?: TabsRootProps['classNames'];
  tabs: TabsRegistration[];
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  setTabDisabled: (value: string, disabled: boolean) => void;
  tabRefs: MutableRefObject<Map<string, HTMLButtonElement | null>>;
  listRef: MutableRefObject<HTMLDivElement | null>;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs.Root');
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Component
// ─────────────────────────────────────────────────────────────────────────────

function TabsRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'manual',
  idPrefix,
  classNames,
  ...rootDivProps
}: TabsRootProps) {
  const internalId = useId();
  const baseId = idPrefix ?? `tabs-${internalId}`;

  // Controlled/uncontrolled selected value
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | undefined>(defaultValue);
  const selected = isControlled ? value : uncontrolled;

  const setSelected = useCallback(
    (nextValue: string) => {
      if (!isControlled) setUncontrolled(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  // Tabs registration keeps keyboard navigation order independent of children shape.
  const [tabs, setTabs] = useState<TabsRegistration[]>([]);

  const registerTab = useCallback((tabValue: string) => {
    setTabs((prev) => {
      if (prev.some((tab) => tab.value === tabValue)) return prev;
      return [...prev, { value: tabValue, disabled: false }];
    });
  }, []);

  const unregisterTab = useCallback((tabValue: string) => {
    setTabs((prev) => prev.filter((tab) => tab.value !== tabValue));
  }, []);

  const setTabDisabled = useCallback((tabValue: string, disabled: boolean) => {
    setTabs((prev) => {
      const index = prev.findIndex((tab) => tab.value === tabValue);
      if (index < 0) return [...prev, { value: tabValue, disabled }];
      if (prev[index]?.disabled === disabled) return prev;
      const next = [...prev];
      next[index] = { ...next[index], disabled };
      return next;
    });
  }, []);

  const enabledValues = useMemo(
    () => tabs.filter((tab) => !tab.disabled).map((tab) => tab.value),
    [tabs]
  );

  // Ensure there is always a valid selected tab when possible.
  useEffect(() => {
    if (enabledValues.length === 0) return;
    if (selected && enabledValues.includes(selected)) return;

    const fallback = enabledValues[0];

    if (!isControlled && selected === undefined) {
      setUncontrolled(fallback);
      return;
    }

    setSelected(fallback);
  }, [enabledValues, isControlled, selected, setSelected]);

  const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const listRef = useRef<HTMLDivElement | null>(null);

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      selected,
      setSelected,
      orientation,
      activationMode,
      baseId,
      classNames,
      tabs,
      registerTab,
      unregisterTab,
      setTabDisabled,
      tabRefs,
      listRef
    }),
    [
      selected,
      setSelected,
      orientation,
      activationMode,
      baseId,
      classNames,
      tabs,
      registerTab,
      unregisterTab,
      setTabDisabled,
      listRef
    ]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={classNames?.e1} {...rootDivProps}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar Component
// ─────────────────────────────────────────────────────────────────────────────

function TabsBar({ children, className }: TabsBarProps) {
  const {
    tabs,
    orientation,
    activationMode,
    setSelected,
    classNames,
    tabRefs,
    listRef
  } = useTabsContext();

  const enabledValues = useMemo(
    () => tabs.filter((tab) => !tab.disabled).map((tab) => tab.value),
    [tabs]
  );

  const focusTab = useCallback(
    (tabValue: string) => {
      const el = tabRefs.current.get(tabValue);
      el?.focus();
      if (activationMode === 'automatic') setSelected(tabValue);
    },
    [activationMode, setSelected, tabRefs]
  );

  const moveFocus = useCallback(
    (currentValue: string, direction: 1 | -1) => {
      if (enabledValues.length === 0) return;
      const currentIndex = enabledValues.indexOf(currentValue);
      if (currentIndex < 0) return;
      const nextValue =
        enabledValues[(currentIndex + direction + enabledValues.length) % enabledValues.length];
      if (nextValue) {
        focusTab(nextValue);
      }
    },
    [enabledValues, focusTab]
  );

  const focusFirst = useCallback(() => {
    const first = enabledValues[0];
    if (first) focusTab(first);
  }, [enabledValues, focusTab]);

  const focusLast = useCallback(() => {
    const last = enabledValues[enabledValues.length - 1];
    if (last) focusTab(last);
  }, [enabledValues, focusTab]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const active = document.activeElement as HTMLElement | null;
      const currentValue = active?.getAttribute('data-tab-value') || undefined;

      const horizontal = orientation === 'horizontal';
      switch (e.key) {
        case 'ArrowRight':
          if (horizontal && currentValue) {
            e.preventDefault();
            moveFocus(currentValue, 1);
          }
          break;
        case 'ArrowLeft':
          if (horizontal && currentValue) {
            e.preventDefault();
            moveFocus(currentValue, -1);
          }
          break;
        case 'ArrowDown':
          if (!horizontal && currentValue) {
            e.preventDefault();
            moveFocus(currentValue, 1);
          }
          break;
        case 'ArrowUp':
          if (!horizontal && currentValue) {
            e.preventDefault();
            moveFocus(currentValue, -1);
          }
          break;
        case 'Home':
          e.preventDefault();
          focusFirst();
          break;
        case 'End':
          e.preventDefault();
          focusLast();
          break;
        case 'Enter':
        case ' ': // Space
          if (activationMode === 'manual' && currentValue) {
            e.preventDefault();
            setSelected(currentValue);
          }
          break;
      }
    },
    [orientation, activationMode, moveFocus, focusFirst, focusLast, setSelected]
  );

  const listClassName = className ?? classNames?.e2;

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      className={listClassName}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Component
// ─────────────────────────────────────────────────────────────────────────────

function TabsTab({ value, children, className, disabled = false }: TabsTabProps) {
  const {
    selected,
    setSelected,
    activationMode,
    classNames,
    baseId,
    registerTab,
    unregisterTab,
    setTabDisabled,
    tabRefs
  } = useTabsContext();

  useEffect(() => {
    registerTab(value);
    return () => {
      unregisterTab(value);
      tabRefs.current.delete(value);
    };
  }, [value, registerTab, unregisterTab, tabRefs]);

  useEffect(() => {
    setTabDisabled(value, disabled);
  }, [value, disabled, setTabDisabled]);

  const isSelected = selected === value;

  const triggerClassName =
    className ??
    (isSelected ? (classNames?.e3a ?? classNames?.e3 ?? '') : (classNames?.e3 ?? ''));

  return (
    <button
      ref={(el) => {
        tabRefs.current.set(value, el);
      }}
      id={`${baseId}-tab-${value}`}
      data-tab-value={value}
      role="tab"
      type="button"
      className={triggerClassName}
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${value}`}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onFocus={() => {
        if (!disabled && activationMode === 'automatic') {
          setSelected(value);
        }
      }}
      onClick={() => !disabled && setSelected(value)}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Indicator Component
// ─────────────────────────────────────────────────────────────────────────────

type IndicatorRect = {
  x: number;
  y: number;
  width: number;
};

function TabsIndicator({ className, style, ...indicatorDivProps }: TabsIndicatorProps) {
  const { selected, orientation, classNames, listRef, tabRefs, tabs } = useTabsContext();
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  const updateRect = useCallback(() => {
    if (!selected) {
      setRect(null);
      return;
    }

    const listEl = listRef.current;
    const selectedTab = tabRefs.current.get(selected);
    if (!listEl || !selectedTab) {
      setRect(null);
      return;
    }

    const listRect = listEl.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();

    setRect({
      x: tabRect.left - listRect.left + listEl.scrollLeft,
      y: tabRect.top - listRect.top + listEl.scrollTop,
      width: tabRect.width
    });
  }, [selected, listRef, tabRefs]);

  useEffect(() => {
    updateRect();
  }, [updateRect, tabs]);

  useEffect(() => {
    const listEl = listRef.current;
    const selectedTab = selected ? tabRefs.current.get(selected) : null;
    if (!listEl || !selectedTab) return;

    const handleWindowResize = () => updateRect();
    listEl.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', handleWindowResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateRect());
      resizeObserver.observe(listEl);
      resizeObserver.observe(selectedTab);
    }

    return () => {
      listEl.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver?.disconnect();
    };
  }, [selected, updateRect, listRef, tabRefs]);

  const indicatorClassName = className ?? classNames?.e5;

  const indicatorStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: rect?.width,
    transform: rect ? `translate3d(${rect.x}px, ${rect.y}px, 0)` : undefined,
    ...style
  };

  return (
    <div
      aria-hidden="true"
      data-orientation={orientation}
      data-visible={rect ? true : undefined}
      hidden={!rect}
      className={indicatorClassName}
      style={indicatorStyle}
      {...indicatorDivProps}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Component
// ─────────────────────────────────────────────────────────────────────────────

function TabsContent({ value, children, className }: TabsContentProps) {
  const { selected, classNames, baseId } = useTabsContext();

  const isSelected = selected === value;
  const panelClassName = className ?? classNames?.e4;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!isSelected}
      className={panelClassName}
    >
      {isSelected ? children : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const Tabs = {
  Root: TabsRoot,
  Bar: TabsBar,
  Tab: TabsTab,
  Content: TabsContent,
  Indicator: TabsIndicator
};
