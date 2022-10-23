import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import type * as Util from '@stitches/core/types/util';
import type {
  ButtonType,
  ButtonVariant,
  KiskadeeTheme,
  Size,
} from '@kiskadee/react';

export type IconPosition = 'Left' | 'Right';

export type StitchesProperties =
  | string
  | Util.Function
  | { [name: string]: unknown };

export type InteractionStatus =
  | 'rest'
  | 'hover'
  | 'focus'
  | 'pressed'
  | 'visited'
  | 'disabled';

export interface ButtonProps {
  label?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min';
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: InteractionStatus;
  borderRadius?: BorderRadiusState;
  textAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
  iconLeft?: ReactElement;
  iconRight?: ReactElement;
  iconType?: IconState;
  size?: Size;
  isLoading?: boolean;
}

export type ButtonStyleProps = {
  // TODO: each should have a default
  // Required
  width: Exclude<ButtonProps['width'], undefined>;
  type: ButtonProps['type'];
  variant: ButtonProps['variant'];
  component: keyof KiskadeeTheme['component'];

  // Optional
  borderRadius?: BorderRadiusState;
  iconType?: IconState;
  size?: Size;
  theme: {
    name: string;
    version: string;
    author: string;
    option?: KiskadeeTheme['theme'];
  };
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
  // TODO: remove CSSProperties
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];

  // Border Radius - Responsive
  borderRadius?: number;
};

// Icon

export interface ButtonElementIcon {
  // Color - Dark Mode
  color?: CSSProperties['color'];
  backgroundColor?: CSSProperties['backgroundColor'];

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
  borderRadius?: BorderRadiusState;
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

export type BorderRadiusState = 'None' | 'Full' | 'Rounded';

export type IconState = 'Alone' | 'Attached' | 'Detached';

export type Prefix<
  Element extends string,
  State extends string
> = `${Element}${State}`;

export type ButtonStatus =
  | InteractionStatus
  | Prefix<'borderRadius', BorderRadiusState>
  | Prefix<'icon', IconState>;

export interface ButtonSchema {
  option?: ContainerOptions;
  elements?: {
    container?: ElementTheme<
      ButtonElementContainer,
      Prefix<'borderRadius', BorderRadiusState>
    >;
    iconLeft?: ElementTheme<
      ButtonElementIcon,
      Prefix<'icon', IconState> & Prefix<'borderRadius', BorderRadiusState>
    >;
    iconRight?: ElementTheme<
      ButtonElementIcon,
      Prefix<'icon', IconState> & Prefix<'borderRadius', BorderRadiusState>
    >;
    text?: ElementTheme<ButtonElementText>;
  };
}

export interface RippleProps {
  top: string;
  left: string;
  width: string;
  height: string;
}
