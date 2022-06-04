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
  borderRadius?: 'none' | 'full' | 'rounded' | 'default';
  disabled?: boolean;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

interface ButtonElementContainerRequired {
  textAlign: CSSProperties['textAlign'];

  // Sizing
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

interface ButtonElementContainerOptional {
  backgroundColor?: CSSProperties['backgroundColor'];
  background?: 'none';
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];
  boxShadow?: CSSProperties['boxShadow'];
}

type ButtonElementContainerBase = ButtonElementContainerRequired &
  ButtonElementContainerOptional & {
    borderWidth?: CSSProperties['borderWidth'];
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
  outlineOffset?: CSSProperties['outlineOffset'];
  outlineColor?: CSSProperties['outlineColor'];
  outlineStyle?: CSSProperties['outlineStyle'];
  outlineWidth?: CSSProperties['outlineWidth'];
  outline?: 'none';
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
  container?: {
    base?: ButtonElementContainerVariant & { rest: ButtonElementContainerBase };
    option: {
      widthMin: CSSProperties['minWidth'];
      borderRadius?: {
        default?: number;
        full?: number;
        rounded?: number;
        none?: 0;
      };
    };
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<ButtonElementContainerBase>;
          variant?: Partial<
            Record<ButtonVariant, ButtonElementContainerVariant>
          >;
        }
      >
    >;
  };
  text?: {
    base?: ButtonElementTextVariant & { rest: ButtonElementTextBase };
    type?: Partial<
      Record<
        ButtonType,
        {
          base?: Partial<ButtonElementTextBase>;
          variant?: Partial<Record<ButtonVariant, ButtonElementTextVariant>>;
        }
      >
    >;
  };
}
