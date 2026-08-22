import type {
  BottomSheetCenteredIcons,
  BottomSheetInitialHeight,
  BottomSheetIntent,
  BottomSheetItemLayout,
  BottomSheetPageTransition,
  BottomSheetSwipeBehavior,
  ClassNameByElementJSON,
  ElementSizeValue,
  RadiusMode
} from '@kiskadee/core';
import type {
  BottomSheetCloseProps as HeadlessBottomSheetCloseProps,
  BottomSheetContentProps as HeadlessBottomSheetContentProps,
  BottomSheetRootProps as HeadlessBottomSheetRootProps,
  BottomSheetTriggerProps as HeadlessBottomSheetTriggerProps
} from '@kiskadee/react-headless/bottom-sheet';
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import type { ButtonProps } from '../Button/Button.types.ts';

export type {
  BottomSheetCenteredIcons,
  BottomSheetInitialHeight,
  BottomSheetItemLayout,
  BottomSheetPageTransition,
  BottomSheetSwipeBehavior
} from '@kiskadee/core';

export type BottomSheetElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10'
  | 'e11'
  | 'e12'
  | 'e13'
  | 'e14'
  | 'e15';

export type BottomSheetClassesMap = Partial<Record<BottomSheetElementName, ClassNameByElementJSON>>;
export type BottomSheetClassNames = Partial<Record<BottomSheetElementName, string>>;

export type BottomSheetBehaviorProps = {
  initialHeight?: BottomSheetInitialHeight;
  swipeBehavior?: BottomSheetSwipeBehavior;
  pageTransition?: BottomSheetPageTransition;
  itemLayout?: BottomSheetItemLayout;
  centeredIcons?: BottomSheetCenteredIcons;
};

export type BottomSheetVisualProps = BottomSheetBehaviorProps & {
  scale?: ElementSizeValue;
  radius?: RadiusMode;
  shadow?: boolean | ElementSizeValue;
  classNames?: BottomSheetClassNames;
};

export type BottomSheetVisualProviderProps = BottomSheetVisualProps & {
  children: ReactNode;
};

export type BottomSheetRootProps = HeadlessBottomSheetRootProps & BottomSheetVisualProps;
export type BottomSheetTriggerProps = HeadlessBottomSheetTriggerProps;
export type BottomSheetContentProps = Omit<
  HeadlessBottomSheetContentProps,
  'forceMount' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'render'
> & {
  overlayProps?: Omit<
    ComponentPropsWithoutRef<'div'>,
    'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
  >;
  surfaceProps?: Omit<
    ComponentPropsWithoutRef<'div'>,
    'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
  >;
};
export type BottomSheetCloseProps = Omit<
  ButtonProps,
  'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'children' | 'type'
> &
  Pick<HeadlessBottomSheetCloseProps, 'onClick'> & {
    children?: ReactNode;
  };

export type BottomSheetHandleProps = ComponentPropsWithoutRef<'div'>;
export type BottomSheetHeaderProps = ComponentPropsWithoutRef<'header'>;
export type BottomSheetTitleProps = ComponentPropsWithoutRef<'h2'>;
export type BottomSheetBodyProps = ComponentPropsWithoutRef<'div'>;
export type BottomSheetGroupProps = ComponentPropsWithoutRef<'div'>;
export type BottomSheetGroupLabelProps = ComponentPropsWithoutRef<'span'>;

export type BottomSheetItemRenderProps = HTMLAttributes<HTMLElement> & {
  ref: Ref<HTMLElement>;
  'data-selected'?: true;
  'data-disabled'?: true;
};

export type BottomSheetItemProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode;
  intent?: BottomSheetIntent;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  render?: (
    props: BottomSheetItemRenderProps,
    state: { selected: boolean; disabled: boolean }
  ) => ReactElement;
};

export type BottomSheetIconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  children: ReactNode;
};

export type BottomSheetLabelProps = ComponentPropsWithoutRef<'span'>;
export type BottomSheetDescriptionProps = ComponentPropsWithoutRef<'span'>;
export type BottomSheetEndTextProps = ComponentPropsWithoutRef<'span'>;
export type BottomSheetCheckmarkProps = Omit<
  ComponentPropsWithoutRef<'span'>,
  'aria-hidden' | 'children'
> & {
  visible?: boolean;
};
export type BottomSheetRadioMarkProps = BottomSheetCheckmarkProps;
export type BottomSheetTrailingProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  children: ReactNode;
  functional?: boolean;
};
export type BottomSheetSeparatorProps = Omit<ComponentPropsWithoutRef<'hr'>, 'children'> & {
  children?: never;
};

export type BottomSheetSnapPoint = BottomSheetInitialHeight;
