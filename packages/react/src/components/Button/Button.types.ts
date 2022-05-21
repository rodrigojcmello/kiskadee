export interface ButtonProps {
  icon?: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: string;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min-width';
  separateIcon?: boolean;
  type?: 'default' | 'outline' | 'text';
  hover?: boolean;
  focus?: boolean;
  pressed?: boolean;
  visited?: boolean;
}

interface ButtonRest {
  // Style
  backgroundColor?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;

  // Sizing
  padding?: string;

  // Elevation
  boxShadow?: string;
}

export interface ButtonStyle {
  container?: {
    rest?: ButtonRest;
    hover?: ButtonRest;
    focus?: ButtonRest;
    visited?: ButtonRest;
    pressed?: ButtonRest;
  };
  text?: {
    rest?: {
      fontFamily?: string;
      color?: string;
      fontSize?: string;
      lineHeight?: string;
      fontStyle?: string;
      fontWeight?: number;
      height?: string;
    };
    hover?: { color?: string };
    focus?: { color?: string };
    pressed?: { color?: string };
    visited?: { color?: string };
  };
}
