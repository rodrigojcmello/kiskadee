import { CSSProperties } from 'react';

export type InteractionState =
  | 'rest'
  | 'hover'
  | 'focus'
  | 'pressed'
  | 'visited';

type ValidationState = 'disabled' | 'success' | 'warning' | 'danger';

type ButtonState = InteractionState | ValidationState;

export interface ButtonProps {
  icon?: string;
  text: string;
  onClick: () => void;
  // disabled?: boolean;
  variant?: string;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min-width';
  separateIcon?: boolean;
  type?: 'default' | 'flat' | 'outline';
  interaction?: InteractionState;
  validation?: ValidationState;
}

interface ButtonContainer {
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

interface ButtonFocus {
  outline?: string;
  outlineOffset?: string;
}

export interface ButtonSchema {
  container?: Partial<
    Record<Exclude<ButtonState, 'focus'>, ButtonContainer>
  > & { focus?: ButtonContainer & ButtonFocus };
  text?: {
    rest?: {
      fontFamily?: CSSProperties['fontFamily'];
      color?: CSSProperties['color'];
      fontSize?: CSSProperties['fontSize'];
      lineHeight?: CSSProperties['lineHeight'];
      fontStyle?: CSSProperties['fontStyle'];
      fontWeight?: CSSProperties['fontWeight'];
      height?: CSSProperties['height'];
    };
    hover?: { color?: string };
    focus?: { color?: string };
    pressed?: { color?: string };
    visited?: { color?: string };
    disabled?: { color?: string };
  };
}
