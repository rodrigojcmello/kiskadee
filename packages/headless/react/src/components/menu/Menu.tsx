import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
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
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  type CollectionItem,
  findCollectionKeyByPrefix,
  getAdjacentCollectionKey,
  getFirstEnabledCollectionKey,
  getLastEnabledCollectionKey
} from '../../internal/collection.ts';
import { useControllableState } from '../../internal/controllable-state.ts';
import {
  Dropdown,
  type DropdownAnchorRenderProps,
  type DropdownContentProps,
  type DropdownOpenChangeDetails
} from '../dropdown/Dropdown.tsx';

export type MenuOpenChangeDetails =
  | DropdownOpenChangeDetails
  | { reason: 'selection'; event?: Event };

export type MenuRootProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void;
};

export type MenuTriggerRenderProps = DropdownAnchorRenderProps & {
  'aria-haspopup': 'menu';
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export type MenuTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick' | 'onKeyDown'
> & {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  render?: (props: MenuTriggerRenderProps, state: { open: boolean }) => ReactElement;
};

export type MenuContentProps = Omit<DropdownContentProps, 'children'> & {
  children?: ReactNode;
};

export type MenuItemRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  role: 'menuitem';
  tabIndex: number;
  'aria-disabled'?: true;
  'data-active'?: true;
  'data-disabled'?: true;
};

export type MenuItemProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'> & {
  children?: ReactNode;
  value?: string;
  textValue: string;
  disabled?: boolean;
  onSelect?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  render?: (
    props: MenuItemRenderProps,
    state: { active: boolean; disabled: boolean }
  ) => ReactElement;
};

type MenuRegisteredItem = {
  key: string;
  element: HTMLElement;
  disabled: boolean;
  textValue: string;
};

type MenuContextValue = {
  open: boolean;
  disabled: boolean;
  setOpen: (open: boolean, details: MenuOpenChangeDetails) => void;
  activeKey: string | undefined;
  setActiveKey: (key: string | undefined) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  focusIntentRef: React.MutableRefObject<'first' | 'last'>;
  registerItem: (item: MenuRegisteredItem) => () => void;
  items: readonly MenuRegisteredItem[];
};

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(componentName: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`${componentName} must be used within Menu.Root`);
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function MenuRoot({
  children,
  open: openProp,
  defaultOpen = false,
  disabled = false,
  onOpenChange
}: MenuRootProps) {
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen });
  const [activeKey, setActiveKey] = useState<string>();
  const [registrationVersion, setRegistrationVersion] = useState(0);
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusIntentRef = useRef<'first' | 'last'>('first');
  const itemsRef = useRef(new Map<string, MenuRegisteredItem>());
  const setOpen = useCallback(
    (nextOpen: boolean, details: MenuOpenChangeDetails) => {
      if (disabled && nextOpen) return;
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
      if (!nextOpen) setActiveKey(undefined);
    },
    [disabled, onOpenChange, setOpenState]
  );
  const registerItem = useCallback((item: MenuRegisteredItem) => {
    itemsRef.current.set(item.key, item);
    setRegistrationVersion((version) => version + 1);
    return () => {
      itemsRef.current.delete(item.key);
      setRegistrationVersion((version) => version + 1);
    };
  }, []);
  const items = useMemo(() => {
    const registeredItems = Array.from(itemsRef.current.values());
    if (registrationVersion === 0) return registeredItems;
    return registeredItems.sort((left, right) => {
      if (left.element === right.element) return 0;
      const position = left.element.compareDocumentPosition(right.element);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }, [registrationVersion]);
  const contextValue = useMemo<MenuContextValue>(
    () => ({
      open,
      disabled,
      setOpen,
      activeKey,
      setActiveKey,
      triggerRef,
      focusIntentRef,
      registerItem,
      items
    }),
    [activeKey, disabled, items, open, registerItem, setOpen]
  );

  return (
    <MenuContext.Provider value={contextValue}>
      <Dropdown.Root open={open} onOpenChange={(nextOpen, details) => setOpen(nextOpen, details)}>
        {children}
      </Dropdown.Root>
    </MenuContext.Provider>
  );
}

const MenuTrigger = forwardRef<HTMLElement, MenuTriggerProps>(function MenuTrigger(
  { children, disabled: disabledProp = false, render, onClick, onKeyDown, ...buttonProps },
  forwardedRef
) {
  const {
    open,
    disabled: rootDisabled,
    setOpen,
    triggerRef,
    focusIntentRef
  } = useMenuContext('Menu.Trigger');
  const disabled = rootDisabled || disabledProp;

  return (
    <Dropdown.Anchor
      {...buttonProps}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      render={(anchorProps) => {
        const ref = (node: HTMLElement | null) => {
          triggerRef.current = node;
          assignRef(anchorProps.ref, node);
          assignRef(forwardedRef, node);
        };
        const handleClick = (event: MouseEvent<HTMLElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          focusIntentRef.current = 'first';
          anchorProps.onClick(event);
        };
        const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
          anchorProps.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            focusIntentRef.current = 'first';
            setOpen(true, { reason: 'trigger', event: event.nativeEvent });
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusIntentRef.current = 'last';
            setOpen(true, { reason: 'trigger', event: event.nativeEvent });
          }
        };
        const triggerProps: MenuTriggerRenderProps = {
          ...anchorProps,
          ref,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          onClick: handleClick,
          onKeyDown: handleKeyDown
        };

        if (render) return render(triggerProps, { open });
        const { ref: triggerButtonRef, ...nativeTriggerProps } = triggerProps;
        return (
          <button
            {...nativeTriggerProps}
            ref={triggerButtonRef as Ref<HTMLButtonElement>}
            type="button"
            disabled={disabled}
            aria-disabled={disabled || undefined}
          >
            {children}
          </button>
        );
      }}
    />
  );
});

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { children, className, onKeyDown, ...props },
  forwardedRef
) {
  const { open, setOpen, activeKey, setActiveKey, triggerRef, focusIntentRef, items } =
    useMenuContext('Menu.Content');
  const searchBuffer = useRef('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusableItems = useMemo<CollectionItem<string, MenuRegisteredItem>[]>(
    () =>
      items.map((item) => ({
        // Disabled menu items remain focusable under the APG menu pattern.
        key: item.key,
        textValue: item.textValue,
        data: item
      })),
    [items]
  );

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  const focusKey = useCallback(
    (key: string | undefined) => {
      if (!key) return;
      const target = items.find((item) => item.key === key);
      if (!target) return;
      setActiveKey(target.key);
      target.element.focus();
    },
    [items, setActiveKey]
  );

  useLayoutEffect(() => {
    if (!open) return;
    const targetKey =
      focusIntentRef.current === 'last'
        ? getLastEnabledCollectionKey(focusableItems)
        : getFirstEnabledCollectionKey(focusableItems);
    focusKey(targetKey);
  }, [focusIntentRef, focusKey, focusableItems, open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusKey(
          getAdjacentCollectionKey(
            focusableItems,
            activeKey,
            event.key === 'ArrowDown' ? 1 : -1,
            true
          )
        );
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        focusKey(
          event.key === 'Home'
            ? getFirstEnabledCollectionKey(focusableItems)
            : getLastEnabledCollectionKey(focusableItems)
        );
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false, { reason: 'escape', event: event.nativeEvent });
        triggerRef.current?.focus();
      } else if (event.key === 'Tab') {
        setOpen(false, { reason: 'programmatic', event: event.nativeEvent });
      } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        clearTimeout(searchTimeout.current);
        searchBuffer.current += event.key.toLocaleLowerCase();
        focusKey(findCollectionKeyByPrefix(focusableItems, searchBuffer.current, activeKey));
        searchTimeout.current = setTimeout(() => {
          searchBuffer.current = '';
        }, 500);
      }
    },
    [activeKey, focusKey, focusableItems, onKeyDown, setOpen, triggerRef]
  );

  return (
    <Dropdown.Content {...props}>
      <div ref={forwardedRef} role="menu" className={className} onKeyDown={handleKeyDown}>
        {children}
      </div>
    </Dropdown.Content>
  );
});

