import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import type * as Util from '@stitches/core/types/util';
import type {
  ButtonType,
  ButtonVariant,
  Size,
  ElementTheme,
  KiskadeeTheme,
} from '@kiskadee/react';

export type IconPosition = 'Left' | 'Right';

// TODO: move it
export type StitchesProperties =
  | string
  | Util.Function
  | { [name: string]: unknown };

export type GenericCSSProperties = { [name: string]: unknown };

export type InteractionStatus =
  | 'rest'
  | 'hover'
  | 'focus'
  | 'pressed'
  | 'visited'
  | 'disabled';

export interface ButtonProps {
  label?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  typeHTML?: 'button' | 'reset' | 'submit';

  // STYLE
  width?: 'auto' | 'block' | 'min';
  variant: ButtonVariant;
  type: ButtonType;
  interaction?: InteractionStatus;
  borderRadius?: BorderRadiusState;
  textAlign?: 'left' | 'center' | 'right';
  disabled?: boolean;
  iconLeft?: ReactElement;
  iconRight?: ReactElement;
  iconType?: IconState;
  size?: Size;
  isLoading?: boolean;
}

export interface ButtonStyleProps {
  // TODO: each should have a default
  // Required
  width: Exclude<ButtonProps['width'], undefined>;
  type: ButtonProps['type'];
  variant: ButtonProps['variant'];

  // Optional
  borderRadius?: BorderRadiusState;
  iconType?: IconState;
  size?: Size;
  info: {
    name: string;
    version: string;
    author: string;
    themeMode?: KiskadeeTheme['themeMode'];
  };
  iconLeft?: ButtonProps['iconLeft'];
  iconRight?: ButtonProps['iconRight'];
  textAlign?: ButtonProps['textAlign'];

  componentSchema?: ButtonElements;
  options?: ButtonOptions;
}

// export type ButtonElements = keyof Exclude<ButtonSchema['elements'], undefined>;

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

export type ButtonGroupElement = {
  height?: number;
  background?: CSSProperties['background'];
  top?: CSSProperties['top'];
};

// Container

export type ButtonContainer = {
  // Core
  boxShadow?: CSSProperties['boxShadow'];
  outlineOffset?: CSSProperties['outlineOffset'];
  // TODO: add to dark mode too
  outlineColor?: CSSProperties['outlineColor'];
  outlineStyle?: CSSProperties['outlineStyle'];
  outlineWidth?: CSSProperties['outlineWidth'];
  outline?: 'none';

  // Background - Dark Mode
  background?: CSSProperties['background'];
  rippleColor?: CSSProperties['backgroundColor'];

  // Border - Dark Mode
  // TODO: remove CSSProperties
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderTopColor?: CSSProperties['borderTopColor'];
  borderRightColor?: CSSProperties['borderRightColor'];
  borderBottomColor?: CSSProperties['borderBottomColor'];
  borderLeftColor?: CSSProperties['borderLeftColor'];
  borderColor?: CSSProperties['borderColor'];

  // Border Radius - Responsive
  borderRadius?: number;
};

// Icon

export interface ButtonIcon {
  // Color - Dark Mode
  color?: CSSProperties['color'];
  background?: CSSProperties['background'];

  /**
   * FONTSIZE
   * This property is RESPONSIVE
   * This property handles FONTSIZE, WIDTH, MIN-WIDTH and HEIGHT values
   */
  fontSize?: number;

  // TODO: extract this types to a generic file
  /**
   * PADDING
   * This property is RESPONSIVE
   * Use "padding" property ONLY to set the same value for all sides
   */
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;

  /**
   * MARGIN
   * This property is RESPONSIVE
   * Use "margin" property ONLY to set the same value for all sides
   */
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;

  /**
   * BORDER
   * This property has DARK MODE
   * To override an existing border use "borderColor: 'transparent'" to hide it
   */
  border?: 'none';
  borderWidth?: number;
  borderStyle?: 'solid';
  // TODO: create a type for colors
  borderColor?: string;

  // Border Radius - Responsive
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
}

// Text

export interface ButtonText {
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

export interface ButtonOptions {
  widthMin?: number;
  borderRadius?: BorderRadiusState;
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
  responsive?: ResponsiveOption;
}

export interface ResponsiveOption {
  smallScreenBP1?: Size; // 0-320px
  smallScreenBP2?: Size; // 321-375px
  smallScreenBP3?: Size; // 376-480px

  mediumScreenBP1?: Size; // 481-640px
  mediumScreenBP2?: Size; // 641-768px
  mediumScreenBP3?: Size; // 769-1024px

  bigScreenBP1?: Size; // 1025-1280px
  bigScreenBP2?: Size; // 1281-1440px
  bigScreenBP3?: Size; // 1441px
}

export type ContrastStyle = {
  [mediaQuery in 'defaultMode' | 'contrastMode']?: CSSProperties;
};

export type Breakpoint = keyof Exclude<ButtonOptions['responsive'], undefined>;

export type BorderRadiusState = 'None' | 'Full' | 'Rounded';

export type IconState = 'Alone' | 'Attached' | 'Detached';

export type PrefixState<
  Element extends string,
  State extends string
> = `${Element}${State}`;

// Property Status -------------------------------------------------------------

type PropertyBorderRadiusStatus = PrefixState<
  'borderRadius',
  BorderRadiusState
>;
type PropertyIconStatus = PrefixState<'icon', IconState>;

// Button Status ---------------------------------------------------------------

export type ButtonStatus =
  | InteractionStatus
  | PropertyBorderRadiusStatus
  | PropertyIconStatus;

// Element Status --------------------------------------------------------------

/**
 * Status used just in "base", not in "type/variant" schema
 * "borderRadiusNone" should be an empty object if borderRadius none is enabled
 */
type ButtonContainerStatus =
  | InteractionStatus
  | PrefixState<'borderRadius', BorderRadiusState>;

type ButtonIconStatus =
  | InteractionStatus
  | PrefixState<'icon', IconState>
  | PrefixState<'borderRadius', BorderRadiusState>;

/**
 * Text padding can change in "iconDetached" status
 */
type ButtonTextStatus =
  | InteractionStatus
  | PrefixState<'icon', Extract<IconState, 'Detached' | 'Attached'>>;

//------------------------------------------------------------------------------

interface ButtonElements {
  group?: ElementTheme<ButtonGroupElement, InteractionStatus>;
  container?: ElementTheme<ButtonContainer, ButtonContainerStatus>;
  iconLeft?: ElementTheme<ButtonIcon, ButtonIconStatus>;
  iconRight?: ElementTheme<ButtonIcon, ButtonIconStatus>;
  text?: ElementTheme<ButtonText, ButtonTextStatus>;
}

export interface ButtonSchema {
  options?: ButtonOptions;
  elements?: ButtonElements;
}

export interface RippleProps {
  top: string;
  left: string;
  width: string;
  height: string;
}
