import type { BottomSheetIntent } from '@kiskadee/core';
import {
  type BottomSheetOpenChangeDetails,
  useBottomSheetController
} from '@kiskadee/react-headless/bottom-sheet';
import type {
  MenuTree,
  MenuTreeNode,
  MenuTreeRadioGroup,
  MenuTreeRadioItem,
  MenuTreeSelectionDetails,
  MenuTreeSubmenu
} from '@kiskadee/react-headless/menu-tree';
import type { ReactElement, MouseEvent as ReactMouseEvent, ReactNode, Ref } from 'react';
import { forwardRef, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import {
  type MenuTreeIconRenderer,
  renderMenuTreeIcon
} from '../../shared/MenuTreeIconRenderer.ts';
import { flattenFragmentChildren } from '../../shared/utils/flattenFragmentChildren.ts';
import { BottomSheet, useBottomSheetResolvedOptions } from '../BottomSheet/BottomSheet.tsx';
import type { BottomSheetRootProps } from '../BottomSheet/BottomSheet.types.ts';
import { Button } from '../Button/Button.tsx';
import type { ButtonGroupProps, ButtonProps } from '../Button/Button.types.ts';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';
import { useBottomSheetPageTransitionEffect } from './effects/page-transition/BottomSheetPageTransition.loader.ts';

export type BottomSheetMenuButtonGroupProps = Pick<
  ButtonGroupProps,
  'scale' | 'radius' | 'emphasis' | 'intent' | 'surfaceContext' | 'shadow'
>;

type BottomSheetMenuGroupOwnedButtonProp = keyof BottomSheetMenuButtonGroupProps | 'radiusEffect';

export type BottomSheetMenuRootProps<TIcon = unknown> = Omit<
  BottomSheetRootProps,
  'children' | 'open' | 'defaultOpen' | 'onOpenChange'
> & {
  tree: MenuTree<TIcon>;
  renderIcon?: MenuTreeIconRenderer<TIcon>;
  children: ReactNode;
  buttonGroup?: BottomSheetMenuButtonGroupProps;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: BottomSheetOpenChangeDetails) => void;
  backLabel?: (parentTitle: string) => ReactNode;
  closeLabel?: string;
  onPageChange?: (path: readonly string[]) => void;
};

export type BottomSheetMenuActionProps = Omit<ButtonProps, BottomSheetMenuGroupOwnedButtonProp>;

export type BottomSheetMenuTriggerProps = Omit<
  ButtonProps,
  | BottomSheetMenuGroupOwnedButtonProp
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-pressed'
  | 'controlState'
  | 'status'
  | 'toggle'
  | 'type'
>;

type BottomSheetMenuPage<TIcon> = {
  id: string;
  title: string;
  items: readonly MenuTreeNode<TIcon>[];
};

function findSubmenu<TIcon>(
  nodes: readonly MenuTreeNode<TIcon>[],
  id: string
): MenuTreeSubmenu<TIcon> | undefined {
  for (const node of nodes) {
    if (node.type === 'submenu' && node.id === id) return node;
    if (node.type === 'group') {
      const submenu = findSubmenu(node.items, id);
      if (submenu) return submenu;
    }
  }
  return undefined;
}

function refreshPages<TIcon>(
  tree: MenuTree<TIcon>,
  currentPages: readonly BottomSheetMenuPage<TIcon>[]
): BottomSheetMenuPage<TIcon>[] {
  const pages: BottomSheetMenuPage<TIcon>[] = [
    { id: tree.id, title: tree.title, items: tree.items }
  ];
  let items = tree.items;

  for (const currentPage of currentPages.slice(1)) {
    const submenu = findSubmenu(items, currentPage.id);
    if (!submenu) break;
    pages.push({
      id: submenu.id,
      title: submenu.title ?? submenu.label,
      items: submenu.items
    });
    items = submenu.items;
  }

  return pages;
}

const noopPageChange = (_path: readonly string[]): void => {};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

const BottomSheetMenuAction = forwardRef<HTMLButtonElement, BottomSheetMenuActionProps>(
  function BottomSheetMenuAction(props, ref) {
    return <Button {...props} ref={ref} />;
  }
);

