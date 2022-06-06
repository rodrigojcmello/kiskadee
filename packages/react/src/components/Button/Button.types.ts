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

export interface ButtonProps {
  icon?: string;
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
  iconLeftDetached?: boolean;
  iconRight?: ReactElement;
  iconRightDetached?: boolean;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

type ButtonElementContainer = {
  // Style
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

// Left Icon

interface ButtonElementLeftIcon {
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
// States
//------------------------------------------------------------------------------

type ButtonElementContainerVariant = Partial<
  Record<InteractionState, ButtonElementContainer>
>;

type ButtonElementLeftIconVariant = Partial<
  Record<InteractionState, ButtonElementLeftIcon>
>;

type ButtonElementTextVariant = Partial<
  Record<InteractionState, ButtonElementText>
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
    };
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<ButtonElementContainer>;
          variant?: Partial<
            Record<ButtonVariant, ButtonElementContainerVariant>
          >;
        }
      >
    >;
  };
  leftIcon?: {
    base?: ButtonElementLeftIconVariant;
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: ButtonElementLeftIcon;
          variant?: Partial<
            Record<ButtonVariant, ButtonElementLeftIconVariant>
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
          base?: ButtonElementText;
          variant?: Partial<Record<ButtonVariant, ButtonElementTextVariant>>;
        }
      >
    >;
  };
}
