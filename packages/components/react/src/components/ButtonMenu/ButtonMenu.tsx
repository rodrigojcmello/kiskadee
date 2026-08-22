import type { DropdownIntent } from '@kiskadee/core';
import {
  Menu as HeadlessMenu,
  type MenuCheckboxItemProps,
  type MenuContentProps,
  type MenuGroupLabelProps,
  type MenuGroupProps,
  type MenuItemProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuRootProps,
  type MenuSubContentProps,
  type MenuSubProps,
  type MenuSubTriggerProps
} from '@kiskadee/react-headless/menu';
import type {
  MenuTree,
  MenuTreeNode,
  MenuTreeRadioItem,
  MenuTreeSelectionDetails
} from '@kiskadee/react-headless/menu-tree';
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref
} from 'react';
import { forwardRef, isValidElement } from 'react';
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import {
  type MenuTreeIconRenderer,
  renderMenuTreeIcon
} from '../../shared/MenuTreeIconRenderer.ts';
import { flattenFragmentChildren } from '../../shared/utils/flattenFragmentChildren.ts';
import { Button } from '../Button/Button.tsx';
import type { ButtonGroupProps, ButtonProps } from '../Button/Button.types.ts';
import { Dropdown } from '../Dropdown/Dropdown.tsx';
import type {
  DropdownEndTextProps,
  DropdownGroupLabelProps,
  DropdownItemsLayout,
  DropdownSeparatorProps,
  DropdownVisualProps
} from '../Dropdown/Dropdown.types.ts';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';

export type ButtonMenuButtonGroupProps = Pick<
  ButtonGroupProps,
  'scale' | 'radius' | 'emphasis' | 'intent' | 'surfaceContext' | 'shadow'
>;

type ButtonMenuGroupOwnedButtonProp = keyof ButtonMenuButtonGroupProps | 'radiusEffect';

export type ButtonMenuRootProps = MenuRootProps &
  DropdownVisualProps & {
    /** Shared visual contract for the one- or two-button trigger group. */
    buttonGroup?: ButtonMenuButtonGroupProps;
  };

export type ButtonMenuActionProps = Omit<ButtonProps, ButtonMenuGroupOwnedButtonProp>;

export type ButtonMenuTriggerProps = Omit<
  ButtonProps,
  | ButtonMenuGroupOwnedButtonProp
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-pressed'
  | 'controlState'
  | 'status'
  | 'toggle'
  | 'type'
>;

export type ButtonMenuContentProps = Omit<MenuContentProps, 'forceMount' | 'render'> & {
  itemsLayout?: DropdownItemsLayout;
  surfaceProps?: ComponentPropsWithoutRef<'div'>;
};

export type ButtonMenuItemProps = Omit<MenuItemProps, 'render'> & {
  intent?: DropdownIntent;
  href?: string;
  target?: string;
  rel?: string;
};

export type ButtonMenuCheckboxItemProps = Omit<MenuCheckboxItemProps, 'render'> & {
  intent?: DropdownIntent;
};

export type ButtonMenuTreeContentProps<TIcon = unknown> = {
  tree: MenuTree<TIcon>;
  itemsLayout?: DropdownItemsLayout;
  renderIcon?: MenuTreeIconRenderer<TIcon>;
};

export type ButtonMenuGroupProps = Omit<MenuGroupProps, 'render'>;

export type ButtonMenuRadioGroupProps = Omit<MenuRadioGroupProps, 'render'>;

export type ButtonMenuRadioItemProps = Omit<MenuRadioItemProps, 'render'> & {
  intent?: DropdownIntent;
};

export type ButtonMenuSubProps = MenuSubProps;

export type ButtonMenuSubTriggerProps = Omit<MenuSubTriggerProps, 'render'> & {
  intent?: DropdownIntent;
};

