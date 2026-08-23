import {
  type OpenChangeReason,
  type Placement,
  safePolygon,
  type VirtualElement
} from '@floating-ui/react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
  UIEvent
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
import { useControlState } from '../../hooks/control-state/useControlState.ts';
import {
  AnchoredOverlayTree,
  type AnchoredOverlayWidth,
  useAnchoredOverlay
} from '../../internal/anchored-overlay.tsx';
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
  type DropdownContentRenderState,
  type DropdownOpenChangeDetails
} from '../dropdown/Dropdown.tsx';

export type MenuOpenChangeDetails =
  | DropdownOpenChangeDetails
  | { reason: 'context-menu'; event?: Event }
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

export type MenuContextTriggerRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  'aria-controls'?: string;
  'aria-expanded': boolean;
  'aria-haspopup': 'menu';
  'aria-disabled'?: true;
};

export type MenuContextTriggerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onContextMenu' | 'onKeyDown'
> & {
  children?: ReactNode;
  disabled?: boolean;
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  render?: (
    props: MenuContextTriggerRenderProps,
    state: { open: boolean; disabled: boolean }
  ) => ReactElement;
};

export type MenuContentRenderState = DropdownContentRenderState;

export type MenuContentRenderProps = HTMLAttributes<HTMLDivElement> & {
  ref: Ref<HTMLDivElement>;
  role: 'menu';
  'data-open'?: true;
  'data-closed'?: true;
};

export type MenuContentProps = Omit<DropdownContentProps, 'children' | 'render'> & {
  children?: ReactNode;
  render?: (props: MenuContentRenderProps, state: MenuContentRenderState) => ReactElement;
};

export type MenuGroupRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  role: 'group';
  'aria-labelledby'?: string;
};

export type MenuGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
  children?: ReactNode;
  render?: (props: MenuGroupRenderProps) => ReactElement;
};

export type MenuGroupLabelRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  id: string;
};

export type MenuGroupLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'id'> & {
  children?: ReactNode;
  render?: (props: MenuGroupLabelRenderProps) => ReactElement;
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
  closeOnSelect?: boolean;
  onSelect?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  render?: (
    props: MenuItemRenderProps,
    state: { active: boolean; disabled: boolean }
  ) => ReactElement;
};

export type MenuCheckboxItemRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  role: 'menuitemcheckbox';
  tabIndex: number;
  'aria-checked': boolean;
  'aria-disabled'?: true;
  'data-active'?: true;
  'data-checked'?: true;
  'data-disabled'?: true;
};

export type MenuCheckboxItemProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'> & {
  children?: ReactNode;
  value?: string;
  textValue: string;
  controlState?: boolean;
  defaultControlState?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onControlStateChange?: (controlState: boolean) => void;
  onSelect?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  render?: (
    props: MenuCheckboxItemRenderProps,
    state: { active: boolean; controlState: boolean; disabled: boolean }
  ) => ReactElement;
};

export type MenuRadioValueChangeDetails = {
  previousValue: string | undefined;
  event: Event;
};

export type MenuRadioGroupRenderProps = MenuGroupRenderProps;

export type MenuRadioGroupProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'role'
> & {
  children?: ReactNode;
  /**
   * Stable identity for uncontrolled state when radio groups can be reordered.
   * Without an id, persistence follows the group's position within the menu.
   */
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: MenuRadioValueChangeDetails) => void;
  render?: (props: MenuRadioGroupRenderProps) => ReactElement;
};

export type MenuRadioItemRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  role: 'menuitemradio';
  tabIndex: number;
  'aria-checked': boolean;
  'aria-disabled'?: true;
  'data-active'?: true;
  'data-checked'?: true;
  'data-disabled'?: true;
};

export type MenuRadioItemProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'> & {
  children?: ReactNode;
  value: string;
  textValue: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onSelect?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  render?: (
    props: MenuRadioItemRenderProps,
    state: { active: boolean; checked: boolean; disabled: boolean }
  ) => ReactElement;
};

export type MenuSubOpenChangeReason =
  | 'trigger'
  | 'hover'
  | 'keyboard'
  | 'escape'
  | 'outside-press'
  | 'sibling-open'
  | 'selection'
  | 'parent-scroll'
  | 'parent-close'
  | 'programmatic';

export type MenuSubOpenChangeDetails = {
  reason: MenuSubOpenChangeReason;
  event?: Event;
};

export type MenuSubProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: MenuSubOpenChangeDetails) => void;
  placement?: Placement;
  offset?: number;
  collisionPadding?: number;
  portalled?: boolean;
  portalContainer?: HTMLElement | null;
  width?: AnchoredOverlayWidth;
};

export type MenuSubTriggerRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  id: string;
  role: 'menuitem';
  tabIndex: number;
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'menu';
  'aria-disabled'?: true;
  'data-active'?: true;
  'data-disabled'?: true;
  'data-open'?: true;
};

export type MenuSubTriggerProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode;
  value?: string;
  textValue: string;
  disabled?: boolean;
  render?: (
    props: MenuSubTriggerRenderProps,
    state: { active: boolean; disabled: boolean; open: boolean }
  ) => ReactElement;
};

export type MenuSubContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
  children?: ReactNode;
  forceMount?: boolean;
  render?: (props: MenuContentRenderProps, state: MenuContentRenderState) => ReactElement;
};

type MenuRegisteredItem = {
  key: string;
  element: HTMLElement;
  disabled: boolean;
  textValue: string;
};

type MenuRadioStorageKey = number | `id:${string}`;

