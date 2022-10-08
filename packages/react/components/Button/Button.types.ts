import type { CSSProperties, ReactElement, MouseEvent } from 'react';
import type * as Util from '@stitches/core/types/util';
import type { KiskadeeTheme } from '@kiskadee/react';

export type IconPosition = 'Left' | 'Right';

export type ButtonType = 'contained' | 'outline' | 'flat';

export type StitchesProperties =
  | string
  | Util.Function
  | { [name: string]: unknown };

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger';

export type InteractionStatus =
  | 'rest'
  | 'hover'
  | 'focus'
  | 'pressed'
  | 'visited'
  | 'disabled';

export type Size =
  | 'xxxl'
  | 'xxl'
  | 'xl'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xs'
  | 'xxs'
  | 'xxxs';

export interface ButtonProps {
  label?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min';
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: InteractionStatus;
  borderRadius?: 'none' | 'full' | 'rounded' | 'default';
  textAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
  iconLeft?: ReactElement;
  iconRight?: ReactElement;
  iconType?: 'attached' | 'detached';
  size?: Size;
  isLoading?: boolean;
}

export type ButtonStyleProps = {
  // Required
  iconType: Exclude<ButtonProps['iconType'], undefined> | 'icon';
  borderRadius: Exclude<ButtonProps['borderRadius'], undefined>;
  width: Exclude<ButtonProps['width'], undefined>;
  type: ButtonProps['type'];
  variant: ButtonProps['variant'];

  // Optional
  size?: Size;
  theme?: KiskadeeTheme['theme'];
  schema?: ButtonSchema;
  iconLeft?: ButtonProps['iconLeft'];
  iconRight?: ButtonProps['iconRight'];
  textAlign?: ButtonProps['textAlign'];
};

export type ButtonElements = keyof Exclude<ButtonSchema['elements'], undefined>;

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

export type ButtonElementContainer = {
  // Core
  boxShadow?: CSSProperties['boxShadow'];
  outlineOffset?: CSSProperties['outlineOffset'];
  // TODO: add to dark mode too
  outlineColor?: CSSProperties['outlineColor'];
  outlineStyle?: CSSProperties['outlineStyle'];
  outlineWidth?: CSSProperties['outlineWidth'];
  outline?: 'none';

  // Background - Dark Mode
  background?: 'none';
  backgroundColor?: CSSProperties['backgroundColor'];
  rippleColor?: CSSProperties['backgroundColor'];

  // Border - Dark Mode
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];
};

// Icon

export interface ButtonElementIcon {
  // Color - Dark Mode
  color?: CSSProperties['color'];

  // Size - Responsive
  fontSize?: CSSProperties['fontSize'];

  // Padding - Responsive
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

// Text

export interface ButtonElementText {
  // Core
  fontFamily?: CSSProperties['fontFamily'];
  fontStyle?: CSSProperties['fontStyle'];
  fontWeight?: CSSProperties['fontWeight'];
  lineHeight?: CSSProperties['lineHeight'];

  // Color - Dark Mode
  color?: CSSProperties['color'];

  // Size - Responsive
  fontSize?: CSSProperties['fontSize'];

  // Padding - Responsive
  paddingTop?: CSSProperties['paddingTop'];
  paddingRight?: CSSProperties['paddingRight'];
  paddingBottom?: CSSProperties['paddingBottom'];
  paddingLeft?: CSSProperties['paddingLeft'];
}

//------------------------------------------------------------------------------

export interface ContainerOptions {
  widthMin?: number;
  borderRadius?: {
    default?: 'full' | 'rounded' | 'none';
    variant?: {
      full?: Partial<Record<Size, number>>;
      rounded?: Partial<Record<Size, number>>;
    };
    none?: 0;
  };
  textAlign?: {
    default?: 'left' | 'center' | 'right';
    left?: true;
    center?: true;
    right?: true;
  };
  icon?: {
    enable?: {
      left?: true;
      right?: true;
    };
  };
  size?: Partial<Record<Exclude<Size, 'md'>, boolean>> & { md: true };
  responsive?: {
    smallScreenBP1?: Size; // 0-320px
    smallScreenBP2?: Size; // 321-375px
    smallScreenBP3?: Size; // 376-480px

    mediumScreenBP1?: Size; // 481-640px
    mediumScreenBP2?: Size; // 641-768px
    mediumScreenBP3?: Size; // 769-1024px

    bigScreenBP1?: Size; // 1025-1280px
    bigScreenBP2?: Size; // 1281-1440px
    bigScreenBP3?: Size; // 1441px
  };
}

type ElementSchema<Base, ExtraStatus = string | undefined> = {
  base?: Partial<
    Record<
      ExtraStatus extends string
        ? InteractionStatus | ExtraStatus
        : InteractionStatus,
      Partial<Record<Size, Base>>
    >
  >;
  type?: Partial<
    Record<
      ButtonType,
      {
        base?: Partial<Record<Size, Base>>;
        variant?: Partial<
          Record<
            ButtonVariant,
            Partial<
              Record<
                ExtraStatus extends string
                  ? InteractionStatus | ExtraStatus
                  : InteractionStatus,
                Partial<Record<Size, Base>>
              >
            >
          >
        >;
      }
    >
  >;
};

type ElementTheme<T, ExtraStatus = string | void> = Partial<
  Record<
    'light' | 'dark',
    Partial<Record<string | 'default', ElementSchema<T, ExtraStatus>>>
  >
>;

export type ContrastStyle<T> = {
  [mediaQuery in 'defaultMode' | 'contrastMode']?: T;
};

export type Breakpoint = keyof Exclude<
  ContainerOptions['responsive'],
  undefined
>;

export type IconType = 'alone' | 'attached' | 'detached';

export interface ButtonSchema {
  option?: ContainerOptions;
  elements?: {
    container?: ElementTheme<ButtonElementContainer>;
    iconLeft?: ElementTheme<ButtonElementIcon, IconType>;
    iconRight?: ElementTheme<ButtonElementIcon, IconType>;
    // iconAlone?: ElementTheme<ButtonElementIcon>;
    // leftIconAttached?: ElementTheme<ButtonElementIcon>;
    // leftIconDetached?: ElementTheme<ButtonElementIcon>;
    // rightIconAttached?: ElementTheme<ButtonElementIcon>;
    // rightIconDetached?: ElementTheme<ButtonElementIcon>;
    text?: ElementTheme<ButtonElementText>;
  };
}

export interface RippleProps {
  top: string;
  left: string;
  width: string;
  height: string;
}
