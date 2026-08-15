import type {
  ClassNameByElementJSON,
  DropdownIntent,
  ElementSizeValue,
  RadiusMode
} from '@kiskadee/core';
import type { IconName } from '@kiskadee/icons/interface';
import type {
  DropdownAnchorProps as HeadlessDropdownAnchorProps,
  DropdownRootProps as HeadlessDropdownRootProps
} from '@kiskadee/react-headless';
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

export type DropdownElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';
export type DropdownClassesMap = Partial<Record<DropdownElementName, ClassNameByElementJSON>>;
export type DropdownClassNames = Partial<Record<DropdownElementName, string>>;

export type DropdownVisualProps = {
  scale?: ElementSizeValue;
  radius?: RadiusMode;
  shadow?: boolean | ElementSizeValue;
  classNames?: DropdownClassNames;
};

export type DropdownVisualProviderProps = DropdownVisualProps & {
  children: ReactNode;
};

export type DropdownRootProps = HeadlessDropdownRootProps & DropdownVisualProps;
export type DropdownAnchorProps = HeadlessDropdownAnchorProps;
export type DropdownPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';
export type DropdownContentProps = ComponentPropsWithoutRef<'div'> & {
  placement?: DropdownPlacement;
  offset?: number;
  collisionPadding?: number;
  portalled?: boolean;
  portalContainer?: HTMLElement | null;
  width?: 'content' | 'min-anchor' | 'anchor';
};
export type DropdownSurfaceProps = ComponentPropsWithoutRef<'div'>;
export type DropdownItemsProps = ComponentPropsWithoutRef<'div'>;
export type DropdownGroupProps = ComponentPropsWithoutRef<'div'>;

export type DropdownItemRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  'data-selected'?: true;
  'data-disabled'?: true;
};

export type DropdownItemProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode;
  intent?: DropdownIntent;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  render?: (
    props: DropdownItemRenderProps,
    state: { selected: boolean; disabled: boolean }
  ) => ReactElement;
};

export type DropdownIconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> &
  ({ name: IconName; children?: never } | { name?: never; children: ReactNode });

export type DropdownLabelProps = ComponentPropsWithoutRef<'span'>;
export type DropdownDescriptionProps = ComponentPropsWithoutRef<'span'>;
export type DropdownTrailingProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> &
  ({ name: IconName; children?: never } | { name?: never; children: ReactNode });
export type DropdownSeparatorProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'aria-orientation' | 'children'
> & {
  children?: never;
};
