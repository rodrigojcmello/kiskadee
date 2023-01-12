import type { CSSProperties } from 'react';
import type { Size } from '@kiskadee/react';

export interface TextProps {
  // maxWidth?: number;
  // variant: ButtonVariant;
  // type: ButtonType;
  textAlign?: 'center' | 'justify' | 'left' | 'right';
  size?: Size;
  noWrap?: boolean;
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontFamily?: string;
  italic?: boolean;
  colorHex?: { light: string; dark?: string };
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

// Container

export type ButtonElementContainer = {
  // Core
  boxShadow?: CSSProperties['boxShadow'];
  outlineOffset?: CSSProperties['outlineOffset'];
  // TODO: add to dark mode too
  outlineColor?: CSSProperties['outlineColor'];
  outlineStyle?: CSSProperties['outlineStyle'];
  outlineWidth?: CSSProperties['outlineWidth'];
  outline?: 'none';

  // Background - Dark Mode
  background?: 'none';
  backgroundColor?: CSSProperties['backgroundColor'];
  rippleColor?: CSSProperties['backgroundColor'];

  // Border - Dark Mode
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];
};

// Icon

export interface ButtonElementIcon {
  // Color - Dark Mode
  color?: CSSProperties['color'];

  // Size - Responsive
  fontSize?: CSSProperties['fontSize'];

  // Padding - Responsive
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

// Text

export interface ButtonElementText {
  // Core
  fontFamily?: CSSProperties['fontFamily'];
  fontStyle?: CSSProperties['fontStyle'];
  fontWeight?: CSSProperties['fontWeight'];
  lineHeight?: CSSProperties['lineHeight'];

  // Color - Dark Mode
  color?: CSSProperties['color'];

  // Size - Responsive
  fontSize?: CSSProperties['fontSize'];

  // Padding - Responsive
  paddingTop?: CSSProperties['paddingTop'];
  paddingRight?: CSSProperties['paddingRight'];
  paddingBottom?: CSSProperties['paddingBottom'];
  paddingLeft?: CSSProperties['paddingLeft'];
}

//------------------------------------------------------------------------------

export interface ContainerOptions {
  widthMin?: number;
  borderRadius?: {
    default?: 'full' | 'rounded' | 'none';
    variant?: {
      full?: Partial<Record<Size, number>>;
      rounded?: Partial<Record<Size, number>>;
    };
    none?: 0;
  };
  textAlign?: {
    default?: 'left' | 'center' | 'right';
    left?: true;
    center?: true;
    right?: true;
  };
  icon?: {
    enable?: {
      left?: true;
      right?: true;
    };
  };
  size?: Partial<Record<Exclude<Size, 'md'>, boolean>> & { md: true };
  responsive?: {
    smallScreenBP1?: Size; // 0-320px
    smallScreenBP2?: Size; // 321-375px
    smallScreenBP3?: Size; // 376-480px

    mediumScreenBP1?: Size; // 481-640px
    mediumScreenBP2?: Size; // 641-768px
    mediumScreenBP3?: Size; // 769-1024px

    bigScreenBP1?: Size; // 1025-1280px
    bigScreenBP2?: Size; // 1281-1440px
    bigScreenBP3?: Size; // 1441px
  };
}
