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

export interface ButtonStyle {
  container?: {
    rest?: {
      border?: string;
      padding?: string;
      backgroundColor?: string;
      borderRadius?: string;
    };
    hover?: { boxShadow?: string; backgroundColor?: string };
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