type MenuContextValue = {
  open: boolean;
  disabled: boolean;
  setOpen: (open: boolean, details: MenuOpenChangeDetails) => void;
  closeLevel: (details: MenuSubOpenChangeDetails, restoreFocus: boolean) => void;
  closeTree: (details: MenuOpenChangeDetails, restoreFocus: boolean) => void;
  closeActiveSubmenu: (details: MenuSubOpenChangeDetails) => boolean;
  root: boolean;
  direction: 'ltr' | 'rtl';
  setDirection: (direction: 'ltr' | 'rtl') => void;
  activeKey: string | undefined;
  setActiveKey: (key: string | undefined) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  focusIntentRef: React.MutableRefObject<'first' | 'last' | 'none'>;
  focusRequestVersion: number;
  requestFocus: (intent: 'first' | 'last') => void;
  registerItem: (item: MenuRegisteredItem) => () => void;
  items: readonly MenuRegisteredItem[];
  claimRadioGroup: () => number;
  releaseRadioGroup: (slot: number) => void;
  getRadioValue: (
    storageKey: MenuRadioStorageKey,
    defaultValue: string | undefined
  ) => string | undefined;
  setRadioValue: (storageKey: MenuRadioStorageKey, value: string) => void;
  activeSubmenuId: string | undefined;
  registerSubmenu: (id: string, close: (details: MenuSubOpenChangeDetails) => void) => () => void;
  requestSubmenuOpen: (id: string, event?: Event) => void;
  releaseSubmenu: (id: string) => void;
  registerTreeSubmenuClose: (
    id: string,
    close: (details: MenuSubOpenChangeDetails) => void
  ) => () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

type MenuRootContentContextValue = {
  contentId: string | undefined;
  registerContentId: (id: string) => () => void;
};

const MenuRootContentContext = createContext<MenuRootContentContextValue | null>(null);

type MenuGroupContextValue = {
  labelId: string;
  setLabelPresent: (present: boolean) => void;
};

const MenuGroupContext = createContext<MenuGroupContextValue | null>(null);

type MenuRadioGroupContextValue = {
  id: string;
  value: string | undefined;
  select: (value: string, event: Event) => void;
  registerValue: (value: string) => () => void;
};

const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

type MenuSubContextValue = {
  open: boolean;
  contentId: string;
  triggerId: string;
  defaultContentId: string;
  defaultTriggerId: string;
  setContentId: (id: string) => void;
  setTriggerId: (id: string) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLElement | null>;
  focusIntentRef: React.MutableRefObject<'first' | 'last' | 'none'>;
  focusRequestVersion: number;
  setTriggerElement: (element: HTMLElement | null) => void;
  setTriggerDisabled: (disabled: boolean) => void;
  setOpen: (
    open: boolean,
    details: MenuSubOpenChangeDetails,
    focusIntent?: 'first' | 'last' | 'none',
    restoreFocus?: boolean
  ) => void;
  overlay: ReturnType<typeof useAnchoredOverlay>;
};

const MenuSubContext = createContext<MenuSubContextValue | null>(null);

function useMenuContext(componentName: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`${componentName} must be used within Menu.Root`);
  return context;
}

