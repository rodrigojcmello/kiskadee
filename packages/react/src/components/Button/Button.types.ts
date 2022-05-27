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

interface ButtonElementContainerRequired {
  backgroundColor: CSSProperties['backgroundColor'];
  textAlign: CSSProperties['textAlign'];

  // Sizing
  padding: CSSProperties['padding'];
}

interface ButtonElementContainerOptional {
  // Style
  backgroundColor?: CSSProperties['backgroundColor'];
  borderRadius?: CSSProperties['borderRadius'];
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];

  // Elevation
  boxShadow?: CSSProperties['boxShadow'];
}

type ButtonElementContainer = ButtonElementContainerRequired &
  ButtonElementContainerOptional;

interface ButtonElementText {
  fontFamily: CSSProperties['fontFamily'];
  color: CSSProperties['color'];
  fontSize: CSSProperties['fontSize'];
  lineHeight: CSSProperties['lineHeight'];
  fontStyle: CSSProperties['fontStyle'];
  fontWeight: CSSProperties['fontWeight'];
  height: CSSProperties['height'];
}

//------------------------------------------------------------------------------
// States
//------------------------------------------------------------------------------

interface ButtonElementContainerFocus {
  outline?: string;
  outlineOffset?: string;
}

type ButtonElementContainerVariantModifier = {
  rest: ButtonElementContainer;
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
      Partial<Record<ButtonVariant, ButtonElementContainerVariantModifier>>
    >
  >;
  text?: Partial<
    Record<
      ButtonType,
      Partial<Record<ButtonVariant, ButtonElementTextVariantModifier>>
    >
  >;
}