const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(
  {
    children,
    value,
    textValue,
    disabled = false,
    onSelect,
    onClick,
    onKeyDown,
    onMouseMove,
    render,
    ...props
  },
  forwardedRef
) {
  const generatedId = useId();
  const itemKey = value ?? `menu-item-${generatedId}`;
  const { setOpen, activeKey, setActiveKey, registerItem, triggerRef } =
    useMenuContext('Menu.Item');
  const localRef = useRef<HTMLElement | null>(null);
  const active = activeKey === itemKey;

  useLayoutEffect(() => {
    const element = localRef.current;
    if (!element) return;
    return registerItem({ key: itemKey, element, disabled, textValue });
  }, [disabled, itemKey, registerItem, textValue]);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );
  const activate = useCallback(
    (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onSelect?.(event);
      if (!event.defaultPrevented) {
        setOpen(false, { reason: 'selection', event: event.nativeEvent });
        triggerRef.current?.focus();
      }
    },
    [disabled, onSelect, setOpen, triggerRef]
  );
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) activate(event);
    },
    [activate, onClick]
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        activate(event);
        event.preventDefault();
      }
    },
    [activate, onKeyDown]
  );
  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onMouseMove?.(event);
      if (!event.defaultPrevented) {
        setActiveKey(itemKey);
        event.currentTarget.focus();
      }
    },
    [itemKey, onMouseMove, setActiveKey]
  );
  const renderProps: MenuItemRenderProps = {
    ...props,
    ref,
    role: 'menuitem',
    tabIndex: active ? 0 : -1,
    'aria-disabled': disabled || undefined,
    'data-active': active || undefined,
    'data-disabled': disabled || undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseMove: handleMouseMove
  };

  if (render) return render(renderProps, { active, disabled });

  const { ref: itemRef, ...nativeItemProps } = renderProps;
  return (
    <div {...nativeItemProps} ref={itemRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );
});

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem
};