export type ButtonMenuSubContentProps = Omit<MenuSubContentProps, 'forceMount' | 'render'> & {
  itemsLayout?: DropdownItemsLayout;
  surfaceProps?: ComponentPropsWithoutRef<'div'>;
};

export type ButtonMenuGroupLabelProps = Omit<MenuGroupLabelProps, 'render'> &
  Omit<DropdownGroupLabelProps, 'id'>;

export type ButtonMenuShortcutProps = Omit<DropdownEndTextProps, 'aria-hidden'>;

export type ButtonMenuSeparatorProps = Omit<DropdownSeparatorProps, 'role'>;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function ButtonMenuPopupVisual({
  children,
  itemsLayout,
  surfaceProps
}: Pick<ButtonMenuContentProps, 'children' | 'itemsLayout' | 'surfaceProps'>) {
  return (
    <Dropdown.Surface {...surfaceProps}>
      <Dropdown.ScrollArea>
        <Dropdown.Items layout={itemsLayout}>{children}</Dropdown.Items>
      </Dropdown.ScrollArea>
    </Dropdown.Surface>
  );
}

function ButtonMenuRoot({
  buttonGroup,
  children,
  scale,
  radius,
  shadow,
  presence,
  classNames,
  ...menuProps
}: ButtonMenuRootProps) {
  const buttonChildren = [];
  const popupChildren = [];
  for (const child of flattenFragmentChildren(children)) {
    if (
      isValidElement(child) &&
      (child.type === ButtonMenuAction || child.type === ButtonMenuTrigger)
    ) {
      buttonChildren.push(child);
    } else {
      popupChildren.push(child);
    }
  }

  return (
    <Dropdown.VisualProvider
      scale={scale}
      radius={radius}
      shadow={shadow}
      presence={presence}
      classNames={classNames}
    >
      <HeadlessMenu.Root {...menuProps}>
        <Button.Group {...buttonGroup}>{buttonChildren}</Button.Group>
        {popupChildren}
      </HeadlessMenu.Root>
    </Dropdown.VisualProvider>
  );
}

const ButtonMenuAction = forwardRef<HTMLButtonElement, ButtonMenuActionProps>(
  function ButtonMenuAction(props, ref) {
    return <Button {...props} ref={ref} />;
  }
);

