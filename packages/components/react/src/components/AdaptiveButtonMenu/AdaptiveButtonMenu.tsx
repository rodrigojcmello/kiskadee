import type { IconName } from '@kiskadee/icons/interface';
import type { BottomSheetOpenChangeDetails } from '@kiskadee/react-headless/bottom-sheet';
import type { MenuOpenChangeDetails } from '@kiskadee/react-headless/menu';
import type { MenuTree } from '@kiskadee/react-headless/menu-tree';
import type { ReactElement, ReactNode } from 'react';
import { isValidElement, useCallback, useRef, useState } from 'react';
import { useIsCompactViewport } from '../../shared/interaction/useIsCompactViewport.ts';
import { flattenFragmentChildren } from '../../shared/utils/flattenFragmentChildren.ts';
import type {
  BottomSheetMenuActionProps,
  BottomSheetMenuButtonGroupProps,
  BottomSheetMenuRootProps,
  BottomSheetMenuTriggerProps
} from '../BottomSheetMenu/BottomSheetMenu.tsx';
import { BottomSheetMenu } from '../BottomSheetMenu/BottomSheetMenu.tsx';
import type {
  ButtonMenuActionProps,
  ButtonMenuRootProps,
  ButtonMenuTriggerProps
} from '../ButtonMenu/ButtonMenu.tsx';
import { ButtonMenu } from '../ButtonMenu/ButtonMenu.tsx';

export type AdaptiveButtonMenuPresentation = 'adaptive' | 'dropdown' | 'bottom-sheet';
export type AdaptiveButtonMenuResolvedPresentation = Exclude<
  AdaptiveButtonMenuPresentation,
  'adaptive'
>;

export type AdaptiveButtonMenuOpenChangeDetails = {
  presentation: AdaptiveButtonMenuResolvedPresentation;
  reason: MenuOpenChangeDetails['reason'] | BottomSheetOpenChangeDetails['reason'];
  event?: Event;
};

export type AdaptiveButtonMenuDropdownProps = Omit<
  ButtonMenuRootProps,
  'buttonGroup' | 'children' | 'defaultOpen' | 'onOpenChange' | 'open'
> & {
  itemsLayout?: Parameters<typeof ButtonMenu.TreeContent>[0]['itemsLayout'];
};

export type AdaptiveButtonMenuBottomSheetProps = Omit<
  BottomSheetMenuRootProps,
  'buttonGroup' | 'children' | 'defaultOpen' | 'onOpenChange' | 'open' | 'tree'
>;

export type AdaptiveButtonMenuRootProps = {
  tree: MenuTree<IconName>;
  children: ReactNode;
  presentation?: AdaptiveButtonMenuPresentation;
  buttonGroup?: BottomSheetMenuButtonGroupProps;
  dropdown?: AdaptiveButtonMenuDropdownProps;
  bottomSheet?: AdaptiveButtonMenuBottomSheetProps;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: AdaptiveButtonMenuOpenChangeDetails) => void;
};

export type AdaptiveButtonMenuActionProps = ButtonMenuActionProps;
export type AdaptiveButtonMenuTriggerProps = ButtonMenuTriggerProps;

function AdaptiveButtonMenuAction(_props: AdaptiveButtonMenuActionProps): null {
  return null;
}

function AdaptiveButtonMenuTrigger(_props: AdaptiveButtonMenuTriggerProps): null {
  return null;
}

function resolveDesiredPresentation(
  presentation: AdaptiveButtonMenuPresentation,
  compact: boolean
): AdaptiveButtonMenuResolvedPresentation {
  if (presentation !== 'adaptive') return presentation;
  return compact ? 'bottom-sheet' : 'dropdown';
}

function projectChildren(
  children: ReactNode,
  presenter: AdaptiveButtonMenuResolvedPresentation
): ReactElement[] {
  const projected: ReactElement[] = [];
  for (const child of flattenFragmentChildren(children)) {
    if (!isValidElement<AdaptiveButtonMenuActionProps | AdaptiveButtonMenuTriggerProps>(child)) {
      continue;
    }
    if (child.type === AdaptiveButtonMenuAction) {
      projected.push(
        presenter === 'dropdown' ? (
          <ButtonMenu.Action key={child.key} {...(child.props as AdaptiveButtonMenuActionProps)} />
        ) : (
          <BottomSheetMenu.Action
            key={child.key}
            {...(child.props as BottomSheetMenuActionProps)}
          />
        )
      );
    } else if (child.type === AdaptiveButtonMenuTrigger) {
      projected.push(
        presenter === 'dropdown' ? (
          <ButtonMenu.Trigger
            key={child.key}
            {...(child.props as AdaptiveButtonMenuTriggerProps)}
          />
        ) : (
          <BottomSheetMenu.Trigger
            key={child.key}
            {...(child.props as BottomSheetMenuTriggerProps)}
          />
        )
      );
    }
  }
  return projected;
}

function AdaptiveButtonMenuRoot({
  tree,
  children,
  presentation = 'adaptive',
  buttonGroup,
  dropdown = {},
  bottomSheet = {},
  open: openProp,
  defaultOpen = false,
  onOpenChange
}: AdaptiveButtonMenuRootProps) {
  const compact = useIsCompactViewport();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const desiredPresenter = resolveDesiredPresentation(presentation, compact);
  const openPresenterRef = useRef<AdaptiveButtonMenuResolvedPresentation>(desiredPresenter);
  if (!open) openPresenterRef.current = desiredPresenter;
  const presenter = open ? openPresenterRef.current : desiredPresenter;
  const presenterChildren = projectChildren(children, presenter);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, details: MenuOpenChangeDetails | BottomSheetOpenChangeDetails) => {
      if (nextOpen) openPresenterRef.current = desiredPresenter;
      if (openProp === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen, {
        presentation: openPresenterRef.current,
        reason: details.reason,
        event: details.event
      });
    },
    [desiredPresenter, onOpenChange, openProp]
  );

  if (presenter === 'bottom-sheet') {
    return (
      <BottomSheetMenu.Root
        {...bottomSheet}
        tree={tree}
        buttonGroup={buttonGroup}
        open={open}
        onOpenChange={handleOpenChange}
      >
        {presenterChildren}
      </BottomSheetMenu.Root>
    );
  }

  const { itemsLayout, ...dropdownRootProps } = dropdown;
  return (
    <ButtonMenu.Root
      {...dropdownRootProps}
      buttonGroup={buttonGroup}
      open={open}
      onOpenChange={handleOpenChange}
    >
      {presenterChildren}
      <ButtonMenu.TreeContent tree={tree} itemsLayout={itemsLayout} />
    </ButtonMenu.Root>
  );
}

export const AdaptiveButtonMenu = {
  Root: AdaptiveButtonMenuRoot,
  Action: AdaptiveButtonMenuAction,
  Trigger: AdaptiveButtonMenuTrigger
};