function useMenuRootContentContext(componentName: string): MenuRootContentContextValue {
  const context = useContext(MenuRootContentContext);
  if (!context) throw new Error(`${componentName} must be used within Menu.Root`);
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function useMenuGroupContext(componentName: string): MenuGroupContextValue {
  const context = useContext(MenuGroupContext);
  if (!context) {
    throw new Error(`${componentName} must be used within Menu.Group or Menu.RadioGroup`);
  }
  return context;
}

function useMenuRadioGroupContext(componentName: string): MenuRadioGroupContextValue {
  const context = useContext(MenuRadioGroupContext);
  if (!context) throw new Error(`${componentName} must be used within Menu.RadioGroup`);
  return context;
}

function useMenuSubContext(componentName: string): MenuSubContextValue {
  const context = useContext(MenuSubContext);
  if (!context) throw new Error(`${componentName} must be used within Menu.Sub`);
  return context;
}

function getElementDirection(element: HTMLElement | null): 'ltr' | 'rtl' {
  if (!element) return 'ltr';
  const explicitDirection = element.closest('[dir]')?.getAttribute('dir');
  if (explicitDirection === 'rtl' || explicitDirection === 'ltr') return explicitDirection;
  return typeof getComputedStyle === 'function' && getComputedStyle(element).direction === 'rtl'
    ? 'rtl'
    : 'ltr';
}

function createPointReference(x: number, y: number, contextElement: HTMLElement): VirtualElement {
  return {
    contextElement,
    getBoundingClientRect: () => ({
      x,
      y,
      top: y,
      right: x,
      bottom: y,
      left: x,
      width: 0,
      height: 0,
      toJSON: () => ({})
    })
  };
}

function getSubmenuFallbackPlacements(direction: 'ltr' | 'rtl'): Placement[] {
  return direction === 'rtl'
    ? ['left-end', 'right-start', 'right-end']
    : ['right-end', 'left-start', 'left-end'];
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
  const [activeSubmenuId, setActiveSubmenuId] = useState<string>();
  const [contentId, setContentId] = useState<string>();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusIntentRef = useRef<'first' | 'last' | 'none'>('first');
  const [focusRequestVersion, setFocusRequestVersion] = useState(0);
  const itemsRef = useRef(new Map<string, MenuRegisteredItem>());
  const activeSubmenuIdRef = useRef<string | undefined>(undefined);
  const submenuClosersRef = useRef(new Map<string, (details: MenuSubOpenChangeDetails) => void>());
  const treeSubmenuClosersRef = useRef(
    new Map<string, (details: MenuSubOpenChangeDetails) => void>()
  );
  const radioValuesRef = useRef(new Map<MenuRadioStorageKey, string>());
  const availableRadioSlotsRef = useRef(new Set<number>());
  const nextRadioSlotRef = useRef(0);
  const closeTreeSubmenus = useCallback((details: MenuSubOpenChangeDetails) => {
    for (const close of Array.from(treeSubmenuClosersRef.current.values())) close(details);
  }, []);
  const setOpen = useCallback(
    (nextOpen: boolean, details: MenuOpenChangeDetails) => {
      if (disabled && nextOpen) return;
      if (!nextOpen) {
        const subDetails: MenuSubOpenChangeDetails =
          details.reason === 'selection'
            ? details
            : details.reason === 'escape'
              ? { reason: 'escape', event: details.event }
              : details.reason === 'outside-press'
                ? { reason: 'outside-press', event: details.event }
                : { reason: 'parent-close', event: details.event };
        closeTreeSubmenus(subDetails);
      }
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
      if (!nextOpen) setActiveKey(undefined);
    },
    [closeTreeSubmenus, disabled, onOpenChange, setOpenState]
  );
  const closeTree = useCallback(
    (details: MenuOpenChangeDetails, restoreFocus: boolean) => {
      setOpen(false, details);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [setOpen]
  );
  const closeLevel = useCallback(
    (details: MenuSubOpenChangeDetails, restoreFocus: boolean) => {
      closeTree(
        details.reason === 'escape'
          ? { reason: 'escape', event: details.event }
          : { reason: 'programmatic', event: details.event },
        restoreFocus
      );
    },
    [closeTree]
  );
  const registerSubmenu = useCallback(
    (id: string, close: (details: MenuSubOpenChangeDetails) => void) => {
      submenuClosersRef.current.set(id, close);
      return () => {
        if (submenuClosersRef.current.get(id) === close) submenuClosersRef.current.delete(id);
      };
    },
    []
  );
  const requestSubmenuOpen = useCallback((id: string, event?: Event) => {
    const currentId = activeSubmenuIdRef.current;
    if (currentId && currentId !== id) {
      submenuClosersRef.current.get(currentId)?.({ reason: 'sibling-open', event });
    }
    activeSubmenuIdRef.current = id;
    setActiveSubmenuId(id);
  }, []);
  const releaseSubmenu = useCallback((id: string) => {
    if (activeSubmenuIdRef.current !== id) return;
    activeSubmenuIdRef.current = undefined;
    setActiveSubmenuId(undefined);
  }, []);
  const closeActiveSubmenu = useCallback((details: MenuSubOpenChangeDetails) => {
    const activeId = activeSubmenuIdRef.current;
    const close = activeId ? submenuClosersRef.current.get(activeId) : undefined;
    if (!close) return false;
    close(details);
    return true;
  }, []);
  const registerTreeSubmenuClose = useCallback(
    (id: string, close: (details: MenuSubOpenChangeDetails) => void) => {
      treeSubmenuClosersRef.current.set(id, close);
      return () => {
        if (treeSubmenuClosersRef.current.get(id) === close) {
          treeSubmenuClosersRef.current.delete(id);
        }
      };
    },
    []
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
  const claimRadioGroup = useCallback(() => {
    const availableSlot = Array.from(availableRadioSlotsRef.current).sort(
      (left, right) => left - right
    )[0];
    if (availableSlot !== undefined) {
      availableRadioSlotsRef.current.delete(availableSlot);
      return availableSlot;
    }
    const slot = nextRadioSlotRef.current;
    nextRadioSlotRef.current += 1;
    return slot;
  }, []);
  const releaseRadioGroup = useCallback((slot: number) => {
    availableRadioSlotsRef.current.add(slot);
  }, []);
  const getRadioValue = useCallback(
    (storageKey: MenuRadioStorageKey, defaultValue: string | undefined) => {
      return radioValuesRef.current.get(storageKey) ?? defaultValue;
    },
    []
  );
  const setRadioValue = useCallback((storageKey: MenuRadioStorageKey, value: string) => {
    radioValuesRef.current.set(storageKey, value);
  }, []);
  const registerContentId = useCallback((id: string) => {
    setContentId(id);
    return () => setContentId((currentId) => (currentId === id ? undefined : currentId));
  }, []);
  const requestFocus = useCallback((intent: 'first' | 'last') => {
    focusIntentRef.current = intent;
    setFocusRequestVersion((version) => version + 1);
  }, []);
  const rootContentContextValue = useMemo<MenuRootContentContextValue>(
    () => ({ contentId, registerContentId }),
    [contentId, registerContentId]
  );
  const contextValue = useMemo<MenuContextValue>(
    () => ({
      open,
      disabled,
      setOpen,
      closeLevel,
      closeTree,
      closeActiveSubmenu,
      root: true,
      direction,
      setDirection,
      activeKey,
      setActiveKey,
      triggerRef,
      focusIntentRef,
      focusRequestVersion,
      requestFocus,
      registerItem,
      items,
      claimRadioGroup,
      releaseRadioGroup,
      getRadioValue,
      setRadioValue,
      activeSubmenuId,
      registerSubmenu,
      requestSubmenuOpen,
      releaseSubmenu,
      registerTreeSubmenuClose
    }),
    [
      activeKey,
      activeSubmenuId,
      claimRadioGroup,
      closeActiveSubmenu,
      closeLevel,
      closeTree,
      disabled,
      direction,
      focusRequestVersion,
      getRadioValue,
      items,
      open,
      registerItem,
      registerSubmenu,
      registerTreeSubmenuClose,
      releaseRadioGroup,
      releaseSubmenu,
      requestFocus,
      requestSubmenuOpen,
      setOpen,
      setRadioValue
    ]
  );

  return (
    <AnchoredOverlayTree>
      <MenuRootContentContext.Provider value={rootContentContextValue}>
        <MenuContext.Provider value={contextValue}>
          <Dropdown.Root
            open={open}
            onOpenChange={(nextOpen, details) => setOpen(nextOpen, details)}
          >
            {children}
          </Dropdown.Root>
        </MenuContext.Provider>
      </MenuRootContentContext.Provider>
    </AnchoredOverlayTree>
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
    requestFocus,
    setDirection
  } = useMenuContext('Menu.Trigger');
  const { contentId } = useMenuRootContentContext('Menu.Trigger');
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
          if (node) setDirection(getElementDirection(node));
          assignRef(anchorProps.ref, node);
          assignRef(forwardedRef, node);
        };
        const handleClick = (event: MouseEvent<HTMLElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          requestFocus('first');
          anchorProps.onClick(event);
        };
        const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
          anchorProps.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            requestFocus('first');
            setOpen(true, { reason: 'trigger', event: event.nativeEvent });
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            requestFocus('last');
            setOpen(true, { reason: 'trigger', event: event.nativeEvent });
          }
        };
        const triggerProps: MenuTriggerRenderProps = {
          ...anchorProps,
          ref,
          'aria-controls': contentId ?? anchorProps['aria-controls'],
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

const MenuContextTrigger = forwardRef<HTMLElement, MenuContextTriggerProps>(
  function MenuContextTrigger(
    {
      children,
      disabled: disabledProp = false,
      render,
      onContextMenu,
      onKeyDown,
      tabIndex = 0,
      ...props
    },
    forwardedRef
  ) {
    const {
      open,
      disabled: rootDisabled,
      setOpen,
      triggerRef,
      requestFocus,
      setDirection
    } = useMenuContext('Menu.ContextTrigger');
    const { contentId } = useMenuRootContentContext('Menu.ContextTrigger');
    const disabled = rootDisabled || disabledProp;
    const [positionReference, setPositionReference] = useState<VirtualElement | null>(null);
    const openAtPoint = useCallback(
      (element: HTMLElement, x: number, y: number, event: Event) => {
        setPositionReference(createPointReference(x, y, element));
        requestFocus('first');
        setOpen(true, { reason: 'context-menu', event });
      },
      [requestFocus, setOpen]
    );
    const ref = useCallback(
      (node: HTMLElement | null) => {
        triggerRef.current = node;
        if (node) setDirection(getElementDirection(node));
        assignRef(forwardedRef, node);
      },
      [forwardedRef, setDirection, triggerRef]
    );
    const handleContextMenu = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        onContextMenu?.(event);
        if (event.defaultPrevented || disabled) return;
        event.preventDefault();
        openAtPoint(event.currentTarget, event.clientX, event.clientY, event.nativeEvent);
      },
      [disabled, onContextMenu, openAtPoint]
    );
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
        event.preventDefault();
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        const direction = getElementDirection(element);
        openAtPoint(
          element,
          direction === 'rtl' ? rect.right : rect.left,
          rect.bottom,
          event.nativeEvent
        );
      },
      [disabled, onKeyDown, openAtPoint]
    );
    const renderProps: MenuContextTriggerRenderProps = {
      ...props,
      ref,
      tabIndex,
      'aria-controls': contentId,
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      'aria-disabled': disabled || undefined,
      onContextMenu: handleContextMenu,
      onKeyDown: handleKeyDown,
      children
    };

    return (
      <Dropdown.Reference
        positionReference={positionReference}
        render={(referenceProps) => {
          const mergedRef = (node: HTMLElement | null) => {
            assignRef(referenceProps.ref, node);
            assignRef(renderProps.ref, node);
          };
          const propsWithReference = { ...renderProps, ref: mergedRef };
          if (render) return render(propsWithReference, { open, disabled });
          const { ref: contextRef, ...nativeProps } = propsWithReference;
          return <div {...nativeProps} ref={contextRef as Ref<HTMLDivElement>} />;
        }}
      />
    );
  }
);

type MenuItemsContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
  children?: ReactNode;
  render?: (props: MenuContentRenderProps, state: MenuContentRenderState) => ReactElement;
  state: MenuContentRenderState;
};

const MenuItemsContent = forwardRef<HTMLDivElement, MenuItemsContentProps>(
  function MenuItemsContent(
    { children, onKeyDown, onScrollCapture, render, state, ...props },
    forwardedRef
  ) {
    const {
      open,
      closeLevel,
      closeTree,
      closeActiveSubmenu,
      root,
      direction,
      activeKey,
      setActiveKey,
      triggerRef,
      focusIntentRef,
      focusRequestVersion,
      items
    } = useMenuContext('Menu.Content');
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
      (key: string | undefined, navigationEvent?: Event) => {
        if (!key) return;
        const target = items.find((item) => item.key === key);
        if (!target) return;
        if (navigationEvent && target.key !== activeKey) {
          closeActiveSubmenu({ reason: 'keyboard', event: navigationEvent });
        }
        setActiveKey(target.key);
        target.element.focus();
        target.element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      },
      [activeKey, closeActiveSubmenu, items, setActiveKey]
    );
    const handleScrollCapture = useCallback(
      (event: UIEvent<HTMLDivElement>) => {
        onScrollCapture?.(event);
        if (event.defaultPrevented || !event.currentTarget.contains(event.target as Node)) return;
        closeActiveSubmenu({ reason: 'parent-scroll', event: event.nativeEvent });
      },
      [closeActiveSubmenu, onScrollCapture]
    );

    useLayoutEffect(() => {
      if (!open || focusIntentRef.current === 'none') return;
      const targetKey =
        focusIntentRef.current === 'last'
          ? getLastEnabledCollectionKey(focusableItems)
          : getFirstEnabledCollectionKey(focusableItems);
      if (!targetKey) return;
      focusIntentRef.current = 'none';
      focusKey(targetKey);

      const target = items.find((item) => item.key === targetKey);
      if (!target) return;
      queueMicrotask(() => {
        const activeElement = document.activeElement;
        if (
          target.element.isConnected &&
          (activeElement === triggerRef.current || activeElement === document.body)
        ) {
          target.element.focus();
        }
      });
    }, [focusIntentRef, focusKey, focusRequestVersion, focusableItems, items, open, triggerRef]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const target = event.target;
        if (target instanceof Node && !event.currentTarget.contains(target)) return;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          focusKey(
            getAdjacentCollectionKey(
              focusableItems,
              activeKey,
              event.key === 'ArrowDown' ? 1 : -1,
              true
            ),
            event.nativeEvent
          );
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          focusKey(
            event.key === 'Home'
              ? getFirstEnabledCollectionKey(focusableItems)
              : getLastEnabledCollectionKey(focusableItems),
            event.nativeEvent
          );
        } else if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          const details = { reason: 'escape', event: event.nativeEvent } as const;
          if (!closeActiveSubmenu(details)) closeLevel(details, true);
        } else if (!root && event.key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft')) {
          event.preventDefault();
          event.stopPropagation();
          closeLevel({ reason: 'keyboard', event: event.nativeEvent }, true);
        } else if (event.key === 'Tab') {
          closeTree({ reason: 'programmatic', event: event.nativeEvent }, false);
        } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          event.preventDefault();
          clearTimeout(searchTimeout.current);
          searchBuffer.current += event.key.toLocaleLowerCase();
          focusKey(
            findCollectionKeyByPrefix(focusableItems, searchBuffer.current, activeKey),
            event.nativeEvent
          );
          searchTimeout.current = setTimeout(() => {
            searchBuffer.current = '';
          }, 500);
        }
      },
      [
        activeKey,
        closeActiveSubmenu,
        closeLevel,
        closeTree,
        direction,
        focusKey,
        focusableItems,
        onKeyDown,
        root
      ]
    );

    const renderProps: MenuContentRenderProps = {
      ...props,
      ref: forwardedRef,
      role: 'menu',
      'data-open': state.open || undefined,
      'data-closed': !state.open || undefined,
      onKeyDown: handleKeyDown,
      onScrollCapture: handleScrollCapture,
      children
    };

    if (render) return render(renderProps, state);
    const { ref: contentRef, ...nativeContentProps } = renderProps;
    return <div {...nativeContentProps} ref={contentRef} />;
  }
);

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  {
    children,
    className,
    id,
    onKeyDown,
    render,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  forwardedRef
) {
  const { registerContentId } = useMenuRootContentContext('Menu.Content');
  useLayoutEffect(() => (id ? registerContentId(id) : undefined), [id, registerContentId]);

  return (
    <Dropdown.Content
      {...props}
      id={id}
      render={(contentProps, state) => {
        const {
          ref: contentRef,
          children: _children,
          id: contentId,
          ...nativeContentProps
        } = contentProps;
        const ref = (node: HTMLDivElement | null) => {
          assignRef(contentRef, node);
          assignRef(forwardedRef, node);
        };
        return (
          <MenuItemsContent
            {...nativeContentProps}
            ref={ref}
            id={contentId}
            className={className}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            onKeyDown={onKeyDown}
            render={render}
            state={state}
          >
            {children}
          </MenuItemsContent>
        );
      }}
    />
  );
});

