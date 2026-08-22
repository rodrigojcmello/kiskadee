import type {
  ClassNameByElementJSON,
  DropdownIntent,
  DropdownPresence,
  ElementSizeValue,
  RadiusMode
} from '@kiskadee/core';
import type { IconName } from '@kiskadee/icons/interface';
import type {
  DropdownAnchorProps as HeadlessDropdownAnchorProps,
  DropdownContentProps as HeadlessDropdownContentProps,
  DropdownRootProps as HeadlessDropdownRootProps
} from '@kiskadee/react-headless/dropdown';
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

export type DropdownElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10';
export type DropdownClassesMap = Partial<Record<DropdownElementName, ClassNameByElementJSON>>;
export type DropdownClassNames = Partial<Record<DropdownElementName, string>>;

export type DropdownVisualProps = {
  scale?: ElementSizeValue;
  radius?: RadiusMode;
  shadow?: boolean | ElementSizeValue;
  presence?: DropdownPresence;
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
export type DropdownContentProps = Omit<HeadlessDropdownContentProps, 'forceMount' | 'render'>;
export type DropdownPresenceRenderProps = HTMLAttributes<HTMLDivElement> & {
  ref: Ref<HTMLDivElement>;
};
export type DropdownPresenceRenderState = {
  open: boolean;
  positioned: boolean;
  placement: DropdownPlacement;
};
export type DropdownPresenceAdapter = {
  forceMount: boolean;
  render: (props: DropdownPresenceRenderProps, state: DropdownPresenceRenderState) => ReactElement;
};
export type DropdownPresenceProps = {
  children: (adapter: DropdownPresenceAdapter) => ReactElement;
};
export type DropdownSurfaceProps = ComponentPropsWithoutRef<'div'>;
export type DropdownItemsLayout = 'independent' | 'columns';
export type DropdownItemsProps = ComponentPropsWithoutRef<'div'> & {
  layout?: DropdownItemsLayout;
};
export type DropdownGroupProps = ComponentPropsWithoutRef<'div'>;
export type DropdownGroupLabelProps = ComponentPropsWithoutRef<'span'>;

export type DropdownItemRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  'data-selected'?: true;
  'data-disabled'?: true;
};

export type DropdownItemProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode;
  intent?: DropdownIntent;
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  render?: (
    props: DropdownItemRenderProps,
    state: { selected: boolean; hovered: boolean; disabled: boolean }
  ) => ReactElement;
};

export type DropdownIconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> &
  ({ name: IconName; children?: never } | { name?: never; children: ReactNode });

export type DropdownLabelProps = ComponentPropsWithoutRef<'span'>;
export type DropdownDescriptionProps = ComponentPropsWithoutRef<'span'>;
export type DropdownEndTextProps = ComponentPropsWithoutRef<'span'>;
export type DropdownCheckmarkProps = Omit<
  ComponentPropsWithoutRef<'span'>,
  'aria-hidden' | 'children'
> & {
  visible?: boolean;
};
export type DropdownRadioMarkProps = DropdownCheckmarkProps;
export type DropdownTrailingProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> &
  ({ name: IconName; children?: never } | { name?: never; children: ReactNode });
export type DropdownSeparatorProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'aria-orientation' | 'children'
> & {
  children?: never;
};
