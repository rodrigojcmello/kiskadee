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
// States
//------------------------------------------------------------------------------

type ButtonElementContainerVariant = Partial<
  Record<InteractionState, ButtonElementContainer>
>;

type ButtonElementIconVariant = Partial<
  Record<InteractionState, ButtonElementIcon>
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
    base?: ButtonElementIconVariant;
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: ButtonElementIcon;
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
          base?: ButtonElementText;
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
          base?: ButtonElementIcon;
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
