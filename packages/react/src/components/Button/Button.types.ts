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
  // disabled?: boolean;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min-width';
  separateIcon?: boolean;
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: InteractionState;
  disabled?: boolean;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

interface ButtonElementContainerRequired {
  textAlign: CSSProperties['textAlign'];

  // Sizing
  padding: CSSProperties['padding'];
}

interface ButtonElementContainerOptional {
  backgroundColor?: CSSProperties['backgroundColor'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];
  boxShadow?: CSSProperties['boxShadow'];
}

type ButtonElementContainerBase = ButtonElementContainerRequired &
  ButtonElementContainerOptional & {
    borderWidth?: CSSProperties['borderWidth'];
    borderRadius?: CSSProperties['borderRadius'];
  };

// Text

interface ButtonElementTextBase {
  // Style
  fontFamily: CSSProperties['fontFamily'];
  fontStyle: CSSProperties['fontStyle'];
  fontWeight: CSSProperties['fontWeight'];
  color?: CSSProperties['color'];

  // Sizing
  fontSize: CSSProperties['fontSize'];
  lineHeight: CSSProperties['lineHeight'];
}

//------------------------------------------------------------------------------
// States
//------------------------------------------------------------------------------

interface ButtonElementContainerFocus {
  outline?: string;
  outlineOffset?: string;
}

type ButtonElementContainerVariant = {
  rest?: ButtonElementContainerOptional;
  hover?: ButtonElementContainerOptional;
  focus?: ButtonElementContainerOptional & ButtonElementContainerFocus;
  pressed?: ButtonElementContainerOptional;
  visited?: ButtonElementContainerOptional;
  disabled?: ButtonElementContainerOptional;
};

type ButtonElementTextVariant = {
  rest?: { color?: CSSProperties['color'] };
  hover?: { color?: CSSProperties['color'] };
  focus?: { color?: CSSProperties['color'] };
  pressed?: { color?: CSSProperties['color'] };
  visited?: { color?: CSSProperties['color'] };
  disabled?: { color?: CSSProperties['color'] };
};

//------------------------------------------------------------------------------

export interface ButtonSchema {
  container?: Partial<
    Record<
      ButtonType,
      {
        base: ButtonElementContainerBase;
        option: {
          widthMin: CSSProperties['minWidth'];
          // border: 'rounded' | 'square' | 'circle';
        };
        variant?: Partial<Record<ButtonVariant, ButtonElementContainerVariant>>;
      }
    >
  >;
  text?: Partial<
    Record<
      ButtonType,
      {
        base: ButtonElementTextBase;
        variant?: Partial<Record<ButtonVariant, ButtonElementTextVariant>>;
      }
    >
  >;
}
