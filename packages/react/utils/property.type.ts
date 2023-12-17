// default is px
type NumberValue = number;

export type NumberWithUnitValue = {
  value: NumberValue;
  unit: 'px' | 'rem';
};

export type NumberProp = NumberValue | NumberWithUnitValue;

// None

type NoneValue = 'none';

// Color

// # + 6 digits
export type HexValue = string;

export type ColorValue = {
  hex: HexValue;
  // between 0 and 1
  alpha: number;
};

export type ColorProp = HexValue | ColorValue;

// Position

interface PositionProp {
  top?: NumberProp;
  right?: NumberProp;
  bottom?: NumberProp;
  left?: NumberProp;
}

// Shadow ------------------------------------------------------------------------------------------

export interface ShadowProp {
  inset?: boolean;
  y?: NumberProp;
  x?: NumberProp;
  blur?: NumberProp;
  spread?: NumberProp;
  color?: ColorProp;
}

export interface ShadowValue {
  shadow?: NoneValue | ShadowProp[];
}

// Margin ------------------------------------------------------------------------------------------

export interface MarginValue {
  margin?: NumberProp | PositionProp;
}

// Padding -----------------------------------------------------------------------------------------

export interface PaddingValue {
  padding?: NumberProp | PositionProp;
}

// Position ----------------------------------------------------------------------------------------

type PositionType = 'absolute' | 'relative' | 'fixed';

// TODO: We do we need this? It maybe a immutable property
export interface PositionValue {
  position?: PositionProp & {
    type?: PositionType;
  };
}

// Box ---------------------------------------------------------------------------------------------

export interface BoxValue {
  box?: {
    // TODO: Add support to gradient
    color?: ColorProp;
    height?: NumberProp;
    weight?: NumberProp;
  };
}

// Radius ------------------------------------------------------------------------------------------

export interface RadiusValue {
  radius?:
    | NumberProp
    | {
        topRight?: NumberProp;
        topLeft?: NumberProp;
        bottomRight?: NumberProp;
        bottomLeft?: NumberProp;
      };
}

// Border ------------------------------------------------------------------------------------------

type BorderStyle = 'solid' | 'dotted' | 'dashed';

export interface BorderValue {
  border?:
    | NoneValue
    | {
        width?: NumberProp;
        color?: ColorProp;
        style?: BorderStyle;
      };
}

// Outline -----------------------------------------------------------------------------------------

// TODO: Why do we have outline? It's just for focus?

type OutlineStyle = 'solid' | 'dotted';

export interface OutlineValue {
  outline?:
    | NoneValue
    | {
        width?: NumberProp;
        color?: ColorProp;
        style?: OutlineStyle;
      };
}

// Font --------------------------------------------------------------------------------------------

export type FontFamily = string[];
export type FontWeight =
  | 'thing'
  | 'extra-light'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semi-bold'
  | 'bold'
  | 'extra-bold'
  | 'black';
export type FontStyle = 'normal' | 'italic';

export interface FontValue {
  // TODO: Can we have a global font setup? Because it probably will be the same for all components
  font?: {
    family?: FontFamily;
    color?: ColorProp;
    size?: NumberProp;
    height?: NumberProp;
    weight?: FontWeight;
    style?: FontStyle;
  };
}

export type FontKey = keyof FontValue['font'];

export // -------------------------------------------------------------------------------------------------

type StyleValueKey = keyof StyleValue;

export type StyleValue =
  | FontValue
  | BorderValue
  | RadiusValue
  | BoxValue
  | PositionValue
  | PaddingValue
  | MarginValue
  | ShadowValue
  | OutlineValue;