const ButtonMenuTrigger = forwardRef<HTMLButtonElement, ButtonMenuTriggerProps>(
  function ButtonMenuTrigger(
    { activationFeedback, children, className, disabled, id, onClick, onKeyDown, ...buttonProps },
    forwardedRef
  ) {
    return (
      <HeadlessMenu.Trigger
        id={id}
        disabled={disabled}
        onClick={
          onClick ? (event) => onClick(event as ReactMouseEvent<HTMLButtonElement>) : undefined
        }
        onKeyDown={
          onKeyDown
            ? (event) => onKeyDown(event as ReactKeyboardEvent<HTMLButtonElement>)
            : undefined
        }
        render={(triggerProps, state) => {
          const { ref: triggerRef, ...behaviorProps } = triggerProps;
          const mergedRef = (node: HTMLButtonElement | null) => {
            assignRef(triggerRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Button
              {...buttonProps}
              {...(behaviorProps as unknown as ButtonProps)}
              ref={mergedRef}
              type="button"
              status={state.open ? 'pressed' : undefined}
              activationFeedback={state.open ? false : activationFeedback}
              className={className}
            >
              {children}
              <Button.Disclosure />
            </Button>
          );
        }}
      />
    );
  }
);

const ButtonMenuContent = forwardRef<HTMLDivElement, ButtonMenuContentProps>(
  function ButtonMenuContent({ children, itemsLayout, surfaceProps, ...props }, ref) {
    return (
      <Dropdown.Presence>
        {({ forceMount, render }) => (
          <HeadlessMenu.Content
            {...props}
            ref={ref}
            forceMount={forceMount}
            render={(contentProps, state) =>
              render(
                {
                  ...contentProps,
                  children: (
                    <ButtonMenuPopupVisual itemsLayout={itemsLayout} surfaceProps={surfaceProps}>
                      {children}
                    </ButtonMenuPopupVisual>
                  )
                },
                state
              )
            }
          >
            {children}
          </HeadlessMenu.Content>
        )}
      </Dropdown.Presence>
    );
  }
);

const ButtonMenuItem = forwardRef<HTMLElement, ButtonMenuItemProps>(function ButtonMenuItem(
  { children, disabled, intent, href, target, rel, onSelect, ...props },
  forwardedRef
) {
  return (
    <HeadlessMenu.Item
      {...props}
      disabled={disabled}
      onSelect={onSelect}
      render={(menuProps, state) => {
        if (href) {
          return (
            <Dropdown.Item
              intent={intent}
              disabled={state.disabled}
              render={(visualProps) => {
                const { ref: visualRef, className: visualClassName, ...visualRest } = visualProps;
                const { ref: menuRef, className: menuClassName, ...menuRest } = menuProps;
                const ref = (node: HTMLAnchorElement | null) => {
                  assignRef(visualRef, node);
                  assignRef(menuRef, node);
                  assignRef(forwardedRef, node);
                };
                return (
                  <a
                    {...visualRest}
                    {...menuRest}
                    ref={ref}
                    href={href}
                    target={target}
                    rel={rel}
                    className={`${visualClassName ?? ''} ${menuClassName ?? ''}`.trim()}
                  >
                    {children}
                  </a>
                );
              }}
            />
          );
        }

        const { ref: menuRef, ...itemProps } = menuProps;
        const ref = (node: HTMLElement | null) => {
          assignRef(menuRef, node);
          assignRef(forwardedRef, node);
        };
        return (
          <Dropdown.Item {...itemProps} ref={ref} intent={intent} disabled={state.disabled}>
            {children}
          </Dropdown.Item>
        );
      }}
    />
  );
});

const ButtonMenuSeparator = forwardRef<HTMLDivElement, ButtonMenuSeparatorProps>(
  function ButtonMenuSeparator(props, ref) {
    return <Dropdown.Separator {...props} ref={ref} role="separator" />;
  }
);

const ButtonMenuGroup = forwardRef<HTMLDivElement, ButtonMenuGroupProps>(function ButtonMenuGroup(
  { children, ...props },
  forwardedRef
) {
  return (
    <HeadlessMenu.Group
      {...props}
      render={(menuProps) => {
        const { ref: menuRef, ...groupProps } = menuProps;
        const ref = (node: HTMLDivElement | null) => {
          assignRef(menuRef, node);
          assignRef(forwardedRef, node);
        };
        return (
          <Dropdown.Group {...groupProps} ref={ref}>
            {children}
          </Dropdown.Group>
        );
      }}
    >
      {children}
    </HeadlessMenu.Group>
  );
});

const ButtonMenuGroupLabel = forwardRef<HTMLSpanElement, ButtonMenuGroupLabelProps>(
  function ButtonMenuGroupLabel({ children, ...props }, forwardedRef) {
    return (
      <HeadlessMenu.GroupLabel
        {...props}
        render={(menuProps) => {
          const { ref: menuRef, ...labelProps } = menuProps;
          const ref = (node: HTMLSpanElement | null) => {
            assignRef(menuRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Dropdown.GroupLabel {...labelProps} ref={ref}>
              {children}
            </Dropdown.GroupLabel>
          );
        }}
      >
        {children}
      </HeadlessMenu.GroupLabel>
    );
  }
);

const ButtonMenuRadioGroup = forwardRef<HTMLElement, ButtonMenuRadioGroupProps>(
  function ButtonMenuRadioGroup({ children, ...props }, forwardedRef) {
    return (
      <HeadlessMenu.RadioGroup
        {...props}
        render={(menuProps) => {
          const { ref: menuRef, ...groupProps } = menuProps;
          const ref = (node: HTMLDivElement | null) => {
            assignRef(menuRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Dropdown.Group {...groupProps} ref={ref}>
              {children}
            </Dropdown.Group>
          );
        }}
      >
        {children}
      </HeadlessMenu.RadioGroup>
    );
  }
);

const ButtonMenuCheckboxItem = forwardRef<HTMLElement, ButtonMenuCheckboxItemProps>(
  function ButtonMenuCheckboxItem(
    { children, disabled, intent, onSelect, ...props },
    forwardedRef
  ) {
    return (
      <HeadlessMenu.CheckboxItem
        {...props}
        disabled={disabled}
        onSelect={onSelect}
        render={(menuProps, state) => {
          const { ref: menuRef, ...itemProps } = menuProps;
          const ref = (node: HTMLElement | null) => {
            assignRef(menuRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Dropdown.Item
              {...itemProps}
              ref={ref}
              intent={intent}
              selected={state.controlState}
              disabled={state.disabled}
            >
              <Dropdown.Checkmark visible={state.controlState} />
              {children}
            </Dropdown.Item>
          );
        }}
      >
        {children}
      </HeadlessMenu.CheckboxItem>
    );
  }
);

const ButtonMenuRadioItem = forwardRef<HTMLElement, ButtonMenuRadioItemProps>(
  function ButtonMenuRadioItem({ children, disabled, intent, onSelect, ...props }, forwardedRef) {
    return (
      <HeadlessMenu.RadioItem
        {...props}
        disabled={disabled}
        onSelect={onSelect}
        render={(menuProps, state) => {
          const { ref: menuRef, ...itemProps } = menuProps;
          const ref = (node: HTMLElement | null) => {
            assignRef(menuRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Dropdown.Item
              {...itemProps}
              ref={ref}
              intent={intent}
              selected={state.checked}
              disabled={state.disabled}
            >
              <Dropdown.RadioMark visible={state.checked} />
              {children}
            </Dropdown.Item>
          );
        }}
      >
        {children}
      </HeadlessMenu.RadioItem>
    );
  }
);

const ButtonMenuSub = HeadlessMenu.Sub;

const ButtonMenuSubTrigger = forwardRef<HTMLElement, ButtonMenuSubTriggerProps>(
  function ButtonMenuSubTrigger({ children, disabled, intent, ...props }, forwardedRef) {
    const submenuIcon = useEssentialIcon('chevron-end');
    return (
      <HeadlessMenu.SubTrigger
        {...props}
        disabled={disabled}
        render={(menuProps, state) => {
          const { ref: menuRef, ...itemProps } = menuProps;
          const ref = (node: HTMLElement | null) => {
            assignRef(menuRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Dropdown.Item
              {...itemProps}
              ref={ref}
              intent={intent}
              hovered={state.open}
              disabled={state.disabled}
            >
              {children}
              {submenuIcon ? (
                <Dropdown.Trailing>
                  <FamilyResolvedIcon name={submenuIcon} />
                </Dropdown.Trailing>
              ) : null}
            </Dropdown.Item>
          );
        }}
      >
        {children}
      </HeadlessMenu.SubTrigger>
    );
  }
);

const ButtonMenuSubContent = forwardRef<HTMLDivElement, ButtonMenuSubContentProps>(
  function ButtonMenuSubContent({ children, itemsLayout, surfaceProps, ...props }, forwardedRef) {
    return (
      <Dropdown.Presence>
        {({ forceMount, render }) => (
          <HeadlessMenu.SubContent
            {...props}
            ref={forwardedRef}
            forceMount={forceMount}
            render={(contentProps, state) =>
              render(
                {
                  ...contentProps,
                  children: (
                    <ButtonMenuPopupVisual itemsLayout={itemsLayout} surfaceProps={surfaceProps}>
                      {children}
                    </ButtonMenuPopupVisual>
                  )
                },
                state
              )
            }
          >
            {children}
          </HeadlessMenu.SubContent>
        )}
      </Dropdown.Presence>
    );
  }
);

const ButtonMenuShortcut = forwardRef<HTMLSpanElement, ButtonMenuShortcutProps>(
  function ButtonMenuShortcut(props, ref) {
    return <Dropdown.EndText {...props} ref={ref} aria-hidden="true" />;
  }
);

function ButtonMenuTreeItemContent<TIcon>({
  node,
  renderIcon
}: {
  node:
    | Extract<MenuTreeNode<TIcon>, { type: 'item' | 'link' | 'checkbox' | 'submenu' }>
    | MenuTreeRadioItem<TIcon>;
  renderIcon?: MenuTreeIconRenderer<TIcon>;
}) {
  const leadingIcon = renderMenuTreeIcon(node.icon, 'leading', node, renderIcon);
  const trailingIcon = renderMenuTreeIcon(node.trailingIcon, 'trailing', node, renderIcon);
  return (
    <>
      {leadingIcon != null ? <Dropdown.Icon>{leadingIcon}</Dropdown.Icon> : null}
      <Dropdown.Label>{node.label}</Dropdown.Label>
      {node.description ? <Dropdown.Description>{node.description}</Dropdown.Description> : null}
      {node.endText ? <ButtonMenuShortcut>{node.endText}</ButtonMenuShortcut> : null}
      {trailingIcon != null ? <Dropdown.Trailing>{trailingIcon}</Dropdown.Trailing> : null}
    </>
  );
}

function isUngroupedButtonMenuTreeRow<TIcon>(node: MenuTreeNode<TIcon>): boolean {
  return (
    node.type === 'item' ||
    node.type === 'link' ||
    node.type === 'checkbox' ||
    node.type === 'submenu'
  );
}

function renderButtonMenuTreeNodes<TIcon>(
  nodes: readonly MenuTreeNode<TIcon>[],
  renderIcon: MenuTreeIconRenderer<TIcon> | undefined,
  insideExplicitGroup = false
): ReactNode[] {
  if (!insideExplicitGroup) {
    const renderedNodes: ReactNode[] = [];
    let ungroupedRows: MenuTreeNode<TIcon>[] = [];
    const flushUngroupedRows = () => {
      if (ungroupedRows.length === 0) return;
      const rows = ungroupedRows;
      ungroupedRows = [];
      renderedNodes.push(
        <Dropdown.Group key={`menu-tree-visual-group-${rows[0]?.id}`}>
          {renderButtonMenuTreeNodes(rows, renderIcon, true)}
        </Dropdown.Group>
      );
    };

    for (const node of nodes) {
      if (isUngroupedButtonMenuTreeRow(node)) {
        ungroupedRows.push(node);
        continue;
      }
      flushUngroupedRows();
      renderedNodes.push(...renderButtonMenuTreeNodes([node], renderIcon, true));
    }
    flushUngroupedRows();
    return renderedNodes;
  }

  return nodes.map((node) => {
    if (node.type === 'separator') {
      return <ButtonMenuSeparator key={node.id} />;
    }

    if (node.type === 'group') {
      return (
        <ButtonMenuGroup key={node.id}>
          {node.label ? <ButtonMenuGroupLabel>{node.label}</ButtonMenuGroupLabel> : null}
          {renderButtonMenuTreeNodes(node.items, renderIcon, true)}
        </ButtonMenuGroup>
      );
    }

    if (node.type === 'radio-group') {
      return (
        <ButtonMenuRadioGroup
          key={node.id}
          id={node.id}
          value={node.value}
          defaultValue={node.defaultValue}
          onValueChange={(value) => {
            const selectedItem = node.items.find((item) => item.value === value);
            if (!selectedItem) return;
            node.onValueChange?.(value, {
              id: selectedItem.id,
              type: 'radio',
              value
            });
          }}
        >
          {node.label ? <ButtonMenuGroupLabel>{node.label}</ButtonMenuGroupLabel> : null}
          {node.items.map((item) => (
            <ButtonMenuRadioItem
              key={item.id}
              value={item.value}
              textValue={item.textValue ?? item.label}
              disabled={item.disabled}
              intent={item.intent}
            >
              <ButtonMenuTreeItemContent node={item} renderIcon={renderIcon} />
            </ButtonMenuRadioItem>
          ))}
        </ButtonMenuRadioGroup>
      );
    }

    if (node.type === 'checkbox') {
      return (
        <ButtonMenuCheckboxItem
          key={node.id}
          value={node.id}
          textValue={node.textValue ?? node.label}
          controlState={node.controlState}
          defaultControlState={node.defaultControlState}
          disabled={node.disabled}
          intent={node.intent}
          closeOnSelect={node.closeOnSelect ?? true}
          onControlStateChange={(controlState) =>
            node.onControlStateChange?.(controlState, {
              id: node.id,
              type: 'checkbox',
              controlState
            })
          }
        >
          <ButtonMenuTreeItemContent node={node} renderIcon={renderIcon} />
        </ButtonMenuCheckboxItem>
      );
    }

    if (node.type === 'submenu') {
      return (
        <ButtonMenuSub key={node.id}>
          <ButtonMenuSubTrigger
            textValue={node.textValue ?? node.label}
            disabled={node.disabled}
            intent={node.intent}
          >
            <ButtonMenuTreeItemContent node={node} renderIcon={renderIcon} />
          </ButtonMenuSubTrigger>
          <ButtonMenuSubContent>
            {renderButtonMenuTreeNodes(node.items, renderIcon)}
          </ButtonMenuSubContent>
        </ButtonMenuSub>
      );
    }

    const selectionDetails: MenuTreeSelectionDetails = {
      id: node.id,
      type: node.type
    };
    return (
      <ButtonMenuItem
        key={node.id}
        value={node.id}
        textValue={node.textValue ?? node.label}
        disabled={node.disabled}
        intent={node.intent}
        href={node.type === 'link' ? node.href : undefined}
        target={node.type === 'link' ? node.target : undefined}
        rel={node.type === 'link' ? node.rel : undefined}
        closeOnSelect={node.closeOnSelect ?? true}
        onSelect={() => node.onSelect?.(selectionDetails)}
      >
        <ButtonMenuTreeItemContent node={node} renderIcon={renderIcon} />
      </ButtonMenuItem>
    );
  });
}

function ButtonMenuTreeContent<TIcon>({
  tree,
  itemsLayout,
  renderIcon
}: ButtonMenuTreeContentProps<TIcon>) {
  return (
    <ButtonMenuContent aria-label={tree.title} itemsLayout={itemsLayout}>
      {renderButtonMenuTreeNodes(tree.items, renderIcon)}
    </ButtonMenuContent>
  );
}

export const ButtonMenu = {
  Root: ButtonMenuRoot,
  Action: ButtonMenuAction,
  Trigger: ButtonMenuTrigger,
  Content: ButtonMenuContent,
  Group: ButtonMenuGroup,
  GroupLabel: ButtonMenuGroupLabel,
  CheckboxItem: ButtonMenuCheckboxItem,
  RadioGroup: ButtonMenuRadioGroup,
  RadioItem: ButtonMenuRadioItem,
  Sub: ButtonMenuSub,
  SubTrigger: ButtonMenuSubTrigger,
  SubContent: ButtonMenuSubContent,
  Item: ButtonMenuItem,
  Icon: Dropdown.Icon,
  Label: Dropdown.Label,
  Description: Dropdown.Description,
  Shortcut: ButtonMenuShortcut,
  Trailing: Dropdown.Trailing,
  Separator: ButtonMenuSeparator,
  TreeContent: ButtonMenuTreeContent
};
