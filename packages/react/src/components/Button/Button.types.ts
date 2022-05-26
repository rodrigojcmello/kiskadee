import { CSSProperties } from 'react';

type ButtonType = 'contained' | 'outline' | 'flat';

type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger';

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
  validation?: ButtonVariant;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

interface ButtonElementContainer {
  // Style
  backgroundColor?: CSSProperties['backgroundColor'];
  borderRadius?: CSSProperties['borderRadius'];
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];

  // Sizing
  padding?: CSSProperties['padding'];

  // Elevation
  boxShadow?: CSSProperties['boxShadow'];
}

interface ButtonElementText {
  fontFamily?: CSSProperties['fontFamily'];
  color?: CSSProperties['color'];
  fontSize?: CSSProperties['fontSize'];
  lineHeight?: CSSProperties['lineHeight'];
  fontStyle?: CSSProperties['fontStyle'];
  fontWeight?: CSSProperties['fontWeight'];
  height?: CSSProperties['height'];
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
  hover?: ButtonElementContainer;
  focus?: ButtonElementContainer & ButtonElementContainerFocus;
  pressed?: ButtonElementContainer;
  visited?: ButtonElementContainer;
  disabled?: ButtonElementContainer;
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
