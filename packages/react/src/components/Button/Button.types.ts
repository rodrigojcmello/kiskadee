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
}

interface ButtonRest {
  // Style
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;

  // Sizing
  padding?: string;

  // Elevation
  boxShadow?: string;
}

export interface ButtonStyle {
  container?: {
    rest?: ButtonRest;
    hover?: ButtonRest;
    focused?: ButtonRest;
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
  };
}
