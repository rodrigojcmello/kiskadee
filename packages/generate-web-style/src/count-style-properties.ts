/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type { StyleBySize, Size } from '@kiskadee/react';
import type {
  StyleValueKey,
  FontValue,
  FontKey,
  FontFamily,
  ColorProp,
  ColorValue,
  NumberProp,
  NumberWithUnitValue,
  FontWeight,
  FontStyle,
} from '@kiskadee/react/utils/property.type';
import type { UniqueStyle } from './types';

function extracted(uniqueStyle: UniqueStyle, property: string, propertyValue: string): UniqueStyle {
  let valueList = uniqueStyle[property];

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

  return uniqueStyle;
}

const SEPARATOR = '_';
const UNIT = 'px';
const OPACITY = '1';

export const countStyleProperties = (
  uniqueStyle: UniqueStyle,
  sizeList: StyleBySize = {},
): UniqueStyle => {
  for (const size of Object.keys(sizeList)) {
    const propertyList = sizeList[size as Size];

    if (propertyList) {
      for (const property of Object.keys(propertyList)) {
        let propertyValue: string;

        // Font ------------------------------------------------------------------------------------

        if ((property as StyleValueKey) === 'font') {
          const fontPropertyList: FontValue = propertyList[property as StyleValueKey];

          for (const fontProperty of Object.keys(fontPropertyList)) {
            if ((fontProperty as FontKey) === 'family') {
              const fontPropertyValue: FontFamily = fontPropertyList[fontProperty as FontKey];
              propertyValue = Array.isArray(fontPropertyValue)
                ? (fontPropertyValue as string[]).join(SEPARATOR)
                : fontPropertyValue;

              uniqueStyle = extracted(uniqueStyle, 'font-family', propertyValue);
            }

            if ((fontProperty as FontKey) === 'color') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as ColorProp;
              propertyValue =
                typeof fontPropertyValue === 'string'
                  ? `${fontPropertyValue}${SEPARATOR}${OPACITY}`
                  : `${(fontPropertyValue as ColorValue).hex}${SEPARATOR}${
                      (fontPropertyValue as ColorValue).alpha
                    }`;

              uniqueStyle = extracted(uniqueStyle, 'font-color', propertyValue);
            }

            if ((fontProperty as FontKey) === 'size') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as NumberProp;
              propertyValue =
                typeof fontPropertyValue === 'number'
                  ? `${fontPropertyValue}${SEPARATOR}${UNIT}`
                  : `${(fontPropertyValue as NumberWithUnitValue).value}${SEPARATOR}${
                      (fontPropertyValue as NumberWithUnitValue).unit
                    }`;

              uniqueStyle = extracted(uniqueStyle, 'font-size', propertyValue);
            }

            if ((fontProperty as FontKey) === 'height') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as NumberProp;
              propertyValue =
                typeof fontPropertyValue === 'number'
                  ? `${fontPropertyValue}${SEPARATOR}${UNIT}`
                  : `${(fontPropertyValue as NumberWithUnitValue).value}${SEPARATOR}${
                      (fontPropertyValue as NumberWithUnitValue).unit
                    }`;

              uniqueStyle = extracted(uniqueStyle, 'font-height', propertyValue);
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

        // Border ----------------------------------------------------------------------------------
      }
    }
  }

  return uniqueStyle;
};