const MenuGroup = forwardRef<HTMLElement, MenuGroupProps>(function MenuGroup(
  { children, render, 'aria-labelledby': ariaLabelledBy, ...props },
  forwardedRef
) {
  const generatedLabelId = useId();
  const [labelPresent, setLabelPresent] = useState(false);
  const contextValue = useMemo<MenuGroupContextValue>(
    () => ({ labelId: `menu-group-label-${generatedLabelId}`, setLabelPresent }),
    [generatedLabelId]
  );
  const renderProps: MenuGroupRenderProps = {
    ...props,
    ref: forwardedRef,
    role: 'group',
    'aria-labelledby': labelPresent ? contextValue.labelId : ariaLabelledBy
  };

  const group = render ? (
    render(renderProps)
  ) : (
    <div {...renderProps} ref={forwardedRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );

  return <MenuGroupContext.Provider value={contextValue}>{group}</MenuGroupContext.Provider>;
});

const MenuGroupLabel = forwardRef<HTMLElement, MenuGroupLabelProps>(function MenuGroupLabel(
  { children, render, ...props },
  forwardedRef
) {
  const { labelId, setLabelPresent } = useMenuGroupContext('Menu.GroupLabel');

  useLayoutEffect(() => {
    setLabelPresent(true);
    return () => setLabelPresent(false);
  }, [setLabelPresent]);

  const renderProps: MenuGroupLabelRenderProps = {
    ...props,
    ref: forwardedRef,
    id: labelId
  };

  if (render) return render(renderProps);
  return (
    <span {...renderProps} ref={forwardedRef as Ref<HTMLSpanElement>}>
      {children}
    </span>
  );
});

const MenuRadioGroup = forwardRef<HTMLElement, MenuRadioGroupProps>(function MenuRadioGroup(
  {
    children,
    value: valueProp,
    defaultValue,
    onValueChange,
    render,
    id,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  forwardedRef
) {
  const generatedId = useId();
  const groupId = id ?? `menu-radio-group-${generatedId}`;
  const { claimRadioGroup, releaseRadioGroup, getRadioValue, setRadioValue } =
    useMenuContext('Menu.RadioGroup');
  const radioStorageKeyRef = useRef<MenuRadioStorageKey | undefined>(undefined);
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlled ? valueProp : uncontrolledValue;
  const [labelPresent, setLabelPresent] = useState(false);
  const valuesRef = useRef(new Map<string, number>());
  const select = useCallback(
    (nextValue: string, event: Event) => {
      if (nextValue === value) return;
      if (!controlled) {
        setUncontrolledValue(nextValue);
        const storageKey = radioStorageKeyRef.current;
        if (storageKey !== undefined) setRadioValue(storageKey, nextValue);
      }
      onValueChange?.(nextValue, { previousValue: value, event });
    },
    [controlled, onValueChange, setRadioValue, value]
  );
  const registerValue = useCallback((registeredValue: string) => {
    const count = valuesRef.current.get(registeredValue) ?? 0;
    const environment = (
      globalThis as typeof globalThis & {
        process?: { env?: { NODE_ENV?: string } };
      }
    ).process?.env?.NODE_ENV;
    if (count > 0 && environment !== 'production') {
      console.error(`[Kiskadee] Menu.RadioGroup received duplicate value "${registeredValue}".`);
    }
    valuesRef.current.set(registeredValue, count + 1);
    return () => {
      const nextCount = (valuesRef.current.get(registeredValue) ?? 1) - 1;
      if (nextCount > 0) valuesRef.current.set(registeredValue, nextCount);
      else valuesRef.current.delete(registeredValue);
    };
  }, []);
  const groupContext = useMemo<MenuGroupContextValue>(
    () => ({ labelId: `${groupId}-label`, setLabelPresent }),
    [groupId]
  );
  const radioContext = useMemo<MenuRadioGroupContextValue>(
    () => ({ id: groupId, value, select, registerValue }),
    [groupId, registerValue, select, value]
  );
  const renderProps: MenuRadioGroupRenderProps = {
    ...props,
    ref: forwardedRef,
    id: groupId,
    role: 'group',
    'aria-labelledby': labelPresent ? groupContext.labelId : ariaLabelledBy
  };
  const group = render ? (
    render(renderProps)
  ) : (
    <div {...renderProps} ref={forwardedRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );

  useLayoutEffect(() => {
    const claimedSlot = id === undefined ? claimRadioGroup() : undefined;
    const storageKey: MenuRadioStorageKey = claimedSlot ?? (`id:${id}` as const);
    radioStorageKeyRef.current = storageKey;
    if (!controlled) {
      setUncontrolledValue(getRadioValue(storageKey, defaultValue));
    }
    return () => {
      radioStorageKeyRef.current = undefined;
      if (claimedSlot !== undefined) releaseRadioGroup(claimedSlot);
    };
  }, [claimRadioGroup, controlled, defaultValue, getRadioValue, id, releaseRadioGroup]);

  return (
    <MenuRadioGroupContext.Provider value={radioContext}>
      <MenuGroupContext.Provider value={groupContext}>{group}</MenuGroupContext.Provider>
    </MenuRadioGroupContext.Provider>
  );
});

const MenuCheckboxItem = forwardRef<HTMLElement, MenuCheckboxItemProps>(function MenuCheckboxItem(
  {
    children,
    value,
    textValue,
    controlState: controlStateProp,
    defaultControlState,
    disabled = false,
    closeOnSelect = true,
    onControlStateChange,
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
  const itemKey = value ?? `menu-checkbox-item-${generatedId}`;
  const { closeTree, activeKey, setActiveKey, registerItem } = useMenuContext('Menu.CheckboxItem');
  const localRef = useRef<HTMLElement | null>(null);
  const active = activeKey === itemKey;
  const { controlState, toggle } = useControlState({
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    onControlStateChange
  });

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
      if (event.defaultPrevented) return;
      toggle();
      if (closeOnSelect) {
        closeTree({ reason: 'selection', event: event.nativeEvent }, true);
      }
    },
    [closeOnSelect, closeTree, disabled, onSelect, toggle]
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
  const renderProps: MenuCheckboxItemRenderProps = {
    ...props,
    ref,
    role: 'menuitemcheckbox',
    tabIndex: active ? 0 : -1,
    'aria-checked': controlState,
    'aria-disabled': disabled || undefined,
    'data-active': active || undefined,
    'data-checked': controlState || undefined,
    'data-disabled': disabled || undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseMove: handleMouseMove
  };

  if (render) return render(renderProps, { active, controlState, disabled });
  const { ref: itemRef, ...nativeItemProps } = renderProps;
  return (
    <div {...nativeItemProps} ref={itemRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );
});

const MenuRadioItem = forwardRef<HTMLElement, MenuRadioItemProps>(function MenuRadioItem(
  {
    children,
    value,
    textValue,
    disabled = false,
    closeOnSelect = true,
    onSelect,
    onClick,
    onKeyDown,
    onMouseMove,
    render,
    ...props
  },
  forwardedRef
) {
  const radioGroup = useMenuRadioGroupContext('Menu.RadioItem');
  const itemKey = `${radioGroup.id}-item-${value}`;
  const { closeTree, activeKey, setActiveKey, registerItem } = useMenuContext('Menu.RadioItem');
  const localRef = useRef<HTMLElement | null>(null);
  const active = activeKey === itemKey;
  const checked = radioGroup.value === value;

  useLayoutEffect(() => radioGroup.registerValue(value), [radioGroup, value]);
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
      if (event.defaultPrevented) return;
      radioGroup.select(value, event.nativeEvent);
      if (closeOnSelect) {
        closeTree({ reason: 'selection', event: event.nativeEvent }, true);
      }
    },
    [closeOnSelect, closeTree, disabled, onSelect, radioGroup, value]
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
  const renderProps: MenuRadioItemRenderProps = {
    ...props,
    ref,
    role: 'menuitemradio',
    tabIndex: active ? 0 : -1,
    'aria-checked': checked,
    'aria-disabled': disabled || undefined,
    'data-active': active || undefined,
    'data-checked': checked || undefined,
    'data-disabled': disabled || undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseMove: handleMouseMove
  };

  if (render) return render(renderProps, { active, checked, disabled });
  const { ref: itemRef, ...nativeItemProps } = renderProps;
  return (
    <div {...nativeItemProps} ref={itemRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );
});

function MenuSub({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement,
  offset = 0,
  collisionPadding = 8,
  portalled = true,
  portalContainer,
  width = 'content'
}: MenuSubProps) {
  const generatedId = useId();
  const submenuId = `menu-sub-${generatedId}`;
  const defaultTriggerId = `${submenuId}-trigger`;
  const defaultContentId = `${submenuId}-content`;
  const [triggerId, setTriggerId] = useState(defaultTriggerId);
  const [contentId, setContentId] = useState(defaultContentId);
  const {
    open: parentOpen,
    activeSubmenuId,
    direction,
    registerSubmenu,
    requestSubmenuOpen,
    releaseSubmenu,
    registerTreeSubmenuClose
  } = useMenuContext('Menu.Sub');
  const [openState, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen
  });
  const controlled = openProp !== undefined;
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [triggerDisabled, setTriggerDisabled] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const focusIntentRef = useRef<'first' | 'last' | 'none'>('none');
  const [focusRequestVersion, setFocusRequestVersion] = useState(0);
  const lastOpenChangeRequestRef = useRef<{ event: Event; open: boolean } | null>(null);
  const initialOpenRegisteredRef = useRef(false);
  const open = parentOpen && openState && activeSubmenuId === submenuId;
  const setOpen = useCallback(
    (
      nextOpen: boolean,
      details: MenuSubOpenChangeDetails,
      focusIntent: 'first' | 'last' | 'none' = 'none',
      restoreFocus = false
    ) => {
      if (
        details.event &&
        lastOpenChangeRequestRef.current?.event === details.event &&
        lastOpenChangeRequestRef.current.open === nextOpen
      ) {
        return;
      }
      if (details.event) {
        lastOpenChangeRequestRef.current = { event: details.event, open: nextOpen };
      }
      if (nextOpen) {
        if (triggerDisabled) return;
        focusIntentRef.current = focusIntent;
        if (!controlled) requestSubmenuOpen(submenuId, details.event);
        if (open && focusIntent !== 'none') {
          setFocusRequestVersion((version) => version + 1);
        }
      } else if (!controlled) {
        releaseSubmenu(submenuId);
      }
      if (nextOpen !== openState) {
        setOpenState(nextOpen);
        onOpenChange?.(nextOpen, details);
      }
      if (!nextOpen && restoreFocus) triggerRef.current?.focus();
    },
    [
      onOpenChange,
      open,
      openState,
      controlled,
      releaseSubmenu,
      requestSubmenuOpen,
      setOpenState,
      submenuId,
      triggerDisabled
    ]
  );
  const closeFromOwner = useCallback(
    (details: MenuSubOpenChangeDetails) => setOpen(false, details),
    [setOpen]
  );
  const handleOverlayOpenChange = useCallback(
    (nextOpen: boolean, event: Event | undefined, reason: OpenChangeReason) => {
      if (reason === 'hover' || reason === 'safe-polygon') {
        const activeElement = typeof document === 'undefined' ? null : document.activeElement;
        const restoreFocus = Boolean(
          !nextOpen && activeElement instanceof Node && contentRef.current?.contains(activeElement)
        );
        setOpen(nextOpen, { reason: 'hover', event }, 'none', restoreFocus);
      } else if (!nextOpen && reason === 'escape-key') {
        setOpen(false, { reason: 'escape', event }, 'none', true);
      } else if (!nextOpen && reason === 'outside-press') {
        setOpen(false, { reason: 'outside-press', event });
      }
    },
    [setOpen]
  );
  const overlay = useAnchoredOverlay({
    open,
    referenceElement: triggerElement,
    placement: placement ?? (direction === 'rtl' ? 'left-start' : 'right-start'),
    fallbackPlacements: getSubmenuFallbackPlacements(direction),
    offset,
    collisionPadding,
    shiftCrossAxis: true,
    portalled,
    portalContainer,
    width,
    dismissBubbles: { escapeKey: false, outsidePress: true },
    dismissEscapeKey: false,
    hover: {
      enabled: !triggerDisabled,
      mouseOnly: true,
      delay: { open: 100, close: 150 },
      handleClose: safePolygon()
    },
    onOpenChange: handleOverlayOpenChange
  });
  const contextValue = useMemo<MenuSubContextValue>(
    () => ({
      open,
      contentId,
      triggerId,
      defaultContentId,
      defaultTriggerId,
      setContentId,
      setTriggerId,
      triggerRef,
      contentRef,
      focusIntentRef,
      focusRequestVersion,
      setTriggerElement,
      setTriggerDisabled,
      setOpen,
      overlay
    }),
    [
      contentId,
      defaultContentId,
      defaultTriggerId,
      focusRequestVersion,
      open,
      overlay,
      setOpen,
      triggerId
    ]
  );

  useLayoutEffect(
    () => registerSubmenu(submenuId, closeFromOwner),
    [closeFromOwner, registerSubmenu, submenuId]
  );
  useLayoutEffect(
    () => registerTreeSubmenuClose(submenuId, closeFromOwner),
    [closeFromOwner, registerTreeSubmenuClose, submenuId]
  );
  useLayoutEffect(() => {
    const shouldRegister = parentOpen && openState;
    if (shouldRegister && !initialOpenRegisteredRef.current) {
      requestSubmenuOpen(submenuId);
    } else if (!shouldRegister) {
      releaseSubmenu(submenuId);
    }
    initialOpenRegisteredRef.current = shouldRegister;
  }, [openState, parentOpen, releaseSubmenu, requestSubmenuOpen, submenuId]);

  return <MenuSubContext.Provider value={contextValue}>{children}</MenuSubContext.Provider>;
}

const MenuSubTrigger = forwardRef<HTMLElement, MenuSubTriggerProps>(function MenuSubTrigger(
  {
    children,
    value,
    textValue,
    disabled = false,
    render,
    onClick,
    onKeyDown,
    onMouseMove,
    id,
    ...props
  },
  forwardedRef
) {
  const generatedId = useId();
  const itemKey = value ?? `menu-sub-trigger-${generatedId}`;
  const { direction, activeKey, setActiveKey, registerItem } = useMenuContext('Menu.SubTrigger');
  const sub = useMenuSubContext('Menu.SubTrigger');
  const localRef = useRef<HTMLElement | null>(null);
  const active = activeKey === itemKey;
  const resolvedId = id ?? sub.defaultTriggerId;

  useLayoutEffect(() => {
    const element = localRef.current;
    if (!element) return;
    return registerItem({ key: itemKey, element, disabled, textValue });
  }, [disabled, itemKey, registerItem, textValue]);
  useLayoutEffect(() => sub.setTriggerDisabled(disabled), [disabled, sub.setTriggerDisabled]);
  useLayoutEffect(() => sub.setTriggerId(resolvedId), [resolvedId, sub.setTriggerId]);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      sub.triggerRef.current = node;
      sub.setTriggerElement(node);
      assignRef(forwardedRef, node);
    },
    [forwardedRef, sub.setTriggerElement, sub.triggerRef]
  );
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) {
        if (disabled) event.preventDefault();
        return;
      }
      sub.setOpen(true, { reason: 'trigger', event: event.nativeEvent }, 'first');
    },
    [disabled, onClick, sub.setOpen]
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      const forwardKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      if (event.key === 'Enter' || event.key === ' ' || event.key === forwardKey) {
        event.preventDefault();
        event.stopPropagation();
        sub.setOpen(true, { reason: 'keyboard', event: event.nativeEvent }, 'first');
      }
    },
    [direction, disabled, onKeyDown, sub.setOpen]
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
  const renderProps: MenuSubTriggerRenderProps = {
    ...props,
    ref,
    id: resolvedId,
    role: 'menuitem',
    tabIndex: active ? 0 : -1,
    'aria-controls': sub.contentId,
    'aria-expanded': sub.open,
    'aria-haspopup': 'menu',
    'aria-disabled': disabled || undefined,
    'data-active': active || undefined,
    'data-disabled': disabled || undefined,
    'data-open': sub.open || undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseMove: handleMouseMove
  };
  const interactionProps = sub.overlay.getReferenceProps(
    renderProps as HTMLProps<HTMLElement>
  ) as unknown as MenuSubTriggerRenderProps;

  if (render) return render(interactionProps, { active, disabled, open: sub.open });
  const { ref: triggerElementRef, ...nativeTriggerProps } = interactionProps;
  return (
    <div {...nativeTriggerProps} ref={triggerElementRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );
});

