/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,no-param-reassign */
import type { StyleBySize, Size } from '@kiskadee/react';
import type {
  StyleValueKey,
  FontValue,
  FontKey,
  FontFamily,
  ColorProp,
  NumberProp,
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
                  : `${fontPropertyValue.hex}${SEPARATOR}${fontPropertyValue.alpha}`;

              uniqueStyle = extracted(uniqueStyle, 'font-color', propertyValue);
            }

            if ((fontProperty as FontKey) === 'size') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as NumberProp;
              propertyValue =
                typeof fontPropertyValue === 'number'
                  ? `${fontPropertyValue}${SEPARATOR}${UNIT}`
                  : `${fontPropertyValue.value}${SEPARATOR}${fontPropertyValue.unit}`;

              uniqueStyle = extracted(uniqueStyle, 'font-size', propertyValue);
            }

            if ((fontProperty as FontKey) === 'height') {
              const fontPropertyValue = fontPropertyList[fontProperty as FontKey] as NumberProp;
              propertyValue =
                typeof fontPropertyValue === 'number'
                  ? `${fontPropertyValue}${SEPARATOR}${UNIT}`
                  : `${fontPropertyValue.value}${SEPARATOR}${fontPropertyValue.unit}`;

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

        if ((property as StyleValueKey) === 'border') {
          const borderPropertyList = propertyList[property as StyleValueKey];

          if (typeof borderPropertyList === 'object') {
            for (const borderProperty of Object.keys(borderPropertyList)) {
              if (borderProperty === 'width') {
                const borderPropertyValue = borderPropertyList[
                  borderProperty as StyleValueKey
                ] as NumberProp;
                propertyValue =
                  typeof borderPropertyValue === 'number'
                    ? `${borderPropertyValue}${SEPARATOR}${UNIT}`
                    : `${borderPropertyValue.value}${SEPARATOR}${borderPropertyValue.unit}`;

                uniqueStyle = extracted(uniqueStyle, 'border-width', propertyValue);
              }

              if (borderProperty === 'color') {
                const borderPropertyValue = borderPropertyList[
                  borderProperty as StyleValueKey
                ] as ColorProp;
                propertyValue =
                  typeof borderPropertyValue === 'string'
                    ? `${borderPropertyValue}${SEPARATOR}${OPACITY}`
                    : `${borderPropertyValue.hex}${SEPARATOR}${borderPropertyValue.alpha}`;

                uniqueStyle = extracted(uniqueStyle, 'border-color', propertyValue);
              }

              if (borderProperty === 'style') {
                const borderPropertyValue = borderPropertyList[borderProperty as StyleValueKey];

                uniqueStyle = extracted(uniqueStyle, 'border-style', borderPropertyValue);
              }
            }
          } else if (borderPropertyList === 'none') {
            uniqueStyle = extracted(uniqueStyle, 'border', 'none');
          }
        }
      }
    }
  }

  return uniqueStyle;
};
