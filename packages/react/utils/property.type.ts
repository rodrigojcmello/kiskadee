// default is px
type NumberValue = number;

type NumberProp =
  | NumberValue
  | {
      value: NumberValue;
      unit: 'px' | 'rem';
    };

// # + 6 digits
type HexValue = string;

type NoneValue = 'none';

type ColorProp =
  | HexValue
  | {
      hex: HexValue;
      // between 0 and 1
      alpha: number;
    };

interface PositionProp {
  top?: NumberProp;
  right?: NumberProp;
  bottom?: NumberProp;
  left?: NumberProp;
}

// Shadow ------------------------------------------------------------------------------------------

interface ShadowProp {
  color?: ColorProp;
  x?: NumberProp;
  y?: NumberProp;
  blur?: NumberProp;
  spread?: NumberProp;
  inset?: boolean;
}

interface ShadowValue {
  shadow?: NoneValue | ShadowProp | ShadowProp[];
}

// Margin ------------------------------------------------------------------------------------------

interface MarginValue {
  margin?: NumberProp | PositionProp;
}

// Padding -----------------------------------------------------------------------------------------

interface PaddingValue {
  padding?: NumberProp | PositionProp;
}

// Position ----------------------------------------------------------------------------------------

type PositionType = 'absolute' | 'relative' | 'fixed';

// TODO: We do we need this? It maybe a immutable property
interface PositionValue {
  position?: PositionProp & {
    type?: PositionType;
  };
}

// Box ---------------------------------------------------------------------------------------------

interface BoxValue {
  box?: {
    // TODO: Add support to gradient
    color?: ColorProp;
    height?: NumberProp;
    weight?: NumberProp;
  };
}

// Radius ------------------------------------------------------------------------------------------

interface RadiusValue {
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

interface BorderValue {
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

interface OutlineValue {
  outline?:
    | NoneValue
    | {
        width?: NumberProp;
        color?: ColorProp;
        style?: OutlineStyle;
      };
}

// Font --------------------------------------------------------------------------------------------

export type FontFamily = string | string[];
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = 'normal' | 'italic';

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
  | OutlineValue
  | BorderValue
  | RadiusValue
  | BoxValue
  | PositionValue
  | PaddingValue
  | MarginValue
  | ShadowValue;
