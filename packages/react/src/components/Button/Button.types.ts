import type { CSSProperties } from 'react';

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
  separateIcon?: boolean;
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: InteractionState;
  borderRadius?: 'none' | 'full' | 'rounded' | 'default';
  textAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

type ButtonElementContainer = {
  // Sizing
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;

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
}

//------------------------------------------------------------------------------
// States
//------------------------------------------------------------------------------

type ButtonElementContainerVariant = Partial<
  Record<InteractionState, ButtonElementContainer>
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
