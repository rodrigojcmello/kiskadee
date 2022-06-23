import type { CSSProperties, ReactElement } from 'react';

// export type ButtonState = 'default' | 'attached' | 'detached' | 'alone';

export type ButtonType = 'contained' | 'outline' | 'flat';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger';

export type Interaction =
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
  onClick?: () => void;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min';
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: Interaction;
  borderRadius?: 'none' | 'full' | 'rounded' | 'default';
  textAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
  iconLeft?: ReactElement;
  iconRight?: ReactElement;
  iconType?: 'attached' | 'detached';
  size?: Size;
}

export type ButtonElement = keyof Exclude<ButtonSchema['elements'], undefined>;

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

export type ButtonElementContainer = {
  // Core
  boxShadow?: CSSProperties['boxShadow'];
  outlineOffset?: CSSProperties['outlineOffset'];
  outlineColor?: CSSProperties['outlineColor'];
  outlineStyle?: CSSProperties['outlineStyle'];
  outlineWidth?: CSSProperties['outlineWidth'];
  outline?: 'none';

  // Background
  background?: 'none';
  backgroundColor?: CSSProperties['backgroundColor'];

  // Border
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];
};

// Icon

export interface ButtonElementIcon {
  // Color
  color?: CSSProperties['color'];

  // Size
  fontSize?: CSSProperties['fontSize'];

  // Padding
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

  // Color
  color?: CSSProperties['color'];

  // Size
  fontSize?: CSSProperties['fontSize'];

  // Padding
  paddingTop?: CSSProperties['paddingTop'];
  paddingRight?: CSSProperties['paddingRight'];
  paddingBottom?: CSSProperties['paddingBottom'];
  paddingLeft?: CSSProperties['paddingLeft'];
}

//------------------------------------------------------------------------------

export interface ContainerOptions {
  widthMin?: CSSProperties['minWidth'];
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
    bigScreenBP3?: Size; // 1441-1600px
  };
}

type ElementSchema<Base> = {
  base?: Partial<Record<Interaction, Partial<Record<Size, Base>>>>;
  type?: Partial<
    Record<
      ButtonType,
      {
        base?: Partial<Record<Size, Base>>;
        variant?: Partial<
          Record<
            ButtonVariant,
            Partial<Record<Interaction, Partial<Record<Size, Base>>>>
          >
        >;
      }
    >
  >;
};

export interface ButtonSchema {
  option?: ContainerOptions;
  elements?: {
    container?: ElementSchema<ButtonElementContainer>;
    leftIconAttached?: ElementSchema<ButtonElementIcon>;
    leftIconDetached?: ElementSchema<ButtonElementIcon>;
    rightIconAttached?: ElementSchema<ButtonElementIcon>;
    rightIconDetached?: ElementSchema<ButtonElementIcon>;
    text?: ElementSchema<ButtonElementText>;
  };
}
