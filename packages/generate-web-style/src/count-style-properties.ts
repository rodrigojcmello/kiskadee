/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type { StyleBySize, Size } from '@kiskadee/react';
import type {
  StyleValueKey,
  FontValue,
  FontKey,
  ColorProp,
  NumberProp,
  FontWeight,
  FontStyle,
  BorderValue,
  RadiusValue,
  BoxValue,
  StyleValue,
  PositionValue,
  PaddingValue,
  MarginValue,
  ShadowValue,
  OutlineValue,
} from '@kiskadee/react/utils/property.type';
import type { UniqueStyle } from './types';

type Extracted = (uniqueStyle: UniqueStyle, property: string, value?: string) => UniqueStyle;

const extracted: Extracted = (uniqueStyle, property, propertyValue) => {
  let valueList = uniqueStyle[property];

  if (propertyValue) {
    if (valueList) {
      let total = valueList[propertyValue]?.total;
      total = total === undefined ? 1 : total + 1;

      const value = valueList[propertyValue] ?? {};
      value.total = total;

      valueList[propertyValue] = value;
    } else {
      valueList = {
        [propertyValue]: {
          total: 1,
        },
      };
    }

    uniqueStyle[property] = valueList;
  }

  return uniqueStyle;
};

const radiusMap = {
  topLeft: 'top-left',
  topRight: 'top-right',
  bottomLeft: 'bottom-left',
  bottomRight: 'bottom-right',
};

const SEPARATOR = '_';
const UNIT = 'px';
const OPACITY = '1';

function handleNumberProp(
  uniqueStyle: UniqueStyle,
  property: string,
  propertyValue: NumberProp,
): UniqueStyle {
  const value =
    typeof propertyValue === 'number'
      ? `${propertyValue}${SEPARATOR}${UNIT}`
      : `${propertyValue.value}${SEPARATOR}${propertyValue.unit}`;

  return extracted(uniqueStyle, property, value);
}

function handleColorProp(
  uniqueStyle: UniqueStyle,
  property: string,
  propertyValue: ColorProp,
): UniqueStyle {
  const value =
    typeof propertyValue === 'string'
      ? `${propertyValue}${SEPARATOR}${OPACITY}`
      : `${propertyValue.hex}${SEPARATOR}${propertyValue.alpha}`;

  return extracted(uniqueStyle, property, value);
}

// const propertyHandlers = {
//   color: (uniqueStyle: UniqueStyle, property: string, propertyValue: ColorProp): UniqueStyle => {
//     const value =
//       typeof propertyValue === 'string'
//         ? `${propertyValue}${SEPARATOR}${OPACITY}`
//         : `${propertyValue.hex}${SEPARATOR}${propertyValue.alpha}`;
//
//     return extracted(uniqueStyle, property, value);
//   },
//   number: (uniqueStyle: UniqueStyle, property: string, propertyValue: NumberProp): UniqueStyle => {
//     const value =
//       typeof propertyValue === 'number'
//         ? `${propertyValue}${SEPARATOR}${UNIT}`
//         : `${propertyValue.value}${SEPARATOR}${propertyValue.unit}`;
//
//     return extracted(uniqueStyle, property, value);
//   },
//   string: (uniqueStyle: UniqueStyle, property: string, propertyValue: string): UniqueStyle =>
//     extracted(uniqueStyle, property, propertyValue),
//   boolean: (uniqueStyle: UniqueStyle, property: string, propertyValue: boolean): UniqueStyle =>
//     extracted(uniqueStyle, property, propertyValue.toString()),
// };