const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(function MenuSubContent(
  { children, forceMount = false, id, style, onKeyDown, render, ...props },
  forwardedRef
) {
  const parentContext = useMenuContext('Menu.SubContent');
  const sub = useMenuSubContext('Menu.SubContent');
  const resolvedId = id ?? sub.defaultContentId;
  const [activeKey, setActiveKey] = useState<string>();
  const [registrationVersion, setRegistrationVersion] = useState(0);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string>();
  const itemsRef = useRef(new Map<string, MenuRegisteredItem>());
  const activeSubmenuIdRef = useRef<string | undefined>(undefined);
  const submenuClosersRef = useRef(new Map<string, (details: MenuSubOpenChangeDetails) => void>());
  const registerItem = useCallback((item: MenuRegisteredItem) => {
    itemsRef.current.set(item.key, item);
    setRegistrationVersion((version) => version + 1);
    return () => {
      if (itemsRef.current.get(item.key) === item) itemsRef.current.delete(item.key);
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
  const registerSubmenu = useCallback(
    (submenuId: string, close: (details: MenuSubOpenChangeDetails) => void) => {
      submenuClosersRef.current.set(submenuId, close);
      return () => {
        if (submenuClosersRef.current.get(submenuId) === close) {
          submenuClosersRef.current.delete(submenuId);
        }
      };
    },
    []
  );
  const requestSubmenuOpen = useCallback((submenuId: string, event?: Event) => {
    const currentId = activeSubmenuIdRef.current;
    if (currentId && currentId !== submenuId) {
      submenuClosersRef.current.get(currentId)?.({ reason: 'sibling-open', event });
    }
    activeSubmenuIdRef.current = submenuId;
    setActiveSubmenuId(submenuId);
  }, []);
  const releaseSubmenu = useCallback((submenuId: string) => {
    if (activeSubmenuIdRef.current !== submenuId) return;
    activeSubmenuIdRef.current = undefined;
    setActiveSubmenuId(undefined);
  }, []);
  const closeActiveSubmenu = useCallback((details: MenuSubOpenChangeDetails) => {
    const activeId = activeSubmenuIdRef.current;
    const close = activeId ? submenuClosersRef.current.get(activeId) : undefined;
    if (!close) return false;
    close(details);
    return true;
  }, []);
  const closeLevel = useCallback(
    (details: MenuSubOpenChangeDetails, restoreFocus: boolean) => {
      sub.setOpen(false, details, 'none', restoreFocus);
    },
    [sub.setOpen]
  );
  const setOpen = useCallback(
    (nextOpen: boolean, details: MenuOpenChangeDetails) => {
      if (nextOpen) return;
      closeLevel(
        details.reason === 'escape'
          ? { reason: 'escape', event: details.event }
          : { reason: 'programmatic', event: details.event },
        details.reason === 'escape'
      );
    },
    [closeLevel]
  );
  const requestFocus = useCallback(
    (intent: 'first' | 'last') => {
      sub.focusIntentRef.current = intent;
      sub.setOpen(true, { reason: 'programmatic' }, intent);
    },
    [sub.focusIntentRef, sub.setOpen]
  );
  const contextValue = useMemo<MenuContextValue>(
    () => ({
      open: sub.open,
      disabled: false,
      setOpen,
      closeLevel,
      closeTree: parentContext.closeTree,
      closeActiveSubmenu,
      root: false,
      direction: parentContext.direction,
      setDirection: parentContext.setDirection,
      activeKey,
      setActiveKey,
      triggerRef: sub.triggerRef,
      focusIntentRef: sub.focusIntentRef,
      focusRequestVersion: sub.focusRequestVersion,
      requestFocus,
      registerItem,
      items,
      claimRadioGroup: parentContext.claimRadioGroup,
      releaseRadioGroup: parentContext.releaseRadioGroup,
      getRadioValue: parentContext.getRadioValue,
      setRadioValue: parentContext.setRadioValue,
      activeSubmenuId,
      registerSubmenu,
      requestSubmenuOpen,
      releaseSubmenu,
      registerTreeSubmenuClose: parentContext.registerTreeSubmenuClose
    }),
    [
      activeKey,
      activeSubmenuId,
      closeActiveSubmenu,
      closeLevel,
      items,
      parentContext.claimRadioGroup,
      parentContext.closeTree,
      parentContext.direction,
      parentContext.getRadioValue,
      parentContext.registerTreeSubmenuClose,
      parentContext.releaseRadioGroup,
      parentContext.setRadioValue,
      parentContext.setDirection,
      registerItem,
      registerSubmenu,
      releaseSubmenu,
      requestFocus,
      requestSubmenuOpen,
      setOpen,
      sub.focusRequestVersion,
      sub.open,
      sub.triggerRef
    ]
  );
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      sub.contentRef.current = node;
      sub.overlay.floatingRef(node);
      assignRef(forwardedRef, node);
    },
    [forwardedRef, sub.contentRef, sub.overlay]
  );
  useLayoutEffect(() => sub.setContentId(resolvedId), [resolvedId, sub.setContentId]);

  if (!sub.open && !forceMount) return null;

  const floatingProps = sub.overlay.getFloatingProps({
    ...props,
    id: resolvedId,
    'aria-labelledby': sub.triggerId,
    'aria-hidden': sub.open ? props['aria-hidden'] : true,
    inert: sub.open ? props.inert : true,
    'data-open': sub.open || undefined,
    'data-closed': !sub.open || undefined,
    'data-placement': sub.overlay.placement,
    style: { ...sub.overlay.floatingStyles, ...style },
    onKeyDown
  } as HTMLProps<HTMLDivElement>) as unknown as HTMLAttributes<HTMLDivElement>;
  const state: MenuContentRenderState = {
    open: sub.open,
    positioned: sub.overlay.positioned,
    placement: sub.overlay.placement,
    availableHeight: sub.overlay.availableHeight,
    availableWidth: sub.overlay.availableWidth
  };

  return sub.overlay.renderFloating(
    <MenuContext.Provider value={contextValue}>
      <MenuItemsContent {...floatingProps} ref={ref} render={render} state={state}>
        {children}
      </MenuItemsContent>
    </MenuContext.Provider>
  );
});

const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(
  {
    children,
    value,
    textValue,
    disabled = false,
    closeOnSelect = true,
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
  const { closeTree, activeKey, setActiveKey, registerItem } = useMenuContext('Menu.Item');
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
      if (!event.defaultPrevented && closeOnSelect) {
        closeTree({ reason: 'selection', event: event.nativeEvent }, true);
      }
    },
    [closeOnSelect, closeTree, disabled, onSelect]
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
  ContextTrigger: MenuContextTrigger,
  Content: MenuContent,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent
};
