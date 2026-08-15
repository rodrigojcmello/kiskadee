import './ButtonMenu.structural.scss';
import type { DropdownIntent } from '@kiskadee/core';
import type { MenuContentProps, MenuItemProps, MenuRootProps } from '@kiskadee/react-headless';
import { Menu as HeadlessMenu } from '@kiskadee/react-headless';
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  Ref
} from 'react';
import { forwardRef } from 'react';
import { Button } from '../Button/Button.tsx';
import type { ButtonProps } from '../Button/Button.types.ts';
import { Dropdown } from '../Dropdown/Dropdown.tsx';
import type { DropdownVisualProps } from '../Dropdown/Dropdown.types.ts';

export type ButtonMenuRootProps = MenuRootProps & DropdownVisualProps;

export type ButtonMenuActionProps = ButtonProps;

export type ButtonMenuTriggerProps = ButtonProps;

export type ButtonMenuContentProps = MenuContentProps & {
  surfaceProps?: ComponentPropsWithoutRef<'div'>;
};

export type ButtonMenuItemProps = Omit<MenuItemProps, 'render'> & {
  intent?: DropdownIntent;
  href?: string;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function ButtonMenuRoot({
  children,
  scale,
  radius,
  shadow,
  classNames,
  ...menuProps
}: ButtonMenuRootProps) {
  return (
    <Dropdown.VisualProvider scale={scale} radius={radius} shadow={shadow} classNames={classNames}>
      <HeadlessMenu.Root {...menuProps}>
        <div className="k-bmn">{children}</div>
      </HeadlessMenu.Root>
    </Dropdown.VisualProvider>
  );
}

const ButtonMenuAction = forwardRef<HTMLButtonElement, ButtonMenuActionProps>(
  function ButtonMenuAction({ className, ...props }, ref) {
    return <Button {...props} ref={ref} className={`k-bmn-a ${className ?? ''}`.trim()} />;
  }
);

const ButtonMenuTrigger = forwardRef<HTMLButtonElement, ButtonMenuTriggerProps>(
  function ButtonMenuTrigger(
    { children, className, disabled, onClick, onKeyDown, ...buttonProps },
    forwardedRef
  ) {
    return (
      <HeadlessMenu.Trigger
        disabled={disabled}
        onClick={
          onClick ? (event) => onClick(event as ReactMouseEvent<HTMLButtonElement>) : undefined
        }
        onKeyDown={
          onKeyDown
            ? (event) => onKeyDown(event as ReactKeyboardEvent<HTMLButtonElement>)
            : undefined
        }
        render={(triggerProps) => {
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
              disabled={disabled}
              className={`k-bmn-t ${className ?? ''}`.trim()}
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
  function ButtonMenuContent({ children, surfaceProps, ...props }, ref) {
    return (
      <HeadlessMenu.Content {...props} ref={ref}>
        <Dropdown.Surface {...surfaceProps}>
          <Dropdown.Items>{children}</Dropdown.Items>
        </Dropdown.Surface>
      </HeadlessMenu.Content>
    );
  }
);

const ButtonMenuItem = forwardRef<HTMLElement, ButtonMenuItemProps>(function ButtonMenuItem(
  { children, disabled, intent, href, onSelect, ...props },
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
                    className={`${visualClassName ?? ''} ${menuClassName ?? ''}`.trim()}
                  >
                    {children}
                  </a>
                );
              }}
            />
          );
        }

        return (
          <Dropdown.Item
            {...menuProps}
            ref={forwardedRef}
            intent={intent}
            disabled={state.disabled}
          >
            {children}
          </Dropdown.Item>
        );
      }}
    />
  );
});

export const ButtonMenu = {
  Root: ButtonMenuRoot,
  Action: ButtonMenuAction,
  Trigger: ButtonMenuTrigger,
  Content: ButtonMenuContent,
  Item: ButtonMenuItem,
  Icon: Dropdown.Icon,
  Label: Dropdown.Label,
  Description: Dropdown.Description,
  Trailing: Dropdown.Trailing,
  Separator: Dropdown.Separator
};