const styleHandlers = {
  font: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    let propertyValue;
    const fontPropertyList = (propertyList as FontValue).font;

    if (fontPropertyList) {
      for (const fontProperty of Object.keys(fontPropertyList)) {
        if ((fontProperty as FontKey) === 'family') {
          const fontPropertyValue = fontPropertyList.family;
          propertyValue = Array.isArray(fontPropertyValue)
            ? fontPropertyValue.join(SEPARATOR)
            : fontPropertyValue;
          uniqueStyle = extracted(uniqueStyle, 'font-family', propertyValue);
        }

        if ((fontProperty as FontKey) === 'color') {
          const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as ColorProp;
          uniqueStyle = handleColorProp(uniqueStyle, 'font-color', fontPropertyValue);
        }

        if ((fontProperty as FontKey) === 'size' || (fontProperty as FontKey) === 'height') {
          const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as NumberProp;
          uniqueStyle = handleNumberProp(uniqueStyle, `font-${fontProperty}`, fontPropertyValue);
        }

        if ((fontProperty as FontKey) === 'weight') {
          const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as FontWeight;
          propertyValue = `${fontPropertyValue}`;

          uniqueStyle = extracted(uniqueStyle, 'font-weight', propertyValue);
        }

        if ((fontProperty as FontKey) === 'style') {
          const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as FontStyle;

          uniqueStyle = extracted(uniqueStyle, 'font-style', fontPropertyValue);
        }
      }
    }

    return uniqueStyle;
  },
  border: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const borderPropertyList = (propertyList as BorderValue).border;

    if (typeof borderPropertyList === 'object') {
      for (const borderProperty of Object.keys(borderPropertyList)) {
        if (borderProperty === 'width') {
          const borderPropertyValue = borderPropertyList[
            borderProperty as StyleValueKey
          ] as NumberProp;
          uniqueStyle = handleNumberProp(uniqueStyle, 'border-width', borderPropertyValue);
        }

        if (borderProperty === 'color') {
          const borderPropertyValue = borderPropertyList[
            borderProperty as StyleValueKey
          ] as ColorProp;
          uniqueStyle = handleColorProp(uniqueStyle, 'border-color', borderPropertyValue);
        }

        if (borderProperty === 'style') {
          const borderPropertyValue = borderPropertyList[borderProperty as StyleValueKey];

          uniqueStyle = extracted(uniqueStyle, 'border-style', borderPropertyValue);
        }
      }
    } else if (borderPropertyList === 'none') {
      uniqueStyle = extracted(uniqueStyle, 'border', 'none');
    }
    return uniqueStyle;
  },
  radius: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const radiusPropertyList = (propertyList as RadiusValue).radius;

    if (typeof radiusPropertyList === 'object') {
      for (const radiusProperty of Object.keys(radiusPropertyList)) {
        if (
          radiusProperty === 'topLeft' ||
          radiusProperty === 'topRight' ||
          radiusProperty === 'bottomLeft' ||
          radiusProperty === 'bottomRight'
        ) {
          const radiusPropertyValue = radiusPropertyList[
            radiusProperty as StyleValueKey
          ] as NumberProp;
          uniqueStyle = handleNumberProp(
            uniqueStyle,
            `radius-${radiusMap[radiusProperty]}`,
            radiusPropertyValue,
          );
        } else {
          const radiusPropertyValue = radiusPropertyList[
            radiusProperty as StyleValueKey
          ] as NumberProp;
          uniqueStyle = handleNumberProp(uniqueStyle, 'radius', radiusPropertyValue);
        }
      }
    }
    return uniqueStyle;
  },
  box: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const boxPropertyList = (propertyList as BoxValue).box;

    if (boxPropertyList) {
      for (const boxProperty of Object.keys(boxPropertyList)) {
        if (boxProperty === 'color') {
          const boxPropertyValue = boxPropertyList[boxProperty as StyleValueKey] as ColorProp;
          uniqueStyle = handleColorProp(uniqueStyle, 'box-color', boxPropertyValue);
        }

        if (boxProperty === 'height' || boxProperty === 'weight') {
          const boxPropertyValue = boxPropertyList[boxProperty as StyleValueKey] as NumberProp;
          uniqueStyle = handleNumberProp(uniqueStyle, `box-${boxProperty}`, boxPropertyValue);
        }
      }
    }

    return uniqueStyle;
  },
  position: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const positionPropertyList = (propertyList as PositionValue).position;

    if (positionPropertyList) {
      for (const positionProperty of Object.keys(positionPropertyList)) {
        if (positionProperty === 'type') {
          const positionPropertyValue = positionPropertyList[positionProperty as StyleValueKey];
          uniqueStyle = extracted(uniqueStyle, 'position-type', positionPropertyValue);
        } else {
          const positionPropertyValue = positionPropertyList[
            positionProperty as StyleValueKey
          ] as NumberProp;
          uniqueStyle = handleNumberProp(
            uniqueStyle,
            `position-${positionProperty}`,
            positionPropertyValue,
          );
        }
      }
    }
    return uniqueStyle;
  },
  padding: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const paddingPropertyList = (propertyList as PaddingValue).padding;

    if (paddingPropertyList) {
      for (const paddingProperty of Object.keys(paddingPropertyList)) {
        const paddingPropertyValue = paddingPropertyList[
          paddingProperty as StyleValueKey
        ] as NumberProp;
        uniqueStyle = handleNumberProp(
          uniqueStyle,
          `padding-${paddingProperty}`,
          paddingPropertyValue,
        );
      }
    }
    return uniqueStyle;
  },
  margin: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const marginPropertyList = (propertyList as MarginValue).margin;

    if (marginPropertyList) {
      for (const marginProperty of Object.keys(marginPropertyList)) {
        const marginPropertyValue = marginPropertyList[
          marginProperty as StyleValueKey
        ] as NumberProp;
        uniqueStyle = handleNumberProp(
          uniqueStyle,
          `margin-${marginProperty}`,
          marginPropertyValue,
        );
      }
    }
    return uniqueStyle;
  },
  shadow: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const shadowPropertyList = (propertyList as ShadowValue).shadow;

    if (shadowPropertyList) {
      if (shadowPropertyList === 'none') {
        uniqueStyle = extracted(uniqueStyle, 'shadow', 'none');
      } else {
        const x = [];
        for (const shadow of shadowPropertyList) {
          const shadowValues = Object.values(shadow).map((value) => {
            if (typeof value === 'object' && 'value' in value) {
              return `${value.value}${SEPARATOR}${value.unit}`;
            }
            if (typeof value === 'object' && 'hex' in value) {
              return `${value.hex}${SEPARATOR}${value.alpha}`;
            }
            return `${value}${SEPARATOR}${UNIT}`;
          });
          x.push(shadowValues.join(SEPARATOR));
        }
        uniqueStyle = extracted(uniqueStyle, 'shadow', x.toString());
      }
    }

    return uniqueStyle;
  },
  outline: (uniqueStyle: UniqueStyle, propertyList: StyleValue): UniqueStyle => {
    const outlinePropertyList = (propertyList as OutlineValue).outline;

    if (outlinePropertyList) {
      for (const outlineProperty of Object.keys(outlinePropertyList)) {
        if (outlineProperty === 'color') {
          const outlinePropertyValue = outlinePropertyList[
            outlineProperty as StyleValueKey
          ] as ColorProp;
          uniqueStyle = handleColorProp(uniqueStyle, 'outline-color', outlinePropertyValue);
        } else if (outlineProperty === 'style') {
          const outlinePropertyValue = outlinePropertyList[outlineProperty as StyleValueKey];
          uniqueStyle = extracted(uniqueStyle, 'outline-style', outlinePropertyValue);
        } else {
          const outlinePropertyValue = outlinePropertyList[
            outlineProperty as StyleValueKey
          ] as NumberProp;
          uniqueStyle = handleNumberProp(
            uniqueStyle,
            `outline-${outlineProperty}`,
            outlinePropertyValue,
          );
        }
      }
    }

    return uniqueStyle;
  },
};

export const countStyleProperties = (
  uniqueStyle: UniqueStyle,
  sizeList: StyleBySize = {},
): UniqueStyle => {
  for (const size of Object.keys(sizeList)) {
    const propertyList = sizeList[size as Size];

    if (propertyList) {
      for (const property of Object.keys(propertyList)) {
        const handler = styleHandlers[property as keyof typeof styleHandlers];
        uniqueStyle = handler(uniqueStyle, propertyList);
      }
    }
  }

  return uniqueStyle;
};
