interface NumberProp {
  value: number;
  unit: 'px' | 'rem';
}

interface ColorProp {
  // # + 6 digits
  hex: string;
  // between 0 and 1
  alpha: number;
}

interface ShadowValue {
  shadow?:
    | 'none'
    | {
        color?: ColorProp;
        x?: NumberProp;
        y?: NumberProp;
        blur?: NumberProp;
        spread?: NumberProp;
        inset?: boolean;
      };
}

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

interface PositionValue {
  position?: {
    top?: NumberProp;
    right?: NumberProp;
    bottom?: NumberProp;
    left?: NumberProp;
    type?: 'absolute' | 'relative' | 'fixed';
  };
}

interface BoxValue {
  box?: {
    color?: ColorProp;
    height?: NumberProp;
    weight?: NumberProp;
  };
}

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

interface BorderValue {
  border?:
    | 'none'
    | {
        width?: NumberProp;
        color?: ColorProp;
        style?: 'solid' | 'dotted' | 'dashed';
      };
}

interface OutlineValue {
  outline?:
    | 'none'
    | {
        width?: NumberProp;
        color?: ColorProp;
        style?: 'solid' | 'dotted';
      };
}

interface FontValue {
  font?: {
    family?: [string];
    color?: ColorProp;
    size?: NumberProp;
    height?: NumberProp;
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    style?: 'normal' | 'italic';
  };
}

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

const x: StyleValue = {
  box: {
    color: {
      hex: '#000000',
      alpha: 1,
    },
  },
  font: {
    color: {
      hex: '#000000',
      alpha: 0.5,
    },
    family: ['Arial'],
  },
};
