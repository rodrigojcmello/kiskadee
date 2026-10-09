import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type RefObject,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';

export type AccordionClassNames = Partial<Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6', string>>;
export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  multiple?: boolean;
  expandedItems?: readonly string[];
  defaultExpandedItems?: readonly string[];
  onExpandedItemsChange?: (items: string[]) => void;
  disabled?: boolean;
  interactionLocked?: boolean;
  classNames?: AccordionClassNames;
};
export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  disabled?: boolean;
};
export type AccordionHeaderProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};
export type AccordionPanelProps = HTMLAttributes<HTMLDivElement>;

type Group = {
  items: readonly string[];
  disabled: boolean;
  locked: boolean;
  toggle: (value: string) => void;
  classNames: AccordionClassNames;
};
type Item = {
  open: boolean;
  disabled: boolean;
  locked: boolean;
  toggle: () => void;
  triggerId: string;
  panelId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  classNames: AccordionClassNames;
};
const GroupContext = createContext<Group | null>(null);
const ItemContext = createContext<Item | null>(null);
const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ');
const normalize = (items: readonly string[], multiple: boolean) =>
  [...new Set(items)].slice(0, multiple ? undefined : 1);

export function useAccordionItemContext(): Item {
  const item = useContext(ItemContext);
  if (!item) throw new Error('Accordion.Header and Accordion.Panel require Accordion.Item.');
  return item;
}

const Root = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    multiple = false,
    expandedItems,
    defaultExpandedItems = [],
    onExpandedItemsChange,
    disabled = false,
    interactionLocked = false,
    classNames = {},
    className,
    children,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(() => normalize(defaultExpandedItems, multiple));
  const items = useMemo(
    () => normalize(expandedItems ?? internal, multiple),
    [expandedItems, internal, multiple]
  );
  const toggle = useCallback(
    (value: string) => {
      if (disabled || interactionLocked) return;
      const next = items.includes(value)
        ? items.filter((item) => item !== value)
        : multiple
          ? [...items, value]
          : [value];
      if (expandedItems === undefined) setInternal(next);
      onExpandedItemsChange?.(next);
    },
    [disabled, interactionLocked, items, multiple, expandedItems, onExpandedItemsChange]
  );
  const group = useMemo(
    () => ({ items, disabled, locked: interactionLocked, toggle, classNames }),
    [items, disabled, interactionLocked, toggle, classNames]
  );
  return (
    <GroupContext.Provider value={group}>
      <div {...props} ref={ref} className={join(classNames.e1, className)}>
        {children}
      </div>
    </GroupContext.Provider>
  );
});

const ItemRoot = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled = false, className, children, ...props },
  ref
) {
  const group = useContext(GroupContext);
  if (!group) throw new Error('Accordion.Item requires Accordion.');
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const open = group.items.includes(value);
  const unavailable = disabled || group.disabled;
  const item = useMemo(
    () => ({
      open,
      disabled: unavailable,
      locked: group.locked,
      toggle: () => {
        if (!unavailable) group.toggle(value);
      },
      triggerId: `${id}-trigger`,
      panelId: `${id}-panel`,
      triggerRef,
      classNames: group.classNames
    }),
    [open, unavailable, group.locked, group.toggle, group.classNames, value, id]
  );
  return (
    <ItemContext.Provider value={item}>
      <div
        {...props}
        ref={ref}
        className={join(group.classNames.e2, className)}
        data-expanded={open || undefined}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
});

/** Allows a styled CardAction to be the sole button; expansion never becomes selection. */
export function useAccordionHeader(props: ButtonHTMLAttributes<HTMLButtonElement> = {}) {
  const item = useAccordionItemContext();
  return {
    ...props,
    id: item.triggerId,
    type: 'button' as const,
    disabled: item.disabled || props.disabled,
    'aria-expanded': item.open,
    'aria-controls': item.panelId,
    'aria-pressed': undefined,
    className: join(item.classNames.e3, props.className),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      if (!event.defaultPrevented && !item.disabled && !props.disabled && !item.locked)
        item.toggle();
    }
  };
}

/** Semantic closure is immediate and independent from a visual exit animation. */
export function useAccordionPanel() {
  const item = useAccordionItemContext();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!item.open && ref.current?.contains(ref.current.ownerDocument.activeElement))
      item.triggerRef.current?.focus();
  }, [item.open, item.triggerRef]);
  return {
    ref,
    open: item.open,
    props: {
      id: item.panelId,
      'aria-labelledby': item.triggerId,
      'aria-hidden': !item.open || undefined,
      inert: !item.open || undefined
    }
  };
}

const Header = forwardRef<HTMLButtonElement, AccordionHeaderProps>(function AccordionHeader(
  { headingLevel = 3, ...props },
  ref
) {
  const item = useAccordionItemContext();
  const triggerProps = useAccordionHeader(props);
  const Heading = `h${headingLevel}` as 'h3';
  return (
    <Heading>
      <button
        {...triggerProps}
        ref={(node) => {
          item.triggerRef.current = node;
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
      />
    </Heading>
  );
});
const Panel = forwardRef<HTMLDivElement, AccordionPanelProps>(function AccordionPanel(props, ref) {
  const item = useAccordionItemContext();
  const panel = useAccordionPanel();
  return (
    <div
      {...props}
      {...panel.props}
      hidden={!panel.open}
      className={join(item.classNames.e6, props.className)}
      ref={(node) => {
        panel.ref.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
    />
  );
});
export const HeadlessAccordion = Object.assign(Root, { Item: ItemRoot, Header, Panel });
