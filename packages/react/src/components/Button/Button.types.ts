import { CSSProperties } from 'react';

type ButtonType = 'contained' | 'outline' | 'flat';

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

interface ButtonElementText {
  fontFamily: CSSProperties['fontFamily'];
  color: CSSProperties['color'];
  fontSize: CSSProperties['fontSize'];
  lineHeight: CSSProperties['lineHeight'];
  fontStyle: CSSProperties['fontStyle'];
  fontWeight: CSSProperties['fontWeight'];
}

//------------------------------------------------------------------------------
// States
//------------------------------------------------------------------------------

interface ButtonElementContainerFocus {
  outline?: string;
  outlineOffset?: string;
}

type ButtonElementContainerVariantModifier = {
  rest: ButtonElementContainerOptional;
  hover?: ButtonElementContainerOptional;
  focus?: ButtonElementContainerOptional & ButtonElementContainerFocus;
  pressed?: ButtonElementContainerOptional;
  visited?: ButtonElementContainerOptional;
  disabled?: ButtonElementContainerOptional;
};

type ButtonElementTextVariantModifier = {
  rest: ButtonElementText;
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
        variant: Partial<
          Record<ButtonVariant, ButtonElementContainerVariantModifier>
        >;
      }
    >
  >;
  text?: Partial<
    Record<
      ButtonType,
      Partial<Record<ButtonVariant, ButtonElementTextVariantModifier>>
    >
  >;
}
