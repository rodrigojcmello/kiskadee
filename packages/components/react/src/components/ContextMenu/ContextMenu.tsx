import {
  Menu as HeadlessMenu,
  type MenuContextTriggerProps,
  type MenuRootProps
} from '@kiskadee/react-headless/menu';
import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactElement, Ref } from 'react';
import { Children, cloneElement, forwardRef } from 'react';
import { ButtonMenu } from '../ButtonMenu/ButtonMenu.tsx';
import { Dropdown } from '../Dropdown/Dropdown.tsx';
import type { DropdownVisualProps } from '../Dropdown/Dropdown.types.ts';

export type ContextMenuRootProps = MenuRootProps & DropdownVisualProps;

export type ContextMenuTriggerProps = Omit<MenuContextTriggerProps, 'children' | 'render'> & {
  children: ReactElement<HTMLAttributes<HTMLElement>>;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function ContextMenuRoot({
  children,
  scale,
  radius,
  shadow,
  presence,
  leadingIconComposition,
  selectedItemBackground,
  classNames,
  ...menuProps
}: ContextMenuRootProps) {
  return (
    <Dropdown.VisualProvider
      scale={scale}
      radius={radius}
      shadow={shadow}
      presence={presence}
      leadingIconComposition={leadingIconComposition}
      selectedItemBackground={selectedItemBackground}
      classNames={classNames}
    >
      <HeadlessMenu.Root {...menuProps}>{children}</HeadlessMenu.Root>
    </Dropdown.VisualProvider>
  );
}

const ContextMenuTrigger = forwardRef<HTMLElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger({ children, onContextMenu, onKeyDown, ...props }, forwardedRef) {
    const child = Children.only(children);
    const childProps = child.props as HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };
    const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
      childProps.onContextMenu?.(event);
      if (!event.defaultPrevented) onContextMenu?.(event);
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      if (!event.defaultPrevented) onKeyDown?.(event);
    };

    return (
      <HeadlessMenu.ContextTrigger
        {...props}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        render={(triggerProps) => {
          const { ref: triggerRef, children: _triggerChildren, ...behaviorProps } = triggerProps;
          const ref = (node: HTMLElement | null) => {
            assignRef(triggerRef, node);
            assignRef(childProps.ref, node);
            assignRef(forwardedRef, node);
          };
          return cloneElement(
            child as ReactElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>,
            { ...childProps, ...behaviorProps, ref }
          );
        }}
      />
    );
  }
);

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ButtonMenu.Content,
  Group: ButtonMenu.Group,
  CheckboxGroup: ButtonMenu.CheckboxGroup,
  GroupLabel: ButtonMenu.GroupLabel,
  CheckboxItem: ButtonMenu.CheckboxItem,
  RadioGroup: ButtonMenu.RadioGroup,
  RadioItem: ButtonMenu.RadioItem,
  Sub: ButtonMenu.Sub,
  SubTrigger: ButtonMenu.SubTrigger,
  SubContent: ButtonMenu.SubContent,
  Item: ButtonMenu.Item,
  Icon: ButtonMenu.Icon,
  Label: ButtonMenu.Label,
  Description: ButtonMenu.Description,
  Shortcut: ButtonMenu.Shortcut,
  Trailing: ButtonMenu.Trailing,
  TreeContent: ButtonMenu.TreeContent
};
