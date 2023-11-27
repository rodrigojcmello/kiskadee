// default is px
type NumberValue = number;

type NumberProp =
  | NumberValue
  | {
      value: NumberValue;
      unit: 'px' | 'rem';
    };

// # + 6 digits
type HexColor = string;

type NoneValue = 'none';

type ColorProp =
  | HexColor
  | {
      hex: HexColor;
      // between 0 and 1
      alpha: number;
    };

// Shadow --------------------------------------------------------------------------------------------------------------

interface ShadowProp {
  color?: ColorProp;
  x?: NumberProp;
  y?: NumberProp;
  blur?: NumberProp;
  spread?: NumberProp;
  inset?: boolean;
}

interface ShadowValue {
  shadow?: 'none' | ShadowProp | ShadowProp[];
}

// Margin --------------------------------------------------------------------------------------------------------------

interface MarginValue {
  margin?:
    | NumberProp
    | {
        top?: NumberProp;
        right?: NumberProp;
        bottom?: NumberProp;
        left?: NumberProp;
      };
}

// Padding -------------------------------------------------------------------------------------------------------------

interface PaddingValue {
  padding?:
    | NumberProp
    | {
        top?: NumberProp;
        right?: NumberProp;
        bottom?: NumberProp;
        left?: NumberProp;
      };
}

// Position ------------------------------------------------------------------------------------------------------------

type PositionType = 'absolute' | 'relative' | 'fixed';

interface PositionValue {
  position?: {
    top?: NumberProp;
    right?: NumberProp;
    bottom?: NumberProp;
    left?: NumberProp;
    type?: PositionType;
  };
}

// Box -----------------------------------------------------------------------------------------------------------------

interface BoxValue {
  box?: {
    color?: ColorProp;
    height?: NumberProp;
    weight?: NumberProp;
  };
}

// Radius --------------------------------------------------------------------------------------------------------------

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

// Border --------------------------------------------------------------------------------------------------------------

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

// Outline -------------------------------------------------------------------------------------------------------------

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

// Font ----------------------------------------------------------------------------------------------------------------

type FontFamily = string | string[];
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = 'normal' | 'italic';

interface FontValue {
  font?: {
    family?: FontFamily;
    color?: ColorProp;
    size?: NumberProp;
    height?: NumberProp;
    weight?: FontWeight;
    style?: FontStyle;
  };
}

// ---------------------------------------------------------------------------------------------------------------------

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
