import type { CSSProperties, ReactElement } from 'react';

export type ButtonType = 'contained' | 'outline' | 'flat';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger';

export type InteractionState =
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
  text: string;
  onClick: () => void;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min';
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: InteractionState;
  borderRadius?: 'none' | 'full' | 'rounded' | 'default';
  textAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
  iconLeft?: ReactElement;
  iconRight?: ReactElement;
  iconType?: 'attached' | 'detached';
  size?: Size;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

type ButtonElementContainer = {
  // Core Style
  background?: 'none';
  backgroundColor?: CSSProperties['backgroundColor'];
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];

  // Elevation
  boxShadow?: CSSProperties['boxShadow'];

  // Focus
  outlineOffset?: CSSProperties['outlineOffset'];
  outlineColor?: CSSProperties['outlineColor'];
  outlineStyle?: CSSProperties['outlineStyle'];
  outlineWidth?: CSSProperties['outlineWidth'];
  outline?: 'none';
};

// Icon

interface ButtonElementIcon {
  // Style
  color?: CSSProperties['color'];

  // Sizing
  fontSize?: CSSProperties['fontSize'];
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

// Text

interface ButtonElementText {
  // Style
  fontFamily?: CSSProperties['fontFamily'];
  fontStyle?: CSSProperties['fontStyle'];
  fontWeight?: CSSProperties['fontWeight'];
  color?: CSSProperties['color'];

  // Sizing
  fontSize?: CSSProperties['fontSize'];
  lineHeight?: CSSProperties['lineHeight'];
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

//------------------------------------------------------------------------------
// States e Sizes
//------------------------------------------------------------------------------

type ButtonElementContainerVariant = Partial<
  Record<InteractionState, Partial<Record<Size, ButtonElementContainer>>>
>;

type ButtonElementIconVariant = Partial<
  Record<InteractionState, Partial<Record<Size, ButtonElementIcon>>>
>;

type ButtonElementTextVariant = Partial<
  Record<InteractionState, Partial<Record<Size, ButtonElementText>>>
>;

//------------------------------------------------------------------------------

export interface ButtonSchema {
  container?: {
    base?: ButtonElementContainerVariant;
    option?: {
      widthMin?: CSSProperties['minWidth'];
      borderRadius?: {
        default?: number;
        full?: number;
        rounded?: number;
        none?: 0;
      };
      textAlign?: {
        default?: 'left' | 'center' | 'right';
        left?: true;
        center?: true;
        right?: true;
      };
      icon?: {
        leftAttached?: true;
        leftDetached?: true;
        rightAttached?: true;
        rightDetached?: true;
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
    };
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<Record<Size, ButtonElementContainer>>;
          variant?: Partial<
            Record<ButtonVariant, ButtonElementContainerVariant>
          >;
        }
      >
    >;
  };
  leftIcon?: {
    base?: ButtonElementIconVariant;
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<Record<Size, ButtonElementIcon>>;
          variant?: Partial<
            Record<
              ButtonVariant,
              {
                attached?: ButtonElementIconVariant;
                detached?: ButtonElementIconVariant;
              }
            >
          >;
        }
      >
    >;
  };
  text?: {
    base?: ButtonElementTextVariant;
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<Record<Size, ButtonElementText>>;
          variant?: Partial<Record<ButtonVariant, ButtonElementTextVariant>>;
        }
      >
    >;
  };
  rightIcon?: {
    base?: ButtonElementIconVariant;
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<Record<Size, ButtonElementIcon>>;
          variant?: Partial<
            Record<
              ButtonVariant,
              {
                attached?: ButtonElementIconVariant;
                detached?: ButtonElementIconVariant;
              }
            >
          >;
        }
      >
    >;
  };
}