const BottomSheetMenuTrigger = forwardRef<HTMLButtonElement, BottomSheetMenuTriggerProps>(
  function BottomSheetMenuTrigger(
    { activationFeedback, children, className, disabled, id, onClick, ...buttonProps },
    forwardedRef
  ) {
    return (
      <BottomSheet.Trigger
        id={id}
        disabled={disabled}
        onClick={
          onClick ? (event) => onClick(event as ReactMouseEvent<HTMLButtonElement>) : undefined
        }
        render={(triggerProps, state) => {
          const { ref: triggerRef, ...behaviorProps } = triggerProps;
          const ref = (node: HTMLButtonElement | null) => {
            assignRef(triggerRef, node);
            assignRef(forwardedRef, node);
          };
          return (
            <Button
              {...buttonProps}
              {...(behaviorProps as unknown as ButtonProps)}
              ref={ref}
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

function BottomSheetMenuItemContent<TIcon>({
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
      {leadingIcon != null ? <BottomSheet.Icon>{leadingIcon}</BottomSheet.Icon> : null}
      <BottomSheet.Label>{node.label}</BottomSheet.Label>
      {node.description ? (
        <BottomSheet.Description>{node.description}</BottomSheet.Description>
      ) : null}
      {node.endText ? <BottomSheet.EndText>{node.endText}</BottomSheet.EndText> : null}
      {trailingIcon != null ? <BottomSheet.Trailing>{trailingIcon}</BottomSheet.Trailing> : null}
    </>
  );
}

function BottomSheetMenuRadioGroupView<TIcon>({
  node,
  renderIcon,
  uncontrolledValue,
  onUncontrolledValueChange
}: {
  node: MenuTreeRadioGroup<TIcon>;
  renderIcon?: MenuTreeIconRenderer<TIcon>;
  uncontrolledValue: string | undefined;
  onUncontrolledValueChange: (groupId: string, value: string) => void;
}) {
  const controller = useBottomSheetController();
  const value = node.value ?? uncontrolledValue ?? node.defaultValue;

  return (
    <BottomSheet.Group role="radiogroup" aria-label={node.label}>
      {node.label ? <BottomSheet.GroupLabel>{node.label}</BottomSheet.GroupLabel> : null}
      {node.items.map((item) => {
        const selected = item.value === value;
        return (
          <BottomSheet.Item
            key={item.id}
            role="radio"
            aria-checked={selected}
            selected={selected}
            disabled={item.disabled}
            intent={item.intent as BottomSheetIntent | undefined}
            onClick={(event) => {
              if (item.disabled) return;
              if (node.value === undefined) onUncontrolledValueChange(node.id, item.value);
              const details: MenuTreeSelectionDetails = {
                id: item.id,
                type: 'radio',
                value: item.value
              };
              node.onValueChange?.(item.value, details);
              controller.dismiss('selection', event.nativeEvent);
            }}
          >
            <BottomSheet.RadioMark visible={selected} />
            <BottomSheetMenuItemContent node={item} renderIcon={renderIcon} />
          </BottomSheet.Item>
        );
      })}
    </BottomSheet.Group>
  );
}

function BottomSheetMenuPageItems<TIcon>({
  nodes,
  renderIcon,
  onNavigate,
  onUncontrolledCheckboxValueChange,
  onUncontrolledRadioValueChange,
  uncontrolledCheckboxValues,
  uncontrolledRadioValues
}: {
  nodes: readonly MenuTreeNode<TIcon>[];
  renderIcon?: MenuTreeIconRenderer<TIcon>;
  onNavigate: (submenu: MenuTreeSubmenu<TIcon>) => void;
  onUncontrolledCheckboxValueChange: (itemId: string, controlState: boolean) => void;
  onUncontrolledRadioValueChange: (groupId: string, value: string) => void;
  uncontrolledCheckboxValues: Readonly<Record<string, boolean>>;
  uncontrolledRadioValues: Readonly<Record<string, string>>;
}) {
  const controller = useBottomSheetController();
  const submenuIcon = useEssentialIcon('chevron-end');
  return nodes.map((node) => {
    if (node.type === 'separator') return <BottomSheet.Separator key={node.id} />;

    if (node.type === 'group') {
      return (
        <BottomSheet.Group key={node.id}>
          {node.label ? <BottomSheet.GroupLabel>{node.label}</BottomSheet.GroupLabel> : null}
          <BottomSheetMenuPageItems
            nodes={node.items}
            renderIcon={renderIcon}
            onNavigate={onNavigate}
            onUncontrolledCheckboxValueChange={onUncontrolledCheckboxValueChange}
            onUncontrolledRadioValueChange={onUncontrolledRadioValueChange}
            uncontrolledCheckboxValues={uncontrolledCheckboxValues}
            uncontrolledRadioValues={uncontrolledRadioValues}
          />
        </BottomSheet.Group>
      );
    }

    if (node.type === 'radio-group') {
      return (
        <BottomSheetMenuRadioGroupView
          key={node.id}
          node={node}
          renderIcon={renderIcon}
          uncontrolledValue={uncontrolledRadioValues[node.id]}
          onUncontrolledValueChange={onUncontrolledRadioValueChange}
        />
      );
    }

    if (node.type === 'checkbox') {
      const controlState =
        node.controlState ??
        uncontrolledCheckboxValues[node.id] ??
        node.defaultControlState ??
        false;
      return (
        <BottomSheet.Item
          key={node.id}
          role="checkbox"
          aria-checked={controlState}
          selected={controlState}
          disabled={node.disabled}
          intent={node.intent as BottomSheetIntent | undefined}
          onClick={(event) => {
            if (node.disabled) return;
            const nextControlState = !controlState;
            if (node.controlState === undefined) {
              onUncontrolledCheckboxValueChange(node.id, nextControlState);
            }
            node.onControlStateChange?.(nextControlState, {
              id: node.id,
              type: 'checkbox',
              controlState: nextControlState
            });
            if (node.closeOnSelect ?? true) {
              controller.dismiss('selection', event.nativeEvent);
            }
          }}
        >
          <BottomSheet.Checkmark visible={controlState} />
          <BottomSheetMenuItemContent node={node} renderIcon={renderIcon} />
        </BottomSheet.Item>
      );
    }

    if (node.type === 'submenu') {
      return (
        <BottomSheet.Item
          key={node.id}
          disabled={node.disabled}
          intent={node.intent as BottomSheetIntent | undefined}
          onClick={() => {
            if (!node.disabled) onNavigate(node);
          }}
        >
          <BottomSheetMenuItemContent node={node} renderIcon={renderIcon} />
          {submenuIcon ? (
            <BottomSheet.Trailing functional>
              <FamilyResolvedIcon name={submenuIcon} />
            </BottomSheet.Trailing>
          ) : null}
        </BottomSheet.Item>
      );
    }

    const selectionDetails: MenuTreeSelectionDetails = {
      id: node.id,
      type: node.type
    };
    const handleSelection = (event: ReactMouseEvent<HTMLElement>) => {
      if (node.disabled) {
        event.preventDefault();
        return;
      }
      node.onSelect?.(selectionDetails);
      if (node.closeOnSelect ?? true) {
        controller.dismiss('selection', event.nativeEvent);
      }
    };

    return (
      <BottomSheet.Item
        key={node.id}
        disabled={node.disabled}
        intent={node.intent as BottomSheetIntent | undefined}
        render={(itemProps) => {
          const { ref, ...props } = itemProps;
          if (node.type === 'link') {
            return (
              <a
                {...props}
                ref={ref as Ref<HTMLAnchorElement>}
                href={node.href}
                target={node.target}
                rel={node.rel}
                tabIndex={node.disabled ? -1 : props.tabIndex}
                onClick={(event) => handleSelection(event)}
              >
                <BottomSheetMenuItemContent node={node} renderIcon={renderIcon} />
              </a>
            );
          }
          return (
            <button
              {...props}
              ref={ref as Ref<HTMLButtonElement>}
              type="button"
              disabled={node.disabled}
              onClick={(event) => handleSelection(event)}
            >
              <BottomSheetMenuItemContent node={node} renderIcon={renderIcon} />
            </button>
          );
        }}
      />
    );
  }) as ReactElement[];
}

function BottomSheetMenuNavigator<TIcon>({
  backLabel,
  closeLabel,
  onPagePathChange,
  renderIcon,
  tree
}: {
  backLabel: (parentTitle: string) => ReactNode;
  closeLabel: string;
  onPagePathChange: (path: readonly string[]) => void;
  renderIcon?: MenuTreeIconRenderer<TIcon>;
  tree: MenuTree<TIcon>;
}) {
  const controller = useBottomSheetController();
  const backIcon = useEssentialIcon('chevron-left');
  const options = useBottomSheetResolvedOptions();
  const transitionModule = useBottomSheetPageTransitionEffect(
    controller.open && options.pageTransition === 'slide'
  );
  const [pages, setPages] = useState<BottomSheetMenuPage<TIcon>[]>([
    { id: tree.id, title: tree.title, items: tree.items }
  ]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [uncontrolledRadioValues, setUncontrolledRadioValues] = useState<Record<string, string>>(
    {}
  );
  const [uncontrolledCheckboxValues, setUncontrolledCheckboxValues] = useState<
    Record<string, boolean>
  >({});
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const scrollPositionsRef = useRef(new Map<string, number>());
  const currentPage = pages.at(-1) ?? pages[0];
  const parentPage = pages.at(-2);
  const pagePath = JSON.stringify(pages.map((page) => page.id));

  useEffect(() => {
    if (!controller.open) {
      setPages([{ id: tree.id, title: tree.title, items: tree.items }]);
      setDirection('forward');
      scrollPositionsRef.current.clear();
      return;
    }

    setPages((current) => refreshPages(tree, current));
  }, [controller.open, tree.id, tree.items, tree.title]);

  useEffect(() => {
    onPagePathChange(JSON.parse(pagePath) as string[]);
    if (!controller.open) return;
    const frame = requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = scrollPositionsRef.current.get(currentPage.id) ?? 0;
      }
      titleRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [controller.open, currentPage.id, onPagePathChange, pagePath]);

  const navigate = useCallback(
    (submenu: MenuTreeSubmenu<TIcon>) => {
      if (bodyRef.current) {
        scrollPositionsRef.current.set(currentPage.id, bodyRef.current.scrollTop);
      }
      setDirection('forward');
      setPages((current) => [
        ...current,
        {
          id: submenu.id,
          title: submenu.title ?? submenu.label,
          items: submenu.items
        }
      ]);
    },
    [currentPage.id]
  );
  const goBack = useCallback(() => {
    if (!parentPage) return;
    if (bodyRef.current) {
      scrollPositionsRef.current.set(currentPage.id, bodyRef.current.scrollTop);
    }
    setDirection('back');
    setPages((current) => current.slice(0, -1));
  }, [currentPage.id, parentPage]);

  const handleUncontrolledRadioValueChange = useCallback((groupId: string, value: string) => {
    setUncontrolledRadioValues((current) => ({ ...current, [groupId]: value }));
  }, []);
  const handleUncontrolledCheckboxValueChange = useCallback(
    (itemId: string, controlState: boolean) => {
      setUncontrolledCheckboxValues((current) => ({ ...current, [itemId]: controlState }));
    },
    []
  );

  const pageItems = (
    <BottomSheetMenuPageItems
      nodes={currentPage.items}
      renderIcon={renderIcon}
      onNavigate={navigate}
      onUncontrolledCheckboxValueChange={handleUncontrolledCheckboxValueChange}
      onUncontrolledRadioValueChange={handleUncontrolledRadioValueChange}
      uncontrolledCheckboxValues={uncontrolledCheckboxValues}
      uncontrolledRadioValues={uncontrolledRadioValues}
    />
  );
  const page = transitionModule ? (
    <transitionModule.BottomSheetPageTransitionEffect direction={direction} pageId={currentPage.id}>
      {pageItems}
    </transitionModule.BottomSheetPageTransitionEffect>
  ) : (
    <BottomSheet.Page key={currentPage.id}>{pageItems}</BottomSheet.Page>
  );

  return (
    <>
      <BottomSheet.Header>
        <BottomSheet.HeaderActions>
          {parentPage ? (
            <Button onClick={goBack} aria-label={`Back to ${parentPage.title}`}>
              {backIcon ? (
                <Button.Icon>
                  <FamilyResolvedIcon name={backIcon} />
                </Button.Icon>
              ) : null}
              {backLabel(parentPage.title)}
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          <BottomSheet.Close aria-label={closeLabel} />
        </BottomSheet.HeaderActions>
        <BottomSheet.Title ref={titleRef}>{currentPage.title}</BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body ref={bodyRef}>
        <BottomSheet.PageViewport>{page}</BottomSheet.PageViewport>
      </BottomSheet.Body>
    </>
  );
}

function BottomSheetMenuRoot<TIcon>({
  tree,
  renderIcon,
  children,
  buttonGroup,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  backLabel = (parentTitle) => `Back to ${parentTitle}`,
  closeLabel = 'Close',
  onPageChange = noopPageChange,
  ...bottomSheetProps
}: BottomSheetMenuRootProps<TIcon>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const buttonChildren: ReactElement[] = [];
  for (const child of flattenFragmentChildren(children)) {
    if (
      isValidElement(child) &&
      (child.type === BottomSheetMenuAction || child.type === BottomSheetMenuTrigger)
    ) {
      buttonChildren.push(child);
    }
  }
  const handleOpenChange = useCallback(
    (nextOpen: boolean, details: BottomSheetOpenChangeDetails) => {
      if (openProp === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen, details);
    },
    [onOpenChange, openProp]
  );

  return (
    <BottomSheet.Root {...bottomSheetProps} open={open} onOpenChange={handleOpenChange}>
      <Button.Group {...buttonGroup}>{buttonChildren}</Button.Group>
      <BottomSheet.Content aria-label={tree.title}>
        <BottomSheetMenuNavigator
          tree={tree}
          renderIcon={renderIcon}
          backLabel={backLabel}
          closeLabel={closeLabel}
          onPagePathChange={onPageChange}
        />
      </BottomSheet.Content>
    </BottomSheet.Root>
  );
}

export const BottomSheetMenu = {
  Root: BottomSheetMenuRoot,
  Action: BottomSheetMenuAction,
  Trigger: BottomSheetMenuTrigger
};
